
(function () {
  const GITHUB_URL = 'https://github.com/YudinDP/TechAggregator';
  const DEV_NAME = 'Данил Юдин';
  const DEV_EMAIL = 'yudindanilap@gmail.com';
  const GMAIL_COMPOSE_URL =
    'https://mail.google.com/mail/?view=cm&fs=1&to=' +
    encodeURIComponent(DEV_EMAIL) +
    '&su=' +
    encodeURIComponent('Сотрудничество — tech-nozone');

  const ISSUE_TYPES = [
    { value: 'bug', label: 'Ошибка на сайте' },
    { value: 'account', label: 'Проблема с аккаунтом' },
    { value: 'data', label: 'Неточные данные / цены' },
    { value: 'other', label: 'Другое' }
  ];

  function apiBase() {
    if (typeof window !== 'undefined' && window.API_BASE) return window.API_BASE;
    return 'http://localhost:3000';
  }

  function footerShowToast(message, type) {
    if (typeof showCustomNotification === 'function') {
      showCustomNotification(message, type || 'info');
      return;
    }
    let container = document.querySelector('.notification-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'notification-container';
      document.body.appendChild(container);
    }
    const icons = { success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️' };
    const note = document.createElement('div');
    note.className = 'notification ' + (type || 'info');
    note.innerHTML =
      '<div class="notification-content">' +
      '<span class="notification-icon">' +
      (icons[type] || icons.info) +
      '</span>' +
      '<span class="notification-text"></span>' +
      '<button type="button" class="notification-close">&times;</button>' +
      '</div>';
    note.querySelector('.notification-text').textContent = message;
    note.querySelector('.notification-close').addEventListener('click', () => note.remove());
    container.appendChild(note);
    setTimeout(() => note.remove(), 5000);
  }

  function getAuthToken() {
    try {
      return localStorage.getItem('techAggregatorToken') || '';
    } catch {
      return '';
    }
  }

  function githubIconSvg() {
    return (
      '<svg class="footer-github__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">' +
      '<path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>' +
      '</svg>'
    );
  }

  function buildFooterHtml(isLoggedIn) {
    const issueOptions = ISSUE_TYPES.map((t) => '<option value="' + t.value + '">' + t.label + '</option>').join('');

    const emailRow = isLoggedIn
      ? ''
      : '<div class="footer-form-row" data-guest-email-row>' +
        '<label for="supportUserEmail">E-mail для ответа <span class="footer-required">*</span></label>' +
        '<input type="email" id="supportUserEmail" name="userEmail" maxlength="200" placeholder="your@email.com" autocomplete="email" required>' +
        '</div>';

    return (
      '<div class="footer-grid">' +
      '<div class="footer-col footer-col--brand">' +
      '<p class="footer-copy">&copy; 2025–2026 <strong>tech-nozone</strong>. Все права защищены.</p>' +
      '<a class="footer-github" href="' +
      GITHUB_URL +
      '" target="_blank" rel="noopener noreferrer" title="Репозиторий проекта на GitHub">' +
      githubIconSvg() +
      '<span class="footer-github__text"><span class="footer-github__label">Исходный код</span>' +
      '<span class="footer-github__repo">YudinDP / TechAggregator</span></span></a>' +
      '</div>' +
      '<div class="footer-col footer-col--developer">' +
      '<h3 class="footer-heading">Разработчик</h3>' +
      '<p class="footer-dev-name">' +
      DEV_NAME +
      '</p>' +
      '<p class="footer-dev-hint">По сотрудничеству и предложениям:</p>' +
      '<div class="footer-email-row">' +
      '<a class="footer-email-link" href="mailto:' +
      DEV_EMAIL +
      '?subject=' +
      encodeURIComponent('Сотрудничество — tech-nozone') +
      '">' +
      DEV_EMAIL +
      '</a>' +
      '<div class="footer-email-actions">' +
      '<button type="button" class="footer-btn footer-btn--copy" data-copy-email title="Скопировать почту">Копировать</button>' +
      '<a class="footer-btn footer-btn--gmail" href="' +
      GMAIL_COMPOSE_URL +
      '" target="_blank" rel="noopener noreferrer" title="Написать в Gmail">Gmail</a>' +
      '</div></div></div>' +
      '<div class="footer-col footer-col--support">' +
      '<h3 class="footer-heading">Поддержка</h3>' +
      '<p class="footer-support-lead">Сообщите об ошибке или проблеме</p>' +
      '<form id="siteSupportForm" class="footer-support-form" novalidate>' +
      '<div class="footer-form-row">' +
      '<label for="supportIssueType">Тип обращения</label>' +
      '<select id="supportIssueType" name="issueType" required>' +
      issueOptions +
      '</select>' +
      '</div>' +
      emailRow +
      '<div class="footer-form-row">' +
      '<label for="supportMessage">Сообщение <span class="footer-required">*</span></label>' +
      '<textarea id="supportMessage" name="message" rows="5" maxlength="4000" required placeholder="Опишите проблему или вопрос как можно подробнее"></textarea>' +
      '</div>' +
      '<button type="submit" class="footer-submit">Отправить в поддержку</button>' +
      '</form></div></div>'
    );
  }

  async function submitSupportForm(form) {
    const issueType = form.issueType.value;
    const message = (form.message.value || '').trim();
    const emailInput = form.querySelector('#supportUserEmail');
    const userEmail = emailInput ? (emailInput.value || '').trim() : '';
    const pageUrl = window.location.href;
    const loggedIn = !!getAuthToken();

    if (!message || message.length < 10) {
      footerShowToast('Опишите проблему подробнее (минимум 10 символов).', 'warning');
      return;
    }
    if (!loggedIn && !userEmail) {
      footerShowToast('Укажите e-mail для обратной связи или войдите в аккаунт.', 'warning');
      return;
    }

    const submitBtn = form.querySelector('.footer-submit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправка…';
    }

    const headers = { 'Content-Type': 'application/json' };
    const token = getAuthToken();
    if (token) headers.Authorization = 'Bearer ' + token;

    try {
      const res = await fetch(apiBase() + '/api/support/tickets', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          issueType,
          message,
          userEmail: userEmail || null,
          pageUrl
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || res.statusText || 'Ошибка отправки');
      }
      form.reset();
      footerShowToast('Обращение отправлено. В скором времени мы рассмотрим его', 'success');
    } catch (e) {
      footerShowToast(e.message || 'Не удалось отправить обращение. Попробуйте позже.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить в поддержку';
      }
    }
  }

  function bindFooter(root) {
    const copyBtn = root.querySelector('[data-copy-email]');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(DEV_EMAIL);
          footerShowToast('Почта скопирована: ' + DEV_EMAIL, 'success');
        } catch {
          footerShowToast('Не удалось скопировать. Почта: ' + DEV_EMAIL, 'info');
        }
      });
    }

    const form = root.querySelector('#siteSupportForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        submitSupportForm(form);
      });
    }
  }

  function initSiteFooter() {
    const footer = document.querySelector('footer.footer');
    if (!footer) return;
    let mount = footer.querySelector('.container');
    if (!mount) {
      mount = document.createElement('div');
      mount.className = 'container';
      footer.appendChild(mount);
    }
    mount.classList.add('footer-inner');
    mount.innerHTML = buildFooterHtml(!!getAuthToken());
    bindFooter(mount);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSiteFooter);
  } else {
    initSiteFooter();
  }
})();
