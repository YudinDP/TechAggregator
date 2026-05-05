window.APP_CONFIG = {
  // API_BASE_URL будет подставлен из переменной окружения
  API_BASE_URL: process?.env?.API_BASE_URL || window?.__ENV__?.API_BASE_URL || '',
  
  // Другие настройки
  APP_NAME: 'Tech Aggregator',
  DEBUG: process?.env?.NODE_ENV !== 'production'
};

// Хелпер для запросов к API
window.apiFetch = async (endpoint, options = {}) => {
  const baseUrl = window.APP_CONFIG.API_BASE_URL;
  // Убираем слэши, чтобы не было дублирования: /api/ + /products = /api/products
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
};