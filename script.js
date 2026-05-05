//Глобальные переменные
let currentProductId = null; 
let currentUser = null;
let comparisonList = [];
let favorites = [];
let currentFilters = {};
let selectedCheckboxes = {};
const recommendationStore = {
  popular: [],
  trending: [],
  bestValue: [],
  personal: [],
  priceDrop: []
};
const recommendationGridIdMap = {
  popular: 'popularProducts',
  trending: 'trendingProducts',
  bestValue: 'bestValueProducts',
  personal: 'personalProducts',
  priceDrop: 'priceDropProducts'
};
const recommendationFilters = {
  query: '',
  category: '',
  minPrice: '',
  maxPrice: '',
  sortBy: 'relevance'
};
let demoProducts = []; //Только для совместимости, по факту данные берутся с бд
let currentAdminTableData = [];
let currentAdminTableName = '';
let currentModerationTab = 'reviews';
let currentPriceHistoryProduct = null;
let currentPriceHistoryEntries = [];
//Глобальные переменные для поиска в таблице
let currentTableSearchField = '';
let currentTableSearchValue = '';
let priceHistoryChartInstance = null;
let lastAdminPriceSyncPreview = null;
let similarModeTargetId = null;
//Карта перевода ключей
window.specKeyTranslations = {
  //Смартфоны
  'screen_size': 'Экран',
  'screen_resolution': 'Разрешение экрана',
  'screen_technology': 'Технология экрана',
  'screen_refresh_rate': 'Частота обновления',
  'cpu_brand': 'Бренд процессора',
  'cpu_model': 'Модель процессора',
  'ram_size': 'Объём ОЗУ',
  'ram_type': 'Тип ОЗУ',
  'storage_capacity': 'Объём памяти',
  'storage_type': 'Тип накопителя',
  'rear_camera_count': 'Количество задних камер',
  'rear_camera_primary_mp': 'Разрешение основной камеры',
  'rear_camera_sensor_model': 'Модель сенсора камеры',
  'rear_camera_sensor_size': 'Размер сенсора камеры',
  'front_camera_mp': 'Разрешение фронтальной камеры',
  'battery_capacity_mah': 'Ёмкость аккумулятора',
  'battery_type': 'Тип аккумулятора',
  'os': 'Операционная система',
  'os_version': 'Версия ОС',
  'weight_g': 'Вес',
  'dimensions_mm': 'Размеры',
  'sim_slots': 'Количество SIM',
  'connectivity': 'Связь',
  's_pen': 'Наличие S Pen',
  'water_resistance': 'Водонепроницаемость',
  'build_material': 'Материал корпуса',
  'fingerprint_scanner': 'Сканер отпечатка',
  'face_unlock': 'Разблокировка лицом',

  //Ноутбуки
  'screen_type': 'Тип экрана',
  'screen_aspect_ratio': 'Соотношение сторон',
  'cpu_generation': 'Поколение процессора',
  'cpu_cores': 'Количество ядер',
  'cpu_threads': 'Количество потоков',
  'cpu_base_freq': 'Базовая частота',
  'cpu_boost_freq': 'Турбо-частота',
  'gpu_model': 'Модель видеокарты',
  'gpu_memory_mb': 'Память видеокарты',
  'gpu_brand': 'Бренд видеокарты',
  'ssd_type': 'Тип SSD',
  'hdd_capacity_gb': 'Объём HDD',
  'hdd_rpm': 'Обороты HDD',
  'keyboard_backlight': 'Подсветка клавиатуры',
  'keyboard_layout': 'Раскладка клавиатуры',
  'ports_usb_a': 'Порты USB-A',
  'ports_usb_c': 'Порты USB-C',
  'ports_hdmi': 'Порты HDMI',
  'ports_displayport': 'Порты DisplayPort',
  'battery_life_hours': 'Время автономной работы',
  'webcam_mp': 'Камера (МП)',
  'webcam_features': 'Особенности камеры',
  'audio_system': 'Аудиосистема',
  'audio_features': 'Особенности звука',
  'security_features': 'Функции безопасности',

  //Телевизоры
  'diagonal_in': 'Диагональ',
  'screen_format': 'Формат экрана',
  'hdr_support': 'Поддержка HDR',
  'smart_platform': 'Платформа Smart TV',
  'sound_power_w': 'Мощность звука',
  'sound_channels': 'Количество каналов',
  'mount_type': 'Тип крепления',
  'wall_mount_kit': 'Комплект крепления',
  'power_consumption_w': 'Потребление энергии',
  'power_standby_w': 'Режим ожидания',

  //Наушники
  'driver_size_mm': 'Размер драйвера',
  'driver_type': 'Тип драйвера',
  'impedance_ohms': 'Сопротивление',
  'frequency_response_hz': 'Частотный диапазон',
  'sensitivity_db': 'Чувствительность',
  'microphone_frequency_response': 'Частотный диапазон микрофона',
  'microphone_noise_reduction': 'Шумоподавление микрофона',
  'wireless_standard': 'Стандарт беспроводной связи',
  'wireless_range_m': 'Дальность беспроводной связи',
  'charging_port': 'Порт зарядки',
  'charging_time_h': 'Время зарядки',
  'anc_type': 'Тип шумоподавления',
  'anc_level': 'Уровень шумоподавления',
  'controls_type': 'Тип управления',
  'controls_touch': 'Сенсорное управление',
  'controls_voice': 'Управление голосом',
  'foldable': 'Складывается',
  'ear_pad_type': 'Тип амбушюр',
  'ear_pad_material': 'Материал амбушюр',
  'ear_pad_replaceable': 'Сменные амбушюры',
  'carry_case_included': 'Чехол в комплекте',
  'cable_length_m': 'Длина кабеля',
  'cable_connector': 'Тип разъёма кабеля',

  //Камеры
  'sensor_model': 'Модель матрицы',
  'sensor_size': 'Размер матрицы',
  'sensor_resolution_mp': 'Разрешение матрицы',
  'lens_mount': 'Байонет объектива',
  'lens_aperture': 'Максимальная апертура',
  'lens_zoom': 'Оптический зум',
  'image_stabilization': 'Стабилизация изображения',
  'video_resolution': 'Разрешение видео',
  'video_fps': 'Частота кадров видео',
  'iso_range': 'Диапазон ISO',
  'shutter_speed': 'Скорость срабатывания затвора',
  'viewfinder_type': 'Тип видоискателя',
  'viewfinder_magnification': 'Увеличение видоискателя',
  'lcd_type': 'Тип ЖК-дисплея',
  'lcd_size_in': 'Размер ЖК-дисплея',
  'lcd_touch': 'Сенсорный дисплей',
  'lcd_articulating': 'Поворотный дисплей',
  'battery_life_shots': 'Время работы (снимки)',
  'battery_model': 'Модель аккумулятора',
  'flash_type': 'Тип вспышки',
  'flash_sync_speed': 'Скорость синхронизации вспышки',
  'dimensions_w_h_d_mm': 'Размеры (ШxВxГ)',
  'weight_g_body_only': 'Вес (только корпус)',
  'weight_kg': 'Вес (кг)',
  'ports': 'Порты',
  'fingerprint_reader': 'Сканер отпечатка',
  'tpm': 'TPM-чип',
  'touch_bar': 'Touch Bar',

  //Планшеты
  'screen_surface': 'Покрытие экрана',
  'stylus_support': 'Поддержка стилуса',
  'stylus_included': 'Стилус в комплекте',
  'keyboard_support': 'Поддержка клавиатуры',
  'keyboard_included': 'Клавиатура в комплекте',
  'ram_form_factor': 'Форм-фактор ОЗУ',
  'storage_expandable': 'Расширение памяти',
  'storage_max_gb': 'Макс. объём расширения',
  'battery_charging_type': 'Тип зарядки аккумулятора',
  'battery_charging_speed': 'Скорость зарядки',
  'accessory_ports': 'Порты для аксессуаров',

  //Смарт-часы
  'watch_band_material': 'Материал ремешка',
  'watch_band_width_mm': 'Ширина ремешка',
  'watch_band_replacement': 'Сменный ремешок',
  'health_monitoring': 'Функции мониторинга здоровья',
  'sports_modes_count': 'Количество спортивных режимов',
  'gps_type': 'Тип GPS',
  'nfc_support': 'Поддержка NFC',
  'lte_support': 'Поддержка LTE',
  'sleep_tracking': 'Отслеживание сна',
  'stress_monitoring': 'Мониторинг стресса',
  'spo2_monitoring': 'Мониторинг SpO2',
  'ecg_support': 'Поддержка ЭКГ',
  'water_resistance_rating': 'Класс водонепроницаемости',
  'watch_face_customizable': 'Настройка циферблата',

  //Электронные книги
  'screen_surface_type': 'Тип поверхности экрана',
  'screen_frontlight': 'Подсветка экрана',
  'screen_frontlight_color': 'Цвет подсветки',
  'screen_page_turn_buttons': 'Кнопки перелистывания',
  'storage_available_gb': 'Доступная память',
  'file_formats_supported': 'Поддерживаемые форматы файлов',
  'dictionary_included': 'Словарь в комплекте',
  'bookstore_integration': 'Интеграция с книжными магазинами',
  'battery_standby_days': 'Время в режиме ожидания',
  'charging_method': 'Метод зарядки',
  'accessories_included': 'Аксессуары в комплекте',

  //Дроны
  'motor_type': 'Тип двигателя',
  'propeller_guard': 'Защита пропеллеров',
  'camera_specs': 'Характеристики камеры',
  'camera_gimbal': 'Подвес камеры',
  'camera_recording_mode': 'Режим записи камеры',
  'flight_modes': 'Режимы полёта',
  'obstacle_avoidance': 'Избегание препятствий',
  'return_to_home': 'Возврат домой',
  'follow_me_mode': 'Режим "Следуй за мной"',
  'orbit_mode': 'Режим "Орбита"',
  'remote_control_range': 'Дальность пульта управления',
  'remote_control_battery_life': 'Время работы пульта',
  'transmission_latency_ms': 'Задержка передачи сигнала',
  'wind_resistance_level': 'Уровень сопротивления ветру',
  'indoor_outdoor_use': 'Использование в помещении/на улице'
  //Добавляйте новые ключи по мере необходимости
};

//Делаем переменную глобально доступной
window.demoProducts = demoProducts;
console.log('demoProducts доступна глобально, количество:', demoProducts.length);

const VALUE_CALCULATOR_CONFIG = {
    smartphones: {
        baseScore: 60,
        weights: {
            ram_size: 1,
            storage_capacity: 0.1,
            battery_capacity_mah: 0.005,
            screen_refresh_rate: 1.5,
            rear_camera_primary_mp: 0.3,
            weight_g: -0.05
        },
        bonuses: {
            cpu_model: {
                'apple a1': 25, 'snapdragon 8': 25, 'snapdragon 7': 15,
                'dimensity 9': 25, 'dimensity 8': 15, 'exynos 2': 15,
                'core i9': 25, 'core i7': 25
            },
            screen_technology: {
                'oled': 25, 'amoled': 20, 'super amoled': 22,
                'ips': 5, 'lcd': 2
            },
            water_resistance: { 'ip68': 15, 'ip67': 10 },
            connectivity: { '5g': 15, 'nfc': 10 }
        },
        scale: 10000
    },
    laptops: {
        baseScore: 30,
        weights: {
            ram_size: 5,
            storage_capacity: 0.15,
            battery_life_hours: 2,
            weight_g: -0.02
        },
        bonuses: {
            cpu_model: {
                'core i9': 30, 'ryzen 9': 28, 'core i7': 20, 'ryzen 7': 18,
                'apple m3': 35, 'apple m2': 25, 'apple m1': 20
            },
            gpu_model: { 'rtx 40': 30, 'rtx 30': 20, 'geforce': 10, 'radeon rx': 15 },
            screen_type: { 'oled': 25, 'ips': 10 },
            keyboard_backlight: { 'есть': 5 }
        },
        scale: 10000
    },
    tv: {
        baseScore: 40,
        weights: { diagonal_in: 8, sound_power_w: 1 },
        bonuses: {
            screen_resolution: { '8k': 50, '4k': 20, 'ultra hd': 20 },
            screen_technology: { 'oled': 60, 'qled': 40, 'miniled': 30, 'led': 0 },
            smart_platform: { 'google tv': 10, 'android tv': 10, 'webos': 8, 'tizen': 8 },
            hdr_support: { 'dolby vision': 15, 'hdr10+': 10, 'hdr10': 5 }
        },
        scale: 10000
    },
    headphones: {
        baseScore: 15,
        weights: { battery_life_hours: 3, driver_size_mm: 0.5, weight_g: -0.05 },
        bonuses: {
            anc_type: { 'active': 25, 'гибридное': 20, 'адаптивное': 20 },
            connectivity: { 'bluetooth 5.3': 10, 'bluetooth 5.2': 5 },
            controls_touch: { 'есть': 5 }
        },
        scale: 10000
    },
    tablets: {
        baseScore: 25,
        weights: { screen_size: 10, ram_size: 5, storage_capacity: 0.15, battery_capacity_mah: 0.003 },
        bonuses: {
            screen_technology: { 'oled': 20, 'ips': 10 },
            stylus_support: { 'есть': 15 }
        },
        scale: 10000
    },
    cameras: {
        baseScore: 50,
        weights: { sensor_resolution_mp: 1.5, iso_range: 0.05 },
        bonuses: {
            sensor_size: { 'full frame': 50, 'aps-c': 20, 'micro 4/3': 10 },
            video_resolution: { '8k': 30, '4k': 15 },
            image_stabilization: { 'есть': 15 }
        },
        scale: 10000
    },
    smartwatches: {
        baseScore: 15,
        weights: { battery_life_hours: 2 },
        bonuses: {
            gps_type: { 'gps': 10, 'glonass': 10 },
            nfc_support: { 'есть': 15 },
            water_resistance_rating: { '5atm': 10, '10atm': 15, 'ip68': 5 },
            ecg_support: { 'есть': 10 }
        },
        scale: 10000
    },
    ebooks: {
        baseScore: 10,
        weights: { storage_available_gb: 2, battery_standby_days: 1 },
        bonuses: {
            screen_frontlight: { 'есть': 10 },
            water_resistance: { 'есть': 10 }
        },
        scale: 10000
    },
    drones: {
        baseScore: 20,
        weights: { range: 2, weight_g: -0.05 },
        bonuses: {
            camera_gimbal: { 'есть': 20 },
            obstacle_avoidance: { 'есть': 15 },
            video_resolution: { '4k': 15 }
        },
        scale: 10000
    },
    default: { baseScore: 35, weights: {}, bonuses: {}, scale: 10000 }
};

//Извлекает первое числовое значение из строки характеристики
function extractSpecNumber(value) {
    if (!value) return 0;
    const str = String(value).toLowerCase().replace(/,/g, '.');
    const match = str.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
}

//Ищет бонусы по ключевым словам в значении характеристики
function getSpecBonuses(specKey, specValue, configBonuses) {
    if (!configBonuses || !configBonuses[specKey]) return 0;
    const valueLower = String(specValue).toLowerCase();
    let bonus = 0;
    for (const [keyword, score] of Object.entries(configBonuses[specKey])) {
        if (valueLower.includes(keyword.toLowerCase())) {
            bonus += score;
            break;
        }
    }
    return bonus;
}

async function getMarketPrice(productId) {
    try {
        //1. Пробуем получить актуальные цены из таблицы Price
        const pricesRes = await fetch(`http://localhost:3000/api/products/${productId}/prices`);
        if (pricesRes.ok) {
            const prices = await pricesRes.json();
            if (prices && prices.length > 0) {
                const validPrices = prices.map(p => p.price).filter(p => p > 0);
                if (validPrices.length > 0) {
                    const sum = validPrices.reduce((acc, p) => acc + p, 0);
                    return sum / validPrices.length;
                }
            }
        }
        
        //2. Если актуальных цен нет, берём последние записи из истории
        const historyRes = await fetch(`http://localhost:3000/api/products/${productId}/price-history`);
        if (historyRes.ok) {
            const history = await historyRes.json();
            let latestPrices = [];
            
            for (const storeName in history) {
                if (Array.isArray(history[storeName]) && history[storeName].length > 0) {
                    //Сортируем по дате и берём последнюю запись для каждого магазина
                    const sorted = [...history[storeName]].sort((a, b) => new Date(b.x) - new Date(a.x));
                    if (sorted[0]?.y > 0) {
                        latestPrices.push(sorted[0].y);
                    }
                }
            }
            
            if (latestPrices.length > 0) {
                const sum = latestPrices.reduce((acc, p) => acc + p, 0);
                return sum / latestPrices.length;
            }
        }
    } catch (e) {
        console.warn(' Не удалось получить рыночную цену:', e);
    }
    return null;
}

function calculateValueScore(product, price, marketPrice = null) {
    if (!price || price <= 0) return 0;

    const config = VALUE_CALCULATOR_CONFIG[product.category] || VALUE_CALCULATOR_CONFIG.default;
    let perfScore = config.baseScore;
    const specs = product.specs || {};

    //1. Считаем числовые характеристики
    for (const [key, weight] of Object.entries(config.weights)) {
        if (specs[key]) {
            const val = extractSpecNumber(specs[key]);
            perfScore += val * weight;
        }
    }

    //2. Считаем бонусы за "качество" (процессор, тип экрана и т.д.)
    if (config.bonuses) {
        for (const key of Object.keys(config.bonuses)) {
            if (specs[key]) {
                perfScore += getSpecBonuses(key, specs[key], config.bonuses);
            }
        }
    }

    //3. Корректировка на основе соотношения с рыночной ценой
    let priceFactor = 1;
    if (marketPrice && marketPrice > 0 && price > 0) {
        //priceFactor > 1 если цена ниже рынка (бонус), < 1 если выше (штраф)
        priceFactor = marketPrice / price;
        //Ограничиваем влияние ценового фактора разумными пределами (0.5 - 2.0)
        priceFactor = Math.max(3, Math.min(4, priceFactor));
    }

    //Итоговая формула: (Мощность * ЦеновойФактор / ПользовательскаяЦена) * Масштаб
    return Math.round(((perfScore * priceFactor / price) * config.scale) * 10) / 10;
}

function getValueInterpretation(score) {
    if (score >= 70) return { text: "Отличная цена! ", color: "#059669", width: "100%" };
    if (score >= 55) return { text: "Хорошая цена ", color: "#10b981", width: "90%" };
    if (score >= 40) return { text: "Выгодная цена ", color: "#3b82f6", width: "75%" };
    if (score >= 25) return { text: "Средняя цена ", color: "#f59e0b", width: "60%" };
    if (score >= 15) return { text: "Цена завышена ", color: "#ef4444", width: "40%" };
    return { text: "Не рекомендуется ", color: "#991b1b", width: "20%" };
}

async function renderValueCalculator(product, container) {
    console.log(' renderValueCalculator:', product?.name, 'Категория:', product?.category);
    if (!container || !product) return;

    //Поиск минимальной цены из доступных в продукте
    const priceValues = (product.prices || []).map(p => p.price).filter(p => p > 0);
    const minPrice = priceValues.length > 0 ? Math.min(...priceValues) : 10000;

    //Рендерим UI сразу, чтобы пользователь не ждал
    container.innerHTML = `
        <div class="value-calc-block">
            <h3 style="margin: 0 0 10px; font-size: 1.1rem; color: #1e293b;">💡 Калькулятор выгоды</h3>
            <p style="margin: 0 0 15px; color: #64748b; font-size: 0.9rem;">
                Система отталкивается не только от рыночной цены, но и от характеристик
            </p>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <label style="font-weight: 500;">Цена (₽):</label>
                <input type="number" class="calc-price-input" value="${minPrice}" step="100" min="0"
                       style="width: 140px; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 1rem;">
            </div>
            <div class="calc-result-box" style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <div class="calc-bar-bg" style="height: 10px; background: #e5e7eb; border-radius: 5px; overflow: hidden; margin-bottom: 10px;">
                    <div class="calc-bar-fill" style="height: 100%; width: 0%; background: #3b82f6; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);"></div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <span style="font-size: 0.95rem; color: #475569;">Индекс выгоды:</span>
                    <strong class="calc-score-value" style="font-size: 1.3rem; color: #0f172a;">—</strong>
                </div>
                <div class="calc-interpretation" style="font-weight: 600; font-size: 0.95rem;"></div>
                <div class="market-price-display" style="margin-top: 8px; font-size: 0.85rem; color: #64748b; min-height: 1.2em;"></div>
            </div>
        </div>
    `;

    const input = container.querySelector('.calc-price-input');
    const barFill = container.querySelector('.calc-bar-fill');
    const scoreVal = container.querySelector('.calc-score-value');
    const interpVal = container.querySelector('.calc-interpretation');
    const marketPriceDisplay = container.querySelector('.market-price-display');

    if (!input || !barFill || !scoreVal || !interpVal || !marketPriceDisplay) {
        console.error('renderValueCalculator: не удалось найти элементы калькулятора');
        return;
    }

    //Загружаем рыночную цену асинхронно
    let marketPrice = null;
    if (product.id) {
        marketPriceDisplay.textContent = '📊 Загрузка рыночной цены...';
        try {
            marketPrice = await getMarketPrice(product.id);
            if (marketPrice && marketPriceDisplay) {
                marketPriceDisplay.textContent = `📊 Средняя рыночная цена: ${Math.round(marketPrice).toLocaleString('ru-RU')} ₽`;
            } else if (marketPriceDisplay) {
                marketPriceDisplay.textContent = '📊 Рыночная цена: данные недоступны';
            }
        } catch (e) {
            console.warn('⚠️ Ошибка загрузки рыночной цены:', e);
            if (marketPriceDisplay) {
                marketPriceDisplay.textContent = '📊 Рыночная цена: ошибка загрузки';
            }
        }
    }

    //Функция обновления расчёта
    const updateCalc = () => {
        try {
            const price = parseFloat(input.value) || 0;
            const score = calculateValueScore(product, price, marketPrice);
            const interp = getValueInterpretation(score);

            scoreVal.textContent = score.toFixed(1);
            interpVal.textContent = interp.text;
            interpVal.style.color = interp.color;
            barFill.style.width = interp.width;
            barFill.style.background = interp.color;
        } catch (e) {
            console.error('💥 Ошибка в updateCalc:', e);
        }
    };

    //Вешаем обработчики событий на поле ввода
    ['input', 'change', 'keyup'].forEach(evt => {
        input.addEventListener(evt, updateCalc);
    });

    //Первый запуск расчёта
    updateCalc();
}


//Инициализация
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

//Главная функция инициализации приложения
async function initializeApp() {
  const path = window.location.pathname;
  console.log('Инициализация приложения, страница:', path);

  //Сначала загружаем пользователя
  loadUserData();

  //Загружаем товары из API
  const products = await loadProductsFromAPI();
  if (!products || products.length === 0) {
    showCustomNotification('Не удалось загрузить каталог товаров', 'error');
  }

  //Инициализируем страницы
  if (path.includes('catalog.html')) {
    initializeCatalog();
  } else if (path.includes('product.html')) {
    initializeProductPage();
  } else if (path.includes('comparison.html')) {
    initializeComparisonPage();
  } else if (path.includes('recommendations.html')) {
    initializeRecommendationsPage();
  } else if (path.includes('admin.html')) {
    initializeAdminPage();
  } else if (path.includes('profile.html')) {
    //Для профиля — загружаем данные с сервера
    loadProfileDataFromAPI();
  }

  updateComparisonCounter();
}



//===================== КАТАЛОГ И ФИЛЬТРЫ =====================

function initializeCatalog() {
    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('category');
    const similarTo = urlParams.get('similarTo'); //Читаем параметр режима "Похожее"

    //Если есть режим "Похожее", сохраняем ID целевого товара
    if (similarTo) {
        similarModeTargetId = parseInt(similarTo, 10);
    }

    //Загружаем список категорий
    loadCategories();

    //Если в URL есть параметр category, выбираем её в селекторе и фильтруем
    if (initialCategory) {
        const categorySelect = document.getElementById('categorySelect');
        if (categorySelect) {
            categorySelect.value = initialCategory;
            updateFilters();
            filterProducts();
        }
    }
    
    //Обновляем баннер похожести и загружаем товары
    updateSimilarModeBanner();
    loadProductsFromAPI();
}

//Загрузка фильтров из url при переходе по ссылке
function loadFiltersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    
    if (category) {
        document.getElementById('categorySelect').value = category;
        updateFilters();
    }
    
    if (search) {
        document.getElementById('mainSearch').value = search;
        currentFilters.search = search;
    }
    
    filterProducts();
}

//Обновлнеи фильтров
function updateFilters() {
  const categorySelect = document.getElementById('categorySelect');
  const category = categorySelect ? categorySelect.value : '';
  const dynamicFilters = document.getElementById('dynamicFilters');

  //Сбрасываем выбранные чекбоксы для предыдущей категории
  selectedCheckboxes = {};

  if (category && demoProducts && demoProducts.length > 0) {
    //1. Найдём все товары текущей категории
    const productsInCategory = demoProducts.filter(p => p.category === category);

    if (productsInCategory.length === 0) {
      dynamicFilters.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #6b7280;">
          <p>Нет товаров в выбранной категории.</p>
        </div>
      `;
      updateProductsInfo(0, category);
      displayProducts([]);
      return;
    }

    //2. Соберём все уникальные ключи характеристик для этой категории
    const uniqueSpecKeys = new Set();
    productsInCategory.forEach(product => {
      if (product.specs) {
        Object.keys(product.specs).forEach(key => uniqueSpecKeys.add(key));
      }
    });

    //3. Для каждого ключа соберём уникальные *значения*
    const filtersForCategory = [];
    uniqueSpecKeys.forEach(key => {
      const valuesSet = new Set();
      productsInCategory.forEach(product => {
        if (product.specs && product.specs[key]) {
          //Нормализуем значение перед добавлением в Set
          const normalizedValue = normalizeFilterValue(product.specs[key]);
          valuesSet.add(normalizedValue);
        }
      });
      //Пропускаем ключи с очень большим количеством уникальных значений (например, цены)
      if (valuesSet.size > 0 && valuesSet.size <= 20) { //Порог, можно изменить
        filtersForCategory.push({
          name: key, //Используем оригинальный ключ из specs
          label: specKeyTranslations[key] || key, //Русское название или ключ
          type: 'checkbox',
          options: [...valuesSet].sort() //Сортируем значения
        });
      }
    });

    //4. Сгенерируем HTML для фильтров
    dynamicFilters.innerHTML = `
      <h4 style="margin: 1.5rem 0 1rem; color: #374151; font-size: 1.1rem;">
        Характеристики ${getCategoryName(category)}
      </h4>
      ${filtersForCategory.map(filter => `
        <div class="filter-group" style="margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
          <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: #374151;">
            ${filter.label}
          </label>
          <div class="checkbox-options" id="${filter.name}Options"
               style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.5rem;">
            ${filter.options.map(opt => `
              <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem;
                           background: white; border-radius: 4px; cursor: pointer;
                           transition: background 0.2s;"
                     onmouseover="this.style.background='#f3f4f6'"
                     onmouseout="this.style.background='white'">
                <input type="checkbox"
                       name="${filter.name}"
                       value="${opt}"
                       onchange="handleCheckboxChange('${filter.name}', '${opt}', this.checked)"
                       style="width: 18px; height: 18px; cursor: pointer;">
                <span style="font-size: 0.9rem;">${opt}</span>
              </label>
            `).join('')}
          </div>
          <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem;">
            <button type="button" class="btn btn-outline btn-small"
                    onclick="selectAllCheckboxes('${filter.name}')"
                    style="padding: 0.4rem 0.75rem; font-size: 0.85rem;">
              Выбрать все
            </button>
            <button type="button" class="btn btn-outline btn-small"
                    onclick="clearCheckboxes('${filter.name}')"
                    style="padding: 0.4rem 0.75rem; font-size: 0.85rem;">
              Сбросить
            </button>
          </div>
        </div>
      `).join('')}
    `;

  } else {
    dynamicFilters.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #6b7280;">
        <p>Выберите категорию для отображения фильтров</p>
      </div>
    `;
  }

  //Обновляем счётчики и отображение
  filterProducts();
}

function handleCheckboxChange(filterName, value, isChecked) {
    if (!selectedCheckboxes[filterName]) {
        selectedCheckboxes[filterName] = [];
    }
    
    if (isChecked) {
        if (!selectedCheckboxes[filterName].includes(value)) {
            selectedCheckboxes[filterName].push(value);
        }
    } else {
        selectedCheckboxes[filterName] = selectedCheckboxes[filterName].filter(v => v !== value);
    }
    
    filterProducts();
}

function selectAllCheckboxes(filterName) {
    const checkboxes = document.querySelectorAll(`input[name="${filterName}"]`);
    checkboxes.forEach(cb => {
        cb.checked = true;
        handleCheckboxChange(filterName, cb.value, true);
    });
}

function clearCheckboxes(filterName) {
    const checkboxes = document.querySelectorAll(`input[name="${filterName}"]`);
    checkboxes.forEach(cb => {
        cb.checked = false;
    });
    selectedCheckboxes[filterName] = [];
    filterProducts();
}

//Фильтры
function filterProducts() {
    const categorySelect = document.getElementById('categorySelect');
    const category = categorySelect ? categorySelect.value : '';
    const minPriceInput = document.getElementById('minPrice');
    const minPrice = minPriceInput && minPriceInput.value ? parseFloat(minPriceInput.value) : 0;
    const maxPriceInput = document.getElementById('maxPrice');
    const maxPrice = maxPriceInput && maxPriceInput.value ? parseFloat(maxPriceInput.value) : Infinity;
    const sortSelect = document.getElementById('sortSelect');
    const sortBy = sortSelect ? sortSelect.value : 'name';

    //1. Создаём массив товаров с вычисленной minPrice (это важно для корректной работы)
    let filtered = demoProducts.map(p => ({
        ...p,
        minPrice: p.prices && p.prices.length > 0 ? Math.min(...p.prices.map(pr => pr.price)) : null,
        brand: p.name.split(' ')[0] || ''
    }));

    //Проверяем, включен ли режим и есть ли товары
    if (similarModeTargetId && filtered.length > 0) {
        //Ищем целевой товар В ОБНОВЛЕННОМ массиве (где уже есть minPrice)
        const target = filtered.find(p => p.id === similarModeTargetId);
        
        if (target) {
            console.log(`🔍 Поиск похожего для: ${target.name} (Цена: ${target.minPrice})`);
            
            //Расширяем диапазон до ±50% (было ±30%), чтобы находилось больше товаров
            const targetPrice = target.minPrice || 0;
            const minRange = targetPrice * 0.5; 
            const maxRange = targetPrice * 1.5; 

            filtered = filtered.filter(p => {
                //Исключаем сам исходный товар
                if (p.id === target.id) return false;
                
                //Обязательно та же категория
                if (p.category !== target.category) return false;

                //Проверка цены (если цена у товара есть)
                if (p.minPrice !== null) {
                    if (p.minPrice < minRange || p.minPrice > maxRange) return false;
                }
                
                return true;
            });
            console.log(`✅ Найдено похожих товаров: ${filtered.length}`);
        } else {
            console.warn('⚠️ Целевой товар не найден в базе, показываем всё');
            //Если товар вдруг удалили из базы, сбрасываем режим
            exitSimilarMode();
        }
    }
    //=== КОНЕЦ РЕЖИМА ===

    //3. Фильтрация по категории (Только если мы НЕ в режиме "Похожее")
    //В режиме "Похожее" категория уже отфильтрована выше
    if (category && !similarModeTargetId) {
        filtered = filtered.filter(p => p.category === category);
    }

    //4. Фильтрация по цене (слайдеры/поля ввода)
    filtered = filtered.filter(p => {
        const price = p.minPrice || 0;
        return price >= minPrice && price <= maxPrice;
    });

    //5. Фильтрация по чекбоксам (характеристики)
    Object.keys(selectedCheckboxes).forEach(specKey => {
        const selectedValues = selectedCheckboxes[specKey];
        if (selectedValues.length > 0) {
            filtered = filtered.filter(product =>
                selectedValues.some(value => matchFilter(product, specKey, value))
            );
        }
    });

    //6. Сортировка
    if (sortBy) {
        filtered = sortProductsList(filtered, sortBy);
    }

    //7. Обновляем UI
    updateProductsInfo(filtered.length, category);
    displayProducts(filtered);
}

//Сопоставление фильтров
function matchFilter(product, specKey, filterValue) {
  //Получаем значение характеристики из specs товара
  const specValue = product.specs?.[specKey];

  //Если характеристики нет, или значение пустое, товар не подходит
  if (specValue == null || specValue === '') {
    return false;
  }

  //Нормализуем значения для сравнения
  const normSpecValue = normalizeFilterValue(specValue);
  const normFilterValue = normalizeFilterValue(filterValue);

  //Проверяем точное совпадение
  if (normSpecValue === normFilterValue) {
    return true;
  }

  //Дополнительно: проверим, является ли specValue списком/массивом (если хранится как строка через запятую или точку с запятой)
  if (typeof specValue === 'string') {
    const possibleValues = specValue.split(/[,;]/).map(v => normalizeFilterValue(v.trim()));
    if (possibleValues.includes(normFilterValue)) {
      return true;
    }
  }

  //Для числовых диапазонов (например, "До 4000 mAh", "Свыше 5000 mAh")
  //Проверим, начинается ли filterValue с "до" или "свыше"
  if (normFilterValue.startsWith('до')) {
    const thresholdMatch = normFilterValue.match(/до\s*(\d+)/i);
    if (thresholdMatch) {
      const threshold = parseInt(thresholdMatch[1], 10);
      const specNumMatch = normSpecValue.match(/(\d+)/);
      if (specNumMatch) {
        const specNum = parseInt(specNumMatch[1], 10);
        return specNum <= threshold;
      }
    }
  } else if (normFilterValue.startsWith('свыше')) {
    const thresholdMatch = normFilterValue.match(/свыше\s*(\d+)/i);
    if (thresholdMatch) {
      const threshold = parseInt(thresholdMatch[1], 10);
      const specNumMatch = normSpecValue.match(/(\d+)/);
      if (specNumMatch) {
        const specNum = parseInt(specNumMatch[1], 10);
        return specNum > threshold;
      }
    }
  }

  return false;
}



//Нормализует значение характеристики для сравнения
function normalizeFilterValue(str) {
  if (typeof str !== 'string') {
    //Если значение не строка (например, число), преобразуем в строку
    str = String(str);
  }
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '') //Убираем все пробелы
    .replace(/гб|gb/i, 'gb') //Приводим "ГБ", "гигабайт" к "gb"
    .replace(/мб|mb/i, 'mb')
    .replace(/кб|kb/i, 'kb')
    .replace(/тб|tb/i, 'tb')
    .replace(/дюйм|дюймы|inch/i, 'inch')
    .replace(/вт|w/i, 'w')
    .replace(/мач|mac/i, 'mac') //Пример для процессоров
    .replace(/core\s*i(\d)/i, 'corei$1') 
    
    ;
}

