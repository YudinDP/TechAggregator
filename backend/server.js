//backend/server.js
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const os = require('os');
require('dotenv').config();
const MIN_VIEWS_FOR_ANALYTICS = 5;
const bcrypt = require('bcrypt');
const { promisify } = require('util');
const axios = require('axios'); 
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra'); //Используем puppeteer-extra
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const OpenAI = require('openai');
const Groq = require('groq-sdk');
const API_SYSTEMS_KEY = process.env.API_SYSTEMS_API_KEY;

function readEnvValue(...keys) {
  for (const key of keys) {
    const raw = process.env[key];
    if (raw == null) continue;
    const normalized = String(raw).trim().replace(/^['"]|['"]$/g, '');
    if (normalized) return normalized;
  }
  return null;
}

const PRICESAPI_KEY = readEnvValue('PRICESAPI_KEY', 'PRICES_API_KEY', 'PRICE_API_KEY');
const PRICESAPI_BASE = 'https://api.pricesapi.io/api/v1';
const EBAY_CLIENT_ID = readEnvValue('EBAY_CLIENT_ID', 'EBAY_APP_ID', 'EBAY_CLIENTID');
const EBAY_CLIENT_SECRET = readEnvValue('EBAY_CLIENT_SECRET', 'EBAY_CERT_ID', 'EBAY_CLIENTSECRET');
const EBAY_BASE = readEnvValue('EBAY_BASE') || 'https://api.ebay.com';
const EBAY_SANDBOX_BASE = 'https://api.sandbox.ebay.com';
let ebayTokenCache = { token: null, expiresAt: 0, base: null };
const PRICESAPI_DEFAULT_COUNTRY = (readEnvValue('PRICESAPI_COUNTRY', 'PRICES_API_COUNTRY') || 'us').toLowerCase();
const PRICESAPI_FALLBACK_COUNTRIES = String(readEnvValue('PRICESAPI_FALLBACK_COUNTRIES') || 'us,de,gb,fr,pl')
  .split(',')
  .map((c) => c.trim().toLowerCase())
  .filter(Boolean);
const EBAY_OAUTH_SCOPES = [
  'https://api.ebay.com/oauth/api_scope/buy.browse',
  'https://api.ebay.com/oauth/api_scope/buy.browse.readonly',
  'https://api.ebay.com/oauth/api_scope'
];

function isLikelySandboxEbayCredentials(clientId, clientSecret) {
  const id = String(clientId || '').toUpperCase();
  const secret = String(clientSecret || '').toUpperCase();
  return id.includes('-SBX-') || secret.startsWith('SBX-');
}
puppeteer.use(StealthPlugin()); //Применяем плагин

//Импортируем адаптер для Prisma 7+
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

//Создаём адаптер с подключением к БД
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
//const prisma = new PrismaClient();


const app = express();
const PORT = process.env.PORT || 3000;
const responseTimeSamples = [];
const MAX_RESPONSE_TIME_SAMPLES = 300;

const PRICE_SYNC_STATE_FILE = path.join(__dirname, 'data', 'price-sync-state.json');
const PRICE_SYNC_DELAY_MS = parseInt(process.env.PRICE_SYNC_DELAY_MS || '3500', 10);
const PRICE_SYNC_MAX_PREVIEW = parseInt(process.env.PRICE_SYNC_MAX_PER_PREVIEW || '120', 10);
const PRICE_SYNC_AUTO_MAX = parseInt(process.env.PRICE_SYNC_AUTO_MAX_STORES || '80', 10);
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const STORE_SIGNALS_FILE = path.join(__dirname, 'data', 'store-signals.json');
const USER_ALERTS_FILE = path.join(__dirname, 'data', 'user-alerts.json');

function readPriceSyncState() {
  try {
    return JSON.parse(fs.readFileSync(PRICE_SYNC_STATE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writePriceSyncState(patch) {
  const dir = path.dirname(PRICE_SYNC_STATE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const prev = readPriceSyncState();
  fs.writeFileSync(PRICE_SYNC_STATE_FILE, JSON.stringify({ ...prev, ...patch }, null, 2), 'utf8');
}

function readJsonFileSafe(filePath, fallback = {}) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJsonFileSafe(filePath, value) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
}

function readStoreSignals() {
  return readJsonFileSafe(STORE_SIGNALS_FILE, { items: [] });
}

function writeStoreSignals(data) {
  writeJsonFileSafe(STORE_SIGNALS_FILE, data || { items: [] });
}

function readUserAlerts() {
  return readJsonFileSafe(USER_ALERTS_FILE, { items: [] });
}

function writeUserAlerts(data) {
  writeJsonFileSafe(USER_ALERTS_FILE, data || { items: [] });
}

function pruneExpiredAlerts() {
  const now = Date.now();
  const state = readUserAlerts();
  const items = Array.isArray(state.items) ? state.items : [];
  const fresh = items.filter((i) => {
    if (!i || !i.expiresAt) return false;
    const exp = new Date(i.expiresAt).getTime();
    return Number.isFinite(exp) && exp > now;
  });
  if (fresh.length !== items.length) {
    writeUserAlerts({ items: fresh });
  }
  return fresh;
}

function addUserAlerts(alerts) {
  if (!Array.isArray(alerts) || !alerts.length) return;
  const existing = pruneExpiredAlerts();
  const byKey = new Map(existing.map((a) => [`${a.userId}:${a.productId}:${a.storeName}:${a.type}`, a]));
  for (const a of alerts) {
    const key = `${a.userId}:${a.productId}:${a.storeName}:${a.type}`;
    byKey.set(key, a);
  }
  writeUserAlerts({ items: Array.from(byKey.values()) });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isMissingTableError(error, modelName) {
  return error?.code === 'P2021' && error?.meta?.modelName === modelName;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, //Передаём API-ключ напрямую в конструктор
});
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const CATEGORY_TO_SPECS_MAP = {
  //=== СМАРТФОНЫ ===
  smartphones: {
    screen_size: ['диагональ экрана', 'диагональ', 'размер экрана', 'экран', 'дисплей', 'размер дисплея', 'inch', 'дюймы'],
    screen_resolution: ['разрешение экрана', 'разрешение дисплея', 'разрешение', 'pixel', 'пиксели', 'resolution'],
    screen_technology: ['тип матрицы экрана', 'тип матрицы', 'тип экрана', 'технология экрана', 'тип дисплея', 'панель', 'display type', 'matrix'],
    screen_refresh_rate: ['частота обновления экрана', 'частота обновления', 'герцовка', 'hz', 'refresh rate', 'Гц'],
    cpu_brand: ['бренд процессора', 'производитель процессора', 'vendor cpu', 'cpu manufacturer', 'процессор бренд'],
    cpu_model: ['процессор', 'модель процессора', 'чипсет', 'soc', 'cpu model', 'chip', 'чип'],
    cpu_cores: ['количество ядер', 'ядра', 'cores', 'число ядер', 'cpu cores'],
    ram_size: ['оперативная память', 'объём озу', 'оперативка', 'ram', 'memory', 'память ram', 'озу'],
    ram_type: ['тип оперативной памяти', 'тип ram', 'ram type', 'тип памяти', 'ddr'],
    storage_capacity: ['встроенная память', 'объём памяти', 'пзу', 'накопитель', 'storage', 'internal storage', 'память устройства'],
    storage_type: ['тип накопителя', 'тип памяти', 'storage type', 'ufs', 'emmc', 'тип хранилища'],
    rear_camera_count: ['количество задних камер', 'кол-во камер', 'число камер', 'камеры', 'main cameras', 'основные камеры'],
    rear_camera_primary_mp: ['разрешение основной камеры', 'основная камера', 'главная камера', 'primary camera', 'mp основной камеры', 'мегапиксели основной камеры'],
    rear_camera_sensor_model: ['модель сенсора камеры', 'модель матрицы', 'сенсор', 'sensor', 'camera sensor', 'матрица камеры'],
    rear_camera_sensor_size: ['размер сенсора камеры', 'размер матрицы', 'sensor size', 'размер сенсора', 'дюйм матрицы'],
    front_camera_mp: ['разрешение фронтальной камеры', 'фронтальная камера', 'селфи-камера', 'front camera', 'передняя камера', 'мегапиксели фронтальной камеры'],
    battery_capacity_mah: ['ёмкость аккумулятора', 'емкость аккумулятора', 'емкость батареи', 'батарея', 'аккумулятор', 'mah', 'battery', 'ёмкость'],
    battery_type: ['тип аккумулятора', 'тип батареи', 'battery type', 'li-ion', 'li-poly'],
    os: ['операционная система', 'ос', 'версия ос', 'оболочка', 'android', 'ios', 'операционка', 'system'],
    os_version: ['версия ос', 'версия операционной системы', 'os version', 'версия android', 'версия ios'],
    weight_g: ['вес', 'вес устройства', 'вес без упаковки', 'масса', 'weight', 'граммы'],
    dimensions_mm: ['размеры', 'габариты', 'высота x ширина x толщина', 'dimensions', 'размеры корпуса', 'д х ш х т'],
    sim_slots: ['количество sim-карт', 'sim', 'сим-карты', 'лоток sim', 'количество sim', 'sim cards', 'слоты sim'],
    connectivity: ['беспроводные интерфейсы', 'связь', 'интерфейсы', 'коммуникации', 'wireless', 'connectivity', 'подключение'],
    water_resistance: ['степень защиты', 'влагозащита', 'защита от воды', 'ip', 'waterproof', 'защита ip', 'класс защиты'],
    gpu_model: ['видеокарта', 'графический адаптер', 'gpu', 'graphics', 'графический процессор', 'видеочип'],
    charging_type: ['тип зарядки', 'зарядка', 'charging', 'type-c', 'micro-usb', 'разъём зарядки'],
    wireless_charging: ['беспроводная зарядка', 'wireless charging', 'qi', 'бесконтактная зарядка', 'wireless charge'],
    nfc_support: ['nfc', 'бесконтактная оплата', 'nfc support', 'поддержка nfc', 'оплата телефоном'],
    fingerprint_scanner: ['сканер отпечатка', 'дактилоскопический сканер', 'fingerprint', 'отпечаток пальца', 'биометрия'],
    face_unlock: ['разблокировка лицом', 'распознавание лица', 'face id', 'face unlock', 'face recognition'],
    network_support: ['поддержка сетей', 'сети', '5g', '4g', 'lte', 'network', 'поколение связи']
  },

  //=== НОУТБУКИ ===
  laptops: {
    screen_type: ['тип экрана', 'тип матрицы', 'display type', 'тип дисплея', 'панель', 'ips', 'oled', 'tn'],
    screen_aspect_ratio: ['соотношение сторон', 'aspect ratio', 'формат экрана', '16:9', '16:10', '3:2'],
    cpu_generation: ['поколение процессора', 'generation', 'поколение cpu', 'intel gen', 'amd gen'],
    cpu_base_freq: ['базовая частота', 'base frequency', 'частота процессора', 'cpu frequency', 'ghz'],
    cpu_boost_freq: ['турбо-частота', 'boost frequency', 'максимальная частота', 'turbo boost', 'max frequency'],
    cpu_threads: ['количество потоков', 'threads', 'число потоков', 'cpu threads', 'потоки'],
    gpu_memory_mb: ['память видеокарты', 'video memory', 'vram', 'память gpu', 'mb видеопамяти', 'gddr'],
    ssd_type: ['тип ssd', 'ssd type', 'nvme', 'sata ssd', 'm.2', 'формат ssd'],
    hdd_capacity_gb: ['объём hdd', 'hdd size', 'ёмкость жёсткого диска', 'hdd gb', 'гигабайты hdd'],
    hdd_rpm: ['обороты hdd', 'rpm', 'скорость вращения', 'hdd speed', '5400 rpm', '7200 rpm'],
    keyboard_backlight: ['подсветка клавиатуры', 'backlit keyboard', 'подсветка', 'keyboard lighting'],
    keyboard_layout: ['раскладка клавиатуры', 'keyboard layout', 'язык клавиатуры', 'ru/en', 'раскладка'],
    ports_usb_a: ['порты usb-a', 'usb-a ports', 'обычные usb', 'usb 3.0', 'usb 2.0', 'количество usb-a'],
    ports_usb_c: ['порты usb-c', 'usb-c ports', 'type-c', 'thunderbolt', 'количество usb-c'],
    ports_hdmi: ['порты hdmi', 'hdmi ports', 'hdmi выход', 'количество hdmi', 'hdmi разъём'],
    battery_life_hours: ['время автономной работы', 'автономность', 'battery life', 'часы работы', 'время работы'],
    webcam_mp: ['камера', 'веб-камера', 'webcam', 'мегапиксели камеры', 'встроенная камера'],
    audio_system: ['аудиосистема', 'звук', 'audio', 'динамики', 'speakers', 'аудио'],
    security_features: ['функции безопасности', 'безопасность', 'security', 'tpm', 'биометрия', 'защита'],
    tpm: ['tpm чип', 'tpm module', 'модуль tpm', 'безопасность tpm', 'trusted platform module'],
    touch_bar: ['touch bar', 'тач бар', 'сенсорная панель', 'oled touch bar']
  },

  //=== ПЛАНШЕТЫ ===
  tablets: {
    screen_surface: ['покрытие экрана', 'surface', 'стекло', 'gorilla glass', 'покрытие дисплея'],
    stylus_support: ['поддержка стилуса', 'stylus', 'pen support', 'apple pencil', 's pen', 'стилус'],
    stylus_included: ['стилус в комплекте', 'stylus included', 'комплектация стилусом', 'pen in box'],
    keyboard_support: ['поддержка клавиатуры', 'keyboard support', 'клавиатура', 'подключение клавиатуры'],
    keyboard_included: ['клавиатура в комплекте', 'keyboard included', 'клавиатура в коробке'],
    ram_form_factor: ['форм-фактор озу', 'ram type', 'тип памяти', 'lpddr', 'ddr'],
    storage_expandable: ['расширение памяти', 'expandable storage', 'слот карты памяти', 'microsd', 'расширяемая память'],
    storage_max_gb: ['макс. объём расширения', 'max storage', 'максимальная карта памяти', 'поддержка карт'],
    battery_charging_type: ['тип зарядки аккумулятора', 'charging type', 'разъём зарядки', 'type-c', 'зарядка'],
    battery_charging_speed: ['скорость зарядки', 'charging speed', 'fast charging', 'быстрая зарядка', 'ватты зарядки'],
    accessory_ports: ['порты для аксессуаров', 'аксессуарные порты', 'connector', 'разъёмы', 'дополнительные порты']
  },

  //=== ТЕЛЕВИЗОРЫ ===
  tv: {
    diagonal_in: ['диагональ', 'размер экрана', 'diagonal', 'inches', 'дюймы', 'размер tv', 'screen size'],
    screen_format: ['формат экрана', 'формат', 'aspect ratio', '16:9', '21:9', 'соотношение сторон'],
    hdr_support: ['поддержка hdr', 'hdr', 'hdr10', 'dolby vision', 'hdr support', 'высокий динамический диапазон'],
    smart_platform: ['платформа smart tv', 'smart tv', 'операционная система', 'tizen', 'webos', 'android tv', 'smart platform'],
    sound_power_w: ['мощность звука', 'мощность динамиков', 'sound power', 'watt', 'ватты звука', 'audio power'],
    sound_channels: ['количество каналов', 'sound channels', 'аудиоканалы', '2.0', '5.1', 'звук'],
    mount_type: ['тип крепления', 'крепление', 'mount', 'vesa', 'настенное крепление', 'подставка'],
    wall_mount_kit: ['комплект крепления', 'wall mount', 'крепление в комплекте', 'mounting bracket'],
    power_consumption_w: ['потребление энергии', 'power consumption', 'энергопотребление', 'ватты', 'мощность'],
    power_standby_w: ['режим ожидания', 'standby power', 'потребление в режиме ожидания', 'standby'],
    refresh_rate: ['частота обновления', 'refresh rate', 'герцовка', 'hz', '120hz', '60hz']
  },

  //=== НАУШНИКИ ===
  headphones: {
    driver_size_mm: ['размер драйвера', 'driver size', 'диаметр динамика', 'мм драйвер', 'размер динамика', 'driver'],
    driver_type: ['тип драйвера', 'driver type', 'тип динамика', 'dynamic', 'planar', 'electrostatic'],
    impedance_ohms: ['сопротивление', 'impedance', 'омы', 'ohms', 'импеданс', 'электрическое сопротивление'],
    frequency_response_hz: ['частотный диапазон', 'frequency response', 'частоты', 'hz диапазон', 'ачх', 'frequency range'],
    sensitivity_db: ['чувствительность', 'sensitivity', 'дб', 'db', 'громкость', 'sensitivity db'],
    microphone_frequency_response: ['частотный диапазон микрофона', 'микрофон частоты', 'mic frequency', 'диапазон микрофона'],
    microphone_noise_reduction: ['шумоподавление микрофона', 'mic noise reduction', 'подавление шума микрофона', 'anc mic'],
    wireless_standard: ['стандарт беспроводной связи', 'bluetooth version', 'bluetooth', 'wireless', 'версия bluetooth', '5.0', '5.2'],
    wireless_range_m: ['дальность беспроводной связи', 'wireless range', 'радиус действия', 'range', 'метров', 'bluetooth range'],
    charging_port: ['порт зарядки', 'charging port', 'разъём зарядки', 'type-c', 'micro-usb', 'зарядка'],
    charging_time_h: ['время зарядки', 'charging time', 'часы зарядки', 'время полной зарядки'],
    anc_type: ['тип шумоподавления', 'anc type', 'noise cancellation', 'тип anc', 'active noise cancelling'],
    anc_level: ['уровень шумоподавления', 'anc level', 'степень шумоподавления', 'noise cancellation level'],
    controls_type: ['тип управления', 'controls', 'управление', 'кнопки', 'touch', 'тип контроля'],
    controls_touch: ['сенсорное управление', 'touch controls', 'тач управление', 'сенсор', 'touch'],
    controls_voice: ['управление голосом', 'voice control', 'голосовой помощник', 'voice assistant', 'siri', 'alexa'],
    foldable: ['складывается', 'foldable', 'складная конструкция', 'folding', 'компактность'],
    ear_pad_type: ['тип амбушюр', 'ear pads', 'амбушюры', 'подушки', 'ear cushions', 'тип наушников'],
    ear_pad_material: ['материал амбушюр', 'ear pad material', 'материал подушек', 'кожа', 'ткань', 'material'],
    ear_pad_replaceable: ['сменные амбушюры', 'replaceable ear pads', 'сменные подушки', 'replaceable'],
    carry_case_included: ['чехол в комплекте', 'carry case', 'кейс в комплекте', 'case included', 'сумка'],
    cable_length_m: ['длина кабеля', 'cable length', 'метров кабеля', 'длина провода', 'cable'],
    cable_connector: ['тип разъёма кабеля', 'connector', 'jack 3.5mm', 'разъём', 'connector type'],
    noise_cancel: ['шумоподавление', 'noise cancellation', 'anc', 'подавление шума', 'active noise cancelling'],
    type: ['тип наушников', 'наушники тип', 'form factor', 'внутриканальные', 'накладные', 'полноразмерные']
  },

  //=== КАМЕРЫ ===
  cameras: {
    sensor_model: ['модель матрицы', 'sensor model', 'матрица', 'sensor', 'модель сенсора', 'cmos', 'ccd'],
    sensor_size: ['размер матрицы', 'sensor size', 'размер сенсора', 'full frame', 'aps-c', 'micro 4/3'],
    sensor_resolution_mp: ['разрешение матрицы', 'sensor resolution', 'мегапиксели', 'mp', 'разрешение сенсора'],
    lens_mount: ['байонет объектива', 'lens mount', 'крепление объектива', 'mount', 'байонет'],
    lens_aperture: ['максимальная апертура', 'aperture', 'диафрагма', 'f/', 'светосила', 'lens aperture'],
    lens_zoom: ['оптический зум', 'optical zoom', 'зум', 'zoom', 'кратность зума', 'увеличение'],
    image_stabilization: ['стабилизация изображения', 'stabilization', 'ibis', 'стабилизатор', 'ois', 'стаб'],
    video_resolution: ['разрешение видео', 'video resolution', '4k', '1080p', '8k', 'качество видео'],
    video_fps: ['частота кадров видео', 'video fps', 'кадры в секунду', 'fps', 'frame rate', '60fps', '120fps'],
    iso_range: ['диапазон iso', 'iso', 'iso range', 'светочувствительность', 'iso sensitivity'],
    shutter_speed: ['скорость срабатывания затвора', 'shutter speed', 'выдержка', 'shutter', 'затвор'],
    viewfinder_type: ['тип видоискателя', 'viewfinder', 'evf', 'оптический видоискатель', 'электронный видоискатель'],
    viewfinder_magnification: ['увеличение видоискателя', 'viewfinder magnification', 'видоискатель увеличение', 'magnification'],
    lcd_type: ['тип жк-дисплея', 'lcd type', 'экран', 'дисплей', 'lcd', 'tilt screen', 'touch lcd'],
    lcd_size_in: ['размер жк-дисплея', 'lcd size', 'размер экрана', 'дюймы экрана', 'display size'],
    lcd_touch: ['сенсорный дисплей', 'touch screen', 'touch lcd', 'тачскрин', 'сенсорный экран'],
    lcd_articulating: ['поворотный дисплей', 'articulating screen', 'flip screen', 'поворотный экран', 'vari-angle'],
    battery_life_shots: ['время работы (снимки)', 'battery life', 'количество снимков', 'shots', 'автономность'],
    battery_model: ['модель аккумулятора', 'battery model', 'аккумулятор', 'battery', 'тип батареи'],
    flash_type: ['тип вспышки', 'flash type', 'вспышка', 'built-in flash', 'встроенная вспышка'],
    flash_sync_speed: ['скорость синхронизации вспышки', 'flash sync', 'синхронизация', 'sync speed'],
    ports: ['порты', 'ports', 'разъёмы', 'hdmi', 'usb', 'microphone jack', 'интерфейсы'],
    fingerprint_reader: ['сканер отпечатка', 'fingerprint', 'отпечаток', 'биометрия']
  },

  //=== СМАРТ-ЧАСЫ ===
  smartwatches: {
    watch_band_material: ['материал ремешка', 'band material', 'ремешок', 'strap material', 'материал браслета'],
    watch_band_width_mm: ['ширина ремешка', 'band width', 'ширина браслета', 'mm ремешка', 'strap width'],
    watch_band_replacement: ['сменный ремешок', 'replaceable band', 'сменный браслет', 'interchangeable strap'],
    health_monitoring: ['функции мониторинга здоровья', 'health tracking', 'мониторинг здоровья', 'health sensors'],
    sports_modes_count: ['количество спортивных режимов', 'sports modes', 'спортивные режимы', 'workout modes'],
    gps_type: ['тип gps', 'gps', 'глонасс', 'galileo', 'навигация', 'gps support'],
    lte_support: ['поддержка lte', 'lte', '4g', 'сотовая связь', 'cellular', 'интернет часы'],
    sleep_tracking: ['отслеживание сна', 'sleep tracking', 'мониторинг сна', 'анализ сна'],
    stress_monitoring: ['мониторинг стресса', 'stress tracking', 'отслеживание стресса', 'stress level'],
    spo2_monitoring: ['мониторинг spo2', 'spo2', 'кислород в крови', 'oxygen saturation', 'сатурация'],
    ecg_support: ['поддержка экг', 'ecg', 'экг', 'электрокардиограмма', 'ecg sensor'],
    water_resistance_rating: ['класс водонепроницаемости', 'water resistance', 'атм', 'atm', 'водозащита', 'ip rating'],
    watch_face_customizable: ['настройка циферблата', 'customizable watch face', 'сменные циферблаты', 'watch faces']
  },

  //=== ЭЛЕКТРОННЫЕ КНИГИ ===
  ebooks: {
    screen_surface_type: ['тип поверхности экрана', 'surface type', 'покрытие экрана', 'glare-free', 'антиблик'],
    screen_frontlight: ['подсветка экрана', 'frontlight', 'подсветка', 'backlight', 'освещение экрана'],
    screen_frontlight_color: ['цвет подсветки', 'color frontlight', 'теплая подсветка', 'adjustable light', 'цветовая температура'],
    screen_page_turn_buttons: ['кнопки перелистывания', 'page turn buttons', 'кнопки страниц', 'physical buttons'],
    storage_available_gb: ['доступная память', 'available storage', 'свободная память', 'gb памяти'],
    file_formats_supported: ['поддерживаемые форматы файлов', 'formats', 'форматы', 'epub', 'pdf', 'fb2', 'mobi'],
    dictionary_included: ['словарь в комплекте', 'dictionary', 'встроенный словарь', 'built-in dictionary'],
    bookstore_integration: ['интеграция с книжными магазинами', 'bookstore', 'магазин книг', 'amazon', 'google books'],
    battery_standby_days: ['время в режиме ожидания', 'standby days', 'автономность', 'days battery', 'дни работы'],
    charging_method: ['метод зарядки', 'charging', 'зарядка', 'usb-c', 'wireless charging'],
    accessories_included: ['аксессуары в комплекте', 'accessories', 'комплектация', 'case', 'cover']
  },

  //=== ДРОНЫ ===
  drones: {
    motor_type: ['тип двигателя', 'motor', 'двигатель', 'brushless', 'brushed', 'моторы'],
    propeller_guard: ['защита пропеллеров', 'propeller guard', 'защита винтов', 'prop guards', 'кольца защиты'],
    camera_specs: ['характеристики камеры', 'camera', 'камера дрона', 'camera quality', 'specs камеры'],
    camera_gimbal: ['подвес камеры', 'gimbal', 'стабилизатор камеры', '3-axis gimbal', 'подвес'],
    camera_recording_mode: ['режим записи камеры', 'recording mode', 'видео режимы', 'recording', 'форматы записи'],
    flight_modes: ['режимы полёта', 'flight modes', 'режимы', 'smart modes', 'интеллектуальные режимы'],
    obstacle_avoidance: ['избегание препятствий', 'obstacle avoidance', 'сенсоры препятствий', 'sensors', 'датчики'],
    return_to_home: ['возврат домой', 'return to home', 'rth', 'авто возврат', 'автоматическое возвращение'],
    follow_me_mode: ['режим "следуй за мной"', 'follow me', 'active track', 'слежение', 'tracking mode'],
    orbit_mode: ['режим "орбита"', 'orbit', 'point of interest', 'poi', 'круговая съёмка'],
    flight_time: ['время полёта', 'flight time', 'минуты полёта', 'battery time', 'автономность полёта'],
    range: ['дальность', 'range', 'дальность полёта', 'transmission range', 'максимальная дальность'],
    remote_control_range: ['дальность пульта управления', 'controller range', 'радиус пульта', 'remote range'],
    remote_control_battery_life: ['время работы пульта', 'controller battery', 'батарея пульта', 'remote battery'],
    transmission_latency_ms: ['задержка передачи сигнала', 'latency', 'задержка', 'transmission delay', 'ms задержка'],
    wind_resistance_level: ['уровень сопротивления ветру', 'wind resistance', 'ветроустойчивость', 'wind level'],
    indoor_outdoor_use: ['использование в помещении/на улице', 'indoor outdoor', 'место использования', 'environment']
  },

  //=== ИГРОВЫЕ КОНСОЛИ ===
  consoles: {
    console_type: ['тип консоли', 'console type', 'платформа', 'gaming console', 'игровая система'],
    storage_capacity_gb: ['объём памяти', 'storage', 'встроенная память', 'gb', 'ssd capacity', 'накопитель'],
    storage_expandable: ['расширение памяти', 'expandable storage', 'слот карты памяти', 'microsd support'],
    gpu_performance: ['производительность gpu', 'gpu power', 'графическая мощность', 'teraflops', 'gpu tflops'],
    ray_tracing: ['трассировка лучей', 'ray tracing', 'rtx', 'аппаратный rt', 'ray tracing support'],
    max_resolution: ['максимальное разрешение', 'max resolution', '4k', '8k', 'output resolution'],
    max_fps: ['максимальный fps', 'max frame rate', 'кадры в секунду', '120fps', '60fps'],
    backward_compatibility: ['обратная совместимость', 'backward compat', 'совместимость', 'old games support'],
    optical_drive: ['оптический привод', 'disc drive', 'blu-ray', 'dvd', 'привод дисков'],
    controller_battery: ['батарея контроллера', 'controller battery', 'время работы геймпада', 'battery life controller'],
    online_service: ['онлайн сервис', 'online service', 'подписка', 'xbox live', 'ps plus', 'nintendo online']
  },

  //=== МОНИТОРЫ ===
  monitors: {
    panel_type: ['тип панели', 'panel type', 'ips', 'va', 'tn', 'oled', 'тип матрицы'],
    response_time_ms: ['время отклика', 'response time', 'ms', '1ms', '5ms', 'быстродействие'],
    color_gamut: ['цветовой охват', 'color gamut', 'srgb', 'adobe rgb', 'dcip3', 'цвета'],
    brightness_nits: ['яркость', 'brightness', 'ниты', 'nits', 'cd/m2', 'яркость экрана'],
    contrast_ratio: ['контрастность', 'contrast', 'contrast ratio', '1000:1', 'статическая контрастность'],
    adaptive_sync: ['адаптивная синхронизация', 'adaptive sync', 'g-sync', 'freesync', 'variable refresh rate'],
    curvature: ['кривизна', 'curved', 'curvature', '1800r', '1500r', 'изогнутый'],
    stand_adjustment: ['регулировка подставки', 'stand', 'height adjustment', 'tilt', 'поворот', 'регулировки'],
    vesa_mount: ['крепление vesa', 'vesa', 'vesa mount', 'настенное крепление', '100x100']
  },

  //=== ВНЕШНИЕ НАКОПИТЕЛИ ===
  external_drives: {
    drive_type: ['тип накопителя', 'drive type', 'hdd', 'ssd', 'external drive', 'внешний диск'],
    interface: ['интерфейс', 'interface', 'usb 3.0', 'usb-c', 'thunderbolt', 'sata', 'подключение'],
    transfer_speed: ['скорость передачи', 'transfer speed', 'read speed', 'write speed', 'скорость чтения/записи'],
    encryption: ['шифрование', 'encryption', 'hardware encryption', 'password protection', 'защита данных'],
    compatibility: ['совместимость', 'compatibility', 'windows', 'mac', 'linux', 'поддержка ос'],
    power_source: ['источник питания', 'power', 'usb powered', 'external power', 'питание'],
    durability: ['прочность', 'durability', 'shock resistant', 'waterproof', 'ударопрочность']
  },

  //=== ВИДЕОКАРТЫ ===
  graphics_cards: {
    vram_size: ['объём видеопамяти', 'vram', 'video memory', 'gb vram', 'память видеокарты', 'gddr6'],
    vram_type: ['тип видеопамяти', 'vram type', 'gddr6', 'gddr6x', 'hbm', 'тип памяти gpu'],
    tdp: ['tdp', 'тепловыделение', 'power consumption', 'ватты', 'энергопотребление', 'tdp watt'],
    cooling_type: ['тип охлаждения', 'cooling', 'кулер', 'fans', 'жидкостное охлаждение', 'air cooling'],
    display_outputs: ['видеовыходы', 'outputs', 'hdmi', 'displayport', 'разъёмы', 'ports'],
    max_displays: ['максимум дисплеев', 'max displays', 'количество мониторов', 'поддержка мониторов'],
    directx_support: ['поддержка directx', 'directx', 'dx12', 'api support', 'версия directx'],
    vulkan_support: ['поддержка vulkan', 'vulkan', 'vulkan api', 'api support']
  },

  //=== ПРОЦЕССОРЫ ===
  cpus: {
    socket: ['сокет', 'socket', 'am4', 'am5', 'lga1700', 'разъём', 'socket type'],
    tdp_watt: ['tdp', 'тепловыделение', 'tdp watt', 'ватты', 'power', 'энергопотребление'],
    cache_size: ['размер кэша', 'cache', 'l3 cache', 'кэш', 'mb cache', 'кэш память'],
    integrated_graphics: ['встроенная графика', 'integrated graphics', 'igpu', 'встроенное видео', 'graphics'],
    overclocking: ['разгон', 'overclocking', 'unlocked', 'разблокированный', 'oc support'],
    memory_support: ['поддержка памяти', 'memory support', 'ddr4', 'ddr5', 'ram support', 'тип памяти'],
    pcie_version: ['версия pcie', 'pcie', 'pcie 4.0', 'pcie 5.0', 'lanes', 'линии pcie']
  },

  //=== МАТЕРИНСКИЕ ПЛАТЫ ===
  motherboards: {
    chipset: ['чипсет', 'chipset', 'z790', 'b650', 'x670', 'chipset model'],
    form_factor: ['форм-фактор', 'form factor', 'atx', 'micro-atx', 'mini-itx', 'размер платы'],
    ram_slots: ['слоты оперативной памяти', 'ram slots', 'количество слотов', 'memory slots', 'ddr slots'],
    max_ram: ['максимум ram', 'max memory', 'максимальная память', 'max ram gb', 'поддержка памяти'],
    expansion_slots: ['слоты расширения', 'expansion slots', 'pcie slots', 'слоты', 'pci slots'],
    sata_ports: ['sata порты', 'sata ports', 'количество sata', 'sata разъёмы', 'sata 6gb/s'],
    m2_slots: ['m.2 слоты', 'm2 slots', 'nvme slots', 'количество m.2', 'ssd slots'],
    rear_usb_ports: ['usb порты сзади', 'rear usb', 'usb на панели', 'back panel usb', 'порты'],
    audio_codec: ['аудио кодек', 'audio codec', 'звуковой кодек', 'audio chip', 'звуковая карта'],
    network_controller: ['сетевой контроллер', 'network', 'ethernet', 'lan', 'сетевая карта', '2.5g lan'],
    wifi_support: ['поддержка wifi', 'wifi', 'wireless', 'wi-fi 6', 'bluetooth', 'беспроводная связь']
  },

  //=== ОПЕРАТИВНАЯ ПАМЯТЬ ===
  ram: {
    ram_speed: ['скорость ram', 'ram speed', 'mhz', 'частота', 'ddr speed', 'mt/s'],
    ram_latency: ['тайминги', 'latency', 'cas latency', 'cl', 'timings', 'задержки'],
    ram_voltage: ['напряжение', 'voltage', 'volts', 'v', 'питание ram', 'ram voltage'],
    ram_profile: ['профиль', 'xmp', 'expo', 'overclocking profile', 'разгонный профиль'],
    heat_spreader: ['радиатор', 'heat spreader', 'охлаждение', 'heatsink', 'теплораспределитель'],
    ecc_support: ['поддержка ecc', 'ecc', 'error correction', 'коррекция ошибок', 'server memory']
  },

  //=== POWER BANKS ===
  power_banks: {
    capacity_mah: ['ёмкость', 'capacity', 'mah', 'ёмкость батареи', 'power bank capacity'],
    output_ports: ['выходные порты', 'output ports', 'usb порты', 'количество выходов', 'ports'],
    output_power: ['мощность вывода', 'output power', 'ватты', 'watt', 'fast charging', 'pd'],
    input_charging: ['входная зарядка', 'input charging', 'зарядка power bank', 'input watt', 'скорость зарядки'],
    pass_through: ['сквозная зарядка', 'pass-through', 'pass through charging', 'одновременная зарядка'],
    wireless_output: ['беспроводная зарядка', 'wireless output', 'qi charging', 'бесконтактная'],
    display: ['дисплей', 'display', 'индикатор', 'led display', 'экран заряда'],
    size_weight: ['размер и вес', 'dimensions', 'weight', 'портативность', 'compact']
  },

  //=== УМНЫЙ ДОМ ===
  smart_home: {
    connectivity_protocol: ['протокол связи', 'protocol', 'zigbee', 'z-wave', 'wifi', 'bluetooth', 'thread'],
    voice_assistant: ['голосовой помощник', 'voice assistant', 'alexa', 'google assistant', 'siri', 'голосовое управление'],
    automation_support: ['поддержка автоматизации', 'automation', 'сценарии', 'routines', 'умные сценарии'],
    energy_monitoring: ['мониторинг энергии', 'energy monitoring', 'потребление', 'power monitoring', 'учёт энергии'],
    local_control: ['локальное управление', 'local control', 'без интернета', 'offline control', 'автономная работа'],
    hub_required: ['требуется хаб', 'hub required', 'шлюз', 'gateway', 'центр управления']
  },

  //=== ФИТНЕС-ТРЕКЕРЫ ===
  fitness_trackers: {
    activity_tracking: ['отслеживание активности', 'activity tracking', 'шаги', 'калории', 'distance', 'дистанция'],
    heart_rate_monitoring: ['мониторинг пульса', 'heart rate', 'пульс', 'hr monitor', 'датчик пульса'],
    calorie_tracking: ['подсчёт калорий', 'calories', 'калории', 'calorie counter', 'расход калорий'],
    distance_tracking: ['отслеживание дистанции', 'distance', 'километры', 'miles', 'пробег'],
    workout_detection: ['авто определение тренировок', 'auto workout', 'автоматические тренировки', 'workout detect'],
    female_health: ['женское здоровье', 'female health', 'менструальный цикл', 'period tracking', 'цикл']
  },

  //=== ПОРТАТИВНЫЕ КОЛОНКИ ===
  portable_speakers: {
    speaker_output: ['мощность динамика', 'speaker power', 'watt', 'ватты', 'output', 'громкость'],
    bass_response: ['басы', 'bass', 'низкие частоты', 'bass boost', 'глубокий бас'],
    stereo_pairing: ['стерео пара', 'stereo pairing', 'две колонки', 'stereo mode', 'парное подключение'],
    waterproof_rating: ['класс водонепроницаемости', 'waterproof', 'ip rating', 'ipx7', 'влагозащита'],
    battery_capacity: ['ёмкость батареи', 'battery', 'mah', 'время работы', 'playback time'],
    aux_input: ['вход aux', 'aux input', '3.5mm jack', 'проводное подключение', 'line in']
  },

  //=== ВЕБ-КАМЕРЫ ===
  webcams: {
    video_quality: ['качество видео', 'video quality', '1080p', '4k', 'разрешение', 'resolution'],
    frame_rate: ['частота кадров', 'frame rate', 'fps', '30fps', '60fps', 'кадры'],
    autofocus: ['автофокус', 'autofocus', 'af', 'автоматическая фокусировка', 'auto focus'],
    field_of_view: ['угол обзора', 'fov', 'field of view', 'ширина обзора', 'degrees', 'градусы'],
    built_in_microphone: ['встроенный микрофон', 'microphone', 'mic', 'встроенный звук', 'audio'],
    privacy_shutter: ['шторка конфиденциальности', 'privacy shutter', 'защита приватности', 'cover', 'шторка'],
    mounting_type: ['тип крепления', 'mount', 'крепление', 'clip', 'tripod', 'штатив']
  },

  //=== МИКРОФОНЫ ===
  microphones: {
    microphone_type: ['тип микрофона', 'mic type', 'condenser', 'dynamic', 'usb mic', 'xlr'],
    polar_pattern: ['диаграмма направленности', 'polar pattern', 'cardioid', 'omnidirectional', 'направленность'],
    frequency_response: ['частотный диапазон', 'frequency response', 'hz range', 'ачх', 'частоты'],
    sample_rate: ['частота дискретизации', 'sample rate', 'khz', '48khz', '96khz', 'битрейт'],
    bit_depth: ['разрядность', 'bit depth', 'bit', '16-bit', '24-bit', 'глубина'],
    gain_control: ['регулировка усиления', 'gain control', 'gain', 'усиление', 'volume control'],
    mute_button: ['кнопка mute', 'mute', 'кнопка отключения', 'mute switch', 'выключение микрофона'],
    headphone_jack: ['выход на наушники', 'headphone jack', 'мониторинг', 'headphone output', '3.5mm']
  }
};

//Функция нормализации характеристик
function normalizeProductSpecs(rawSpecs, category) {
    if (!rawSpecs || typeof rawSpecs !== 'object') return {};
    
    //Получаем карту синонимов для выбранной категории
    const categoryMap = SPEC_SYNONYMS_MAP[category];
    
    //Если для категории нет шаблона, возвращаем как есть (или можно вернуть пустой объект)
    if (!categoryMap) return rawSpecs; 
    
    const normalizedSpecs = {};
    const rawEntries = Object.entries(rawSpecs);
    
    for (const [standardKey, synonyms] of Object.entries(categoryMap)) {
        //Ищем совпадение в полученных данных по массиву синонимов
        const found = rawEntries.find(([rawKey]) => {
            const normalizedRawKey = rawKey.toLowerCase().trim();
            return synonyms.some(syn => normalizedRawKey.includes(syn.toLowerCase()));
        });
        
        if (found) {
            let [, rawValue] = found;
            //Очищаем значение от HTML тегов и лишних пробелов
            normalizedSpecs[standardKey] = String(rawValue).replace(/<[^>]+>/g, '').trim();
        }
    }
    return normalizedSpecs;
}

app.use(cors({
  origin: [
    'http://localhost:5500',      // Live Server (основной)
    'http://127.0.0.1:5500',      // Live Server (альтернатива)
    'http://localhost:3000',      // Если фронт тоже на 3000
    'http://192.168.1.100:5500',  // Локальная сеть (замените на ваш IP)
    'https://tech-nozone.ru',     // Продакшн (на всякий случай)
    'http://tech-nozone.ru'
  ],
  credentials: true  // Разрешает отправку cookies/токенов
}));
app.use(express.json());
app.use((req, res, next) => {
  const startTime = process.hrtime.bigint();
  res.on('finish', () => {
    const elapsedMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;
    if (Number.isFinite(elapsedMs)) {
      responseTimeSamples.push(elapsedMs);
      if (responseTimeSamples.length > MAX_RESPONSE_TIME_SAMPLES) {
        responseTimeSamples.shift();
      }
    }
  });
  next();
});


app.post('/api/auth/register', async (req, res) => {
  const { email, password, fullName } = req.body;
  try {
    const hashedPassword = await require('bcrypt').hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        fullName: fullName || null
      },
      select: { id: true, email: true, fullName: true, role: true }
    });
    res.status(201).json({ message: 'Пользователь создан', user });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }
    console.error(error);
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    //Найти пользователя по email
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    //Проверить, существует ли пользователь
    if (!user) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    //Сравнить введённый пароль с хэшем из БД
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }
    //В payload обязательно включаем id, email и role
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,

        role: user.role 
      },
      process.env.JWT_SECRET, 
      { expiresIn: '7d' } //Токен действителен 7 дней
    );



    //Отправляем токен и основную информацию о пользователе
    res.json({
      token: token, 
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName, 
        role: user.role 
      }
    });
    

  } catch (error) {
    console.error('Ошибка входа:', error); //Логируем ошибку на сервере
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
});


