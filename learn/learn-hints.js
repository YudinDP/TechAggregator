/**
 * Подсказки к характеристикам (этап 1).
 * Контент: learn/spec-hints/*.json (API или статика с того же хоста, что и страница).
 */
(function (global) {
  const hintsCache = new Map();
  let popoverEl = null;
  let activeTrigger = null;

  const CATEGORY_ALIASES = {
    smartphones: 'smartphones',
    смартфоны: 'smartphones',
    смартфон: 'smartphones',
    laptops: 'laptops',
    ноутбуки: 'laptops',
    ноутбук: 'laptops',
    headphones: 'headphones',
    наушники: 'headphones',
    tv: 'tv',
    телевизоры: 'tv',
    tablets: 'tablets',
    планшеты: 'tablets',
    monitors: 'monitors',
    мониторы: 'monitors'
  };

  /** Прямые синонимы ключей в каталоге (если не стандартный specKey) */
  const SPEC_KEY_ALIASES = {
    ram: 'ram_size',
    memory: 'ram_size',
    storage: 'storage_capacity',
    internal_storage: 'storage_capacity',
    display: 'screen_size',
    display_size: 'screen_size',
    battery: 'battery_capacity_mah',
    battery_capacity: 'battery_capacity_mah',
    camera: 'rear_camera_primary_mp',
    processor: 'cpu_model',
    cpu: 'cpu_model',
    gpu: 'gpu_model',
    os_name: 'os',
    refresh_rate: 'screen_refresh_rate',
    screen_type: 'screen_technology',
    noise_cancellation: 'anc_type',
    anc: 'anc_type'
  };

  function getApiBase() {
    if (global.API_BASE) return String(global.API_BASE).replace(/\/$/, '');
    const { protocol, hostname } = global.location || {};
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:3000`;
    }
    if (hostname && hostname.endsWith('tech-nozone.ru')) {
      return `${protocol}//${hostname}`;
    }
    return 'http://localhost:3000';
  }

  function getStaticLearnBase() {
    if (global.LEARN_STATIC_BASE) return String(global.LEARN_STATIC_BASE).replace(/\/$/, '');
    return 'learn';
  }

  function getLearnAssetBase() {
    if (global.LEARN_ASSET_BASE) return String(global.LEARN_ASSET_BASE).replace(/\/$/, '');
    return `${getApiBase()}/learn`;
  }

  function normalizeCategory(category) {
    const raw = String(category || '').trim();
    if (!raw) return '';
    if (/^[a-z0-9_]+$/i.test(raw)) return raw.toLowerCase();
    const slug = CATEGORY_ALIASES[raw.toLowerCase()];
    if (slug) return slug;
    return raw.replace(/[^a-z0-9_-]/gi, '').toLowerCase();
  }

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const IMPORTANCE_LABELS = {
    high: 'Важно при выборе',
    medium: 'Полезно знать',
    low: 'Дополнительно'
  };

  async function loadJsonUrl(url) {
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
  }

  async function fetchSpecHintsFromStatic(category) {
    const base = getStaticLearnBase();
    const safe = normalizeCategory(category);
    const common = (await loadJsonUrl(`${base}/spec-hints/common.json`)) || {};
    const specific = safe ? (await loadJsonUrl(`${base}/spec-hints/${safe}.json`)) || {} : {};
    const labelMapRaw = (await loadJsonUrl(`${base}/spec-hints/label-map.json`)) || {};
    const globalMap = labelMapRaw.global && typeof labelMapRaw.global === 'object' ? labelMapRaw.global : {};
    const catMap = safe && labelMapRaw[safe] ? labelMapRaw[safe] : {};
    const labelMap = {};
    for (const [k, v] of Object.entries({ ...globalMap, ...catMap })) {
      labelMap[String(k).toLowerCase().trim()] = v;
    }
    return {
      hints: { ...common, ...specific },
      labelMap
    };
  }

  async function fetchSpecHints(category) {
    const key = normalizeCategory(category) || 'common';
    if (hintsCache.has(key)) return hintsCache.get(key);

    const promise = (async () => {
      try {
        const res = await fetch(
          `${getApiBase()}/api/learn/spec-hints/${encodeURIComponent(key)}`
        );
        if (res.ok) {
          const data = await res.json();
          const hints = data.hints && typeof data.hints === 'object' ? data.hints : {};
          const labelMap =
            data.labelMap && typeof data.labelMap === 'object' ? data.labelMap : {};
          if (Object.keys(hints).length > 0) {
            return { hints, labelMap };
          }
        }
      } catch (e) {
        console.warn('[LearnHints] API недоступен:', e.message || e);
      }

      try {
        const pack = await fetchSpecHintsFromStatic(key);
        console.info(
          '[LearnHints] Загружено из статики:',
          key,
          Object.keys(pack.hints).length,
          'подсказок'
        );
        return pack;
      } catch (e2) {
        console.warn('[LearnHints] Статика недоступна:', e2.message || e2);
        return { hints: {}, labelMap: {} };
      }
    })();

    hintsCache.set(key, promise);
    return promise;
  }

  function normalizeLabelKey(specKey) {
    return String(specKey || '').toLowerCase().trim();
  }

  function resolveHintForSpecKey(specKey, hints, labelMap) {
    if (!hints || typeof hints !== 'object') return null;

    if (hints[specKey]) return hints[specKey];

    const lower = normalizeLabelKey(specKey);
    if (hints[lower]) return hints[lower];

    const alias = SPEC_KEY_ALIASES[lower] || SPEC_KEY_ALIASES[specKey];
    if (alias && hints[alias]) return hints[alias];

    const mapped = labelMap && labelMap[lower];
    if (mapped && hints[mapped]) return hints[mapped];

    return null;
  }

  function prefetchSpecHints(category) {
    fetchSpecHints(category);
  }

  function importanceBadge(importance) {
    const level = IMPORTANCE_LABELS[importance] ? importance : 'medium';
    return `<span class="spec-hint-popover__badge spec-hint-popover__badge--${level}">${escapeHtml(
      IMPORTANCE_LABELS[level]
    )}</span>`;
  }

  function buildPopoverHtml(hint, specValue) {
    const title = hint.title || 'Характеристика';
    const sections = [];

    if (hint.what) {
      sections.push(
        `<section class="spec-hint-popover__section"><h4>Что это</h4><p>${escapeHtml(hint.what)}</p></section>`
      );
    }
    if (hint.why) {
      sections.push(
        `<section class="spec-hint-popover__section"><h4>Зачем смотреть</h4><p>${escapeHtml(hint.why)}</p></section>`
      );
    }
    if (hint.howToRead) {
      sections.push(
        `<section class="spec-hint-popover__section"><h4>Как читать значение</h4><p>${escapeHtml(hint.howToRead)}</p></section>`
      );
    }
    if (Array.isArray(hint.ranges) && hint.ranges.length > 0) {
      const items = hint.ranges
        .map(
          (r) =>
            `<li><strong>${escapeHtml(r.label || '')}:</strong> ${escapeHtml(r.text || '')}</li>`
        )
        .join('');
      sections.push(
        `<section class="spec-hint-popover__section"><h4>Ориентиры</h4><ul class="spec-hint-popover__list">${items}</ul></section>`
      );
    }
    if (Array.isArray(hint.tips) && hint.tips.length > 0) {
      const items = hint.tips.map((t) => `<li>${escapeHtml(t)}</li>`).join('');
      sections.push(
        `<section class="spec-hint-popover__section"><h4>Совет</h4><ul class="spec-hint-popover__list">${items}</ul></section>`
      );
    }

    let imageBlock = '';
    if (hint.image) {
      const src = hint.image.startsWith('http')
        ? hint.image
        : `${getLearnAssetBase()}/${String(hint.image).replace(/^\/+/, '')}`;
      imageBlock = `<div class="spec-hint-popover__media"><img src="${escapeHtml(src)}" alt="" loading="lazy"></div>`;
    }

    const valueBlock =
      specValue != null && String(specValue).trim() !== ''
        ? `<div class="spec-hint-popover__current"><span class="spec-hint-popover__current-label">У этого товара:</span> <strong>${escapeHtml(
            specValue
          )}</strong></div>`
        : '';

    return `
      <div class="spec-hint-popover__inner">
        <header class="spec-hint-popover__header">
          <div class="spec-hint-popover__header-main">
            <h3 class="spec-hint-popover__title">${escapeHtml(title)}</h3>
            ${importanceBadge(hint.importance)}
          </div>
          <button type="button" class="spec-hint-popover__close" aria-label="Закрыть подсказку">×</button>
        </header>
        <div class="spec-hint-popover__scroll">
          ${imageBlock}
          ${valueBlock}
          <div class="spec-hint-popover__body">${sections.join('')}</div>
        </div>
      </div>
    `;
  }

  function ensurePopover() {
    if (popoverEl) return popoverEl;
    popoverEl = document.createElement('div');
    popoverEl.id = 'specHintPopover';
    popoverEl.className = 'spec-hint-popover';
    popoverEl.setAttribute('role', 'dialog');
    popoverEl.setAttribute('aria-modal', 'true');
    popoverEl.setAttribute('aria-hidden', 'true');
    popoverEl.hidden = true;
    document.body.appendChild(popoverEl);

    popoverEl.addEventListener('click', (e) => {
      if (e.target.closest('.spec-hint-popover__close')) {
        e.preventDefault();
        e.stopPropagation();
        closePopover();
      }
    });

    document.addEventListener('click', (e) => {
      if (!popoverEl || popoverEl.hidden) return;
      const t = e.target;
      if (popoverEl.contains(t) || (activeTrigger && activeTrigger.contains(t))) return;
      closePopover();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePopover();
    });

    window.addEventListener(
      'scroll',
      () => {
        if (!popoverEl.hidden && activeTrigger) positionPopover(activeTrigger);
      },
      true
    );
    window.addEventListener('resize', () => {
      if (!popoverEl.hidden && activeTrigger) positionPopover(activeTrigger);
    });

    return popoverEl;
  }

  function positionPopover(trigger) {
    const pop = ensurePopover();
    const rect = trigger.getBoundingClientRect();
    const margin = 8;
    const maxW = Math.min(360, window.innerWidth - margin * 2);

    pop.style.width = `${maxW}px`;
    pop.style.visibility = 'hidden';
    pop.hidden = false;
    pop.style.left = '0px';
    pop.style.top = '0px';

    const popRect = pop.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - popRect.width / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - popRect.width - margin));

    let top = rect.bottom + margin;
    if (top + popRect.height > window.innerHeight - margin) {
      top = rect.top - popRect.height - margin;
    }
    if (top < margin) top = margin;

    pop.style.left = `${Math.round(left)}px`;
    pop.style.top = `${Math.round(top)}px`;
    pop.style.visibility = 'visible';
  }

  function openPopover(trigger, hint, specValue) {
    const pop = ensurePopover();
    activeTrigger = trigger;
    pop.innerHTML = buildPopoverHtml(hint, specValue);
    pop.hidden = false;
    pop.setAttribute('aria-hidden', 'false');
    positionPopover(trigger);
    trigger.setAttribute('aria-expanded', 'true');
  }

  function closePopover() {
    if (!popoverEl) return;
    popoverEl.hidden = true;
    popoverEl.setAttribute('aria-hidden', 'true');
    popoverEl.innerHTML = '';
    if (activeTrigger) {
      activeTrigger.setAttribute('aria-expanded', 'false');
      activeTrigger = null;
    }
  }

  function bindHintButton(btn, hint, specValue) {
    if (btn.dataset.hintBound) return;
    btn.dataset.hintBound = '1';

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (activeTrigger === btn && popoverEl && !popoverEl.hidden) {
        return;
      }
      openPopover(btn, hint, specValue);
    });
  }

  function renderSpecRow(key, value, label, hint) {
    const labelHtml = hint
      ? `<div class="spec-item-label">
          <span class="spec-item-name">${escapeHtml(label)}:</span>
          <button type="button" class="spec-hint-btn" aria-label="Подсказка: ${escapeHtml(
            hint.title || label
          )}" data-spec-key="${escapeHtml(key)}">?</button>
        </div>`
      : `<span class="spec-item-name">${escapeHtml(label)}:</span>`;

    const row = document.createElement('div');
    row.className = 'spec-item';
    row.innerHTML = `${labelHtml}<span class="spec-item-value">${escapeHtml(value)}</span>`;

    if (hint) {
      const btn = row.querySelector('.spec-hint-btn');
      if (btn) bindHintButton(btn, hint, value);
    }
    return row;
  }

  function renderProductSpecsFallback(container, product, translations) {
    if (!container || !product) return;
    container.innerHTML = Object.entries(product.specs || {})
      .filter(([key]) => {
        if (typeof global.isUserVisibleSpecKey === 'function') {
          return global.isUserVisibleSpecKey(key);
        }
        return normalizeLabelKey(key) !== 'import_sku';
      })
      .map(([key, value]) => {
        const label = (translations && translations[key]) || key;
        return `
        <div class="spec-item">
          <span class="spec-item-name">${escapeHtml(label)}:</span>
          <span class="spec-item-value">${escapeHtml(value)}</span>
        </div>
      `;
      })
      .join('');
  }

  async function renderProductSpecs(container, product, translations) {
    if (!container || !product) return;

    const entries = Object.entries(product.specs || {}).filter(([key]) => {
      if (typeof global.isUserVisibleSpecKey === 'function') {
        return global.isUserVisibleSpecKey(key);
      }
      return normalizeLabelKey(key) !== 'import_sku';
    });

    const { hints, labelMap } = await fetchSpecHints(product.category);
    container.innerHTML = '';

    if (entries.length === 0) {
      container.innerHTML = '<p class="spec-hint-empty">Характеристики не указаны.</p>';
      return;
    }

    let withHints = 0;
    const frag = document.createDocumentFragment();
    for (const [key, value] of entries) {
      const label = (translations && translations[key]) || key;
      const hint = resolveHintForSpecKey(key, hints, labelMap);
      if (hint) withHints += 1;
      frag.appendChild(renderSpecRow(key, value, label, hint));
    }
    container.appendChild(frag);

    if (withHints === 0 && Object.keys(hints).length > 0) {
      console.warn(
        '[LearnHints] Подсказки загружены, но не совпали ключи характеристик товара.',
        'Категория:',
        product.category,
        'Ключи:',
        entries.map(([k]) => k)
      );
    }
  }

  global.LearnHints = {
    fetchSpecHints,
    prefetchSpecHints,
    renderProductSpecs,
    renderProductSpecsFallback,
    resolveHintForSpecKey,
    closePopover
  };
})(typeof window !== 'undefined' ? window : global);