//Функция для обновления информации о товарах
function updateProductsInfo(count, category) {
    const productsCount = document.getElementById('productsCount');
    const currentCategory = document.getElementById('currentCategory');
    
    if (productsCount) {
        productsCount.textContent = `Найдено товаров: ${count}`;
    }
    
    if (currentCategory && category) {
        currentCategory.textContent = `Категория: ${getCategoryName(category)}`;
    } else if (currentCategory) {
        currentCategory.textContent = '';
    }
}

//Сортировка
function sortProductsList(products, sortBy) {
  return [...products].sort((a, b) => {
    switch(sortBy) {
      case 'price_asc':
        return (getMinPrice(a) || 0) - (getMinPrice(b) || 0);
      case 'price_desc':
        return (getMinPrice(b) || 0) - (getMinPrice(a) || 0);
      case 'rating':
        return b.rating - a.rating;
      case 'brand':
        //Извлекаем бренд из названия (до первого пробела)
        const brandA = a.name.split(' ')[0] || '';
        const brandB = b.name.split(' ')[0] || '';
        return brandA.localeCompare(brandB);
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });
}

//Вывод множества товаров в каталоге
function displayProducts(products) {
  const grid = document.getElementById('productsGrid');
  const noResults = document.getElementById('noResults');
  if (!grid) return;

  if (products.length === 0) {
    grid.style.display = 'none';
    if (noResults) noResults.style.display = 'block';
    return;
  }

  grid.style.display = 'grid';
  if (noResults) noResults.style.display = 'none';

  //Добавляем minPrice и brand в каждый товар для удобства фильтрации
  const productsWithMeta = products.map(product => {
    //Минимальная цена
    const minPrice = product.prices && product.prices.length > 0
      ? Math.min(...product.prices.map(p => p.price))
      : null;

    //Бренд — извлекаем из названия (до первого пробела)
    const brand = product.name.split(' ')[0] || '';

    return {
      ...product,
      minPrice,
      brand
    };
  });

  grid.innerHTML = productsWithMeta.map(product => `
    <div class="product-card" onclick="openProduct(${product.id})">
      <img src="${product.image}" alt="${product.name}" 
           style="width: 100%; height: 200px; object-fit: contain; background: #f8f9fa; border-radius: 8px;">
      <h3>${product.name}</h3>
      <div class="product-rating">
        <span class="rating-stars">${getStarRating(product.rating)}</span>
        <span class="rating-value">${product.rating}</span>
      </div>
      <div class="product-price">${formatPrice(product.minPrice)} ₽</div>
      <div class="product-actions">
        <button class="btn btn-outline" onclick="event.stopPropagation(); addToComparison(${product.id})">Сравнить</button>
        <button class="btn btn-primary" onclick="event.stopPropagation(); openProduct(${product.id})">Подробнее</button>
      </div>
    </div>
  `).join('');
}

function resetFilters() {
    document.getElementById('categorySelect').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('dynamicFilters').innerHTML = '';
    selectedCheckboxes = {};
    displayProducts(demoProducts);
}

//===================== КАРТОЧКА ТОВАРА =====================

//ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ СТРАНИЦЫ ТОВАРА
function initializeProductPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id'));

  //Проверка наличия ID
  if (!productId) {
    showCustomNotification('ID товара не указан', 'info');
    window.location.href = 'catalog.html';
    return;
  }

  //Устанавливаем глобальную переменную для кнопок
  currentProductId = productId;

  //Ждём, пока demoProducts загрузится из API
  let attempts = 0;
  const maxAttempts = 50;
  const checkInterval = setInterval(() => {
    if (demoProducts && demoProducts.length > 0) {
      clearInterval(checkInterval);

      //Находим товар по ID
      const product = demoProducts.find(p => p.id === productId);
      if (!product) {
        showCustomNotification('Товар не найден', 'info');
        window.location.href = 'catalog.html';
        return;
      }

      //Отображаем товар
      displayProduct(product);
      trackProductView(productId);
      //Загружаем отзывы
      loadProductReviews(productId);

      //Проверяем, находится ли товар в избранном
      const isFavorite = checkIfFavorite();
      updateFavoriteButton(isFavorite);

    } else {
      attempts++;
      if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        showCustomNotification('Не удалось загрузить данные о товаре', 'error');
        console.error('Таймаут ожидания загрузки товаров');
      }
    }
  }, 100);
}

//Вывод данных по устройству в product.html
function displayProduct(product) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('productContent').style.display = 'block';

 
  document.getElementById('productTitle').textContent = product.name;
  document.getElementById('productCategory').textContent = getCategoryName(product.category);
  document.getElementById('productName').textContent = product.name;

  //Рейтинг
  const ratingStars = getStarRating(product.rating);
  document.getElementById('ratingStars').textContent = ratingStars;
  document.getElementById('ratingValue').textContent = product.rating;

  //Изображение
  const mainImage = document.getElementById('mainProductImage');
  if (mainImage) {
    mainImage.src = product.image || 'https://via.placeholder.com/400?text=Нет+изображения';
    mainImage.alt = product.name;
  }

  const specsList = document.getElementById('productSpecs');
  if (specsList) {

    specsList.innerHTML = Object.entries(product.specs || {}).map(([key, value]) => {
      //Получаем русское название из словаря
      const russianName = specKeyTranslations[key] || key;
      return `
        <div class="spec-item">
          <span>${russianName}:</span> 
          <span>${value}</span>
        </div>
      `;
    }).join('');
  }

  //Цены с графиками
  const priceList = document.getElementById('priceList');
  if (priceList && product.prices) {
    
    const sortedPrices = [...product.prices].sort((a, b) => a.price - b.price);
    

    priceList.innerHTML = sortedPrices.map(price => `
      <div class="price-item">
        <div class="store-info">${price.store}</div>
        <div>${formatPrice(price.price)} ₽</div>
        <a href="${price.url}" target="_blank" class="buy-button" onclick="trackPurchase(${product.id}, '${String(price.store || '').replace(/'/g, "\\'")}')">Купить</a>
      </div>
    `).join('');
  }

  const historySection = document.getElementById('priceChartContainer'); 
  if (historySection) {

    
  } else {
     console.warn('Контейнер для графика истории цен (#priceChartContainer) не найден на странице.');
  }

  //Отзывы
  loadProductReviews(product.id);

  loadAndRenderPriceHistory(product.id, product.prices || []);
  renderValueCalculator(product, document.getElementById('valueCalculatorContainer'));
  
}

//Загрузка и формат данных по истории цен
async function loadAndRenderPriceHistory(productId, currentPrices = []) {
  console.log(`Requesting price history for product ID: ${productId}`);

  //Показываем индикатор загрузки, скрываем canvas (если он был)
  const loadingDiv = document.getElementById('priceChartLoading');
  const container = document.getElementById('priceChartContainer');
  if (loadingDiv) loadingDiv.style.display = 'flex'; //Или 'block', в зависимости от стиля

  try {
    //Формируем URL для запроса к серверу
    const response = await fetch(`http://localhost:3000/api/products/${productId}/price-history`);

    //Проверяем статус ответа
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    //Получаем JSON-данные
    const priceHistoryData = await response.json();
    console.log('Received price history data:', priceHistoryData);

    //Скрываем индикатор загрузки
    if (loadingDiv) loadingDiv.style.display = 'none';

    //Вызываем функцию для отрисовки графика
    renderPriceChart(container, priceHistoryData);
    renderGeneralPriceInsights(currentPrices, priceHistoryData);
    renderStorePriceInsights(currentPrices, priceHistoryData);

  } catch (error) {
    console.error('Error loading price history:', error);
    //Скрываем индикатор загрузки
    if (loadingDiv) loadingDiv.style.display = 'none';
    //Показываем сообщение об ошибке в контейнере
    container.innerHTML = `<p style="color: red; text-align: center;">Ошибка загрузки истории цен: ${error.message}</p>`;
    renderGeneralPriceInsights(currentPrices, {});
    renderStorePriceInsights(currentPrices, {});
  }
}

function renderPriceChart(container, data) {
  console.log("renderPriceChart вызвана с данными:", data); //Отладка

  if (!data || Object.keys(data).length === 0) {
    console.log('No price history data available to render.');
    container.innerHTML = '<p style="text-align: center; color: #666;">История цен отсутствует</p>';
    return;
  }

  const existingCanvas = container.querySelector('canvas');
  if (existingCanvas) {
    existingCanvas.remove();
  }

  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  const datasets = Object.entries(data).map(([storeName, storeData]) => {
    const color = getStoreColor(storeName);
    return {
      label: storeName,
     
      data: storeData.map(point => ({
        x: new Date(point.x).getTime(), 
        y: point.y
      })),
      borderColor: color,
      backgroundColor: color + '20',
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: false,
      tension: 0.1
    };
  });

  const config = {
    type: 'line',
    data: { 
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) label += ': ';
              return label + new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 0
              }).format(context.parsed.y);
            },
            title: function(tooltipItems) {
              
              const rawDate = tooltipItems[0].parsed.x;
             
              const date = new Date(rawDate);
              return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });
            }
          }
        }
      },
      scales: {
        x: {
          type: 'time', 
          time: {
            unit: 'day',
            tooltipFormat: 'dd.MM.yyyy', 
            displayFormats: {
              day: 'dd.MM' 
            }
          },
         
          title: {
            display: true,
            text: 'Дата'
          },
          grid: { display: true }
        },
        y: {
          title: {
            display: true,
            text: 'Цена (₽)'
          },
          grid: { display: true }
        }
      }
    }
  };

  if (window.priceChartInstance) {
    window.priceChartInstance.destroy();
  }
  try {
    window.priceChartInstance = new Chart(canvas, config);
    console.log("График успешно создан.");
  } catch (error) {
    console.error("Ошибка при создании основного графика:", error);
  }
}

function renderGeneralPriceInsights(currentPrices, priceHistoryData) {
  const insightsEl = document.getElementById('priceInsightsGeneral');
  if (!insightsEl) return;

  const normalizedPrices = Array.isArray(currentPrices)
    ? currentPrices
        .map((item) => ({
          store: item.store || item.storeName || 'Магазин',
          price: Number(item.price)
        }))
        .filter((item) => Number.isFinite(item.price) && item.price > 0)
    : [];

  if (!normalizedPrices.length) {
    insightsEl.className = 'price-insights price-insights--neutral';
    insightsEl.innerHTML = `
      <h3>Общая аналитика</h3>
      <p>Недостаточно данных по текущим ценам для точной рекомендации.</p>
    `;
    return;
  }

  const avgMarketPrice = normalizedPrices.reduce((sum, item) => sum + item.price, 0) / normalizedPrices.length;
  const bestOffer = [...normalizedPrices].sort((a, b) => a.price - b.price)[0];
  const historyStoreKey = findHistoryStoreKey(priceHistoryData, bestOffer.store);
  const selectedStoreHistory = normalizeStoreHistory((historyStoreKey && priceHistoryData?.[historyStoreKey]) || []);
  const selectedStoreTrend = calculateRecentTrend(selectedStoreHistory);
  const productTrend = calculateProductTrend(priceHistoryData, normalizedPrices);
  const productForecast = forecastPrice(productTrend.allPoints, avgMarketPrice);

  const evaluation = evaluatePriceSituation(bestOffer.price, avgMarketPrice, selectedStoreTrend);
  const status = evaluation.status;
  const decisionText = evaluation.decisionText;

  const marketDeltaPct = ((bestOffer.price - avgMarketPrice) / avgMarketPrice) * 100;
  const productTrendText = describeTrend(productTrend.trend);
  const productForecastText = describeForecast(productForecast, 'по рынку в целом');

  insightsEl.className = `price-insights price-insights--${status}`;
  insightsEl.innerHTML = `
    <h3>Общая аналитика</h3>
    <p><strong>Рекомендация:</strong> ${decisionText}</p>
    <p>Лучшая цена сейчас: <strong>${formatPrice(bestOffer.price)} ₽</strong> (${bestOffer.store}), это ${marketDeltaPct >= 0 ? 'на' : 'ниже на'} <strong>${Math.abs(marketDeltaPct).toFixed(1)}%</strong> относительно средней цены по магазинам (${formatPrice(avgMarketPrice)} ₽).</p>
    <p><strong>Тренд товара (по всем магазинам):</strong> ${productTrendText}</p>
    <p><strong>Прогноз по товару:</strong> ${productForecastText}</p>
  `;
}

function renderStorePriceInsights(currentPrices, priceHistoryData) {
  const listEl = document.getElementById('storeInsightsList');
  if (!listEl) return;

  const normalizedPrices = Array.isArray(currentPrices)
    ? currentPrices
        .map((item) => ({
          store: item.store || item.storeName || 'Магазин',
          price: Number(item.price)
        }))
        .filter((item) => Number.isFinite(item.price) && item.price > 0)
    : [];

  if (!normalizedPrices.length) {
    listEl.innerHTML = `
      <div class="store-insight-card price-insights--neutral">
        <h4>Аналитика по магазинам</h4>
        <p>Недостаточно данных для расчёта.</p>
      </div>
    `;
    return;
  }

  const avgMarketPrice = normalizedPrices.reduce((sum, item) => sum + item.price, 0) / normalizedPrices.length;
  const sortedByPrice = [...normalizedPrices].sort((a, b) => a.price - b.price);

  listEl.innerHTML = sortedByPrice.map((storeEntry) => {
    const storeColor = getStoreColor(storeEntry.store);
    const cardBg = hexToRgba(storeColor, 0.16);
    const historyStoreKey = findHistoryStoreKey(priceHistoryData, storeEntry.store);
    const storeHistory = normalizeStoreHistory((historyStoreKey && priceHistoryData?.[historyStoreKey]) || []);
    const storeTrend = calculateRecentTrend(storeHistory);
    const storeForecast = forecastPrice(storeHistory, storeEntry.price);
    const evaluation = evaluatePriceSituation(storeEntry.price, avgMarketPrice, storeTrend);
    const diffPct = ((storeEntry.price - avgMarketPrice) / avgMarketPrice) * 100;

    return `
      <div class="store-insight-card price-insights--${evaluation.status}" style="background: ${cardBg}; border-color: ${storeColor}; color: #111111;">
        <h4 style="color: #111111;">${storeEntry.store}</h4>
        <p><strong>Цена:</strong> ${formatPrice(storeEntry.price)} ₽ (${diffPct >= 0 ? '+' : ''}${diffPct.toFixed(1)}% к рынку)</p>
        <p><strong>Изменение за период:</strong> ${describeRecentDelta(storeTrend)}</p>
        <p><strong>Тренд:</strong> ${describeTrendShort(storeTrend)}</p>
        <p><strong>Прогноз:</strong> ${describeForecastShort(storeForecast)}</p>
        <p><strong>Рекомендация:</strong> ${evaluation.shortDecision}</p>
      </div>
    `;
  }).join('');
}

function evaluatePriceSituation(price, avgMarketPrice, trend) {
  const isBelowMarket = price <= avgMarketPrice * 0.98;
  const isAboveMarket = price >= avgMarketPrice * 1.02;
  const isStoreDeclining = trend.direction === 'down';
  const isStoreGrowing = trend.direction === 'up';

  if (isBelowMarket && isStoreDeclining) {
    return {
      status: 'buy',
      decisionText: 'Сейчас выгодная цена: предложение ниже среднерыночного уровня, и у этого магазина цена снижалась в последнее время. Покупать разумно сейчас.',
      shortDecision: 'Можно покупать сейчас.'
    };
  }

  if (isAboveMarket || isStoreGrowing) {
    return {
      status: 'wait',
      decisionText: 'Сейчас покупать не стоит: цена выше среднерыночной или у этого магазина заметен рост цены за последнее время.',
      shortDecision: 'Лучше подождать.'
    };
  }

  return {
    status: 'neutral',
    decisionText: 'Цена близка к среднерыночной. Можно подождать и понаблюдать динамику.',
    shortDecision: 'Нейтрально: решать по срочности.'
  };
}

function normalizeStoreHistory(historyArray) {
  if (!Array.isArray(historyArray)) return [];
  return historyArray
    .map((point) => ({
      timestamp: new Date(point.x).getTime(),
      price: Number(point.y)
    }))
    .filter((point) => Number.isFinite(point.timestamp) && Number.isFinite(point.price) && point.price > 0)
    .sort((a, b) => a.timestamp - b.timestamp);
}

function findHistoryStoreKey(priceHistoryData, storeName) {
  if (!priceHistoryData || typeof priceHistoryData !== 'object') return null;
  if (priceHistoryData[storeName]) return storeName;
  const normalizedTarget = String(storeName || '').trim().toLowerCase();
  return Object.keys(priceHistoryData).find((key) => key.trim().toLowerCase() === normalizedTarget) || null;
}

function hexToRgba(hexColor, alpha = 1) {
  const safeColor = String(hexColor || '').trim();
  const fallback = `rgba(156, 163, 175, ${alpha})`;
  const hex = safeColor.startsWith('#') ? safeColor.slice(1) : safeColor;

  if (![3, 6].includes(hex.length)) return fallback;

  const normalizedHex = hex.length === 3
    ? hex.split('').map((ch) => ch + ch).join('')
    : hex;

  const r = parseInt(normalizedHex.slice(0, 2), 16);
  const g = parseInt(normalizedHex.slice(2, 4), 16);
  const b = parseInt(normalizedHex.slice(4, 6), 16);

  if ([r, g, b].some((v) => Number.isNaN(v))) return fallback;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function calculateRecentTrend(storeHistory) {
  if (!storeHistory.length) {
    return { direction: 'flat', deltaPct: 0 };
  }

  const lastPoints = storeHistory.slice(-8);
  if (lastPoints.length < 2) {
    return { direction: 'flat', deltaPct: 0 };
  }

  const splitIndex = Math.max(1, Math.floor(lastPoints.length / 2));
  const firstWindow = lastPoints.slice(0, splitIndex).map((point) => point.price);
  const secondWindow = lastPoints.slice(splitIndex).map((point) => point.price);

  const startPrice = median(firstWindow);
  const endPrice = median(secondWindow);
  const deltaPct = startPrice > 0 ? ((endPrice - startPrice) / startPrice) * 100 : 0;

  if (deltaPct > 1.5) return { direction: 'up', deltaPct };
  if (deltaPct < -1.5) return { direction: 'down', deltaPct };
  return { direction: 'flat', deltaPct };
}

function calculateProductTrend(priceHistoryData, currentPrices) {
  const allPoints = [];

  if (priceHistoryData && typeof priceHistoryData === 'object') {
    Object.values(priceHistoryData).forEach((storeSeries) => {
      const normalized = normalizeStoreHistory(storeSeries);
      allPoints.push(...normalized);
    });
  }

  if (!allPoints.length) {
    const fallbackAvg = currentPrices.reduce((sum, item) => sum + item.price, 0) / currentPrices.length;
    return {
      trend: { direction: 'flat', deltaPct: 0 },
      allPoints: [{ timestamp: Date.now(), price: fallbackAvg }]
    };
  }

  allPoints.sort((a, b) => a.timestamp - b.timestamp);
  const trend = calculateRecentTrend(allPoints);
  return { trend, allPoints };
}

function forecastPrice(seriesPoints, fallbackPrice) {
  if (!Array.isArray(seriesPoints) || !seriesPoints.length) {
    return { direction: 'flat', predictedPrice: fallbackPrice, deltaPct: 0 };
  }

  const recent = seriesPoints.slice(-12);
  const lastKnown = recent[recent.length - 1].price;

  if (recent.length < 3) {
    return { direction: 'flat', predictedPrice: lastKnown || fallbackPrice, deltaPct: 0 };
  }

  const firstTs = recent[0].timestamp;
  const xValues = recent.map((point) => (point.timestamp - firstTs) / (24 * 3600 * 1000));
  const yValues = recent.map((point) => point.price);
  const meanX = xValues.reduce((a, b) => a + b, 0) / xValues.length;
  const meanY = yValues.reduce((a, b) => a + b, 0) / yValues.length;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < xValues.length; i += 1) {
    numerator += (xValues[i] - meanX) * (yValues[i] - meanY);
    denominator += (xValues[i] - meanX) ** 2;
  }

  const slopePerDay = denominator > 0 ? numerator / denominator : 0;
  const horizonDays = 7;
  const rawPredictedPrice = Math.max(1, lastKnown + slopePerDay * horizonDays);
  const rawDeltaPct = lastKnown > 0 ? ((rawPredictedPrice - lastKnown) / lastKnown) * 100 : 0;

  //Убираем аномальные скачки прогноза через ограничение по волатильности
  const maxRecentMovePct = getRecentVolatilityPercent(recent);
  const maxAllowedDeltaPct = Math.min(20, Math.max(4, maxRecentMovePct * 1.8 + 2));
  const boundedDeltaPct = clamp(rawDeltaPct, -maxAllowedDeltaPct, maxAllowedDeltaPct);

  const historicalMin = Math.min(...recent.map((point) => point.price));
  const historicalMax = Math.max(...recent.map((point) => point.price));
  const volatilityFloor = historicalMin * 0.85;
  const volatilityCeil = historicalMax * 1.15;

  const predictedByDelta = lastKnown * (1 + boundedDeltaPct / 100);
  const predictedPrice = clamp(predictedByDelta, volatilityFloor, volatilityCeil);
  const deltaPct = lastKnown > 0 ? ((predictedPrice - lastKnown) / lastKnown) * 100 : 0;

  if (deltaPct > 1.5) return { direction: 'up', predictedPrice, deltaPct };
  if (deltaPct < -1.5) return { direction: 'down', predictedPrice, deltaPct };
  return { direction: 'flat', predictedPrice, deltaPct };
}

function getRecentVolatilityPercent(seriesPoints) {
  if (!Array.isArray(seriesPoints) || seriesPoints.length < 2) return 0;

  const changes = [];
  for (let i = 1; i < seriesPoints.length; i += 1) {
    const prevPrice = seriesPoints[i - 1].price;
    const currPrice = seriesPoints[i].price;
    if (prevPrice > 0) {
      changes.push(Math.abs(((currPrice - prevPrice) / prevPrice) * 100));
    }
  }

  if (!changes.length) return 0;
  return median(changes);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function median(values) {
  if (!Array.isArray(values) || !values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function describeTrend(trend) {
  if (!trend) return 'Данных недостаточно.';
  if (trend.direction === 'up') return `цена росла примерно на ${Math.abs(trend.deltaPct).toFixed(1)}% за последний период.`;
  if (trend.direction === 'down') return `цена снижалась примерно на ${Math.abs(trend.deltaPct).toFixed(1)}% за последний период.`;
  return 'существенных колебаний за последний период не выявлено.';
}

function describeTrendShort(trend) {
  if (!trend) return 'нет данных.';
  if (trend.direction === 'up') return `рост (${Math.abs(trend.deltaPct).toFixed(1)}%).`;
  if (trend.direction === 'down') return `снижение (${Math.abs(trend.deltaPct).toFixed(1)}%).`;
  return 'без явных изменений.';
}

function describeRecentDelta(trend) {
  if (!trend || !Number.isFinite(trend.deltaPct)) return 'недостаточно данных.';
  if (trend.direction === 'up') return `цена выросла на ${Math.abs(trend.deltaPct).toFixed(1)}%.`;
  if (trend.direction === 'down') return `цена снизилась на ${Math.abs(trend.deltaPct).toFixed(1)}%.`;
  return `изменение около ${Math.abs(trend.deltaPct).toFixed(1)}%.`;
}

function describeForecast(forecast, scopeLabel) {
  if (!forecast || !Number.isFinite(forecast.predictedPrice)) {
    return `Прогноз ${scopeLabel} пока недоступен.`;
  }
  if (forecast.direction === 'up') {
    return `По модели линейного тренда ${scopeLabel} цена может вырасти до ${formatPrice(forecast.predictedPrice)} ₽ в ближайшую неделю.`;
  }
  if (forecast.direction === 'down') {
    return `По модели линейного тренда ${scopeLabel} цена может снизиться до ${formatPrice(forecast.predictedPrice)} ₽ в ближайшую неделю.`;
  }
  return `По модели линейного тренда ${scopeLabel} ожидается стабильный уровень около ${formatPrice(forecast.predictedPrice)} ₽ в ближайшую неделю.`;
}

function describeForecastShort(forecast) {
  if (!forecast || !Number.isFinite(forecast.predictedPrice)) return 'недостаточно данных.';
  if (forecast.direction === 'up') return `возможен рост до ${formatPrice(forecast.predictedPrice)} ₽.`;
  if (forecast.direction === 'down') return `возможно снижение до ${formatPrice(forecast.predictedPrice)} ₽.`;
  return `ожидается около ${formatPrice(forecast.predictedPrice)} ₽.`;
}

async function renderMiniPriceChartInComparison(containerId, productId) {
  const chartContainer = document.getElementById(containerId);
  if (!chartContainer) {
    console.error(`Контейнер для мини-графика ${containerId} не найден.`);
    return;
  }

  //Показываем заглушку
  chartContainer.innerHTML = '<p>Загрузка графика...</p>';

  try {
    const response = await fetch(`http://localhost:3000/api/products/${productId}/price-history`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();

    if (!data || Object.keys(data).length === 0) {
      chartContainer.innerHTML = '<p style="color: #666;">Нет данных</p>';
      return;
    }

    //Удаляем заглушку, создаём canvas
    chartContainer.innerHTML = '';
    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);

    //Подготовим данные, как в renderPriceChart
    const datasets = Object.entries(data).map(([storeName, storeData]) => {
      const color = getStoreColor(storeName);
      return {
        label: storeName,
        data: storeData.map(point => ({
          x: new Date(point.x).getTime(), 
          y: point.y
        })),
        borderColor: color,
        backgroundColor: color + '20',
        borderWidth: 1, 
        pointRadius: 2, 
        pointHoverRadius: 3,
        fill: false,
        tension: 0.1
      };
    });

    //Упрощённая конфигурация для мини-графика
    const config = {
      type: 'line',
      data: { datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false, 
        plugins: {
          legend: {
            display: true, 
            position: 'bottom',
            labels: {
              
              font: { size: 10 }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            
            bodyFont: { size: 11 },
            titleFont: { size: 12 },
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                return label + new Intl.NumberFormat('ru-RU', {
                  style: 'currency',
                  currency: 'RUB',
                  minimumFractionDigits: 0
                }).format(context.parsed.y);
              },
              title: function(tooltipItems) {
                const rawDate = tooltipItems[0].parsed.x;
                const date = new Date(rawDate);
                return date.toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                });
              }
            }
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
              tooltipFormat: 'dd.MM.yyyy',
              displayFormats: {
                day: 'dd.MM'
              }
            },
            
            title: {
              display: false 
            },
            grid: { display: true },
            ticks: {
              maxRotation: 0, 
              autoSkip: true, 
              maxTicksLimit: 3, 
              font: { size: 10 } 
            }
          },
          y: {
            title: {
              display: false 
            },
            grid: { display: true },
            ticks: {
              maxTicksLimit: 3, 
              font: { size: 10 } 
              
            }
          }
        }
      }
    };

    //Уничтожаем старый экземпляр, если есть
    if (window[`miniChartInstance_${productId}`]) {
      window[`miniChartInstance_${productId}`].destroy();
    }

    //Создаём и сохраняем экземпляр
    window[`miniChartInstance_${productId}`] = new Chart(canvas, config);

  } catch (error) {
    console.error(`Ошибка при отрисовке мини-графика для товара ${productId}:`, error);
    chartContainer.innerHTML = `<p style="color: red;">Ошибка: ${error.message}</p>`;
  }
}

//Вспомогательная функция для генерации случайного цвета
function getStoreColor(storeName) {
  //Приводим имя магазина к нижнему регистру для нечувствительности к регистру
  const normalizedStoreName = storeName.toLowerCase();

  //Определяем цвета для известных магазинов
  const colorMap = {
    'dns': '#f97316', //Оранжевый (DNS-shop)
    'dns-shop': '#f97316', //На случай, если приходит 'DNS-shop'
    'dns shop': '#f97316', //На случай, если приходит 'DNS Shop'
    'ozon': '#1d4ed8', //Синий (OZON)
    'ozon.ru': '#1d4ed8', //На случай, если приходит 'OZON.ru'
    'mvideo': '#dc2626', //Красный (М.Видео)
    'm.video': '#dc2626', //На случай, если приходит 'М.Видео' как 'M.Video'
    'eldorado': '#10b981', //Изумрудный (Эльдорадо)
    'citilink': '#8b5cf6', //Фиолетовый (Ситилинк)
    'avito': '#059669', //Тёмно-зелёный (Avito)
    'avito marketplace': '#059669', //На случай, если приходит полное название
    'yandex market': '#ff9900', //Жёлтый (Яндекс.Маркет)
    'wildberries': '#ff0000', //Ярко-красный (Wildberries)
    'aliexpress': '#ff6600', //Оранжево-красный (AliExpress)
    'amazon': '#ff9900', //Жёлтый (Amazon)
    'ebay': '#0a3069', //Тёмно-синий (eBay)
    'bestbuy': '#003b64', //Тёмно-синий (Best Buy)
    'walmart': '#007dc6', 
    'target': '#cc0000', 
    'apple': '#a2aaad', 
    'samsung': '#1428a0', 
    'xiaomi': '#ff6600', 
    'huawei': '#e01e24', 
    'google': '#4285f4', 
    'asus': '#000000', 
    'lenovo': '#d9006c', 
    'hp': '#0096d6', 
    'dell': '#007db8', 
    'acer': '#83004c', 
    'msi': '#ff0000', 
    'lg': '#005fa7', 
    'sony': '#000000', 
    'nokia': '#085a9e', 
    'lg electronics': '#005fa7', 
    'apple inc.': '#a2aaad', 
  };

  //Возвращаем цвет из карты, если он найден, иначе возвращаем серый как резервный вариант
  return colorMap[normalizedStoreName] || '#9ca3af'; //'#9ca3af' - серый цвет по умолчанию
}

function trackPurchase(productId, store) {
    console.log(`Покупка товара ${productId} в магазине ${store}`);
    if (!productId) return;
    const token = localStorage.getItem('techAggregatorToken');
    fetch('http://localhost:3000/api/analytics/track-purchase', {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        productId: parseInt(productId, 10),
        storeName: store || null
      })
    }).catch((error) => {
      console.warn('Не удалось записать переход к покупке:', error);
    });
}

//===================== ОТЗЫВЫ И ЗАПРОСЫ =====================

function showReviewModal() {
    if (!checkAuth()) {
        showAuthModal();
        return;
    }
    document.getElementById('reviewModal').style.display = 'block';
}

function showRequestModal() {
    if (!checkAuth()) {
        showAuthModal();
        return;
    }
    document.getElementById('requestModal').style.display = 'block';
}