app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        specs: true,
        prices: true
      }
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Не удалось загрузить товары' });
  }
});

//=== HEALTH CHECK ===
app.get('/api/test', (req, res) => {
  res.json({ message: ' Backend + Prisma + PostgreSQL работают!' });
});

//Запуск сервера
app.listen(PORT, () => {
  console.log(` Сервер запущен на http://localhost:${PORT}`);
  setInterval(() => {
    try {
      scheduleAutomaticPriceSyncIfDue();
    } catch (e) {
      console.error('[PRICE SYNC] scheduler:', e);
    }
  }, 60 * 60 * 1000);
  setTimeout(() => {
    try {
      scheduleAutomaticPriceSyncIfDue();
    } catch (e) {
      console.error('[PRICE SYNC] startup check:', e);
    }
  }, 15000);
});

//=== ПРОФИЛЬ И ЛИЧНЫЕ ДАННЫЕ ===

//Получить профиль текущего пользователя
app.get('/api/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, fullName: true, createdAt: true, role: true }
    });
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    const [favoritesCount, comparisonsCount, viewsCount] = await Promise.all([
      prisma.favorite.count({ where: { userId: payload.id } }),
      prisma.comparison.count({ where: { userId: payload.id } }),
      prisma.viewLog.count({ where: { userId: payload.id } })
    ]);
    res.json({ user, stats: { favoritesCount, comparisonsCount, viewsCount } });
  } catch (err) {
    console.error('Ошибка профиля:', err);
    res.status(401).json({ error: 'Неверный токен' });
  }
});

//Получить избранные товары
app.get('/api/favorites', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const favorites = await prisma.favorite.findMany({
      where: { userId: payload.id },
      include: {
        product: {
          include: {
            specs: true,
            prices: true
          }
        }
      }
    });
    res.json(favorites.map(f => f.product));
  } catch (err) {
    console.error('Ошибка избранного:', err);
    res.status(401).json({ error: 'Неверный токен' });
  }
});

app.get('/api/profile/alerts', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const persisted = pruneExpiredAlerts().filter((a) => a.userId === payload.id);
    const favorites = await prisma.favorite.findMany({
      where: { userId: payload.id },
      include: {
        product: {
          include: {
            prices: true
          }
        }
      }
    });

    const signalsState = readStoreSignals();
    const signalItems = Array.isArray(signalsState.items) ? signalsState.items : [];
    const now = new Date();
    const runtimeAlerts = [];

    for (const fav of favorites) {
      const product = fav.product;
      if (!product?.id) continue;
      const prices = Array.isArray(product.prices) ? product.prices : [];
      for (const priceRow of prices) {
        const storeName = String(priceRow.storeName || '').trim();
        if (!storeName) continue;
        const prevRows = await prisma.priceHistory.findMany({
          where: { productId: product.id, storeName },
          orderBy: { date: 'desc' },
          take: 2
        });
        if (prevRows.length >= 2) {
          const prevPrice = Number(prevRows[1].price);
          const currPrice = Number(priceRow.price);
          if (prevPrice > 0 && currPrice > 0 && currPrice < prevPrice) {
            const dropPct = ((prevPrice - currPrice) / prevPrice) * 100;
            if (dropPct >= 5) {
              runtimeAlerts.push({
                id: `rt_${payload.id}_${product.id}_${storeName}_price_drop`,
                userId: payload.id,
                productId: product.id,
                productName: product.name,
                storeName,
                type: 'price_drop',
                message: `Товар "${product.name}" в магазине ${storeName} подешевел на ${dropPct.toFixed(1)}%.`,
                createdAt: now.toISOString(),
                expiresAt: new Date(now.getTime() + THREE_DAYS_MS).toISOString()
              });
            }
          }
        }
        const signal = signalItems.find((s) => Number(s.productId) === Number(product.id) && String(s.storeName || '').toLowerCase() === storeName.toLowerCase());
        const stock = Number(signal?.stock);
        if (Number.isFinite(stock) && stock >= 0 && stock < 10) {
          runtimeAlerts.push({
            id: `rt_${payload.id}_${product.id}_${storeName}_low_stock`,
            userId: payload.id,
            productId: product.id,
            productName: product.name,
            storeName,
            type: 'low_stock',
            message: `Товар "${product.name}" в магазине ${storeName}: осталось мало (${Math.round(stock)}).`,
            createdAt: now.toISOString(),
            expiresAt: new Date(now.getTime() + THREE_DAYS_MS).toISOString()
          });
        }
      }
    }

    const dedup = new Map();
    [...persisted, ...runtimeAlerts].forEach((a) => {
      const key = `${a.userId}:${a.productId}:${a.storeName}:${a.type}`;
      dedup.set(key, a);
    });
    const items = Array.from(dedup.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(items);
  } catch (err) {
    res.status(401).json({ error: 'Неверный токен' });
  }
});

//Получить товары в сравнении
app.get('/api/comparisons', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const comparisons = await prisma.comparison.findMany({
      where: { userId: payload.id },
      include: {
        product: {
          include: {
            specs: true,
            prices: true
          }
        }
      }
    });
    res.json(comparisons.map(c => c.product));
  } catch (err) {
    console.error('Ошибка сравнения:', err);
    res.status(401).json({ error: 'Неверный токен' });
  }
});


//Добавить в избранное
app.post('/api/favorites', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const { productId } = req.body;

    //Проверяем, существует ли товар
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Товар не найден' });

    //Добавляем в избранное
    await prisma.favorite.create({
      data: { userId: payload.id, productId }
    });

    res.json({ message: 'Добавлено в избранное' });
  } catch (err) {
    console.error('Ошибка добавления в избранное:', err);
    res.status(500).json({ error: 'Не удалось добавить в избранное' });
  }
});

//Добавить в сравнение
app.post('/api/comparisons', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const { productId } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Товар не найден' });

    await prisma.comparison.create({
      data: { userId: payload.id, productId }
    });

    res.json({ message: 'Добавлено в сравнение' });
  } catch (err) {
    console.error('Ошибка добавления в сравнение:', err);
    res.status(500).json({ error: 'Не удалось добавить в сравнение' });
  }
});

//Удалить все товары пользователя из сравнения по категории
app.delete('/api/comparisons/clear', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const userId = payload.id;
    const category = req.query.category;

    if (!category) {
      return res.status(400).json({ error: 'Укажите категорию для удаления' });
    }

    //Получаем ID всех товаров в указанной категории
    const productsInCategory = await prisma.product.findMany({
      where: { category },
      select: { id: true }
    });

    const productIds = productsInCategory.map(p => p.id);

    if (productIds.length === 0) {
      return res.json({ message: 'Нет товаров в этой категории', count: 0 });
    }

    //Удаляем все записи из таблицы comparisons
    const result = await prisma.comparison.deleteMany({
      where: {
        userId: userId,
        productId: { in: productIds } //← ПРАВИЛЬНЫЙ СИНТАКСИС
      }
    });

    res.json({ 
      message: `Удалено ${result.count} товаров из категории "${category}"`,
      count: result.count 
    });

  } catch (err) {
    console.error('Ошибка очистки сравнения:', err);
    res.status(500).json({ error: 'Не удалось очистить сравнение' });
  }
});

//Удалить из избранного
app.delete('/api/favorites/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const productId = parseInt(req.params.id);
    await prisma.favorite.deleteMany({
      where: { userId: payload.id, productId }
    });
    res.json({ message: 'Удалено из избранного' });
  } catch (err) {
    console.error('Ошибка удаления избранного:', err);
    res.status(500).json({ error: 'Не удалось удалить' });
  }
});

//Удалить из сравнения
//Удалить товар из сравнения по ID товара
app.delete('/api/comparisons/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const userId = payload.id;
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Некорректный ID товара' });
    }

    //Удаляем запись из таблицы comparisons
    const result = await prisma.comparison.deleteMany({
      where: {
        userId: userId,
        productId: productId //← ПРАВИЛЬНО: явное значение
      }
    });

    if (result.count > 0) {
      res.json({ message: 'Товар удалён из сравнения', count: result.count });
    } else {
      res.status(404).json({ error: 'Товар не найден в сравнении' });
    }

  } catch (err) {
    console.error('Ошибка удаления сравнения:', err);
    res.status(500).json({ error: 'Не удалось удалить товар из сравнения' });
  }
});

app.get('/api/favorites/check/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const productId = parseInt(req.params.id);
    const exists = await prisma.favorite.findFirst({
      where: { userId: payload.id, productId }
    });
    res.json({ isFavorite: !!exists });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка проверки' });
  }
});

app.get('/api/products/:id/price-history', async (req, res) => {
  try {
    //Получаем ID товара из параметров URL
    const productId = parseInt(req.params.id, 10);

    //Проверяем, является ли ID числом
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    console.log(`Fetching price history for product ID: ${productId}`); //Лог для отладки

    //Запрашиваем историю цен из БД через Prisma
    const priceHistoryRecords = await prisma.priceHistory.findMany({
      where: {
        productId: productId, //Фильтруем по ID товара
      },
      select: {
        storeName: true, //Выбираем имя магазина
        price: true,     //Выбираем цену
        date: true,      //Выбираем дату
        //id и createdAt не обязательны для графика, можно не включать
      },
      orderBy: [
        { storeName: 'asc' }, //Сначала сортируем по магазину
        { date: 'asc' }       //Потом по дате
      ],
    });

    const currentPriceRows = await prisma.price.findMany({
      where: { productId: productId },
      select: { storeName: true, url: true }
    });
    const urlByStore = currentPriceRows.reduce((acc, row) => {
      const key = String(row.storeName || '').trim();
      if (key && row.url) acc[key] = row.url;
      return acc;
    }, {});

    console.log(`Found ${priceHistoryRecords.length} records for product ID: ${productId}`); //Лог для отладки

    //Если записи не найдены
    if (priceHistoryRecords.length === 0) {
       console.log(`No price history found for product ID: ${productId}`);
       return res.status(200).json({}); //Возвращаем пустой объект или массив, если нет данных
    }

    //Группируем записи по магазинам для удобства построения графика
    const groupedByStore = priceHistoryRecords.reduce((acc, record) => {
      const storeName = record.storeName;
      if (!acc[storeName]) {
        acc[storeName] = [];
      }
      //Преобразуем Decimal (Prisma) в Number и форматируем дату, если нужно
      //Chart.js лучше работает с объектами {x: Date, y: Number}
      acc[storeName].push({
        x: new Date(record.date).toISOString(), //Используем ISO строку для Chart.js
        y: parseFloat(record.price), //Преобразуем Decimal в Number
        url: urlByStore[storeName] || ''
      });
      return acc;
    }, {});

    console.log(`Grouped data by store for product ID: ${productId}`, Object.keys(groupedByStore)); //Лог для отладки

    //Отправляем сгруппированные данные клиенту
    res.json(groupedByStore);

  } catch (error) {
    console.error('Error fetching price history:', error);
    //Отправляем ошибку клиенту
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; //"Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    //Используем promisify для jwt.verify
    const user = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    req.user = user; //Добавляем информацию о пользователе в req
    next(); //Переходим к следующему middleware
  } catch (err) {
    console.error('Token verification error:', err);
    //Проверяем тип ошибки
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token format' }); //Более точное сообщение
    } else {
      //Другие ошибки
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
  }
};

const authenticateTokenOptional = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const user = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    req.user = user;
  } catch (err) {
    req.user = null;
  }

  next();
};

