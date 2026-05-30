(function () {
  var STORAGE_KEY = 'tech-nozone-theme';
  var MOBILE_NAV_MAX = 768;

  function getTheme() {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    var root = document.documentElement;
    root.classList.add('theme-switching');
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
    var toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.checked = theme === 'dark';
    }
    var menuToggle = document.getElementById('themeToggleMobile');
    if (menuToggle) {
      menuToggle.checked = theme === 'dark';
    }
    updateMobileThemeLabel();
    void root.offsetHeight;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.classList.remove('theme-switching');
      });
    });
  }

  function setTheme(theme) {
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
  }

  function updateMobileThemeLabel() {
    var label = document.getElementById('navMobileThemeLabel');
    if (!label) return;
    label.textContent = getTheme() === 'dark' ? 'Тёмная тема' : 'Светлая тема';
  }

  applyTheme(getTheme());

  function createThemeToggle() {
    if (document.getElementById('themeToggle')) {
      return;
    }

    var host = document.querySelector('.auth-buttons');
    if (!host || !host.parentElement) {
      return;
    }

    var wrapper = document.createElement('div');
    wrapper.className = 'theme-toggle-host';
    wrapper.innerHTML =
      '<label class="theme-toggle" title="Переключить тему" aria-label="Переключить светлую и тёмную тему">' +
      '<input type="checkbox" class="theme-toggle__input" id="themeToggle">' +
      '<span class="theme-toggle__track">' +
      '<span class="theme-toggle__icon theme-toggle__icon--sun" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
      '<circle cx="12" cy="12" r="4"/>' +
      '<line x1="12" y1="2" x2="12" y2="4"/>' +
      '<line x1="12" y1="20" x2="12" y2="22"/>' +
      '<line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/>' +
      '<line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/>' +
      '<line x1="2" y1="12" x2="4" y2="12"/>' +
      '<line x1="20" y1="12" x2="22" y2="12"/>' +
      '<line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/>' +
      '<line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/>' +
      '</svg>' +
      '</span>' +
      '<span class="theme-toggle__icon theme-toggle__icon--moon" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">' +
      '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>' +
      '</svg>' +
      '</span>' +
      '<span class="theme-toggle__thumb"></span>' +
      '</span>' +
      '</label>';

    host.parentElement.insertBefore(wrapper, host);

    var input = document.getElementById('themeToggle');
    input.checked = getTheme() === 'dark';
    input.addEventListener('change', function () {
      setTheme(input.checked ? 'dark' : 'light');
    });
  }

  function closeMobileNavMenu() {
    var btn = document.getElementById('navMobileMenuBtn');
    var panel = document.getElementById('navMobileDropdown');
    var backdrop = document.getElementById('navMobileBackdrop');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    if (panel) panel.classList.remove('is-open');
    if (backdrop) backdrop.classList.remove('is-visible');
    document.body.classList.remove('nav-mobile-menu-open');
  }

  function openMobileNavMenu() {
    refreshMobileNavAuth();
    var btn = document.getElementById('navMobileMenuBtn');
    var panel = document.getElementById('navMobileDropdown');
    var backdrop = document.getElementById('navMobileBackdrop');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    if (panel) panel.classList.add('is-open');
    if (backdrop) backdrop.classList.add('is-visible');
    document.body.classList.add('nav-mobile-menu-open');
  }

  function toggleMobileNavMenu() {
    var btn = document.getElementById('navMobileMenuBtn');
    if (!btn) return;
    if (btn.getAttribute('aria-expanded') === 'true') {
      closeMobileNavMenu();
    } else {
      openMobileNavMenu();
    }
  }

  function updateHeaderStickyOffset() {
    var header = document.querySelector('.header');
    if (!header) return;
    var h = Math.ceil(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--header-sticky-offset', h + 'px');

    var tools = document.querySelector('.catalog-mobile-drawer-triggers');
    if (tools) {
      var toolsH = Math.ceil(tools.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--catalog-tools-offset', toolsH + 'px');
    }
  }

  function syncMobileNavMode() {
    var useMobile = window.innerWidth <= MOBILE_NAV_MAX;
    document.body.classList.toggle('has-mobile-nav', useMobile);
    if (!useMobile) {
      closeMobileNavMenu();
    }
    updateHeaderStickyOffset();
  }

  function refreshMobileNavAuth() {
    var section = document.getElementById('navMobileAuthSection');
    var authHost = document.querySelector('.header .auth-buttons');
    if (!section || !authHost) return;

    section.innerHTML = '';

    var greeting = authHost.querySelector('.nav-user-greeting');
    if (greeting && greeting.textContent.trim()) {
      var greetEl = document.createElement('div');
      greetEl.className = 'nav-mobile-dropdown__greeting';
      greetEl.textContent = greeting.textContent.trim();
      section.appendChild(greetEl);
    }

    authHost.querySelectorAll('a[href], button.btn').forEach(function (el) {
      if (el.closest('.theme-toggle-host')) return;
      var clone = el.cloneNode(true);
      clone.classList.add('nav-mobile-dropdown__link');
      if (clone.tagName === 'BUTTON') {
        clone.type = 'button';
        clone.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          closeMobileNavMenu();
          el.click();
        });
      } else {
        clone.addEventListener('click', function () {
          closeMobileNavMenu();
        });
      }
      section.appendChild(clone);
    });
  }

  function buildMobileNavMenu(container) {
    if (!container || document.getElementById('navMobileMenuBtn')) {
      return;
    }

    var nav = container.querySelector('.nav');
    if (!nav) return;

    var backdrop = document.createElement('div');
    backdrop.className = 'nav-mobile-backdrop';
    backdrop.id = 'navMobileBackdrop';
    backdrop.addEventListener('click', closeMobileNavMenu);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-mobile-menu-btn';
    btn.id = 'navMobileMenuBtn';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Открыть меню');
    btn.setAttribute('aria-controls', 'navMobileDropdown');
    btn.innerHTML = '&#9776;';
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMobileNavMenu();
    });

    var panel = document.createElement('div');
    panel.className = 'nav-mobile-dropdown';
    panel.id = 'navMobileDropdown';
    panel.setAttribute('role', 'menu');
    panel.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    nav.querySelectorAll('.nav-link').forEach(function (link) {
      var a = document.createElement('a');
      a.className = 'nav-mobile-dropdown__link' + (link.classList.contains('active') ? ' active' : '');
      a.href = link.getAttribute('href') || '#';
      a.textContent = link.textContent.replace(/\d+$/, '').trim();
      a.setAttribute('role', 'menuitem');
      a.addEventListener('click', function () {
        closeMobileNavMenu();
      });
      panel.appendChild(a);
    });

    var dividerAuth = document.createElement('div');
    dividerAuth.className = 'nav-mobile-dropdown__divider';
    panel.appendChild(dividerAuth);

    var authSection = document.createElement('div');
    authSection.id = 'navMobileAuthSection';
    authSection.className = 'nav-mobile-dropdown__auth';
    panel.appendChild(authSection);

    var dividerTheme = document.createElement('div');
    dividerTheme.className = 'nav-mobile-dropdown__divider';
    panel.appendChild(dividerTheme);

    var themeRow = document.createElement('div');
    themeRow.className = 'nav-mobile-dropdown__theme';
    themeRow.innerHTML =
      '<span id="navMobileThemeLabel">Тема</span>' +
      '<label class="theme-toggle" title="Переключить тему">' +
      '<input type="checkbox" class="theme-toggle__input" id="themeToggleMobile">' +
      '<span class="theme-toggle__track">' +
      '<span class="theme-toggle__icon theme-toggle__icon--sun" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
      '<circle cx="12" cy="12" r="4"/>' +
      '<line x1="12" y1="2" x2="12" y2="4"/>' +
      '<line x1="12" y1="20" x2="12" y2="22"/>' +
      '</svg>' +
      '</span>' +
      '<span class="theme-toggle__icon theme-toggle__icon--moon" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">' +
      '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>' +
      '</svg>' +
      '</span>' +
      '<span class="theme-toggle__thumb"></span>' +
      '</span>' +
      '</label>';
    panel.appendChild(themeRow);

    var mobileThemeInput = themeRow.querySelector('#themeToggleMobile');
    mobileThemeInput.checked = getTheme() === 'dark';
    mobileThemeInput.addEventListener('change', function (e) {
      e.stopPropagation();
      setTheme(mobileThemeInput.checked ? 'dark' : 'light');
      var desktopToggle = document.getElementById('themeToggle');
      if (desktopToggle) desktopToggle.checked = mobileThemeInput.checked;
    });

    updateMobileThemeLabel();
    refreshMobileNavAuth();

    container.appendChild(btn);
    document.body.appendChild(panel);
    document.body.appendChild(backdrop);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMobileNavMenu();
    });
  }

  function initMobileNav() {
    var container = document.querySelector('.header .container');
    if (!container) return;
    buildMobileNavMenu(container);
    syncMobileNavMode();
    window.addEventListener('resize', syncMobileNavMode);
    window.addEventListener('orientationchange', syncMobileNavMode);
    window.addEventListener('scroll', updateHeaderStickyOffset, { passive: true });

    var header = document.querySelector('.header');
    if (header && typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(updateHeaderStickyOffset).observe(header);
    }

    var tools = document.querySelector('.catalog-mobile-drawer-triggers');
    if (tools && typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(updateHeaderStickyOffset).observe(tools);
    }
    setTimeout(updateHeaderStickyOffset, 150);
  }

  window.refreshMobileNavAuth = refreshMobileNavAuth;
  window.closeMobileNavMenu = closeMobileNavMenu;

  function onReady() {
    if (!document.querySelector('.header .nav')) {
      document.addEventListener('site-nav-ready', onReady, { once: true });
      return;
    }
    createThemeToggle();
    initMobileNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
