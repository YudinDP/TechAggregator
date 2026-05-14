'use strict';

const XLSX = require('xlsx');

const IMPORT_SKU_KEY = 'import_sku';

/** Нормализация заголовков колонок Excel/CSV */
function normHeader(s) {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/\u00a0/g, ' ')
    .replace(/ё/g, 'е')
    .replace(/[^a-z0-9а-я]+/gi, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

const ALIAS_GROUPS = {
  importSku: ['sku', 'article', 'vendor_code', 'vendorcode', 'артикул', 'код_товара', 'код', 'id_товара', 'offer_id'],
  name: ['name', 'title', 'product_name', 'наименование', 'название', 'товар', 'модель'],
  category: ['category', 'категория', 'type', 'тип', 'раздел'],
  price: ['price', 'цена', 'cost', 'стоимость', 'price_rub', 'цена_rub'],
  buyUrl: ['buy_url', 'url', 'link', 'purchase_url', 'ссылка', 'ссылка_на_товар', 'card_url', 'product_url'],
  imageUrl: ['image_url', 'image', 'picture', 'photo', 'картинка', 'изображение', 'url_изображения', 'img'],
  description: ['description', 'описание', 'comment', 'комментарий'],
  stock: ['stock', 'qty', 'quantity', 'остаток', 'наличие', 'остаток_склад', 'available'],
  rating: ['rating', 'рейтинг', 'score', 'stars', 'оценка'],
  reviewsCount: ['reviews_count', 'reviews', 'отзывов', 'число_отзывов', 'num_reviews'],
  sellerName: ['seller_name', 'seller', 'продавец', 'магазин_продавец', 'vendor'],
  storeName: ['store_name', 'store', 'магазин', 'retailer', 'channel'],
  specsJson: ['specs_json', 'характеристики_json', 'json_specs', 'attributes_json']
};

function buildAliasIndex() {
  const index = new Map();
  for (const [field, aliases] of Object.entries(ALIAS_GROUPS)) {
    for (const a of aliases) {
      index.set(normHeader(a), field);
    }
  }
  return index;
}

const ALIAS_INDEX = buildAliasIndex();

/** Расшифровка русских названий категорий из прайсов в slug каталога */
const CATEGORY_ALIASES = {
  смартфоны: 'smartphones',
  смартфон: 'smartphones',
  телефоны: 'smartphones',
  ноутбуки: 'laptops',
  ноутбук: 'laptops',
  телевизоры: 'tv',
  тв: 'tv',
  наушники: 'headphones',
  фотоаппараты: 'cameras',
  камеры: 'cameras',
  планшеты: 'tablets',
  смарт_часы: 'smartwatches',
  смартчасы: 'smartwatches',
  часы: 'smartwatches',
  электронные_книги: 'ebooks',
  книги: 'ebooks',
  дроны: 'drones',
  квадрокоптеры: 'drones',
  комплектующие_пк: 'pc_components',
  комплектующие: 'pc_components',
  клавиатуры: 'keyboards',
  мыши: 'mouses',
  мышь: 'mouses',
  корпуса_пк: 'cases',
  корпуса: 'cases',
  накопители: 'drivers',
  ssd: 'drivers',
  фитнес_трекеры: 'fitness_trackers',
  трекеры: 'fitness_trackers',
  блоки_питания: 'power_units',
  микрофоны: 'microphones',
  веб_камеры: 'webcams',
  вебкамеры: 'webcams',
  павербанки: 'power_banks',
  колонки: 'portable_speakers',
  мониторы: 'monitors',
  аксессуары: 'accessories',
  консоли: 'gaming',
  игровые_консоли: 'gaming',
  сеть: 'networking',
  сетевое: 'networking',
  процессоры: 'cpus',
  материнские_платы: 'motherboards',
  память: 'ram',
  озу: 'ram',
  видеокарты: 'graphics_cards',
  внешние_накопители: 'external_drives',
  аудио: 'audio',
  умный_дом: 'smart_home',
  носимые: 'wearables',
  другое: 'other'
};

function mapRow(rawRow) {
  const out = {};
  const extras = {};
  for (const [k, v] of Object.entries(rawRow)) {
    const nk = normHeader(k);
    if (!nk) continue;
    const field = ALIAS_INDEX.get(nk);
    if (field) {
      out[field] = v;
    } else {
      extras[k] = v;
    }
  }
  return { mapped: out, extras };
}

function parseNumber(val) {
  if (val == null || val === '') return null;
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  const s = String(val).replace(/\s/g, '').replace(',', '.');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

function parseIntSafe(val) {
  const n = parseNumber(val);
  if (n == null) return null;
  return Math.round(n);
}

function parseSpecsJson(raw) {
  if (raw == null || raw === '') return {};
  if (typeof raw === 'object' && !Array.isArray(raw) && raw !== null) return raw;
  const s = String(raw).trim();
  if (!s) return {};
  try {
    const o = JSON.parse(s);
    return typeof o === 'object' && o !== null && !Array.isArray(o) ? o : {};
  } catch {
    return {};
  }
}

/**
 * Собирает характеристики: specs_json / объект specs + плоские колонки (игнорируя служебные).
 */
function buildSpecs(mapped, extras, rowObject) {
  let specs = {};
  if (mapped.specsJson != null) {
    specs = { ...specs, ...parseSpecsJson(mapped.specsJson) };
  }
  if (rowObject.specs && typeof rowObject.specs === 'object' && !Array.isArray(rowObject.specs)) {
    specs = { ...specs, ...rowObject.specs };
  }
  const skip = new Set(['items', 'specs', 'specs_json', 'row', 'products']);
  for (const [k, v] of Object.entries(extras)) {
    const nk = normHeader(k);
    if (!nk || skip.has(nk)) continue;
    if (v == null || v === '') continue;
    const key = nk.replace(/[^a-z0-9_]/gi, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || 'field';
    if (!specs[key]) specs[key] = String(v).trim();
  }
  return specs;
}

function extractRow(rowObject, rowIndex) {
  const { mapped, extras } = mapRow(rowObject);
  const name = mapped.name != null ? String(mapped.name).trim() : '';
  const categoryRaw = mapped.category != null ? String(mapped.category).trim().toLowerCase().replace(/\s+/g, '_') : '';
  const category = CATEGORY_ALIASES[categoryRaw] || categoryRaw;
  const price = parseIntSafe(mapped.price);
  const importSku = mapped.importSku != null ? String(mapped.importSku).trim() : '';
  const buyUrl = mapped.buyUrl != null ? String(mapped.buyUrl).trim() : '';
  const imageUrl = mapped.imageUrl != null ? String(mapped.imageUrl).trim() : '';
  const description = mapped.description != null ? String(mapped.description).trim() : '';
  const stock = parseIntSafe(mapped.stock);
  const storeRating = parseNumber(mapped.rating);
  const reviewsCount = parseIntSafe(mapped.reviewsCount);
  const sellerFromRow = mapped.sellerName != null ? String(mapped.sellerName).trim() : '';
  const storeFromRow = mapped.storeName != null ? String(mapped.storeName).trim() : '';

  const specs = buildSpecs(mapped, extras, rowObject);

  const err = [];
  if (!name) err.push('нет названия');
  if (!category) err.push('нет категории');
  if (price == null || price < 0 || !Number.isFinite(price)) err.push('некорректная цена');
  if (!buyUrl) err.push('нет ссылки на покупку');

  return {
    rowIndex,
    importSku,
    name,
    category,
    price,
    buyUrl,
    imageUrl,
    description,
    stock,
    storeRating: storeRating != null && Number.isFinite(storeRating) ? Math.max(0, Math.min(5, storeRating)) : null,
    reviewsCount: reviewsCount != null && reviewsCount >= 0 ? reviewsCount : null,
    sellerFromRow,
    storeFromRow,
    specs,
    errors: err
  };
}

function parseJsonBuffer(buf) {
  const text = buf.toString('utf8').replace(/^\uFEFF/, '');
  const data = JSON.parse(text);
  const rows = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : Array.isArray(data.products) ? data.products : null;
  if (!rows) {
    throw new Error('JSON: ожидается массив или объект с полем items/products — массивом товаров.');
  }
  return rows;
}

function parseXlsxBuffer(buf) {
  const wb = XLSX.read(buf, { type: 'buffer', cellDates: true });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error('Excel: нет листов.');
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
  return rows;
}

function parseImportBuffer(buffer, originalName = '') {
  const lower = String(originalName).toLowerCase();
  if (lower.endsWith('.json')) {
    return { format: 'json', rows: parseJsonBuffer(buffer) };
  }
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
    return { format: 'xlsx', rows: parseXlsxBuffer(buffer) };
  }
  if (lower.endsWith('.csv')) {
    const wb = XLSX.read(buffer.toString('utf8'), { type: 'string' });
    const sheetName = wb.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '', raw: false });
    return { format: 'csv', rows };
  }
  // Пробуем JSON по содержимому
  const t = buffer.toString('utf8', 0, Math.min(buffer.length, 4000)).trim();
  if (t.startsWith('{') || t.startsWith('[')) {
    return { format: 'json', rows: parseJsonBuffer(buffer) };
  }
  return { format: 'xlsx', rows: parseXlsxBuffer(buffer) };
}