app.post('/api/reviews', authenticateToken, async (req, res) => {
  console.log('--- НАЧАЛО ОБРАБОТКИ POST /api/reviews ---');
  console.log('Тело запроса (req.body):', req.body);
  console.log('Пользователь из токена (req.user):', req.user);

  
  const { productId, rating, text } = req.body; 

  if (
    //productId должен быть числом (как пришедшее с клиента) или строкой, которую можно превратить в число
    productId == null || //Проверка на null или undefined
    (typeof productId !== 'number' && (typeof productId !== 'string' || isNaN(parseInt(productId, 10)))) ||
    !rating ||
    typeof rating !== 'number' ||
    rating < 1 ||
    rating > 5
  ) {
    console.log('   ОШИБКА ВАЛИДАЦИИ: productId или rating неверны.');
    console.log(`     productId: ${productId} (type: ${typeof productId}), rating: ${rating} (type: ${typeof rating})`);
    return res.status(400).json({ error: 'Product ID и rating (1-5) обязательны.' });
  }

  //Преобразуем productId к числу для дальнейшего использования
  const parsedProductId = typeof productId === 'string' ? parseInt(productId, 10) : productId;

  //Проверяем, существует ли товар
  const productExists = await prisma.product.findUnique({
    where: { id: parsedProductId } 
  });
  if (!productExists) {
    console.log(`   ОШИБКА: Товар с ID ${parsedProductId} не найден.`);
    return res.status(404).json({ error: 'Product not found.' });
  }

  try {
    console.log(`   Подготовка к созданию отзыва для товара ${parsedProductId}, рейтинг ${rating}, текст: "${text}"`);
    //Создаём отзыв
    const newReview = await prisma.review.create({
       data:{
        userId: req.user.id,
        productId: parsedProductId, 
        userName: req.user.fullName || req.user.email.split('@')[0],
        rating: rating,
        comment: text ? text.trim() : null, 
        //isApproved: false, status: 'pending' - установлены по умолчанию
      }
    });

    console.log(`   Отзыв успешно создан в БД с ID ${newReview.id}, comment: "${newReview.comment}"`);
    res.status(201).json(newReview);

  } catch (error) {
    console.error('   ОШИБКА СОЗДАНИЯ ОТЗЫВА В БАЗЕ:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
  console.log('--- КОНЕЦ ОБРАБОТКИ POST /api/reviews ---');
});



async function recalculateProductRating(productId) {
  console.log(`[DEBUG] recalculateProductRating: Начинаю пересчёт для товара ID: ${productId}`);

  try {
    
    const avgRatingResult = await prisma.review.aggregate({
      where: {
        productId: productId,
        isApproved: true 
      },
      _avg: {
        rating: true 
      }
    });

    //avgRatingResult._avg.rating может быть null, если нет одобренных отзывов
    const newAverageRating = avgRatingResult._avg.rating;
    console.log(`[DEBUG] recalculateProductRating: Средняя оценка (из aggregate): ${newAverageRating} (type: ${typeof newAverageRating})`);

    const updatedProduct = await prisma.product.update({
      where: { id: productId }, 
       data:{
        //Поля, КОТОРЫЕ обновляются (в данном случае - rating)
        //Если newAverageRating - число, используем его, иначе устанавливаем 0.0
        rating: typeof newAverageRating === 'number' ? newAverageRating : 0.0
      }
    });

    console.log(`[DEBUG] recalculateProductRating: Рейтинг товара ID ${productId} обновлён до ${updatedProduct.rating}`);
  } catch (error) {
    console.error(`[ERROR] recalculateProductRating: Ошибка пересчёта для товара ID ${productId}:`, error.message);
    //Не выбрасываем ошибку, чтобы не прерывать основной процесс (например, добавление/одобрение отзыва)
    //Но логируем её.
  }
}

//Получить *одобренные* отзывы для товара (без авторизации)
app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);

    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    //Получаем только *одобренные* отзывы для отображения
    const reviews = await prisma.review.findMany({
      where: {
        productId: productId,
        isApproved: true 
      },
      include: {
        user: { //Подгружаем данные пользователя (если есть), чтобы показать fullName
          select: { fullName: true } //Выбираем только имя, не пароль и т.д.
        }
      },
      orderBy: {
        createdAt: 'desc' 
      }
    });

    res.json(reviews);

  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

//Отправить запрос на добавление товара (требует авторизации)
app.post('/api/requests', authenticateToken, async (req, res) => {
  try {

    const { productName, category, url, comment } = req.body;
    const userId = req.user.id;

    //Валидация
    if (!productName || typeof productName !== 'string' || productName.trim() === '') {
      return res.status(400).json({ error: 'Поле "productName" обязательно и должно быть строкой.' });
    }
    //Опциональные поля: category, url, comment
    //Проверим, что, если поле передано, оно строковое
    if (category && typeof category !== 'string') {
      return res.status(400).json({ error: 'Поле "category", если указано, должно быть строкой.' });
    }
    if (url && typeof url !== 'string') {
      return res.status(400).json({ error: 'Поле "url", если указано, должно быть строкой.' });
    }
    if (comment && typeof comment !== 'string') {
      return res.status(400).json({ error: 'Поле "comment", если указано, должно быть строкой.' });
    }

    //Создаём запрос
    //ПЕРЕДАЁМ url и comment в data
    const newRequest = await prisma.request.create({
       data:{
        userId, //ID пользователя
        productName: productName.trim(), //Название товара
        category: category ? category.trim() : null, //Категория (опционально)
        url: url ? url.trim() : null, 
        comment: comment ? comment.trim() : null, 
      }
    });

    res.status(201).json(newRequest);

  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});


const requireAdminRole = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён. Требуются права администратора.' });
  }
  next();
};

app.get('/api/admin/reviews', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { fullName: true, email: true } }, //Подгрузим данные пользователя
        product: { select: { name: true, category: true } } //Подгрузим данные товара
      },
      orderBy: { createdAt: 'desc' } //Сортируем по дате создания, новые сверху
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews for admin:', error);
    res.status(500).json({ error: 'Не удалось загрузить отзывы' });
  }
});

//PATCH /api/admin/reviews/:id - Обновить статус отзыва
app.patch('/api/admin/reviews/:id', authenticateToken, requireAdminRole, async (req, res) => {
  const reviewId = parseInt(req.params.id, 10);
  const { status, adminNotes } = req.body; //Ожидаем статус и, опционально, заметки

  if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be pending, approved, or rejected.' });
  }

  try {
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
       data:{
        status: status,
        isApproved: status === 'approved', 
        adminNotes: adminNotes || null,
        processedAt: new Date()
      },
      include: {
        user: { select: { fullName: true, email: true } },
        product: { select: { id: true, name: true, category: true } } 
      }
    });

    await recalculateProductRating(updatedReview.productId);

    res.json(updatedReview);
  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({ error: 'Не удалось обновить отзыв' });
  }
});

app.delete('/api/admin/reviews/:id', authenticateToken, requireAdminRole, async (req, res) => {
  const reviewId = parseInt(req.params.id, 10);

  try {
    const reviewToDelete = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { productId: true } 
    });

    if (!reviewToDelete) {
      return res.status(404).json({ error: 'Отзыв не найден.' });
    }

    await prisma.review.delete({
      where: { id: reviewId }
    });

    await recalculateProductRating(reviewToDelete.productId);

    res.json({ message: `Отзыв ID ${reviewId} успешно удалён.` });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Не удалось удалить отзыв.' });
  }
});

//GET /api/admin/requests - Получить все запросы на добавление товара
app.get('/api/admin/requests', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    const requests = await prisma.request.findMany({
      include: {
        user: { select: { fullName: true, email: true } } //Подгрузим данные пользователя
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests for admin:', error);
    res.status(500).json({ error: 'Не удалось загрузить запросы' });
  }
});

//PATCH /api/admin/requests/:id - Обновить статус запроса
app.patch('/api/admin/requests/:id', authenticateToken, requireAdminRole, async (req, res) => {
  const requestId = parseInt(req.params.id, 10);
  const { status, adminNotes } = req.body;

  if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be pending, approved, or rejected.' });
  }

  try {
    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: {
        status: status,
        adminNotes: adminNotes || null,
        processedAt: new Date()
      },
      include: {
        user: { select: { fullName: true, email: true } }
      }
    });
    res.json(updatedRequest);
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ error: 'Не удалось обновить запрос' });
  }
});



//GET /api/admin/tables - Получить список всех таблиц (для выбора в админке)
app.get('/api/admin/tables', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    //Запрос к INFORMATION_SCHEMA PostgreSQL для получения имён таблиц
    const result = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    //Результат возвращается как массив объектов { table_name: '...' }
    const tableNames = result.map(row => row.table_name);
    res.json(tableNames);
  } catch (error) {
    console.error('Error fetching table list:', error);
    res.status(500).json({ error: 'Не удалось получить список таблиц', details: error.message });
  }
});

//GET /api/admin/table/:tableName - Получить данные из таблицы
app.get('/api/admin/table/:tableName', authenticateToken, requireAdminRole, async (req, res) => {
  const tableName = req.params.tableName;
  const allowedTables = ['Product', 'ProductSpec', 'Price', 'Review', 'Request', 'User', 'PriceHistory'];
  const prismaModelMap = {
    'Product': 'product',
    'ProductSpec': 'productSpec',
    'Price': 'price',
    'Review': 'review',
    'Request': 'request',
    'User': 'user',
    'PriceHistory': 'priceHistory'
  };

  if (!allowedTables.includes(tableName)) {
    return res.status(400).json({ error: 'Таблица не разрешена для редактирования' });
  }

  const prismaModelKey = prismaModelMap[tableName];
  if (!prismaModelKey) {
    return res.status(400).json({ error: 'Таблица не найдена в Prisma Client' });
  }

  const { searchField, searchValue } = req.query;

  try {
    const modelClient = prisma[prismaModelKey];
    if (!modelClient) {
      throw new Error(`Model client for ${tableName} (${prismaModelKey}) not found in Prisma.`);
    }

    let whereClause = {};
    if (searchField && searchValue) {
      //Проверим, существует ли поле в модели (опционально, но безопаснее)
      //Для простоты, будем считать, что клиент отправляет корректные имена полей
      whereClause[searchField] = {
        contains: searchValue,
        mode: 'insensitive'
      };
    }

    const data = await modelClient.findMany({
      where: whereClause,
      take: 1000 //Увеличенный лимит
    });

    res.json(data);
  } catch (error) {
    console.error(`Error fetching data from table ${tableName}:`, error);
    res.status(500).json({ error: `Не удалось загрузить данные из таблицы ${tableName}` });
  }
});

//POST /api/admin/table/:tableName - Добавить запись в таблицу
app.post('/api/admin/table/:tableName', authenticateToken, requireAdminRole, async (req, res) => {
  const tableName = req.params.tableName;
  const allowedTables = ['Product', 'ProductSpec', 'Price', 'Review', 'Request', 'User', 'PriceHistory'];
  const prismaModelMap = {
    'Product': 'product',
    'ProductSpec': 'productSpec',
    'Price': 'price',
    'Review': 'review',
    'Request': 'request',
    'User': 'user',
    'PriceHistory': 'priceHistory'
  };

  if (!allowedTables.includes(tableName)) {
    return res.status(400).json({ error: 'Таблица не разрешена для редактирования' });
  }

  const prismaModelKey = prismaModelMap[tableName];
  if (!prismaModelKey) {
    return res.status(400).json({ error: 'Таблица не найдена в Prisma Client' });
  }

  const data = req.body;

  try {
    const modelClient = prisma[prismaModelKey];
    if (!modelClient) {
      throw new Error(`Model client for ${tableName} (${prismaModelKey}) not found in Prisma.`);
    }


    const createdRecord = await modelClient.create({
      data: data
    });
    res.status(201).json(createdRecord);
  } catch (error) {
    console.error(`Error creating record in table ${tableName}:`, error);
    res.status(500).json({ error: `Не удалось добавить запись в таблицу ${tableName}` });
  }
});

//PUT /api/admin/table/:tableName/:id - Обновить запись в таблице
app.put('/api/admin/table/:tableName/:id', authenticateToken, requireAdminRole, async (req, res) => {
  const tableName = req.params.tableName;
  const recordId = parseInt(req.params.id, 10);

  const allowedTables = ['Product', 'ProductSpec', 'Price', 'Review', 'Request', 'User', 'PriceHistory'];
  const prismaModelMap = {
    'Product': 'product',
    'ProductSpec': 'productSpec',
    'Price': 'price',
    'Review': 'review',
    'Request': 'request',
    'User': 'user',
    'PriceHistory': 'priceHistory'
  };

  if (!allowedTables.includes(tableName)) {
    return res.status(400).json({ error: 'Таблица не разрешена для редактирования' });
  }

  const prismaModelKey = prismaModelMap[tableName];
  if (!prismaModelKey) {
    return res.status(400).json({ error: 'Таблица не найдена в Prisma Client' });
  }

  let receivedData = req.body;
  console.log(`Получены данные для обновления записи ID ${recordId} в таблице ${tableName}:`, receivedData);

  const { id, ...dataForUpdate } = receivedData;
  console.log(`Данные для обновления (без id):`, dataForUpdate);

  try {
    const modelClient = prisma[prismaModelKey];
    if (!modelClient) {
      throw new Error(`Model client for ${tableName} (${prismaModelKey}) not found in Prisma.`);
    }

    const modelTypeMap = {
      'product': {
        id: 'Int',
        name: 'String',
        category: 'String',
        description: 'String',
        imageUrl: 'String',
        rating: 'Float',
        isActive: 'Boolean',
        createdAt: 'DateTime',
        updatedAt: 'DateTime',
      },
      'productSpec': { 
        id: 'Int',
        productId: 'Int', 
        specKey: 'String',
        specValue: 'String',
      },
      'price': {
        id: 'Int',
        productId: 'Int',
        storeName: 'String',
        price: 'Int', 
        url: 'String',
        recordedAt: 'DateTime',
      },
      'review': {
        id: 'Int',
        userId: 'Int',
        productId: 'Int',
        userName: 'String',
        rating: 'Int',
        comment: 'String',
        isApproved: 'Boolean',
        status: 'String',
        adminNotes: 'String?',
        createdAt: 'DateTime',
        updatedAt: 'DateTime',
        processedAt: 'DateTime?',
      },
      'request': {
        id: 'Int',
        userId: 'Int',
        productId: 'Int',
        status: 'String',
        requestType: 'String',
        message: 'String?',
        createdAt: 'DateTime',
        updatedAt: 'DateTime',
      },
      'user': {
        id: 'Int',
        email: 'String',
        fullName: 'String',
        role: 'String',
        createdAt: 'DateTime',
        updatedAt: 'DateTime',
      },
      'priceHistory': {
        id: 'Int',
        productId: 'Int',
        storeName: 'String',
        price: 'Int', //или Float/Decimal
        date: 'DateTime',
      },
    };

    const expectedTypes = modelTypeMap[prismaModelKey];
    if (expectedTypes) {
      for (const [key, value] of Object.entries(dataForUpdate)) {
        const expectedType = expectedTypes[key];
        if (expectedType) {
          switch (expectedType) {
            case 'Int':
              if (typeof value === 'string' && !isNaN(parseInt(value, 10))) {
                dataForUpdate[key] = parseInt(value, 10);
              } else if (typeof value !== 'number') {
                dataForUpdate[key] = 0; //Или null, в зависимости от схемы
              }
              break;
            case 'Float':
            case 'Decimal':
              if (typeof value === 'string' && !isNaN(parseFloat(value))) {
                dataForUpdate[key] = parseFloat(value);
              } else if (typeof value !== 'number') {
                dataForUpdate[key] = 0.0; //Или null
              }
              break;
            case 'Boolean':
              if (typeof value === 'string') {
                dataForUpdate[key] = value.toLowerCase() === 'true';
              } else if (typeof value !== 'boolean') {
                dataForUpdate[key] = false;
              }
              break;
            case 'DateTime':
              if (typeof value === 'string') {
                dataForUpdate[key] = new Date(value);
              } else if (!(value instanceof Date)) {
                dataForUpdate[key] = new Date(); //Или null
              }
              break;
            default:
              if (typeof value === 'string') {
                dataForUpdate[key] = value.trim();
              }
          }
        }
      }
    }

    const updatedRecord = await modelClient.update({
       
        where: { id: recordId }, //Условие
         data:{
          ...dataForUpdate //Правильное место для передачи полей обновления
        }
      
    });

    console.log(`Запись ID ${recordId} в таблице ${tableName} успешно обновлена.`, updatedRecord);
    res.json(updatedRecord);

  } catch (error) {
    console.error(`Error updating record in table ${tableName}:`, error);
    res.status(500).json({ error: `Не удалось обновить запись в таблице ${tableName}` });
  }
});

//DELETE /api/admin/table/:tableName/:id - Удалить запись из таблицы
app.delete('/api/admin/table/:tableName/:id', authenticateToken, requireAdminRole, async (req, res) => {
  const tableName = req.params.tableName;
  const recordId = parseInt(req.params.id, 10);
  const allowedTables = ['Product', 'ProductSpec', 'Price', 'Review', 'Request', 'User', 'PriceHistory'];
  const prismaModelMap = {
    'Product': 'product',
    'ProductSpec': 'productSpec',
    'Price': 'price',
    'Review': 'review',
    'Request': 'request',
    'User': 'user',
    'PriceHistory': 'priceHistory'
  };

  if (!allowedTables.includes(tableName)) {
    return res.status(400).json({ error: 'Таблица не разрешена для редактирования' });
  }

  const prismaModelKey = prismaModelMap[tableName];
  if (!prismaModelKey) {
    return res.status(400).json({ error: 'Таблица не найдена в Prisma Client' });
  }

  try {
    const modelClient = prisma[prismaModelKey];
    if (!modelClient) {
      throw new Error(`Model client for ${tableName} (${prismaModelKey}) not found in Prisma.`);
    }

    await modelClient.delete({
      where: { id: recordId }
    });
    res.json({ message: `Запись ID ${recordId} из таблицы ${tableName} успешно удалена.` });
  } catch (error) {
    console.error(`Error deleting record from table ${tableName}:`, error);
    res.status(500).json({ error: `Не удалось удалить запись из таблицы ${tableName}` });
  }
});


//Маршрут для получения основной статистики админ-панели
app.get('/api/admin/dashboard-stats', authenticateToken, requireAdminRole, async (req, res) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const totalProducts = await prisma.product.count();
        //Считаем отзывы, ожидающие модерации (например, со статусом 'pending')
        const pendingReviews = await prisma.review.count({ where: { status: 'pending' } });
        const newReviews = await prisma.review.count({ where: { createdAt: { gte: todayStart } } });
        //Или, если используется isApproved: false
        //const pendingReviews = await prisma.review.count({ where: { isApproved: false } });

        //Считаем запросы, ожидающие модерации (со статусом 'pending')
        const pendingRequests = await prisma.request.count({ where: { status: 'pending' } });

        res.json({
            totalProducts,
            pendingReviews,
            pendingRequests,
            newReviews
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Не удалось загрузить статистику', details: error.message });
    }
});

//Маршрут для получения аналитики (счётчики, не хранящиеся постоянно)
app.get('/api/admin/analytics/stats', authenticateToken, requireAdminRole, async (req, res) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

        //Просмотры за вчера и сегодня
        const viewsYesterday = await prisma.viewLog.count({ where: { viewedAt: { gte: yesterdayStart, lt: todayStart } } });
        const viewsToday = await prisma.viewLog.count({ where: { viewedAt: { gte: todayStart } } });

        //Переходы к покупке за вчера и сегодня
        let purchaseClicksYesterday = 0;
        let purchaseClicksToday = 0;
        try {
          purchaseClicksYesterday = await prisma.purchaseClick.count({ where: { clickedAt: { gte: yesterdayStart, lt: todayStart } } });
          purchaseClicksToday = await prisma.purchaseClick.count({ where: { clickedAt: { gte: todayStart } } });
        } catch (purchaseError) {
          if (!isMissingTableError(purchaseError, 'PurchaseClick')) {
            throw purchaseError;
          }
          console.warn('Таблица PurchaseClick не найдена, используем purchaseClicks=0 до применения миграции.');
        }

        //Популярные поиски
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const searches = await prisma.searchLog.groupBy({
            by: ['query'],
            _count: true,
            where: { createdAt: { gte: weekAgo } },
            orderBy: { _count: { query: 'desc' } },
            take: 5
        });

        //Популярные товары по просмотрам (за 30 дней)
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const groupedViews = await prisma.viewLog.groupBy({
          by: ['productId'],
          _count: { productId: true },
          where: { viewedAt: { gte: monthAgo } },
          orderBy: { _count: { productId: 'desc' } },
          take: 6
        });

        const popularProductIds = groupedViews.map(item => item.productId);
        const popularProductsData = popularProductIds.length > 0
          ? await prisma.product.findMany({
              where: { id: { in: popularProductIds } },
              select: {
                id: true,
                name: true,
                imageUrl: true,
                category: true,
                prices: {
                  select: { price: true },
                  orderBy: { price: 'asc' },
                  take: 1
                }
              }
            })
          : [];

        const popularProductsMap = new Map(popularProductsData.map(product => [product.id, product]));
        const popularProducts = groupedViews
          .map((item) => {
            const product = popularProductsMap.get(item.productId);
            if (!product) return null;
            return {
              id: product.id,
              name: product.name,
              category: product.category,
              imageUrl: product.imageUrl,
              minPrice: product.prices[0]?.price ?? null,
              viewCount: item._count.productId
            };
          })
          .filter(Boolean);

        const getPercentChange = (todayValue, yesterdayValue) => {
          if (yesterdayValue === 0) {
            return todayValue > 0 ? 100 : 0;
          }
          return Number((((todayValue - yesterdayValue) / yesterdayValue) * 100).toFixed(1));
        };

        const averageResponseTime = responseTimeSamples.length > 0
          ? Number((responseTimeSamples.reduce((sum, value) => sum + value, 0) / responseTimeSamples.length).toFixed(1))
          : 0;
        const memoryLoadPercent = Number((((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(1));
        const cpuCount = Math.max(1, os.cpus()?.length || 1);
        const rawLoad = os.loadavg?.()[0] ?? 0;
        const normalizedCpuLoad = rawLoad > 0 ? Number(Math.min(100, (rawLoad / cpuCount) * 100).toFixed(1)) : 0;
        const serverLoad = normalizedCpuLoad > 0
          ? Number(((normalizedCpuLoad * 0.45) + (memoryLoadPercent * 0.55)).toFixed(1))
          : memoryLoadPercent;

        const onlineSince = new Date(now.getTime() - 15 * 60 * 1000);
        const [recentViewUsers, recentSearchUsers] = await Promise.all([
          prisma.viewLog.findMany({
            where: { viewedAt: { gte: onlineSince }, userId: { not: null } },
            select: { userId: true }
          }),
          prisma.searchLog.findMany({
            where: { createdAt: { gte: onlineSince }, userId: { not: null } },
            select: { userId: true }
          })
        ]);

        const onlineUserIds = new Set([
          ...recentViewUsers.map((item) => item.userId),
          ...recentSearchUsers.map((item) => item.userId)
        ]);

        try {
          const recentPurchaseUsers = await prisma.purchaseClick.findMany({
            where: { clickedAt: { gte: onlineSince }, userId: { not: null } },
            select: { userId: true }
          });
          recentPurchaseUsers.forEach((item) => onlineUserIds.add(item.userId));
        } catch (purchaseOnlineError) {
          if (!isMissingTableError(purchaseOnlineError, 'PurchaseClick')) {
            throw purchaseOnlineError;
          }
        }

        const uptimeSeconds = process.uptime();

        res.json({
            totalProducts: await prisma.product.count(),
            totalUsers: await prisma.user.count(),
            totalReviews: await prisma.review.count(),
            totalRequests: await prisma.request.count(),
            dailyViews: viewsToday,
            purchaseClicks: purchaseClicksToday,
            dailyViewsChange: getPercentChange(viewsToday, viewsYesterday),
            purchaseClicksChange: getPercentChange(purchaseClicksToday, purchaseClicksYesterday),
            popularSearches: searches.map(s => ({ term: s.query, count: s._count.query })),
            popularProducts,
            serverLoad,
            memoryLoad: memoryLoadPercent,
            cpuLoad: normalizedCpuLoad,
            responseTime: averageResponseTime,
            onlineUsers: onlineUserIds.size,
            uptimeHours: Number((uptimeSeconds / 3600).toFixed(2))
        });
    } catch (error) {
        console.error('Ошибка аналитики:', error);
        res.status(500).json({ error: 'Ошибка загрузки аналитики' });
    }
});

//Получить популярные поиски
app.get('/api/admin/analytics/popular-searches', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const searches = await prisma.searchLog.groupBy({
      by: ['query'],
      _count: { query: true },
      where: { createdAt: { gte: weekAgo } },
      orderBy: { _count: { query: 'desc' } },
      take: 10
    });
    const popularSearches = searches.map((item) => ({
      term: item.query,
      count: item._count.query
    }));
    res.json(popularSearches);
  } catch (error) {
    console.error('Error fetching popular searches:', error);
    res.status(500).json({ error: 'Не удалось загрузить популярные поиски' });
  }
});

//Получить список всех пользователей
app.get('/api/admin/users', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' } //Сортировка по дате регистрации
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Не удалось загрузить пользователей' });
  }
});


app.post('/api/admin/users/:id/send-message', authenticateToken, requireAdminRole, async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Текст сообщения обязателен.' });
  }

  try {
    //Найти пользователя
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден.' });
    }

    //Отправить сообщение (например, на email, или сохранить в отдельную таблицу сообщений)
    console.log(`Сообщение для пользователя ${user.email} (${user.id}): ${message}`);

    res.json({ message: 'Сообщение отправлено.' });
  } catch (error) {
    console.error('Error sending message to user:', error);
    res.status(500).json({ error: 'Не удалось отправить сообщение.' });
  }
});

//Удалить пользователя
app.delete('/api/admin/users/:id', authenticateToken, requireAdminRole, async (req, res) => {
  const userId = parseInt(req.params.id, 10);

  try {
    //Удаление пользователя (каскадно удалит связанные данные, если настроено в schema.prisma)
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: `Пользователь ID ${userId} успешно удалён.` });
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Пользователь не найден.' });
    }
    res.status(500).json({ error: 'Не удалось удалить пользователя.' });
  }
});