async function loadProductReviews(productId) {
  const reviewsList = document.getElementById('reviewsList');
  if (!reviewsList) {
    console.error('Элемент списка отзывов (#reviewsList) не найден.');
    return;
  }

  try {
    reviewsList.innerHTML = '<p>Загрузка отзывов...</p>';

    const response = await fetch(`http://localhost:3000/api/products/${productId}/reviews`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const reviews = await response.json();
    console.log(`Загружено ${reviews.length} отзывов для товара ID ${productId}`);

    if (reviews.length === 0) {
      reviewsList.innerHTML = '<p>Пока нет отзывов об этом товаре.</p>';
      return;
    }

    //Формируем HTML для отзывов
    reviewsList.innerHTML = reviews.map(review => {
      const date = new Date(review.createdAt); //Используем правильное имя поля даты
      const formattedDate = date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

      //Используем userName из отзыва (или fullName из связанного user, если доступен)
      const displayName = review.user?.fullName || review.userName || 'Аноним';

      
      //Если поле null или undefined или пустая строка, показываем "Без комментария"
      const commentText = review.comment || review.text; 
      const displayText = commentText ? commentText : '<em>Без комментария</em>';

      return `
        <div class="review-item">
          <div class="review-header">
            <div>
              <strong>${displayName}</strong>
              ${review.verified ? '<span class="verified-badge">✓ Проверенный покупатель</span>' : ''}
            </div>
            <div class="review-rating-and-date">
              <div class="review-rating">
                ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
              </div>
              <div class="review-date">${formattedDate}</div>
            </div>
          </div>
          <p class="review-text">${displayText}</p> 
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Ошибка загрузки отзывов:', error);
    reviewsList.innerHTML = `<p style="color: red;">Ошибка загрузки отзывов: ${error.message}</p>`;
  }
}

//===================== АВТОРИЗАЦИЯ =====================

function checkAuth() {
    return currentUser !== null;
}

function showAuthModal() {
    //Если на странице есть модальное окно авторизации
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.style.display = 'block';
    } else {
        //Иначе перенаправляем на страницу авторизации
        //window.location.href = 'auth.html';
    }
}

function showRegModal() {
    const regModal = document.getElementById('regModal');
    if (regModal) {
        regModal.style.display = 'block';
    } else {
        window.location.href = 'auth.html?tab=register';
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('techAggregatorUser');
    updateAuthButtons();
    showCustomNotification('Вы успешно вышли из системы', 'info');
    window.location.href = 'index.html';
}

//===================== УТИЛИТЫ =====================

function getStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
}

function formatPrice(price) {
  if (price == null || isNaN(price)) return '—';
  return Number(price).toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

function getMinPrice(product) {
  if (!product.prices || product.prices.length === 0) return null;
  return Math.min(...product.prices.map(p => p.price));
}

function getCategoryName(category) {
    const names = {
        smartphones: 'Смартфоны',
        laptops: 'Ноутбуки',
        tv: 'Телевизоры',
        headphones: 'Наушники'
    };
    return names[category] || category;
}

//Открытие странички товара
function openProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

//Загрузка данных пользователя
function loadUserData() {
  const token = localStorage.getItem('techAggregatorToken'); 
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      //Проверяем срок действия (в миллисекундах)
      if (payload.exp * 1000 > Date.now()) {
        currentUser = {
          id: payload.id,        
          email: payload.email,  
          name: payload.fullName || payload.email.split('@')[0], 
          role: payload.role || 'user' 
        };
        updateAuthButtons();
        return; 
      } else {
        //Токен просрочен — удаляем
        localStorage.removeItem('techAggregatorToken');
      }
    } catch (e) {
      console.warn('Невалидный токен:', e);
      localStorage.removeItem('techAggregatorToken');
    }
  }
  //Если токен не был или был просрочен/неправильный
  currentUser = null;
  updateAuthButtons();
}

//Обновление кнопок авторизации
function updateAuthButtons() {
  const authButtons = document.querySelector('.auth-buttons');
  if (!authButtons) return;

  if (currentUser) {
    authButtons.innerHTML = `
      <span style="margin-right: 1rem;">Привет, ${currentUser.name}</span>
      <a href="profile.html" class="btn btn-outline">Профиль</a>
      <button class="btn btn-outline" onclick="logout()">Выйти</button>
    `;
  } else {
    authButtons.innerHTML = `
      <a class="btn btn-outline" href="auth.html">Войти</a>
      <a class="btn btn-primary" href="auth.html"">Регистрация</a>
    `;
  }
}

//Функция обновления счетчика сравнения
async function updateComparisonCounter() {
  const token = localStorage.getItem('techAggregatorToken');
  if (!token) {
    //Для неавторизованных — счётчик 0
    document.querySelectorAll('.comparison-counter').forEach(el => {
      el.textContent = '0';
      el.style.background = '';
    });
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/comparisons', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const comparisons = res.ok ? await res.json() : [];
    const count = comparisons.length;

    document.querySelectorAll('.comparison-counter').forEach(counter => {
      counter.textContent = count;
      if (count > 0) {
        counter.style.background = '#ef4444';
        counter.style.color = 'white';
        counter.style.padding = '2px 8px';
        counter.style.borderRadius = '10px';
        counter.style.fontSize = '0.85rem';
        counter.style.marginLeft = '5px';
      } else {
        counter.style.background = '';
        counter.style.color = '';
        counter.style.padding = '';
        counter.style.borderRadius = '';
        counter.style.fontSize = '';
        counter.style.marginLeft = '';
      }
    });
  } catch (err) {
    console.error('Ошибка загрузки счётчика:', err);
    //В случае ошибки — скрываем счётчик
    document.querySelectorAll('.comparison-counter').forEach(el => {
      el.textContent = '0';
      el.style.background = '';
    });
  }
}

//Добавление в сравнение
async function addToComparison(productId) {
  const token = localStorage.getItem('techAggregatorToken');
  
  if (!token) {
    showCustomNotification('Войдите в аккаунт', 'info');
    //window.location.href = 'auth.html';
    return;
  }

  //Находим товар
  const product = demoProducts.find(p => p.id === productId);
  if (!product) {
    showCustomNotification('Товар не найден', 'error');
    return;
  }

  try {
    //Сначала получаем текущие товары в сравнении
    const res = await fetch('http://localhost:3000/api/comparisons', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const currentComparisons = res.ok ? await res.json() : [];

    //Проверяем категорию
    if (currentComparisons.length > 0) {
      const firstCategory = currentComparisons[0].category;
      if (firstCategory !== product.category) {
        showCustomNotification(
          `Можно сравнивать только товары категории "${getCategoryName(firstCategory)}"`,
          'warning'
        );
        return;
      }
    }

    //Проверяем лимит (макс. 4 товара)
    if (currentComparisons.length >= 4) {
      showCustomNotification('Максимум 4 товара для сравнения', 'warning');
      return;
    }

    //Отправляем запрос на добавление
    const addRes = await fetch('http://localhost:3000/api/comparisons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ productId })
    });

    if (addRes.ok) {
      showCustomNotification(`${product.name} добавлен в сравнение`, 'success');
      updateComparisonCounter();
      if (window.location.pathname.includes('profile.html')) {
        loadProfileDataFromAPI();
      }
    } else {
      const data = await addRes.json();
      showCustomNotification(data.error || 'Ошибка добавления', 'error');
    }
  } catch (err) {
    console.error('Ошибка:', err);
    showCustomNotification('Не удалось подключиться к серверу', 'error');
  }
}

//Добавление в избранное
async function addToFavorites(productId) {
  if (!productId || typeof productId !== 'number') {
    console.error('addToFavorites: неверный productId', productId);
    showCustomNotification('Не удалось определить товар', 'error');
    return;
  }

  const token = localStorage.getItem('techAggregatorToken');
  if (!token) {
    showCustomNotification('Войдите в аккаунт', 'info');
    //window.location.href = 'auth.html';
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId })
    });

    if (res.ok) {
      const product = demoProducts.find(p => p.id === productId);
      showCustomNotification(`${product?.name || 'Товар'} добавлен в избранное`, 'success');
      //Обновляем кнопку
      updateFavoriteButton(true);
      //Если на странице профиля — обновляем данные
      if (window.location.pathname.includes('profile.html')) {
        loadProfileDataFromAPI();
      }
    } else {
      const data = await res.json();
      showCustomNotification(data.error || 'Ошибка добавления', 'error');
    }
  } catch (err) {
    console.error('Ошибка избранного:', err);
    showCustomNotification('Не удалось подключиться к серверу', 'error');
  }
}

//Функция для добавления текущего товара в сравнение (со страницы товара)
function addCurrentProductToComparison() {
    //Получаем ID товара из URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        showCustomNotification('Не удалось определить товар', 'error');
        console.error('Product ID not found in URL');
        return;
    }
    
    //Преобразуем в число и вызываем основную функцию
    addToComparison(parseInt(productId));
}


//Удаления из сравнения 1 товара
async function removeFromComparison(productId) {
  const token = localStorage.getItem('techAggregatorToken');
  if (!token) {
    showCustomNotification('Войдите в аккаунт', 'info');
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/comparisons/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      showCustomNotification('Удалено из сравнения', 'info');
      //Обновляем профиль и страницу сравнения
      if (window.location.pathname.includes('profile.html')) {
        loadProfileDataFromAPI();
      }
      if (window.location.pathname.includes('comparison.html')) {
        initializeComparisonPage();
      }
    } else {
      const data = await res.json();
      showCustomNotification(data.error || 'Ошибка удаления', 'error');
    }
  } catch (err) {
    console.error('Ошибка:', err);
    showCustomNotification('Не удалось подключиться к серверу', 'error');
  }
}

//Полная очистка сравнения
function clearComparison() {
    if (comparisonList.length === 0) {
        showNotification('Список пуст', 'info');
        return;
    }
    
    comparisonList = [];
    localStorage.removeItem('techAggregatorComparison');
    updateComparisonCounter();
    
    if (window.location.pathname.includes('comparison.html') && window.comparisonReload) {
        window.comparisonReload();
    }
    
    showNotification('Сравнение очищено', 'info');
}

//Уведомления
function showNotification(message, type = 'info', action = null) {
    //Создаем уведомление
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : 
                     type === 'warning' ? '#f59e0b' : 
                     type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 15px;
        animation: slideIn 0.3s ease;
    `;
    
    let actionButton = '';
    if (action && action.type === 'comparison' && comparisonList.length > 0) {
        actionButton = `
            <button onclick="window.location.href='comparison.html'" 
                    style="padding: 4px 12px; background: rgba(255,255,255,0.2); 
                           border: 1px solid rgba(255,255,255,0.3); border-radius: 4px; 
                           color: white; cursor: pointer; font-size: 14px;">
                Перейти к сравнению
            </button>
        `;
    }
    
    notification.innerHTML = `
        <span>${message}</span>
        ${actionButton}
        <button onclick="this.parentElement.remove()" 
                style="background: none; border: none; color: white; 
                       font-size: 20px; cursor: pointer; padding: 0 0 0 10px;">
            &times;
        </button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

//Форма запросов на добавление, отзывов
document.addEventListener('DOMContentLoaded', function() {
    //Обработчики для модальных окон
    const reviewForm = document.getElementById('reviewForm');
    const requestForm = document.getElementById('requestForm');
    const addProductForm = document.getElementById('addProductForm');
    
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitReview(e);
        });
    }
    
    if (requestForm) {
        requestForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitRequest();
        });
    }
    
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
    
            showCustomNotification('Товар добавлен в каталог - будет реализовано в бэкенде', 'info');
            closeAddProductModal();
        });
    }
    
    //Закрытие модальных окон при клике вне их
    window.onclick = function(event) {
        const modals = document.getElementsByClassName('modal');
        for (let modal of modals) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        }
    };
});

function searchProductsGlobal() {
    const mainSearch = document.getElementById('mainSearch');
const query = mainSearch && mainSearch.value ? mainSearch.value.toLowerCase() : '';
    if (query) {
        
        window.location.href = `catalog.html?search=${encodeURIComponent(query)}`;
    }
}
//Переход к категории
function navigateToCategory(category) {
    window.location.href = `catalog.html?category=${category}`;
}

//Функции для работы с модальными окнами
function closeReviewModal() {
    document.getElementById('reviewModal').style.display = 'none';
}

function closeRequestModal() {
    document.getElementById('requestModal').style.display = 'none';
}

function closeAddProductModal() {
    document.getElementById('addProductModal').style.display = 'none';
}

//Обновляем функцию updateComparisonDisplay
function updateComparisonDisplay() {
    console.log('updateComparisonDisplay: товаров =', comparisonList.length);
    
    const emptyState = document.getElementById('emptyComparison');
    const comparisonTable = document.getElementById('comparisonTable');
    const comparisonCount = document.getElementById('comparisonCount');
    const comparisonCategory = document.getElementById('comparisonCategory');
    const comparisonContent = document.getElementById('comparisonContent');
    
    //Проверяем элементы
    const elementsFound = {
        emptyState: !!emptyState,
        comparisonTable: !!comparisonTable,
        comparisonCount: !!comparisonCount,
        comparisonCategory: !!comparisonCategory,
        comparisonContent: !!comparisonContent
    };
    console.log('Найденные элементы:', elementsFound);
    
    if (!emptyState || !comparisonTable) {
        console.error('Критические элементы не найдены');
        return;
    }
    
    if (comparisonList.length === 0) {
        console.log('Показываем пустое состояние');
        emptyState.style.display = 'block';
        comparisonTable.style.display = 'none';
        if (comparisonCount) comparisonCount.textContent = '0';
        if (comparisonCategory) {
            comparisonCategory.textContent = 'Выберите товары для сравнения';
            comparisonCategory.style.color = '#6b7280';
        }
    } else {
        console.log('Показываем таблицу сравнения');
        emptyState.style.display = 'none';
        comparisonTable.style.display = 'block';
        
        //Обновляем счетчик
        if (comparisonCount) {
            comparisonCount.textContent = comparisonList.length;
            console.log('Счетчик обновлен:', comparisonList.length);
        }
        
        //Обновляем информацию о категории
        if (comparisonCategory && comparisonList.length > 0) {
            const categoryName = getCategoryName(comparisonList[0].category);
            comparisonCategory.innerHTML = `
                <span style="font-weight: 600; color: #2563eb;">${categoryName}</span>
                <span style="color: #6b7280; margin-left: 1rem;">
                    ${comparisonList.length} товар${comparisonList.length > 1 ? 'а' : ''} для сравнения
                </span>
            `;
        }
        
        //Отрисовываем таблицу сравнения
        if (comparisonContent) {
            console.log('Начинаем отрисовку в comparisonContent');
            renderComparisonTable(comparisonContent);
        } else {
            console.error('Элемент comparisonContent не найден');
            //Пробуем создать его
            createComparisonContent();
        }
    }
    
    //Обновляем счетчик в шапке
    updateComparisonCounter();
}

function createComparisonContent() {
    console.log('Создаем элемент comparisonContent');
    const comparisonTable = document.getElementById('comparisonTable');
    if (comparisonTable) {
        //Находим или создаем контейнер для контента
        let content = document.getElementById('comparisonContent');
        if (!content) {
            content = document.createElement('div');
            content.id = 'comparisonContent';
            //Вставляем после кнопок управления
            const controls = comparisonTable.querySelector('.comparison-controls');
            if (controls && controls.nextSibling) {
                controls.parentNode.insertBefore(content, controls.nextSibling);
            } else {
                comparisonTable.appendChild(content);
            }
            console.log('Создан новый элемент comparisonContent');
        }
        renderComparisonTable(content);
    }
}



//Инициализация админ-панели (если на странице)
function initializeAdminPage() {
    //Проверка прав доступа
    if (!currentUser || currentUser.role !== 'admin') {
        showCustomNotification('Доступ запрещён', 'info');
        window.location.href = 'index.html';
        return;
    }
    updateMainStats();
    setInterval(updateMainStats, 60000);
    loadAnalyticsData();
  loadPopularSearches();
  initializeAdminProductSearch();
  initializeAdminPriceSyncControls();
}

//Функции для поиска с подсказками
function showSearchSuggestions() {
    const searchInput = document.getElementById('mainSearch');
    const suggestionsContainer = document.getElementById('searchSuggestions');
    
    if (!searchInput || !suggestionsContainer) return;
    
    const query = searchInput.value.toLowerCase().trim();
    
    if (query.length < 2) {
        suggestionsContainer.style.display = 'none';
        return;
    }
    
    //Фильтруем товары по запросу
    const filteredProducts = demoProducts.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        Object.values(product.specs).some(value => 
            value.toString().toLowerCase().includes(query)
        )
    ).slice(0, 5); //Ограничиваем 5 подсказками
    
    if (filteredProducts.length === 0) {
        suggestionsContainer.style.display = 'none';
        return;
    }
    
    //Показываем подсказки
    suggestionsContainer.innerHTML = filteredProducts.map(product => `
        <div class="search-suggestion-item" onclick="selectSearchSuggestion(${product.id})">
            <img src="${product.image}" alt="${product.name}">
            <div class="search-suggestion-info">
                <div class="search-suggestion-name">${product.name}</div>
                <div class="search-suggestion-category">${getCategoryName(product.category)} • ${formatPrice(product.price)} ₽</div>
            </div>
        </div>
    `).join('');
    
    suggestionsContainer.style.display = 'block';
}

function selectSearchSuggestion(productId) {
    const product = demoProducts.find(p => p.id === productId);
    if (product) {
        document.getElementById('mainSearch').value = product.name;
        document.getElementById('searchSuggestions').style.display = 'none';
        openProduct(productId);
    }
}

//Нажатие на энтер в поиске
function handleSearchEnter(event) {
    if (event.key === 'Enter') {
        searchProducts();
        document.getElementById('searchSuggestions').style.display = 'none';
    }
}

//Поиск
function searchProducts() {
    const query = document.getElementById('mainSearch').value.trim();
    if (query) {
      trackSearchQuery(query);
        document.getElementById('searchSuggestions').style.display = 'none';
        window.location.href = `catalog.html?search=${encodeURIComponent(query)}`;
    }
}

//Закрытие подсказок при клике вне области
document.addEventListener('click', function(event) {
    const searchContainer = document.querySelector('.search-wrapper');
    const suggestions = document.getElementById('searchSuggestions');
    
    if (searchContainer && suggestions && 
        !searchContainer.contains(event.target) && 
        suggestions.style.display === 'block') {
        suggestions.style.display = 'none';
    }
});

//Инициализация страницы сравнения
async function initializeComparisonPage() {
  console.log('--- Начало инициализации сравнения ---');
  const token = localStorage.getItem('techAggregatorToken');
  if (!token) {
    showCustomNotification('Войдите в аккаунт', 'info');
    //window.location.href = 'auth.html';
    return;
  }

  try {
    //Убедиться, что demoProducts загружены
    console.log('Проверка demoProducts...');
    if (!window.demoProducts || window.demoProducts.length === 0) {
      console.log('demoProducts пусты, загружаем из API...');
      await loadProductsFromAPI(); //Ждём завершения загрузки
      console.log('Загрузка demoProducts завершена, длина:', window.demoProducts.length);
    } else {
      console.log('demoProducts уже загружены, длина: ' + window.demoProducts.length);
    }

    //Загрузить сравнения с сервера
    console.log('Загрузка сравнений из API...');
    const res = await fetch('http://localhost:3000/api/comparisons', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const apiComparisons = await res.json();
    console.log('Получено сравнений из API:', apiComparisons.length);
    console.log('Пример данных из API (первый элемент):', apiComparisons.length > 0 ? apiComparisons[0] : 'Нет данных');

    //Преобразовать apiComparisons в формат, совместимый с demoProducts
    const products = window.demoProducts; 

    comparisonList = apiComparisons
      .filter(item => {
         console.log('DEBUG FILTER: item =', item);
         const hasValidId = item && item.id !== undefined && item.id !== null;
         console.log('DEBUG FILTER: item.id (используем как product id) =', item.id, ', hasValidId =', hasValidId);
         return hasValidId;
      })
      .map(item => {
        
        console.log('DEBUG MAP: item.id (как product id, до Number):', item.id, '(type:', typeof item.id, ')');
        const targetId = Number(item.id); //Явно приводим ID из item к числу

        //Попробуем найти товар в demoProducts по id (для актуальных спецификаций и цен)
        const existingProductInDemo = products.find(p => Number(p.id) === targetId);

        if (existingProductInDemo) {
          console.log(`DEBUG MAP: Найден товар в demoProducts для ID ${targetId} через item.id: ${existingProductInDemo.name}`);
          //Возвращаем данные из demoProducts (они уже в нужном формате)
          return existingProductInDemo;
        } else {
          console.warn(`DEBUG MAP: Товар ID ${targetId} не найден в demoProducts, используем данные из API.`);
          console.log('DEBUG MAP: Структура item из API:', item);

         
          //Преобразуем specs
          let specsObj = {};
          if (Array.isArray(item.specs)) {
              item.specs.forEach(spec => {
                  specsObj[spec.specKey] = spec.specValue;
              });
          } else {
             
              specsObj = item.specs || {};
          }

          const pricesArr = Array.isArray(item.prices) ? item.prices : [];

          //Возвращаем объект в формате demoProducts
          return {
            id: targetId, 
            name: item.name,
            image: item.imageUrl,
            category: item.category,
            rating: item.rating,
            specs: specsObj, 
            prices: pricesArr 
          };
        }
      });

    console.log('--- Сформирован comparisonList (итоговый):', comparisonList);
    console.log('--- Длина comparisonList:', comparisonList.length);

    //Ищем контейнер и отрисовываем таблицу
    const container = document.querySelector('.comparison-container') || document.getElementById('comparisonTable');
    if (container) {
      console.log('Контейнер для таблицы найден, рендерим...');
      renderComparisonTable(container);
    } else {
      console.error('Контейнер .comparison-container или #comparisonTable не найден на странице comparison.html');
    }

    updateComparisonCounter();

  } catch (err) {
    console.error('Ошибка инициализации сравнения:', err);
    showCustomNotification('Не удалось загрузить сравнение', 'error');
  }
}

function showEmptyState() {
  document.getElementById('emptyState')?.classList.remove('hidden');
  document.getElementById('emptyState')?.classList.add('visible');
  document.getElementById('comparisonTable')?.classList.add('hidden');
  document.getElementById('comparisonCount').textContent = '0';
}

//Обновляем функцию clearComparison:
function clearComparison() {
    comparisonList = [];
    localStorage.removeItem('techAggregatorComparison');
    updateComparisonDisplay();
    updateComparisonCounter();
    showNotification('Список сравнения очищен');
}

//Обновляем функцию updateComparisonDisplay для страницы сравнения:
function updateComparisonDisplay() {
    const emptyState = document.getElementById('comparisonEmpty');
    const content = document.getElementById('comparisonContent');
    
    if (!emptyState || !content) return;
    
    if (comparisonList.length === 0) {
        emptyState.style.display = 'block';
        content.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        content.style.display = 'block';
        renderComparisonTable();
    }
}

//Добавляем функцию загрузки предложенных товаров:
function loadSuggestedProducts() {
    const suggestedGrid = document.getElementById('suggestedProducts');
    if (!suggestedGrid) return;
    
    if (comparisonList.length === 0) {
        //Показываем популярные товары
        const popular = [...demoProducts]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 4);
        
        suggestedGrid.innerHTML = popular.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" 
                     onclick="openProduct(${product.id})"
                     style="width: 100%; height: 200px; object-fit: contain; background: #f8f9fa; border-radius: 8px; cursor: pointer;">
                <h3 onclick="openProduct(${product.id})" style="cursor: pointer;">${product.name}</h3>
                <div class="product-rating">
                    <span class="rating-stars">${getStarRating(product.rating)}</span>
                    <span class="rating-value">${product.rating}</span>
                </div>
                <div class="product-price">${formatPrice(product.price)} ₽</div>
                <div class="product-actions">
                    <button class="btn btn-outline" onclick="event.stopPropagation(); addToComparison(${product.id})">
                        Сравнить
                    </button>
                    <button class="btn btn-primary" onclick="event.stopPropagation(); openProduct(${product.id})">
                        Подробнее
                    </button>
                </div>
            </div>
        `).join('');
    } else {
        //Показываем товары той же категории
        const currentCategory = comparisonList[0].category;
        const suggested = demoProducts
            .filter(p => p.category === currentCategory && 
                         !comparisonList.some(cp => cp.id === p.id))
            .slice(0, 4);
        
        suggestedGrid.innerHTML = suggested.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" 
                     onclick="openProduct(${product.id})"
                     style="width: 100%; height: 200px; object-fit: contain; background: #f8f9fa; border-radius: 8px; cursor: pointer;">
                <h3 onclick="openProduct(${product.id})" style="cursor: pointer;">${product.name}</h3>
                <div class="product-rating">
                    <span class="rating-stars">${getStarRating(product.rating)}</span>
                    <span class="rating-value">${product.rating}</span>
                </div>
                <div class="product-price">${formatPrice(product.price)} ₽</div>
                <div class="product-actions">
                    <button class="btn btn-outline" onclick="event.stopPropagation(); addToComparison(${product.id})">
                        Сравнить
                    </button>
                    <button class="btn btn-primary" onclick="event.stopPropagation(); openProduct(${product.id})">
                        Подробнее
                    </button>
                </div>
            </div>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    //Загружаем пользователя
    loadUserData();
    updateComparisonCounter();
    
    //Инициализируем страницу в зависимости от URL
    const path = window.location.pathname;
    
    if (path.includes('catalog.html')) {
        initializeCatalog();
    } else if (path.includes('product.html')) {
        initializeProductPage();
    } else if (path.includes('comparison.html')) {
        initializeComparisonPage();
    } else if (path.includes('recommendations.html')) {
        initializeRecommendationsPage();
    } else if (path.includes('admin.html')) {
        initializeAdminPage();
    } else if (path.includes('auth.html')) {
        //Проверяем, авторизован ли пользователь
        const user = JSON.parse(localStorage.getItem('techAggregatorUser') || 'null');
        if (user) {
            window.location.href = 'index.html';
        }
    }
    
    //Инициализируем поиск на главной странице
    if (document.getElementById('mainSearch')) {
       //setupSearch();
    }
});

//Инициализация звёздного рейтинга для отзывов
function initializeStarRating() {
    const starContainer = document.getElementById('starRating');
    if (!starContainer) return;
    
    const stars = starContainer.querySelectorAll('.star');
    const ratingInput = document.getElementById('reviewRating');
    const ratingDisplay = document.getElementById('ratingValueDisplay');
    
    //Функция для установки рейтинга
    function setRating(value) {
        ratingInput.value = value;
        if (ratingDisplay) {
            ratingDisplay.textContent = value;
        }
        
        //Обновляем отображение звёзд
        stars.forEach((star, index) => {
            const starValue = parseInt(star.getAttribute('data-value'));
            if (starValue <= value) {
                star.classList.add('active');
                star.style.color = '#fbbf24';
            } else {
                star.classList.remove('active');
                star.style.color = '#e5e7eb';
            }
        });
    }
    
    //Добавляем обработчики для каждой звезды
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.getAttribute('data-value'));
            setRating(value);
        });
        
        star.addEventListener('mouseover', function() {
            const value = parseInt(this.getAttribute('data-value'));
            stars.forEach((s, index) => {
                const starValue = parseInt(s.getAttribute('data-value'));
                if (starValue <= value) {
                    s.style.color = '#fbbf24';
                } else {
                    s.style.color = '#e5e7eb';
                }
            });
        });
        
        star.addEventListener('mouseout', function() {
            const currentRating = parseInt(ratingInput.value);
            stars.forEach((s, index) => {
                const starValue = parseInt(s.getAttribute('data-value'));
                if (starValue <= currentRating) {
                    s.style.color = '#fbbf24';
                } else {
                    s.style.color = '#e5e7eb';
                }
            });
        });
    });
    
    //Устанавливаем начальное значение
    setRating(parseInt(ratingInput.value));
}

//Функция для открытия модального окна отзыва
function showReviewModal() {
    if (!checkAuth()) {
        showAuthModal();
        showCustomNotification('Для оставления отзыва необходимо авторизоваться', 'warning');
        return;
    }
    
    const modal = document.getElementById('reviewModal');
    if (modal) {
        modal.style.display = 'block';
        initializeStarRating(); //Инициализируем звёзды при открытии модалки
    }
}

//Функция для закрытия модального окна отзыва
function closeReviewModal() {
    const modal = document.getElementById('reviewModal');
    if (modal) {
        modal.style.display = 'none';
        //Сбрасываем форму при закрытии
        document.getElementById('reviewForm').reset();
        
        //Восстанавливаем рейтинг по умолчанию
        const ratingInput = document.getElementById('reviewRating');
        const ratingDisplay = document.getElementById('ratingValueDisplay');
        if (ratingInput) ratingInput.value = '5';
        if (ratingDisplay) ratingDisplay.textContent = '5';
        
        //Обновляем звёзды
        initializeStarRating();
    }
}

function getCurrentProductId() {
  //Попробуем получить ID из URL параметра 'id'
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  if (productId) {
    return parseInt(productId, 10);
  }
 
  return null;
}

async function submitReview(event) {
  event.preventDefault();

  if (!checkAuth()) {
    showAuthModal();
    showCustomNotification('Для оставления отзыва необходимо авторизоваться', 'warning');
    return;
  }

  const ratingInput = document.getElementById('reviewRating');
  const textArea = document.getElementById('reviewText'); 

  const rating = parseInt(ratingInput.value, 10);
  const text = textArea ? textArea.value.trim() : ''; 

  if (!rating || rating < 1 || rating > 5) {
    showCustomNotification('Пожалуйста, укажите оценку (1-5)', 'info');
    return;
  }

  //Комментарий может быть пустым, но если он есть, проверим длину
  if (text && text.length < 10) { //Проверяем длину только если текст не пустой
    showCustomNotification('Отзыв должен содержать минимум 10 символов', 'info');
    return;
  }

  const token = localStorage.getItem('techAggregatorToken');
  const productId = getCurrentProductId(); 

  if (!token || !productId) {
    showCustomNotification('Ошибка: токен или ID товара отсутствует.', 'error');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: productId,
        rating: rating,
        text: text 
        //userName не нужно, сервер берёт из токена
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('techAggregatorToken');
        currentUser = null;
        updateAuthButtons();
        showCustomNotification('Сессия истекла. Пожалуйста, войдите снова.', 'warning');
        //window.location.href = 'auth.html';
        return;
      }
      const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('Отзыв отправлен на модерацию:', result);
    showCustomNotification('Ваш отзыв отправлен на модерацию.', 'success');

    //Очистим форму
    ratingInput.value = '5';
    if (textArea) textArea.value = '';

    //Перезагрузим отзывы для обновления списка (опционально)
    await loadProductReviews(productId);


  } catch (error) {
    console.error('Ошибка отправки отзыва:', error);
    showCustomNotification(`Ошибка отправки отзыва: ${error.message}`, 'error');
  }
}


async function submitRequest() { 
  if (!checkAuth()) {
    showAuthModal();
    return;
  }

  //Получаем элементы формы (включая новые поля)
  const productNameInput = document.getElementById('requestProductName'); 
  const categorySelect = document.getElementById('requestCategory');     
  const urlInput = document.getElementById('requestUrl');              
  const commentTextarea = document.getElementById('requestComment');    

  //Проверяем существование обязательных элементов
  if (!productNameInput) {
      console.error("Элемент #requestProductName не найден в DOM.");
      showCustomNotification('Ошибка: форма запроса не найдена', 'error');
      return;
  }

  //Собираем значения
  const productName = productNameInput.value?.trim() || '';
  const category = categorySelect?.value?.trim() || '';
  const url = urlInput?.value?.trim() || ''; 
  const comment = commentTextarea?.value?.trim() || ''; 

  //Валидация
  if (!productName) {
    showCustomNotification('Пожалуйста, укажите название товара', 'info');
    return;
  }

  const token = localStorage.getItem('techAggregatorToken');
  if (!token) {
     showCustomNotification('Требуется авторизация', 'info');
     return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      //Отправляем ВСЕ данные, включая url и comment
      body: JSON.stringify({
        productName: productName,
        category: category,
        url: url,      
        comment: comment 
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const createdRequest = await response.json();
    console.log('Запрос успешно отправлен на сервер:', createdRequest);
    showCustomNotification('Запрос отправлен администратору. Мы уведомим вас, когда товар будет добавлен.', 'info');

    //Закрываем модальное окно
    closeRequestModal(); 

    //Очищаем форму (если нужно)
    if (productNameInput) productNameInput.value = '';
    if (categorySelect) categorySelect.value = '';
    if (urlInput) urlInput.value = ''; 
    if (commentTextarea) commentTextarea.value = ''; 

  } catch (error) {
    console.error('Ошибка при отправке запроса:', error);
    showCustomNotification(`Ошибка: ${error.message}`, 'error');
  }
}


function getStarRating(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
}

//Функция для создания HTML отзыва
function createReviewHTML(review) {
    const date = new Date(review.date);
    const formattedDate = date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    return `
        <div class="review-item">
            <div class="review-header">
                <div>
                    <strong>${review.userName}</strong>
                    ${review.verified ? '<span class="verified-badge">✓ Проверенный покупатель</span>' : ''}
                </div>
                <div class="review-rating">
                    <span class="rating-stars">${getStarRating(review.rating)}</span>
                    <span class="review-date">${formattedDate}</span>
                </div>
            </div>
            <p class="review-text">${review.text}</p>
        </div>
    `;
}


//Настройка формы отзыва
function setupReviewForm() {
    const reviewForm = document.getElementById('reviewForm');
    if (!reviewForm) return;
    
    reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitReview(e);
    });
}

function closeReviewModal() {
    const modal = document.getElementById('reviewModal');
    if (modal) modal.style.display = 'none';
}

//Настройка формы запроса
function setupRequestForm() {
    const requestForm = document.getElementById('requestForm');
    if (!requestForm) return;
    
    requestForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitRequest();
    });
}

function closeRequestModal() {
    const modal = document.getElementById('requestModal');
    if (modal) modal.style.display = 'none';
}

//Карта соответствия английских категорий на русские
const categoryTranslations = {
    'smartphones': 'Смартфоны',
    'laptops': 'Ноутбуки',
    'tv': 'Телевизоры',
    'headphones': 'Наушники',
    'cameras': 'Камеры',
    'tablets': 'Планшеты'
};

//Обратная карта для поиска по русским названиям категорий
const reverseCategoryMap = {};
Object.entries(categoryTranslations).forEach(([en, ru]) => {
    reverseCategoryMap[ru.toLowerCase()] = en;
});

//Функция для получения русского названия категории
function getCategoryName(categoryKey) {
    return categoryTranslations[categoryKey] || categoryKey;
}

//Функция для поиска по категории (по русскому названию)
function findProductsByCategoryQuery(query) {
    const lowerQuery = query.toLowerCase();
    const matchedCategoryKey = reverseCategoryMap[lowerQuery];
    if (matchedCategoryKey) {
        return demoProducts.filter(product => product.category === matchedCategoryKey);
    }
    return [];
}

//Ключевые слова для категорий поиска
const CATEGORY_KEYWORDS = {
  smartphones: ['смартфон', 'телефон', 'айфон', 'iphone', 'samsung', 'pixel', 'xiaomi'],
    laptops: ['ноутбук', 'лэптоп', 'macbook', 'lenovo', 'asus', 'hp', 'dell'],
    tv: ['телевизор', 'тв', 'oled', 'qled', 'lg', 'sony'],
    headphones: ['наушники', 'bluetooth', 'tws', 'airpods', 'sony', 'bose', 'гарнитура'],
    cameras: ['фотоаппарат', 'камера', 'canon', 'nikon', 'зеркалка'],
    tablets: ['планшет', 'ipad', 'galaxy tab', 'xiaomi pad'],
    smartwatches: ['часы', 'смартчасы', 'watch', 'apple watch', 'garmin'],
    ebooks: ['электронная книга', 'kindle', 'pocketbook', 'читалка'],
    drones: ['дрон', 'dji', 'квадрокоптер', 'квадрик'],
    pc_components: ['комплектующие', 'комплектующие пк', 'железо'],
    keyboards: ['клавиатура', 'клавиатуры', 'клава'],
    mouses: ['мышь', 'мыши', 'компьютерная мышь'],
    cases: ['корпус', 'корпуса', 'case'],
    drivers: ['накопитель', 'накопители', 'диск', 'ssd', 'hdd'],
    fitness_trackers: ['фитнес-трекер', 'фитнес браслет', 'трекер'],
    power_units: ['блок питания', 'блоки питания', 'бп'],
    microphones: ['микрофон', 'микрофоны', 'микро'],
    webcams: ['веб-камера', 'веб-камеры', 'вебка'],
    power_banks: ['павербанк', 'внешний аккумулятор', 'powerbank'],
    portable_speakers: ['колонка', 'колонки', 'портативная колонка'],
    monitors: ['монитор', 'мониторы', 'дисплей'],
    accessories: ['аксессуар', 'чехол', 'зарядка', 'кабель'],
    gaming: ['консоль', 'консоли', 'playstation', 'xbox', 'nintendo', 'приставка'],
    networking: ['роутер', 'маршрутизатор', 'wifi', 'wi-fi', 'switch'],
    cpus: ['процессор', 'процессоры', 'cpu', 'intel', 'amd'],
    motherboards: ['материнская плата', 'материнки', 'материнская'],
    ram: ['оперативная память', 'оперативка', 'ram', 'dram'],
    graphics_cards: ['видеокарта', 'видеокарты', 'gpu', 'rtx'],
    external_drives: ['внешний накопитель', 'внешний диск', 'portable ssd'],
    audio: ['аудиосистема', 'акустика', 'саундбар'],
    smart_home: ['умный дом', 'smart home', 'умная розетка', 'умная лампа'],
    wearables: ['носимые устройства', 'wearable', 'гаджет', 'умные очки'],
    other: ['другое', 'прочее']
};