async function findProductByMatch(tx, importSku, name, category) {
  if (importSku) {
    const spec = await tx.productSpec.findFirst({
      where: { specKey: IMPORT_SKU_KEY, specValue: importSku }
    });
    if (spec) {
      const p = await tx.product.findUnique({ where: { id: spec.productId } });
      if (p) return p;
    }
  }
  const nameTrim = name.trim();
  const cat = category.trim();
  let p = await tx.product.findFirst({
    where: { name: nameTrim, category: cat }
  });
  if (p) return p;
  p = await tx.product.findFirst({
    where: {
      category: cat,
      name: { equals: nameTrim, mode: 'insensitive' }
    }
  });
  return p;
}

async function replaceProductSpecs(tx, productId, specs, importSku) {
  await tx.productSpec.deleteMany({ where: { productId } });
  const entries = [];
  if (importSku) {
    entries.push({ productId, specKey: IMPORT_SKU_KEY, specValue: importSku });
  }
  for (const [k, v] of Object.entries(specs || {})) {
    const key = String(k).trim();
    const val = v != null ? String(v).trim() : '';
    if (!key || !val || key === IMPORT_SKU_KEY) continue;
    entries.push({ productId, specKey: key, specValue: val });
  }
  if (entries.length) {
    await tx.productSpec.createMany({ data: entries });
  }
}

