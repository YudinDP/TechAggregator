(function () {
  var STORAGE_KEY = 'tech-nozone-theme';

  function getTheme() {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    var toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.checked = theme === 'dark';
    }
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
      var next = input.checked ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createThemeToggle);
  } else {
    createThemeToggle();
  }
})();