function showNavSearchSuggestions() {
  const searchInput = document.getElementById('navSearch');
  const suggestionsContainer = document.getElementById('navSearchSuggestions');
  if (!searchInput || !suggestionsContainer) return;

  const query = searchInput.value.trim().toLowerCase();
  if (query.length < 2) {
    suggestionsContainer.style.display = 'none';
    return;
  }

  //1. Поиск по названию и характеристикам
  let results = demoProducts.filter(product =>
    product.name.toLowerCase().includes(query) ||
    (product.specs && Object.values(product.specs).some(
      value => value.toString().toLowerCase().includes(query)
    ))
  );

  //2. Если нет результатов — ищем по категориям
  if (results.length === 0) {
    const matchingCategories = new Set();

    //Прямое совпадение с русскими названиями
    const RU_CATEGORY_MAP = {
    'смартфоны': 'smartphones',
    'ноутбуки': 'laptops',
    'телевизоры': 'tv',
    'наушники': 'headphones',
    'фотоаппараты': 'cameras',
    'планшеты': 'tablets',
    'смарт-часы': 'smartwatches',
    'электронные книги': 'ebooks',
    'дроны': 'drones',
    'комплектующие пк': 'pc_components',
    'мониторы': 'monitors',
    'аксессуары': 'accessories',
    'игровые консоли': 'gaming',
    'сетевое оборудование': 'networking',
    'накопители': 'storage',
    'аудиосистемы': 'audio',
    'умный дом': 'smart_home',
    'носимые устройства': 'wearables',
    'другое': 'other'
};

    if (RU_CATEGORY_MAP[query]) {
      matchingCategories.add(RU_CATEGORY_MAP[query]);
    } else {
      //Поиск по ключевым словам
      for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(kw => query.includes(kw) || kw.includes(query))) {
          matchingCategories.add(category);
        }
      }
    }

    if (matchingCategories.size > 0) {
      results = demoProducts.filter(p => matchingCategories.has(p.category));
    }
  }

  //Ограничиваем до 5 товаров
  results = results.slice(0, 5);

  if (results.length === 0) {
    suggestionsContainer.style.display = 'none';
    return;
  }

  //Рендерим подсказки
  suggestionsContainer.innerHTML = results.map(product => `
    <div class="search-suggestion-item" onclick="selectNavSearchSuggestion(${product.id})">
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      <div class="search-suggestion-info">
        <div class="search-suggestion-name">${product.name}</div>
        <div class="search-suggestion-category">${getCategoryName(product.category)} • ${formatPrice(getMinPrice(product))} ₽</div>
      </div>
    </div>
  `).join('');

  suggestionsContainer.style.display = 'block';
}

//Выбор подсказки
function selectNavSearchSuggestion(productId) {
  const product = demoProducts.find(p => p.id === productId);
  if (product) {
    document.getElementById('navSearch').value = product.name;
    document.getElementById('navSearchSuggestions').style.display = 'none';
    window.location.href = `product.html?id=${productId}`;
  }
}

//Поиск по Enter
function navSearchProducts() {
  const query = document.getElementById('navSearch')?.value?.trim();
  if (query) {
    trackSearchQuery(query);
    document.getElementById('navSearchSuggestions').style.display = 'none';
    
    //Находим категории по запросу
    const lowerQuery = query.toLowerCase();
    const categories = new Set();
    
    
    if (RU_CATEGORY_MAP[lowerQuery]) {
      categories.add(RU_CATEGORY_MAP[lowerQuery]);
    } else {
      //По ключевым словам
      for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(kw => lowerQuery.includes(kw) || kw.includes(lowerQuery))) {
          categories.add(cat);
        }
      }
    }
    
    //Переход в каталог
    if (categories.size > 0) {
      const firstCat = Array.from(categories)[0];
      window.location.href = `catalog.html?category=${firstCat}&search=${encodeURIComponent(query)}`;
    } else {
      window.location.href = `catalog.html?search=${encodeURIComponent(query)}`;
    }
  }
}

//Обработка Enter в поиске
function handleNavSearchEnter(event) {
  if (event.key === 'Enter') {
    navSearchProducts();
  }
}

//Закрытие подсказок
document.addEventListener('click', function(event) {
  const container = document.querySelector('.nav-search-container');
  const suggestions = document.getElementById('navSearchSuggestions');
  if (container && suggestions && !container.contains(event.target)) {
    suggestions.style.display = 'none';
  }
});




//Функция для запроса добавления товара
function requestProductAddition() {
    if (!currentUser) {
        showAuthModal();
        showNotification('Для отправки запроса необходимо авторизоваться', 'warning');
        return;
    }
    
    //Создаем модальное окно для запроса
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h3>Запрос на добавление товара</h3>
            <form id="productRequestForm" onsubmit="submitRequest(event)">
                <div class="form-group">
                    <label>Название товара *</label>
                    <input type="text" id="requestProductName" required 
                           placeholder="Например, iPhone 16 Pro Max">
                </div>
                <div class="form-group">
                    <label>Категория *</label>
                    <select id="requestCategory" required>
                        <option value="">Выберите категорию</option>
                        <option value="smartphones">Смартфоны</option>
                        <option value="laptops">Ноутбуки</option>
                        <option value="tv">Телевизоры</option>
                        <option value="headphones">Наушники</option>
                        <option value="cameras">Фотоаппараты</option>
                        <option value="tablets">Планшеты</option>
                        <option value="smartwatches">Смарт-часы</option>
                        <option value="ebooks">Электронные книги</option>
                        <option value="drones">Дроны</option>
                        <option value="pc_components">Комплектующие ПК</option>
                        <option value="keyboards">Клавиатуры</option>
                        <option value="mouses">Мыши</option>
                        <option value="cases">Корпуса ПК</option>
                        <option value="drivers">Накопители</option>
                        <option value="fitness_trackers">Фитнес-трекеры</option>
                        <option value="power_units">Блоки питания</option>
                        <option value="microphones">Микрофоны</option>
                        <option value="webcams">Веб-камеры</option>
                        <option value="power_banks">Павербанки</option>
                        <option value="portable_speakers">Портативные колонки</option>
                        <option value="monitors">Мониторы</option>
                        <option value="accessories">Аксессуары</option>
                        <option value="gaming">Игровые консоли</option>
                        <option value="networking">Сетевое оборудование</option>
                        <option value="cpus">Процессоры</option>
                        <option value="motherboards">Материнские платы</option>
                        <option value="ram">Оперативная память</option>
                        <option value="graphics_cards">Видеокарты</option>
                        <option value="external_drives">Внешние накопители</option>
                        <option value="audio">Аудиосистемы</option>
                        <option value="smart_home">Умный дом</option>
                        <option value="wearables">Носимые устройства</option>
                        <option value="other">Другое</option>
                    </select>
                </div>
        
<div class="form-group">
        <label for="requestUrl">Ссылка на товар (необязательно)</label>
        <input type="url" id="requestUrl" name="requestUrl" placeholder="https://example.com/product">
    </div>
    <div class="form-group">
        <label for="requestComment">Комментарий (необязательно)</label>
        <textarea id="requestComment" name="requestComment" rows="3" placeholder="Дополнительная информация..."></textarea>
    </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" 
                            onclick="this.closest('.modal').remove()">Отмена</button>
                    <button type="submit" class="btn btn-primary">Отправить запрос</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    //Добавляем стили для модального окна, если их нет
    if (!document.querySelector('style#request-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'request-modal-styles';
        style.textContent = `
            .form-group {
                margin-bottom: 1rem;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
            }
            
            .form-group input,
            .form-group select,
            .form-group textarea {
                width: 100%;
                padding: 0.5rem;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 0.9rem;
            }
            
            .form-actions {
                display: flex;
                gap: 1rem;
                margin-top: 1.5rem;
                justify-content: flex-end;
            }
        `;
        document.head.appendChild(style);
    }
    
    //Закрытие при клике вне модального окна
    modal.onclick = function(event) {
        if (event.target === modal) {
            modal.remove();
        }
    };
}

async function submitRequest(event) { 
  event.preventDefault(); 

  if (!checkAuth()) {
    showAuthModal();
    return;
  }

  //Получаем данные из формы (предположим, у вас есть поля с этими id)
  const productNameInput = document.getElementById('requestProductName'); 
  const categorySelect = document.getElementById('requestCategory');     
  const urlInput = document.getElementById('requestUrl');              
  const commentTextarea = document.getElementById('requestComment');     

  //Проверяем существование обязательных элементов
  if (!productNameInput) {
      console.error("Элемент #requestProductName не найден в DOM.");
      showCustomNotification('Ошибка: форма запроса не найдена', 'error');
      return;
  }

  //Собираем значения
  const productName = productNameInput.value?.trim() || '';
  const category = categorySelect?.value?.trim() || '';
  const url = urlInput?.value?.trim() || ''; 
  const comment = commentTextarea?.value?.trim() || ''; 

  //Валидация
  if (!productName) {
    showCustomNotification('Пожалуйста, укажите название товара', 'info');
    return;
  }

  const token = localStorage.getItem('techAggregatorToken');
  if (!token) {
     showCustomNotification('Требуется авторизация', 'info');
     return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      //Отправляем ВСЕ данные, включая url и comment
      body: JSON.stringify({
        productName: productName,
        category: category,
        url: url,      
        comment: comment 
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const createdRequest = await response.json();
    console.log('Запрос успешно отправлен на сервер:', createdRequest);
    showCustomNotification('Запрос отправлен администратору. Мы уведомим вас, когда товар будет добавлен.', 'info');

    //Закрываем модальное окно
    closeRequestModal(); 

    //Очищаем форму (если нужно)
    if (productNameInput) productNameInput.value = '';
    if (categorySelect) categorySelect.value = '';
    if (urlInput) urlInput.value = '';
    if (commentTextarea) commentTextarea.value = ''; 

  } catch (error) {
    console.error('Ошибка при отправке запроса:', error);
    showCustomNotification(`Ошибка: ${error.message}`, 'error');
  }
}

//Вспомогательная функция для валидации URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

//Функция для добавления отзыва
function addReview() {
    if (!currentUser) {
        showAuthModal();
        showNotification('Для оставления отзыва необходимо авторизоваться', 'warning');
        return;
    }
    
    //Показываем модальное окно для отзыва
    showReviewModal();
}

//Функция для обновления состояния кнопки избранного
function updateFavoriteButton(isFavorite) {
    const favoriteBtn = document.getElementById('favoriteBtn');
    if (!favoriteBtn) return;
    
    if (isFavorite) {
        favoriteBtn.innerHTML = '<span>✓ В избранном</span>';
        favoriteBtn.classList.remove('btn-outline');
        favoriteBtn.classList.add('btn-success');
        favoriteBtn.onclick = function() { removeFromFavorites(); };
    } else {
        favoriteBtn.innerHTML = '<span>В избранное</span>';
        favoriteBtn.classList.remove('btn-success');
        favoriteBtn.classList.add('btn-outline');
        favoriteBtn.onclick = function() { addToFavorites(); };
    }
}



//Функция проверки, находится ли товар в избранном
async function checkIfFavorite() {
  const token = localStorage.getItem('techAggregatorToken');
  if (!token) return false;

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  if (!productId) return false;

  try {
    const res = await fetch(`http://localhost:3000/api/favorites/check/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    return data.isFavorite || false;
  } catch (err) {
    console.error('Ошибка проверки избранного:', err);
    return false;
  }
}



function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        if (notification.parentNode) {
            notification.remove();
        }
    });
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const typeIcons = {
        'success': '✅',
        'warning': '⚠️',
        'error': '❌',
        'info': 'ℹ️'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <span>${typeIcons[type] || ''} ${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                &times;
            </button>
        </div>
    `;
    
    //Стили для уведомления
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        min-width: 300px;
        border-left: 4px solid ${getNotificationColor(type)};
        animation: slideIn 0.3s ease-out;
    `;
    
    //Стиль для кнопки закрытия
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        position: absolute;
        right: 10px;
        top: 10px;
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    `;
    
    closeBtn.onmouseover = function() {
        this.style.backgroundColor = '#f3f4f6';
    };
    
    closeBtn.onmouseout = function() {
        this.style.backgroundColor = 'transparent';
    };
    
    document.body.appendChild(notification);
    
    //Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationColor(type) {
    const colors = {
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'info': '#3b82f6'
    };
    return colors[type] || '#3b82f6';
}

//Функция для быстрого сброса всех фильтров
function resetAllFilters() {
    //Сбрасываем селекты
    document.getElementById('categorySelect').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('sortSelect').value = 'name';
    
    //Сбрасываем динамические фильтры
    document.getElementById('dynamicFilters').innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #6b7280;">
            <p>Выберите категорию для отображения фильтров</p>
        </div>
    `;
    
    //Сбрасываем выбранные чекбоксы
    selectedCheckboxes = {};
    
    //Отображаем все товары
    displayProducts(demoProducts);
    updateProductsInfo(demoProducts.length, '');
}

//Функция для применения фильтров по URL параметрам
function applyURLFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    //Категория из URL
    const category = urlParams.get('category');
    if (category && document.getElementById('categorySelect')) {
        document.getElementById('categorySelect').value = category;
        updateFilters();
    }
    
    //Поисковый запрос из URL
    const search = urlParams.get('search');
    if (search) {
        performSearch(search);
    }
    
    //Цены из URL
    const minPrice = urlParams.get('minPrice');
    const maxPrice = urlParams.get('maxPrice');
    if (minPrice && document.getElementById('minPrice')) {
        document.getElementById('minPrice').value = minPrice;
    }
    if (maxPrice && document.getElementById('maxPrice')) {
        document.getElementById('maxPrice').value = maxPrice;
    }
    
    //Применяем фильтры
    filterProducts();
}

//Функция для поиска товаров
function performSearch(query) {
    const searchInput = document.getElementById('mainSearch');
    if (searchInput) {
        searchInput.value = query;
    }
    
    const searchResults = demoProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.brand.toLowerCase().includes(query.toLowerCase()) ||
        Object.values(product.specs).some(value => 
            value.toString().toLowerCase().includes(query.toLowerCase())
        )
    );
    
    displayProducts(searchResults);
    updateProductsInfo(searchResults.length, '');
}

//Функция для сохранения фильтров в URL
function saveFiltersToURL() {
    const urlParams = new URLSearchParams();
    const categorySelect = document.getElementById('categorySelect');
const category = categorySelect ? categorySelect.value : '';
    const minPriceInput = document.getElementById('minPrice');
const minPrice = minPriceInput && minPriceInput.value ? parseFloat(minPriceInput.value) : 0;
    const maxPriceInput = document.getElementById('maxPrice');
const maxPrice = maxPriceInput && maxPriceInput.value ? parseFloat(maxPriceInput.value) : Infinity;
const mainSearch = document.getElementById('mainSearch');
const search = mainSearch ? mainSearch.value : '';
    
    if (category) urlParams.set('category', category);
    if (minPrice) urlParams.set('minPrice', minPrice);
    if (maxPrice) urlParams.set('maxPrice', maxPrice);
    if (search) urlParams.set('search', search);
    
    //Сохраняем выбранные чекбоксы
    Object.keys(selectedCheckboxes).forEach(filterName => {
        if (selectedCheckboxes[filterName].length > 0) {
            urlParams.set(filterName, selectedCheckboxes[filterName].join(','));
        }
    });
    
    const newURL = window.location.pathname + '?' + urlParams.toString();
    window.history.pushState({}, '', newURL);
}
/*
//Фильтры по категориям
const categoryFilters = {
  smartphones: [
    { name: "brand", label: "Бренд", type: "checkbox", options: ["Apple", "Samsung", "Xiaomi", "Google", "OnePlus", "Nothing", "Realme"] },
    { name: "ram", label: "ОЗУ", type: "checkbox", options: ["4GB", "6GB", "8GB", "12GB", "16GB", "24GB"] },
    { name: "storage", label: "Память", type: "checkbox", options: ["64GB", "128GB", "256GB", "512GB", "1TB"] },
    { name: "os", label: "ОС", type: "checkbox", options: ["iOS", "Android"] },
    { name: "battery", label: "Батарея", type: "checkbox", options: ["До 4000 mAh", "4000–5000 mAh", "Свыше 5000 mAh"] }
  ],
  laptops: [
    { name: "brand", label: "Бренд", type: "checkbox", options: ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "Microsoft"] },
    { name: "ram", label: "ОЗУ", type: "checkbox", options: ["8GB", "16GB", "32GB", "64GB"] },
    { name: "storage", label: "Накопитель", type: "checkbox", options: ["256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD"] },
    { name: "os", label: "ОС", type: "checkbox", options: ["Windows", "macOS", "Linux"] },
    { name: "gpu", label: "Видеокарта", type: "checkbox", options: ["Интегрированная", "NVIDIA", "AMD"] },
    { name: "screen_size", label: "Экран", type: "checkbox", options: ["<14\"", "14–15\"", "16–17\"", ">17\""] }
  ],
  tv: [
    { name: "brand", label: "Бренд", type: "checkbox", options: ["Samsung", "LG", "Sony", "TCL"] },
    { name: "screen_size", label: "Диагональ", type: "checkbox", options: ["<50\"", "50–55\"", "65\"", ">75\""] },
    { name: "resolution", label: "Разрешение", type: "checkbox", options: ["Full HD", "4K UHD", "8K"] },
    { name: "technology", label: "Технология", type: "checkbox", options: ["LED", "QLED", "OLED"] },
    { name: "refresh_rate", label: "Частота", type: "checkbox", options: ["60Hz", "120Hz", "144Hz+"] }
  ],
  headphones: [
    { name: "brand", label: "Бренд", type: "checkbox", options: ["Sony", "Apple", "Samsung", "Bose", "Sennheiser"] },
    { name: "type", label: "Тип", type: "checkbox", options: ["Накладные", "Внутриканальные", "TWS"] },
    { name: "noise_cancel", label: "Шумоподавление", type: "checkbox", options: ["Есть", "Нет"] },
    { name: "battery_life", label: "Автономность", type: "checkbox", options: ["<20 ч", "20–30 ч", "30+ ч"] }
  ],
  cameras: [
    { name: "brand", label: "Бренд", type: "checkbox", options: ["Sony", "Canon", "GoPro"] },
    { name: "type", label: "Тип", type: "checkbox", options: ["Зеркальная", "Беззеркальная", "Экшн-камера"] },
    { name: "resolution", label: "Разрешение", type: "checkbox", options: ["<20MP", "20–30MP", "30+ MP"] }
  ],
  drones: [
    { name: "brand", label: "Бренд", type: "checkbox", options: ["DJI"] },
    { name: "flight_time", label: "Время полёта", type: "checkbox", options: ["<20 мин", "20–30 мин", "30+ мин"] },
    { name: "range", label: "Дальность", type: "checkbox", options: ["<5 км", "5–10 км", "10+ км"] }
  ],
  tablets: [
    { name: "brand", label: "Бренд", type: "checkbox", options: ["Apple", "Samsung", "Xiaomi", "Huawei", "Microsoft"] },
    { name: "screen_size", label: "Экран", type: "checkbox", options: ["<10\"", "10–11\"", ">12\""] },
    { name: "os", label: "ОС", type: "checkbox", options: ["iPadOS", "Android", "Windows"] }
  ],
  smartwatches: [
    { name: "brand", label: "Бренд", type: "checkbox", options: ["Apple", "Samsung", "Garmin"] },
    { name: "water_resistance", label: "Водонепроницаемость", type: "checkbox", options: ["IP68", "5ATM", "10ATM"] }
  ],
  ereaders: [
    { name: "brand", label: "Бренд", type: "checkbox", options: ["Amazon", "PocketBook"] },
    { name: "waterproof", label: "Водонепроницаемость", type: "checkbox", options: ["Есть", "Нет"] }
  ]
};
*/

function renderComparisonTable(container) {
  if (!container) {
    console.error('renderComparisonTable: контейнер не найден');
    return;
  }
  if (!comparisonList || comparisonList.length === 0) {
    container.innerHTML = '<p>Нет товаров для сравнения</p>';
    return;
  }

  console.log('renderComparisonTable: начинаем рендер, товаров:', comparisonList.length);

  //Собираем все характеристики
  const allSpecs = new Set();
  comparisonList.forEach(product => {
    if (product && product.specs) {
      Object.keys(product.specs).forEach(key => allSpecs.add(key));
    }
  });
  const specsArray = Array.from(allSpecs);

  //Генерируем HTML таблицу
  let tableHTML = `
    <table class="comparison-table">
      <thead>
        <tr>
          <th class="spec-header fixed-col">Характеристика</th>
          ${comparisonList.map(product => `
            <th class="product-header-cell">
              <button class="remove-comparison-btn" onclick="removeFromComparison(${product.id})">×</button>
              <img src="${product.image || 'https://via.placeholder.com/60?text=Нет'}" alt="${product.name}" class="product-img">
              <div class="product-name">${product.name}</div>
              <div class="product-price">${formatPrice(getMinPrice(product))} ₽</div>
            </th>
          `).join('')}
        </tr>
      </thead>
      <tbody>
        
        ${specsArray.map(specKey => {
          const russianName = specKeyTranslations[specKey] || specKey;
          return `
            <tr>
              <td class="spec-label fixed-col">${russianName}</td>
              ${comparisonList.map(product => `
                <td class="spec-value">
                  ${product.specs && product.specs[specKey] !== undefined ? product.specs[specKey] : '—'}
                </td>
              `).join('')}
            </tr>
          `;
        }).join('')}

        
        <tr class="price-row">
  <td class="spec-label fixed-col">Цены и покупка</td>
  ${comparisonList.map(product => {
    const minPrice = getMinPrice(product);
    const priceStr = minPrice !== null
      ? `<span class="price-value">${formatPrice(minPrice)} ₽</span>`
      : '—';

    const storeLinks = product.prices && product.prices.length > 0
      ? product.prices.map(p =>
          `<a href="${p.url}" target="_blank" class="store-link" title="${p.store || p.storeName}">${p.store || p.storeName}</a>`
        ).join('<br>')
      : '—';

    return `<td class="price-cell">
              <div>${priceStr}</div>
              <div class="store-links">${storeLinks}</div>
            </td>`;
  }).join('')}
</tr>
        <tr class="value-calc-row">
          <td class="spec-label fixed-col">Калькулятор выгоды</td>
          ${comparisonList.map(product => `
            <td class="value-calc-cell">
              <div id="valueCalcContainer-${product.id}"></div>
            </td>
          `).join('')}
        </tr>
        <tr class="mini-chart-row">
          <td class="spec-label fixed-col">История цен</td>
          ${comparisonList.map(product => `
            <td class="mini-chart-cell">
              <div id="miniChartContainer-${product.id}" style="height: 200px; width: 100%; display: flex; justify-content: center; align-items: center;">
                
              </div>
            </td>
          `).join('')}
        </tr>
      </tbody>
    </table>
  `;

  container.innerHTML = tableHTML;

  //Отрисовка графиков
  setTimeout(() => {
    comparisonList.forEach(product => {
      const valueCalcContainer = document.getElementById(`valueCalcContainer-${product.id}`);
      if (valueCalcContainer) {
        renderValueCalculator(product, valueCalcContainer);
      }

      const containerId = `miniChartContainer-${product.id}`;
      const chartContainer = document.getElementById(containerId);
      if (chartContainer) {
        //Проверяем, определён ли Chart
        if (typeof Chart === 'undefined') {
            console.error('Chart.js не загружен для мини-графика товара ID:', product.id);
            chartContainer.innerHTML = '<p style="color: red;">Chart.js не загружен</p>';
            return;
        }
        //Вызываем функцию для отрисовки мини-графика в этом контейнере
        renderMiniPriceChartInComparison(containerId, product.id);
      }
    });
  }, 100); //Небольшая задержка, чтобы DOM был готов
}


function showCustomNotification(message, type = 'info', duration = 5000) {
    //Создаем контейнер для уведомлений, если его нет
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    //Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    //Иконки для разных типов
    const icons = {
        'success': '✅',
        'warning': '⚠️',
        'error': '❌',
        'info': 'ℹ️'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icons[type] || 'ℹ️'}</span>
            <span class="notification-text">${message}</span>
            <button class="notification-close" onclick="this.closest('.notification').remove()">
                &times;
            </button>
        </div>
        <div class="notification-progress">
            <div class="notification-progress-bar"></div>
        </div>
    `;
    
    //Добавляем в контейнер
    container.appendChild(notification);
    
    //Автоматическое закрытие через указанное время
    const closeTimeout = setTimeout(() => {
        closeNotification(notification);
    }, duration);
    
    //Обработчик для закрытия при клике
    notification.querySelector('.notification-close').addEventListener('click', () => {
        clearTimeout(closeTimeout);
        closeNotification(notification);
    });
    
    //Закрытие при клике на само уведомление (кроме кнопки закрытия)
    notification.addEventListener('click', (e) => {
        if (!e.target.closest('.notification-close')) {
            clearTimeout(closeTimeout);
            closeNotification(notification);
        }
    });
    
    //Функция плавного закрытия
    function closeNotification(notification) {
        notification.classList.add('hiding');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
            //Удаляем контейнер если он пустой
            if (container && container.children.length === 0) {
                container.remove();
            }
        }, 300);
    }
    
    //Логирование для отладки
    console.log(`Notification [${type}]: ${message}`);
}

//Удаляем старую функцию showNotification если она есть
if (typeof showNotification === 'function') {
    console.warn('Старая функция showNotification');
}

//Навигация по категориям
function navigateToCategory(category) {
  window.location.href = `catalog.html?category=${category}`;
}

let currentIndex = 0;
const carouselTrack = document.getElementById('popularProductsCarousel');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const visibleItemsCount = 4; //Количество видимых элементов (может быть динамическим)

function renderCarousel() {
    const carouselTrack = document.getElementById('PopularProductsCarousel');
  if (!carouselTrack) return;
    carouselTrack.innerHTML = '';
    const itemsToShow = Math.min(popularProducts.length, visibleItemsCount);
    const startIndex = Math.max(0, Math.min(currentIndex, popularProducts.length - itemsToShow));

    for (let i = startIndex; i < startIndex + itemsToShow && i < popularProducts.length; i++) {
        const product = popularProducts[i];
        const itemElement = document.createElement('div');
        itemElement.className = 'carousel-item';
        itemElement.onclick = () => window.location.href = `product.html?id=${product.id}`; //Предполагаемая страница товара
        itemElement.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="carousel-item-info">
                <div class="carousel-item-name">${product.name}</div>
                <div class="carousel-item-category">${getCategoryName(product.category)}</div>
                <div class="carousel-item-price">${formatPrice(product.price)} ₽</div>
            </div>
        `;
        carouselTrack.appendChild(itemElement);
    }

    //Обновляем состояние кнопок
    prevBtn.disabled = startIndex === 0;
    nextBtn.disabled = startIndex + itemsToShow >= popularProducts.length;
}

function nextSlide() {
    if ((currentIndex + visibleItemsCount) < popularProducts.length) {
        currentIndex += 1; //Прокручиваем по одному элементу
        renderCarousel();
    }
}

function prevSlide() {
    if (currentIndex > 0) {
        currentIndex -= 1; //Прокручиваем по одному элементу
        renderCarousel();
    }
}

//Инициализация карусели
document.addEventListener('DOMContentLoaded', function() {
    renderCarousel();
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
});
//Глобальная функция для использования на других страницах
window.addToComparison = addToComparison;
window.updateComparisonCounter = updateComparisonCounter;
window.showCustomNotification = showCustomNotification;


//Загрузка данных профиля с сервера
async function loadProfileDataFromAPI() {
  const token = localStorage.getItem('techAggregatorToken');
  if (!token) {
    //showCustomNotification('Требуется авторизация', 'warning');
    //window.location.href = 'auth.html';
    return;
  }

  try {
    console.log('loadProfileDataFromAPI: Отправка запроса на /api/profile...');
    const profileRes = await fetch('http://localhost:3000/api/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!profileRes.ok) {
      if (profileRes.status === 401) {
        //Токен недействителен или просрочен
        localStorage.removeItem('techAggregatorToken');
        currentUser = null;
        updateAuthButtons();
        showCustomNotification('Сессия истекла. Пожалуйста, войдите снова.', 'warning');
        //window.location.href = 'auth.html';
        return;
      }
      throw new Error(`HTTP ${profileRes.status}: ${profileRes.statusText}`);
    }

    const { user } = await profileRes.json();
    console.log('loadProfileDataFromAPI: Данные профиля загружены:', user);

  
    const userNameElement = document.getElementById('userName');
    const userEmailElement = document.getElementById('userEmail');
    const userJoinDateElement = document.getElementById('userJoinDate');
    if (userNameElement) userNameElement.textContent = user.fullName || user.email;
    if (userEmailElement) userEmailElement.textContent = user.email;
    if (userJoinDateElement) {
      const joinDate = new Date(user.createdAt).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      userJoinDateElement.textContent = `Дата регистрации: ${joinDate}`;
    }

    const adminButton = document.getElementById('adminPanelButton');
    if (adminButton) {
      if (user.role === 'admin') {
        adminButton.style.display = 'block';
      } else {
        adminButton.style.display = 'none';
      }
    } else {
      console.warn('loadProfileDataFromAPI: Кнопка админ-панели (#adminPanelButton) не найдена в DOM.');
    }

    try {
      console.log('loadProfileDataFromAPI: Загрузка избранного...');
      const favoritesRes = await fetch('http://localhost:3000/api/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!favoritesRes.ok) {
        if (favoritesRes.status === 401) {
          //Если токен истёк при запросе к избранному, тоже перенаправляем
          localStorage.removeItem('techAggregatorToken');
          currentUser = null;
          updateAuthButtons();
          showCustomNotification('Сессия истекла. Пожалуйста, войдите снова.', 'warning');
          //window.location.href = 'auth.html';
          return;
        }
        throw new Error(`HTTP ${favoritesRes.status}: ${favoritesRes.statusText}`);
      }
      const favoriteProducts = await favoritesRes.json();
      console.log(`loadProfileDataFromAPI: Загружено ${favoriteProducts.length} избранных товаров.`);
      //Сохраняем в глобальную переменную для renderFavoritesPreview
      window.favorites = favoriteProducts; //Или просто favorites, если она объявлена глобально
      //Вызываем функцию отрисовки
      renderFavoritesPreview(favoriteProducts);
    } catch (favError) {
      console.error('loadProfileDataFromAPI: Ошибка загрузки избранного:', favError);
      //Очищаем контейнер или показываем ошибку
      const container = document.getElementById('favoritesPreview');
      if (container) container.innerHTML = `<p class="error-message">Ошибка загрузки избранного: ${favError.message}</p>`;
      //Очищаем глобальную переменную
      window.favorites = [];
    }
  
    try {
      console.log('loadProfileDataFromAPI: Загрузка сравнений...');
      const comparisonsRes = await fetch('http://localhost:3000/api/comparisons', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!comparisonsRes.ok) {
        if (comparisonsRes.status === 401) {
          //Если токен истёк при запросе к сравнениям, тоже перенаправляем
          localStorage.removeItem('techAggregatorToken');
          currentUser = null;
          updateAuthButtons();
          showCustomNotification('Сессия истекла. Пожалуйста, войдите снова.', 'warning');
          //window.location.href = 'auth.html';
          return;
        }
        throw new Error(`HTTP ${comparisonsRes.status}: ${comparisonsRes.statusText}`);
      }
      const comparisonProducts = await comparisonsRes.json();
      console.log(`loadProfileDataFromAPI: Загружено ${comparisonProducts.length} товаров в сравнении.`);
      //Сохраняем в глобальную переменную для renderComparisonsPreview
      window.comparisons = comparisonProducts; //Или просто comparisons
      //Вызываем функцию отрисовки
      renderComparisonsPreview(comparisonProducts);
    } catch (compError) {
      console.error('loadProfileDataFromAPI: Ошибка загрузки сравнений:', compError);
      //Очищаем контейнер или показываем ошибку
      const container = document.getElementById('comparisonsPreview');
      if (container) container.innerHTML = `<p class="error-message">Ошибка загрузки сравнений: ${compError.message}</p>`;
      //Очищаем глобальную переменную
      window.comparisons = [];
    }
    

  } catch (error) {
    console.error('loadProfileDataFromAPI: Ошибка загрузки профиля:', error);
    showCustomNotification('Ошибка загрузки данных профиля', 'error');
  }
}
        //Функция для получения русского названия категории
        function getCategoryName(categoryKey) {
            const categoryTranslations = {
                'smartphones': 'Смартфоны',
                'laptops': 'Ноутбуки',
                'tv': 'Телевизоры',
                'headphones': 'Наушники',
                'cameras': 'Фотоаппараты',
                'tablets': 'Планшеты',
                'smartwatches': 'Смарт-часы',
                'ebooks': 'Электронные книги',
                'drones': 'Дроны',
                'pc_components': 'Комплектующие ПК',
                'keyboards': 'Клавиатуры',
                'mouses': 'Мыши',
                'cases': 'Корпуса ПК',
                'drivers': 'Накопители',
                'fitness_trackers': 'Фитнес-трекеры',
                'power_units': 'Блоки питания',
                'microphones': 'Микрофоны',
                'webcams': 'Веб-камеры',
                'power_banks': 'Павербанки',
                'portable_speakers': 'Портативные колонки',
                'monitors': 'Мониторы',
                'accessories': 'Аксессуары',
                'gaming': 'Игровые консоли',
                'networking': 'Сетевое оборудование',
                'cpus': 'Процессоры',
                'motherboards': 'Материнские платы',
                'ram': 'Оперативная память',
                'graphics_cards': 'Видеокарты',
                'external_drives': 'Внешние накопители',
                'audio': 'Аудиосистемы',
                'smart_home': 'Умный дом',
                'wearables': 'Носимые устройства',
                'other': 'Другое'
            };
            return categoryTranslations[categoryKey] || categoryKey;
        }

        //Функция для форматирования цены
        function formatPrice(price) {
            return price.toLocaleString('ru-RU');
        }

//Рендер избранных товаров на странице профиля
function renderFavoritesPreview(favorites) {
  const container = document.getElementById('favoritesPreview');
  const noMsg = document.getElementById('noFavoritesMessage');
  if (!container) return;

  container.innerHTML = ''; //Очищаем контейнер

  if (favorites.length === 0) {
    if (noMsg) noMsg.style.display = 'block'; //Показываем сообщение "Нет избранного"
    return;
  }

  if (noMsg) noMsg.style.display = 'none'; //Скрываем сообщение "Нет избранного"

  //Отображаем только первые 3 товара (или сколько есть)
  favorites.slice(0, 3).forEach(fav => {
    const el = document.createElement('div');
    el.className = 'favorite-item'; 

    //Получаем минимальную цену из доступных цен товара (если есть)
    const minPrice = fav.prices && fav.prices.length > 0
                     ? Math.min(...fav.prices.map(p => p.price))
                     : null;

    el.innerHTML = `
      <button class="remove-favorite-btn" onclick="removeFromFavorites(${fav.id})">×</button>
      <img src="${fav.image || fav.imageUrl || 'https://via.placeholder.com/50?text=?'}" alt="${fav.name}" onclick="window.location.href='product.html?id=${fav.id}'">
      <div class="favorite-item-info">
        <div class="favorite-item-name">${fav.name}</div>
        <div class="favorite-item-price">${formatPrice(minPrice)} ₽</div>
      </div>
    `;
    container.appendChild(el);
  });
}

//Рендер сравнений на странице профиля
function renderComparisonsPreview(comparisons) {
  const container = document.getElementById('comparisonsPreview');
  const noMsg = document.getElementById('noComparisonsMessage');
  if (!container) return;

  container.innerHTML = '';
  if (comparisons.length === 0) {
    if (noMsg) noMsg.style.display = 'block';
    return;
  }
  if (noMsg) noMsg.style.display = 'none';

  //Группируем по категориям
  const grouped = {};
  comparisons.forEach(item => {
    const cat = item.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  Object.entries(grouped).forEach(([category, items]) => {
    const groupEl = document.createElement('div');
    groupEl.className = 'comparison-group';
    groupEl.innerHTML = `
      <button class="remove-comparison-btn" onclick="clearComparisonByCategory('${category}')">×</button>
      <div class="comparison-title">${getCategoryName(category)}</div>
      <div class="comparison-items">
        ${items.map(p => `<div class="comparison-item">${p.name}</div>`).join('')}
      </div>
    `;
    container.appendChild(groupEl);
  });
}

//Удаление из избранного
async function removeFromFavorites(productId) {
  const token = localStorage.getItem('techAggregatorToken');
  if (!token) {
    showCustomNotification('Войдите в аккаунт', 'info');
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/favorites/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      showCustomNotification('Удалено из избранного', 'info');
      //Обновляем профиль
      if (window.location.pathname.includes('profile.html')) {
        loadProfileDataFromAPI();
      }
    } else {
      const data = await res.json();
      showCustomNotification(data.error || 'Ошибка удаления', 'error');
    }
  } catch (err) {
    console.error('Ошибка:', err);
    showCustomNotification('Не удалось подключиться к серверу', 'error');
  }
}

//Очистка сравнения
async function clearComparisonByCategory(category) {
  const token = localStorage.getItem('techAggregatorToken');
  if (!token) {
    showCustomNotification('Войдите в аккаунт', 'info');
    return;
  }

  try {
    const url = `http://localhost:3000/api/comparisons/clear?category=${encodeURIComponent(category)}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      showCustomNotification('Сравнение удалено', 'info');
      if (window.location.pathname.includes('profile.html')) {
        loadProfileDataFromAPI();
      }
    } else {
      const data = await res.json();
      showCustomNotification(data.error || 'Ошибка удаления', 'error');
    }
  } catch (err) {
    console.error('Ошибка:', err);
    showCustomNotification('Не удалось подключиться к серверу', 'error');
  }
  updateComparisonCounter();
}

        //Функция для получения продукта по ID (предполагается, что данные доступны)
        function getProductById(id) {
            //Проверяем, есть ли глобальная переменная demoProducts (из script.js)
            if (typeof demoProducts !== 'undefined') {
                return demoProducts.find(p => p.id === id);
            }
            //Заглушка, если данные недоступны
            console.warn(`Данные для товара ID ${id} недоступны.`);
            return null;
        }       
        

        function logout() {
  currentUser = null;
  localStorage.removeItem('techAggregatorToken'); 
  updateAuthButtons();
  showCustomNotification('Вы успешно вышли из системы', 'info');
  window.location.href = 'index.html';
}

//При загрузке страницы авторизации
document.addEventListener('DOMContentLoaded', function () {
  //Для страницы авторизации — особая логика
  if (window.location.pathname.includes('auth.html')) {
    const token = localStorage.getItem('techAggregatorToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          window.location.href = 'index.html';
          return;
        }
      } catch (e) {
        localStorage.removeItem('techAggregatorToken');
      }
    }
    //Не запускаем основную инициализацию на auth.html
    return;
  }

  //Для всех остальных страниц — запускаем основную инициализацию
  initializeApp();
  loadProfileDataFromAPI();
});