async function parseProductFromDnsShop(url, proxy = null) {
  console.log(`Парсим товар с DNS (puppeteer): ${url}, через proxy: ${proxy || 'нет'}`);

  let browser;
  try {
    const launchOptions = {
      headless: true, //Или false для отладки
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-features=VizDisplayRenderer',
        '--disable-features=VizDisplayCompositorGPU',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-ipc-flooding-protection',
        '--disable-background-networking',
        '--lang=ru-RU',
        '--timezone-policy=host',
        //'--proxy-server=http://bfwdtevx:t1qa9ys45t14@185.199.229.156:7492',
        //'--user-data-dir=/tmp/chrome-user-data', //Опционально: использовать профиль
      ],
    };

    if (proxy) {
      launchOptions.args.push(`--proxy-server=${proxy}`);
      console.log(`   Используется прокси: ${proxy}`);
    }

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Ch-Ua': '"Chromium";v="120", "Not_A Brand";v="8"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
    });

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.setViewport({ width: 1920, height: 1080 });
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      Object.defineProperty(navigator, 'languages', {
        get: () => ['ru-RU', 'ru', 'en-US', 'en'],
      });
    });

    console.log(`   Открываем страницу: ${url}`);
    const response = await page.goto(url, {
      waitUntil: 'networkidle2', //Ждём стабильности сети
      timeout: 30000, //Увеличиваем таймаут
    });

    const status = response.status();
    if (status === 401 || status === 403 || status === 429) {
      throw new Error(`DNS-шоп вернул статус ${status} - доступ запрещён или ограничение скорости. IP может быть заблокирован.`);
    } else if (!response.ok()) {
      throw new Error(`DNS-шоп вернул статус ${status} - ошибка загрузки страницы.`);
    }

    await page.waitForTimeout(Math.random() * 2000 + 1000); //Случайная задержка
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight / 3); //Прокрутка
    });
    await page.waitForTimeout(Math.random() * 1000 + 500);

    //Ждём загрузки названия и цены (DNS часто использует динамическую загрузку)
    await page.waitForSelector('h1[data-state="product-title"]', { timeout: 15000 });
    await page.waitForSelector('[data-marker="price"] span', { timeout: 15000 });

    const data = await page.evaluate(() => {
      const nameElement = document.querySelector('h1[data-state="product-title"]');
      const name = nameElement?.innerText?.trim() || 'Неизвестное название';

      let price = null;
      const priceSelectors = [
        '[data-marker="price"] span',
        '.current-price span',
        '.price-value span'
      ];

      for (const sel of priceSelectors) {
        const priceEl = document.querySelector(sel);
        if (priceEl) {
          let priceText = priceEl.innerText;
          priceText = priceText.replace(/\s/g, '').replace(/[^\d]/g, '');
          if (priceText) {
            price = parseInt(priceText, 10);
            if (!isNaN(price)) break;
          }
        }
      }

      let imageUrl = document.querySelector('[data-marker="gallery"] img')?.src ||
                     document.querySelector('[data-marker="slider"] img')?.src ||
                     null;
      if (imageUrl && !imageUrl.startsWith('http')) {
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          imageUrl = 'https://www.dns-shop.ru' + imageUrl;
        }
      }

      //Извлечение характеристик (пример)
      const specs = {};
      //DNS хранит характеристики в отдельной вкладке или в таблице
      const specBlock = document.querySelector('[data-marker="chars"]'); //Это пример, может отличаться
      if (specBlock) {
        const specRows = specBlock.querySelectorAll('tr'); //Или dl dt/dd
        specRows.forEach(tr => {
          const th = tr.querySelector('th'); //Или dt
          const td = tr.querySelector('td'); //Или dd
          if (th && td) {
            const key = th.innerText.trim();
            const value = td.innerText.trim();
            if (key && value) {
              specs[key] = value;
            }
          }
        });
      }

      return {
        name,
        price, //Может быть null
        imageUrl, //Может быть null
        specs, //Может быть пустым объектом
      };
    });

    console.log('   Данные извлечены из DNS (puppeteer):', data);

    await browser.close();

    return {
      source: 'DNS (puppeteer)',
      name: data.name,
      price: data.price,
      imageUrl: data.imageUrl,
      sourceUrl: url,
      specs: data.specs
    };

  } catch (error) {
    if (browser) {
      await browser.close().catch(console.error);
    }
    console.error('   Ошибка парсинга с DNS (puppeteer):', error.message);
    throw new Error(`Ошибка парсинга с DNS (puppeteer): ${error.message}`);
  }
}

async function parseProductFromOzon(url, proxy = null) {
  console.log(`Парсим товар с OZON (puppeteer): ${url}, через proxy: ${proxy || 'нет'}`);

  let browser;
  try {
    const launchOptions = {
      headless: true, //Или false для отладки
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-features=VizDisplayRenderer',
        '--disable-features=VizDisplayCompositorGPU',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-ipc-flooding-protection',
        '--disable-background-networking',
        '--lang=ru-RU',
        '--timezone-policy=host',
        //'--proxy-server=http://your-proxy-ip:port', //Если прокси передан, можно указать здесь
        //'--user-data-dir=/tmp/chrome-user-data', //Опционально: использовать профиль
      ],
    };

    if (proxy) {
      launchOptions.args.push(`--proxy-server=${proxy}`);
      console.log(`   Используется прокси: ${proxy}`);
    }

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Ch-Ua': '"Chromium";v="120", "Not_A Brand";v="8"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
    });

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.setViewport({ width: 1920, height: 1080 });
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      Object.defineProperty(navigator, 'languages', {
        get: () => ['ru-RU', 'ru', 'en-US', 'en'],
      });
    });
  

    console.log(`   Открываем страницу: ${url}`);
    const response = await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000, //Увеличиваем таймаут
    });

    const status = response.status();
    if (status === 401 || status === 403 || status === 429) {
      throw new Error(`OZON вернул статус ${status} - доступ запрещён или ограничение скорости. IP может быть заблокирован.`);
    } else if (!response.ok()) {
      throw new Error(`OZON вернул статус ${status} - ошибка загрузки страницы.`);
    }

  
    await page.waitForTimeout(Math.random() * 2000 + 1000);
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight / 3);
    });
    await page.waitForTimeout(Math.random() * 1000 + 500);
  

    //Ждём загрузки названия и цены (OZON часто использует динамическую загрузку)
    await page.waitForSelector('h1[data-widget="webTitle"]', { timeout: 15000 });
    await page.waitForSelector('[class*="c-price"] span, [data-widget="price"] span', { timeout: 15000 });

    const data = await page.evaluate(() => {
      const nameElement = document.querySelector('h1[data-widget="webTitle"]');
      const name = nameElement?.innerText?.trim() || 'Неизвестное название';

      let price = null;
      const priceSelectors = [
        '[class*="c-price"] span',
        '[data-widget="price"] span',
        '.ui-kit-product-price span'
      ];

      for (const sel of priceSelectors) {
        const priceEl = document.querySelector(sel);
        if (priceEl) {
          let priceText = priceEl.innerText;
          priceText = priceText.replace(/\s/g, '').replace(/[^\d]/g, '');
          if (priceText) {
            price = parseInt(priceText, 10);
            if (!isNaN(price)) break;
          }
        }
      }

      let imageUrl = document.querySelector('[data-widget="primaryImage"] img')?.src ||
                     document.querySelector('[data-widget="secondaryImage"] img')?.src ||
                     null;
      if (imageUrl && !imageUrl.startsWith('http')) {
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          imageUrl = 'https://www.ozon.ru' + imageUrl; 
        }
      }

      //Характеристики (пример)
      const specs = {};
      const specBlock = document.querySelector('[data-widget="description"]'); //Это просто пример
      if (specBlock) {
        const specRows = specBlock.querySelectorAll('table tr'); //Или dl dt/dd
        specRows.forEach(tr => {
          const th = tr.querySelector('th'); //Или dt
          const td = tr.querySelector('td'); //Или dd
          if (th && td) {
            const key = th.innerText.trim();
            const value = td.innerText.trim();
            if (key && value) {
              specs[key] = value;
            }
          }
        });
      }

      return {
        name,
        price, //Может быть null
        imageUrl, //Может быть null
        specs, //Может быть пустым объектом
      };
    });

    console.log('   Данные извлечены из OZON (puppeteer):', data);

    await browser.close();

    return {
      source: 'OZON (puppeteer)',
      name: data.name,
      price: data.price,
      imageUrl: data.imageUrl,
      sourceUrl: url,
      specs: data.specs
    };

  } catch (error) {
    if (browser) {
      await browser.close().catch(console.error);
    }
    console.error('   Ошибка парсинга с OZON (puppeteer):', error.message);
    throw new Error(`Ошибка парсинга с OZON (puppeteer): ${error.message}`);
  }
}

function getWebStorePuppeteerProfile(hostname) {
  const raw = String(hostname || '').toLowerCase();
  const host = raw.replace(/^www\./, '');
  if (host === 'megamarket.ru' || host.endsWith('.megamarket.ru')) {
    return { key: 'megamarket', storeName: 'MegaMarket', sourceLabel: 'Megamarket (puppeteer)' };
  }
  if (host === 'citilink.ru' || host.endsWith('.citilink.ru')) {
    return { key: 'citilink', storeName: 'Citilink', sourceLabel: 'Citilink (puppeteer)' };
  }
  if (
    host === 'regard.ru' ||
    host.endsWith('.regard.ru') ||
    host === 'redgard.ru' ||
    host.endsWith('.redgard.ru')
  ) {
    return { key: 'regard', storeName: 'Regard', sourceLabel: 'Regard / Регард (puppeteer)' };
  }
  if (host.includes('aliexpress.')) {
    return { key: 'aliexpress', storeName: 'AliExpress', sourceLabel: 'AliExpress (puppeteer)' };
  }
  return null;
}

async function parseProductFromWebStore(url, proxy = null, profile = null) {
  const hostname = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  })();
  const storeProfile = profile || getWebStorePuppeteerProfile(hostname);
  if (!storeProfile) {
    throw new Error('Домен не поддерживается веб-парсером магазинов.');
  }

  console.log(`Парсим товар (${storeProfile.key}, puppeteer): ${url}`);

  let browser;
  try {
    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor,VizDisplayRenderer,VizDisplayCompositorGPU',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-ipc-flooding-protection',
        '--disable-background-networking',
        '--lang=ru-RU,en-US',
        '--timezone-policy=host'
      ]
    };
    if (proxy) {
      launchOptions.args.push(`--proxy-server=${proxy}`);
    }

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      'Upgrade-Insecure-Requests': '1'
    });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1365, height: 900 });

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
      });
      Object.defineProperty(navigator, 'languages', {
        get: () => ['ru-RU', 'ru', 'en-US', 'en']
      });
    });

    const response = await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: storeProfile.key === 'aliexpress' ? 55000 : 45000
    });
    const status = response.status();
    if (status === 401 || status === 403 || status === 429) {
      throw new Error(`Магазин вернул статус ${status} (доступ или лимиты). При необходимости укажите прокси.`);
    }

    await page.evaluate(() =>
      window.scrollBy(0, Math.min(window.innerHeight, Math.floor(window.innerHeight * 0.6)))
    );
    await page.waitForTimeout(1200);

    await page.waitForSelector('body', { timeout: 6000 }).catch(() => {});
    if (storeProfile.key === 'citilink') {
      await page
        .waitForSelector('[data-meta-price], meta[itemprop="price"], script[type="application/ld+json"]', {
          timeout: 9000
        })
        .catch(() => {});
    }

    const data = await page.evaluate((siteKey) => {
      const normPrice = (n) =>
        typeof n === 'number' && n > 0 && n < 1e9 && Number.isFinite(n)
          ? Math.round(n)
          : null;

      const digitsFromStr = (s) => {
        if (!s) return null;
        const digits = String(s).replace(/\s/g, '').replace(/[^\d]/g, '');
        if (!digits) return null;
        const n = parseInt(digits, 10);
        return normPrice(n);
      };

      const safeJsonParse = (text) => {
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      };

      let name = '';
      let price = null;
      let imageUrl = null;
      const specs = {};

      const firstH1 = document.querySelector('h1');
      if (firstH1?.innerText) {
        name = firstH1.innerText.trim();
      }

      document.querySelectorAll('script[type="application/ld+json"]').forEach((el) => {
        const jo = safeJsonParse(el.textContent.trim());
        if (!jo) return;
        const list = Array.isArray(jo) ? jo : [jo];
        for (const obj of list) {
          const t = obj['@type'];
          const isProduct =
            t === 'Product' ||
            (Array.isArray(t) && t.includes('Product')) ||
            t === undefined ||
            t === null;
          if (obj.name && isProduct) {
            if (!name) name = String(obj.name).trim();
          }
          const offers = obj.offers || obj.Offers || null;
          if (offers) {
            const o = Array.isArray(offers) ? offers[0] : offers;
            const pRaw = o.price || o.Price || o.lowPrice || o.highPrice || o.priceSpecification?.price;
            if (!price && pRaw != null) {
              price = normPrice(Number(String(pRaw).replace(/[^\d.]/g, '')));
            }
          }
          if (!imageUrl) {
            const img = obj.image;
            imageUrl =
              typeof img === 'string'
                ? img
                : Array.isArray(img) && img[0]
                  ? img[0]
                  : typeof img?.url === 'string'
                    ? img.url
                    : null;
          }
        }
      });

      if (!price) {
        const metaPx = document.querySelector('meta[itemprop="price"]')?.getAttribute('content');
        price = digitsFromStr(metaPx);
      }
      if (!name) {
        const ogTitle =
          document.querySelector('meta[property="og:title"]')?.content ||
          document.querySelector('meta[name="twitter:title"]')?.content ||
          '';
        if (ogTitle) name = ogTitle.trim();
      }
      if (!imageUrl) {
        imageUrl =
          document.querySelector('meta[property="og:image"]')?.content ||
          document.querySelector('meta[property="og:image:url"]')?.content ||
          null;
      }

      document.querySelectorAll('table tbody tr').forEach((row) => {
        const cells = row.querySelectorAll('th, td');
        if (cells.length >= 2) {
          const k = cells[0].innerText.trim();
          const v = cells[1].innerText.trim();
          if (k.length > 1 && v.length > 0 && k.length < 120) specs[k] = v;
        }
      });

      if (siteKey === 'citilink') {
        const px = document.querySelector('[data-meta-price]')?.getAttribute('data-meta-price');
        price = price || digitsFromStr(px);
      }

      if (siteKey === 'regard') {
        const rg =
          document.querySelector('.Prices_current') ||
          document.querySelector('[class*="ProductPrice_current"]');
        price = price || digitsFromStr(rg?.innerText);
      }

      if (siteKey === 'megamarket') {
        const nextEl = document.getElementById('__NEXT_DATA__');
        if (nextEl) {
          const next = safeJsonParse(nextEl.textContent);
          if (next?.props?.pageProps) {
            const walkPrice = (o, depth) => {
              if (depth > 22 || !o || typeof o !== 'object') return null;
              for (const k of Object.keys(o)) {
                const lk = k.toLowerCase();
                if (/price|saleprice|discountprice|offerprice/i.test(k) && typeof o[k] === 'number') {
                  const n = normPrice(o[k]);
                  if (n) return n;
                }
                const r = walkPrice(o[k], depth + 1);
                if (r) return r;
              }
              return null;
            };
            const p = walkPrice(next.props.pageProps, 0);
            if (!price && p) price = p;
          }
        }
        if (!price) {
          const mm = document.querySelector(
            '[itemprop="price"][content], [itemprop="price"], [data-chp-id="goodsPriceFinal"] span'
          );
          if (mm) {
            price =
              digitsFromStr(mm.getAttribute && mm.getAttribute('content')) ||
              digitsFromStr(mm.innerText || mm.textContent);
          }
          if (!price) {
            let best = null;
            document.querySelectorAll('[class*="price"], [class*="Price"], [itemprop="price"]').forEach((el) => {
              const cand = digitsFromStr(
                (el.getAttribute && el.getAttribute('content')) || el.innerText || el.textContent || ''
              );
              if (cand && cand >= 100 && (!best || cand < best)) best = cand;
            });
            if (best) price = best;
          }
        }
      }

      if (siteKey === 'aliexpress') {
        const html = document.documentElement.innerHTML.slice(0, 400000);

        if (html && !price) {
          let mSku = html.match(/"skuAmount"\s*:\s*\{\s*"value"\s*:\s*"(\d+)"\s*\}/);
          if (!mSku) mSku = html.match(/"skuAmount"\s*:\s*\{[^}]{0,200}?"value"\s*:\s*"?(\d+)"?/);
          if (mSku?.[1]) price = digitsFromStr(mSku[1]);

          let mQuoted = html.match(/"couponPrice"\s*:\s*"(\d+[.,]\d+)/i);
          if (!mQuoted) mQuoted = html.match(/"sellPrice"\s*:\s*"([\d\s.,]+)"?/);
          if (!price && mQuoted?.[1]) price = digitsFromStr(mQuoted[1]);
        }

        if (!price) {
          price = digitsFromStr(
            document.querySelector('[product-stage] [aria-label*="Rub"]')?.getAttribute?.('aria-label')
          );
        }
        try {
          if (typeof window.runParams === 'object' && window.runParams.details) {
            const d =
              typeof window.runParams.details === 'string'
                ? safeJsonParse(window.runParams.details.toString())
                : window.runParams.details;
            if (d?.priceModule?.salePriceSimple) price = digitsFromStr(d.priceModule.salePriceSimple);
          }
        } catch (e) {
          //
        }

        try {
          if (typeof window._d_c_ === 'object' && window._d_c_.data?.root?.fields?.productInfo) {
            const pi = window._d_c_.data.root.fields.productInfo;
            const v = pi.skuPriceMap || pi.bestAmount || pi.sale_price;
            if (v?.value) price = digitsFromStr(String(v.value));
            else price = digitsFromStr(String(pi?.couponPriceFormatted || pi?.couponPriceSimple || pi?.price));
          }
        } catch (e) {
          //
        }
      }

      if (!name) {
        const t = document.title || '';
        if (t.trim()) name = t.split('|')[0].trim();
      }

      if (imageUrl && !/^https?:/i.test(imageUrl)) {
        imageUrl =
          imageUrl.startsWith('//') ? `https:${imageUrl}` : new URL(imageUrl, location.href).href;
      }

      return { name: name || 'Неизвестное название', price, imageUrl, specs };
    }, storeProfile.key);

    await browser.close();
    browser = null;

    console.log(`   Извлечено (${storeProfile.sourceLabel}):`, {
      name: data.name,
      price: data.price,
      specs: Object.keys(data.specs || {}).length
    });

    return {
      source: storeProfile.sourceLabel,
      name: data.name,
      price: data.price != null ? Math.round(Number(data.price)) : null,
      imageUrl: data.imageUrl || null,
      sourceUrl: url,
      specs: data.specs || {}
    };
  } catch (error) {
    if (browser) {
      await browser.close().catch(console.error);
    }
    console.error(`   Ошибка парсинга (${storeProfile.key}):`, error.message);
    throw new Error(`Ошибка парсинга (${storeProfile.storeName}, puppeteer): ${error.message}`);
  }
}

/*
app.post('/api/admin/parse-product', authenticateToken, requireAdminRole, async (req, res) => {
  const { url, category, proxy } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL товара обязателен.' });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (e) {
    return res.status(400).json({ error: 'Неверный формат URL.' });
  }

  let parsedData;

  if (parsedUrl.hostname.includes('dns-shop.ru')) {
    try {
      console.log(`  Парсим с DNS (puppeteer): ${url}, через proxy: ${proxy || 'нет'}`);
      parsedData = await parseProductFromDnsShop(url, proxy);
    } catch (e) {
      console.error(`Ошибка парсинга с DNS для URL ${url}:`, e.message);
      return res.status(500).json({ error: e.message }); //Возвращаем сообщение из функции
    }
  } else if (parsedUrl.hostname.includes('ozon.ru')) {
    try {
      console.log(`  Парсим с OZON (puppeteer): ${url}, через proxy: ${proxy || 'нет'}`);
      parsedData = await parseProductFromOzon(url, proxy);
    } catch (e) {
      console.error(`Ошибка парсинга с OZON для URL ${url}:`, e.message);
      return res.status(500).json({ error: e.message });
    }
  } else if (parsedUrl.hostname.includes('market.yandex.ru') || parsedUrl.hostname.includes('yandex.ru/market')) { //Проверяем hostname
    try {
      console.log(`  Парсим с Яндекс.Маркета (puppeteer): ${url}, через proxy: ${proxy || 'нет'}`);
      parsedData = await parseProductFromYandexMarket(url, proxy); //Вызываем новую функцию
    } catch (e) {
      console.error(`Ошибка парсинга с Яндекс.Маркета для URL ${url}:`, e.message);
      return res.status(500).json({ error: e.message });
    }
  } else {
    return res.status(400).json({ error: 'Поддержка сайта не реализована или не указана.' });
  }

  console.log('  Парсинг завершён, данные:', parsedData);
  res.json({
    message: 'Парсинг завершён (данные НЕ сохранены в БД)',
    parsedData: parsedData
  });
});
*/

//POST /api/admin/manual-add-product - Добавить товар вручную
app.post('/api/admin/manual-add-product', authenticateToken, requireAdminRole, async (req, res) => {
    const { name, category, description, imageUrl, specs, prices } = req.body;

    if (!name || !category) {
        return res.status(400).json({ error: 'Название и категория обязательны.' });
    }

    try {
        //Транзакция гарантирует, что либо всё сохранится, либо ничего
        const newProduct = await prisma.$transaction(async (tx) => {
            //1. Создаем основной товар
            const product = await tx.product.create({
                data: {
                    name: name.trim(),
                    category: category.trim(),
                    description: description || null,
                    imageUrl: imageUrl || null,
                    rating: 0.0,
                    isActive: true //Товар сразу активен и виден в каталоге
                }
            });

            //2. Сохраняем характеристики
            if (specs && typeof specs === 'object' && Object.keys(specs).length > 0) {
                await Promise.all(Object.entries(specs).map(([key, val]) => {
                    if (key && val) {
                        return tx.productSpec.create({
                            data: { productId: product.id, specKey: key, specValue: String(val) }
                        });
                    }
                    return null;
                }).filter(p => p !== null));
            }

            //3. Сохраняем цены И историю цен
            if (prices && Array.isArray(prices) && prices.length > 0) {
                await Promise.all(prices.map(p => {
                    const storeName = p.storeName ? p.storeName.trim() : 'Unknown';
                    const price = parseFloat(p.price);
                    
                    if (storeName && !isNaN(price)) {
                        //Сохраняем текущую цену
                        const priceRecord = tx.price.create({
                          data: { productId: product.id, storeName: storeName, price: price, url: p.url || '' }
                          });
                        //Сохраняем запись в историю
                        const historyRecord = tx.priceHistory.create({
                            data: { productId: product.id, storeName: storeName, price: price, date: new Date() }
                        });
                        return Promise.all([priceRecord, historyRecord]);
                    }
                    return null;
                }).flat().filter(p => p !== null));
            }

            return product;
        });

        console.log('✅ Товар создан:', newProduct.name);
        res.status(201).json(newProduct);

    } catch (error) {
        console.error('❌ Ошибка создания товара:', error);
        res.status(500).json({ error: 'Не удалось сохранить товар' });
    }
});


//История цен

app.get('/api/admin/price-history/:productId', authenticateToken, requireAdminRole, async (req, res) => {
  const productId = parseInt(req.params.productId, 10);

  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID.' });
  }

  try {
    const history = await prisma.priceHistory.findMany({
      where: { productId: productId },
      orderBy: { date: 'desc' } //Сортировка по дате, новые сверху
    });

    res.json(history);
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ error: 'Failed to fetch price history.' });
  }
});

//POST /api/admin/price-history - Добавить новую запись в историю цен
app.post('/api/admin/price-history', authenticateToken, requireAdminRole, async (req, res) => {
    const { productId, storeName, price, date } = req.body;

    //Валидация
    if (!productId || !storeName || typeof price !== 'number' || isNaN(price) || price < 0 || !date) {
        return res.status(400).json({ error: 'Необходимо указать productId, storeName, корректную цену (число >= 0) и дату.' });
    }
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: 'Неверный формат даты. Используйте YYYY-MM-DDTHH:mm:ss.sssZ или YYYY-MM-DD.' });
    }

    try {
        //1. Создаем запись в истории
        const newHistoryEntry = await prisma.priceHistory.create({
            data: {
                productId: productId,
                storeName: storeName,
                price: price,
                date: parsedDate
            }
        });

        //2. Синхронизируем текущую цену (таблица Price) с новой исторической записью
        //Ищем, есть ли уже запись о цене для этого товара в этом магазине
        const existingPrice = await prisma.price.findFirst({
            where: {
                productId: productId,
                storeName: storeName
            }
        });

        if (existingPrice) {
            //Если запись есть — обновляем цену и дату записи
            await prisma.price.update({
                where: { id: existingPrice.id },
                data: { 
                    price: price, 
                    recordedAt: new Date() //Обновляем время фиксации цены
                }
            });
        } else {
            //Если записи нет — создаем новую (первоначальная цена)
            await prisma.price.create({
                data: {
                    productId: productId,
                    storeName: storeName,
                    price: price,
                    url: '', //Пустая ссылка по умолчанию, так как в форме истории её нет
                    recordedAt: new Date()
                }
            });
        }

        res.status(201).json({ message: 'Price history entry added and current price updated.', entry: newHistoryEntry });
    } catch (error) {
        console.error('Error adding price history entry:', error);
        res.status(500).json({ error: 'Failed to add price history entry.' });
    }
});

//PUT /api/admin/price-history/:id - Обновить запись в истории цен
app.put('/api/admin/price-history/:id', authenticateToken, requireAdminRole, async (req, res) => {
  const historyId = parseInt(req.params.id, 10);
  const { storeName, price, date } = req.body; //Обновляем только storeName, price, date

  if (isNaN(historyId) || !storeName || typeof price !== 'number' || isNaN(price) || price < 0 || !date) {
    return res.status(400).json({ error: 'History ID, Store Name, Price (number >= 0), and Date are required.' });
  }

  try {
    const updatedEntry = await prisma.priceHistory.update({
      where: { id: historyId },
       data:{
        storeName: storeName.trim(),
        price: price,
        date: new Date(date)
      }
    });

    res.json({ message: 'Price history entry updated.', entry: updatedEntry });
  } catch (error) {
    console.error('Error updating price history entry:', error);
    //Может быть P2025 если запись не найдена
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Price history entry not found.' });
    }
    res.status(500).json({ error: 'Failed to update price history entry.' });
  }
});

//DELETE /api/admin/price-history/:id - Удалить запись из истории цен
app.delete('/api/admin/price-history/:id', authenticateToken, requireAdminRole, async (req, res) => {
  const historyId = parseInt(req.params.id, 10);

  if (isNaN(historyId)) {
    return res.status(400).json({ error: 'Invalid history ID.' });
  }

  try {
    await prisma.priceHistory.delete({
      where: { id: historyId }
    });

    res.json({ message: `Price history entry ID ${historyId} deleted.` });
  } catch (error) {
    console.error('Error deleting price history entry:', error);
    //Может быть P2025 если запись не найдена
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Price history entry not found.' });
    }
    res.status(500).json({ error: 'Failed to delete price history entry.' });
  }
});

