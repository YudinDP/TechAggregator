
(function () {
  const NAV_ITEMS = [
    { id: 'home', href: 'index.html', label: 'Главная' },
    { id: 'catalog', href: 'catalog.html', label: 'Каталог' },
    { id: 'comparison', href: 'comparison.html', label: 'Сравнение', counter: true },
    { id: 'recommendations', href: 'recommendations.html', label: 'Рекомендации' },
    { id: 'learn', href: 'learn.html', label: 'Обучение' }
  ];

  const PAGE_ACTIVE_MAP = {
    'index.html': 'home',
    '': 'home',
    'catalog.html': 'catalog',
    'comparison.html': 'comparison',
    'recommendations.html': 'recommendations',
    'learn.html': 'learn'
  };

  const PAGE_AUTH_MAP = {
    'auth.html': 'home',
    'admin.html': 'admin'
  };

  const PAGE_NO_SEARCH = { 'favorites.html': true };

  const PAGE_NO_COMPARISON_COUNTER = { 'auth.html': true };

  function currentPageFile() {
    const path = window.location.pathname || '';
    const parts = path.split('/').filter(Boolean);
    return parts.length ? parts[parts.length - 1] : 'index.html';
  }

  function getHeader() {
    return document.querySelector('header.header');
  }

  function resolveActiveId(header) {
    if (header && header.dataset.navActive) {
      return header.dataset.navActive;
    }
    return PAGE_ACTIVE_MAP[currentPageFile()] || null;
  }

  function resolveAuthPreset(header) {
    if (header && header.dataset.navAuth) {
      return header.dataset.navAuth;
    }
    return PAGE_AUTH_MAP[currentPageFile()] || 'default';
  }

  function resolveShowSearch(header) {
    if (header && header.dataset.navSearch === 'false') return false;
    if (header && header.dataset.navSearch === 'true') return true;
    return !PAGE_NO_SEARCH[currentPageFile()];
  }

  function resolveComparisonCounter(header) {
    if (header && header.dataset.navComparisonCounter === 'false') return false;
    if (header && header.dataset.navComparisonCounter === 'true') return true;
    return !PAGE_NO_COMPARISON_COUNTER[currentPageFile()];
  }

  function buildNavHtml(activeId, showComparisonCounter) {
    const links = NAV_ITEMS.map(function (item) {
      const active = item.id === activeId ? ' active' : '';
      const counter = item.counter && showComparisonCounter ? '<span class="comparison-counter">0</span>' : '';
      return '<a href="' + item.href + '" class="nav-link' + active + '">' + item.label + counter + '</a>';
    }).join('');
    return '<nav class="nav">' + links + '</nav>';
  }

  function buildSearchHtml() {
    return (
      '<div class="nav-search-container">' +
      '<input type="text" class="nav-search" id="navSearch" placeholder="Поиск товаров..." ' +
      'oninput="showNavSearchSuggestions()" onkeypress="handleNavSearchEnter(event)">' +
      '<button type="button" class="nav-search-btn" onclick="navSearchProducts()">🔍</button>' +
      '<div id="navSearchSuggestions" class="nav-search-suggestions"></div>' +
      '</div>'
    );
  }

  function buildAuthHtml(preset) {
    if (preset === 'home') {
      return '<a href="index.html" class="btn btn-primary">На главную</a>';
    }
    if (preset === 'admin') {
      return (
        '<span class="admin-welcome">👑 <strong>Администратор</strong></span>' +
        '<button type="button" class="btn btn-outline" onclick="logout()">Выйти</button>'
      );
    }
    return (
      '<a class="btn btn-outline" href="auth.html">Войти</a>' +
      '<a class="btn btn-primary" href="auth.html?tab=register">Регистрация</a>'
    );
  }

  function buildHeaderInner(activeId, options) {
    return (
      '<div class="logo">' +
      '<h1><a href="index.html" style="color: inherit; text-decoration: none;">tech-nozone</a></h1>' +
      '</div>' +
      buildNavHtml(activeId, options.comparisonCounter) +
      (options.search ? buildSearchHtml() : '') +
      '<div class="auth-buttons">' +
      buildAuthHtml(options.authPreset) +
      '</div>'
    );
  }

  function initSiteNav() {
    const header = getHeader();
    if (!header) return;

    let mount = header.querySelector('.container');
    if (!mount) {
      mount = document.createElement('div');
      mount.className = 'container';
      header.appendChild(mount);
    }

    const activeId = resolveActiveId(header);
    const options = {
      search: resolveShowSearch(header),
      authPreset: resolveAuthPreset(header),
      comparisonCounter: resolveComparisonCounter(header)
    };

    mount.innerHTML = buildHeaderInner(activeId, options);
    document.dispatchEvent(new CustomEvent('site-nav-ready'));
  }

  window.initSiteNav = initSiteNav;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSiteNav);
  } else {
    initSiteNav();
  }
})();