//Избранное
//Функция для получения списка избранного из localStorage
        function getFavorites() {
            const favorites = localStorage.getItem('techAggregatorFavorites');
            return favorites ? JSON.parse(favorites) : [];
        }

        //Функция для сохранения списка избранного в localStorage
        function saveFavorites(favorites) {
            localStorage.setItem('techAggregatorFavorites', JSON.stringify(favorites));
        }

        //Функция для перехода на страницу товара
        function goToProduct(productId) {
            window.location.href = `product.html?id=${productId}`;
        }      

        //Функция для обновления счетчика избранного в хедере и других местах
        function updateFavoritesCounter() {
            const favoriteCount = getFavorites().length;
            //Обновляем счетчик в хедере, если он есть
            const headerCounter = document.querySelector('.header .comparison-counter'); //Используем существующий класс или создаем новый
            if (headerCounter) {
                headerCounter.textContent = favoriteCount;
            }
            //Обновляем счетчик на странице профиля, если она открыта (можно вызывать при навигации)
            //document.getElementById('favoritesCountStat').textContent = favoriteCount; //Это делается в updateStats
        }

        

        //Функция для форматирования цены (если еще не определена в основном script.js)
        function formatPrice(price) {
            return price.toLocaleString('ru-RU');
        }

//Функция для загрузки и отображения избранных товаров
async function loadFavorites() {
  const favoritesList = document.getElementById('favoritesList');
  if (!favoritesList) {
     console.error('Контейнер избранного (#favoritesList) не найден.');
     return;
  }

  try {
    const token = localStorage.getItem('techAggregatorToken');
    if (!token) {
      showCustomNotification('Требуется авторизация', 'warning');
      window.location.href = 'auth.html';
      return;
    }

    const response = await fetch('http://localhost:3000/api/favorites', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('techAggregatorToken');
        currentUser = null;
        updateAuthButtons();
        showCustomNotification('Сессия истекла. Пожалуйста, войдите снова.', 'warning');
        window.location.href = 'auth.html';
        return;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const favoriteProducts = await response.json();
    console.log('Загружены избранные товары для favorites.html:', favoriteProducts);

    //Сохраняем в глобальную переменную (если нужно для других функций)
    window.favorites = favoriteProducts;

    //Очищаем список
    favoritesList.innerHTML = '';

    if (favoriteProducts.length === 0) {
      //Показываем сообщение "Нет избранных товаров" (если есть такой элемент)
      const noFavoritesMessage = document.getElementById('noFavoritesMessage');
      if (noFavoritesMessage) {
          noFavoritesMessage.style.display = 'block';
      }
      return;
    }

    //Показываем список (скрываем сообщение, если оно было)
    const noFavoritesMessage = document.getElementById('noFavoritesMessage');
    if (noFavoritesMessage) {
        noFavoritesMessage.style.display = 'none';
    }

    //Загружаем текущие цены и историю цен для всех избранных товаров
    const allCurrentPrices = {};
    const allPriceHistories = {};

    const pricePromises = favoriteProducts.map(async (fav) => {
      try {
        //Загружаем текущие цены
        const pricesResponse = await fetch(`http://localhost:3000/api/products/${fav.id}/prices`, {
            headers: { 'Authorization': `Bearer ${token}` } //Добавляем токен для получения цен
        });
        if (pricesResponse.ok) {
          const prices = await pricesResponse.json();
          allCurrentPrices[fav.id] = prices;
        } else {
          allCurrentPrices[fav.id] = [];
        }
      } catch (e) {
        console.error(`Ошибка загрузки текущих цен для ${fav.id}:`, e);
        allCurrentPrices[fav.id] = [];
      }

      try {
        //Загружаем историю цен
        const historyResponse = await fetch(`http://localhost:3000/api/products/${fav.id}/price-history`, {
            headers: { 'Authorization': `Bearer ${token}` } //Добавляем токен для получения истории
        });
        if (historyResponse.ok) {
          const history = await historyResponse.json();
          allPriceHistories[fav.id] = history;
        } else {
          allPriceHistories[fav.id] = {};
        }
      } catch (e) {
        console.error(`Ошибка загрузки истории цен для ${fav.id}:`, e);
        allPriceHistories[fav.id] = {};
      }
    });

    await Promise.all(pricePromises); //Ждём завершения всех загрузок

    let hasPriceDrops = false;
    const priceDropNotifications = [];

    //Отрисовываем карточки
    for (const fav of favoriteProducts) {
      const currentPrices = allCurrentPrices[fav.id] || [];
      const priceHistory = allPriceHistories[fav.id];

      let currentMinPrice = null;
      if (currentPrices.length > 0) {
        currentMinPrice = Math.min(...currentPrices.map(p => p.price));
      }

      let previousMinPrice = null;
      if (priceHistory) {
        let overallLatestEntry = null;
        for (const storeName in priceHistory) {
          if (Array.isArray(priceHistory[storeName])) {
            const sortedForStore = priceHistory[storeName].sort((a, b) => new Date(b.x) - new Date(a.x));
            const latestForStore = sortedForStore[0];
            if (latestForStore && (!overallLatestEntry || new Date(latestForStore.x) > new Date(overallLatestEntry.x))) {
              overallLatestEntry = latestForStore;
            }
          }
        }
        if (overallLatestEntry) {
          previousMinPrice = overallLatestEntry.y;
        }
      }

      let priceDropInfo = null;
      if (previousMinPrice !== null && currentMinPrice !== null && currentMinPrice < previousMinPrice) {
        const dropPercentage = ((previousMinPrice - currentMinPrice) / previousMinPrice) * 100;
        if (dropPercentage >= 5) {
          priceDropInfo = {
            percentage: dropPercentage.toFixed(2),
            oldPrice: previousMinPrice,
            newPrice: currentMinPrice
          };
          hasPriceDrops = true;
          priceDropNotifications.push({
            productName: fav.name,
            oldPrice: previousMinPrice,
            newPrice: currentMinPrice,
            percentage: dropPercentage.toFixed(2)
          });
        }
      }

      const productCard = document.createElement('div');
      productCard.className = 'product-card-favorite';
      if (priceDropInfo) {
        productCard.classList.add('price-drop-highlight');
      }

      //Используем fav.image или fav.imageUrl, добавляем onClick для перехода к товару
      productCard.innerHTML = `
        <button class="remove-favorite-btn" onclick="removeFromFavorites(${fav.id})">×</button>
        <img src="${fav.image || fav.imageUrl || 'https://via.placeholder.com/100?text=?'}" alt="${fav.name}" onclick="window.location.href='product.html?id=${fav.id}'">
        <h3>${fav.name}</h3>
        <div class="product-meta">
          <div class="product-category">${getCategoryName(fav.category)}</div>
          <div class="product-price">${formatPrice(currentMinPrice)} ₽</div>
          ${priceDropInfo ? `<div class="price-drop-badge">Цена упала на ${priceDropInfo.percentage}%!</div>` : ''}
        </div>
        <div class="product-actions">
          <button class="btn btn-primary btn-small" onclick="goToProduct(${fav.id})">Подробнее</button>
          <button class="btn btn-outline btn-small" onclick="addToComparison(${fav.id})">Сравнить</button>
        </div>
      `;
      favoritesList.appendChild(productCard);
    }

  } catch (error) {
    console.error('Ошибка загрузки избранного для favorites.html:', error);
    favoritesList.innerHTML = `<p class="error-message">Ошибка загрузки избранного: ${error.message}</p>`;
  }


  async function checkPriceDropNotificationsOnLogin() {
  const token = localStorage.getItem('techAggregatorToken');
  if (!token) {
    //Не показываем уведомления, если не авторизованы
    return;
  }

  try {
    //Загружаем избранные товары
    const favoritesRes = await fetch('http://localhost:3000/api/favorites', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!favoritesRes.ok) {
      if (favoritesRes.status === 401) {
        localStorage.removeItem('techAggregatorToken');
        currentUser = null;
        updateAuthButtons();
        console.log('Сессия истекла при проверке уведомлений.');
        return; //Не показываем уведомление, так как сессия истекла
      }
      throw new Error(`HTTP ${favoritesRes.status}: ${favoritesRes.statusText}`);
    }

    const favoriteProducts = await favoritesRes.json();
    if (favoriteProducts.length === 0) {
      return; //Нечего проверять
    }

    let hasPriceDrops = false;

    //Загружаем текущие цены и историю для каждого товара
    for (const fav of favoriteProducts) {
      const pricesResponse = await fetch(`http://localhost:3000/api/products/${fav.id}/prices`);
      const historyResponse = await fetch(`http://localhost:3000/api/products/${fav.id}/price-history`);

      if (!pricesResponse.ok || !historyResponse.ok) continue;

      const currentPrices = await pricesResponse.json();
      const priceHistory = await historyResponse.json();

      let currentMinPrice = null;
      if (currentPrices.length > 0) {
        currentMinPrice = Math.min(...currentPrices.map(p => p.price));
      }

      let previousMinPrice = null;
      if (priceHistory) {
        let overallLatestEntry = null;
        for (const storeName in priceHistory) {
          if (Array.isArray(priceHistory[storeName])) {
            const sortedForStore = priceHistory[storeName].sort((a, b) => new Date(b.x) - new Date(a.x));
            const latestForStore = sortedForStore[0];
            if (latestForStore && (!overallLatestEntry || new Date(latestForStore.x) > new Date(overallLatestEntry.x))) {
              overallLatestEntry = latestForStore;
            }
          }
        }
        if (overallLatestEntry) {
          previousMinPrice = overallLatestEntry.y;
        }
      }

      if (previousMinPrice !== null && currentMinPrice !== null && currentMinPrice < previousMinPrice) {
        const dropPercentage = ((previousMinPrice - currentMinPrice) / previousMinPrice) * 100;
        if (dropPercentage >= 5) { //Порог падения цены (5%)
          hasPriceDrops = true;
          break; //Нашли хотя бы одно падение, можно прервать
        }
      }
    }

    if (hasPriceDrops) {
      //Показываем уведомление
      showCustomNotification('Цены на некоторые товары в вашем избранном упали!', 'info');
    }

  } catch (error) {
    console.error('Ошибка проверки уведомлений о падении цен при входе:', error);
    
  }
}

  loadProfileDataFromAPI(); 
}


        //Загружаем избранное при загрузке страницы
        document.addEventListener('DOMContentLoaded', function() {
            renderfavorites();
            updateFavoritesCounter(); 
        });

//Логика для страницы рекомендаций
        let currentUserPreferences = null;
        
        
        //Инициализация страницы
        document.addEventListener('DOMContentLoaded', function() {
            initializeRecommendationsPage();
        });


//Загрузка товаров с БД
async function loadProductsFromAPI() {
  try {
    const res = await fetch('http://localhost:3000/api/products');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rawProducts = await res.json();

    //Преобразуем структуру под фронтенд
    const products = rawProducts.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      image: p.imageUrl || 'https://via.placeholder.com/300?text=Нет+изображения',
      rating: p.rating,
      specs: p.specs.reduce((acc, spec) => {
        acc[spec.specKey] = spec.specValue;
        return acc;
      }, {}),
      prices: p.prices.map(price => ({
        store: price.storeName, 
        price: price.price,
        url: price.url.trim()
      }))
    }));

    demoProducts = products;
    window.demoProducts = products;
    console.log(' Товары загружены из API:', products.length);
    return products;
  } catch (err) {
    console.error(' Ошибка загрузки товаров:', err);
    showCustomNotification('Не удалось загрузить каталог', 'error');
    return [];
  }
}

//АДМИН ПАНЕЛЬ

//Проверка роли админа
function isAdmin() {
    const user = JSON.parse(localStorage.getItem('techAggregatorUser') || 'null');
    return user && user.role === 'admin';
}

