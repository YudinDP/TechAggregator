'use strict';

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const BULK_PARSE_MAX_HARD = Math.min(50, Math.max(5, parseInt(process.env.BULK_PARSE_MAX_URLS || '25', 10)));
const BULK_PARSE_DELAY_MS = Math.max(1500, parseInt(process.env.BULK_PARSE_DELAY_MS || '3500', 10));

const STORE_META = {
  dns: {
    storeName: 'DNS',
    sellerName: 'DNS Shop',
    hosts: ['dns-shop.ru'],
    productPathRe: /\/product\/[^/?#]+/i
  },
  ozon: {
    storeName: 'OZON',
    sellerName: 'OZON',
    hosts: ['ozon.ru'],
    productPathRe: /\/product\/[^/?#]+/i
  },
  mvideo: {
    storeName: 'MVideo',
    sellerName: 'М.Видео',
    hosts: ['mvideo.ru', 'm-video.ru'],
    productPathRe: /\/products\/[^/?#]+/i
  }
};

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function detectStoreKey(inputUrl, explicitStore) {
  const key = String(explicitStore || '')
    .trim()
    .toLowerCase();
  if (STORE_META[key]) return key;
  try {
    const host = new URL(inputUrl).hostname.toLowerCase().replace(/^www\./, '');
    for (const [k, meta] of Object.entries(STORE_META)) {
      if (meta.hosts.some((h) => host === h || host.endsWith('.' + h))) return k;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function normalizeProductUrl(href, storeKey) {
  if (!href || typeof href !== 'string') return null;
  let url;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const meta = STORE_META[storeKey];
  if (!meta) return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  if (!meta.hosts.some((h) => host === h || host.endsWith('.' + h))) return null;
  if (!meta.productPathRe.test(url.pathname)) return null;
  url.hash = '';
  return url.href;
}

function skuFromUrl(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1] || '';
    if (last.length >= 4) return last.slice(0, 80);
  } catch {
    /* ignore */
  }
  return `EXT-${Date.now().toString(36)}`;
}

function buildLaunchOptions(proxy) {
  const args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--lang=ru-RU',
    '--disable-blink-features=AutomationControlled'
  ];
  if (proxy && String(proxy).trim()) {
    args.push(`--proxy-server=${String(proxy).trim()}`);
  }
  return { headless: true, args };
}

async function setupPage(page) {
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  );
  await page.setViewport({ width: 1366, height: 900 });
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
  });
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'languages', { get: () => ['ru-RU', 'ru', 'en-US', 'en'] });
  });
}

async function gotoSafe(page, url, timeout = 45000) {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
  const status = response?.status?.() ?? 0;
  if (status === 401 || status === 403 || status === 429) {
    throw new Error(`Сайт вернул ${status}. Попробуйте позже, уменьшите лимит или укажите прокси.`);
  }
  await page.waitForTimeout(800 + Math.floor(Math.random() * 600));
  await page.evaluate(() => window.scrollBy(0, Math.min(window.innerHeight, 500)));
  await page.waitForTimeout(500);
  return response;
}