app.get('/api/admin/products', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    //Загружаем продукты, возможно, с пагинацией/поиском в будущем
    //Выбираем только нужные поля
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        //imageUrl: true, //Опционально
        //rating: true,  //Опционально
        //isActive: true, //Опционально
        //createdAt: true, //Опционально
        //updatedAt: true, //Опционально
      },
      orderBy: { id: 'asc' } //Сортировка
    });

    res.json(products);

  } catch (error) {
    console.error('Error fetching products for admin:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

//POST /api/admin/products - Создать новый товар (только для администраторов)
app.post('/api/admin/products', authenticateToken, requireAdminRole, async (req, res) => {
    const { name, category, description, imageUrl, specs, prices, isActive } = req.body;
    
    //Валидация (минимальная)
    if (!name || !category) {
        return res.status(400).json({ error: 'Название и категория обязательны.' });
    }
    
    try {
        //Используем транзакцию для согласованного создания товара и связанных данных
        const newProduct = await prisma.$transaction(async (tx) => {
            //1. Создаём основной товар
            const product = await tx.product.create({
                data: {
                    name: name.trim(),
                    category: category.trim(),
                    description: description ? description.trim() : null,
                    imageUrl: imageUrl || null,
                    rating: 0.0,
                    isActive: isActive !== undefined ? isActive : true
                }
            });
            
            //2. Создаём характеристики (если есть)
            if (specs && typeof specs === 'object' && Object.keys(specs).length > 0) {
                const specEntries = Object.entries(specs);
                await Promise.all(
                    specEntries.map(([specKey, specValue]) => {
                        if (typeof specValue === 'string' && specValue.trim()) {
                            return tx.productSpec.create({
                                data: {
                                    productId: product.id,
                                    specKey: specKey.trim(),
                                    specValue: specValue.trim()
                                }
                            });
                        }
                        return null;
                    }).filter(p => p !== null)
                );
            }
            
            //3. Создаём цены (если есть)
            if (Array.isArray(prices) && prices.length > 0) {
                await Promise.all(
                    prices.map(priceEntry => {
                        if (priceEntry.storeName && typeof priceEntry.price === 'number' && priceEntry.url) {
                            return tx.price.create({
                                data: {
                                    productId: product.id,
                                    storeName: priceEntry.storeName.trim(),
                                    price: priceEntry.price,
                                    url: priceEntry.url.trim()
                                }
                            });
                        }
                        return null;
                    }).filter(p => p !== null)
                );
            }
            
            return product;
        });
        
        console.log('Новый товар создан с характеристиками и ценами:', newProduct);
        res.status(201).json(newProduct);
        
    } catch (error) {
        console.error('Ошибка создания товара:', error);
        res.status(500).json({ error: 'Не удалось создать товар: ' + error.message });
    }
});

//рекоммендации
async function getUserPreferences(userId) {
  try {
    //Получаем товары из избранного
    const favoriteProducts = await prisma.favorite.findMany({
      where: { userId: userId },
      include: {
        product: {
          select: { id: true, category: true }
        }
      }
    });

    //Получаем товары из сравнения
    const comparisonProducts = await prisma.comparison.findMany({
      where: { userId: userId },
      include: {
        product: {
          select: { id: true, category: true }
        }
      }
    });

    //Получаем товары, для которых пользователь оставлял отзывы
    const reviewedProducts = await prisma.review.findMany({
      where: { userId: userId },
      select: { productId: true, rating: true, comment: true },
      orderBy: { createdAt: 'desc' }
    });

    //Возвращаем объект с предпочтениями
    return {
      favoriteProductIds: favoriteProducts.map(fp => fp.product.id),
      favoriteCategories: [...new Set(favoriteProducts.map(fp => fp.product.category))], //Уникальные категории
      comparisonProductIds: comparisonProducts.map(cp => cp.product.id),
      comparisonCategories: [...new Set(comparisonProducts.map(cp => cp.product.category))], //Уникальные категории
      reviewedProducts: reviewedProducts //Включаем отзывы для анализа
    };

  } catch (error) {
    console.error(`[ERROR] getUserPreferences: Не удалось получить предпочтения для пользователя ID ${userId}:`, error);
    //Возвращаем пустой объект в случае ошибки
    return {
      favoriteProductIds: [],
      favoriteCategories: [],
      comparisonProductIds: [],
      comparisonCategories: [],
      reviewedProducts: []
    };
  }
}
//GET /api/recommendations/popular - Получить популярные товары (по рейтингу и количеству отзывов)
app.get('/api/recommendations/popular', authenticateToken, async (req, res) => {
  try {
    const { category, sort = 'views_desc' } = req.query;
    
    //1. Получаем топ просматриваемых ID
    const topViews = await prisma.viewLog.groupBy({
      by: ['productId'],
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: 100 //Берём с запасом для фильтрации
    });

    //2. Загружаем товары
    const products = await prisma.product.findMany({
      where: { isActive: true, id: { in: topViews.map(v => v.productId) } },
      include: { prices: { orderBy: { price: 'asc' }, take: 1 }, specs: true, _count: { select: { reviews: { where: { isApproved: true } } } } }
    });

    //3. Добавляем метрики и фильтруем
    let result = products.map(p => ({
      ...p,
      viewCount: topViews.find(v => v.productId === p.id)?._count.productId || 0
    }));

    if (category && category !== 'all') {
      result = result.filter(p => p.category === category);
    }

    //4. Сортируем
    if (sort === 'price_asc') result.sort((a, b) => (a.prices[0]?.price || Infinity) - (b.prices[0]?.price || Infinity));
    else if (sort === 'rating_desc') result.sort((a, b) => b.rating - a.rating);
    else result.sort((a, b) => b.viewCount - a.viewCount); //По умолчанию по просмотрам

    res.json(result.slice(0, 12));
  } catch (error) {
    console.error('Error popular:', error);
    res.status(500).json({ error: 'Failed to fetch popular' });
  }
});

//GET /api/recommendations/trending - Получить трендовые товары (например, недавно добавленные или с растущим рейтингом)
app.get('/api/recommendations/trending', authenticateToken, async (req, res) => {
    try {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const trending = await prisma.viewLog.groupBy({
            by: ['productId'],
            _count: { productId: true },
            where: { viewedAt: { gte: weekAgo } },
            orderBy: { _count: { productId: 'desc' } },
            take: 20
        });

        //Если трендов нет — показываем новинки
        if (trending.length < 5) {
            const newProducts = await prisma.product.findMany({
                where: { isActive: true },
                include: {
                    prices: { orderBy: { price: 'asc' }, take: 1 },
                    specs: true
                },
                orderBy: { createdAt: 'desc' }, //Сортировка по дате добавления
                take: 12
            });
            return res.json(newProducts);
        }

        const productIds = trending.map(item => item.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds }, isActive: true },
            include: {
                prices: { orderBy: { price: 'asc' }, take: 1 },
                specs: true
            }
        });

        const sortedProducts = products.sort((a, b) => productIds.indexOf(a.id) - productIds.indexOf(b.id));
        res.json(sortedProducts);
    } catch (error) {
        console.error('Ошибка получения трендов:', error);
        res.status(500).json({ error: 'Failed to fetch trending products' });
    }
});

//GET /api/recommendations/best-value - Получить товары с лучшим соотношением цена/качество
app.get('/api/recommendations/best-value', authenticateToken, async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: { isActive: true },
            include: {
                prices: { orderBy: { price: 'asc' }, take: 1 },
                _count: { select: { reviews: { where: { isApproved: true } } } }
            }
        });
        const catAvg = {};
        products.forEach(p => {
            const price = p.prices[0]?.price;
            if (price) {
                if (!catAvg[p.category]) catAvg[p.category] = [];
                catAvg[p.category].push(price);
            }
        });
        Object.keys(catAvg).forEach(cat => {
            const prices = catAvg[cat];
            catAvg[cat] = prices.reduce((a, b) => a + b, 0) / prices.length;
        });
        const valueProducts = products.map(p => {
            const minPrice = p.prices[0]?.price || catAvg[p.category] || 10000;
            const avgCatPrice = catAvg[p.category] || minPrice;
            const priceRatio = minPrice / avgCatPrice;
            const reviews = p._count.reviews;
            //Скор выгоды: чем выше рейтинг/отзывы и чем ниже цена относительно категории, тем лучше
            const score = (p.rating * (Math.log2(reviews + 1) + 1)) / (priceRatio + 0.5);
            return { ...p, valueScore: parseFloat(score.toFixed(2)) };
        });
        valueProducts.sort((a, b) => b.valueScore - a.valueScore);
        res.json(valueProducts.slice(0, 12));
    } catch (error) {
        console.error('Error best-value:', error);
        res.status(500).json({ error: 'Failed to fetch best-value' });
    }
});

//GET /api/recommendations/personal - Получить персонализированные рекомендации
app.get('/api/recommendations/personal', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const views = await prisma.viewLog.findMany({
            where: { userId, viewedAt: { gte: monthAgo } },
            orderBy: { viewedAt: 'desc' },
            select: { productId: true }
        });
        const viewedIds = [...new Set(views.map(v => v.productId).filter(Boolean))];
        if (viewedIds.length === 0) {
            return res.json(await prisma.product.findMany({
                where: { isActive: true },
                include: { prices: { orderBy: { price: 'asc' }, take: 1 } },
                orderBy: { rating: 'desc' },
                take: 12
            }));
        }

        const viewedProductsRaw = await prisma.product.findMany({
            where: { isActive: true, id: { in: viewedIds } },
            include: { prices: { orderBy: { price: 'asc' } } }
        });

        const viewedOrder = new Map(viewedIds.map((id, index) => [id, index]));
        const viewedProducts = viewedProductsRaw
            .sort((a, b) => (viewedOrder.get(a.id) ?? 9999) - (viewedOrder.get(b.id) ?? 9999))
            .slice(0, 6)
            .map(product => ({
                ...product,
                recommendationType: 'viewed',
                similarityScore: 1,
                personalScore: 100
            }));

        const candidateProducts = await prisma.product.findMany({
            where: { isActive: true, id: { notIn: viewedIds } },
            include: { prices: { orderBy: { price: 'asc' } } }
        });

        const similarCandidates = candidateProducts
            .map(product => {
                const maxSimilarity = viewedProductsRaw.reduce((best, viewed) => {
                    return Math.max(best, calculateSimilarity(viewed, product));
                }, 0);
                const ratingComponent = Math.min(1, (product.rating || 0) / 5);
                const personalScore = (maxSimilarity * 0.75 + ratingComponent * 0.25) * 100;

                return {
                    ...product,
                    recommendationType: 'similar',
                    similarityScore: parseFloat(maxSimilarity.toFixed(3)),
                    personalScore: parseFloat(personalScore.toFixed(1))
                };
            })
            .filter(product => product.similarityScore >= 0.2)
            .sort((a, b) => b.personalScore - a.personalScore);

        const recommendations = [];
        const seenIds = new Set();

        for (const product of viewedProducts) {
            if (!seenIds.has(product.id)) {
                seenIds.add(product.id);
                recommendations.push(product);
            }
            if (recommendations.length >= 12) break;
        }

        for (const product of similarCandidates) {
            if (!seenIds.has(product.id)) {
                seenIds.add(product.id);
                recommendations.push(product);
            }
            if (recommendations.length >= 12) break;
        }

        if (recommendations.length < 12) {
            const fallbackProducts = await prisma.product.findMany({
                where: {
                    isActive: true,
                    id: { notIn: Array.from(seenIds) }
                },
                include: { prices: { orderBy: { price: 'asc' }, take: 1 } },
                orderBy: { rating: 'desc' },
                take: 12 - recommendations.length
            });

            fallbackProducts.forEach(product => {
                recommendations.push({
                    ...product,
                    recommendationType: 'fallback',
                    similarityScore: 0,
                    personalScore: parseFloat((((product.rating || 0) / 5) * 40).toFixed(1))
                });
            });
        }

        res.json(recommendations.slice(0, 12));
    } catch (error) {
        console.error('Error personal:', error);
        res.status(500).json({ error: 'Failed to fetch personal' });
    }
});

app.get('/api/recommendations/price-drops', authenticateToken, async (req, res) => {
    try {
        const daysAgo = 14;
        const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        const history = await prisma.priceHistory.findMany({
            where: { date: { gte: startDate } },
            orderBy: { date: 'asc' }
        });
        const productStoreHistory = {};
        history.forEach(h => {
            const key = `${h.productId}_${h.storeName}`;
            if (!productStoreHistory[key]) productStoreHistory[key] = [];
            productStoreHistory[key].push({ date: h.date, price: h.price });
        });
        const droppedProducts = {};
        for (const [key, records] of Object.entries(productStoreHistory)) {
            if (records.length < 2) continue;
            const oldPrice = records[0].price;
            const newPrice = records[records.length - 1].price;
            if (oldPrice > 0 && newPrice < oldPrice) {
                const dropPercent = ((oldPrice - newPrice) / oldPrice) * 100;
                if (dropPercent >= 5) {
                    const prodId = parseInt(key.split('_')[0]);
                    if (!droppedProducts[prodId] || dropPercent > droppedProducts[prodId].dropPercent) {
                        droppedProducts[prodId] = { dropPercent: parseFloat(dropPercent.toFixed(1)), oldPrice, newPrice };
                    }
                }
            }
        }
        if (Object.keys(droppedProducts).length === 0) return res.json([]);
        const prodIds = Object.keys(droppedProducts).map(Number);
        const products = await prisma.product.findMany({
            where: { isActive: true, id: { in: prodIds } },
            include: { prices: { orderBy: { price: 'asc' }, take: 1 } }
        });
        const result = products.map(p => ({ ...p, priceDrop: droppedProducts[p.id] || null }));
        result.sort((a, b) => (b.priceDrop?.dropPercent || 0) - (a.priceDrop?.dropPercent || 0));
        res.json(result.slice(0, 12));
    } catch (error) {
        console.error('Error price-drops:', error);
        res.status(500).json({ error: 'Failed to fetch price drops' });
    }
});

//Вспомогательная функция для расчёта схожести товаров (упрощённый пример)
function calculateSimilarity(productA, productB) {
  if (!productA || !productB) return 0;

  let score = 0;
  let totalWeight = 0;

  totalWeight += 0.35;
  if (productA.category && productA.category === productB.category) {
    score += 0.35;
  }

  const specsA = productA.specs && typeof productA.specs === 'object' ? productA.specs : {};
  const specsB = productB.specs && typeof productB.specs === 'object' ? productB.specs : {};
  const commonSpecKeys = Object.keys(specsA).filter(key => key in specsB);

  if (commonSpecKeys.length > 0) {
    let specMatches = 0;
    commonSpecKeys.forEach(key => {
      const valA = String(specsA[key] ?? '').trim().toLowerCase();
      const valB = String(specsB[key] ?? '').trim().toLowerCase();
      if (!valA || !valB) return;
      if (valA === valB || valA.includes(valB) || valB.includes(valA)) {
        specMatches += 1;
      }
    });
    totalWeight += 0.4;
    score += 0.4 * (specMatches / commonSpecKeys.length);
  }

  const minPriceA = productA.prices?.length > 0 ? productA.prices[0].price : null;
  const minPriceB = productB.prices?.length > 0 ? productB.prices[0].price : null;
  if (minPriceA && minPriceB && minPriceA > 0 && minPriceB > 0) {
    const diffPercent = Math.abs(minPriceA - minPriceB) / Math.max(minPriceA, minPriceB);
    const priceSimilarity = Math.max(0, 1 - diffPercent);
    totalWeight += 0.25;
    score += 0.25 * priceSimilarity;
  }

  return totalWeight > 0 ? score / totalWeight : 0;
}


//Редактирование профиля
app.patch('/api/profile', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { fullName } = req.body;

  if (fullName !== undefined && (typeof fullName !== 'string' || fullName.trim().length === 0)) {
    return res.status(400).json({ error: 'Полное имя должно быть непустой строкой.' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
       data:{
        fullName: fullName ? fullName.trim() : undefined
      }
    });

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    });

  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.post('/api/change-password', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || typeof oldPassword !== 'string') {
    return res.status(400).json({ error: 'Старый пароль обязателен.' });
  }
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ error: 'Новый пароль должен быть строкой длиной не менее 8 символов.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден.' });
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isOldPasswordValid) {
      return res.status(400).json({ error: 'Неверный старый пароль.' });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
       data:{
        passwordHash: newHashedPassword
      }
    });

    res.json({ message: 'Пароль успешно изменён.' });

  } catch (error) {
    console.error('Ошибка смены пароля:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //Путь к папке для сохранения файлов (относительно корня сервера)
    cb(null, 'uploads/avatars/'); 
  },
  filename: function (req, file, cb) {
    //Генерируем уникальное имя файла
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    //Сохраняем с оригинальным расширением
    cb(null, req.user.id + '_' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  //Разрешаем только изображения
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Недопустимый тип файла. Только изображения разрешены.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 //5MB limit
  },
  fileFilter: fileFilter
});

app.put('/api/profile/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  const userId = req.user.id;

  //Проверяем, был ли загружен файл
  if (!req.file) {
   
    return res.status(400).json({ error: 'Файл аватара обязателен.' });
  }

  const avatarPath = req.file.path; //Относительный путь к файлу, например, 'uploads/avatars/userId_timestamp.ext'

  try {
    //Обновляем поле avatarUrl в БД
    //Предположим, в схеме Prisma у модели User есть поле avatarUrl String?
    const updatedUser = await prisma.user.update({
      where: { id: userId },
       data:{
        avatarUrl: avatarPath //Сохраняем путь к файлу
      }
    });

    //Возвращаем обновлённые данные пользователя
    res.json({
      message: 'Аватар успешно обновлён.',
      updatedUser: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        avatarUrl: updatedUser.avatarUrl, //Возвращаем новый URL
        role: updatedUser.role
      }
    });

  } catch (error) {
    console.error('Ошибка смены аватара:', error);
    //Удаляем загруженный файл, если обновление в БД не удалось
    if (req.file && req.file.path) {
      const fs = require('fs');
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Ошибка удаления файла после ошибки БД:', unlinkErr);
        }
      });
    }
    //Возвращаем 500 ошибку
    res.status(500).json({ error: 'Failed to change avatar' });
  }
});

//Обрабатывает ошибки, возникающие в middleware multer (например, fileFilter, limits)
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Размер файла превышает лимит.' });
    }
    //Другие ошибки Multer, если нужно
    return res.status(400).json({ error: error.message });
  } else if (error.message.includes('Недопустимый тип файла')) { //Проверка по сообщению из fileFilter
    return res.status(400).json({ error: error.message });
  }
  //Если ошибка не от Multer, передаём дальше
  next(error);
});

app.get('/api/test-fetch', authenticateToken, requireAdminRole, async (req, res) => {
  const { url, proxy } = req.query; //Получаем URL и proxy из query параметров

  if (!url) {
    return res.status(400).json({ error: 'Параметр URL обязателен.' });
  }

  try {
    console.log(`[TEST FETCH] Запрашиваем HTML для: ${url}, через proxy: ${proxy || 'нет'}`);

  
    const axiosConfig = {
      method: 'GET',
      url: url,
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Chromium";v="120", "Not_A Brand";v="8"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 30000, //30 секунд
      //Добавляем gzip декомпрессию 
      decompress: true,
    };

    if (proxy) {
      const HttpsProxyAgent = require('https-proxy-agent'); //npm install https-proxy-agent
      axiosConfig.httpsAgent = new HttpsProxyAgent(proxy);
      console.log(`   Используется прокси для axios: ${proxy}`);
    }
    

    const response = await axios(axiosConfig);

    if (response.status === 401 || response.status === 403 || response.status === 429) {
      throw new Error(`Сайт вернул статус ${response.status} - доступ запрещён или ограничение скорости.`);
    } else if (!response.ok) {
      throw new Error(`Сайт вернул статус ${response.status} - ошибка загрузки страницы.`);
    }

    const html = response.data; 

    console.log(`[TEST FETCH] HTML получен, длина: ${html.length}`);

    
    const $ = cheerio.load(html);

    
    let parsedData = {};
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes('dns-shop.ru')) {
      console.log('[TEST FETCH]  Парсим как DNS-шоп (через cheerio)...');
      
      const nameElement = $('h1[data-state="product-title"]'); //Пример селектора
      parsedData.name = nameElement.text().trim() || 'Неизвестное название';

      let price = null;
      //DNS часто использует динамическую загрузку цены
      //Попробуем найти в script тегах или в скрытых контейнерах
      const scripts = $('script');
      let priceFoundInScript = false;
      scripts.each((i, script) => {
        const scriptContent = $(script).html();
        //Ищем примеры паттернов в содержимом script
        if (scriptContent.includes('price') && !priceFoundInScript) {
        
          const priceMatch = scriptContent.match(/"price"\s*:\s*(\d+)/);
          if (priceMatch) {
            price = parseInt(priceMatch[1], 10);
            priceFoundInScript = true;
          }
        }
      });

      //Если не нашли в script, пробуем в DOM
      if (!price) {
        const priceSelectors = [
          '[data-marker="price"] span',
          '.current-price span',
          '.price-value span'
        ];
        for (const sel of priceSelectors) {
          const priceEl = $(sel);
          if (priceEl.length) {
            let priceText = priceEl.first().text();
            priceText = priceText.replace(/\s/g, '').replace(/[^\d]/g, '');
            if (priceText) {
              price = parseInt(priceText, 10);
              if (!isNaN(price)) break;
            }
          }
        }
      }
      parsedData.price = price; //Может быть null

      let imageUrl = $('[data-marker="gallery"] img').first().attr('src') ||
                     $('[data-marker="slider"] img').first().attr('src') ||
                     null;
      if (imageUrl && !imageUrl.startsWith('http')) {
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          imageUrl = 'https://www.dns-shop.ru' + imageUrl;
        }
      }
      parsedData.imageUrl = imageUrl; //Может быть null

      //Извлечение характеристик 
      parsedData.specs = {};
      //DNS хранит характеристики часто в отдельной вкладке или динамически
      //Попробуем найти в DOM, если они есть
      const specBlock = $('[data-marker="chars"]'); //Пример
      if (specBlock.length) {
        specBlock.find('tr').each((i, row) => { //Или dl dt/dd
          const th = $(row).find('th'); //Или dt
          const td = $(row).find('td'); //Или dd
          if (th.length && td.length) {
            const key = th.text().trim();
            const value = td.text().trim();
            if (key && value) {
              parsedData.specs[key] = value;
            }
          }
        });
      }
      parsedData.source = 'DNS (fetch+cheerio)';
      parsedData.sourceUrl = url;

    } else if (parsedUrl.hostname.includes('ozon.ru')) {
      console.log('[TEST FETCH]  Парсим как OZON (через cheerio)...');

      const nameElement = $('h1[data-widget="webTitle"]'); //Пример селектора
      parsedData.name = nameElement.text().trim() || 'Неизвестное название';

      let price = null;
      //OZON также часто использует динамическую загрузку
      //Попробуем найти в script тегах
      const scripts = $('script');
      let priceFoundInScript = false;
      scripts.each((i, script) => {
        const scriptContent = $(script).html();
        if (scriptContent.includes('price') && !priceFoundInScript) {
          //Здесь нужно писать сложную логику поиска цены в JS-объектах
          //Пример грубого поиска:
          const priceMatch = scriptContent.match(/"price"\s*:\s*(\d+)/);
          if (priceMatch) {
            price = parseInt(priceMatch[1], 10);
            priceFoundInScript = true;
          }
        }
      });

      //Если не нашли в script, пробуем в DOM
      if (!price) {
        const priceSelectors = [
          '[class*="c-price"] span',
          '[data-widget="price"] span',
          '.ui-kit-product-price span'
        ];
        for (const sel of priceSelectors) {
          const priceEl = $(sel);
          if (priceEl.length) {
            let priceText = priceEl.first().text();
            priceText = priceText.replace(/\s/g, '').replace(/[^\d]/g, '');
            if (priceText) {
              price = parseInt(priceText, 10);
              if (!isNaN(price)) break;
            }
          }
        }
      }
      parsedData.price = price; //Может быть null

      let imageUrl = $('[data-widget="primaryImage"] img').first().attr('src') ||
                     $('[data-widget="secondaryImage"] img').first().attr('src') ||
                     null;
      if (imageUrl && !imageUrl.startsWith('http')) {
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          imageUrl = 'https://www.ozon.ru' + imageUrl;
        }
      }
      parsedData.imageUrl = imageUrl; //Может быть null

      //Извлечение характеристик
      parsedData.specs = {};
      //OZON часто хранит в отдельной вкладке или динамически
      const specBlock = $('[data-widget="description"]'); //Пример
      if (specBlock.length) {
        specBlock.find('table tr').each((i, row) => { //Или dl dt/dd
          const th = $(row).find('th'); //Или dt
          const td = $(row).find('td'); //Или dd
          if (th.length && td.length) {
            const key = th.text().trim();
            const value = td.text().trim();
            if (key && value) {
              parsedData.specs[key] = value;
            }
          }
        });
      }
      parsedData.source = 'OZON (fetch+cheerio)';
      parsedData.sourceUrl = url;

    } else {
      return res.status(400).json({ error: 'Поддержка сайта не реализована или не указана.' });
    }
   

    console.log('[TEST FETCH]  Данные извлечены (через cheerio):', parsedData);

    
    res.json({
      success: true,
      message: 'Парсинг завершён (данные НЕ сохранены в БД) - FETCH+CHEERIO',
      parsedData: parsedData
    });

  } catch (error) {
    console.error('[TEST FETCH]  Ошибка парсинга (fetch+cheerio):', error.message);
    res.status(500).json({ error: `Ошибка парсинга (fetch+cheerio): ${error.message}` });
  }
});


app.get('/api/test-parse', authenticateToken, requireAdminRole, async (req, res) => {
  const testUrl = 'https://httpbin.org/html';
  console.log(`Тестируем парсинг с puppeteer: ${testUrl}`);

  let browser;
  try {
    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-features=VizDisplayRenderer',
        '--disable-features=VizDisplayCompositorGPU',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-ipc-flooding-protection',
        '--disable-background-networking',
        '--lang=ru-RU',
        '--timezone-policy=host',
      ],
    };

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Ch-Ua': '"Chromium";v="120", "Not_A Brand";v="8"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['ru-RU', 'ru', 'en-US', 'en'] });
    });

    console.log(`   Открываем тестовую страницу: ${testUrl}`);
    const response = await page.goto(testUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    const status = response.status();
    if (status === 401 || status === 403 || status === 429) {
      throw new Error(`Тестовый сайт вернул статус ${status}. IP может быть заблокирован или сайт защищён.`);
    } else if (!response.ok()) {
      throw new Error(`Тестовый сайт вернул статус ${status}. Ошибка загрузки страницы.`);
    }

    await page.evaluate(async () => {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
      window.scrollBy(0, window.innerHeight / 3);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    });

    const data = await page.evaluate(() => {
      const title = document.title;
      const h1Element = document.querySelector('h1');
      const h1Text = h1Element ? h1Element.innerText : 'Заголовок не найден';
      return { title: title, h1: h1Text };
    });

    console.log('   Данные извлечены из тестовой страницы (puppeteer):', data);

    await browser.close();

    res.json({
      message: 'Тестовый парсинг завершён успешно (данные НЕ сохранены в БД)',
      parsedData: data
    });

  } catch (error) {
    if (browser) {
      await browser.close().catch(console.error);
    }
    console.error('   Ошибка тестового парсинга (puppeteer):', error.message);
    res.status(500).json({ error: `Ошибка тестового парсинга (puppeteer): ${error.message}` });
  }
});

function coerceApiSystemsPrice(value) {
    if (value == null || value === '') return null;
    const n = typeof value === 'number' ? value : parseFloat(String(value).replace(/\s/g, '').replace(',', '.'));
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.round(n);
}

function coerceMarketParserPrice(value) {
    if (value == null || value === '') return null;
    const n = typeof value === 'number' ? value : parseFloat(String(value).replace(/\s/g, '').replace(',', '.'));
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.round(n);
}

function normalizeComparableUrl(urlString) {
    try {
        const u = new URL(urlString);
        const host = u.hostname.replace(/^www\./i, '').toLowerCase();
        const path = (u.pathname || '').replace(/\/+$/, '').toLowerCase();
        return `${host}${path}`;
    } catch {
        return null;
    }
}

const MARKETPARSER_API_KEY = process.env.MARKETPARSER_API_KEY || null;
const MARKETPARSER_BASE_URL = process.env.MARKETPARSER_BASE_URL || 'https://cp2.marketparser.ru/api/v2';
const marketParserCampaignCache = new Map();

function getMarketParserSourceKeyForHost(hostname) {
    const raw = String(hostname || '').toLowerCase().replace(/^www\./, '');

    if (raw.includes('dns-shop.ru')) return 'dns';
    if (raw.includes('ozon.ru')) return 'ozon';
    if (raw === 'megamarket.ru' || raw.endsWith('.megamarket.ru')) return 'megamarket';
    if (raw.includes('mvideo.ru') || raw.includes('m-video.ru')) return 'mvideo';
    if (raw.includes('avito.ru')) return 'avito';

    return null;
}

function isMarketParserHostSupported(hostname) {
    return !!getMarketParserSourceKeyForHost(hostname);
}

function getMarketParserCampaignIdFromEnvBySource(sourceKey) {
    if (sourceKey === 'dns') return process.env.MARKETPARSER_CAMPAIGN_ID_DNS || null;
    if (sourceKey === 'ozon') return process.env.MARKETPARSER_CAMPAIGN_ID_OZON || null;
    if (sourceKey === 'megamarket') return process.env.MARKETPARSER_CAMPAIGN_ID_MEGAMARKET || null;
    if (sourceKey === 'mvideo') return process.env.MARKETPARSER_CAMPAIGN_ID_MVIDEO || null;
    if (sourceKey === 'avito') return process.env.MARKETPARSER_CAMPAIGN_ID_AVITO || null;
    return null;
}