//Обновление счётчиков модерации
async function updateModerationStats() {
    const token = localStorage.getItem('techAggregatorToken');
    if (!token) return;

    try {
        //Получаем все *отзывы* на модерации (со статусом 'pending' или 'isApproved: false')
        const reviewsRes = await fetch('http://localhost:3000/api/admin/reviews', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        let allReviews = [];
        let pendingReviewsCount = 0;
        if (reviewsRes.ok) {
            allReviews = await reviewsRes.json();
            //Считаем только те, которые ожидают модерации
            //Используем поле status, если оно есть и хранит 'pending'
            pendingReviewsCount = allReviews.filter(r => r.status === 'pending').length;
            //Или используем isApproved, если статус не используется для модерации
            //pendingReviewsCount = allReviews.filter(r => !r.isApproved).length;
        }

        //Получаем все *запросы* на добавление товара на модерации (со статусом 'pending')
        const requestsRes = await fetch('http://localhost:3000/api/admin/requests', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        let allRequests = [];
        let pendingRequestsCount = 0;
        if (requestsRes.ok) {
            allRequests = await requestsRes.json();
            pendingRequestsCount = allRequests.filter(r => r.status === 'pending').length;
        }

        //Обновляем отображение на странице
        document.getElementById('newReviews').textContent = allReviews.length; //Общее количество отзывов
        document.getElementById('addRequests').textContent = allRequests.length; //Общее количество запросов
        document.getElementById('pendingItems').textContent = pendingReviewsCount + pendingRequestsCount; //На модерации
    } catch (error) {
        console.error('Ошибка обновления статистики модерации:', error);
    }
}

//Вспомогательная функция для получения количества на модерации (можно оптимизировать в один запрос)
async function getPendingReviewsCount() {
    const token = localStorage.getItem('techAggregatorToken');
    if (!token) return 0;
    try {
        const res = await fetch('http://localhost:3000/api/admin/reviews', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return 0;
        const reviews = await res.json();
        //Считаем только те, которые ожидают модерации
        return reviews.filter(r => r.status === 'pending').length;
    } catch (e) {
        return 0;
    }
}

async function getPendingRequestsCount() {
    const token = localStorage.getItem('techAggregatorToken');
    if (!token) return 0;
    try {
        const res = await fetch('http://localhost:3000/api/admin/requests', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return 0;
        const requests = await res.json();
        return requests.filter(r => r.status === 'pending').length;
    } catch (e) {
        return 0;
    }
}

//Обновление основных счётчиков
async function updateMainStats() {
    const token = localStorage.getItem('techAggregatorToken');
    if (!token) return;

    try {
        //Загрузка статистики
        const statsRes = await fetch('http://localhost:3000/api/admin/dashboard-stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (statsRes.ok) {
            const stats = await statsRes.json();

            //Обновляем отображение
            document.getElementById('totalProducts').textContent = stats.totalProducts || 0;

            //pendingItems = pendingReviews + pendingRequests
            const pendingReviews = stats.pendingReviews || 0;
            const pendingRequests = stats.pendingRequests || 0;
            document.getElementById('pendingItems').textContent = pendingReviews + pendingRequests;

            //Опционально: отдельные счётчики для новых элементов
            document.getElementById('newReviews').textContent = pendingReviews; //Или общее количество новых
            document.getElementById('addRequests').textContent = pendingRequests; //Или общее количество новых
        }
    } catch (error) {
        console.error('Ошибка обновления статистики:', error);
        //Показать ошибку в соответствующих блоках
        document.querySelectorAll('.stat-card-enhanced .stat-value').forEach(el => el.textContent = 'Err');
    }
}

async function loadTableList() {
    const selector = document.getElementById('crudTableSelector');
    if (!selector) return;

    try {
        const token = localStorage.getItem('techAggregatorToken');
        const response = await fetch('http://localhost:3000/api/admin/tables', { 
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error(await response.text());

        const tableNames = await response.json();
        console.log('Загружен список таблиц:', tableNames);

        selector.innerHTML = '<option value="">Выберите таблицу</option>';
        tableNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            selector.appendChild(option);
        });
    } catch (error) {
        console.error('Ошибка загрузки списка таблиц:', error);
        selector.innerHTML = '<option value="">Ошибка загрузки</option>';
    }
}


function closeMessageForm() {
    const container = document.getElementById('usersTable').parentElement;
    const messageFormContainer = container.querySelector('.message-form-container');
    if (messageFormContainer) {
        messageFormContainer.remove();
    }
    currentMessageUserId = null;
}

async function sendMessageToUser(event) {
    event.preventDefault();
    if (!currentMessageUserId) {
        showCustomNotification('Ошибка: не выбран пользователь', 'error');
        return;
    }

    const messageText = document.getElementById('messageText').value.trim();
    if (!messageText) {
        showCustomNotification('Пожалуйста, введите текст сообщения', 'info');
        return;
    }

    const token = localStorage.getItem('techAggregatorToken');
    try {
        const response = await fetch(`http://localhost:3000/api/admin/users/${currentMessageUserId}/send-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message: messageText })
        });

        if (!response.ok) throw new Error(await response.text());

        const result = await response.json();
        console.log('Сообщение отправлено:', result);
        showCustomNotification('Сообщение отправлено пользователю.', 'success');
        closeMessageForm(); //Закрываем форму после отправки
    } catch (error) {
        console.error('Ошибка отправки сообщения:', error);
        showCustomNotification(`Ошибка: ${error.message}`, 'error');
    }
}


function openAdminTab(tabName) {
    document.querySelectorAll('.admin-tab-content').forEach(tab => tab.classList.remove('active'));
    //Сброс активности у кнопок в основной навигации админки
    document.querySelectorAll('#moderation ~ .admin-tabs-container .admin-tabs-header .admin-tab-btn, .admin-tabs-header .admin-tab-btn').forEach(btn => btn.classList.remove('active'));

    const tabElement = document.getElementById(tabName);
    if (tabElement) {
        tabElement.classList.add('active');
        const allTabButtons = document.querySelectorAll('.admin-tabs-header .admin-tab-btn');
        for (let btn of allTabButtons) {
            if (btn.textContent.trim().toLowerCase().includes(tabName.toLowerCase())) {
                btn.classList.add('active');
                break;
            }
        }
    }

    //Загрузка данных для вкладки при её открытии
    if (tabName === 'moderation') {
        loadModerationData(currentModerationTab); //Загружаем текущую подвкладку модерации
    } else if (tabName === 'editor') {
        loadTableList();
    } else if (tabName === 'analytics') {
        loadAnalyticsData();
    } else if (tabName === 'users') {
        loadUsersTable();
    }
}

//Открытие подвкладки модерации (отзывы/запросы)
function openModerationSubTab(subTabName) {
    currentModerationTab = subTabName;
    //Обновим активные кнопки подвкладок
    document.querySelectorAll('#moderation .admin-tabs-header .admin-tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    //Загрузим данные для выбранной подвкладки
    loadModerationData(subTabName);
}

//Загрузка данных для модерации (отзывы или запросы)
async function loadModerationData(type) {
    const container = document.getElementById('moderationContent');
    if (!container) return;

    try {
        const token = localStorage.getItem('techAggregatorToken');
        let endpoint = '';
        let title = '';
        if (type === 'reviews') {
            endpoint = 'http://localhost:3000/api/admin/reviews';
            title = 'Отзывы на модерации';
        } else if (type === 'requests') {
            endpoint = 'http://localhost:3000/api/admin/requests';
            title = 'Запросы на добавление';
        } else {
            console.error('Неизвестный тип модерации:', type);
            return;
        }

        container.innerHTML = `<h3>${title}</h3><div class="moderation-list"><p class="loading">Загрузка...</p></div>`;
        const listContainer = container.querySelector('.moderation-list');

        const response = await fetch(endpoint, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error(await response.text());

        const items = await response.json();
        console.log(`Загружены ${type} для модерации:`, items);

        if (items.length === 0) {
            listContainer.innerHTML = '<p>Нет элементов на модерации</p>';
            return;
        }

        //Сортировка по дате создания, новые сверху
        const sortedItems = items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        listContainer.innerHTML = sortedItems.map(item => {
            const date = new Date(item.createdAt);
            const formattedDate = date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });

            if (type === 'reviews') {
                const userName = item.user?.fullName || item.userName || 'Аноним';
                return `
                    <div class="moderation-item" data-id="${item.id}" data-type="review">
                        <div class="moderation-header">
                            <div class="moderation-info">
                                <h4>${item.product?.name || 'Товар'} (ID: ${item.productId})</h4>
                                <p>Пользователь: ${userName} (ID: ${item.userId || 'N/A'})</p>
                                <p>Дата: ${formattedDate}</p>
                            </div>
                            <span class="status-badge status-${item.status || 'pending'}">${item.status || 'pending'}</span>
                        </div>
                        <div>
                            <strong>Оценка:</strong> ${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)} (${item.rating}/5)<br>
                            <strong>Отзыв:</strong> ${item.comment || item.text || '<em>Без комментария</em>'}
                        </div>
                        <div class="moderation-actions">
                            <button class="btn-action btn-approve" onclick="updateReviewStatus(${item.id}, 'approved')">Одобрить</button>
                            <button class="btn-action btn-reject" onclick="updateReviewStatus(${item.id}, 'rejected')">Отклонить</button>
                        </div>
                        <textarea class="admin-notes" id="notesReview${item.id}" placeholder="Примечания администратора...">${item.adminNotes || ''}</textarea>
                        <button class="btn-action btn-view" style="margin-top: 0.5rem;" onclick="viewReviewDetails(${item.id})">Посмотреть</button>
                    </div>
                `;
            } else if (type === 'requests') {
                const requesterName = item.user?.fullName || 'Аноним';
                return `
                    <div class="moderation-item" data-id="${item.id}" data-type="request">
                        <div class="moderation-header">
                            <div class="moderation-info">
                                <h4>${item.productName}</h4>
                                <p>Категория: ${item.category || 'Не указана'}</p>
                                <p>Пользователь: ${requesterName} (ID: ${item.userId || 'N/A'})</p>
                                <p>Дата: ${formattedDate}</p>
                            </div>
                            <span class="status-badge status-${item.status}">${item.status}</span>
                        </div>
                        <div>
                            <strong>Ссылка:</strong> ${item.url ? `<a href="${item.url}" target="_blank">${item.url}</a>` : 'Не указана'}<br>
                            <strong>Комментарий:</strong> ${item.comment || '<em>Нет</em>'}
                        </div>
                        <div class="moderation-actions">
                            <button class="btn-action btn-approve" onclick="updateRequestStatus(${item.id}, 'approved')">Одобрить</button>
                            <button class="btn-action btn-reject" onclick="updateRequestStatus(${item.id}, 'rejected')">Отклонить</button>
                        </div>
                        <textarea class="admin-notes" id="notesRequest${item.id}" placeholder="Примечания администратора...">${item.adminNotes || ''}</textarea>
                        <button class="btn-action btn-view" style="margin-top: 0.5rem;" onclick="viewRequestDetails(${item.id})">Посмотреть</button>
                    </div>
                `;
            }
            return '';
        }).join('');
    } catch (error) {
        console.error(`Ошибка загрузки ${type}:`, error);
        container.innerHTML = `<h3>${type === 'reviews' ? 'Отзывы на модерации' : 'Запросы на добавление'}</h3><div class="moderation-list"><p class="error-message">Ошибка: ${error.message}</p></div>`;
    }
}

//Обновление статуса отзыва
async function updateReviewStatus(reviewId, newStatus) {
  const notesInput = document.getElementById(`notesReview${reviewId}`);
  const adminNotes = notesInput ? notesInput.value.trim() : '';

  const token = localStorage.getItem('techAggregatorToken');
  try {
    const response = await fetch(`http://localhost:3000/api/admin/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      //Тело запроса
      body: JSON.stringify({
        status: newStatus, 
        adminNotes: adminNotes, 
      })
    });

    if (!response.ok) throw new Error(await response.text());

    const updatedReview = await response.json();
    console.log(`Отзыв ID ${reviewId} обновлён до статуса ${newStatus}`, updatedReview);
    showCustomNotification(`Отзыв ID ${reviewId} ${newStatus === 'approved' ? 'одобрен' : 'отклонён'}.`, 'success');
  } catch (error) {
    console.error(`Ошибка обновления статуса отзыва ${reviewId}:`, error);
    showCustomNotification(`Ошибка: ${error.message}`, 'error');
  }
}

//Обновление статуса запроса
async function updateRequestStatus(requestId, newStatus) {
    const notesInput = document.getElementById(`notesRequest${requestId}`);
    const adminNotes = notesInput ? notesInput.value.trim() : '';

    const token = localStorage.getItem('techAggregatorToken');
    try {
        const response = await fetch(`http://localhost:3000/api/admin/requests/${requestId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                status: newStatus,
                adminNotes: adminNotes
            })
        });

        if (!response.ok) throw new Error(await response.text());

        const updatedRequest = await response.json();
        console.log(`Запрос ID ${requestId} обновлён до статуса ${newStatus}`, updatedRequest);
        showCustomNotification(`Запрос ID ${requestId} ${newStatus === 'approved' ? 'одобрен' : 'отклонён'}.`, 'success');
        //Перезагружаем список
        loadModerationData(currentModerationTab);
    } catch (error) {
        console.error(`Ошибка обновления статуса запроса ${requestId}:`, error);
        showCustomNotification(`Ошибка: ${error.message}`, 'error');
    }
}

//Просмотр деталей (заглушка)
function viewReviewDetails(reviewId) {
    alert(`Детали отзыва ID: ${reviewId} - будет реализовано позже`);
}
function viewRequestDetails(requestId) {
    alert(`Детали запроса ID: ${requestId} - будет реализовано позже`);
}

//Вкладка редактора БД


//Загрузка данных из выбранной таблицы
async function loadTableData(searchField = '', searchValue = '') { 
  const selector = document.getElementById('crudTableSelector');
  const tableName = selector.value;
  const container = document.getElementById('crudTableContainer');

  //Сохраняем параметры поиска (если они переданы)
  //currentTableSearchField = searchField; 
  //currentTableSearchValue = searchValue; 

  if (!tableName) {
    showCustomNotification('Пожалуйста, выберите таблицу', 'info');
    return;
  }

  if (!container) {
    console.error('Контейнер crudTableContainer не найден.');
    return;
  }

  try {
    container.innerHTML = '<p class="loading">Загрузка данных...</p>';
    const token = localStorage.getItem('techAggregatorToken');

    let endpoint = `http://localhost:3000/api/admin/table/${tableName}`;
    const params = new URLSearchParams();
    if (searchField && searchValue) {
      params.append('searchField', searchField);
      params.append('searchValue', searchValue);
    }
    if (params.toString()) {
      endpoint += '?' + params.toString();
    }


    const response = await fetch(endpoint, { 
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    console.log(`Загружены данные из таблицы ${tableName} (с учётом поиска):`, data);

    if (data.length === 0) {
      container.innerHTML = '<p>Таблица пуста или нет совпадений по поиску</p>';
      currentAdminTableData = [];
      currentAdminTableName = '';
      return;
    }

    currentAdminTableData = [...data];
    currentAdminTableName = tableName;

    renderCrudTable(container, data, tableName, searchField, searchValue); 

  } catch (error) {
    console.error(`Ошибка загрузки данных из таблицы ${tableName}:`, error);
    container.innerHTML = `<p class="error-message">Ошибка: ${error.message}</p>`;
  }
}

//Отрисовка таблицы данных
function renderCrudTable(container, data, tableName, searchField = '', searchValue = '') { 
  if (data.length === 0) {
    container.innerHTML = '<p>Нет данных для отображения.</p>';
    return;
  }

  const fields = Object.keys(data[0]); //Получаем ключи первого объекта как поля таблицы
  const primaryKey = 'id';

  const searchControlsHTML = `
    <div class="table-search-controls" style="margin-bottom: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; display: flex; gap: 1rem; align-items: end;">
      <div class="form-group">
        <label for="tableSearchField">Поиск по столбцу:</label>
        <select id="tableSearchField" class="table-search-field-select" onchange="searchTableDataDebounced()">
          <option value="">(Все столбцы)</option>
          ${fields.map(field => `
            <option value="${field}" ${field === searchField ? 'selected' : ''}> 
              ${field}
            </option>
          `).join('')}
        </select>
      </div>
      <div class="form-group">
        <label for="tableSearchValue">Значение:</label>
        <input type="text" id="tableSearchValue" class="table-search-value-input"
               placeholder="Введите значение для поиска..." value="${searchValue}"
               oninput="searchTableDataDebounced()"> 
      </div>
      <button class="btn btn-primary btn-small" onclick="searchTableData()">Найти</button>
      <button class="btn btn-outline btn-small" onclick="resetTableSearch()">Сброс</button>
    </div>
  `;

  let tableHTML = `
    ${searchControlsHTML} 
    <table class="crud-table">
      <thead>
        <tr>
          <th>Действия</th>
          ${fields.map(field => `<th>${field}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${data.map((row, index) => `
          <tr data-row-index="${index}">
            <td class="crud-actions-cell">
              <button class="btn-crud btn-edit-crud" onclick="editRow(${index})">Изм.</button>
              <button class="btn-crud btn-delete-crud" onclick="deleteRow(${row[primaryKey]}, ${index})">Удл.</button>
            </td>
            ${fields.map(field => `
              <td>
                <span class="field-display" data-field="${field}">${row[field]}</span>
                <input type="text" class="field-input" data-field="${field}" value="${row[field] || ''}" style="display: none;">
              </td>
            `).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  container.innerHTML = tableHTML;
}

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}


const searchTableDataDebounced = debounce(function() {
  //Эта функция будет вызываться через delay после последнего ввода
  const searchFieldSelect = document.getElementById('tableSearchField');
  const searchValueInput = document.getElementById('tableSearchValue');

  if (!searchFieldSelect || !searchValueInput) {
    console.error('Элементы поиска в таблице не найдены.');
    return;
  }

  const field = searchFieldSelect.value;
  const value = searchValueInput.value.trim();

  //Если оба поля пусты, загружаем все данные
  if (!field && !value) {
    loadTableData(); 
    return;
  }

  //Если указано поле, но не указано значение - не ищем, очищаем результаты
  if (field && !value) {
    //Оставим таблицу пустой или покажем сообщение, что нужно ввести значение
    //Или можно не обновлять, если значение удаляется
    //Лучше всего - вызвать loadTableData без параметров, если поле выбрано, но значение стирается
    if (field) {
         loadTableData(); //Сбрасываем фильтр по полю, если значение убрано
    }
    return;
  }

  //Если указано значение, но не указано поле - ищем по всем полям (пока не реализовано на сервере для этого случая)
  //или выбираем первое доступное поле
  if (value && !field) {
showCustomNotification('Пожалуйста, выберите столбец для поиска.', 'info');
    return;
  }

  //Вызываем loadTableData с параметрами поиска
  loadTableData(field, value); 
}, 500);

function resetTableSearch() {
  document.getElementById('tableSearchField').value = '';
  document.getElementById('tableSearchValue').value = '';
  loadTableData(); //Перезагружаем без параметров поиска
}

function searchTableData() {
  const searchFieldSelect = document.getElementById('tableSearchField');
  const searchValueInput = document.getElementById('tableSearchValue');

  if (!searchFieldSelect || !searchValueInput) {
    console.error('Элементы поиска в таблице не найдены.');
    return;
  }

  const field = searchFieldSelect.value;
  const value = searchValueInput.value.trim();

  //Если оба поля пусты, загружаем все данные
  if (!field && !value) {
    loadTableData();
    return;
  }

  //Если указано поле, но не указано значение - ошибка
  if (field && !value) {
    showCustomNotification('Пожалуйста, введите значение для поиска.', 'info');
    return;
  }

  //Если указано значение, но не указано поле - ищем по всем полям (пока не реализовано на сервере для этого случая)
  //или выбираем первое доступное поле
  if (value && !field) {
    
    showCustomNotification('Пожалуйста, выберите столбец для поиска.', 'info');
    return;
  }

  //Загружаем данные с параметрами поиска
  loadTableData(field, value);
}

//Редактирование строки
function editRow(rowIndex) {
    const row = document.querySelector(`tr[data-row-index="${rowIndex}"]`);
    if (!row) return;

    row.querySelectorAll('.field-display').forEach(span => {
        span.style.display = 'none';
    });
    row.querySelectorAll('.field-input').forEach(input => {
        input.style.display = 'inline-block';
    });

    const actionsCell = row.querySelector('.crud-actions-cell');
    actionsCell.innerHTML = `
        <button class="btn-crud btn-save-crud" onclick="saveRow(${rowIndex})">Сохр.</button>
        <button class="btn-crud btn-cancel-crud" onclick="cancelEditRow(${rowIndex})">Отм.</button>
    `;
}

//Отмена редактирования строки
function cancelEditRow(rowIndex) {
    loadTableData(); //Простой способ перезагрузить таблицу.
}

//Сохранение строки
async function saveRow(rowIndex) {
    const row = document.querySelector(`tr[data-row-index="${rowIndex}"]`);
    if (!row) return;

    const inputs = row.querySelectorAll('.field-input');
    const newRowData = {};
    let primaryKeyValue = null;

    inputs.forEach(input => {
        const fieldName = input.getAttribute('data-field');
        if (fieldName === 'id') {
            primaryKeyValue = parseInt(input.value);
        }
        newRowData[fieldName] = input.value;
    });

    if (!primaryKeyValue) {
        showCustomNotification('Невозможно обновить запись: отсутствует ID', 'error');
        return;
    }

    const token = localStorage.getItem('techAggregatorToken');
    try {
        const response = await fetch(`http://localhost:3000/api/admin/table/${currentAdminTableName}/${primaryKeyValue}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newRowData)
        });

        if (!response.ok) throw new Error(await response.text());

        const updatedRow = await response.json();
        console.log(`Запись ID ${primaryKeyValue} обновлена`, updatedRow);
        showCustomNotification(`Запись ID ${primaryKeyValue} обновлена.`, 'success');
        currentAdminTableData[rowIndex] = updatedRow;
        const container = document.getElementById('crudTableContainer');
        if (container) renderCrudTable(container, currentAdminTableData, currentAdminTableName);
    } catch (error) {
        console.error(`Ошибка обновления записи ID ${primaryKeyValue}:`, error);
        showCustomNotification(`Ошибка: ${error.message}`, 'error');
    }
}

//Удаление строки
async function deleteRow(recordId, rowIndex) {
    if (!confirm(`Вы уверены, что хотите удалить запись с ID ${recordId}?`)) return;

    const token = localStorage.getItem('techAggregatorToken');
    try {
        const response = await fetch(`http://localhost:3000/api/admin/table/${currentAdminTableName}/${recordId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error(await response.text());

        const result = await response.json();
        console.log(result.message);
        showCustomNotification(result.message, 'success');
        currentAdminTableData.splice(rowIndex, 1);
        const container = document.getElementById('crudTableContainer');
        if (container) renderCrudTable(container, currentAdminTableData, currentAdminTableName);
    } catch (error) {
        console.error(`Ошибка удаления записи ID ${recordId}:`, error);
        showCustomNotification(`Ошибка: ${error.message}`, 'error');
    }
}

//Вкладка с аналитикой
async function loadAnalyticsData() {
  const token = localStorage.getItem('techAggregatorToken');

  try {
   
    const statsRes = await fetch('http://localhost:3000/api/admin/analytics/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!statsRes.ok) {
      if (statsRes.status === 401) {
        localStorage.removeItem('techAggregatorToken');
        currentUser = null;
        updateAuthButtons();
        showCustomNotification('Сессия истекла. Пожалуйста, войдите снова.', 'warning');
        window.location.href = 'auth.html';
        return;
      }
      throw new Error(`HTTP ${statsRes.status}: ${statsRes.statusText}`);
    }

    const stats = await statsRes.json();
    console.log('Загружена аналитика:', stats);

    const dailyViewsEl = document.getElementById('dailyViews'); 
    if (dailyViewsEl) dailyViewsEl.textContent = stats.dailyViews;

    const purchaseClicksEl = document.getElementById('purchaseClicks'); 
    if (purchaseClicksEl) purchaseClicksEl.textContent = stats.purchaseClicks;

    const totalProductsEl = document.getElementById('totalProductsStat'); 
    if (totalProductsEl) totalProductsEl.textContent = stats.totalProducts;

    const totalReviewsEl = document.getElementById('totalReviewsStat'); 
    if (totalReviewsEl) totalReviewsEl.textContent = stats.totalReviews;

    const totalRequestsEl = document.getElementById('totalRequestsStat'); 
    if (totalRequestsEl) totalRequestsEl.textContent = stats.totalRequests;

    const totalUsersEl = document.getElementById('totalUsersStat'); 
    if (totalUsersEl) totalUsersEl.textContent = stats.totalUsers;

    const serverLoadEl = document.getElementById('serverLoad'); 
    if (serverLoadEl) serverLoadEl.textContent = `${stats.serverLoad}%`;

    const responseTimeEl = document.getElementById('responseTime'); 
    if (responseTimeEl) responseTimeEl.textContent = `${stats.responseTime} ms`;

    //Обновление изменений (если отображаются)
    const dailyViewsChangeEl = document.getElementById('dailyViewsChange');
    if (dailyViewsChangeEl) dailyViewsChangeEl.textContent = `${stats.dailyViewsChange > 0 ? '+' : ''}${stats.dailyViewsChange.toFixed(1)}%`;

    const purchaseClicksChangeEl = document.getElementById('purchaseClicksChange');
    if (purchaseClicksChangeEl) purchaseClicksChangeEl.textContent = `${stats.purchaseClicksChange > 0 ? '+' : ''}${stats.purchaseClicksChange.toFixed(1)}%`;



  } catch (error) {
    console.error('Ошибка загрузки аналитики:', error);

    showCustomNotification(`Ошибка загрузки аналитики: ${error.message}`, 'error');
  }
}

//популярные товары
async function loadPopularSearches() {
  const token = localStorage.getItem('techAggregatorToken');

  try {
    const searchesRes = await fetch('http://localhost:3000/api/admin/analytics/popular-searches', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!searchesRes.ok) {
      if (searchesRes.status === 401) {
        localStorage.removeItem('techAggregatorToken');
        currentUser = null;
        updateAuthButtons();
        showCustomNotification('Сессия истекла. Пожалуйста, войдите снова.', 'warning');
        window.location.href = 'auth.html';
        return;
      }
      throw new Error(`HTTP ${searchesRes.status}: ${searchesRes.statusText}`);
    }

    const searches = await searchesRes.json();
    const searchesContainer = document.getElementById('popularSearches'); 

    if (!searchesContainer) {
        console.warn('Контейнер популярных поисков (#popularSearches) не найден.');
        return;
    }

    if (searches.length > 0) {
      //Очищаем предыдущий список
      searchesContainer.innerHTML = '';
      //Создаём HTML для каждого поиска
      searches.forEach(search => {
        const div = document.createElement('div');
        div.className = 'popular-search-item'; //Добавим класс для стилизации
        div.textContent = `${search.term} (${search.count} раз)`;
        searchesContainer.appendChild(div);
      });
    } else {
      searchesContainer.innerHTML = '<div class="no-data">Нет данных</div>';
    }

  } catch (error) {
    console.error('Ошибка загрузки популярных поисков:', error);
    const searchesContainer = document.getElementById('popularSearches');
    if (searchesContainer) {
      searchesContainer.innerHTML = '<div class="error-message">Ошибка загрузки</div>';
    }
  }
}

//Вкладка с пользователями

//Загрузка таблицы пользователей
async function loadUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    try {
        const token = localStorage.getItem('techAggregatorToken');
        const response = await fetch('http://localhost:3000/api/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error(await response.text());

        const users = await response.json();
        console.log('Загружены пользователи:', users);

        tbody.innerHTML = users.map(user => {
            const joinDate = new Date(user.createdAt);
            const formattedDate = joinDate.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });

return `
    <tr>
        <td>${user.id}</td>
        <td>${user.email}</td>
        <td>${user.fullName || '—'}</td>
        <td>${user.role}</td>
        <td>${formattedDate}</td>
        <td>
            <button class="btn btn-outline btn-small" onclick="viewUser(${user.id})">Просм.</button>
            <button class="btn btn-outline btn-small" onclick="editUser(${user.id})">Ред.</button>
            
            <button class="btn btn-primary btn-small" onclick="openMessageForm(${user.id}, '${user.email}')">Сообщение</button>
        </td>
    </tr>
`;
        }).join('');

    } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
        tbody.innerHTML = `<tr><td colspan="6"><p class="error-message">Ошибка: ${error.message}</p></td></tr>`;
    }
}

//Вспомогательные функции пользователей (заглушки)
function viewUser(userId) { alert(`Просмотр пользователя ID: ${userId}`); }
function editUser(userId) { alert(`Редактирование пользователя ID: ${userId}`); }
async function deleteUser(userId) {
    if (confirm(`Вы уверены, что хотите удалить пользователя ID ${userId}?`)) {
        const token = localStorage.getItem('techAggregatorToken');
        try {
            const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(await response.text());
            showCustomNotification('Пользователь удалён.', 'success');
            loadUsersTable();
        } catch (error) {
            console.error('Ошибка удаления пользователя:', error);
            showCustomNotification(`Ошибка: ${error.message}`, 'error');
        }
    }
}

//Отправка сообщений пользователям

//Форма отправки сообщения пользователю
let currentMessageUserId = null;
function openMessageForm(userId, userEmail) {
    currentMessageUserId = userId;
    const container = document.getElementById('usersTable').parentElement;
    let messageFormContainer = container.querySelector('.message-form-container');
    if (!messageFormContainer) {
        messageFormContainer = document.createElement('div');
        messageFormContainer.className = 'message-form-container';
        container.appendChild(messageFormContainer);
    }

    messageFormContainer.innerHTML = `
        <h4>Отправить сообщение пользователю: ${userEmail}</h4>
        <form id="messageForm">
            <div class="message-input-group">
                <label for="messageText">Текст сообщения:</label>
                <textarea id="messageText" name="messageText" rows="4" required placeholder="Введите ваше сообщение..."></textarea>
            </div>
            <div class="message-actions">
                <button type="button" class="btn btn-secondary" onclick="closeMessageForm()">Отмена</button>
                <button type="submit" class="btn btn-primary">Отправить</button>
            </div>
        </form>
    `;

    document.getElementById('messageForm').addEventListener('submit', sendMessageToUser);
}





//Добавление
document.addEventListener('DOMContentLoaded', () => {
    const parseForm = document.getElementById('parseProductForm');
    if (parseForm) {
        parseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const url = document.getElementById('parseUrl')?.value.trim();
            const category = document.getElementById('parseCategory')?.value.trim() || null;
            const proxy = document.getElementById('parseProxy')?.value.trim() || null;

            if (!url) {
                showCustomNotification('Пожалуйста, введите URL товара.', 'info');
                return;
            }

            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.disabled = true;
            submitBtn.innerText = '⏳ Загрузка...';

            try {
                await sendParseRequest(url, category, proxy);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = originalText;
            }
        });
    }
});


let currentManualCategory = ''; 


const CATEGORY_TO_SPECS_MAP = {
    smartphones: [
        'screen_size', 'screen_resolution', 'screen_technology', 'screen_refresh_rate',
        'cpu_brand', 'cpu_model', 'cpu_cores', 'cpu_speed',
        'ram_size', 'ram_type',
        'storage_capacity', 'storage_type',
        'rear_camera_count', 'rear_camera_primary_mp', 'rear_camera_sensor_model',
        'front_camera_mp', 'battery_capacity_mah', 'battery_type',
        'os', 'os_version', 'weight_g', 'dimensions_mm',
        'sim_slots', 'connectivity', 'water_resistance', 'build_material',
        'fingerprint_scanner', 'face_unlock', 'nfc_support', 'wireless_charging'
    ],
    laptops: [
        'screen_size', 'screen_resolution', 'screen_type', 'screen_refresh_rate',
        'cpu_brand', 'cpu_model', 'cpu_cores', 'cpu_speed',
        'ram_size', 'ram_type', 'ram_slots',
        'storage_capacity', 'storage_type', 'storage_slots',
        'gpu_model', 'gpu_brand', 'gpu_memory_mb',
        'os', 'keyboard_backlight', 'keyboard_layout',
        'ports_usb_a', 'ports_usb_c', 'ports_hdmi', 'ports_displayport',
        'battery_capacity_mah', 'battery_life_hours', 'weight_g', 'dimensions_mm',
        'webcam_mp', 'audio_system', 'fingerprint_scanner', 'tpm'
    ],
    tv: [
        'diagonal_in', 'screen_resolution', 'screen_technology', 'hdr_support',
        'smart_platform', 'refresh_rate', 'sound_power_w', 'sound_channels',
        'ports_hdmi', 'ports_usb', 'wifi_support', 'bluetooth_support',
        'weight_g', 'dimensions_mm', 'mount_type', 'energy_class'
    ],
    headphones: [
        'driver_size_mm', 'driver_type', 'impedance_ohms', 'frequency_response_hz',
        'sensitivity_db', 'wireless_standard', 'battery_life_hours', 'charging_port',
        'anc_type', 'microphone', 'foldable', 'weight_g',
        'cable_length_m', 'connector_type', 'controls_type'
    ],
    cameras: [
        'sensor_size', 'sensor_resolution_mp', 'lens_mount', 'video_resolution',
        'video_fps', 'iso_range', 'image_stabilization', 'viewfinder_type',
        'lcd_size_in', 'lcd_touch', 'battery_life_shots', 'weight_g',
        'dimensions_mm', 'weather_sealing', 'flash_type'
    ],
    tablets: [
        'screen_size', 'screen_resolution', 'screen_technology',
        'cpu_brand', 'cpu_model', 'ram_size', 'storage_capacity',
        'os', 'battery_capacity_mah', 'rear_camera_mp', 'front_camera_mp',
        'weight_g', 'dimensions_mm', 'stylus_support', 'keyboard_support',
        'sim_slots', 'connectivity'
    ],
    smartwatches: [
        'display_size_in', 'display_type', 'battery_life_hours', 'water_resistance_rating',
        'gps_type', 'nfc_support', 'lte_support', 'health_monitoring',
        'sports_modes_count', 'compatibility', 'weight_g', 'strap_material'
    ],
    ebooks: [
        'screen_size', 'screen_resolution', 'screen_technology', 'screen_frontlight',
        'storage_capacity', 'battery_life_days', 'weight_g', 'dimensions_mm',
        'file_formats_supported', 'dictionary_included', 'waterproof'
    ],
    drones: [
        'flight_time_minutes', 'max_range_km', 'camera_resolution', 'video_resolution',
        'gimbal_type', 'obstacle_avoidance', 'max_speed_kmh', 'weight_g',
        'wind_resistance', 'gps_support', 'return_to_home'
    ],
    pc_components: [
        'component_type', 'brand', 'model', 'socket', 'chipset',
        'ram_type', 'ram_speed', 'pcie_version', 'power_connector',
        'tdp_w', 'dimensions_mm', 'warranty_years'
    ],
    monitors: [
        'screen_size', 'screen_resolution', 'panel_type', 'refresh_rate',
        'response_time_ms', 'brightness_nits', 'contrast_ratio', 'hdr_support',
        'ports_hdmi', 'ports_displayport', 'adjustable_stand', 'vesa_mount',
        'weight_g', 'dimensions_mm'
    ],
    accessories: [
        'accessory_type', 'compatibility', 'material', 'color',
        'weight_g', 'dimensions_mm', 'warranty_years'
    ],
    gaming: [
        'console_type', 'storage_capacity', 'resolution_output', 'backwards_compatibility',
        'controller_included', 'online_service', 'weight_g', 'dimensions_mm'
    ],
    networking: [
        'wifi_standard', 'max_speed_mbps', 'ethernet_ports', 'antenna_count',
        'coverage_area_sqm', 'vpn_support', 'parental_controls', 'weight_g'
    ],
    keyboards: [
        'keyboard_type', 'switch_type', 'layout', 'connectivity',
        'backlight', 'anti_ghosting', 'key_rollover', 'weight_g'
    ],
    mouses: [
        'sensor_type', 'dpi_max', 'buttons_count', 'connectivity',
        'polling_rate_hz', 'weight_g', 'battery_life_hours', 'rgb_backlight'
    ],
    cases: [
        'case_type', 'supported_form_factors', 'materials', 'fan_support',
        'radiator_support', 'gpu_max_length_mm', 'cpu_cooler_max_height_mm', 'weight_g'
    ],
    fitness_trackers: [
        'display_type', 'battery_life_days', 'water_resistance', 'sensors',
        'connectivity', 'compatibility', 'weight_g', 'strap_size'
    ],
    power_units: [
        'power_w', 'efficiency_rating', 'modular_type', 'fan_size_mm',
        'protection_systems', 'connectors', 'form_factor', 'warranty_years'
    ],
    microphones: [
        'microphone_type', 'polar_pattern', 'frequency_response_hz', 'sensitivity_db',
        'connectivity', 'sample_rate_khz', 'bit_depth', 'weight_g'
    ],
    webcams: [
        'resolution', 'fps', 'focus_type', 'field_of_view',
        'microphone', 'mount_type', 'connectivity', 'cable_length_m'
    ],
    power_banks: [
        'battery_capacity_mah', 'battery_type', 'ports_usb_a', 'ports_usb_c',
        'max_output_w', 'fast_charging', 'weight_g', 'dimensions_mm'
    ],
    portable_speakers: [
        'power_w', 'frequency_response_hz', 'bluetooth_version', 'battery_life_hours',
        'water_resistance', 'voice_assistant', 'weight_g', 'dimensions_mm'
    ],
    cpus: [
        'cpu_brand', 'cpu_model', 'cpu_cores', 'cpu_threads',
        'cpu_base_freq', 'cpu_boost_freq', 'socket', 'tdp_w',
        'process_tech_nm', 'integrated_graphics', 'cache_l3_mb'
    ],
    motherboards: [
        'socket', 'chipset', 'form_factor', 'ram_type',
        'ram_slots', 'max_ram', 'pcie_version', 'm2_slots',
        'ports_sata', 'ports_usb', 'wifi_support'
    ],
    ram: [
        'ram_type', 'capacity_gb', 'memory_speed_mhz', 'latency_cl',
        'module_count', 'voltage_v', 'rgb_support', 'warranty_years'
    ],
    graphics_cards: [
        'gpu_brand', 'gpu_model', 'vram_size', 'memory_bus_width_bit',
        'boost_clock_mhz', 'tdp_w', 'power_connector', 'output_ports',
        'ray_tracing_support'
    ],
    external_drives: [
        'storage_type', 'capacity_gb', 'interface', 'read_speed_mbs',
        'write_speed_mbs', 'form_factor', 'water_resistance', 'warranty_years'
    ],
    storage: [
        'storage_type', 'capacity_gb', 'interface', 'read_speed_mbs',
        'write_speed_mbs', 'form_factor', 'warranty_years'
    ],
    drivers: [
        'storage_type', 'capacity_gb', 'interface', 'read_speed_mbs',
        'write_speed_mbs', 'form_factor', 'warranty_years'
    ],
    audio: [
        'speaker_count', 'power_w', 'frequency_response_hz', 'connectivity',
        'voice_assistant', 'weight_g', 'dimensions_mm'
    ],
    smart_home: [
        'device_type', 'protocol', 'compatibility', 'power_source',
        'range_m', 'app_support', 'voice_control', 'weight_g'
    ],
    wearables: [
        'display_type', 'battery_life_days', 'water_resistance', 'sensors',
        'connectivity', 'compatibility', 'weight_g', 'strap_size'
    ],
    other: [] //Пустой массив для категории "Другое"
};

//Обновление полей спецификаций при выборе категории
function updateManualSpecFields() {
  const categorySelect = document.getElementById('manualCategory');
  const container = document.getElementById('manualSpecFieldsContainer');
  const selectedCategory = categorySelect.value;

  container.innerHTML = '';

  if (selectedCategory && CATEGORY_TO_SPECS_MAP[selectedCategory]) {
    currentManualCategory = selectedCategory;
    const specKeys = CATEGORY_TO_SPECS_MAP[selectedCategory];

    if (specKeys.length > 0) {
      const header = document.createElement('h4');
      header.textContent = 'Характеристики';
      container.appendChild(header);

      const groupDiv = document.createElement('div');
      groupDiv.className = 'manual-spec-group';

      specKeys.forEach(specKey => {
        const displayName = window.specKeyTranslations?.[specKey] || specKey;

        const fieldGroup = document.createElement('div');
        fieldGroup.className = 'form-group';

        fieldGroup.innerHTML = `
            <label for="spec_${specKey}">${displayName}</label>
            <input type="text" id="spec_${specKey}" name="spec_${specKey}" placeholder="Введите ${displayName.toLowerCase()}">
        `;

        groupDiv.appendChild(fieldGroup);
      });

      container.appendChild(groupDiv);
    } else {
      currentManualCategory = '';
      const placeholder = document.createElement('p');
      placeholder.className = 'placeholder-text';
      placeholder.textContent = `Для категории "${selectedCategory}" нет предопределённых полей характеристик.`;
      container.appendChild(placeholder);
    }
  } else {
    currentManualCategory = '';
    const placeholder = document.createElement('p');
    placeholder.className = 'placeholder-text';
    const message = selectedCategory ?
      `Для категории "${selectedCategory}" не определены поля характеристик.` :
      'Выберите категорию, чтобы увидеть доступные поля для характеристик.';
    placeholder.textContent = message;
    container.appendChild(placeholder);
  }
}

//Добавление блока для новой цены и ссылки
function addManualPriceEntry() {
  const container = document.getElementById('manualPricesList');
  const entryCount = container.children.length;
  const newIndex = entryCount;

  const priceEntryDiv = document.createElement('div');
  priceEntryDiv.className = 'manual-price-entry';
  priceEntryDiv.id = `priceEntry_${newIndex}`;

  priceEntryDiv.innerHTML = `
      <h5>Магазин ${newIndex + 1}</h5>
      <div class="form-group">
          <label for="priceStore_${newIndex}">Название магазина *</label>
          <select id="priceStore_${newIndex}" required>
              <option value="">Выберите магазин</option>
              <option value="DNS">DNS</option>
              <option value="MVideo">М.Видео</option>
              <option value="OZON">OZON</option>
              <option value="Wildberries">Wildberries</option>
              <option value="Yandex Market">Яндекс Маркет</option>
              <option value="Citilink">Ситилинк</option>
              <option value="Eldorado">Эльдорадо</option>
              <option value="Other">Другой</option>
          </select>
      </div>
      <div class="form-group">
          <label for="priceValue_${newIndex}">Цена *</label>
          <input type="number" id="priceValue_${newIndex}" required placeholder="Введите цену в рублях" min="0">
      </div>
      <div class="form-group">
          <label for="priceUrl_${newIndex}">Ссылка на покупку *</label>
          <input type="url" id="priceUrl_${newIndex}" required placeholder="https://shop.example.com/product-link">
      </div>
      <button type="button" class="remove-price-btn" onclick="removeManualPriceEntry(${newIndex})">Удалить магазин</button>
  `;

  container.appendChild(priceEntryDiv);
}

async function fillManualPricesFromUrls() {
  const token = localStorage.getItem('techAggregatorToken');
  if (!token) {
    showCustomNotification('Нужна авторизация администратора.', 'error');
    return;
  }
  const entries = document.querySelectorAll('.manual-price-entry');
  if (!entries.length) {
    showCustomNotification('Добавьте блоки «Магазин» и укажите ссылки на Яндекс.Маркет или Wildberries.', 'info');
    return;
  }
  let filled = 0;
  let skipped = 0;
  for (const entry of entries) {
    const urlInput = entry.querySelector('[id^="priceUrl_"]');
    const priceInput = entry.querySelector('[id^="priceValue_"]');
    const storeSelect = entry.querySelector('[id^="priceStore_"]');
    const rawUrl = urlInput && urlInput.value ? urlInput.value.trim() : '';
    if (!rawUrl) {
      skipped += 1;
      continue;
    }
    let host = '';
    try {
      host = new URL(rawUrl).hostname.toLowerCase();
    } catch {
      skipped += 1;
      continue;
    }
    const isYm = host.includes('market.yandex.ru') || (host.includes('yandex.ru') && (rawUrl.includes('/card/') || rawUrl.includes('/product--')));
    const isWb = host.includes('wildberries.ru') || host.includes('wb.ru');
    if (!isYm && !isWb) {
      skipped += 1;
      continue;
    }
    try {
      const response = await fetch('http://localhost:3000/api/admin/fetch-price-from-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ url: rawUrl })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      if (priceInput && data.price != null) {
        priceInput.value = String(data.price);
      }
      if (storeSelect && data.storeName) {
        storeSelect.value = data.storeName;
      }
      filled += 1;
    } catch (e) {
      console.warn('fetch-price-from-url:', e);
      skipped += 1;
    }
  }
  if (filled) {
    showCustomNotification(`Подставлено цен по ссылкам: ${filled}.`, 'success');
  } else {
    showCustomNotification('Не удалось получить цены. Проверьте ссылки на карточки Яндекс.Маркета или Wildberries.', 'warning');
  }
}

//Удаление блока цены и ссылки
function removeManualPriceEntry(index) {
  const entryDiv = document.getElementById(`priceEntry_${index}`);
  if (entryDiv) {
    entryDiv.remove();
  }
}

//Сброс формы вручную
function resetManualAddForm() {
  document.getElementById('manualAddForm').reset();
  document.getElementById('manualSpecFieldsContainer').innerHTML = '<p class="placeholder-text">Выберите категорию, чтобы увидеть доступные поля для характеристик.</p>';
  document.getElementById('manualPricesList').innerHTML = '';
  currentManualCategory = '';
  console.log('Форма "Добавление вручную" сброшена.');
}

//Отправка формы вручную
document.getElementById('manualAddForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  console.log('Отправка формы "Добавление вручную"...');

  const name = document.getElementById('manualName').value.trim();
  const category = document.getElementById('manualCategory').value;
  const description = document.getElementById('manualDescription').value.trim();
  const imageUrl = document.getElementById('manualImageUrl').value.trim();

  if (!name || !category) {
    showCustomNotification('Название и категория обязательны.', 'info');
    return;
  }

  const specs = {};
  if (currentManualCategory && CATEGORY_TO_SPECS_MAP[currentManualCategory]) {
    CATEGORY_TO_SPECS_MAP[currentManualCategory].forEach(specKey => {
      const inputValue = document.getElementById(`spec_${specKey}`)?.value?.trim();
      if (inputValue) {
        specs[specKey] = inputValue;
      }
    });
  }

  const prices = [];
  const pricesContainer = document.getElementById('manualPricesList');
  for (let i = 0; i < pricesContainer.children.length; i++) {
    const entryDiv = pricesContainer.children[i];
    const storeInput = entryDiv.querySelector(`[id^='priceStore_']`);
    const priceInput = entryDiv.querySelector(`[id^='priceValue_']`);
    const urlInput = entryDiv.querySelector(`[id^='priceUrl_']`);

    const storeName = storeInput ? storeInput.value : '';
    const priceValue = priceInput ? parseInt(priceInput.value, 10) : NaN;
    const buyUrl = urlInput ? urlInput.value.trim() : '';

    if (storeName && !isNaN(priceValue) && priceValue >= 0 && buyUrl) {
      prices.push({
        storeName: storeName,
        price: priceValue,
        url: buyUrl
      });
    } else {
      console.warn(`Пропуск неполного блока цены ${i}:`, { storeName, priceValue, buyUrl });
      showCustomNotification(`Блок цены ${i+1} заполнен не полностью и будет пропущен.`, 'warning');
    }
  }

  if (prices.length === 0) {
    showCustomNotification('Необходимо добавить хотя бы одну цену и ссылку.', 'info');
    return;
  }

  const productData = {
    name: name,
    category: category,
    description: description || null,
    imageUrl: imageUrl || null,
    specs: specs,
    prices: prices
  };

  console.log('Данные для отправки (вручную):', productData);

  const token = localStorage.getItem('techAggregatorToken');
  try {
    const response = await fetch('http://localhost:3000/api/admin/manual-add-product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('Товар успешно добавлен вручную:', result);
    showCustomNotification('Товар успешно добавлен в базу данных.', 'success');
    resetManualAddForm();

  } catch (error) {
    console.error('Ошибка добавления товара вручную:', error);
    showCustomNotification(`Ошибка добавления товара: ${error.message}`, 'error');
  }
});

//Сброс формы парсинга
function resetParseForm() {
  document.getElementById('parseProductForm').reset();
  document.getElementById('parseResult').style.display = 'none';
  console.log('Форма "Парсинг" сброшена.');
}




function openAdminTab(tabName) {
    document.querySelectorAll('.admin-tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    //Обновим активные кнопки
    event.target.classList.add('active');

    //Загрузка данных для вкладки при её открытии
    if (tabName === 'moderation') {
        loadModerationData(currentModerationTab);
    } else if (tabName === 'editor') {
        loadTableList();
    } else if (tabName === 'analytics') {
        loadAnalyticsData();
    } else if (tabName === 'users') {
        loadUsersTable();
    } else if (tabName === 'priceHistory') {
        fetchAdminPriceSyncStatus();
    }
    //Для 'parser' и 'manualAdd' ничего загружать не нужно, только открыть форму
}



//по истории цен на админ панели
async function loadAllProductsForPriceHistory() {
    const selectElement = document.getElementById('priceHistoryProductSelect');
    selectElement.innerHTML = '<option value="">-- Загрузка товаров... --</option>';

    const token = localStorage.getItem('techAggregatorToken');
    try {
        const response = await fetch('http://localhost:3000/api/admin/products', { //Предполагаемый маршрут для получения всех продуктов
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('techAggregatorToken');
                currentUser = null;
                updateAuthButtons();
                showCustomNotification('Сессия истекла. Пожалуйста, войдите снова.', 'warning');
                //window.location.href = 'auth.html';
                return;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const products = await response.json();
        console.log('Загружен список товаров для истории цен:', products);

        selectElement.innerHTML = '<option value="">-- Выберите товар --</option>';
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (ID: ${product.id})`;
            selectElement.appendChild(option);
        });

    } catch (error) {
        console.error('Ошибка загрузки товаров для истории цен:', error);
        selectElement.innerHTML = '<option value="">-- Ошибка загрузки --</option>';
        showCustomNotification(`Ошибка загрузки товаров: ${error.message}`, 'error');
    }
}

//Загрузка истории цен для выбранного товара
async function loadPriceHistoryForProduct() {
    const selectElement = document.getElementById('priceHistoryProductSelect');
    const productId = parseInt(selectElement.value, 10);

    if (!productId) {
        //Если выбрана пустая опция, скрываем форму и список
        document.getElementById('priceHistoryFormContainer').style.display = 'none';
        document.getElementById('priceHistoryListContainer').style.display = 'none';
        currentPriceHistoryProduct = null;
        currentPriceHistoryEntries = [];
        return;
    }

    currentPriceHistoryProduct = productId;
    console.log(`Загрузка истории цен для товара ID: ${productId}`);

    const token = localStorage.getItem('techAggregatorToken');
    try {
        const response = await fetch(`http://localhost:3000/api/admin/price-history/${productId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('techAggregatorToken');
                currentUser = null;
                updateAuthButtons();
                showCustomNotification('Сессия истекла. Пожалуйста, войдите снова.', 'warning');
                //window.location.href = 'auth.html';
                return;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const historyEntries = await response.json();
        console.log('Загружена история цен:', historyEntries);

        currentPriceHistoryEntries = [...historyEntries]; //Сохраняем копию

        //Показываем форму добавления
        document.getElementById('priceHistoryFormContainer').style.display = 'block';
        //Показываем список
        document.getElementById('priceHistoryListContainer').style.display = 'block';
        //Отрисовываем список
        renderPriceHistoryList(historyEntries);

    } catch (error) {
        console.error('Ошибка загрузки истории цен:', error);
        document.getElementById('priceHistoryList').innerHTML = `<p class="error-message">Ошибка: ${error.message}</p>`;
        showCustomNotification(`Ошибка загрузки истории цен: ${error.message}`, 'error');
    }
}

//Отрисовка списка истории цен
function renderPriceHistoryList(entries) {
    const container = document.getElementById('priceHistoryList');
    if (!container) return;

    if (entries.length === 0) {
        container.innerHTML = '<p>Для этого товара пока нет записей об истории цен.</p>';
        return;
    }

    container.innerHTML = entries.map(entry => {
        const formattedDate = new Date(entry.date).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        return `
            <div class="price-history-item" data-id="${entry.id}">
                <div class="price-history-info">
                    <p><strong>Магазин:</strong> ${entry.storeName}</p>
                    <p><strong>Цена:</strong> ${entry.price} ₽</p>
                    <p><strong>Дата:</strong> ${formattedDate}</p>
                </div>
                <div class="price-history-actions">
                    <button class="btn btn-outline btn-small" onclick="editPriceHistoryEntry(${entry.id})">Ред.</button>
                    <button class="btn btn-danger btn-small" onclick="deletePriceHistoryEntry(${entry.id})">Удл.</button>
                </div>
            </div>
        `;
    }).join('');
}

//Сброс формы добавления
function resetPriceHistoryForm() {
    document.getElementById('addPriceHistoryForm').reset();
}

//Функция редактирования (заглушка, требует реализации формы редактирования)
function editPriceHistoryEntry(entryId) {
    //Найти запись
    const entry = currentPriceHistoryEntries.find(e => e.id === entryId);
    if (!entry) {
        showCustomNotification('Запись не найдена.', 'error');
        return;
    }

    alert(`Редактирование записи ID ${entryId}:\nМагазин: ${entry.storeName}\nЦена: ${entry.price}\nДата: ${entry.date}`);
}

//Функция удаления
async function deletePriceHistoryEntry(entryId) {
    if (!confirm(`Вы уверены, что хотите удалить запись истории цен ID ${entryId}?`)) {
        return;
    }

    const token = localStorage.getItem('techAggregatorToken');
    try {
        const response = await fetch(`http://localhost:3000/api/admin/price-history/${entryId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('techAggregatorToken');
                currentUser = null;
                updateAuthButtons();
                showCustomNotification('Сессия истекла. Пожалуйста, войдите снова.', 'warning');
                //window.location.href = 'auth.html';
                return;
            }
            const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const result = await response.json();
        console.log(result.message);

        showCustomNotification(result.message, 'success');
        //Обновим список
        loadPriceHistoryForProduct(); //Перезагружаем для текущего товара

    } catch (error) {
        console.error('Ошибка удаления записи истории цен:', error);
        showCustomNotification(`Ошибка удаления: ${error.message}`, 'error');
    }
}


//Рекоммендации
function initializeRecommendationsPage() {
  //Загружаем рекомендации для всех вкладок
  loadRecommendationsByType('popular');
  loadRecommendationsByType('trending');
  loadRecommendationsByType('bestValue');
  loadRecommendationsByType('priceDrop');
  loadRecommendationsByType('personal');
  //Загружаем персонализированные рекомендации
  loadPersonalRecommendations();
  setupRecommendationsFilters();
}


async function loadRecommendationsByType(type) {
    const gridId = recommendationGridIdMap[type];
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = '<p style="text-align:center; padding:20px;">Загрузка...</p>';
    const token = localStorage.getItem('techAggregatorToken');
    let endpoint = `/api/recommendations/${type}`;
    if (type === 'bestValue') endpoint = '/api/recommendations/best-value';
    else if (type === 'priceDrop') endpoint = '/api/recommendations/price-drops';
    try {
        const res = await fetch(`http://localhost:3000${endpoint}`, {
            headers: { ...(token && { 'Authorization': `Bearer ${token}` }) }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const products = await res.json();
        recommendationStore[type] = Array.isArray(products) ? products : [];
        await renderRecommendationsByType(type);
    } catch (error) {
        console.error(`Ошибка загрузки ${type}:`, error);
        grid.innerHTML = '<p style="text-align:center; color:red;">Ошибка загрузки рекомендаций</p>';
    }
}

async function loadPersonalRecommendations() {
    const gridId = recommendationGridIdMap.personal;
    const grid = document.getElementById(gridId);
    if (!grid) return;

    const token = localStorage.getItem('techAggregatorToken');
    if (!token) {
        grid.innerHTML = '<p>Войдите, чтобы видеть персональные рекомендации</p>';
        return;
    }

    try {
        const res = await fetch('http://localhost:3000/api/recommendations/personal', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        recommendationStore.personal = Array.isArray(data) ? data : (data.products || []);
        await renderRecommendationsByType('personal');
    } catch (error) {
        console.error('Ошибка личных рекомендаций:', error);
        grid.innerHTML = '<p>Ошибка загрузки</p>';
    }
}

//Отображение товаров в контейнере с расширенной информацией
function displayEnhancedProducts(gridId, products, type) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    if (!products || products.length === 0) {
        grid.innerHTML = '<p style="text-align:center; color:#6b7280; padding:2rem;">Нет доступных товаров в данной подборке</p>';
        return;
    }
    grid.innerHTML = products.map(product => {
        const badgeText = getRecommendationBadge(product, type);
        let priceDropHtml = '';
        if (type === 'priceDrop' && product.priceDrop) {
            priceDropHtml = `<div style="background:#ef4444; color:white; padding:4px 8px; border-radius:12px; font-size:0.8rem; margin-top:5px; display:inline-block;">📉 Снизилось на ${product.priceDrop.dropPercent}%</div>`;
        }
        return `
        <div class="product-card product-card-enhanced" onclick="openProduct(${product.id})">
            ${badgeText ? `<div class="recommendation-badge">${badgeText}</div>` : ''}
            <img src="${product.image || product.imageUrl || 'https://via.placeholder.com/300?text=Нет+изображения'}" alt="${product.name}"
            style="width: 100%; height: 200px; object-fit: contain; background: #f8f9fa; border-radius: 8px;">
            <h3>${product.name}</h3>
            <div class="product-rating">
                <span class="rating-stars">${getStarRating(product.rating)}</span>
                <span class="rating-value">${product.rating}</span>
            </div>
            <div class="product-price">${formatPrice(getMinPrice(product))} ₽</div>
            ${priceDropHtml}
            ${product.valueScore ? `<div style="display:inline-block; padding:4px 8px; background:#dbeafe; color:#1d4ed8; border-radius:20px; font-size:0.8rem; margin-top:5px;">💰 Выгода: ${Math.round(product.valueScore)}%</div>` : ''}
            ${type === 'personal' && product.recommendationType === 'viewed'
                ? `<div style="display:inline-block; padding:4px 8px; background:#ede9fe; color:#5b21b6; border-radius:20px; font-size:0.8rem; margin-top:5px;">👀 Вы смотрели</div>`
                : ''
            }
            ${type === 'personal' && product.recommendationType === 'similar' && product.similarityScore !== undefined
                ? `<div style="display:inline-block; padding:4px 8px; background:#dcfce7; color:#166534; border-radius:20px; font-size:0.8rem; margin-top:5px;">🔍 Похоже на просмотренное (${Math.round(product.similarityScore * 100)}%)</div>`
                : ''
            }
            <div class="product-actions" style="margin-top: 1rem;">
                <button class="btn btn-outline" onclick="event.stopPropagation(); addToComparison(${product.id})">Сравнить</button>
                <button class="btn btn-primary" onclick="event.stopPropagation(); openProduct(${product.id})">Подробнее</button>
            </div>
        </div>
        `;
    }).join('');
}

async function displayBestValueProducts(gridId, products) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    if (!products || products.length === 0) {
        grid.innerHTML = '<p style="text-align:center; color:#6b7280; padding:2rem;">Нет доступных товаров в данной подборке</p>';
        return;
    }

    const enrichedProducts = await Promise.all(products.map(async (product) => {
        const minPrice = getMinPrice(product);
        let marketPrice = null;
        if (product.id) {
            try {
                marketPrice = await getMarketPrice(product.id);
            } catch (e) {
                console.warn('Не удалось получить рыночную цену для рекомендации:', product.id, e);
            }
        }
        const score = calculateValueScore(product, minPrice || 0, marketPrice);
        const interpretation = getValueInterpretation(score);
        const normalizedScore = Number.isFinite(score) ? score : -Infinity;
        return {
          ...product,
          _minPrice: minPrice,
          _marketPrice: marketPrice,
          _valueScore: normalizedScore,
          _valueInterpretation: interpretation
        };
    }));

    enrichedProducts.sort((a, b) => b._valueScore - a._valueScore);

    grid.innerHTML = enrichedProducts.map((product) => `
        <div class="product-card product-card-enhanced" onclick="openProduct(${product.id})">
            <div class="recommendation-badge">💰 Выгодно</div>
            <img src="${product.image || product.imageUrl || 'https://via.placeholder.com/300?text=Нет+изображения'}" alt="${product.name}"
            style="width: 100%; height: 200px; object-fit: contain; background: #f8f9fa; border-radius: 8px;">
            <h3>${product.name}</h3>
            <div class="product-rating">
                <span class="rating-stars">${getStarRating(product.rating)}</span>
                <span class="rating-value">${product.rating}</span>
            </div>
            <div class="product-price">${formatPrice(product._minPrice)} ₽</div>
            <div style="margin-top:8px; font-size:0.85rem; color:#64748b;">
                📊 Средняя рыночная цена: ${product._marketPrice ? `${Math.round(product._marketPrice).toLocaleString('ru-RU')} ₽` : 'данные недоступны'}
            </div>
            <div style="margin-top:10px; background:#e5e7eb; border-radius:999px; overflow:hidden; height:8px;">
                <div style="height:100%; width:${product._valueInterpretation.width}; background:${product._valueInterpretation.color}; transition:width .3s ease;"></div>
            </div>
            <div style="margin-top:8px; font-weight:600; color:${product._valueInterpretation.color}; font-size:0.9rem;">
                ${product._valueInterpretation.text} (${product._valueScore.toFixed(1)})
            </div>
            <div class="product-actions" style="margin-top: 1rem;">
                <button class="btn btn-outline" onclick="event.stopPropagation(); addToComparison(${product.id})">Сравнить</button>
                <button class="btn btn-primary" onclick="event.stopPropagation(); openProduct(${product.id})">Подробнее</button>
            </div>
        </div>
    `).join('');
}

function setupRecommendationsFilters() {
  const queryInput = document.getElementById('recommendationsSearch');
  const categorySelect = document.getElementById('recommendationsCategory');
  const minPriceInput = document.getElementById('recommendationsMinPrice');
  const maxPriceInput = document.getElementById('recommendationsMaxPrice');
  const sortSelect = document.getElementById('recommendationsSort');
  const resetBtn = document.getElementById('recommendationsResetFilters');

  if (!queryInput || !categorySelect || !minPriceInput || !maxPriceInput || !sortSelect || !resetBtn) return;

  const apply = () => applyRecommendationsFilters();

  queryInput.addEventListener('input', apply);
  categorySelect.addEventListener('change', apply);
  minPriceInput.addEventListener('change', apply);
  maxPriceInput.addEventListener('change', apply);
  sortSelect.addEventListener('change', apply);
  resetBtn.addEventListener('click', resetRecommendationsFilters);

  populateRecommendationsCategoryFilter();
}

function populateRecommendationsCategoryFilter() {
  const categorySelect = document.getElementById('recommendationsCategory');
  if (!categorySelect) return;

  const categories = Array.from(new Set((demoProducts || []).map(p => p.category).filter(Boolean))).sort();
  const current = categorySelect.value;
  categorySelect.innerHTML = `<option value="">Все категории</option>${categories.map(cat => `<option value="${cat}">${getCategoryName(cat)}</option>`).join('')}`;
  categorySelect.value = current || '';
}

function getActiveRecommendationTabType() {
  const active = document.querySelector('.tab-content.active');
  return active?.id || 'popular';
}

async function renderRecommendationsByType(type) {
  const gridId = recommendationGridIdMap[type];
  const grid = document.getElementById(gridId);
  if (!grid) return;

  const source = Array.isArray(recommendationStore[type]) ? recommendationStore[type] : [];
  const prepared = type === 'bestValue' ? await prepareBestValueProducts(source) : [...source];
  const filtered = filterAndSortRecommendationProducts(prepared, type);

  if (type === 'bestValue') {
    renderPreparedBestValueProducts(gridId, filtered);
  } else {
    displayEnhancedProducts(gridId, filtered, type);
  }
}

async function prepareBestValueProducts(products) {
  const enriched = await Promise.all((products || []).map(async (product) => {
    const minPrice = getMinPrice(product);
    let marketPrice = null;
    if (product.id) {
      try {
        marketPrice = await getMarketPrice(product.id);
      } catch (e) {
        marketPrice = null;
      }
    }
    const rawScore = calculateValueScore(product, minPrice || 0, marketPrice);
    const valueScore = Number.isFinite(rawScore) ? rawScore : -Infinity;
    return {
      ...product,
      _minPrice: minPrice,
      _marketPrice: marketPrice,
      _valueScore: valueScore,
      _valueInterpretation: getValueInterpretation(valueScore)
    };
  }));
  return enriched;
}

function renderPreparedBestValueProducts(gridId, products) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  if (!products || products.length === 0) {
    grid.innerHTML = '<p style="text-align:center; color:#6b7280; padding:2rem;">Нет доступных товаров в данной подборке</p>';
    return;
  }
  grid.innerHTML = products.map((product) => `
    <div class="product-card product-card-enhanced" onclick="openProduct(${product.id})">
      <div class="recommendation-badge">💰 Выгодно</div>
      <img src="${product.image || product.imageUrl || 'https://via.placeholder.com/300?text=Нет+изображения'}" alt="${product.name}"
      style="width: 100%; height: 200px; object-fit: contain; background: #f8f9fa; border-radius: 8px;">
      <h3>${product.name}</h3>
      <div class="product-rating">
        <span class="rating-stars">${getStarRating(product.rating)}</span>
        <span class="rating-value">${product.rating}</span>
      </div>
      <div class="product-price">${formatPrice(product._minPrice)} ₽</div>
      <div style="margin-top:8px; font-size:0.85rem; color:#64748b;">
        📊 Средняя рыночная цена: ${product._marketPrice ? `${Math.round(product._marketPrice).toLocaleString('ru-RU')} ₽` : 'данные недоступны'}
      </div>
      <div style="margin-top:10px; background:#e5e7eb; border-radius:999px; overflow:hidden; height:8px;">
        <div style="height:100%; width:${product._valueInterpretation.width}; background:${product._valueInterpretation.color}; transition:width .3s ease;"></div>
      </div>
      <div style="margin-top:8px; font-weight:600; color:${product._valueInterpretation.color}; font-size:0.9rem;">
        ${product._valueInterpretation.text} (${product._valueScore.toFixed(1)})
      </div>
      <div class="product-actions" style="margin-top: 1rem;">
        <button class="btn btn-outline" onclick="event.stopPropagation(); addToComparison(${product.id})">Сравнить</button>
        <button class="btn btn-primary" onclick="event.stopPropagation(); openProduct(${product.id})">Подробнее</button>
      </div>
    </div>
  `).join('');
}

function filterAndSortRecommendationProducts(products, type) {
  const query = (recommendationFilters.query || '').toLowerCase().trim();
  const category = recommendationFilters.category || '';
  const minPrice = recommendationFilters.minPrice !== '' ? Number(recommendationFilters.minPrice) : 0;
  const maxPrice = recommendationFilters.maxPrice !== '' ? Number(recommendationFilters.maxPrice) : Infinity;
  const sortBy = recommendationFilters.sortBy || 'relevance';

  let result = [...products].filter(product => {
    const min = product._minPrice ?? getMinPrice(product) ?? 0;
    const matchesQuery = !query || product.name?.toLowerCase().includes(query) ||
      (product.specs && Object.values(product.specs).some(v => String(v).toLowerCase().includes(query)));
    const matchesCategory = !category || product.category === category;
    const matchesPrice = min >= minPrice && min <= maxPrice;
    return matchesQuery && matchesCategory && matchesPrice;
  });

  result.sort((a, b) => {
    if (type === 'bestValue') {
      if (sortBy === 'price_asc') return (a._minPrice ?? getMinPrice(a) ?? Infinity) - (b._minPrice ?? getMinPrice(b) ?? Infinity);
      if (sortBy === 'price_desc') return (b._minPrice ?? getMinPrice(b) ?? 0) - (a._minPrice ?? getMinPrice(a) ?? 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '', 'ru');
      return (b._valueScore ?? -Infinity) - (a._valueScore ?? -Infinity);
    }

    if (sortBy === 'price_asc') return (getMinPrice(a) ?? Infinity) - (getMinPrice(b) ?? Infinity);
    if (sortBy === 'price_desc') return (getMinPrice(b) ?? 0) - (getMinPrice(a) ?? 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '', 'ru');
    return 0;
  });

  return result;
}

async function applyRecommendationsFilters() {
  recommendationFilters.query = document.getElementById('recommendationsSearch')?.value || '';
  recommendationFilters.category = document.getElementById('recommendationsCategory')?.value || '';
  recommendationFilters.minPrice = document.getElementById('recommendationsMinPrice')?.value || '';
  recommendationFilters.maxPrice = document.getElementById('recommendationsMaxPrice')?.value || '';
  recommendationFilters.sortBy = document.getElementById('recommendationsSort')?.value || 'relevance';
  await renderRecommendationsByType(getActiveRecommendationTabType());
}

async function resetRecommendationsFilters() {
  const queryInput = document.getElementById('recommendationsSearch');
  const categorySelect = document.getElementById('recommendationsCategory');
  const minPriceInput = document.getElementById('recommendationsMinPrice');
  const maxPriceInput = document.getElementById('recommendationsMaxPrice');
  const sortSelect = document.getElementById('recommendationsSort');

  if (queryInput) queryInput.value = '';
  if (categorySelect) categorySelect.value = '';
  if (minPriceInput) minPriceInput.value = '';
  if (maxPriceInput) maxPriceInput.value = '';
  if (sortSelect) sortSelect.value = 'relevance';

  await applyRecommendationsFilters();
}

//Функция расчёта совпадения
function calculateMatchScore(product, type) {
  //Пример расчёта совпадения для bestValue или personal
  switch (type) {
    case 'bestValue':
      //Используем valueScore, рассчитанный на сервере
      return Math.min(Math.max(product.valueScore || 0, 0), 100);
    case 'personal':
      let score = product.rating * 20; //Базовый счёт за рейтинг
      
      const favIds = JSON.parse(localStorage.getItem('techAggregatorFavorites') || '[]').map(f => f.id);
      const compIds = JSON.parse(localStorage.getItem('techAggregatorComparisons') || '[]').map(c => c.id); //Предположим, что есть такая переменная

      if (favIds.includes(product.id)) score += 30;
      if (compIds.includes(product.id)) score += 20;

      
      if (product.similarityScore !== undefined) {
        score += (product.similarityScore * 50);
      }

      return Math.min(Math.max(score, 0), 100);
    default:
      return 0; //Для популярных/трендов, совпадение не считается
  }
}

//Функция получения бейджа
function getRecommendationBadge(product, type) {
    switch (type) {
        case 'popular': return product.rating >= 4.8 ? '🔥 Топ' : product.rating >= 4.5 ? '🔥 Популярно' : '';
        case 'trending': return '📈 Тренд';
        case 'bestValue': return '💰 Выгодно';
        case 'priceDrop': return '📉 Цена упала';
        case 'personal':
            if (product.recommendationType === 'viewed') return '👀 Вы смотрели';
            if (product.recommendationType === 'similar') return '🎯 Похоже на ваши просмотры';
            return '🎯 Для вас';
        default: return '';
    }
}

//Индикатор тренда
function getTrendIndicator(product, type) {
  //Пример простого индикатора, если это трендовый товар
  if (type === 'trending') {
    //Можно использовать дату создания или другие метрики
    const date = new Date(product.createdAt);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    //Просто для демонстрации, используем случайный индикатор
    const trend = Math.random() > 0.5 ? 'up' : 'down';
    const percent = (Math.random() * 15 + 5).toFixed(1);
    return trend === 'up'
      ? `<span class="trend-indicator trend-up">↗ +${percent}%</span>`
      : `<span class="trend-indicator trend-down">↘ -${percent}%</span>`;
  }
  return '';
}

//Открытие вкладки на странице рекомендаций
function openTab(tabName) {
  //Скрываем все вкладки
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  //Убираем активный класс со всех кнопок
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  //Показываем выбранную вкладку
  document.getElementById(tabName).classList.add('active');
  //Активируем соответствующую кнопку
  const targetBtn = Array.from(document.querySelectorAll('.tab-btn'))
    .find(btn => btn.getAttribute('onclick')?.includes(`'${tabName}'`));
  if (targetBtn) targetBtn.classList.add('active');
  applyRecommendationsFilters();
}

function editProfile() {
  if (!currentUser) {
    showCustomNotification('Требуется авторизация', 'warning');
    //window.location.href = 'auth.html';
    return;
  }

  //Закрываем старое окно, если оно есть
  closeEditProfileModal();

  const modalHtml = `
    <div class="modal-overlay" id="editProfileModalOverlay" style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    ">
      <div class="modal-content" id="editProfileModalContent" style="
        background-color: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
      ">
        <h3>Редактировать профиль</h3>
        <form id="editProfileForm">
          <div class="form-group">
            <label for="editFullName">Полное имя:</label>
            <input type="text" id="editFullName" name="fullName" value="${currentUser.fullName || ''}" required>
          </div>
          <div class="form-group">
            <label for="editEmail">Email:</label>
            <input type="email" id="editEmail" name="email" value="${currentUser.email}" readonly disabled>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-outline" onclick="closeEditProfileModal()">Отмена</button>
            <button type="submit" class="btn btn-primary">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const overlay = document.getElementById('editProfileModalOverlay');
  if (overlay) {
    overlay.onclick = function(event) {
      if (event.target === overlay) {
        closeEditProfileModal();
      }
    };
  }

  document.getElementById('editProfileForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const fullNameInput = document.getElementById('editFullName');
    const newFullName = fullNameInput.value.trim();

    if (!newFullName) {
      showCustomNotification('Полное имя не может быть пустым', 'info');
      return;
    }

    const token = localStorage.getItem('techAggregatorToken');
    if (!token) {
      showCustomNotification('Токен отсутствует', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: newFullName
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('techAggregatorToken');
          currentUser = null;
          updateAuthButtons();
          showCustomNotification('Сессия истекла. Пожалуйста, войдите снова.', 'warning');
          //window.location.href = 'auth.html';
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const updatedUser = await response.json();
      console.log('Профиль обновлён:', updatedUser);

      currentUser.fullName = updatedUser.fullName;

      closeEditProfileModal();
      showCustomNotification('Профиль успешно обновлён', 'success');

      if (window.location.pathname.includes('profile.html')) {
         loadProfileDataFromAPI();
      }

    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      showCustomNotification(`Ошибка обновления профиля: ${error.message}`, 'error');
    }
  });
}

function closeEditProfileModal() {
  const modal = document.getElementById('editProfileModalOverlay');
  if (modal) {
    modal.remove();
  }
}

function changePassword() {
  if (!currentUser) {
    showCustomNotification('Требуется авторизация', 'warning');
    //window.location.href = 'auth.html';
    return;
  }

  closeChangePasswordModal();

  const modalHtml = `
    <div class="modal-overlay" id="changePasswordModalOverlay" style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    ">
      <div class="modal-content" id="changePasswordModalContent" style="
        background-color: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
      ">
        <h3>Сменить пароль</h3>
        <form id="changePasswordForm">
          <div class="form-group">
            <label for="oldPassword">Старый пароль:</label>
            <input type="password" id="oldPassword" name="oldPassword" required>
          </div>
          <div class="form-group">
            <label for="newPassword">Новый пароль (минимум 8 символов):</label>
            <input type="password" id="newPassword" name="newPassword" required pattern=".{8,}">
          </div>
          <div class="form-group">
            <label for="confirmNewPassword">Подтвердите новый пароль:</label>
            <input type="password" id="confirmNewPassword" name="confirmNewPassword" required>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-outline" onclick="closeChangePasswordModal()">Отмена</button>
            <button type="submit" class="btn btn-primary">Сменить пароль</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const overlay = document.getElementById('changePasswordModalOverlay');
  if (overlay) {
    overlay.onclick = function(event) {
      if (event.target === overlay) {
        closeChangePasswordModal();
      }
    };
  }

  document.getElementById('changePasswordForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const oldPasswordInput = document.getElementById('oldPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');

    const oldPassword = oldPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmNewPassword = confirmNewPasswordInput.value;

    if (newPassword !== confirmNewPassword) {
      showCustomNotification('Новые пароли не совпадают', 'info');
      return;
    }

    if (newPassword.length < 8) {
      showCustomNotification('Новый пароль должен быть не менее 8 символов', 'info');
      return;
    }

    const token = localStorage.getItem('techAggregatorToken');
    if (!token) {
      showCustomNotification('Токен отсутствует', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: oldPassword,
          newPassword: newPassword
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('techAggregatorToken');
          currentUser = null;
          updateAuthButtons();
          showCustomNotification('Сессия истекла. Пожалуйста, войдите снова.', 'warning');
          //window.location.href = 'auth.html';
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('Пароль изменён:', result);

      closeChangePasswordModal();
      showCustomNotification('Пароль успешно изменён', 'success');
      logout();

    } catch (error) {
      console.error('Ошибка смены пароля:', error);
      showCustomNotification(`Ошибка смены пароля: ${error.message}`, 'error');
    }
  });
}

function closeChangePasswordModal() {
  const modal = document.getElementById('changePasswordModalOverlay');
  if (modal) {
    modal.remove();
  }
}

function changeAvatar() {
  if (!currentUser) {
    showCustomNotification('Требуется авторизация', 'warning');
    //window.location.href = 'auth.html';
    return;
  }

  closeChangeAvatarModal();

  const modalHtml = `
    <div class="modal-overlay" id="changeAvatarModalOverlay" style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    ">
      <div class="modal-content" id="changeAvatarModalContent" style="
        background-color: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
      ">
        <h3>Сменить аватар</h3>
        <form id="changeAvatarForm">
          <div class="form-group">
            <label for="avatarUpload">Загрузить новое изображение:</label>
            <input type="file" id="avatarUpload" name="avatar" accept="image/*" required>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-outline" onclick="closeChangeAvatarModal()">Отмена</button>
            <button type="submit" class="btn btn-primary">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const overlay = document.getElementById('changeAvatarModalOverlay');
  if (overlay) {
    overlay.onclick = function(event) {
      if (event.target === overlay) {
        closeChangeAvatarModal();
      }
    };
  }

  document.getElementById('changeAvatarForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const fileInput = document.getElementById('avatarUpload');
    const file = fileInput.files[0];

    if (!file) {
      showCustomNotification('Пожалуйста, выберите файл изображения.', 'info');
      return;
    }

    //Проверка типа файла (опционально, но рекомендуется)
    if (!file.type.match('image.*')) {
      showCustomNotification('Пожалуйста, выберите файл изображения (JPEG, PNG, GIF).', 'info');
      return;
    }

    //Проверка размера файла (опционально, например, не более 5MB)
    const maxSize = 5 * 1024 * 1024; //5 MB в байтах
    if (file.size > maxSize) {
      showCustomNotification('Размер файла не должен превышать 5 МБ.', 'info');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const token = localStorage.getItem('techAggregatorToken');
    if (!token) {
      showCustomNotification('Токен отсутствует', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/profile/avatar', {
        method: 'PUT', //Или PATCH
        headers: {
          //Не указываем Content-Type, так как используется FormData
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('techAggregatorToken');
          currentUser = null;
          updateAuthButtons();
          showCustomNotification('Сессия истекла. Пожалуйста, войдите снова.', 'warning');
          //window.location.href = 'auth.html';
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('Аватар обновлён:', result);

      //Обновляем URL аватара у currentUser (если сервер возвращает новый URL)
      if (result.updatedUser && result.updatedUser.avatarUrl) {
          currentUser.avatarUrl = result.updatedUser.avatarUrl;
      }

      closeChangeAvatarModal();
      showCustomNotification('Аватар успешно обновлён', 'success');

      //Обновить отображение аватара на странице 
      updateAvatarDisplay(result.updatedUser.avatarUrl);

    } catch (error) {
      console.error('Ошибка смены аватара:', error);
      showCustomNotification(`Ошибка смены аватара: ${error.message}`, 'error');
    }
  });
}

function closeChangeAvatarModal() {
  const modal = document.getElementById('changeAvatarModalOverlay');
  if (modal) {
    modal.remove();
  }
}

function updateAvatarDisplay(newAvatarUrl) {
  
  const avatarElements = document.querySelectorAll('.user-avatar-img'); //Пример класса
  if (avatarElements.length > 0) {
    avatarElements.forEach(img => {
      img.src = newAvatarUrl || 'https://via.placeholder.com/50x50?text=?'; //Заглушка, если нет URL
    });
  }

  //Если аватар отображается как фоновое изображение div'а
  const avatarBgElements = document.querySelectorAll('.user-avatar-bg'); //Пример класса
  if (avatarBgElements.length > 0) {
    avatarBgElements.forEach(div => {
      div.style.backgroundImage = `url("${newAvatarUrl || 'https://via.placeholder.com/50x50?text=?'}")`;
    });
  }
}


async function addProductToDatabase(productData) {
    const token = localStorage.getItem('techAggregatorToken');
    if (!token) return showCustomNotification('Ошибка авторизации', 'error');

    try {
        const response = await fetch('http://localhost:3000/api/admin/manual-add-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            showCustomNotification('Товар успешно добавлен в каталог!', 'success');
            resetParseForm();
        } else {
            const err = await response.json();
            showCustomNotification(`Ошибка: ${err.error}`, 'error');
        }
    } catch (e) {
        console.error(e);
        showCustomNotification('Ошибка сети', 'error');
    }
}

//Отправка на парсинг
async function sendParseRequest(url, category, proxy = null) {
    const token = localStorage.getItem('techAggregatorToken');
    if (!token) {
        showCustomNotification('Требуется авторизация администратора', 'error');
        return;
    }

    try {
        console.log('📤 Отправка запроса на парсинг:', { url, category, proxy });
        
        const response = await fetch('http://localhost:3000/api/admin/parse-product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ url, category, proxy })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
            throw new Error(errData.error || `Ошибка сервера: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Ответ сервера:', result);
        displayParsedResult(result.parsedData, result.message);
    } catch (error) {
        console.error('❌ Ошибка парсинга:', error);
        showCustomNotification(`Ошибка: ${error.message}`, 'error');
        //Показываем ошибку в контейнере результата, если сервер вернул данные частично
        const resultContainer = document.getElementById('parseResult');
        if (resultContainer) {
            resultContainer.innerHTML = `<p class="error-message" style="color: #ef4444;">⚠️ ${error.message}</p>`;
            resultContainer.style.display = 'block';
        }
    }
}

//Отображение спаршеного товара админу
function displayParsedResult(parsedData, message) {
    const resultContainer = document.getElementById('parseResult');
    if (!resultContainer) return;

    //Начальная строка цены (Яндекс.Маркет / Wildberries — из API Systems и при необходимости со страницы)
    const priceStore = parsedData.priceStoreName || 'Yandex Market';
    const hasInitialPriceContext = parsedData.price != null || parsedData.sourceUrl || parsedData.priceStoreName;
    const initialPriceRow = hasInitialPriceContext ? `
        <div class="price-row" style="display: flex; gap: 10px; margin-bottom: 5px;">
            <select class="price-store-select" style="flex: 1;">
                <option value="DNS" ${priceStore === 'DNS' ? 'selected' : ''}>DNS</option>
                <option value="OZON" ${priceStore === 'OZON' ? 'selected' : ''}>OZON</option>
                <option value="Wildberries" ${priceStore === 'Wildberries' ? 'selected' : ''}>Wildberries</option>
                <option value="Citilink" ${priceStore === 'Citilink' ? 'selected' : ''}>Citilink</option>
                <option value="MVideo" ${priceStore === 'MVideo' ? 'selected' : ''}>M.Video</option>
                <option value="Yandex Market" ${priceStore === 'Yandex Market' ? 'selected' : ''}>Яндекс Маркет</option>
                <option value="Other" ${priceStore === 'Other' ? 'selected' : ''}>Другой</option>
            </select>
            <input type="number" class="price-value-input" value="${parsedData.price != null ? parsedData.price : ''}" style="flex: 1;" placeholder="Цена">
            <input type="url" class="price-url-input" value="${parsedData.sourceUrl || ''}" style="flex: 1.5;" placeholder="Ссылка на товар">
            <button type="button" class="btn btn-danger btn-small" onclick="this.parentElement.remove()">✕</button>
        </div>
    ` : '';

    //Начальные характеристики (уже нормализованные сервером)
    let specsHtml = '';
    if (parsedData.specs && typeof parsedData.specs === 'object') {
        specsHtml = Object.entries(parsedData.specs).map(([key, val]) => {
            const displayKey = window.specKeyTranslations?.[key] || key;
            return `
            <div class="spec-row" style="display: flex; gap: 10px; margin-bottom: 5px;">
                <input type="text" class="spec-key" value="${displayKey}" style="flex: 1;" placeholder="Название">
                <input type="text" class="spec-value" value="${val}" style="flex: 1;" placeholder="Значение">
                <button type="button" class="btn btn-danger btn-small" onclick="this.parentElement.remove()">✕</button>
            </div>
            `;
        }).join('');
    }

    resultContainer.innerHTML = `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <h3>📦 Редактирование товара перед сохранением</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <label style="font-weight: bold;">Название товара</label>
                    <input type="text" id="editProdName" value="${parsedData.name || ''}" style="width: 100%; padding: 8px; margin-top: 5px;">
                </div>
                <div>
                    <label style="font-weight: bold;">Категория</label>
                    <select id="editProdCategory" style="width: 100%; padding: 8px; margin-top: 5px;">
                        <option value="smartphones" ${parsedData.category === 'smartphones' ? 'selected' : ''}>Смартфоны</option>
                        <option value="laptops" ${parsedData.category === 'laptops' ? 'selected' : ''}>Ноутбуки</option>
                        <option value="tv" ${parsedData.category === 'tv' ? 'selected' : ''}>Телевизоры</option>
                        <option value="monitors" ${parsedData.category === 'monitors' ? 'selected' : ''}>Мониторы</option>
                        <option value="external_drives" ${parsedData.category === 'external_drives' ? 'selected' : ''}>Внешние накопители</option>
                        <option value="graphics_cards" ${parsedData.category === 'graphics_cards' ? 'selected' : ''}>Видеокарты</option>
                        <option value="cpus" ${parsedData.category === 'cpus' ? 'selected' : ''}>Процессоры</option>
                        <option value="motherboards" ${parsedData.category === 'motherboards' ? 'selected' : ''}>Материнские платы</option>
                        <option value="ram" ${parsedData.category === 'ram' ? 'selected' : ''}>Оперативная память</option>
                        <option value="power_banks" ${parsedData.category === 'power_banks' ? 'selected' : ''}>Павербанки</option>
                        <option value="smart_home" ${parsedData.category === 'smart_home' ? 'selected' : ''}>Умный дом</option>
                        <option value="fitness_trackers" ${parsedData.category === 'fitness_trackers' ? 'selected' : ''}>Фитнес-трекеры</option>
                        <option value="portable_speakers" ${parsedData.category === 'portable_speakers' ? 'selected' : ''}>Портативные колонки</option>
                        <option value="webcams" ${parsedData.category === 'webcams' ? 'selected' : ''}>Веб-камеры</option>
                        <option value="microphones" ${parsedData.category === 'microphones' ? 'selected' : ''}>Микрофоны</option>
                        <option value="power_units" ${parsedData.category === 'power_units' ? 'selected' : ''}>Блоки питания</option>
                        <option value="drivers" ${parsedData.category === 'drivers' ? 'selected' : ''}>Накопители</option>
                        <option value="cases" ${parsedData.category === 'cases' ? 'selected' : ''}>Корпуса ПК</option>
                        <option value="mouses" ${parsedData.category === 'mouses' ? 'selected' : ''}>Мыши</option>
                        <option value="keyboards" ${parsedData.category === 'keyboards' ? 'selected' : ''}>Клавиатура</option>
                        <option value="headphones" ${parsedData.category === 'headphones' ? 'selected' : ''}>Наушники</option>
                        <option value="cameras" ${parsedData.category === 'cameras' ? 'selected' : ''}>Камеры</option>
                        <option value="tablets" ${parsedData.category === 'tablets' ? 'selected' : ''}>Планшеты</option>
                        <option value="smartwatches" ${parsedData.category === 'smartwatches' ? 'selected' : ''}>Смарт-часы</option>
                        <option value="ebooks" ${parsedData.category === 'ebooks' ? 'selected' : ''}>Электронные книги</option>
                        <option value="drones" ${parsedData.category === 'drones' ? 'selected' : ''}>Дроны</option>
                        <option value="pc_components" ${parsedData.category === 'pc_components' ? 'selected' : ''}>Комплектующие ПК</option>
                        <option value="accessories" ${parsedData.category === 'accessories' ? 'selected' : ''}>Аксессуары</option>
                        <option value="gaming" ${parsedData.category === 'gaming' ? 'selected' : ''}>Игровые консоли</option>
                        <option value="networking" ${parsedData.category === 'networking' ? 'selected' : ''}>Сетевое оборудование</option>
                        <option value="audio" ${parsedData.category === 'audio' ? 'selected' : ''}>Аудиосистемы</option>
                        <option value="wearables" ${parsedData.category === 'wearables' ? 'selected' : ''}>Носимые устройства</option>
                        <option value="other">Другое</option>
                    </select>
                </div>
            </div>
            <div style="margin-top: 15px;">
                <label style="font-weight: bold;">Ссылка на изображение</label>
                <input type="text" id="editProdImage" value="${parsedData.imageUrl || ''}" style="width: 100%; padding: 8px; margin-top: 5px;" oninput="updateImagePreview(this.value)">
                <div style="margin-top: 10px;">
                    <img id="imagePreviewThumb" src="${parsedData.imageUrl || ''}" style="max-height: 100px; border-radius: 4px; display: ${parsedData.imageUrl ? 'block' : 'none'};">
                </div>
            </div>
            <div style="margin-top: 15px;">
                <label style="font-weight: bold;">Характеристики (Нормализованные)</label>
                <div id="specsContainer" style="margin-top: 5px;">${specsHtml || '<p>Нет характеристик</p>'}</div>
                <button type="button" class="btn btn-secondary" style="margin-top: 5px;" onclick="addSpecRow()">+ Характеристика</button>
            </div>
            <div style="margin-top: 15px;">
                <label style="font-weight: bold;">Цены в магазинах</label>
                <div id="pricesContainer" style="margin-top: 5px;">${initialPriceRow}</div>
                <button type="button" class="btn btn-secondary" style="margin-top: 5px;" onclick="addPriceRow()">+ Цена магазина</button>
            </div>
            <p style="color: #6b7280; margin-top: 15px;">${message || 'Проверьте данные и нажмите "Сохранить".'}</p>
            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <button class="btn btn-secondary" onclick="resetParseForm()">Отмена</button>
                <button class="btn btn-primary" onclick="confirmAndSaveParsedDataWithEdit()">✅ Сохранить в БД</button>
            </div>
        </div>
    `;
    resultContainer.style.display = 'block';
}


function addPriceRow() {
  const container = document.getElementById('pricesContainer');
  const div = document.createElement('div');
  div.className = 'price-row';
  div.style.cssText = 'display: flex; gap: 10px; margin-bottom: 5px;';
  div.innerHTML = `
    <select class="price-store-select" style="flex: 1;">
      <option value="DNS">DNS</option>
      <option value="OZON">OZON</option>
      <option value="Wildberries">Wildberries</option>
      <option value="Citilink">Citilink</option>
      <option value="MVideo">M.Video</option>
      <option value="Yandex Market">Яндекс Маркет</option>
      <option value="Other">Другой</option>
    </select>
    <input type="number" class="price-value-input" style="flex: 1;" placeholder="Цена">
    <input type="url" class="price-url-input" style="flex: 1.5;" placeholder="Ссылка на товар">
    <button type="button" class="btn btn-danger btn-small" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(div);
}

function updateImagePreview(url) {
    const img = document.getElementById('imagePreviewThumb');
    if (img) {
        if (url) {
            img.src = url;
            img.style.display = 'block';
        } else {
            img.style.display = 'none';
        }
    }
}

//История цен

async function searchProductForPriceHistory() {
  const searchInput = document.getElementById('productSearchInput');
  const searchTerm = searchInput.value.trim();

  if (!searchTerm) {
    showCustomNotification('Пожалуйста, введите название товара для поиска.', 'info');
    return;
  }

  const token = localStorage.getItem('techAggregatorToken');
  if (!token) {
    showCustomNotification('Токен отсутствует', 'error');
    return;
  }

  try {
    //Поиск товара по названию (предположим, есть маршрут /api/products/search)
    //Если такого маршрута нет, можно запросить все товары, но это неэффективно
    //Пока используем существующий маршрут получения товара по ID, предполагая, что админ знает ID
    //Или используем маршрут получения всех товаров и фильтруем на клиенте (неэффективно для больших списков)
    //Лучше добавить маршрут /api/products/search в server.js
    //const response = await fetch(`http://localhost:3000/api/products/search?q=${encodeURIComponent(searchTerm)}`, {
    const response = await fetch(`http://localhost:3000/api/products?search=${encodeURIComponent(searchTerm)}`, { //Используем существующий маршрут с параметром поиска, если он реализован
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('techAggregatorToken');
        currentUser = null;
        updateAuthButtons();
        showCustomNotification('Сессия истекла. Пожалуйста, войдите снова.', 'warning');
        window.location.href = 'auth.html';
        return;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const products = await response.json();
    console.log('Результаты поиска:', products);

    //Предположим, что мы нашли один товар или берем первый из списка
    const foundProduct = products.find(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    //Или покажем список и дадим выбрать, если найдено несколько
    if (!foundProduct) {
      document.getElementById('priceHistoryResult').style.display = 'none';
      showCustomNotification('Товар не найден.', 'info');
      return;
    }

    //Загружаем историю цен для найденного товара
    await loadAndDisplayPriceHistory(foundProduct.id, foundProduct.name);

  } catch (error) {
    console.error('Ошибка поиска товара:', error);
    showCustomNotification(`Ошибка поиска товара: ${error.message}`, 'error');
  }
}

async function loadAndDisplayPriceHistory(productId, productName) {
  const token = localStorage.getItem('techAggregatorToken');
  if (!token) {
    showCustomNotification('Токен отсутствует', 'error');
    return;
  }

  try {
    //Загружаем историю цен
    const historyResponse = await fetch(`http://localhost:3000/api/products/${productId}/price-history`, { //Используем существующий маршрут
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!historyResponse.ok) {
      if (historyResponse.status === 401) {
        localStorage.removeItem('techAggregatorToken');
        currentUser = null;
        updateAuthButtons();
        showCustomNotification('Сессия истекла. Пожалуйста, войдите снова.', 'warning');
        window.location.href = 'auth.html';
        return;
      }
      throw new Error(`HTTP ${historyResponse.status}: ${historyResponse.statusText}`);
    }

    const historyData = await historyResponse.json();
    console.log('История цен для товара:', productId, historyData);

    //Обновляем заголовок
    document.getElementById('selectedProductTitle').textContent = productName;
    //Устанавливаем ID товара в скрытое поле формы
    document.getElementById('selectedProductId').value = productId;

    //Показываем контейнер с результатами
    document.getElementById('priceHistoryResult').style.display = 'block';

    //Очищаем предыдущий график
    if (priceHistoryChartInstance) {
      priceHistoryChartInstance.destroy();
    }

    //Отрисовываем график
    renderPriceHistoryChart(historyData, productName);

    //Отрисовываем список
    renderPriceHistoryList(historyData);
    updateAdminPriceSyncSingleButtons();

  } catch (error) {
    console.error('Ошибка загрузки истории цен:', error);
    document.getElementById('priceHistoryChartContainer').innerHTML = `<p class="error-message">Ошибка загрузки истории: ${error.message}</p>`;
    document.getElementById('priceHistoryListContainer').innerHTML = `<p class="error-message">Ошибка загрузки списка: ${error.message}</p>`;
    showCustomNotification(`Ошибка загрузки истории цен: ${error.message}`, 'error');
  }
}

function renderPriceHistoryChart(data, productName) {
  const container = document.getElementById('priceHistoryChartContainer');
  container.innerHTML = ''; //Очищаем контейнер

  if (!data || Object.keys(data).length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #666;">История цен отсутствует</p>';
    return;
  }

  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  //Преобразование данных для Chart.js (аналогично loadAndRenderPriceHistory)
  const datasets = Object.entries(data).map(([storeName, storeData]) => {
    const color = getStoreColor(storeName); //Предполагаем, что getStoreColor доступна
    return {
      label: storeName,
      data: storeData.map(point => ({
        x: new Date(point.x).getTime(), //Преобразуем строку в timestamp
        y: point.y
      })),
      borderColor: color,
      backgroundColor: color + '20', //Добавляем прозрачность (например, RGBA)
      fill: false,
      tension: 0.1
    };
  });

  const chartData = {
    datasets: datasets
  };

  const config = {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false, //Позволяем высоте контейнера управлять размером
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day', //Можно настроить на 'week', 'month' в зависимости от данных
            tooltipFormat: 'dd.MM.yyyy',
          },
          title: {
            display: true,
            text: 'Дата'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Цена (₽)'
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            title: function(context) {
              const d = new Date(context[0].parsed.x);
              return d.toLocaleString('ru-RU');
            }
          }
        }
      }
    }
  };

  priceHistoryChartInstance = new Chart(canvas, config);
}

function renderPriceHistoryList(entries) {
  const container = document.getElementById('priceHistoryListContainer');
  if (!container) return;

  if (!entries || entries.length === 0) {
    container.innerHTML = '<p>Для этого товара пока нет записей об истории цен.</p>';
    return;
  }

  //Предположим, что entries - это объект в формате { storeName: [{x: date, y: price}, ...], ... }
  //Нужно преобразовать в плоский список для отображения
  let flatList = [];
  for (const [storeName, storeEntries] of Object.entries(entries)) {
    storeEntries.forEach(entry => {
      flatList.push({
        storeName: storeName,
        date: entry.x, //Это строка в формате ISO
        price: entry.y
      });
    });
  }

  //Сортируем по дате (новые сверху)
  flatList.sort((a, b) => new Date(b.date) - new Date(a.date));

  container.innerHTML = `
    <table class="price-history-table">
      <thead>
        <tr>
          <th>Магазин</th>
          <th>Дата</th>
          <th>Цена (₽)</th>
        </tr>
      </thead>
      <tbody>
        ${flatList.map(entry => `
          <tr>
            <td>${entry.storeName}</td>
            <td>${new Date(entry.date).toLocaleString('ru-RU')}</td>
            <td>${formatPrice(entry.price)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

document.getElementById('addPriceHistoryForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const productId = document.getElementById('selectedProductId').value;
  const storeName = document.getElementById('newStoreName').value.trim();
  const price = parseFloat(document.getElementById('newPrice').value);
  const date = document.getElementById('newDate').value; //Это строка в формате YYYY-MM-DD

  if (!productId || !storeName || isNaN(price) || price < 0 || !date) {
    showCustomNotification('Пожалуйста, заполните все поля корректно.', 'info');
    return;
  }

  const token = localStorage.getItem('techAggregatorToken');
  if (!token) {
    showCustomNotification('Токен отсутствует', 'error');
    return;
  }

  try {
    //Отправляем новую запись на сервер
    const response = await fetch('http://localhost:3000/api/admin/price-history', { //Используем маршрут добавления
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: parseInt(productId, 10),
        storeName: storeName,
        price: price,
        date: date //Отправляем строку, сервер должен её распознать
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('techAggregatorToken');
        currentUser = null;
        updateAuthButtons();
        showCustomNotification('Сессия истекла. Пожалуйста, войдите снова.', 'warning');
        window.location.href = 'auth.html';
        return;
      }
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('Новая запись добавлена:', result);
    showCustomNotification('Новая запись в истории цен добавлена.', 'success');

    //Очищаем форму
    document.getElementById('newStoreName').value = '';
    document.getElementById('newPrice').value = '';
    document.getElementById('newDate').value = '';

    //Перезагружаем историю цен для обновления графика и списка
    const productName = document.getElementById('selectedProductTitle').textContent;
    await loadAndDisplayPriceHistory(productId, productName); //Перезагружаем данные для текущего товара

  } catch (error) {
    console.error('Ошибка добавления записи в историю:', error);
    showCustomNotification(`Ошибка добавления записи: ${error.message}`, 'error');
  }
});

//Админ поиск
function adminPriceSyncEscapeCell(val) {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getAdminPriceSyncProxy() {
  const el = document.getElementById('priceSyncProxyInput');
  const v = el && el.value.trim();
  return v || null;
}

function closeAdminPriceSyncModal() {
  const modal = document.getElementById('priceSyncPreviewModal');
  if (modal) modal.style.display = 'none';
}

function showAdminPriceSyncModal(title, payload) {
  const modal = document.getElementById('priceSyncPreviewModal');
  const tbody = document.getElementById('priceSyncPreviewTableBody');
  const sumEl = document.getElementById('priceSyncModalSummary');
  const titleEl = document.getElementById('priceSyncModalTitle');
  if (!modal || !tbody || !sumEl || !titleEl) return;

  titleEl.textContent = title || 'Результаты проверки цен';
  const sum = payload.summary || {};
  sumEl.textContent = `Всего: ${sum.total ?? 0}; успешно: ${sum.ok ?? 0}; ошибки: ${sum.error ?? 0}; пропуски: ${sum.skipped ?? 0}.`;
  const rows = payload.results || [];
  tbody.innerHTML = rows
    .map(
      (r) => `
    <tr>
      <td>${adminPriceSyncEscapeCell(r.productName)} <small>(ID ${r.productId})</small></td>
      <td>${adminPriceSyncEscapeCell(r.storeName)}</td>
      <td>${r.oldPrice != null ? adminPriceSyncEscapeCell(String(r.oldPrice)) : '—'}</td>
      <td>${r.newPrice != null ? adminPriceSyncEscapeCell(String(r.newPrice)) : '—'}</td>
      <td>${adminPriceSyncEscapeCell(r.status)}</td>
      <td>${adminPriceSyncEscapeCell(r.message)}</td>
    </tr>`
    )
    .join('');
  modal.style.display = 'flex';
}

async function fetchAdminPriceSyncStatus() {
  const box = document.getElementById('priceSyncStatusDisplay');
  if (!box) return;
  const token = localStorage.getItem('techAggregatorToken');
  if (!token) return;
  box.textContent = 'Загрузка статуса…';
  box.style.whiteSpace = 'pre-line';
  try {
    const res = await fetch('http://localhost:3000/api/admin/prices/sync-status', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('techAggregatorToken');
        currentUser = null;
        updateAuthButtons();
        showCustomNotification('Сессия истекла. Войдите снова.', 'warning');
        return;
      }
      throw new Error(`HTTP ${res.status}`);
    }
    const s = await res.json();
    const lines = [];
    if (s.lastAutoSyncAt) {
      lines.push(`Последнее автообновление: ${new Date(s.lastAutoSyncAt).toLocaleString('ru-RU')}.`);
    } else {
      lines.push('Автообновление ещё ни разу не завершалось.');
    }
    if (s.lastAutoSyncSummary) {
      lines.push(
        `Итог последнего прохода: успешных позиций ${s.lastAutoSyncSummary.ok}, записано в БД ${s.lastAutoSyncSummary.applied}.`
      );
    }
    if (s.lastAutoSyncError) {
      lines.push(`Ошибка: ${s.lastAutoSyncError}`);
    }
    if (s.autoSyncRunning) {
      lines.push('Сейчас выполняется фоновое обновление.');
    }
    lines.push(`Интервал между запросами при сборе: ${s.delayMs} мс. Предпросмотр до ${s.maxPreviewStores} позиций за один запрос.`);
    box.textContent = lines.join('\n');
  } catch (e) {
    box.textContent = 'Не удалось загрузить статус: ' + e.message;
  }
}

function updateAdminPriceSyncSingleButtons() {
  const idEl = document.getElementById('selectedProductId');
  const id = idEl && idEl.value;
  const has = id !== undefined && id !== null && String(id).trim() !== '';
  const b1 = document.getElementById('btnPriceSyncPreviewOne');
  const b2 = document.getElementById('btnPriceSyncApplyOne');
  if (b1) b1.disabled = !has;
  if (b2) b2.disabled = !has;
}

async function runAdminPriceSyncPreviewAll() {
  const token = localStorage.getItem('techAggregatorToken');
  if (!token) {
    showCustomNotification('Нужна авторизация.', 'error');
    return;
  }
  showCustomNotification('Собираем цены по ссылкам — подождите.', 'info');
  try {
    const res = await fetch('http://localhost:3000/api/admin/prices/sync-preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        proxy: getAdminPriceSyncProxy(),
        productIds: null,
        maxStores: null
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    lastAdminPriceSyncPreview = await res.json();
    const applyBtn = document.getElementById('btnPriceSyncApply');
    if (applyBtn) applyBtn.disabled = false;
    showAdminPriceSyncModal('Предпросмотр (каталог)', lastAdminPriceSyncPreview);
  } catch (e) {
    console.error(e);
    showCustomNotification(`Предпросмотр: ${e.message}`, 'error');
  }
}

async function runAdminPriceSyncApplyPreview() {
  const token = localStorage.getItem('techAggregatorToken');
  if (!token || !lastAdminPriceSyncPreview || !Array.isArray(lastAdminPriceSyncPreview.results)) {
    showCustomNotification('Сначала выполните предпросмотр каталога.', 'info');
    return;
  }
  const applyBtn = document.getElementById('btnPriceSyncApply');
  if (applyBtn) applyBtn.disabled = true;
  try {
    const res = await fetch('http://localhost:3000/api/admin/prices/sync-apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ results: lastAdminPriceSyncPreview.results })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    lastAdminPriceSyncPreview = null;
    const appliedCount = typeof data.applied === 'number' ? data.applied : 0;
    showCustomNotification(`Применено записей: ${appliedCount}.`, 'success');
    closeAdminPriceSyncModal();
    fetchAdminPriceSyncStatus();
  } catch (e) {
    console.error(e);
    showCustomNotification(`Применение: ${e.message}`, 'error');
    if (applyBtn) applyBtn.disabled = false;
  }
}

async function runAdminPriceSyncBackgroundJob() {
  const token = localStorage.getItem('techAggregatorToken');
  if (!token) {
    showCustomNotification('Нужна авторизация.', 'error');
    return;
  }
  try {
    const res = await fetch('http://localhost:3000/api/admin/manual-price-update', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    showCustomNotification(data.message || 'Запущено фоновое обновление.', 'success');
    fetchAdminPriceSyncStatus();
  } catch (e) {
    console.error(e);
    showCustomNotification(e.message, 'error');
  }
}

async function runAdminPriceSyncPreviewSingle() {
  const token = localStorage.getItem('techAggregatorToken');
  const idVal = document.getElementById('selectedProductId') && document.getElementById('selectedProductId').value;
  const productId = parseInt(idVal, 10);
  if (!token || !productId) {
    showCustomNotification('Сначала найдите и выберите товар.', 'info');
    return;
  }
  showCustomNotification('Проверяем цены для товара…', 'info');
  try {
    const res = await fetch(`http://localhost:3000/api/admin/prices/sync-product/${productId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ dryRun: true, proxy: getAdminPriceSyncProxy() })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    showAdminPriceSyncModal(`Предпросмотр: товар ID ${productId}`, data);
  } catch (e) {
    console.error(e);
    showCustomNotification(`Предпросмотр товара: ${e.message}`, 'error');
  }
}

async function runAdminPriceSyncApplySingle() {
  const token = localStorage.getItem('techAggregatorToken');
  const idVal = document.getElementById('selectedProductId') && document.getElementById('selectedProductId').value;
  const productId = parseInt(idVal, 10);
  const productName = document.getElementById('selectedProductTitle') && document.getElementById('selectedProductTitle').textContent;
  if (!token || !productId) {
    showCustomNotification('Сначала найдите и выберите товар.', 'info');
    return;
  }
  if (!confirm('Записать полученные цены в историю и обновить текущие цены для этого товара?')) {
    return;
  }
  try {
    const res = await fetch(`http://localhost:3000/api/admin/prices/sync-product/${productId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ dryRun: false, proxy: getAdminPriceSyncProxy() })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    const n = data.applied && typeof data.applied.applied === 'number' ? data.applied.applied : null;
    showCustomNotification(
      n != null ? `Обновлено позиций: ${n}.` : 'Обновление выполнено.',
      'success'
    );
    closeAdminPriceSyncModal();
    fetchAdminPriceSyncStatus();
    if (productName) {
      await loadAndDisplayPriceHistory(productId, productName);
    }
  } catch (e) {
    console.error(e);
    showCustomNotification(`Обновление товара: ${e.message}`, 'error');
  }
}

function initializeAdminPriceSyncControls() {
  document.getElementById('btnPriceSyncRefreshStatus')?.addEventListener('click', fetchAdminPriceSyncStatus);
  document.getElementById('btnPriceSyncPreview')?.addEventListener('click', runAdminPriceSyncPreviewAll);
  document.getElementById('btnPriceSyncApply')?.addEventListener('click', runAdminPriceSyncApplyPreview);
  document.getElementById('btnPriceSyncBackground')?.addEventListener('click', runAdminPriceSyncBackgroundJob);
  document.getElementById('btnPriceSyncPreviewOne')?.addEventListener('click', runAdminPriceSyncPreviewSingle);
  document.getElementById('btnPriceSyncApplyOne')?.addEventListener('click', runAdminPriceSyncApplySingle);
  document.getElementById('btnPriceSyncModalClose')?.addEventListener('click', closeAdminPriceSyncModal);
  const modal = document.getElementById('priceSyncPreviewModal');
  const panel = document.getElementById('priceSyncModalPanel');
  modal?.addEventListener('click', closeAdminPriceSyncModal);
  panel?.addEventListener('click', (e) => e.stopPropagation());
}

function initializeAdminProductSearch() {
  const searchInputId = 'adminPriceHistorySearchInput';
  const suggestionsContainerId = 'adminPriceHistorySearchSuggestions';
  const searchFormId = 'adminPriceHistorySearchForm';

  const searchInput = document.getElementById(searchInputId);
  const searchForm = document.getElementById(searchFormId);

  if (!searchInput || !searchForm) {
    console.warn('Элементы поиска для админ-панели не найдены.');
    return;
  }

  let autocompleteTimeout = null;

  searchInput.addEventListener('input', function(e) {
    const query = e.target.value.trim();

    if (autocompleteTimeout) {
      clearTimeout(autocompleteTimeout);
    }

    if (query.length > 0) {
      autocompleteTimeout = setTimeout(async () => {
        try {
          const suggestions = await fetchSearchSuggestions(query);
          showSearchSuggestions(suggestions, suggestionsContainerId);
          attachSuggestionHandlers(suggestionsContainerId, function(productId, productName) {
             loadAndDisplayPriceHistory(productId, productName);
             document.getElementById(suggestionsContainerId).style.display = 'none';
          });
        } catch (error) {
          console.error('Ошибка автозаполнения в админке:', error);
          document.getElementById(suggestionsContainerId).innerHTML = '';
          document.getElementById(suggestionsContainerId).style.display = 'none';
        }
      }, 300);
    } else {
      document.getElementById(suggestionsContainerId).innerHTML = '';
      document.getElementById(suggestionsContainerId).style.display = 'none';
      clearTimeout(autocompleteTimeout);
    }
  });

  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      searchProductForPriceHistoryByName(query, function(productId, productName) {
        loadAndDisplayPriceHistory(productId, productName);
      });
    }
  });

  document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) && !document.getElementById(suggestionsContainerId).contains(e.target)) {
      document.getElementById(suggestionsContainerId).style.display = 'none';
    }
  });
}

