/**
 * Обучающий режим на карточке товара (этап 2).
 * Контент: learn/product-lessons/{category}.json
 */
(function (global) {
  /** Раньше хранился в localStorage — очищаем при загрузке, режим только на текущей карточке. */
  const LEGACY_STORAGE_KEY = 'techNozoneLearnMode';
  const lessonsCache = new Map();

  let state = {
    enabled: false,
    product: null,
    lessons: null,
    slideIndex: 0,
    labelMap: {},
    panelMinimized: false
  };

  let panelEl = null;
  let toggleInput = null;

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

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function normalizeCategory(category) {
    const raw = String(category || '').trim();
    if (/^[a-z0-9_]+$/i.test(raw)) return raw.toLowerCase();
    const aliases = {
      smartphones: 'smartphones',
      смартфоны: 'smartphones',
      laptops: 'laptops',
      ноутбуки: 'laptops'
    };
    const slug = aliases[raw.toLowerCase()];
    return slug || raw.replace(/[^a-z0-9_-]/gi, '').toLowerCase();
  }

  function clearLegacyStoredEnabled() {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (_) {}
  }

  function isProductPage() {
    return /product\.html/i.test(global.location?.pathname || '');
  }

  async function fetchProductLessons(category) {
    const key = normalizeCategory(category) || 'other';
    if (lessonsCache.has(key)) return lessonsCache.get(key);

    const promise = (async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/learn/product-lessons/${encodeURIComponent(key)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.slides) && data.slides.length) return data;
        }
      } catch (e) {}
      try {
        const res = await fetch(`${getStaticLearnBase()}/product-lessons/_default.json`);
        if (res.ok) return res.json();
      } catch (_) {}
      return { title: 'Обучающий режим', slides: [] };
    })();

    lessonsCache.set(key, promise);
    return promise;
  }

  function buildImportanceChart(items) {
    if (!Array.isArray(items) || !items.length) return '';
    const rows = items
      .map((item) => {
        const w = Math.min(100, Math.max(8, Number(item.weight) || 50));
        const level = item.level || 'medium';
        return `
          <div class="learn-importance-row">
            <div class="learn-importance-row__head">
              <span class="learn-importance-row__label">${escapeHtml(item.label || '')}</span>
              <span class="learn-importance-row__badge learn-importance-row__badge--${level}">${escapeHtml(
                level === 'high' ? 'важно' : level === 'low' ? 'доп.' : 'полезно'
              )}</span>
            </div>
            <div class="learn-importance-row__track">
              <div class="learn-importance-row__fill learn-importance-row__fill--${level}" style="width:${w}%"></div>
            </div>
          </div>`;
      })
      .join('');
    return `<div class="learn-importance-chart" aria-label="Приоритет характеристик">${rows}</div>`;
  }

  function buildSlideHtml(slide, index, total) {
    const paras = (slide.paragraphs || []).map((p) => `<p class="learn-slide__p">${escapeHtml(p)}</p>`).join('');
    const tips = (slide.tips || []).length
      ? `<ul class="learn-slide__tips">${slide.tips.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`
      : '';

    let imageBlock = '';
    if (slide.image) {
      const src = slide.image.startsWith('http')
        ? slide.image
        : `${getLearnAssetBase()}/${String(slide.image).replace(/^\/+/, '')}`;
      imageBlock = `<div class="learn-slide__media"><img src="${escapeHtml(src)}" alt="" loading="lazy"></div>`;
    }

    return `
      <article class="learn-slide" data-slide-index="${index}" aria-hidden="${index !== state.slideIndex}">
        <div class="learn-slide__counter">Слайд ${index + 1} из ${total}</div>
        <h4 class="learn-slide__title">${escapeHtml(slide.title || '')}</h4>
        ${slide.lead ? `<p class="learn-slide__lead">${escapeHtml(slide.lead)}</p>` : ''}
        ${imageBlock}
        ${buildImportanceChart(slide.importance)}
        <div class="learn-slide__body">${paras}</div>
        ${tips}
      </article>
    `;
  }

  function specKeyMatchesRow(rowKey, targetKey, labelMap) {
    const rk = String(rowKey || '')
      .toLowerCase()
      .trim();
    const tk = String(targetKey || '')
      .toLowerCase()
      .trim();
    if (!tk) return false;
    if (rk === tk) return true;
    if (labelMap && labelMap[rk] === tk) return true;
    return false;
  }

  function collectHighlightKeys(slide) {
    const keys = new Set();
    (slide.highlightSpecs || []).forEach((k) => keys.add(k));
    (slide.importance || []).forEach((item) => {
      (item.specKeys || []).forEach((k) => keys.add(k));
    });
    return keys;
  }

  function applySpecHighlights(slide) {
    const container = document.getElementById('productSpecs');
    if (!container) return;
    const keys = slide ? collectHighlightKeys(slide) : new Set();
    container.querySelectorAll('.spec-item').forEach((row) => {
      const rowKey = row.dataset.specKey || '';
      let match = false;
      if (keys.size) {
        for (const tk of keys) {
          if (specKeyMatchesRow(rowKey, tk, state.labelMap)) {
            match = true;
            break;
          }
        }
      }
      row.classList.toggle('spec-item--learn-highlight', match);
    });
  }

  function clearSpecHighlights() {
    document.querySelectorAll('.spec-item--learn-highlight').forEach((el) => {
      el.classList.remove('spec-item--learn-highlight');
    });
  }

  function renderPanelContent() {
    if (!panelEl || !state.lessons) return;
    const slides = state.lessons.slides || [];
    const total = slides.length;
    const idx = Math.min(Math.max(0, state.slideIndex), Math.max(0, total - 1));
    state.slideIndex = idx;

    const body = panelEl.querySelector('.learn-panel__body');
    const titleEl = panelEl.querySelector('.learn-panel__title');
    const subtitleEl = panelEl.querySelector('.learn-panel__subtitle');
    const dotsEl = panelEl.querySelector('.learn-panel__dots');
    const prevBtn = panelEl.querySelector('.learn-panel__nav--prev');
    const nextBtn = panelEl.querySelector('.learn-panel__nav--next');

    if (titleEl) titleEl.textContent = state.lessons.title || 'Обучение';
    if (subtitleEl) {
      subtitleEl.textContent = state.lessons.subtitle || '';
      subtitleEl.style.display = state.lessons.subtitle ? '' : 'none';
    }

    if (body) {
      if (!total) {
        body.innerHTML =
          '<p class="learn-panel__empty">Для этой категории урок пока готовится. Используйте подсказки «?» у характеристик.</p>';
      } else {
        body.innerHTML = slides.map((s, i) => buildSlideHtml(s, i, total)).join('');
        const active = body.querySelector(`[data-slide-index="${idx}"]`);
        if (active) {
          active.classList.add('learn-slide--active');
          active.setAttribute('aria-hidden', 'false');
        }
      }
    }

    if (dotsEl) {
      dotsEl.innerHTML = slides
        .map(
          (_, i) =>
            `<button type="button" class="learn-panel__dot${i === idx ? ' learn-panel__dot--active' : ''}" data-dot="${i}" aria-label="Слайд ${i + 1}"></button>`
        )
        .join('');
    }

    if (prevBtn) prevBtn.disabled = idx <= 0;
    if (nextBtn) nextBtn.disabled = idx >= total - 1;

    applySpecHighlights(slides[idx] || null);
  }

  function ensurePanel() {
    if (panelEl) return panelEl;
    panelEl = document.createElement('aside');
    panelEl.id = 'learnModePanel';
    panelEl.className = 'learn-panel';
    panelEl.setAttribute('aria-label', 'Обучающая лекция');
    panelEl.hidden = true;
    panelEl.innerHTML = `
      <header class="learn-panel__header">
        <div class="learn-panel__header-text">
          <h3 class="learn-panel__title">Обучение</h3>
          <p class="learn-panel__subtitle"></p>
        </div>
        <div class="learn-panel__header-actions">
          <button type="button" class="learn-panel__icon-btn learn-panel__minimize" aria-label="Свернуть">−</button>
        </div>
      </header>
      <div class="learn-panel__body"></div>
      <footer class="learn-panel__footer">
        <button type="button" class="learn-panel__nav learn-panel__nav--prev" aria-label="Предыдущий слайд">‹</button>
        <div class="learn-panel__dots"></div>
        <button type="button" class="learn-panel__nav learn-panel__nav--next" aria-label="Следующий слайд">›</button>
      </footer>
    `;
    document.body.appendChild(panelEl);

    panelEl.querySelector('.learn-panel__minimize')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!state.enabled) return;
      state.panelMinimized = true;
      panelEl.classList.add('learn-panel--minimized');
      syncPanelBehindModal();
    });

    panelEl.querySelector('.learn-panel__header')?.addEventListener('click', (e) => {
      if (!state.enabled || panelEl.hidden) return;
      if (state.panelMinimized && !e.target.closest('button')) {
        state.panelMinimized = false;
        panelEl.classList.remove('learn-panel--minimized');
        syncPanelBehindModal();
      }
    });

    panelEl.querySelector('.learn-panel__nav--prev')?.addEventListener('click', () => goSlide(-1));
    panelEl.querySelector('.learn-panel__nav--next')?.addEventListener('click', () => goSlide(1));

    panelEl.querySelector('.learn-panel__dots')?.addEventListener('click', (e) => {
      const dot = e.target.closest('[data-dot]');
      if (!dot) return;
      state.slideIndex = parseInt(dot.dataset.dot, 10) || 0;
      renderPanelContent();
    });

    if (!global.__learnModeKeydownBound) {
      global.__learnModeKeydownBound = true;
      document.addEventListener('keydown', (e) => {
        if (!state.enabled || !panelEl || panelEl.hidden || state.panelMinimized) return;
        if (e.key === 'ArrowRight') goSlide(1);
        if (e.key === 'ArrowLeft') goSlide(-1);
      });
    }

    return panelEl;
  }

  function goSlide(delta) {
    const total = (state.lessons?.slides || []).length;
    if (!total) return;
    state.slideIndex = Math.min(total - 1, Math.max(0, state.slideIndex + delta));
    renderPanelContent();
  }

  function hideLearnPanel() {
    if (!panelEl) return;
    state.panelMinimized = false;
    panelEl.hidden = true;
    panelEl.setAttribute('hidden', '');
    panelEl.setAttribute('aria-hidden', 'true');
    panelEl.classList.remove('learn-panel--minimized');
    clearSpecHighlights();
    document.body.classList.remove('learn-mode-on');
    panelEl.classList.remove('learn-panel--behind-modal');
  }

  function updatePanelVisibility() {
    if (!state.enabled) {
      hideLearnPanel();
      return;
    }
    ensurePanel();
    document.body.classList.add('learn-mode-on');
    panelEl.removeAttribute('hidden');
    panelEl.hidden = false;
    panelEl.setAttribute('aria-hidden', 'false');
    if (state.panelMinimized) panelEl.classList.add('learn-panel--minimized');
    else panelEl.classList.remove('learn-panel--minimized');
    renderPanelContent();
    syncPanelBehindModal();
  }

  async function loadLessonsForProduct(product) {
    const [lessons, hintsPack] = await Promise.all([
      fetchProductLessons(product.category),
      global.LearnHints?.fetchSpecHints
        ? global.LearnHints.fetchSpecHints(product.category)
        : Promise.resolve({ labelMap: {} })
    ]);
    state.lessons = lessons;
    state.labelMap = hintsPack?.labelMap || {};
    state.slideIndex = 0;
  }

  async function setEnabled(on) {
    state.enabled = Boolean(on);
    if (toggleInput) toggleInput.checked = state.enabled;

    if (!state.enabled) {
      hideLearnPanel();
      return;
    }
    if (state.product) {
      await loadLessonsForProduct(state.product);
    }
    if (!state.enabled) {
      hideLearnPanel();
      return;
    }
    updatePanelVisibility();
  }

  function mountToggle(host) {
    if (!host || host.dataset.learnToggleMounted) return;
    host.dataset.learnToggleMounted = '1';
    host.innerHTML = `
      <label class="learn-mode-toggle" title="Показать мини-лекции по выбору в этой категории">
        <input type="checkbox" class="learn-mode-toggle__input" id="learnModeToggle" aria-describedby="learnModeToggleHint">
        <span class="learn-mode-toggle__track"><span class="learn-mode-toggle__thumb"></span></span>
        <span class="learn-mode-toggle__label">Режим обучения</span>
      </label>
      <span id="learnModeToggleHint" class="learn-mode-toggle__hint"></span>
    `;
    toggleInput = host.querySelector('#learnModeToggle');
    toggleInput.checked = false;
    state.enabled = false;

    toggleInput.addEventListener('change', () => {
      setEnabled(toggleInput.checked);
    });
  }

  function syncPanelBehindModal() {
    if (!panelEl) return;
    const modalOpen = Boolean(document.querySelector('.app-modal-overlay'));
    panelEl.classList.toggle('learn-panel--behind-modal', modalOpen && state.panelMinimized);
  }

  function bindModalAwareness() {
    if (global.__learnModeModalObserver) return;
    global.__learnModeModalObserver = new MutationObserver(syncPanelBehindModal);
    global.__learnModeModalObserver.observe(document.body, { childList: true });
    syncPanelBehindModal();
  }

  function teardownOnPageLeave() {
    state.enabled = false;
    state.product = null;
    state.panelMinimized = false;
    if (toggleInput) toggleInput.checked = false;
    hideLearnPanel();
    clearLegacyStoredEnabled();
  }

  function bindPageLifecycle() {
    if (global.__learnModeLifecycleBound) return;
    global.__learnModeLifecycleBound = true;
    clearLegacyStoredEnabled();
    global.addEventListener('pagehide', () => {
      if (isProductPage()) teardownOnPageLeave();
    });
  }

  async function onProductDisplayed(product) {
    if (!product) return;
    state.product = product;
    state.slideIndex = 0;

    const host = document.getElementById('learnModeToggleHost');
    if (host) mountToggle(host);

    if (state.enabled) {
      await loadLessonsForProduct(product);
      updatePanelVisibility();
    }
  }

  bindPageLifecycle();
  bindModalAwareness();

  global.LearnMode = {
    onProductDisplayed,
    setEnabled,
    isEnabled: () => state.enabled,
    goSlide,
    teardownOnPageLeave
  };
})(typeof window !== 'undefined' ? window : global);