function getStoreNameForHost(hostname) {
    const raw = String(hostname || '').toLowerCase().replace(/^www\./, '');
    if (raw.includes('dns-shop.ru')) return 'DNS';
    if (raw.includes('ozon.ru')) return 'OZON';
    if (raw === 'megamarket.ru' || raw.endsWith('.megamarket.ru')) return 'MegaMarket';
    if (raw.includes('mvideo.ru') || raw.includes('m-video.ru')) return 'MVideo';
    if (raw.includes('avito.ru')) return 'Avito';
    if (raw.includes('citilink.ru')) return 'Citilink';
    if (raw.includes('regard.ru') || raw.includes('redgard.ru')) return 'Regard';
    if (raw.includes('aliexpress.')) return 'AliExpress';
    if (raw.includes('wildberries.ru') || raw.includes('wb.ru')) return 'Wildberries';
    if (raw.includes('market.yandex.ru') || raw.includes('yandex.ru')) return 'Yandex Market';
    if (raw.includes('ebay.')) return 'eBay';
    return null;
}

async function resolveMarketParserCampaignIdForHost(hostname) {
    const sourceKey = getMarketParserSourceKeyForHost(hostname);
    if (!sourceKey) return null;

    const envCampaignId = getMarketParserCampaignIdFromEnvBySource(sourceKey);
    if (envCampaignId) return String(envCampaignId).trim();

    if (marketParserCampaignCache.has(sourceKey)) {
        return marketParserCampaignCache.get(sourceKey);
    }

    const campaignsData = await marketParserRequest('GET', '/campaigns.json', { timeout: 20000 });
    const campaigns = campaignsData?.response?.campaigns || [];
    const list = Array.isArray(campaigns) ? campaigns : [];
    if (!list.length) return null;

    const keywordMap = {
        dns: ['dns', 'днс'],
        ozon: ['ozon', 'озон'],
        megamarket: ['megamarket', 'mega market', 'мегамаркет', 'сбермегамаркет'],
        mvideo: ['mvideo', 'm.video', 'мвидео', 'м.видео'],
        avito: ['avito', 'авито']
    };
    const kws = keywordMap[sourceKey] || [];

    const matched = list.find((c) => {
        const nm = String(c?.name || '').toLowerCase();
        return kws.some((kw) => nm.includes(kw));
    });

    const id = matched?.id != null ? String(matched.id) : null;
    if (id) marketParserCampaignCache.set(sourceKey, id);
    return id;
}

async function marketParserRequest(method, path, { params = undefined, data = undefined, timeout = 20000 } = {}) {
    if (!MARKETPARSER_API_KEY) {
        throw new Error('MARKETPARSER_API_KEY не задан. Добавьте ключ в переменные окружения.');
    }
    const url = `${MARKETPARSER_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    try {
        const res = await axios.request({
            method,
            url,
            params,
            data,
            timeout,
            headers: {
                'Api-Key': MARKETPARSER_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        return res.data;
    } catch (e) {
        const status = e?.response?.status;
        const payload = e?.response?.data;
        const message = payload?.message || e?.message || 'Ошибка MarketParser';
        if (status) throw new Error(`MarketParser HTTP ${status}: ${message}`);
        throw new Error(`MarketParser: ${message}`);
    }
}

async function marketParserWaitCampaignPriceProcessed(campaignId, { timeoutMs = 90000, pollMs = 2500 } = {}) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
        const info = await marketParserRequest('GET', `/campaigns/${campaignId}/price.json`, { timeout: 20000 });
        const isOk = !!(info?.response?.isSuccessfullyProcessed ?? info?.response?.price?.isSuccessfullyProcessed);
        if (isOk) return true;
        await delay(pollMs);
    }
    throw new Error('MarketParser: прайс кампании не обработан вовремя (timeout).');
}

async function marketParserWaitReportFinished(campaignId, reportId, { timeoutMs = 120000, pollMs = 2500 } = {}) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
        const info = await marketParserRequest('GET', `/campaigns/${campaignId}/reports/${reportId}.json`, { timeout: 20000 });
        const r = info?.response || null;
        if (r?.isSuccessfullyFinished) return r;
        if (r?.status === 'ERROR') throw new Error('MarketParser: отчёт завершился со статусом ERROR.');
        await delay(pollMs);
    }
    throw new Error('MarketParser: отчёт не завершился вовремя (timeout).');
}

function coerceSpecsFromMarketParserProduct(product) {
    if (!product || typeof product !== 'object') return {};
    const candidates = [
        product.specs,
        product.properties,
        product.params,
        product.characteristics,
        product.attributes,
        product.features,
        product.details
    ].filter(Boolean);

    for (const c of candidates) {
        if (c && typeof c === 'object' && !Array.isArray(c)) return c;
        if (Array.isArray(c)) {
            const out = {};
            for (const item of c) {
                const k = item?.name || item?.key || item?.title;
                const v = item?.value || item?.val || item?.text;
                if (k && v != null) out[String(k).trim()] = String(v).trim();
            }
            if (Object.keys(out).length) return out;
        }
    }

    const custom = product.custom;
    if (custom && typeof custom === 'object' && !Array.isArray(custom)) {
        const maybe = custom.specs || custom.properties || custom.params || null;
        if (maybe && typeof maybe === 'object') return maybe;
    }

    return {};
}

function coerceImageUrlFromMarketParserProduct(product) {
    if (!product || typeof product !== 'object') return null;
    const candidates = [
        product.imageUrl,
        product.image_url,
        product.image,
        product.picture,
        product.photo,
        product.previewImage,
        product.preview_image,
        product.prev_image
    ].filter(Boolean);
    for (const c of candidates) {
        if (typeof c === 'string' && c.trim()) return c.trim();
        if (Array.isArray(c) && c[0] && typeof c[0] === 'string') return c[0];
    }
    if (Array.isArray(product.photos) && product.photos[0]?.url) return product.photos[0].url;
    return null;
}

function coerceNameFromMarketParserProduct(product, fallbackUrl) {
    const raw = product?.name || product?.title || product?.productName || product?.product_name || null;
    if (raw && typeof raw === 'string') {
        const t = raw.trim();
        if (t && (!fallbackUrl || t !== fallbackUrl)) return t;
    }
    return null;
}

function coercePriceFromMarketParserProduct(product) {
    if (!product || typeof product !== 'object') return null;
    const direct = coerceMarketParserPrice(
        product.price ??
            product.currentPrice ??
            product.salePrice ??
            product.minPrice ??
            product.min_price ??
            product.medianPrice ??
            product.averagePrice
    );
    if (direct) return direct;

    const offers = Array.isArray(product.offers) ? product.offers : [];
    const offerPrices = offers
        .map((o) => coerceMarketParserPrice(o?.price ?? o?.salePrice ?? o?.currentPrice))
        .filter((n) => n != null);
    if (offerPrices.length) return Math.min(...offerPrices);
    return null;
}

async function fetchProductFromMarketParserByUrl(urlString, { timeoutMs = 180000 } = {}) {
    let parsedUrl;
    try {
        parsedUrl = new URL(urlString);
    } catch {
        throw new Error('Некорректный URL');
    }

    const host = parsedUrl.hostname.toLowerCase();
    const campaignId = await resolveMarketParserCampaignIdForHost(host);
    if (!campaignId) {
        throw new Error(
            `Для домена ${host} не найдена кампания MarketParser. Укажите MARKETPARSER_CAMPAIGN_ID_* в .env или создайте кампанию с понятным названием (OZON/DNS/MegaMarket/MVideo/Avito), чтобы автоопределение сработало.`
        );
    }

    const ourId = normalizeComparableUrl(urlString) || urlString;

    await marketParserRequest('POST', `/campaigns/${campaignId}/price.json`, {
        timeout: 30000,
        data: {
            products: [
                {
                    name: urlString,
                    id: ourId,
                    custom: { source_url: urlString }
                }
            ]
        }
    });

    await marketParserWaitCampaignPriceProcessed(campaignId, { timeoutMs: Math.min(timeoutMs, 120000), pollMs: 2500 });

    const report = await marketParserRequest('POST', `/campaigns/${campaignId}/reports.json`, { timeout: 20000, data: {} });
    const reportId = report?.response?.id || report?.response?.report?.id || null;
    if (!reportId) throw new Error('MarketParser: не удалось получить reportId при создании отчёта.');

    await marketParserWaitReportFinished(campaignId, reportId, { timeoutMs, pollMs: 2500 });

    const results = await marketParserRequest('GET', `/campaigns/${campaignId}/reports/${reportId}/results.json`, {
        timeout: 30000,
        params: { per_page: 100 }
    });

    const products = results?.response?.products || results?.response?.items || results?.response || [];
    const list = Array.isArray(products) ? products : [];
    const product =
        list.find((p) => String(p?.ourId || p?.our_id || '').trim() === String(ourId).trim()) ||
        list.find((p) => normalizeComparableUrl(p?.custom?.source_url || '') === normalizeComparableUrl(urlString)) ||
        list[0] ||
        null;

    if (!product) throw new Error('MarketParser: результаты отчёта пустые.');

    const name = coerceNameFromMarketParserProduct(product, urlString);
    const price = coercePriceFromMarketParserProduct(product);
    const imageUrl = coerceImageUrlFromMarketParserProduct(product);
    const specs = coerceSpecsFromMarketParserProduct(product);

    return {
        source: 'MarketParser',
        name: name || null,
        price,
        imageUrl: imageUrl || null,
        sourceUrl: urlString,
        specs: specs || {}
    };
}

async function fetchPriceFromApiSystemsByUrl(urlString) {
    const modelInfo = extractModelIdFromUrl(urlString);
    if (!modelInfo?.id) {
        throw new Error('Не удалось извлечь ID товара из ссылки (нужна карточка Яндекс.Маркета или Wildberries).');
    }
    if (modelInfo.source === 'wildberries') {
        const wbOfferData = await fetchWildberriesOfferPriceFromApiSystems(modelInfo.id, urlString);
        return {
            price: wbOfferData.price,
            parsedName: wbOfferData.parsedName,
            source: modelInfo.source
        };
    }
    const data = await fetchProductSpecsFromApiSystems(modelInfo.id, modelInfo.source);
    return {
        price: coerceApiSystemsPrice(data.price),
        parsedName: data.name || null,
        source: modelInfo.source
    };
}

async function fetchWildberriesOfferPriceFromApiSystems(modelId, requestedUrl = null) {
    if (!API_SYSTEMS_KEY) {
        throw new Error('API_KEY для API Systems не найден в переменных окружения.');
    }

    const offersUrl = `http://wb.apisystem.name/models/${modelId}/offers`;
    const response = await axios.get(offersUrl, {
        params: {
            api_key: API_SYSTEMS_KEY,
            format: 'json',
            count: 10,
            page: 1
        },
        timeout: 10000
    });

    if (response.status !== 200) {
        throw new Error(`API Systems WB offers вернул статус ${response.status}`);
    }

    const payload = response.data || {};
    if (payload.status !== 'OK') {
        throw new Error(`API Systems WB offers вернул ошибку: ${payload.status || 'UNKNOWN'}`);
    }

    const offers = Array.isArray(payload.offers) ? payload.offers : [];
    let price = coerceApiSystemsPrice(payload.price_min) || coerceApiSystemsPrice(payload.price_avg);
    let parsedName = null;

    if (offers.length > 0) {
        const requestedNorm = requestedUrl ? normalizeComparableUrl(requestedUrl) : null;
        let offer = null;

        if (requestedNorm) {
            offer = offers.find((o) => normalizeComparableUrl(o.url || o.product_url) === requestedNorm) || null;
        }
        if (!offer && requestedNorm) {
            offer = offers.find((o) => {
                const n = normalizeComparableUrl(o.url || o.product_url);
                return n && (n.includes(requestedNorm) || requestedNorm.includes(n));
            }) || null;
        }
        if (!offer) {
            offer = offers.find((o) => coerceApiSystemsPrice(o.price_wb_pay) || coerceApiSystemsPrice(o.price)) || offers[0];
        }

        price = price || coerceApiSystemsPrice(offer.price_wb_pay) || coerceApiSystemsPrice(offer.price);
        parsedName = offer.offer_name || null;
    }

    return { price, parsedName };
}