async function upsertPriceForStore(tx, { productId, storeName, sellerName, price, buyUrl }) {
  const sn = String(storeName || 'Unknown').trim() || 'Unknown';
  const sel = sellerName ? String(sellerName).trim() : null;
  const existing = await tx.price.findFirst({
    where: { productId, storeName: sn, sellerName: sel }
  });
  const urlVal = buyUrl ? String(buyUrl).trim() : '';
  if (existing) {
    const priceChanged = Number(existing.price) !== Number(price);
    await tx.price.update({
      where: { id: existing.id },
      data: {
        price: Math.round(price),
        recordedAt: new Date(),
        ...(urlVal ? { url: urlVal } : {})
      }
    });
    if (priceChanged) {
      await tx.priceHistory.create({
        data: {
          productId,
          storeName: sn,
          sellerName: sel,
          price,
          date: new Date()
        }
      });
    }
  } else {
    await tx.price.create({
      data: {
        productId,
        storeName: sn,
        sellerName: sel,
        price: Math.round(price),
        url: urlVal || ''
      }
    });
    await tx.priceHistory.create({
      data: {
        productId,
        storeName: sn,
        sellerName: sel,
        price,
        date: new Date()
      }
    });
  }
}

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {object} opts
 * @param {Array<object>} opts.rows
 * @param {string} opts.defaultStoreName
 * @param {string|null} opts.defaultSellerName
 * @param {function} opts.upsertStoreSignalsItem
 * @param {number} [opts.previewCap]
 */