async function discoverProductUrls(storeKey, listingUrl, limit, proxy) {
  const meta = STORE_META[storeKey];
  if (!meta) throw new Error('Неизвестный магазин.');
  const cap = Math.min(limit || BULK_PARSE_MAX_HARD, BULK_PARSE_MAX_HARD);

  let browser;
  try {
    browser = await puppeteer.launch(buildLaunchOptions(proxy));
    const page = await browser.newPage();
    await setupPage(page);
    await gotoSafe(page, listingUrl, 55000);
    await page.waitForTimeout(1200);
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(900);
    }

    const hrefs = await page.evaluate((pathReSource) => {
      const pathRe = new RegExp(pathReSource, 'i');
      const out = new Set();
      document.querySelectorAll('a[href]').forEach((a) => {
        try {
          const u = new URL(a.href, location.href);
          if (pathRe.test(u.pathname)) out.add(u.href.split('#')[0]);
        } catch {
          /* ignore */
        }
      });
      return Array.from(out);
    }, meta.productPathRe.source);

    const normalized = [];
    const seen = new Set();
    for (const h of hrefs) {
      const n = normalizeProductUrl(h, storeKey);
      if (n && !seen.has(n)) {
        seen.add(n);
        normalized.push(n);
      }
      if (normalized.length >= cap) break;
    }
    return normalized;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

const EXTRACT_PRODUCT_FN = (storeKey) => {
  const normPrice = (n) =>
    typeof n === 'number' && n > 0 && n < 1e9 && Number.isFinite(n) ? Math.round(n) : null;
  const digitsFromStr = (s) => {
    if (!s) return null;
    const digits = String(s).replace(/\s/g, '').replace(/[^\d]/g, '');
    if (!digits) return null;
    return normPrice(parseInt(digits, 10));
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
  let stock = null;
  const specs = {};

  document.querySelectorAll('script[type="application/ld+json"]').forEach((el) => {
    const jo = safeJsonParse(el.textContent.trim());
    if (!jo) return;
    const list = Array.isArray(jo) ? jo : [jo];
    for (const obj of list) {
      const t = obj['@type'];
      const isProduct =
        t === 'Product' || (Array.isArray(t) && t.includes('Product')) || t === undefined || t === null;
      if (obj.name && isProduct && !name) name = String(obj.name).trim();
      const offers = obj.offers || obj.Offers;
      if (offers && !price) {
        const o = Array.isArray(offers) ? offers[0] : offers;
        const pRaw = o?.price ?? o?.lowPrice ?? o?.highPrice;
        if (pRaw != null) price = digitsFromStr(String(pRaw));
        const avail = String(o?.availability || '').toLowerCase();
        if (avail.includes('instock')) stock = stock ?? 1;
        if (avail.includes('outofstock')) stock = 0;
      }
      if (!imageUrl && obj.image) {
        const img = obj.image;
        imageUrl =
          typeof img === 'string' ? img : Array.isArray(img) && img[0] ? img[0] : typeof img?.url === 'string' ? img.url : null;
      }
    }
  });

  const h1 = document.querySelector('h1');
  if (h1?.innerText && !name) name = h1.innerText.trim();

  if (!price) {
    price = digitsFromStr(document.querySelector('meta[itemprop="price"]')?.getAttribute('content'));
  }

  if (storeKey === 'dns') {
    const titleEl = document.querySelector('h1[data-state="product-title"]');
    if (titleEl?.innerText) name = titleEl.innerText.trim();
    for (const sel of ['[data-marker="price"] span', '.product-buy__price', '.product-buy-price__current']) {
      const el = document.querySelector(sel);
      if (el) {
        price = digitsFromStr(el.innerText);
        if (price) break;
      }
    }
    imageUrl =
      imageUrl ||
      document.querySelector('[data-marker="gallery"] img')?.src ||
      document.querySelector('[data-marker="slider"] img')?.src ||
      null;
    const chars = document.querySelector('[data-marker="chars"]');
    if (chars) {
      chars.querySelectorAll('tr').forEach((tr) => {
        const th = tr.querySelector('th');
        const td = tr.querySelector('td');
        if (th && td) {
          const k = th.innerText.trim();
          const v = td.innerText.trim();
          if (k && v) specs[k] = v;
        }
      });
    }
    const avail = document.querySelector('[data-marker="available"]')?.innerText || '';
    if (/нет в наличии|недоступен/i.test(avail)) stock = 0;
    else if (/в наличии/i.test(avail)) stock = stock ?? 5;
  }

  if (storeKey === 'ozon') {
    const t = document.querySelector('h1[data-widget="webTitle"]');
    if (t?.innerText) name = t.innerText.trim();
    for (const sel of ['[data-widget="webPrice"]', '[data-widget="price"] span', '[class*="price"] span']) {
      const el = document.querySelector(sel);
      if (el) {
        price = digitsFromStr(el.innerText);
        if (price) break;
      }
    }
    imageUrl =
      imageUrl ||
      document.querySelector('[data-widget="webGallery"] img')?.src ||
      document.querySelector('[data-widget="primaryImage"] img')?.src ||
      null;
    document.querySelectorAll('[data-widget="webCharacteristics"] tr, [data-widget="characteristics"] tr').forEach((tr) => {
      const cells = tr.querySelectorAll('td, th, span');
      if (cells.length >= 2) {
        const k = cells[0].innerText.trim();
        const v = cells[1].innerText.trim();
        if (k && v && k.length < 100) specs[k] = v;
      }
    });
  }

  if (storeKey === 'mvideo') {
    for (const sel of [
      '.price__main-value',
      '[class*="price__main"]',
      '[itemprop="price"]',
      '[data-test="price"]'
    ]) {
      const el = document.querySelector(sel);
      if (el) {
        price =
          digitsFromStr(el.getAttribute?.('content')) ||
          digitsFromStr(el.innerText || el.textContent);
        if (price) break;
      }
    }
    imageUrl =
      imageUrl ||
      document.querySelector('.product-picture__img img')?.src ||
      document.querySelector('[class*="gallery"] img')?.src ||
      null;
    document.querySelectorAll('.product-characteristics__spec, .characteristics__row').forEach((row) => {
      const title = row.querySelector('.product-characteristics__spec-title, .characteristics__title');
      const value = row.querySelector('.product-characteristics__spec-value, .characteristics__value');
      if (title && value) {
        const k = title.innerText.trim();
        const v = value.innerText.trim();
        if (k && v) specs[k] = v;
      }
    });
    document.querySelectorAll('table tr').forEach((tr) => {
      const cells = tr.querySelectorAll('th, td');
      if (cells.length >= 2) {
        const k = cells[0].innerText.trim();
        const v = cells[1].innerText.trim();
        if (k && v && k.length < 100 && !specs[k]) specs[k] = v;
      }
    });
    const stockEl = document.querySelector('[class*="availability"], [data-test="availability"]');
    if (stockEl) {
      const t = stockEl.innerText.toLowerCase();
      if (/нет в наличии|недоступен/i.test(t)) stock = 0;
      else if (/в наличии|доступен/i.test(t)) stock = stock ?? 3;
    }
  }

  if (!name) {
    const og = document.querySelector('meta[property="og:title"]')?.content;
    if (og) name = og.trim();
  }
  if (!imageUrl) {
    imageUrl =
      document.querySelector('meta[property="og:image"]')?.content ||
      document.querySelector('meta[property="og:image:url"]')?.content ||
      null;
  }
  if (imageUrl && !/^https?:/i.test(imageUrl)) {
    imageUrl = imageUrl.startsWith('//') ? `https:${imageUrl}` : new URL(imageUrl, location.href).href;
  }

  return {
    name: name || 'Без названия',
    price,
    imageUrl,
    specs,
    stock
  };
};

async function parseProductOnPage(page, storeKey, url) {
  await gotoSafe(page, url, 50000);

  if (storeKey === 'dns') {
    await page.waitForSelector('h1', { timeout: 12000 }).catch(() => {});
  }
  if (storeKey === 'ozon') {
    await page.waitForSelector('h1', { timeout: 12000 }).catch(() => {});
  }

  const data = await page.evaluate(EXTRACT_PRODUCT_FN, storeKey);
  if (!data.name || data.name === 'Без названия') {
    throw new Error('Не удалось прочитать название товара.');
  }
  if (data.price == null) {
    throw new Error('Цена на странице не найдена.');
  }

  const meta = STORE_META[storeKey];
  return {
    source: `${meta.storeName} (puppeteer bulk)`,
    name: data.name,
    price: data.price,
    imageUrl: data.imageUrl || null,
    sourceUrl: url,
    specs: data.specs || {},
    stock: data.stock,
    storeName: meta.storeName,
    sellerName: meta.sellerName
  };
}

function parsedToImportRow(parsed, category) {
  const cat = String(category || '').trim();
  const url = parsed.sourceUrl || '';
  return {
    sku: skuFromUrl(url),
    name: parsed.name,
    category: cat,
    price: parsed.price,
    url,
    image_url: parsed.imageUrl || '',
    description: `${parsed.name}. Категория: ${cat}. Импорт массового парсинга.`,
    stock: parsed.stock != null ? parsed.stock : '',
    rating: '',
    reviews: '',
    store_name: parsed.storeName,
    seller_name: parsed.sellerName,
    specs: parsed.specs && typeof parsed.specs === 'object' ? parsed.specs : {}
  };
}

/**
 * @param {object} opts
 * @param {string} opts.store - dns | ozon | mvideo
 * @param {string} opts.category - slug каталога
 * @param {string} [opts.listingUrl]
 * @param {string[]} [opts.urls]
 * @param {string} [opts.proxy]
 * @param {number} [opts.limit]
 */
async function runBulkStoreParse(opts) {
  const category = String(opts.category || '').trim();
  if (!category) throw new Error('Укажите категорию каталога (slug).');

  const listingUrl = opts.listingUrl ? String(opts.listingUrl).trim() : '';
  let explicitUrls = Array.isArray(opts.urls) ? opts.urls.map((u) => String(u).trim()).filter(Boolean) : [];
  const proxy = opts.proxy ? String(opts.proxy).trim() : null;
  const limit = Math.min(
    BULK_PARSE_MAX_HARD,
    Math.max(1, parseInt(opts.limit, 10) || Math.min(15, BULK_PARSE_MAX_HARD))
  );

  const storeKey =
    detectStoreKey(listingUrl || explicitUrls[0] || '', opts.store) ||
    (opts.store && STORE_META[String(opts.store).toLowerCase()] ? String(opts.store).toLowerCase() : null);
  if (!storeKey) {
    throw new Error('Укажите магазин (dns, ozon, mvideo) или ссылку на поддерживаемый домен.');
  }

  let productUrls = explicitUrls.map((u) => normalizeProductUrl(u, storeKey)).filter(Boolean);
  const log = [];

  if (listingUrl && productUrls.length < limit) {
    try {
      const discovered = await discoverProductUrls(storeKey, listingUrl, limit, proxy);
      log.push({ step: 'discover', status: 'ok', message: `Найдено ссылок: ${discovered.length}` });
      const merged = new Set([...productUrls, ...discovered]);
      productUrls = Array.from(merged).slice(0, limit);
    } catch (e) {
      log.push({ step: 'discover', status: 'error', message: e.message || String(e) });
      if (!productUrls.length) throw e;
    }
  }

  productUrls = productUrls.slice(0, limit);
  if (!productUrls.length) {
    throw new Error('Нет ссылок на товары. Укажите URL категории или список карточек.');
  }

  const importRows = [];
  const parseLog = [];
  let browser;

  try {
    browser = await puppeteer.launch(buildLaunchOptions(proxy));
    for (let i = 0; i < productUrls.length; i++) {
      const url = productUrls[i];
      const page = await browser.newPage();
      try {
        await setupPage(page);
        const parsed = await parseProductOnPage(page, storeKey, url);
        importRows.push(parsedToImportRow(parsed, category));
        parseLog.push({ url, status: 'ok', message: parsed.name });
      } catch (e) {
        parseLog.push({ url, status: 'error', message: e.message || String(e) });
      } finally {
        await page.close().catch(() => {});
      }
      if (i < productUrls.length - 1 && BULK_PARSE_DELAY_MS > 0) {
        await delay(BULK_PARSE_DELAY_MS);
      }
    }
  } finally {
    if (browser) await browser.close().catch(() => {});
  }

  const ok = parseLog.filter((x) => x.status === 'ok').length;
  return {
    storeKey,
    storeName: STORE_META[storeKey].storeName,
    sellerName: STORE_META[storeKey].sellerName,
    category,
    productUrls,
    importRows,
    log,
    parseLog,
    summary: {
      requested: productUrls.length,
      parsed: ok,
      failed: parseLog.length - ok
    }
  };
}

module.exports = {
  STORE_META,
  BULK_PARSE_MAX_HARD,
  BULK_PARSE_DELAY_MS,
  detectStoreKey,
  discoverProductUrls,
  runBulkStoreParse,
  normalizeProductUrl,
  parsedToImportRow
};