async function requestEbayAccessTokenForBase(baseUrl) {
    const credentials = Buffer.from(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`).toString('base64');
    let lastError = null;
    for (const scope of EBAY_OAUTH_SCOPES) {
        try {
            const response = await axios.post(
                `${baseUrl}/identity/v1/oauth2/token`,
                new URLSearchParams({
                    grant_type: 'client_credentials',
                    scope
                }).toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Authorization: `Basic ${credentials}`
                    },
                    timeout: 15000
                }
            );
            return {
                token: response.data.access_token,
                expiresInMs: Number(response.data.expires_in || 7200) * 1000,
                base: baseUrl
            };
        } catch (e) {
            lastError = e;
            if (e?.response?.data?.error !== 'invalid_scope') {
                break;
            }
        }
    }
    throw lastError || new Error('eBay OAuth token request failed');
}

async function getEbayAccessToken() {
    if (!EBAY_CLIENT_ID || !EBAY_CLIENT_SECRET) {
        throw new Error('EBAY_CLIENT_ID и EBAY_CLIENT_SECRET не заданы в .env');
    }
    const now = Date.now();
    if (ebayTokenCache.token && ebayTokenCache.base && now < ebayTokenCache.expiresAt - 60000) {
        return { token: ebayTokenCache.token, base: ebayTokenCache.base };
    }

    const preferred = EBAY_BASE;
    const sandboxCreds = isLikelySandboxEbayCredentials(EBAY_CLIENT_ID, EBAY_CLIENT_SECRET);
    const preferredResolved = preferred || (sandboxCreds ? EBAY_SANDBOX_BASE : 'https://api.ebay.com');
    const baseByCreds = sandboxCreds ? EBAY_SANDBOX_BASE : 'https://api.ebay.com';
    const allowSandboxFallback = String(process.env.EBAY_ALLOW_SANDBOX_FALLBACK || 'false').toLowerCase() === 'true';
    const initial = preferredResolved === EBAY_SANDBOX_BASE ? EBAY_SANDBOX_BASE : baseByCreds;
    const fallback = initial === EBAY_SANDBOX_BASE ? 'https://api.ebay.com' : EBAY_SANDBOX_BASE;
    const candidates = [initial, ...(allowSandboxFallback ? [fallback] : [])];

    let lastError = null;
    for (const baseUrl of candidates) {
        try {
            const tokenData = await requestEbayAccessTokenForBase(baseUrl);
            ebayTokenCache = {
                token: tokenData.token,
                expiresAt: now + tokenData.expiresInMs,
                base: baseUrl
            };
            console.log('[eBay] OAuth token acquired for base:', baseUrl);
            return { token: tokenData.token, base: baseUrl };
        } catch (err) {
            lastError = err;
            console.warn(
                '[eBay] Token request failed for base:',
                baseUrl,
                err.response?.status || err.message,
                `(clientIdLen=${String(EBAY_CLIENT_ID || '').length}, secretLen=${String(EBAY_CLIENT_SECRET || '').length})`
            );
        }
    }
    const details = lastError?.response?.data ? JSON.stringify(lastError.response.data) : (lastError?.message || 'unknown');
    throw new Error(`eBay OAuth failed for prod/sandbox. ${details}`);
}

function coerceNumberPrice(priceLike) {
    if (priceLike == null) return null;
    const raw = typeof priceLike === 'number' ? String(priceLike) : String(priceLike).replace(',', '.');
    const n = Number(raw.replace(/[^\d.]/g, ''));
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.round(n);
}

function normalizeCurrencyCode(raw) {
    const codeRaw = String(raw || '').trim();
    if (!codeRaw) return 'RUB';

    const code = codeRaw.toUpperCase();
    // символы / варианты названий валют
    if (code.includes('₽') || code === 'RUR' || code === 'RUB' || code.includes('RUB')) return 'RUB';
    if (code.includes('USD') || code.includes('US$')) return 'USD';
    if (code.includes('EUR')) return 'EUR';
    if (code.includes('CNY') || code.includes('YUAN')) return 'CNY';
    if (code.includes('KZT')) return 'KZT';
    if (code.includes('BYN')) return 'BYN';

    return code;
}

function convertToRub(amount, currency = 'RUB') {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return null;
    const code = normalizeCurrencyCode(currency);
    if (code === 'RUB') return Math.round(value);

    const rates = {
        USD: Number(process.env.FX_USD_RUB || 92),
        EUR: Number(process.env.FX_EUR_RUB || 100),
        CNY: Number(process.env.FX_CNY_RUB || 12.7),
        KZT: Number(process.env.FX_KZT_RUB || 0.19),
        BYN: Number(process.env.FX_BYN_RUB || 28.5)
    };
    const rate = rates[code];
    if (!Number.isFinite(rate) || rate <= 0) {
        // Если API внезапно прислал неизвестный код валюты, но цена выглядит валидной,
        // не даём “пропасть” офферу — считаем, что это RUB.
        console.warn(`[FX] Неизвестная валюта '${currency}' (норм: ${code}). Считаю как RUB.`);
        return Math.round(value);
    }
    return Math.round(value * rate);
}

function extractStoreSignalsFromOffer(offer = {}) {
    const rating = Number(offer.rating ?? offer.score ?? offer.storeRating ?? NaN);
    const reviewsCount = Number(offer.reviewsCount ?? offer.review_count ?? offer.reviews ?? NaN);
    const stock =
        Number(offer.stock ?? offer.quantity ?? offer.qty ?? offer.availableQuantity ?? offer.availabilityCount ?? NaN);

    return {
        rating: Number.isFinite(rating) ? Math.max(0, Math.min(5, rating)) : null,
        reviewsCount: Number.isFinite(reviewsCount) && reviewsCount >= 0 ? Math.round(reviewsCount) : null,
        stock: Number.isFinite(stock) && stock >= 0 ? Math.round(stock) : null
    };
}

function transliterateRuToLat(text) {
    const map = {
        а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
        к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
        х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya'
    };
    return String(text || '')
        .toLowerCase()
        .split('')
        .map((ch) => (Object.prototype.hasOwnProperty.call(map, ch) ? map[ch] : ch))
        .join('');
}

function extractEbayLegacyItemIdFromUrl(urlString) {
    try {
        const parsed = new URL(urlString);
        const pathname = parsed.pathname || '';
        const direct = pathname.match(/\/itm\/(?:[^/]+\/)?(\d+)/i);
        if (direct?.[1]) return direct[1];
        const alt = pathname.match(/\/(\d{9,})/);
        if (alt?.[1]) return alt[1];
        return parsed.searchParams.get('item') || null;
    } catch {
        return null;
    }
}

function mapEbayItemToUnified(item) {
    const aspects = {};
    const localizedAspects = Array.isArray(item?.localizedAspects) ? item.localizedAspects : [];
    for (const aspect of localizedAspects) {
        const key = String(aspect?.name || '').trim();
        const vals = Array.isArray(aspect?.value) ? aspect.value : [];
        const value = vals.filter(Boolean).join(', ').trim();
        if (key && value) aspects[key] = value;
    }
    return {
        source: 'eBay API',
        name: item?.title || null,
        price: coerceNumberPrice(item?.price?.value),
        imageUrl: item?.image?.imageUrl || item?.thumbnailImages?.[0]?.imageUrl || null,
        sourceUrl: item?.itemWebUrl || null,
        specs: aspects
    };
}

async function searchEbayItems(query, limit = 5) {
    const { token, base } = await getEbayAccessToken();
    const response = await axios.get(`${base}/buy/browse/v1/item_summary/search`, {
        params: {
            q: query,
            limit: Math.min(Math.max(parseInt(limit, 10) || 5, 1), 20),
            filter: 'buyingOptions:{FIXED_PRICE}'
        },
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
        },
        timeout: 20000
    });
    return Array.isArray(response?.data?.itemSummaries) ? response.data.itemSummaries : [];
}

async function fetchEbayProductByUrlOrQuery({ url = null, query = null }) {
    const itemId = url ? extractEbayLegacyItemIdFromUrl(url) : null;
    const { token, base } = await getEbayAccessToken();

    if (itemId) {
        const detailResp = await axios.get(`${base}/buy/browse/v1/item/get_item_by_legacy_id`, {
            params: { legacy_item_id: itemId },
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
            },
            timeout: 20000
        });
        return mapEbayItemToUnified(detailResp.data || {});
    }

    if (!query || !String(query).trim()) {
        throw new Error('Для eBay не удалось извлечь item_id из URL и не передан query.');
    }

    const found = await searchEbayItems(String(query).trim(), 1);
    const first = found[0];
    if (!first) {
        throw new Error('eBay не вернул результатов по запросу.');
    }

    return {
        source: 'eBay API',
        name: first.title || null,
        price: convertToRub(first?.price?.value, first?.price?.currency || 'USD'),
        imageUrl: first?.image?.imageUrl || null,
        sourceUrl: first?.itemWebUrl || url || null,
        specs: {}
    };
}

function buildPricesApiHeaderVariants() {
    const k = String(PRICESAPI_KEY || '').trim();
    const variants = [{ 'x-api-key': k }];
    variants.push({ Authorization: `Bearer ${k}` });
    return variants;
}

async function requestPricesApiGet(pathname, params, timeoutMs) {
    let lastErr = null;
    for (const headers of buildPricesApiHeaderVariants()) {
        try {
            return await axios.get(`${PRICESAPI_BASE}${pathname}`, {
                params,
                headers,
                timeout: timeoutMs
            });
        } catch (e) {
            lastErr = e;
            const code = e?.response?.data?.error?.code || '';
            const message = String(e?.response?.data?.error?.message || '');
            const authIssue = code === 'VALIDATION_ERROR' || /api key/i.test(message);
            if (!authIssue) break;
        }
    }
    throw lastErr;
}

async function searchProductsInPricesApi(query, country = PRICESAPI_DEFAULT_COUNTRY, limit = 5) {
    if (!PRICESAPI_KEY) {
        throw new Error('PRICESAPI_KEY не задан в .env');
    }
    try {
        const requestParams = {
            q: query,
            country,
            limit: Math.min(Math.max(parseInt(limit, 10) || 5, 1), 10)
        };
        const response = await requestPricesApiGet('/products/search', requestParams, 30000);
        const ok = !!response?.data?.success;
        if (!ok) {
            const msg = response?.data?.error?.message || response?.data?.message || 'unknown';
            throw new Error(`PricesAPI search: not success. ${msg}`);
        }
        return Array.isArray(response.data?.data?.results) ? response.data.data.results : [];
    } catch (err) {
        const status = err.response?.status;
        const data = err.response?.data;
        const code = data?.error?.code || null;
        const supported = Array.isArray(data?.error?.supported) ? data.error.supported : null;
        console.error('[PricesAPI search] ERROR', {
            status,
            country,
            query: query ? String(query).slice(0, 120) : null,
            code,
            supported,
            data
        });

        if (status === 404 && code === 'SEARCH_EMPTY') {
            console.warn('[PricesAPI search] No results for query:', query ? String(query).slice(0, 120) : null);
            return [];
        }

        // COUNTRY_NOT_SUPPORTED: выбираем рабочую страну из supported (или fallback на US/DE)
        if (status === 400 && code === 'COUNTRY_NOT_SUPPORTED') {
            const preferences = ['us', 'de', 'gb', 'pl', 'fr'];
            const supportedLower = (supported || []).map((c) => String(c).toLowerCase());
            const pick =
                supportedLower.find((c) => c === PRICESAPI_DEFAULT_COUNTRY) ||
                preferences.find((p) => supportedLower.includes(p)) ||
                supportedLower[0] ||
                'us';

            console.warn('[PricesAPI search] Retry with supported country:', pick);
            const response2 = await requestPricesApiGet('/products/search', {
                q: query,
                country: pick,
                limit: Math.min(Math.max(parseInt(limit, 10) || 5, 1), 10)
            }, 30000);
            if (response2?.data?.success) {
                return Array.isArray(response2.data?.data?.results) ? response2.data.data.results : [];
            }
        }

        throw err;
    }
}

async function fetchPricesApiOffers(productId, country = PRICESAPI_DEFAULT_COUNTRY) {
    if (!PRICESAPI_KEY) {
        throw new Error('PRICESAPI_KEY не задан в .env');
    }
    try {
        const response = await requestPricesApiGet(`/products/${productId}/offers`, { country }, 60000);
        if (!response?.data?.success) {
            const msg = response?.data?.error?.message || response?.data?.message || 'unknown';
            throw new Error(`PricesAPI offers: not success. ${msg}`);
        }
        return Array.isArray(response.data?.data?.offers) ? response.data.data.offers : [];
    } catch (err) {
        const status = err.response?.status;
        const data = err.response?.data;
        const code = data?.error?.code || null;
        const supported = Array.isArray(data?.error?.supported) ? data.error.supported : null;
        console.error('[PricesAPI offers] ERROR', {
            status,
            country,
            productId,
            code,
            supported,
            data
        });

        if (status === 400 && code === 'COUNTRY_NOT_SUPPORTED') {
            const preferences = ['us', 'de', 'gb', 'pl', 'fr'];
            const supportedLower = (supported || []).map((c) => String(c).toLowerCase());
            const pick =
                supportedLower.find((c) => c === PRICESAPI_DEFAULT_COUNTRY) ||
                preferences.find((p) => supportedLower.includes(p)) ||
                supportedLower[0] ||
                'us';

            console.warn('[PricesAPI offers] Retry with supported country:', pick);
            const response2 = await requestPricesApiGet(`/products/${productId}/offers`, { country: pick }, 60000);
            if (response2?.data?.success) {
                return Array.isArray(response2.data?.data?.offers) ? response2.data.data.offers : [];
            }
        }

        throw err;
    }
}

function mapPricesApiOffersToUnified(offers = []) {
    const list = Array.isArray(offers) ? offers : [];
    return list
        .map((o) => {
            const priceRub = convertToRub(o.price, o.currency || 'RUB');
            return {
                storeName: o.merchant || o.store || o.source || 'PricesAPI',
                priceRub,
                url: o.url || o.link || '',
                source: 'PricesAPI.io',
                originalPrice: coerceNumberPrice(o.price),
                originalCurrency: normalizeCurrencyCode(o.currency || 'RUB'),
                storeSignals: extractStoreSignalsFromOffer(o)
            };
        })
        .filter((o) => o.priceRub != null);
}

function pickBestPricesApiOffer(offers, requestedUrl = null) {
    const list = Array.isArray(offers) ? offers : [];
    const requestedNorm = requestedUrl ? normalizeComparableUrl(requestedUrl) : null;
    if (!list.length) return null;

    if (requestedNorm) {
        const exact = list.find((o) => normalizeComparableUrl(o.url || o.link || '') === requestedNorm);
        if (exact) return exact;
    }
    const withPrice = list
        .map((o) => ({ raw: o, p: coerceNumberPrice(o.price) }))
        .filter((x) => x.p != null)
        .sort((a, b) => a.p - b.p);
    return withPrice.length ? withPrice[0].raw : list[0];
}

async function fetchPricesApiProductByUrlOrQuery({ url = null, query = null, country = PRICESAPI_DEFAULT_COUNTRY }) {
    const normalizeQuery = (q) => String(q || '')
        .replace(/\([^)]*\)/g, ' ')
        .replace(/\+/g, ' ')
        .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const queries = [];
    if (url && String(url).trim()) queries.push(String(url).trim());
    if (query && String(query).trim()) {
        const raw = String(query).trim();
        const cleaned = normalizeQuery(raw);
        const transliterated = transliterateRuToLat(cleaned || raw);
        const compactModel = (cleaned || raw)
            .split(' ')
            .filter((part) => part.length > 1)
            .slice(0, 5)
            .join(' ');
        queries.push(raw);
        if (cleaned && cleaned !== raw) queries.push(cleaned);
        if (transliterated && transliterated !== cleaned && transliterated !== raw) queries.push(transliterated);
        if (compactModel && compactModel !== raw && compactModel !== cleaned) queries.push(compactModel);
    }
    const uniqueQueries = Array.from(new Set(queries.filter(Boolean)));
    if (!uniqueQueries.length) {
        throw new Error('Для PricesAPI требуется URL или query.');
    }

    let product = null;
    const countryCandidates = Array.from(new Set([country, PRICESAPI_DEFAULT_COUNTRY, ...PRICESAPI_FALLBACK_COUNTRIES].filter(Boolean)));
    for (const candidateQuery of uniqueQueries) {
        for (const countryCode of countryCandidates) {
            const results = await searchProductsInPricesApi(candidateQuery, countryCode, 5);
            product = results[0] || null;
            if (product?.id) {
                console.log('[PricesAPI] matched query candidate:', candidateQuery.slice(0, 120), 'country:', countryCode);
                country = countryCode;
                break;
            }
        }
        if (product?.id) break;
    }
    if (!product?.id) {
        throw new Error('PricesAPI не вернул подходящий товар (SEARCH_EMPTY).');
    }
    const offers = await fetchPricesApiOffers(product.id, country);
    const bestOffer = pickBestPricesApiOffer(offers, url);
    return {
        source: 'PricesAPI.io',
        name: product.title || null,
        price: convertToRub(bestOffer?.price, bestOffer?.currency || 'RUB'),
        imageUrl: product.image || null,
        sourceUrl: bestOffer?.url || bestOffer?.link || null,
        specs: {},
        priceStoreName: bestOffer?.merchant || bestOffer?.store || bestOffer?.source || 'PricesAPI',
        priceSource: 'PricesAPI.io'
    };
}

async function collectApiOffersForProduct({ productName, sourceUrl = null, country = PRICESAPI_DEFAULT_COUNTRY }) {
    const rows = [];

    if (sourceUrl) {
        try {
            const u = new URL(sourceUrl);
            const host = String(u.hostname || '').toLowerCase();
            if (host.includes('wildberries.ru') || host.includes('wb.ru') || host.includes('market.yandex.ru') || host.includes('yandex.ru')) {
                const api = await fetchPriceFromApiSystemsByUrl(sourceUrl);
                if (api?.price != null) {
                    const storeName = host.includes('wildberries.ru') || host.includes('wb.ru') ? 'Wildberries' : 'Yandex Market';
                    rows.push({
                        storeName,
                        price: coerceNumberPrice(api.price),
                        url: sourceUrl,
                        source: 'API Systems',
                        parsedName: api.parsedName || null,
                        storeSignals: { rating: null, reviewsCount: null, stock: null }
                    });
                }
            }
        } catch {
            // ignore invalid URL, continue with name-based APIs
        }
    }

    if (productName && EBAY_CLIENT_ID && EBAY_CLIENT_SECRET) {
        try {
            const ebayItems = await searchEbayItems(productName, 3);
            const best = ebayItems
                .map((item) => ({
                    item,
                    rub: convertToRub(item?.price?.value, item?.price?.currency || 'USD')
                }))
                .filter((x) => x.rub != null)
                .sort((a, b) => a.rub - b.rub)[0];
            if (best) {
                const sellerRatingPct = Number(best.item?.seller?.feedbackPercentage ?? NaN);
                const sellerRating5 = Number.isFinite(sellerRatingPct) ? Math.max(0, Math.min(5, sellerRatingPct / 20)) : null;
                const sellerReviews = Number(best.item?.seller?.feedbackScore ?? NaN);
                const stockCount = Number(best.item?.estimatedAvailabilities?.[0]?.estimatedAvailableQuantity ?? NaN);
                rows.push({
                    storeName: 'eBay',
                    price: best.rub,
                    url: best.item?.itemWebUrl || '',
                    source: 'eBay API',
                    parsedName: best.item?.title || null,
                    storeSignals: {
                        rating: Number.isFinite(sellerRating5) ? sellerRating5 : null,
                        reviewsCount: Number.isFinite(sellerReviews) ? Math.round(sellerReviews) : null,
                        stock: Number.isFinite(stockCount) ? Math.round(stockCount) : null
                    }
                });
            }
        } catch (e) {
            console.warn('[PRICE SYNC] eBay API by name:', e.message);
        }
    }

    if (PRICESAPI_KEY && (productName || sourceUrl)) {
        try {
            const searchQuery = productName || sourceUrl;
            const pricesCountry = country || PRICESAPI_DEFAULT_COUNTRY;
            const products = await searchProductsInPricesApi(searchQuery, pricesCountry, 1);
            const first = products[0];
            if (first?.id) {
                const offers = await fetchPricesApiOffers(first.id, pricesCountry);
                const mapped = mapPricesApiOffersToUnified(offers);
                console.log('[PricesAPI by name] ', {
                    searchQuery: searchQuery ? String(searchQuery).slice(0, 80) : null,
                    country: pricesCountry,
                    productId: first.id,
                    offersCount: Array.isArray(offers) ? offers.length : 0,
                    mappedCount: Array.isArray(mapped) ? mapped.length : 0
                });
                for (const offer of mapped) {
                    rows.push({
                        storeName: offer.storeName,
                        price: offer.priceRub,
                        url: offer.url,
                        source: offer.source,
                        parsedName: first.title || productName || null,
                        storeSignals: offer.storeSignals || { rating: null, reviewsCount: null, stock: null }
                    });
                }
            }
        } catch (e) {
            console.warn('[PRICE SYNC] PricesAPI by name/url:', e.message);
        }
    }

    const dedup = new Map();
    for (const row of rows) {
        const key = `${String(row.storeName || '').toLowerCase()}::${normalizeComparableUrl(row.url || '') || ''}`;
        if (!dedup.has(key)) dedup.set(key, row);
    }
    return Array.from(dedup.values());
}

//--- Автообновление цен по ссылкам магазинов (DNS / Ozon / Яндекс.Маркет / Wildberries) ---
async function fetchParsedPriceForStoreUrl(url, proxy = null, context = {}) {
  if (!url || typeof url !== 'string') {
    throw new Error('Пустая ссылка');
  }
  const trimmed = url.trim();
  let parsedUrl;
  try {
    parsedUrl = new URL(trimmed);
  } catch {
    throw new Error('Некорректный URL');
  }
  const host = parsedUrl.hostname.toLowerCase();
  const contextProductName = context?.productName ? String(context.productName).trim() : null;
  const contextCountry = context?.country ? String(context.country).trim() : PRICESAPI_DEFAULT_COUNTRY;

  if (host.includes('wildberries.ru') || host.includes('wb.ru')) {
    const api = await fetchPriceFromApiSystemsByUrl(trimmed);
    return {
      price: api.price,
      parsedName: api.parsedName,
      source: 'API Systems (wildberries)',
      storeName: 'Wildberries',
      storeSignals: { rating: null, reviewsCount: null, stock: null }
    };
  }
  if (host.includes('market.yandex.ru') || (host.includes('yandex.ru') && (parsedUrl.pathname.includes('/card/') || parsedUrl.pathname.includes('/product--')))) {
    let parsedName = null;
    let price = null;
    let source = 'API Systems / Яндекс.Маркет';
    try {
      const api = await fetchPriceFromApiSystemsByUrl(trimmed);
      price = api.price;
      parsedName = api.parsedName;
    } catch (e) {
      console.warn('[PRICE SYNC] API Systems (Я.М):', e.message);
    }

    // Старое рабочее поведение: если API Systems не вернул цену — пробуем цену со страницы.
    if (price == null) {
      try {
        const htmlPrice = await extractPriceFromYandexMarket(trimmed);
        if (htmlPrice != null) {
          price = Math.round(Number(htmlPrice));
          source = 'Яндекс Маркет (страница)';
        }
      } catch (e) {
        console.warn('[PRICE SYNC] Я.М HTML fallback failed:', e.message);
      }
    }
    return {
      price: Number.isFinite(price) ? price : null,
      parsedName,
      source,
      storeName: 'Yandex Market',
      storeSignals: { rating: null, reviewsCount: null, stock: null }
    };
  }
  if (host.includes('ebay.')) {
    const ebayData = await fetchEbayProductByUrlOrQuery({
      url: trimmed,
      query: contextProductName || null
    });
    return {
      price: coerceNumberPrice(ebayData.price),
      parsedName: ebayData.name || null,
      source: 'eBay API',
      storeName: 'eBay',
      storeSignals: { rating: null, reviewsCount: null, stock: null }
    };
  }

  try {
    const pricesApiData = await fetchPricesApiProductByUrlOrQuery({
      url: trimmed,
      query: contextProductName || null,
      country: contextCountry
    });
    if (pricesApiData.price != null) {
      return {
        price: pricesApiData.price,
        parsedName: pricesApiData.name || null,
        source: 'PricesAPI.io',
        storeName: pricesApiData.priceStoreName || 'PricesAPI',
        storeSignals: { rating: null, reviewsCount: null, stock: null }
      };
    }
  } catch (e) {
    console.warn('[PRICE SYNC] PricesAPI fallback:', e.message);
  }

  throw new Error(
    `Не удалось получить цену по API для домена (${host}). Поддерживаются API-источники: Яндекс.Маркет, Wildberries, eBay, PricesAPI.`
  );
}

async function collectPriceSyncResults(options = {}) {
  const {
    productIds = null,
    maxStores = PRICE_SYNC_MAX_PREVIEW,
    proxy = null,
    throttleDelay = PRICE_SYNC_DELAY_MS
  } = options;

  const where = { isActive: true };
  if (Array.isArray(productIds) && productIds.length > 0) {
    const ids = productIds.map((id) => parseInt(id, 10)).filter((n) => !isNaN(n));
    if (ids.length) where.id = { in: ids };
  }

  const products = await prisma.product.findMany({
    where,
    include: { prices: true },
    orderBy: { id: 'asc' }
  });

  const results = [];
  let processed = 0;

  outer: for (const product of products) {
    const apiOfferRows = await collectApiOffersForProduct({
      productName: product.name,
      sourceUrl: product.prices?.[0]?.url || null,
      country: PRICESAPI_DEFAULT_COUNTRY
    });
    const existingByStore = new Map(
      (product.prices || []).map((p) => [String(p.storeName || '').toLowerCase(), p])
    );

    for (const offer of apiOfferRows) {
      if (processed >= maxStores) break outer;

      // Чтобы не дублировать уже существующие строки цен (WB/ЯМ и т.д.),
      // API-офферы добавляем только для магазинов, которых ещё нет в БД у товара.
      const offerKey = String(offer.storeName || '').toLowerCase();
      const existing = existingByStore.get(offerKey) || null;
      if (existing) continue;

      results.push({
        productId: product.id,
        productName: product.name,
        priceId: existing?.id || null,
        storeName: offer.storeName,
        url: offer.url || existing?.url || '',
        oldPrice: existing?.price ?? null,
        newPrice: offer.price,
        status: offer.price != null ? 'ok' : 'error',
        message: offer.price != null ? null : 'API не вернул цену',
        parsedName: offer.parsedName || null,
        source: offer.source || 'API',
        storeSignals: offer.storeSignals || null
      });
      processed += 1;
      if (throttleDelay > 0) await delay(throttleDelay);
    }

    for (const priceRow of product.prices) {
      if (processed >= maxStores) break outer;

      const base = {
        productId: product.id,
        productName: product.name,
        priceId: priceRow.id,
        storeName: priceRow.storeName,
        url: priceRow.url,
        oldPrice: priceRow.price
      };

      if (!priceRow.url || !String(priceRow.url).trim()) {
        results.push({ ...base, newPrice: null, status: 'skipped', message: 'Нет ссылки на карточку магазина' });
        continue;
      }

      try {
        const parsed = await fetchParsedPriceForStoreUrl(String(priceRow.url).trim(), proxy, {
          productName: product.name,
          country: PRICESAPI_DEFAULT_COUNTRY
        });
        processed += 1;
        if (throttleDelay > 0) await delay(throttleDelay);

        if (parsed.price == null || !Number.isFinite(parsed.price)) {
          results.push({
            ...base,
            newPrice: null,
            status: 'error',
            message: 'Цена на странице не найдена (сайт/API не вернул цену)',
            parsedName: parsed.parsedName,
            storeSignals: parsed.storeSignals || null
          });
        } else {
          results.push({
            ...base,
            newPrice: parsed.price,
            status: 'ok',
            message: null,
            parsedName: parsed.parsedName,
            storeSignals: parsed.storeSignals || null
          });
        }
      } catch (err) {
        processed += 1;
        if (throttleDelay > 0) await delay(throttleDelay);
        results.push({
          ...base,
          newPrice: null,
          status: 'error',
          message: err.message || String(err)
        });
      }
    }
  }

  return {
    results,
    summary: {
      total: results.length,
      ok: results.filter((r) => r.status === 'ok').length,
      error: results.filter((r) => r.status === 'error').length,
      skipped: results.filter((r) => r.status === 'skipped').length
    }
  };
}

async function applyPriceSyncResults(resultRows) {
  const toWrite = resultRows.filter((r) => r && r.status === 'ok' && r.newPrice != null);
  const now = new Date();
  let updated = 0;

  for (const row of toWrite) {
    const newPrice = Math.round(Number(row.newPrice));
    if (!Number.isFinite(newPrice) || newPrice < 0) continue;

    let priceRow = null;
    if (row.priceId) {
      priceRow = await prisma.price.findFirst({
        where: { id: row.priceId, productId: row.productId }
      });
    }
    if (!priceRow) {
      priceRow = await prisma.price.findFirst({
        where: {
          productId: row.productId,
          storeName: row.storeName
        }
      });
    }

    const txOps = [
      prisma.priceHistory.create({
        data: {
          productId: row.productId,
          storeName: row.storeName || priceRow?.storeName || 'Unknown',
          price: newPrice,
          date: now
        }
      })
    ];

    if (priceRow) {
      txOps.push(
        prisma.price.update({
          where: { id: priceRow.id },
          data: {
            price: newPrice,
            recordedAt: now,
            url: row.url || priceRow.url || ''
          }
        })
      );
    } else {
      txOps.push(
        prisma.price.create({
          data: {
            productId: row.productId,
            storeName: row.storeName || 'Unknown',
            price: newPrice,
            url: row.url || '',
            recordedAt: now
          }
        })
      );
    }

    await prisma.$transaction(txOps);
    updated += 1;

    const signals = row.storeSignals && typeof row.storeSignals === 'object' ? row.storeSignals : null;
    const hasSignals =
      signals &&
      (signals.rating != null || signals.reviewsCount != null || signals.stock != null);
    if (hasSignals) {
      const signalsState = readStoreSignals();
      const items = Array.isArray(signalsState.items) ? signalsState.items : [];
      const key = `${row.productId}:${row.storeName || priceRow?.storeName || 'Unknown'}`;
      const filtered = items.filter((i) => `${i.productId}:${i.storeName}` !== key);
      filtered.push({
        productId: row.productId,
        storeName: row.storeName || priceRow?.storeName || 'Unknown',
        rating: signals.rating ?? null,
        reviewsCount: signals.reviewsCount ?? null,
        stock: signals.stock ?? null,
        updatedAt: now.toISOString()
      });
      writeStoreSignals({ items: filtered });
    }

    const oldPriceNum = row.oldPrice != null ? Number(row.oldPrice) : null;
    const dropPct =
      oldPriceNum && oldPriceNum > 0
        ? ((oldPriceNum - newPrice) / oldPriceNum) * 100
        : 0;
    const lowStock = hasSignals && signals?.stock != null && Number(signals.stock) >= 0 && Number(signals.stock) < 10;
    if (dropPct > 5 || lowStock) {
      const favUsers = await prisma.favorite.findMany({
        where: { productId: row.productId },
        select: { userId: true }
      });
      const alerts = favUsers.map((u) => {
        const type = lowStock ? 'low_stock' : 'price_drop';
        const baseMessage = lowStock
          ? `Товар "${row.productName}" в магазине ${row.storeName || priceRow?.storeName || 'Unknown'}: осталось мало (${signals.stock}).`
          : `Товар "${row.productName}" в магазине ${row.storeName || priceRow?.storeName || 'Unknown'} подешевел на ${dropPct.toFixed(1)}%.`;
        return {
          id: `a_${Date.now()}_${u.userId}_${row.productId}_${Math.random().toString(36).slice(2, 8)}`,
          userId: u.userId,
          productId: row.productId,
          productName: row.productName,
          storeName: row.storeName || priceRow?.storeName || 'Unknown',
          type,
          message: baseMessage,
          createdAt: now.toISOString(),
          expiresAt: new Date(now.getTime() + THREE_DAYS_MS).toISOString()
        };
      });
      addUserAlerts(alerts);
    }
  }

  return { applied: updated };
}

async function runAutomaticPriceSyncJob() {
  console.log('[PRICE SYNC] Автоматический запуск...');
  const state = readPriceSyncState();
  if (state.autoSyncRunning) {
    console.log('[PRICE SYNC] Уже выполняется, пропуск.');
    return;
  }
  writePriceSyncState({ autoSyncRunning: true, autoSyncStartedAt: new Date().toISOString() });

  try {
    const proxy = process.env.PRICE_SYNC_PROXY || null;
    const { results } = await collectPriceSyncResults({
      productIds: null,
      maxStores: PRICE_SYNC_AUTO_MAX,
      proxy,
      throttleDelay: PRICE_SYNC_DELAY_MS
    });

    const okRows = results.filter((r) => r.status === 'ok');
    const applyRes = await applyPriceSyncResults(okRows);

    writePriceSyncState({
      autoSyncRunning: false,
      lastAutoSyncAt: new Date().toISOString(),
      lastAutoSyncSummary: {
        ok: okRows.length,
        applied: applyRes.applied
      },
      lastAutoSyncError: null
    });

    console.log('[PRICE SYNC] Готово:', applyRes);
  } catch (e) {
    console.error('[PRICE SYNC] Ошибка:', e);
    writePriceSyncState({
      autoSyncRunning: false,
      lastAutoSyncError: e.message || String(e)
    });
  }
}

function scheduleAutomaticPriceSyncIfDue() {
  const state = readPriceSyncState();
  if (state.autoSyncRunning) return;

  const last = state.lastAutoSyncAt ? new Date(state.lastAutoSyncAt).getTime() : 0;
  if (last && Date.now() - last < THREE_DAYS_MS) return;

  runAutomaticPriceSyncJob().catch((e) => console.error('[PRICE SYNC]', e));
}

app.get('/api/admin/prices/sync-status', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    const s = readPriceSyncState();
    res.json({
      lastAutoSyncAt: s.lastAutoSyncAt || null,
      lastAutoSyncSummary: s.lastAutoSyncSummary || null,
      lastAutoSyncError: s.lastAutoSyncError || null,
      autoSyncRunning: !!s.autoSyncRunning,
      delayMs: PRICE_SYNC_DELAY_MS,
      maxPreviewStores: PRICE_SYNC_MAX_PREVIEW,
      autoMaxStoresPerRun: PRICE_SYNC_AUTO_MAX,
      supportedHosts: [
        'dns-shop.ru',
        'ozon.ru',
        'market.yandex.ru',
        'yandex.ru',
        'wildberries.ru',
        'wb.ru',
        'ebay.com',
        'mvideo.ru',
        'm-video.ru',
        'avito.ru',
        'megamarket.ru',
        'citilink.ru',
        'regard.ru',
        'redgard.ru',
        'aliexpress.com',
        'aliexpress.ru'
      ]
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/admin/prices/sync-preview', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    const { proxy = null, productIds = null, maxStores } = req.body || {};
    const maxCap = Math.min(parseInt(maxStores, 10) || PRICE_SYNC_MAX_PREVIEW, 500);
    const data = await collectPriceSyncResults({
      productIds,
      maxStores: maxCap,
      proxy,
      throttleDelay: PRICE_SYNC_DELAY_MS
    });
    res.json({ ...data, generatedAt: new Date().toISOString() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Ошибка предпросмотра' });
  }
});

app.post('/api/admin/prices/sync-apply', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    const { results } = req.body || {};
    if (!Array.isArray(results)) {
      return res.status(400).json({ error: 'Ожидается массив results' });
    }
    const applyRes = await applyPriceSyncResults(results);
    res.json({ message: 'Цены и история обновлены', ...applyRes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/admin/prices/sync-product/:productId', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const { dryRun = false, proxy = null } = req.body || {};
    if (isNaN(productId)) return res.status(400).json({ error: 'Некорректный ID' });

    const data = await collectPriceSyncResults({
      productIds: [productId],
      maxStores: 200,
      proxy,
      throttleDelay: PRICE_SYNC_DELAY_MS
    });

    if (!dryRun) {
      const applyRes = await applyPriceSyncResults(data.results.filter((r) => r.status === 'ok'));
      return res.json({ ...data, applied: applyRes });
    }

    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/admin/manual-price-update', authenticateToken, requireAdminRole, async (req, res) => {
  runAutomaticPriceSyncJob().catch(console.error);
  res.json({
    message: `Запущено фоновое обновление (до ${PRICE_SYNC_AUTO_MAX} магазинов за проход). Интервал авто: 3 дня.`
  });
});

app.post('/api/admin/fetch-price-from-url', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    const { url } = req.body || {};
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Укажите URL карточки товара.' });
    }
    const trimmed = url.trim();
    const parsed = await fetchParsedPriceForStoreUrl(trimmed, null);
    if (parsed.price == null || !Number.isFinite(parsed.price)) {
      return res.status(422).json({
        error: 'Не удалось получить цену по ссылке (API или страница не вернули цену).',
        parsedName: parsed.parsedName || null
      });
    }
    res.json({
      price: parsed.price,
      storeName: parsed.storeName,
      parsedName: parsed.parsedName || null
    });
  } catch (e) {
    res.status(400).json({ error: e.message || String(e) });
  }
});


async function parseProductWithGPT(url, htmlContent = null) {
  console.log(`[GPT] Запрашиваем информацию о товаре через GPT для URL: ${url}`);

  const prompt = `
    Ты являешься помощником по извлечению информации о товаре из интернет-магазина.
    Ниже тебе предоставлен URL товара и (опционально) HTML-код его страницы.
    Пожалуйста, извлеки следующую информацию и верни в формате JSON:
    - name (название товара)
    - price (цена, только число, без валюты)
    - specs (объект с ключами и значениями характеристик, например, {"Цвет": "Белый", "Память": "256 ГБ"})
    Если какая-то информация отсутствует или не может быть извлечена, верни null для этого поля.
    ВАЖНО: Ответ должен быть только валидным JSON-объектом, без других пояснений.

    URL товара: ${url}

    HTML-код страницы (если предоставлен):
    ${htmlContent ? htmlContent.substring(0, 4000) : 'HTML не предоставлен'}
  `;

  try {
   
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", //Используем новую модель
      messages: [
        { "role": "system", "content": "Ты помощник по извлечению структурированной информации о товаре из интернет-магазина." },
        { "role": "user", "content": prompt }
      ],
      temperature: 0, 
      max_tokens: 1000, //Ограничиваем длину ответа
    });
    

    const responseContent = completion.choices[0].message.content.trim(); 
    console.log(`[GPT] Raw response: ${responseContent}`);

    let cleanedResponse = responseContent.replace(/```json\s*([\s\S]*?)\s*```/g, '$1').trim();
    if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.substring(3).trim();
    }
    if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.substring(0, cleanedResponse.length - 3).trim();
    }

    const parsedData = JSON.parse(cleanedResponse);
    console.log(`[GPT] Parsed structured data:`, parsedData);

    if (typeof parsedData === 'object' && parsedData !== null) {
      return {
        source: 'GPT',
        name: parsedData.name || null,
        price: parsedData.price ? parseFloat(parsedData.price) : null,
        imageUrl: null,
        sourceUrl: url,
        specs: parsedData.specs || {},
      };
    } else {
      console.error('[GPT] Ответ не является объектом:', parsedData);
      return null;
    }

  } catch (error) {
    console.error('[GPT] Ошибка при вызове API или парсинге ответа:', error.message);
    if (error.response) { 
      console.error('[GPT] Статус ошибки API (если есть):', error.status); 
      console.error('[GPT] Данные ошибки (если есть):', error.message);
    }
    return null;
  }
}

app.post('/api/admin/parse-product', authenticateToken, requireAdminRole, async (req, res) => {
    const body = req.body || {};
    const { url, category, proxy, query, productName, parseName, name, title } = body;
    const fallbackQuery = [query, productName, parseName, name, title].find((v) => typeof v === 'string' && v.trim()) || null;
    if (!url && !fallbackQuery) return res.status(400).json({ error: 'Укажите URL товара или query (название).' });

    let parsedUrl = null;
    if (url) {
        try { parsedUrl = new URL(url); } catch (e) { return res.status(400).json({ error: 'Неверный формат URL.' }); }
    }

    const host = parsedUrl?.hostname?.toLowerCase() || '';
    const isYm =
      !!host && (host.includes('market.yandex.ru') ||
      (host.includes('yandex.ru') &&
        (parsedUrl.pathname.includes('/card/') || parsedUrl.pathname.includes('/product--'))));
    const isWb = !!host && (host.includes('wildberries.ru') || host.includes('wb.ru'));
    const isEbay = !!host && host.includes('ebay.');

    console.log(`  Парсинг карточки: url=${url || 'N/A'}, query=${fallbackQuery || 'N/A'}`);

    try {
        let parsedData;

        if (isYm || isWb) {
            const modelInfo = extractModelIdFromUrl(url);
            if (!modelInfo?.id) {
                return res.status(400).json({ error: 'Не удалось извлечь ID модели из ссылки.' });
            }
            const { id: modelId, source } = modelInfo;
            console.log(`  API Systems: modelId=${modelId}, источник=${source}`);

            parsedData = await fetchProductSpecsFromApiSystems(modelId, source);
            parsedData.category = category || null;
            parsedData.sourceUrl = parsedData.sourceUrl || url;

            let marketPrice = coerceApiSystemsPrice(parsedData.price);
            if (source === 'yandex_market') {
                parsedData.priceStoreName = 'Yandex Market';
                if (marketPrice != null) {
                    parsedData.priceSource = 'Яндекс Маркет (API Systems)';
                }
            } else if (source === 'wildberries') {
                parsedData.priceStoreName = 'Wildberries';
                if (marketPrice == null) {
                    try {
                        const wbOfferPrice = await fetchPriceFromApiSystemsByUrl(url);
                        marketPrice = wbOfferPrice.price;
                    } catch (wbErr) {
                        console.warn('⚠️ Не удалось получить цену WB через offers:', wbErr.message);
                    }
                }
                parsedData.priceSource = marketPrice != null ? 'Wildberries (API Systems offers)' : null;
            }
            parsedData.price = marketPrice;
            if (marketPrice) {
                console.log(` 💰 Цена: ${marketPrice} ₽ (${parsedData.priceSource || 'источник не указан'})`);
            }
        } else if (isEbay) {
            parsedData = await fetchEbayProductByUrlOrQuery({
                url: url || null,
                query: fallbackQuery || null
            });
            parsedData.category = category || null;
            parsedData.sourceUrl = parsedData.sourceUrl || url || null;
            parsedData.priceStoreName = 'eBay';
            parsedData.priceSource = parsedData.price != null ? 'eBay API' : null;
        } else {
            parsedData = await fetchPricesApiProductByUrlOrQuery({
                url: url || null,
                query: fallbackQuery || null,
                country: PRICESAPI_DEFAULT_COUNTRY
            });
            parsedData.category = category || null;
            parsedData.sourceUrl = parsedData.sourceUrl || url || null;
        }

        if ((!parsedData.specs || !Object.keys(parsedData.specs).length) && parsedData.name) {
            try {
                const aiSpecs = await parseProductWithGroq(parsedData.name, parsedData.sourceUrl || url || null);
                if (aiSpecs?.specs && typeof aiSpecs.specs === 'object') {
                    parsedData.specs = aiSpecs.specs;
                }
            } catch (specErr) {
                console.warn('⚠️ Не удалось дополнить характеристики через GROQ:', specErr.message);
            }
        }

        const aggregatedOffers = await collectApiOffersForProduct({
            productName: parsedData.name || fallbackQuery || null,
            sourceUrl: parsedData.sourceUrl || url || null,
            country: PRICESAPI_DEFAULT_COUNTRY
        });
        parsedData.prices = aggregatedOffers.map((o) => ({
            storeName: o.storeName,
            price: o.price,
            url: o.url || '',
            source: o.source || 'API'
        }));
        if (!parsedData.price && parsedData.prices.length) {
            parsedData.price = parsedData.prices[0].price;
            parsedData.priceStoreName = parsedData.prices[0].storeName;
            parsedData.sourceUrl = parsedData.sourceUrl || parsedData.prices[0].url || null;
            parsedData.priceSource = parsedData.prices[0].source || 'API';
        }

        //НОРМАЛИЗАЦИЯ ХАРАКТЕРИСТИК (без дублей!)
        const SYNONYM_MAP = {
            screen_size: ['диагональ экрана', 'диагональ', 'размер экрана', 'экран', 'дисплей'],
            screen_resolution: ['разрешение экрана', 'разрешение дисплея'],
            screen_technology: ['тип матрицы экрана', 'тип матрицы', 'тип экрана', 'технология экрана', 'тип дисплея'],
            screen_refresh_rate: ['частота обновления экрана', 'частота обновления', 'герцовка'],
            cpu_brand: ['бренд процессора', 'производитель процессора', 'vendor cpu'],
            cpu_model: ['процессор', 'модель процессора', 'чипсет', 'soc'],
            ram_size: ['оперативная память', 'объём озу', 'оперативка', 'ram'],
            storage_capacity: ['встроенная память', 'объём памяти', 'пзу', 'накопитель'],
            rear_camera_count: ['количество задних камер', 'кол-во камер', 'число камер'],
            rear_camera_primary_mp: ['разрешение основной камеры', 'основная камера', 'главная камера'],
            rear_camera_sensor_model: ['модель сенсора камеры', 'модель матрицы', 'сенсор'],
            rear_camera_sensor_size: ['размер сенсора камеры', 'размер матрицы'],
            front_camera_mp: ['разрешение фронтальной камеры', 'фронтальная камера', 'селфи-камера'],
            battery_capacity_mah: ['ёмкость аккумулятора', 'емкость аккумулятора', 'емкость батареи', 'батарея', 'аккумулятор'],
            battery_type: ['тип аккумулятора', 'тип батареи'],
            os: ['операционная система', 'ос', 'версия ос', 'оболочка'],
            os_version: ['версия ос', 'версия операционной системы'],
            weight_g: ['вес', 'вес устройства', 'вес без упаковки', 'масса'],
            dimensions_mm: ['размеры', 'габариты', 'высота x ширина x толщина'],
            sim_slots: ['количество sim-карт', 'sim', 'сим-карты', 'лоток sim', 'количество sim'],
            connectivity: ['беспроводные интерфейсы', 'связь', 'интерфейсы', 'коммуникации'],
            water_resistance: ['степень защиты', 'влагозащита', 'защита от воды', 'ip'],
            gpu_model: ['видеокарта', 'графический адаптер', 'gpu']
        };

        const normalizeSpecs = (rawSpecs, category) => {
    const normalized = {};
    if (!rawSpecs || typeof rawSpecs !== 'object') return normalized;
    
    //Получаем словарь синонимов для выбранной категории
    const categoryMap = SYNONYM_MAP[category] || {};

    for (const [rawKey, rawValue] of Object.entries(rawSpecs)) {
        const cleanKey = rawKey.toLowerCase().trim();
        let matchedKey = null;

        //Ищем совпадение в карте категории
        if (Object.keys(categoryMap).length > 0) {
            for (const [stdKey, synonyms] of Object.entries(categoryMap)) {
                if (synonyms.some(syn => cleanKey.includes(syn.toLowerCase()))) {
                    matchedKey = stdKey;
                    break; //Берём первое совпадение, чтобы избежать дублей
                }
            }
        }

        //Если не нашли в карте, используем очищенное оригинальное название
        const finalKey = matchedKey || cleanKey.replace(/\s+/g, '_');
        
        if (rawValue && String(rawValue).trim()) {
            normalized[finalKey] = String(rawValue).replace(/<[^>]+>/g, '').trim();
        }
    }
    return normalized;
};

//Применение нормализации к данным
parsedData.specs = normalizeSpecs(parsedData.specs, category);
        console.log(' ✅ Характеристики нормализованы. Ключи:', Object.keys(parsedData.specs));

        res.json({ message: 'Парсинг завершён успешно.', parsedData });
    } catch (error) {
        console.error(' ❌ Ошибка парсинга:', error.message);
        res.status(500).json({ error: `Ошибка при получении данных: ${error.message}` });
    }
});


async function parseProductWithGroq(productName, sourceUrl = null) {
  console.log(`[GROQ-KNOWLEDGE-SPECS-UPDATED] Запрашиваем характеристики у GROQ по названию: "${productName}", URL: ${sourceUrl}`);

  //Определяем категорию по названию
  const isSmartphone = productName.toLowerCase().includes('smartfon') || productName.toLowerCase().includes('iphone') || productName.toLowerCase().includes('samsung') || productName.toLowerCase().includes('xiaomi');
  const categoryType = isSmartphone ? 'smartphones' : 'other';
  //Определяем ожидаемые ключи (аналог CATEGORY_TO_SPECS_MAP)
  const expectedSpecsMap = {
    smartphones: [
      'screen_size', 'screen_resolution', 'screen_technology', 'screen_refresh_rate',
      'cpu_brand', 'cpu_model', 'cpu_cores', 'cpu_speed',
      'ram_size', 'ram_type',
      'storage_capacity', 'storage_type',
      'rear_camera_count', 'rear_camera_primary_mp', 'rear_camera_features',
      'front_camera_count', 'front_camera_mp', 'front_camera_features',
      'battery_capacity', 'charging_type', 'wireless_charging',
      'os', 'os_version',
      'color', 'material', 'weight', 'dimensions',
      'connectivity', 'sim_card_type', 'network_support',
      'sensors', 'special_features',
      'brand', 'model'
    ]
    //Добавьте другие категории
  };
  const expectedSpecsList = expectedSpecsMap[categoryType] || [];

  const prompt = `
    Ты являешься экспертом по характеристикам электронных устройств.
    Тебе предоставлено название товара: "${productName}".
    На основе своих знаний, пожалуйста, предоставь информацию о модели.
    Верни информацию в формате JSON:
    - name (название товара, как указано или уточнённое)
    - specs (объект с ключами и значениями характеристик. Постарайся использовать КОНКРЕТНЫЕ КЛЮЧИ, перечисленные ниже, если они применимы к товару: ${expectedSpecsList.join(', ')}. Если характеристика неизвестна тебе или не применима, НЕ добавляй её в JSON или установи значение в null.)
    ВАЖНО: Не включай цены или информацию о магазинах в этот JSON.
    Если какая-то информация неизвестна тебе, опусти соответствующее поле или установи его значение в null.
    ВАЖНО: Ответ должен содержать ТОЛЬКО валидный JSON-объект, без других пояснений, комментариев или текста ДО или ПОСЛЕ JSON.

    Название товара: "${productName}"
    Источный URL (для контекста): ${sourceUrl || 'Не предоставлен'}
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { "role": "system", "content": "Ты эксперт по характеристикам устройств. Отвечай только валидным JSON. Не включай цены или информацию о магазинах. Используй точные ключи характеристик." },
        { "role": "user", "content": prompt }
      ],
      model: "openai/gpt-oss-20b", //Используем рабочую модель
      temperature: 0, //0 для более детерминированного (предсказуемого) ответа
      max_tokens: 1200, //Увеличиваем лимит
    });

    const responseContent = chatCompletion.choices[0].message.content.trim();
    console.log(`[GROQ-KNOWLEDGE-SPECS-UPDATED] Raw response: ${responseContent}`);

    let cleanedResponse = responseContent;
    const jsonMatch = responseContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[1].trim();
    } else {
      if (responseContent.trim().startsWith('{')) {
        cleanedResponse = responseContent.trim();
      }
    }

    if (!cleanedResponse) {
        throw new Error('Очищенный ответ пустой или не содержит JSON.');
    }

    console.log(`[GROQ-KNOWLEDGE-SPECS-UPDATED] Cleaned response for parsing: ${cleanedResponse}`);

    const parsedData = JSON.parse(cleanedResponse);
    console.log(`[GROQ-KNOWLEDGE-SPECS-UPDATED] Parsed structured `, parsedData);

    if (typeof parsedData === 'object' && parsedData !== null) {
      //Возвращаем структурированные данные
      //Поля name, specs, sourceUrl будут объединены в маршруте
      return {
        source: 'GROQ Knowledge Specs Lookup (Updated Prompt)',
        name: parsedData.name || productName,
        specs: parsedData.specs || {}, //specs как объект
        //price и imageUrl остаются null/undefined, берутся из первого этапа
        price: null,
        imageUrl: null,
        sourceUrl: sourceUrl,
      };
    } else {
      console.error('[GROQ-KNOWLEDGE-SPECS-UPDATED] Ответ не является объектом:', parsedData);
      return null;
    }

  } catch (error) {
    console.error('[GROQ-KNOWLEDGE-SPECS-UPDATED] Ошибка при вызове API или парсинге ответа:', error.message);
    if (error instanceof SyntaxError) {
        console.error('[GROQ-KNOWLEDGE-SPECS-UPDATED] Ошибка парсинга JSON:', error.message);
    }
    //Если ошибка связана с доступом (403), логируем это явно
    if (error.message.includes('403')) {
        console.error('[GROQ-KNOWLEDGE-SPECS-UPDATED] ОШИБКА ДОСТУПА: Возможно, требуется VPN или доступ заблокирован по IP/региону.');
    }
    return null;
  }
}