async function runProductImport(prisma, opts) {
  const defaultStoreName = String(opts.defaultStoreName || '').trim() || 'Unknown';
  const defaultSellerName = opts.defaultSellerName ? String(opts.defaultSellerName).trim() : null;
  const upsertStoreSignalsItem = opts.upsertStoreSignalsItem;
  const previewCap = Math.min(Math.max(Number(opts.previewCap) || 250, 50), 2000);

  const summary = { total: 0, created: 0, updated: 0, errors: 0, skipped: 0 };
  const createdList = [];
  const updatedList = [];
  const errorsList = [];

  const rawRows = Array.isArray(opts.rows) ? opts.rows : [];
  summary.total = rawRows.length;

  for (let i = 0; i < rawRows.length; i++) {
    const rowObj = rawRows[i];
    if (!rowObj || typeof rowObj !== 'object') {
      summary.errors++;
      errorsList.push({ rowIndex: i + 1, message: 'Пустая или некорректная строка' });
      continue;
    }

    const ex = extractRow(rowObj, i + 1);
    if (ex.errors.length) {
      summary.errors++;
      errorsList.push({ rowIndex: ex.rowIndex, message: ex.errors.join('; ') });
      continue;
    }

    const storeName = ex.storeFromRow || defaultStoreName;
    const sellerName = ex.sellerFromRow || defaultSellerName;

    try {
      const result = await prisma.$transaction(async (tx) => {
        const existing = await findProductByMatch(tx, ex.importSku || null, ex.name, ex.category);

        const productRating =
          ex.storeRating != null && Number.isFinite(ex.storeRating) ? ex.storeRating : undefined;

        if (!existing) {
          const product = await tx.product.create({
            data: {
              name: ex.name.trim(),
              category: ex.category,
              description: ex.description || null,
              imageUrl: ex.imageUrl || null,
              rating: productRating != null ? productRating : 0,
              isActive: true
            }
          });

          await replaceProductSpecs(tx, product.id, ex.specs, ex.importSku || null);

          await upsertPriceForStore(tx, {
            productId: product.id,
            storeName,
            sellerName,
            price: ex.price,
            buyUrl: ex.buyUrl
          });

          return { mode: 'created', product };
        }

        const upd = {
          name: ex.name.trim(),
          category: ex.category,
          description: ex.description !== '' ? ex.description : null,
          imageUrl: ex.imageUrl !== '' ? ex.imageUrl : null
        };
        if (productRating != null) {
          upd.rating = productRating;
        }

        const product = await tx.product.update({
          where: { id: existing.id },
          data: upd
        });

        await replaceProductSpecs(tx, product.id, ex.specs, ex.importSku || null);

        await upsertPriceForStore(tx, {
          productId: product.id,
          storeName,
          sellerName,
          price: ex.price,
          buyUrl: ex.buyUrl
        });

        return { mode: 'updated', product };
      });

      if (result.mode === 'created') {
        summary.created++;
        if (createdList.length < previewCap) {
          createdList.push({ id: result.product.id, name: result.product.name, category: result.product.category });
        }
      } else {
        summary.updated++;
        if (updatedList.length < previewCap) {
          updatedList.push({ id: result.product.id, name: result.product.name, category: result.product.category });
        }
      }

      if (typeof upsertStoreSignalsItem === 'function') {
        const sig = {};
        if (ex.storeRating != null && Number.isFinite(ex.storeRating)) sig.rating = ex.storeRating;
        if (ex.reviewsCount != null && ex.reviewsCount >= 0) sig.reviewsCount = ex.reviewsCount;
        if (ex.stock != null && ex.stock >= 0) sig.stock = ex.stock;
        if (Object.keys(sig).length) {
          upsertStoreSignalsItem(result.product.id, storeName, sellerName, sig, { mergeWithExisting: true });
        }
      }
    } catch (e) {
      summary.errors++;
      errorsList.push({ rowIndex: ex.rowIndex, message: e.message || String(e) });
    }
  }

  return {
    summary,
    created: createdList,
    updated: updatedList,
    errors: errorsList.slice(0, previewCap)
  };
}

module.exports = {
  parseImportBuffer,
  runProductImport,
  extractRow,
  IMPORT_SKU_KEY
};