async function searchProductForPriceHistoryByName(searchTerm, onSuccessCallback) {
  if (!searchTerm) {
    showCustomNotification('Пожалуйста, введите название товара для поиска.', 'info');
    return;
  }

  const token = localStorage.getItem('techAggregatorToken');
  if (!token) {
    showCustomNotification('Токен отсутствует', 'error');
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/products?search=${encodeURIComponent(searchTerm)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('techAggregatorToken');
        currentUser = null;
        updateAuthButtons();
        showCustomNotification('Сессия истекла. Пожалуйста, войдите снова.', 'warning');
        window.location.href = 'auth.html';
        return;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const products = await response.json();
    console.log('Результаты поиска (по имени):', products);

    const foundProduct = products.find(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!foundProduct) {
      document.getElementById('priceHistoryResult').style.display = 'none';
      showCustomNotification('Товар не найден.', 'info');
      return;
    }

    if (onSuccessCallback && typeof onSuccessCallback === 'function') {
      onSuccessCallback(foundProduct.id, foundProduct.name);
    }

  } catch (error) {
    console.error('Ошибка поиска товара по имени:', error);
    showCustomNotification(`Ошибка поиска товара: ${error.message}`, 'error');
  }
}

document.addEventListener('DOMContentLoaded', function () {

  initializeAdminProductSearch();

});

function renderPriceHistoryList(entries) {
  const container = document.getElementById('priceHistoryListContainer');
  if (!container) return;

  if (!entries || Object.keys(entries).length === 0) {
    container.innerHTML = '<p>Для этого товара пока нет записей об истории цен.</p>';
    return;
  }

  let flatList = [];
  for (const [storeName, storeEntries] of Object.entries(entries)) {
    storeEntries.forEach(entry => {
      flatList.push({
        storeName: storeName,
        date: entry.x,
        price: entry.y,
        url: entry.url || ''
      });
    });
  }

  flatList.sort((a, b) => new Date(b.date) - new Date(a.date));

  container.innerHTML = `
    <table class="table table-striped table-hover mt-3">
      <thead class="thead-dark">
        <tr>
          <th scope="col">Магазин</th>
          <th scope="col">Дата</th>
          <th scope="col">Цена (₽)</th>
          <th scope="col">Ссылка на покупку</th>
        </tr>
      </thead>
      <tbody>
        ${flatList.map(entry => `
          <tr>
            <td>${entry.storeName}</td>
            <td>${new Date(entry.date).toLocaleString('ru-RU')}</td>
            <td>${formatPrice(entry.price)}</td>
            <td>${entry.url ? `<a href="${entry.url}" target="_blank" rel="noopener noreferrer">Открыть</a>` : '—'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

//Удаление строки характеристики
function removeSpecRow(button) {
    const row = button.closest('.spec-edit-row');
    if (row) {
        row.style.opacity = '0.5';
        row.style.transition = 'opacity 0.2s';
        setTimeout(() => row.remove(), 200);
    }
}

//Дублирование строки характеристики
function duplicateSpecRow(button) {
    const row = button.closest('.spec-edit-row');
    if (!row) return;
    
    const keyInput = row.querySelector('.spec-key-input');
    const valueInput = row.querySelector('.spec-value-input');
    
    const newRow = document.createElement('div');
    newRow.className = 'spec-edit-row';
    newRow.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 2fr auto auto; gap: 0.5rem; align-items: center;">
            <input type="text" class="spec-key-input" value="${keyInput?.value || ''}" 
                   placeholder="Ключ" style="padding: 0.4rem; border: 1px solid #ddd; border-radius: 4px;">
            <input type="text" class="spec-value-input" value="${valueInput?.value || ''}" 
                   placeholder="Значение" style="padding: 0.4rem; border: 1px solid #ddd; border-radius: 4px;">
            <button type="button" class="btn btn-outline btn-small" 
                    onclick="removeSpecRow(this)" style="padding: 0.4rem 0.6rem;">✕</button>
            <button type="button" class="btn btn-outline btn-small" 
                    onclick="duplicateSpecRow(this)" style="padding: 0.4rem 0.6rem;">📋</button>
        </div>
    `;
    
    row.parentNode.insertBefore(newRow, row.nextSibling);
    
    //Подсветка новой строки
    newRow.style.animation = 'fadeIn 0.3s ease';
}

//Добавление новой пустой строки характеристики
function addSpecRow() {
    const container = document.getElementById('specsContainer');
    if (container.querySelector('p')) container.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'spec-row';
    div.style.cssText = 'display: flex; gap: 10px; margin-bottom: 5px;';
    div.innerHTML = `
        <input type="text" class="spec-key" style="flex: 1;" placeholder="Название">
        <input type="text" class="spec-value" style="flex: 1;" placeholder="Значение">
        <button type="button" class="btn btn-danger btn-small" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(div);
}

async function confirmAndSaveParsedDataWithEdit() {
    const name = document.getElementById('editProdName')?.value;
    const category = document.getElementById('editProdCategory')?.value;
    const imageUrl = document.getElementById('editProdImage')?.value;

    if (!name) return showCustomNotification('Введите название товара', 'warning');
    if (!category) return showCustomNotification('Выберите категорию', 'warning');

    //Сбор характеристик (используем обратный перевод, если ключ был русским)
    const specs = {};
    document.querySelectorAll('.spec-row').forEach(row => {
        const keyInput = row.querySelector('.spec-key');
        const valInput = row.querySelector('.spec-value');
        if (keyInput && valInput && keyInput.value) {
            //Пытаемся найти английский ключ по русскому названию
            let finalKey = keyInput.value;
            for (const [eng, rus] of Object.entries(window.specKeyTranslations || {})) {
                if (rus === keyInput.value) {
                    finalKey = eng;
                    break;
                }
            }
            specs[finalKey] = valInput.value;
        }
    });

    //Сбор цен
    const prices = [];
    document.querySelectorAll('.price-row').forEach(row => {
  const storeSelect = row.querySelector('.price-store-select');
  const priceInput = row.querySelector('.price-value-input');
  const urlInput = row.querySelector('.price-url-input'); //<-- ДОБАВЛЕНО
  if (storeSelect && priceInput) {
    const price = parseFloat(priceInput.value);
    const url = urlInput ? urlInput.value.trim() : ''; //<-- ДОБАВЛЕНО
    if (!isNaN(price) && price > 0) {
      prices.push({ storeName: storeSelect.value, price: price, url: url }); //<-- ДОБАВЛЕНО url
    }
  }
});

    const productData = {
        name,
        category,
        imageUrl,
        specs,
        prices
    };

    await addProductToDatabase(productData);
}

function addParsedPriceRow() {
    const container = document.getElementById('parsedPriceRows');
    //Убираем подсказку, если она есть
    const hint = container.querySelector('.text-muted');
    if (hint) hint.remove();

    const row = document.createElement('div');
    row.className = 'parsed-price-row';
    row.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 0.5rem; margin-bottom: 0.5rem;';
    row.innerHTML = `
        <input type="text" class="parsed-price-store" value="" placeholder="Магазин (напр. DNS)" style="padding: 0.4rem; border: 1px solid #ddd; border-radius: 4px;">
        <input type="number" class="parsed-price-value" value="" placeholder="Цена" style="padding: 0.4rem; border: 1px solid #ddd; border-radius: 4px;">
        <input type="url" class="parsed-price-url" value="" placeholder="Ссылка на товар" style="padding: 0.4rem; border: 1px solid #ddd; border-radius: 4px;">
        <button type="button" class="btn btn-danger btn-small" onclick="this.closest('.parsed-price-row').remove()">✕</button>
    `;
    container.appendChild(row);
    row.querySelector('.parsed-price-store').focus();
}


async function trackProductView(productId) {
    if (!productId) return;
    try {
        const token = localStorage.getItem('techAggregatorToken');
        await fetch('http://localhost:3000/api/analytics/track-view', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: JSON.stringify({ productId: parseInt(productId) })
        });
    } catch (e) {
        console.warn('Не удалось записать просмотр:', e);
    }
}

async function trackSearchQuery(query) {
  if (!query || query.trim() === '') return;
  try {
    const token = localStorage.getItem('techAggregatorToken');
    await fetch('http://localhost:3000/api/analytics/track-search', {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ query: query.trim() })
    });
  } catch (e) {
    console.warn('Ошибка логирования поиска:', e);
  }
}