async function fetchProductSpecsFromApiSystems(modelId, source) {
    console.log(`[API-SYSTEMS] Запрашиваем характеристики для ID: ${modelId}, источник: ${source}`);
    
    if (!API_SYSTEMS_KEY) {
        throw new Error('API_KEY для API Systems не найден в переменных окружения.');
    }
    
    let baseUrl;
    if (source === 'yandex_market') {
        baseUrl = `http://market.apisystem.name/models/${modelId}/specification`;
    } else if (source === 'wildberries') {
        baseUrl = `http://wb.apisystem.name/models/${modelId}/specification`;
    } else {
        throw new Error(`Неизвестный источник: ${source}`);
    }
    
    try {
        //Задержка между запросами согласно ограничению API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const response = await axios.get(baseUrl, {
            params: {
                api_key: API_SYSTEMS_KEY,
                format: 'json'
            },
            timeout: 10000
        });
        
        if (response.status !== 200) {
            throw new Error(`API Systems вернул статус ${response.status}`);
        }
        
        const data = response.data;
        console.log(`[API-SYSTEMS] Получен ответ для ID ${modelId}:`, data);
        
        if (data.status !== 'OK') {
            throw new Error(`API Systems вернул ошибку: ${data.status}`);
        }
        
        //🔑 ГЛАВНОЕ ИСПРАВЛЕНИЕ: данные могут быть в fields ИЛИ на верхнем уровне
        const fields = data.fields || data;
        
        //Извлекаем базовую информацию
        const name = fields.product_name || null;
        const vendor = fields.vendor || null;
        const description = fields.description || null;
        
        //Изображение: проверяем наличие и что photos — массив
        const imageUrl = fields.prev_image || 
            (fields.photos && Array.isArray(fields.photos) && fields.photos.length > 0 
                ? fields.photos[0].url 
                : null);
        
        //Цена (если есть в ответе)
        const price = fields.price || null;
        
        //Извлекаем характеристики
        const specs = {};
        const specifications = fields.specifications || [];
        
        if (Array.isArray(specifications)) {
            specifications.forEach(spec => {
                const key = spec.name?.trim();
                const value = spec.value;
                //Проверяем, что значение не undefined/null
                if (key && value !== undefined && value !== null) {
                    specs[key] = String(value).trim();
                }
            });
        }
        
        console.log(`[API-SYSTEMS] Извлечены данные:`, { 
            name, 
            price, 
            imageUrl, 
            specsCount: Object.keys(specs).length 
        });
        
        return {
            source: `API Systems (${source})`,
            name: name,
            price: price,
            imageUrl: imageUrl,
            sourceUrl: fields.url || null,
            specs: specs,
        };
        
    } catch (error) {
        console.error(`[API-SYSTEMS] Ошибка при вызове API для ID ${modelId}:`, error.message);
        if (error.response) {
            console.error(`[API-SYSTEMS] Статус ошибки: ${error.response.status}`);
            console.error(`[API-SYSTEMS] Ответ:`, error.response.data);
        }
        throw error;
    }
}

async function extractPriceFromYandexMarket(url) {
    try {
        const response = await axios.get(url, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });
        const $ = cheerio.load(response.data);
        let price = null;

        //1. JSON-LD разметка (самый надёжный источник на ЯМ)
        $('script[type="application/ld+json"]').each((i, el) => {
            try {
                const data = JSON.parse($(el).text());
                if (data.offers?.price) price = parseFloat(data.offers.price);
                else if (Array.isArray(data.offers) && data.offers[0]?.price) price = parseFloat(data.offers[0].price);
                else if (data['@type'] === 'Product' && data.offers?.price) price = parseFloat(data.offers.price);
            } catch (e) {}
        });

        //2. Мета-теги (SEO)
        if (!price) {
            const metaPrice = $('meta[itemprop="price"]').attr('content');
            if (metaPrice) price = parseFloat(metaPrice.replace(/[^\d.]/g, ''));
        }

        //3. Поиск в inline-скриптах (Yandex часто кладёт цену в window.__INITIAL_STATE__)
        if (!price) {
            $('script').each((i, el) => {
                const content = $(el).html();
                if (content && (content.includes('"price"') || content.includes('"offer"'))) {
                    const match = content.match(/"price"\s*:\s*"?(\d+(?:\.\d+)?)"?/);
                    if (match) price = parseFloat(match[1]);
                }
            });
        }

        //4. Атрибуты data-price или data-zone-name
        if (!price) {
            const dataPrice = $('[data-price]').first().attr('data-price') || $('[data-zone-name="price"]').first().attr('data-price');
            if (dataPrice) price = parseFloat(dataPrice.replace(/[^\d.]/g, ''));
        }

        if (price && price > 0) {
            console.log(`✅ Цена успешно спарсена со страницы: ${price} ₽`);
            return price;
        }
        console.warn('⚠️ Цена не найдена в HTML Яндекс Маркета');
        return null;
    } catch (e) {
        console.warn(`⚠️ Ошибка парсинга цены: ${e.message}`);
        return null;
    }
}

async function extractPriceFromStoreHtml(url, hostHint = null) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'
    };
    const response = await axios.get(url, { timeout: 18000, headers });
    const html = String(response.data || '');
    const $ = cheerio.load(html);
    const host = String(hostHint || new URL(url).hostname).toLowerCase();

    const parsePriceText = (input) => {
        if (input == null) return null;
        const cleaned = String(input).replace(/\u00a0/g, ' ').trim();
        const digits = cleaned.replace(/\s/g, '').replace(/[^\d]/g, '');
        if (!digits) return null;
        const n = parseInt(digits, 10);
        return Number.isFinite(n) && n > 0 ? n : null;
    };

    const fromSelectors = (selectors) => {
        for (const sel of selectors) {
            const el = $(sel).first();
            if (!el || !el.length) continue;
            const candidate = el.attr('content') || el.attr('data-price') || el.attr('value') || el.text();
            const price = parsePriceText(candidate);
            if (price) return price;
        }
        return null;
    };

    let price = fromSelectors([
        'meta[itemprop="price"]',
        '[itemprop="price"][content]',
        '[data-price]',
        '[data-meta-price]',
        '[data-testid*="price"]'
    ]);

    if (!price && host.includes('dns-shop.ru')) {
        price = fromSelectors([
            '[data-product-price]',
            '[data-marker="price"] span',
            '.product-buy__price',
            '.price_g'
        ]);
    }

    if (!price && host.includes('ozon.ru')) {
        price = fromSelectors([
            '[data-widget="webPrice"] [data-price]',
            '[data-widget="webPrice"] span',
            '[class*="c-price"] span',
            '[data-widget="price"] span'
        ]);
    }

    if (!price && host.includes('megamarket.ru')) {
        price = fromSelectors([
            '[itemprop="price"][content]',
            '[data-chp-id="goodsPriceFinal"] span',
            '[class*="price"]'
        ]);
    }

    if (!price && host.includes('aliexpress.')) {
        const patterns = [
            /"skuAmount"\s*:\s*\{\s*"value"\s*:\s*"(\d+)"/i,
            /"couponPrice"\s*:\s*"([\d.,]+)"/i,
            /"salePriceSimple"\s*:\s*"([\d.,]+)"/i,
            /"price"\s*:\s*"([\d.,]+)"/i
        ];
        for (const re of patterns) {
            const m = html.match(re);
            if (m?.[1]) {
                const p = parsePriceText(m[1]);
                if (p) {
                    price = p;
                    break;
                }
            }
        }
    }

    if (!price) {
        const ldRegexes = [
            /"price"\s*:\s*"?(?<price>\d+(?:[.,]\d+)?)"?/i,
            /"lowPrice"\s*:\s*"?(?<price>\d+(?:[.,]\d+)?)"?/i
        ];
        for (const re of ldRegexes) {
            const m = html.match(re);
            const raw = m?.groups?.price || m?.[1];
            if (raw) {
                const p = parsePriceText(raw);
                if (p) {
                    price = p;
                    break;
                }
            }
        }
    }

    return price ? Math.round(price) : null;
}

async function extractStoreSignalsFromHtml(url, hostHint = null) {
    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'
        };
        const response = await axios.get(url, { timeout: 18000, headers });
        const html = String(response.data || '');
        const $ = cheerio.load(html);
        const host = String(hostHint || new URL(url).hostname).toLowerCase();

        const parseNum = (v) => {
            if (v == null) return null;
            const m = String(v).replace(',', '.').match(/(\d+(?:\.\d+)?)/);
            if (!m) return null;
            const n = parseFloat(m[1]);
            return Number.isFinite(n) ? n : null;
        };
        const parseIntNum = (v) => {
            const n = parseNum(v);
            return n == null ? null : Math.round(n);
        };

        let rating = null;
        let reviewsCount = null;
        let stock = null;

        const ratingMeta =
            $('meta[itemprop="ratingValue"]').attr('content') ||
            $('meta[property="product:rating:value"]').attr('content') ||
            $('meta[name="rating"]').attr('content');
        rating = parseNum(ratingMeta);

        const reviewsMeta =
            $('meta[itemprop="reviewCount"]').attr('content') ||
            $('meta[property="product:rating:count"]').attr('content');
        reviewsCount = parseIntNum(reviewsMeta);

        if (!rating || !reviewsCount) {
            const allText = $('body').text().replace(/\s+/g, ' ');
            if (!rating) {
                const r = allText.match(/рейтинг[^0-9]{0,12}(\d+(?:[.,]\d+)?)/i) || allText.match(/(\d+(?:[.,]\d+)?)\s*из\s*5/i);
                rating = parseNum(r?.[1]);
            }
            if (!reviewsCount) {
                const c = allText.match(/(\d[\d\s]{0,8})\s*отзыв/i) || allText.match(/отзыв[^0-9]{0,12}(\d[\d\s]{0,8})/i);
                reviewsCount = parseIntNum(c?.[1]);
            }
        }

        const stockPatterns = [
            /в\s*наличии[^0-9]{0,10}(\d{1,4})/i,
            /остал(?:ось|ся)[^0-9]{0,10}(\d{1,4})/i,
            /(\d{1,4})\s*шт\.\s*в\s*наличии/i
        ];
        const htmlText = html.replace(/\s+/g, ' ');
        for (const re of stockPatterns) {
            const m = htmlText.match(re);
            if (m?.[1]) {
                stock = parseIntNum(m[1]);
                if (stock != null) break;
            }
        }

        if (host.includes('wildberries.ru') || host.includes('wb.ru')) {
            const mRating = html.match(/"productValuation"\s*:\s*(\d+(?:\.\d+)?)/i);
            const mFeedback = html.match(/"feedbacks"\s*:\s*(\d+)/i);
            const mQty = html.match(/"quantity"\s*:\s*(\d+)/i);
            rating = rating ?? parseNum(mRating?.[1]);
            reviewsCount = reviewsCount ?? parseIntNum(mFeedback?.[1]);
            stock = stock ?? parseIntNum(mQty?.[1]);
        }

        if (host.includes('market.yandex.ru') || host.includes('yandex.ru')) {
            const mRating = html.match(/"rating(Value)?"\s*:\s*"?(?<v>\d+(?:\.\d+)?)"?/i);
            const mReviews = html.match(/"reviewCount"\s*:\s*"?(?<v>\d+)"?/i);
            rating = rating ?? parseNum(mRating?.groups?.v || mRating?.[2]);
            reviewsCount = reviewsCount ?? parseIntNum(mReviews?.groups?.v || mReviews?.[1]);
        }

        return {
            rating: rating != null ? Math.max(0, Math.min(5, rating)) : null,
            reviewsCount: reviewsCount != null && reviewsCount >= 0 ? reviewsCount : null,
            stock: stock != null && stock >= 0 ? stock : null
        };
    } catch {
        return { rating: null, reviewsCount: null, stock: null };
    }
}

async function extractPriceWithPuppeteerLite(url, proxy = null) {
    let browser = null;
    try {
        const launchOptions = {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--lang=ru-RU'
            ]
        };
        if (proxy) launchOptions.args.push(`--proxy-server=${proxy}`);

        browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        );
        await page.setViewport({ width: 1366, height: 900 });
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
        await page.waitForTimeout(1200);

        const html = await page.content();
        const $ = cheerio.load(html);
        const parsePriceText = (input) => {
            if (!input) return null;
            const digits = String(input).replace(/\u00a0/g, ' ').replace(/\s/g, '').replace(/[^\d]/g, '');
            if (!digits) return null;
            const n = parseInt(digits, 10);
            return Number.isFinite(n) && n > 0 ? n : null;
        };
        const selectors = [
            'meta[itemprop="price"]',
            '[itemprop="price"][content]',
            '[data-price]',
            '[data-meta-price]',
            '[class*="price"]',
            '[data-testid*="price"]'
        ];
        for (const sel of selectors) {
            const el = $(sel).first();
            if (!el || !el.length) continue;
            const candidate = el.attr('content') || el.attr('data-price') || el.text();
            const p = parsePriceText(candidate);
            if (p) return Math.round(p);
        }
        const m = html.match(/"price"\s*:\s*"?(?<price>\d+(?:[.,]\d+)?)"?/i);
        const p = parsePriceText(m?.groups?.price || m?.[1]);
        return p ? Math.round(p) : null;
    } catch {
        return null;
    } finally {
        if (browser) await browser.close().catch(() => {});
    }
}

function extractModelIdFromUrl(urlString) {
    try {
        const parsedUrl = new URL(urlString);
        const hostname = parsedUrl.hostname.toLowerCase();
        const pathname = parsedUrl.pathname;

        const isYandexMarketHost = hostname.includes('market.yandex.ru')
            || (hostname.includes('yandex.ru') && (pathname.includes('/card/') || pathname.includes('/product--')));

        if (isYandexMarketHost) {
            const match = pathname.match(/\/(\d+)(?:[\/?#]|$)/);
            if (match) {
                return { id: parseInt(match[1], 10), source: 'yandex_market' };
            }
        }

        if (hostname.includes('wildberries.ru') || hostname.includes('wb.ru')) {
            const match = pathname.match(/\/catalog\/(\d+)\/detail/i);
            if (match) {
                return { id: parseInt(match[1], 10), source: 'wildberries' };
            }
        }
    } catch (e) {
        console.error('Ошибка парсинга URL для извлечения ID:', e);
    }
    return null;
}


//Аналитика
app.post('/api/analytics/track-view', authenticateTokenOptional, async (req, res) => {
    try {
        const { productId } = req.body;
        //Если пользователь авторизован, берем его ID, иначе null
        const userId = req.user?.id ? parseInt(req.user.id, 10) : null;

        if (!productId) {
            return res.status(400).json({ error: 'Не указан ID товара' });
        }

        await prisma.viewLog.create({
            data: {
                productId: parseInt(productId), //Приводим к числу для базы данных
                userId
            }
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Ошибка при записи просмотра:', error);
        res.status(500).json({ error: 'Не удалось записать просмотр' });
    }
});

app.post('/api/analytics/track-purchase', authenticateTokenOptional, async (req, res) => {
  try {
    const { productId, storeName, url } = req.body;
    const userId = req.user?.id ? parseInt(req.user.id, 10) : null;

    if (!productId) {
      return res.status(400).json({ error: 'Не указан ID товара' });
    }

    await prisma.purchaseClick.create({
      data: {
        productId: parseInt(productId, 10),
        userId,
        storeName: typeof storeName === 'string' ? storeName.trim() : null,
        url: typeof url === 'string' ? url.trim() : null
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    if (isMissingTableError(error, 'PurchaseClick')) {
      //Не ломаем пользовательский сценарий до применения миграции
      return res.status(200).json({ success: true, skipped: true });
    }
    console.error('Ошибка при записи перехода к покупке:', error);
    res.status(500).json({ error: 'Не удалось записать переход к покупке' });
  }
});

app.post('/api/analytics/track-search', authenticateTokenOptional, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || query.trim() === '') return res.status(400).json({ error: 'Пустой запрос' });

    const userId = req.user?.id ? parseInt(req.user.id, 10) : null;

    await prisma.searchLog.create({
       data:{
        query: query.trim(),
        userId: userId
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Ошибка при записи поиска:', error);
    //Не ломаем интерфейс пользователя при ошибке логирования
    res.status(500).json({ error: 'Не удалось записать поиск' });
  }
});

app.get('/api/products/:id/prices', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    //Загружаем текущие цены товара
    const prices = await prisma.price.findMany({
      where: { productId: productId },
      orderBy: { price: 'asc' }
    });
    res.json(prices);
  } catch (error) {
    console.error('Error fetching product prices:', error);
    res.status(500).json({ error: 'Не удалось загрузить текущие цены' });
  }
});

app.get('/api/products/:id/store-signals', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) return res.status(400).json({ error: 'Invalid product ID' });
    const state = readStoreSignals();
    const items = Array.isArray(state.items) ? state.items : [];
    const rows = items.filter((i) => Number(i.productId) === productId);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Не удалось получить сигналы магазинов' });
  }
});

