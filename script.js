//Глобальные переменные
let currentProductId = null; 
let currentUser = null;
let comparisonList = [];
let favorites = [];
let currentFilters = {};
let selectedCheckboxes = {};
let demoProducts = []; //Только для совместимости, по факту данные берутся с бд
let currentAdminTableData = [];
let currentAdminTableName = '';
let currentModerationTab = 'reviews';
let currentPriceHistoryProduct = null;
let currentPriceHistoryEntries = [];
// --- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ДЛЯ ПОИСКА В ТАБЛИЦЕ ---
let currentTableSearchField = '';
let currentTableSearchValue = '';
//=== КАРТА ПЕРЕВОДА КЛЮЧЕЙ ХАРАКТЕРИСТИК НА РУССКИЙ ===
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

//=== ИНИЦИАЛИЗАЦИЯ КАТАЛОГА ===
function initializeCatalog() {
  //Загружаем параметры из URL
  loadFiltersFromURL();
  //Отображаем товары (уже из API)
  displayProducts(demoProducts);
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

  // Сбрасываем выбранные чекбоксы для предыдущей категории
  selectedCheckboxes = {};

  if (category && demoProducts && demoProducts.length > 0) {
    // 1. Найдём все товары текущей категории
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

    // 2. Соберём все уникальные ключи характеристик для этой категории
    const uniqueSpecKeys = new Set();
    productsInCategory.forEach(product => {
      if (product.specs) {
        Object.keys(product.specs).forEach(key => uniqueSpecKeys.add(key));
      }
    });

    // 3. Для каждого ключа соберём уникальные *значения*
    const filtersForCategory = [];
    uniqueSpecKeys.forEach(key => {
      const valuesSet = new Set();
      productsInCategory.forEach(product => {
        if (product.specs && product.specs[key]) {
          // Нормализуем значение перед добавлением в Set
          const normalizedValue = normalizeFilterValue(product.specs[key]);
          valuesSet.add(normalizedValue);
        }
      });
      // Пропускаем ключи с очень большим количеством уникальных значений (например, цены)
      if (valuesSet.size > 0 && valuesSet.size <= 20) { // Порог, можно изменить
        filtersForCategory.push({
          name: key, // Используем оригинальный ключ из specs
          label: specKeyTranslations[key] || key, // Русское название или ключ
          type: 'checkbox',
          options: [...valuesSet].sort() // Сортируем значения
        });
      }
    });

    // 4. Сгенерируем HTML для фильтров
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

  // Обновляем счётчики и отображение
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

  // Добавляем minPrice и brand ко всем товарам (для удобства фильтрации/сортировки)
  let filtered = demoProducts.map(p => ({
    ...p,
    minPrice: p.prices && p.prices.length > 0 ? Math.min(...p.prices.map(pr => pr.price)) : null,
    brand: p.name.split(' ')[0] || ''
  }));

  // 1. Фильтрация по категории
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }

  // 2. Фильтрация по цене
  filtered = filtered.filter(p => {
    const price = p.minPrice || 0;
    return price >= minPrice && price <= maxPrice;
  });

  // 3. Фильтрация по чекбоксам (динамические фильтры по характеристикам)
  // Object.keys(selectedCheckboxes) перебирает имена фильтров (specKey)
  Object.keys(selectedCheckboxes).forEach(specKey => {
    const selectedValues = selectedCheckboxes[specKey];
    if (selectedValues.length > 0) {
      // filtered = filtered.filter(product => { ... })
      // selectedValues.some(value => matchFilter(product, specKey, value))
      filtered = filtered.filter(product =>
        selectedValues.some(value => matchFilter(product, specKey, value))
      );
    }
  });

  // 4. Сортировка
  if (sortBy) {
    filtered = sortProductsList(filtered, sortBy);
  }

  // 5. Обновляем UI
  updateProductsInfo(filtered.length, category);
  displayProducts(filtered); // ← передаём уже обогащённые и отфильтрованные товары
}

//Сопоставление фильтров
function matchFilter(product, specKey, filterValue) {
  // Получаем значение характеристики из specs товара
  const specValue = product.specs?.[specKey];

  // Если характеристики нет, или значение пустое, товар не подходит
  if (specValue == null || specValue === '') {
    return false;
  }

  // Нормализуем значения для сравнения
  const normSpecValue = normalizeFilterValue(specValue);
  const normFilterValue = normalizeFilterValue(filterValue);

  // Проверяем точное совпадение
  if (normSpecValue === normFilterValue) {
    return true;
  }

  // Дополнительно: проверим, является ли specValue списком/массивом (если хранится как строка через запятую или точку с запятой)
  if (typeof specValue === 'string') {
    const possibleValues = specValue.split(/[,;]/).map(v => normalizeFilterValue(v.trim()));
    if (possibleValues.includes(normFilterValue)) {
      return true;
    }
  }

  // Для числовых диапазонов (например, "До 4000 mAh", "Свыше 5000 mAh")
  // Проверим, начинается ли filterValue с "до" или "свыше"
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
// --- /ОБНОВЛЁННАЯ ФУНКЦИЯ ---

// --- ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ НОРМАЛИЗАЦИИ ---
// normalizeFilterValue - Нормализует значение характеристики для сравнения
function normalizeFilterValue(str) {
  if (typeof str !== 'string') {
    // Если значение не строка (например, число), преобразуем в строку
    str = String(str);
  }
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '') // Убираем все пробелы
    .replace(/гб|gb/i, 'gb') // Приводим "ГБ", "гигабайт" к "gb"
    .replace(/мб|mb/i, 'mb')
    .replace(/кб|kb/i, 'kb')
    .replace(/тб|tb/i, 'tb')
    .replace(/дюйм|дюймы|inch/i, 'inch')
    .replace(/вт|w/i, 'w')
    .replace(/мач|mac/i, 'mac') // Пример для процессоров
    .replace(/core\s*i(\d)/i, 'corei$1') // Пример: "Core i7" -> "corei7"
    // ... добавьте другие правила нормализации по мере необходимости ...
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

  //Обновляем хлебные крошки и заголовок
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

  //=== ХАРАКТЕРИСТИКИ — ВЕРТИКАЛЬНО ===
  const specsList = document.getElementById('productSpecs');
  if (specsList) {

    specsList.innerHTML = Object.entries(product.specs || {}).map(([key, value]) => {
      //Получаем русское название из словаря
      const russianName = specKeyTranslations[key] || key; 
      return `
        <div class="spec-item">
          <span>${russianName}:</span> <!-- ← Выводим русское название -->
          <span>${value}</span>
        </div>
      `;
    }).join('');
  }

  //Цены с графиками
  const priceList = document.getElementById('priceList');
  if (priceList && product.prices) {
    priceList.innerHTML = product.prices.map(price => `
      <div class="price-item">
        <div class="store-info">${price.store}</div>
        <div>${formatPrice(price.price)} ₽</div>
        <a href="${price.url}" target="_blank" class="buy-button">Купить</a>
      </div>
    `).join('');
  }

  //=== ИСТОРИЯ ЦЕН (ГРАФИК) ===
  const historySection = document.getElementById('priceChartContainer'); //Убедитесь, что ID совпадает
  if (historySection) {

    //Загружаем и отрисовываем график истории цен
    loadAndRenderPriceHistory(product.id);
  } else {
     console.warn('Контейнер для графика истории цен (#priceChartContainer) не найден на странице.');
  }

  //Отзывы 
  loadProductReviews(product.id);
  
  loadAndRenderPriceHistory(product.id);
}

//Загрузка и формат данных по истории цен
async function loadAndRenderPriceHistory(productId) {
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

  } catch (error) {
    console.error('Error loading price history:', error);
    //Скрываем индикатор загрузки
    if (loadingDiv) loadingDiv.style.display = 'none';
    //Показываем сообщение об ошибке в контейнере
    container.innerHTML = `<p style="color: red; text-align: center;">Ошибка загрузки истории цен: ${error.message}</p>`;
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
  // Приводим имя магазина к нижнему регистру для нечувствительности к регистру
  const normalizedStoreName = storeName.toLowerCase();

  // Определяем цвета для известных магазинов
  const colorMap = {
    // --- СООТВЕТСТВИЕ МАГАЗИН -> ЦВЕТ ---
    'dns': '#f97316', // Оранжевый (DNS-shop)
    'dns-shop': '#f97316', // На случай, если приходит 'DNS-shop'
    'dns shop': '#f97316', // На случай, если приходит 'DNS Shop'
    'ozon': '#1d4ed8', // Синий (OZON)
    'ozon.ru': '#1d4ed8', // На случай, если приходит 'OZON.ru'
    'mvideo': '#dc2626', // Красный (М.Видео)
    'm.video': '#dc2626', // На случай, если приходит 'М.Видео' как 'M.Video'
    'eldorado': '#10b981', // Изумрудный (Эльдорадо)
    'citilink': '#8b5cf6', // Фиолетовый (Ситилинк)
    'avito': '#059669', // Тёмно-зелёный (Avito)
    'avito marketplace': '#059669', // На случай, если приходит полное название
    'yandex market': '#ff9900', // Жёлтый (Яндекс.Маркет)
    'wildberries': '#ff0000', // Ярко-красный (Wildberries)
    'aliexpress': '#ff6600', // Оранжево-красный (AliExpress)
    'amazon': '#ff9900', // Жёлтый (Amazon)
    'ebay': '#0a3069', // Тёмно-синий (eBay)
    'bestbuy': '#003b64', // Тёмно-синий (Best Buy)
    'walmart': '#007dc6', // Синий (Walmart)
    'target': '#cc0000', // Красный (Target)
    'apple': '#a2aaad', // Серый (Apple)
    'samsung': '#1428a0', // Тёмно-синий (Samsung)
    'xiaomi': '#ff6600', // Оранжевый (Xiaomi)
    'huawei': '#e01e24', // Красный (Huawei)
    'google': '#4285f4', // Синий (Google)
    'asus': '#000000', // Чёрный (Asus)
    'lenovo': '#d9006c', // Фуксия (Lenovo)
    'hp': '#0096d6', // Светло-синий (HP)
    'dell': '#007db8', // Синий (Dell)
    'acer': '#83004c', // Бордовый (Acer)
    'msi': '#ff0000', // Красный (MSI)
    'lg': '#005fa7', // Синий (LG)
    'sony': '#000000', // Чёрный (Sony)
    'nokia': '#085a9e', // Синий (Nokia)
    'lg electronics': '#005fa7', // На случай полного названия
    'apple inc.': '#a2aaad', // На случай полного названия
    // ... добавьте другие магазины и бренды по необходимости ...
  };

  // Возвращаем цвет из карты, если он найден, иначе возвращаем серый как резервный вариант
  return colorMap[normalizedStoreName] || '#9ca3af'; // '#9ca3af' - серый цвет по умолчанию
}

function trackPurchase(productId, store) {
    //Позже здесь будет отправка аналитики
    console.log(`Покупка товара ${productId} в магазине ${store}`);
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

      //ПРАВИЛЬНАЯ ПРОВЕРКА ТЕКСТА: проверяем review.comment (или review.text, в зависимости от сервера)
      //Если поле null или undefined или пустая строка, показываем "Без комментария"
      const commentText = review.comment || review.text; //<-- Проверьте, какое поле возвращает сервер
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
          <p class="review-text">${displayText}</p> <!-- Отображаем текст или "Без комментария" -->
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
        window.location.href = 'auth.html';
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
      <button class="btn btn-outline" onclick="showAuthModal()">Войти</button>
      <button class="btn btn-primary" onclick="showRegModal()">Регистрация</button>
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
    window.location.href = 'auth.html';
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
    window.location.href = 'auth.html';
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
            //Здесь будет логика добавления товара
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

//Инициализация рекомендаций (если на странице)
function initializeRecommendationsPage() {

}

//Инициализация админ-панели (если на странице)
function initializeAdminPage() {
    //Проверка прав доступа
    if (!currentUser || currentUser.role !== 'admin') {
        showCustomNotification('Доступ запрещён', 'info');
        window.location.href = 'index.html';
        return;
    }
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
    window.location.href = 'auth.html';
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
  const textArea = document.getElementById('reviewText'); // <-- Убедитесь, что id правильный

  const rating = parseInt(ratingInput.value, 10);
  const text = textArea ? textArea.value.trim() : ''; // <-- Получаем текст из #reviewText

  if (!rating || rating < 1 || rating > 5) {
    showCustomNotification('Пожалуйста, укажите оценку (1-5)', 'info');
    return;
  }

  // Комментарий может быть пустым, но если он есть, проверим длину
  if (text && text.length < 10) { // Проверяем длину только если текст не пустой
    showCustomNotification('Отзыв должен содержать минимум 10 символов', 'info');
    return;
  }

  const token = localStorage.getItem('techAggregatorToken');
  const productId = getCurrentProductId(); // Убедитесь, что ID товара получается корректно

  if (!token || !productId) {
    showCustomNotification('Ошибка: токен или ID товара отсутствует.', 'error');
    return;
  }

  try {
    // --- ИСПРАВЛЕНО: Отправляем 'text' ---
    const response = await fetch('http://localhost:3000/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: productId,
        rating: rating,
        text: text // <-- Отправляем 'text', как ожидает сервер
        // userName не нужно, сервер берёт из токена
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
      const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('Отзыв отправлен на модерацию:', result);
    showCustomNotification('Ваш отзыв отправлен на модерацию.', 'success');

    // Очистим форму
    ratingInput.value = '5';
    if (textArea) textArea.value = '';

    // Перезагрузим отзывы для обновления списка (опционально)
    await loadProductReviews(productId);

    // ПОВТОРНО ЗАГРУЗИТЬ ИНФОРМАЦИЮ О ТОВАРЕ (включая рейтинг), если нужно обновить на лету
    // loadProductDetails(productId); // Вызовите, если есть такая функция и она нужна

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
  headphones: ['наушники', 'bluetooth', 'tws', 'airpods', 'sony', 'bose'],
  smartwatches: ['часы', 'смартчасы', 'watch', 'apple watch', 'garmin'],
  tablets: ['планшет', 'ipad', 'galaxy tab'],
  drones: ['дрон', 'dji', 'квадрокоптер'],
  ereaders: ['электронная книга', 'kindle', 'pocketbook']
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
      'смарт-часы': 'smartwatches',
      'планшеты': 'tablets',
      'дроны': 'drones',
      'электронные книги': 'ereaders'
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
    document.getElementById('navSearchSuggestions').style.display = 'none';
    
    //Находим категории по запросу
    const lowerQuery = query.toLowerCase();
    const categories = new Set();
    
    //Прямое совпадение
    const RU_CATEGORY_MAP = {
      'смартфоны': 'smartphones',
      'ноутбуки': 'laptops',
      'телевизоры': 'tv',
      'наушники': 'headphones',
      'смарт-часы': 'smartwatches',
      'планшеты': 'tablets',
      'дроны': 'drones',
      'электронные книги': 'ereaders'
    };
    
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
                        <option value="cameras">Камеры</option>
                        <option value="drones">Дроны</option>
                        <option value="tablets">Планшеты</option>
                        <option value="smartwatches">Смарт-часы</option>
                        <option value="ereaders">Электронные книги</option>
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
    closeRequestModal(); //Убедитесь, что функция closeRequestModal определена

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
        <!-- Характеристики -->
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

        <!-- Строка "Цены и покупка" -->
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
        <tr class="mini-chart-row">
          <td class="spec-label fixed-col">История цен</td>
          ${comparisonList.map(product => `
            <td class="mini-chart-cell">
              <div id="miniChartContainer-${product.id}" style="height: 200px; width: 100%; display: flex; justify-content: center; align-items: center;">
                <!-- Заглушка или canvas будет вставлен сюда -->
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
    console.warn('Старая функция showNotification будет заменена');
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
    showCustomNotification('Требуется авторизация', 'warning');
    window.location.href = 'auth.html';
    return;
  }

  try {
    console.log('loadProfileDataFromAPI: Отправка запроса на /api/profile...');
    const profileRes = await fetch('http://localhost:3000/api/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!profileRes.ok) {
      if (profileRes.status === 401) {
        // Токен недействителен или просрочен
        localStorage.removeItem('techAggregatorToken');
        currentUser = null;
        updateAuthButtons();
        showCustomNotification('Сессия истекла. Пожалуйста, войдите снова.', 'warning');
        window.location.href = 'auth.html';
        return;
      }
      throw new Error(`HTTP ${profileRes.status}: ${profileRes.statusText}`);
    }

    const { user } = await profileRes.json();
    console.log('loadProfileDataFromAPI: Данные профиля загружены:', user);

    // --- ОБНОВЛЕНИЕ ИНФОРМАЦИИ О ПОЛЬЗОВАТЕЛЕ ---
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
    // --- /ОБНОВЛЕНИЕ ИНФОРМАЦИИ О ПОЛЬЗОВАТЕЛЕ ---

    // --- ОБНОВЛЕНИЕ КНОПКИ АДМИН-ПАНЕЛИ ---
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
    // --- /ОБНОВЛЕНИЕ КНОПКИ АДМИН-ПАНЕЛИ ---

    // --- ЗАГРУЗКА И ПРЕДВАРИТЕЛЬНЫЙ ПРОСМОТР ИЗБРАННОГО ---
    try {
      console.log('loadProfileDataFromAPI: Загрузка избранного...');
      const favoritesRes = await fetch('http://localhost:3000/api/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!favoritesRes.ok) {
        if (favoritesRes.status === 401) {
          // Если токен истёк при запросе к избранному, тоже перенаправляем
          localStorage.removeItem('techAggregatorToken');
          currentUser = null;
          updateAuthButtons();
          showCustomNotification('Сессия истекла. Пожалуйста, войдите снова.', 'warning');
          window.location.href = 'auth.html';
          return;
        }
        throw new Error(`HTTP ${favoritesRes.status}: ${favoritesRes.statusText}`);
      }
      const favoriteProducts = await favoritesRes.json();
      console.log(`loadProfileDataFromAPI: Загружено ${favoriteProducts.length} избранных товаров.`);
      // Сохраняем в глобальную переменную для renderFavoritesPreview
      window.favorites = favoriteProducts; // Или просто favorites, если она объявлена глобально
      // Вызываем функцию отрисовки
      renderFavoritesPreview(favoriteProducts);
    } catch (favError) {
      console.error('loadProfileDataFromAPI: Ошибка загрузки избранного:', favError);
      // Очищаем контейнер или показываем ошибку
      const container = document.getElementById('favoritesPreview');
      if (container) container.innerHTML = `<p class="error-message">Ошибка загрузки избранного: ${favError.message}</p>`;
      // Очищаем глобальную переменную
      window.favorites = [];
    }
    // --- /ЗАГРУЗКА ИЗБРАННОГО ---

    // --- ЗАГРУЗКА И ПРЕДВАРИТЕЛЬНЫЙ ПРОСМОТР СРАВНЕНИЙ ---
    try {
      console.log('loadProfileDataFromAPI: Загрузка сравнений...');
      const comparisonsRes = await fetch('http://localhost:3000/api/comparisons', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!comparisonsRes.ok) {
        if (comparisonsRes.status === 401) {
          // Если токен истёк при запросе к сравнениям, тоже перенаправляем
          localStorage.removeItem('techAggregatorToken');
          currentUser = null;
          updateAuthButtons();
          showCustomNotification('Сессия истекла. Пожалуйста, войдите снова.', 'warning');
          window.location.href = 'auth.html';
          return;
        }
        throw new Error(`HTTP ${comparisonsRes.status}: ${comparisonsRes.statusText}`);
      }
      const comparisonProducts = await comparisonsRes.json();
      console.log(`loadProfileDataFromAPI: Загружено ${comparisonProducts.length} товаров в сравнении.`);
      // Сохраняем в глобальную переменную для renderComparisonsPreview
      window.comparisons = comparisonProducts; // Или просто comparisons
      // Вызываем функцию отрисовки
      renderComparisonsPreview(comparisonProducts);
    } catch (compError) {
      console.error('loadProfileDataFromAPI: Ошибка загрузки сравнений:', compError);
      // Очищаем контейнер или показываем ошибку
      const container = document.getElementById('comparisonsPreview');
      if (container) container.innerHTML = `<p class="error-message">Ошибка загрузки сравнений: ${compError.message}</p>`;
      // Очищаем глобальную переменную
      window.comparisons = [];
    }
    // --- /ЗАГРУЗКА СРАВНЕНИЙ ---

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
                'headphones': 'Наушники'
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

  container.innerHTML = '';
  if (favorites.length === 0) {
    if (noMsg) noMsg.style.display = 'block';
    return;
  }
  if (noMsg) noMsg.style.display = 'none';

  favorites.slice(0, 3).forEach(fav => {
    const el = document.createElement('div');
    el.className = 'favorite-item';
    el.innerHTML = `
      <button class="remove-favorite-btn" onclick="removeFromFavorites(${fav.id})">×</button>
      <img src="${fav.image || 'https://via.placeholder.com/50'}" alt="${fav.name}" onclick="window.location.href='product.html?id=${fav.id}'">
      <div class="favorite-item-info">
        <div class="favorite-item-name">${fav.name}</div>
        <div class="favorite-item-price">${formatPrice(getMinPrice(fav))} ₽</div>
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

        //Пример функций для профиля
        function uploadAvatar() {
            alert('Функция загрузки аватара будет реализована позже');
        }

        function editProfile() {
            alert('Функция редактирования профиля будет реализована позже');
        }

        function changePassword() {
            alert('Функция смены пароля будет реализована позже');
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
        function loadFavorites() {
            const favorites = getFavorites();
            const favoritesList = document.getElementById('favoritesList');
            favoritesList.innerHTML = ''; //Очищаем текущий список

            if (favorites.length === 0) {
                //Если избранное пусто, список уже очищен, статы обновятся в updateStats
                loadProfileDataFromAPI();
                return;
            }

            favorites.forEach(fav => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card-favorite';
                productCard.innerHTML = `
                    <button class="remove-favorite-btn" onclick="removeFromFavorites(${fav.id})">×</button>
                    <img src="${fav.image}" alt="${fav.name}">
                    <h3>${fav.name}</h3>
                    <div class="product-meta">
                        <div class="product-category">${getCategoryName(fav.category)}</div>
                        <div class="product-price">${formatPrice(fav.price)} ₽</div>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-primary btn-small" onclick="goToProduct(${fav.id})">Подробнее</button>
                        <button class="btn btn-outline btn-small" onclick="addToComparison(${fav.id})">Сравнить</button>
                    </div>
                `;
                favoritesList.appendChild(productCard);
            });

            loadProfileDataFromAPI(); //Обновляем статистику после загрузки товаров
        }

        //Функция для получения русского названия категории (должна быть в основном script.js, но на всякий случай)
        function getCategoryName(categoryKey) {
            const categoryTranslations = {
                'smartphones': 'Смартфоны',
                'laptops': 'Ноутбуки',
                'tv': 'Телевизоры',
                'headphones': 'Наушники'
            };
            return categoryTranslations[categoryKey] || categoryKey;
        }


        //Загружаем избранное при загрузке страницы
        document.addEventListener('DOMContentLoaded', function() {
            loadFavorites();
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
        //Получаем все отзывы
        const reviewsRes = await fetch('http://localhost:3000/api/admin/reviews', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (reviewsRes.ok) {
            const allReviews = await reviewsRes.json();
            const pendingReviews = allReviews.filter(r => r.status === 'pending');
            document.getElementById('newReviews').textContent = allReviews.length;
            //Обновляем общее количество на модерации
            const totalPending = pendingReviews.length + (await getPendingRequestsCount() || 0);
            document.getElementById('pendingItems').textContent = totalPending;
        }

        //Получаем все запросы
        const requestsRes = await fetch('http://localhost:3000/api/admin/requests', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (requestsRes.ok) {
            const allRequests = await requestsRes.json();
            const pendingRequests = allRequests.filter(r => r.status === 'pending');
            document.getElementById('addRequests').textContent = allRequests.length;
            //Обновляем общее количество на модерации
            const totalPending = (await getPendingReviewsCount() || 0) + pendingRequests.length;
            document.getElementById('pendingItems').textContent = totalPending;
        }

    } catch (error) {
        console.error('Ошибка обновления статистики модерации:', error);
    }
}

//Вспомогательная функция для получения количества на модерации (можно оптимизировать в один запрос)
async function getPendingReviewsCount() {
    const token = localStorage.getItem('techAggregatorToken');
    const res = await fetch('http://localhost:3000/api/admin/reviews', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
        const reviews = await res.json();
        return reviews.filter(r => r.status === 'pending').length;
    }
    return 0;
}

async function getPendingRequestsCount() {
    const token = localStorage.getItem('techAggregatorToken');
    const res = await fetch('http://localhost:3000/api/admin/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
        const requests = await res.json();
        return requests.filter(r => r.status === 'pending').length;
    }
    return 0;
}

async function loadTableList() {
    const selector = document.getElementById('crudTableSelector');
    if (!selector) return;

    try {
        const token = localStorage.getItem('techAggregatorToken');
        const response = await fetch('http://localhost:3000/api/admin/tables', { //<-- Этот маршрут должен быть на сервере
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


async function updateMainStats() {
    const token = localStorage.getItem('techAggregatorToken');
    try {
        //Загрузка статистики
        const statsRes = await fetch('http://localhost:3000/api/admin/dashboard-stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (statsRes.ok) {
            const stats = await statsRes.json();
            document.getElementById('totalProducts').textContent = stats.totalProducts || 0;
            //pendingItems = pendingReviews + pendingRequests
            const pendingReviews = stats.pendingReviews || 0;
            const pendingRequests = stats.pendingRequests || 0;
            document.getElementById('pendingItems').textContent = pendingReviews + pendingRequests;
            document.getElementById('newReviews').textContent = pendingReviews; //Или общее количество новых
            document.getElementById('addRequests').textContent = pendingRequests; //Или общее количество новых
        }
    } catch (error) {
        console.error('Ошибка обновления статистики:', error);
        //Показать ошибку в соответствующих блоках
        document.querySelectorAll('.stat-card-enhanced .stat-value').forEach(el => el.textContent = 'Err');
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
async function loadTableData(searchField = '', searchValue = '') { // <-- ПРИНИМАЕТ ПАРАМЕТРЫ ПОИСКА
  const selector = document.getElementById('crudTableSelector');
  const tableName = selector.value;
  const container = document.getElementById('crudTableContainer');

  // Сохраняем параметры поиска (если они переданы)
  // currentTableSearchField = searchField; // <-- Убедитесь, что глобальная переменная объявлена
  // currentTableSearchValue = searchValue; // <-- Убедитесь, что глобальная переменная объявлена

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

    // --- ОБНОВЛЕНИЕ: Формируем URL с параметрами поиска ---
    let endpoint = `http://localhost:3000/api/admin/table/${tableName}`;
    const params = new URLSearchParams();
    if (searchField && searchValue) {
      params.append('searchField', searchField);
      params.append('searchValue', searchValue);
    }
    if (params.toString()) {
      endpoint += '?' + params.toString();
    }
    // --- /ОБНОВЛЕНИЕ ---

    const response = await fetch(endpoint, { // <-- Используем обновлённый endpoint
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

    // --- ОБНОВЛЕНИЕ: Передаём searchField и searchValue в renderCrudTable ---
    renderCrudTable(container, data, tableName, searchField, searchValue); // <-- Передаём параметры поиска
    // --- /ОБНОВЛЕНИЕ ---

  } catch (error) {
    console.error(`Ошибка загрузки данных из таблицы ${tableName}:`, error);
    container.innerHTML = `<p class="error-message">Ошибка: ${error.message}</p>`;
  }
}

//Отрисовка таблицы данных
function renderCrudTable(container, data, tableName, searchField = '', searchValue = '') { // <-- Принимает параметры поиска
  if (data.length === 0) {
    container.innerHTML = '<p>Нет данных для отображения.</p>';
    return;
  }

  const fields = Object.keys(data[0]); // Получаем ключи первого объекта как поля таблицы
  const primaryKey = 'id';

  // --- ДОБАВЛЕНО: ПОЛЯ ПОИСКА (с сохранением значений) ---
  const searchControlsHTML = `
    <div class="table-search-controls" style="margin-bottom: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; display: flex; gap: 1rem; align-items: end;">
      <div class="form-group">
        <label for="tableSearchField">Поиск по столбцу:</label>
        <select id="tableSearchField" class="table-search-field-select" onchange="searchTableDataDebounced()">
          <option value="">(Все столбцы)</option>
          ${fields.map(field => `
            <option value="${field}" ${field === searchField ? 'selected' : ''}> <!-- Сохраняем выбранное поле -->
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
  // --- /ДОБАВЛЕНО ---

  let tableHTML = `
    ${searchControlsHTML} <!-- Вставляем контролы поиска перед таблицей -->
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
  // Эта функция будет вызываться через delay после последнего ввода
  const searchFieldSelect = document.getElementById('tableSearchField');
  const searchValueInput = document.getElementById('tableSearchValue');

  if (!searchFieldSelect || !searchValueInput) {
    console.error('Элементы поиска в таблице не найдены.');
    return;
  }

  const field = searchFieldSelect.value;
  const value = searchValueInput.value.trim();

  // Если оба поля пусты, загружаем все данные
  if (!field && !value) {
    loadTableData(); // <-- Вызов loadTableData() без параметров
    return;
  }

  // Если указано поле, но не указано значение - не ищем, очищаем результаты
  if (field && !value) {
    // Оставим таблицу пустой или покажем сообщение, что нужно ввести значение
    // Или можно не обновлять, если значение удаляется
    // Лучше всего - вызвать loadTableData без параметров, если поле выбрано, но значение стирается
    if (field) {
         loadTableData(); // Сбрасываем фильтр по полю, если значение убрано
    }
    return;
  }

  // Если указано значение, но не указано поле - ищем по всем полям (пока не реализовано на сервере для этого случая)
  // или выбираем первое доступное поле
  if (value && !field) {
    // Для простоты, покажем уведомление
    // showCustomNotification('Пожалуйста, выберите столбец для поиска.', 'info');
    // Вместо уведомления, можно искать по всем строкам, передав пустое поле, но сервер это не поддерживает.
    // Лучше уведомить.
    // Или, если сервер поддерживает, можно отправить ?searchValue=value, без searchField.
    // Проверим, поддерживает ли сервер это. В текущем серверном коде, если searchField нет, но searchValue есть, он игнорируется.
    // Чтобы сервер поддерживал поиск по всем полям, нужно его изменить. Пока оставим уведомление.
    showCustomNotification('Пожалуйста, выберите столбец для поиска.', 'info');
    return;
  }

  // Вызываем loadTableData с параметрами поиска
  loadTableData(field, value); // <-- Вызов loadTableData с параметрами
}, 500);


// --- /ОБНОВЛЁННАЯ ФУНКЦИЯ ---

// --- НОВАЯ ФУНКЦИЯ: Сброс поиска по таблице ---
function resetTableSearch() {
  document.getElementById('tableSearchField').value = '';
  document.getElementById('tableSearchValue').value = '';
  loadTableData(); // Перезагружаем без параметров поиска
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

  // Если оба поля пусты, загружаем все данные
  if (!field && !value) {
    loadTableData();
    return;
  }

  // Если указано поле, но не указано значение - ошибка
  if (field && !value) {
    showCustomNotification('Пожалуйста, введите значение для поиска.', 'info');
    return;
  }

  // Если указано значение, но не указано поле - ищем по всем полям (пока не реализовано на сервере для этого случая)
  // или выбираем первое доступное поле
  if (value && !field) {
    // Пример: если есть список полей для текущей таблицы, можно выбрать первое
    // Для простоты, покажем уведомление
    showCustomNotification('Пожалуйста, выберите столбец для поиска.', 'info');
    return;
  }

  // Загружаем данные с параметрами поиска
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

//Добавление новой записи
function addNewRecord() {
    alert('Функция добавления новой записи будет реализована позже. Требует формы ввода.');
}

//Сохранение всех изменений
function saveTableData() {
    alert('Функция сохранения всех изменений будет реализована позже. Требует логики сравнения и массового обновления.');
}

//Вкладка с аналитикой
async function loadAnalyticsData() {
    const token = localStorage.getItem('techAggregatorToken');
    try {
        //Загрузка основной статистики (предполагается, что есть такой маршрут)
        const statsRes = await fetch('http://localhost:3000/api/admin/analytics/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (statsRes.ok) {
            const stats = await statsRes.json();
            document.getElementById('dailyViews').textContent = stats.dailyViews || 0;
            document.getElementById('purchaseClicks').textContent = stats.purchaseClicks || 0;
            document.getElementById('serverLoad').textContent = `${stats.serverLoad || 0}%`;
            document.getElementById('responseTime').textContent = `${stats.responseTime || 0}ms`;
            if (stats.dailyViewsChange !== undefined) document.querySelector('#dailyViews ~ .stat-change').textContent = `${stats.dailyViewsChange > 0 ? '+' : ''}${stats.dailyViewsChange}%`;
            if (stats.purchaseClicksChange !== undefined) document.querySelector('#purchaseClicks ~ .stat-change').textContent = `${stats.purchaseClicksChange > 0 ? '+' : ''}${stats.purchaseClicksChange}%`;
            if (stats.serverLoadChange !== undefined) document.querySelector('#serverLoad ~ .stat-change').textContent = `${stats.serverLoadChange > 0 ? '+' : ''}${stats.serverLoadChange}%`;
            if (stats.responseTimeChange !== undefined) document.querySelector('#responseTime ~ .stat-change').textContent = `${stats.responseTimeChange > 0 ? '+' : ''}${stats.responseTimeChange}ms`;
        }

        //Загрузка популярных поисков (предполагается, что есть такой маршрут)
        const searchesRes = await fetch('http://localhost:3000/api/admin/analytics/popular-searches', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (searchesRes.ok) {
            const searches = await searchesRes.json();
            const searchesContainer = document.getElementById('popularSearches');
            if (searches.length > 0) {
                searchesContainer.innerHTML = searches.map(search => `<div>${search.term} (${search.count} раз)</div>`).join('');
            } else {
                searchesContainer.innerHTML = '<div>Нет данных</div>';
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки аналитики:', error);
        document.querySelectorAll('#analytics .stat-value').forEach(el => el.textContent = 'Err');
        document.getElementById('popularSearches').innerHTML = '<div>Ошибка загрузки</div>';
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
            <!-- Кнопка удаления убрана -->
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
document.getElementById('parseProductForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    //Получаем значения из формы
    const url = document.getElementById('parseUrl').value.trim();
    const category = document.getElementById('parseCategory').value;

    //Проверяем, заполнены ли обязательные поля
    if (!url) {
        showCustomNotification('Пожалуйста, введите URL товара', 'info');
        return;
    }
    if (!category) {
        showCustomNotification('Пожалуйста, выберите категорию', 'info');
        return;
    }

    const token = localStorage.getItem('techAggregatorToken');
    try {
        const response = await fetch('http://localhost:3000/api/admin/parse-product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                url: url,
                category: category 
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const result = await response.json();
        console.log('Результат парсинга:', result);

        //Отображение результатов
        displayParsedData(result.parsedData);

    } catch (error) {
        console.error('Ошибка парсинга:', error);
        showCustomNotification(`Ошибка парсинга: ${error.message}`, 'error');
    }
});


let currentManualCategory = ''; // <-- Добавлено для вкладки вручную

// --- КАРТА КАТЕГОРИЙ НА КЛЮЧИ ХАРАКТЕРИСТИК (для вкладки вручную) ---
const CATEGORY_TO_SPECS_MAP = {
    smartphones: [
        'screen_size',
        'screen_resolution',
        'screen_technology',
        'screen_refresh_rate',
        'cpu_brand',
        'cpu_model',
        'ram_size',
        'ram_type',
        'storage_capacity',
        'storage_type',
        'rear_camera_count',
        'rear_camera_primary_mp',
        'rear_camera_sensor_model',
        'rear_camera_sensor_size',
        'front_camera_mp',
        'battery_capacity_mah',
        'battery_type',
        'os',
        'os_version',
        'weight_g',
        'dimensions_mm',
        'sim_slots',
        'connectivity',
        's_pen',
        'water_resistance',
        'build_material',
        'fingerprint_scanner',
        'face_unlock'
    ],
    laptops: [
        'screen_type',
        'screen_aspect_ratio',
        'cpu_generation',
        'cpu_cores',
        'cpu_threads',
        'cpu_base_freq',
        'cpu_boost_freq',
        'gpu_model',
        'gpu_memory_mb',
        'gpu_brand',
        'ram_size',
        'ram_type',
        'ssd_type',
        'hdd_capacity_gb',
        'hdd_rpm',
        'storage_capacity',
        'storage_type',
        'keyboard_backlight',
        'keyboard_layout',
        'ports_usb_a',
        'ports_usb_c',
        'ports_hdmi',
        'ports_displayport',
        'battery_life_hours',
        'webcam_mp',
        'webcam_features',
        'audio_system',
        'audio_features',
        'security_features',
        'os',
        'weight_g',
        'dimensions_mm',
        'tpm',
        'touch_bar'
    ],
    tablets: [
        'screen_size',
        'screen_resolution',
        'screen_technology',
        'screen_surface_type',
        'screen_frontlight',
        'screen_frontlight_color',
        'screen_page_turn_buttons',
        'cpu_brand',
        'cpu_model',
        'ram_size',
        'ram_type',
        'storage_capacity',
        'storage_expandable',
        'storage_max_gb',
        'os',
        'os_version',
        'battery_capacity_mah',
        'battery_life_hours',
        'battery_charging_type',
        'battery_charging_speed',
        'rear_camera_primary_mp',
        'front_camera_mp',
        'weight_g',
        'dimensions_mm',
        'accessory_ports',
        'stylus_support',
        'stylus_included',
        'keyboard_support',
        'keyboard_included',
        'connectivity',
        'sim_slots'
    ],
    tv: [
        'diagonal_in',
        'screen_format',
        'hdr_support',
        'smart_platform',
        'sound_power_w',
        'sound_channels',
        'mount_type',
        'wall_mount_kit',
        'power_consumption_w',
        'power_standby_w',
        'screen_resolution',
        'screen_technology',
        'refresh_rate',
        'os',
        'weight_g',
        'dimensions_mm',
        'ports_hdmi',
        'ports_usb_a',
        'ports_usb_c'
    ],
    headphones: [
        'driver_size_mm',
        'driver_type',
        'impedance_ohms',
        'frequency_response_hz',
        'sensitivity_db',
        'microphone_frequency_response',
        'microphone_noise_reduction',
        'wireless_standard',
        'wireless_range_m',
        'charging_port',
        'charging_time_h',
        'anc_type',
        'anc_level',
        'controls_type',
        'controls_touch',
        'controls_voice',
        'foldable',
        'ear_pad_type',
        'ear_pad_material',
        'ear_pad_replaceable',
        'carry_case_included',
        'cable_length_m',
        'cable_connector',
        'battery_life_hours',
        'noise_cancel',
        'type'
    ],
    cameras: [
        'sensor_model',
        'sensor_size',
        'sensor_resolution_mp',
        'lens_mount',
        'lens_aperture',
        'lens_zoom',
        'image_stabilization',
        'video_resolution',
        'video_fps',
        'iso_range',
        'shutter_speed',
        'viewfinder_type',
        'viewfinder_magnification',
        'lcd_type',
        'lcd_size_in',
        'lcd_touch',
        'lcd_articulating',
        'rear_camera_primary_mp',
        'weight_g',
        'weight_kg',
        'dimensions_w_h_d_mm',
        'battery_life_shots',
        'battery_model',
        'flash_type',
        'flash_sync_speed',
        'ports',
        'fingerprint_reader'
    ],
    smartwatches: [
        'watch_band_material',
        'watch_band_width_mm',
        'watch_band_replacement',
        'health_monitoring',
        'sports_modes_count',
        'gps_type',
        'nfc_support',
        'lte_support',
        'sleep_tracking',
        'stress_monitoring',
        'spo2_monitoring',
        'ecg_support',
        'water_resistance_rating',
        'watch_face_customizable',
        'os',
        'battery_life_hours',
        'weight_g',
        'dimensions_mm',
        'connectivity'
    ],
    ebooks: [
        'screen_size',
        'screen_resolution',
        'screen_technology',
        'screen_surface_type',
        'screen_frontlight',
        'screen_frontlight_color',
        'screen_page_turn_buttons',
        'storage_capacity',
        'storage_available_gb',
        'file_formats_supported',
        'dictionary_included',
        'bookstore_integration',
        'battery_standby_days',
        'charging_method',
        'accessories_included',
        'weight_g',
        'dimensions_mm'
    ],
    drones: [
        'motor_type',
        'propeller_guard',
        'camera_specs',
        'camera_gimbal',
        'camera_recording_mode',
        'flight_modes',
        'obstacle_avoidance',
        'return_to_home',
        'follow_me_mode',
        'orbit_mode',
        'flight_time',
        'range',
        'remote_control_range',
        'remote_control_battery_life',
        'transmission_latency_ms',
        'wind_resistance_level',
        'indoor_outdoor_use',
        'weight_g',
        'dimensions_mm'
    ]
    // ... добавьте другие категории по мере необходимости, используя ключи из specKeyTranslations ...
};
// --- /КАРТА ---

// --- ФУНКЦИИ ДЛЯ ВКЛАДКИ "ДОБАВЛЕНИЕ ВРУЧНУЮ" ---

// Обновление полей спецификаций при выборе категории
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
        const displayName = window.specKeyTranslations?.ru?.[specKey] || specKey;

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

// Добавление блока для новой цены и ссылки
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

// Удаление блока цены и ссылки
function removeManualPriceEntry(index) {
  const entryDiv = document.getElementById(`priceEntry_${index}`);
  if (entryDiv) {
    entryDiv.remove();
  }
}

// Сброс формы вручную
function resetManualAddForm() {
  document.getElementById('manualAddForm').reset();
  document.getElementById('manualSpecFieldsContainer').innerHTML = '<p class="placeholder-text">Выберите категорию, чтобы увидеть доступные поля для характеристик.</p>';
  document.getElementById('manualPricesList').innerHTML = '';
  currentManualCategory = '';
  console.log('Форма "Добавление вручную" сброшена.');
}

// Отправка формы вручную
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

// --- /ФУНКЦИИ ДЛЯ ВКЛАДКИ "ДОБАВЛЕНИЕ ВРУЧНУЮ" ---

// --- ФУНКЦИИ ДЛЯ ВКЛАДКИ "ПАРСИНГ" (обновлена) ---

// Сброс формы парсинга
function resetParseForm() {
  document.getElementById('parseProductForm').reset();
  document.getElementById('parseResult').style.display = 'none';
  console.log('Форма "Парсинг" сброшена.');
}

// Отправка формы парсинга
document.getElementById('parseProductForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  console.log('Отправка формы "Парсинг"...');

  const url = document.getElementById('parseUrl').value.trim();
  const category = document.getElementById('parseCategory').value;
  const proxy = document.getElementById('parseProxy').value.trim(); // <-- Новое поле

  if (!url || !category) {
    showCustomNotification('Пожалуйста, заполните все обязательные поля формы', 'info');
    return;
  }

  const requestData = { url, category }; // <-- Начинаем формировать тело
  if (proxy) requestData.proxy = proxy; // <-- Добавляем proxy, если есть

  const token = localStorage.getItem('techAggregatorToken');
  try {
    const response = await fetch('http://localhost:3000/api/admin/parse-product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData) // <-- Отправляем обновлённое тело
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('Результат парсинга:', result);

    // Отображение результата (пример, адаптируйте под ваш дизайн)
    const resultContainer = document.getElementById('parseResult');
    if (result.parsedData) {
      const data = result.parsedData;
      resultContainer.innerHTML = `
          <h4>Результаты парсинга:</h4>
          <p><strong>Источник:</strong> ${data.source || 'Неизвестен'}</p>
          <p><strong>Название:</strong> ${data.name || 'Не указано'}</p>
          <p><strong>Цена:</strong> ${data.price ? data.price + ' ₽' : 'Не указана'}</p>
          <p><strong>URL источника:</strong> <a href="${data.sourceUrl}" target="_blank">${data.sourceUrl}</a></p>
          ${data.imageUrl ? `<p><strong>Изображение:</strong> <img src="${data.imageUrl}" alt="Изображение товара" style="max-width: 300px;"></p>` : '<p><em>Изображение не найдено или не извлечено.</em></p>'}
          ${Object.keys(data.specs).length > 0 ? `
          <h5>Характеристики:</h5>
          <ul>
            ${Object.entries(data.specs).map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`).join('')}
          </ul>` : '<p><em>Характеристики не найдены или не извлечены.</em></p>'}
          <p><em>Данные НЕ сохранены в БД. Используйте вкладку "Добавление вручную" для сохранения.</em></p>
      `;
    } else {
      resultContainer.innerHTML = '<p>Данные не получены.</p>';
    }
    resultContainer.style.display = 'block';

  } catch (error) {
    console.error('Ошибка парсинга:', error);
    const resultContainer = document.getElementById('parseResult');
    resultContainer.innerHTML = `<p class="error-message">Ошибка: ${error.message}</p>`;
    resultContainer.style.display = 'block';
  }
});

// --- /ФУНКЦИИ ДЛЯ ВКЛАДКИ "ПАРСИНГ" ---

// --- ОБНОВЛЁННАЯ ФУНКЦИЯ ОТКРЫТИЯ ВКЛАДКИ ---
function openAdminTab(tabName) {
    document.querySelectorAll('.admin-tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    // Обновим активные кнопки
    event.target.classList.add('active');

    // Загрузка данных для вкладки при её открытии
    if (tabName === 'moderation') {
        loadModerationData(currentModerationTab);
    } else if (tabName === 'editor') {
        loadTableList();
    } else if (tabName === 'analytics') {
        loadAnalyticsData();
    } else if (tabName === 'users') {
        loadUsersTable();
    }
    // Для 'parser' и 'manualAdd' ничего загружать не нужно, только открыть форму
}



//по истории цен на админ панели
async function loadAllProductsForPriceHistory() {
    const selectElement = document.getElementById('priceHistoryProductSelect');
    selectElement.innerHTML = '<option value="">-- Загрузка товаров... --</option>';

    const token = localStorage.getItem('techAggregatorToken');
    try {
        const response = await fetch('http://localhost:3000/api/admin/products', { // Предполагаемый маршрут для получения всех продуктов
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

// Загрузка истории цен для выбранного товара
async function loadPriceHistoryForProduct() {
    const selectElement = document.getElementById('priceHistoryProductSelect');
    const productId = parseInt(selectElement.value, 10);

    if (!productId) {
        // Если выбрана пустая опция, скрываем форму и список
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
                window.location.href = 'auth.html';
                return;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const historyEntries = await response.json();
        console.log('Загружена история цен:', historyEntries);

        currentPriceHistoryEntries = [...historyEntries]; // Сохраняем копию

        // Показываем форму добавления
        document.getElementById('priceHistoryFormContainer').style.display = 'block';
        // Показываем список
        document.getElementById('priceHistoryListContainer').style.display = 'block';
        // Отрисовываем список
        renderPriceHistoryList(historyEntries);

    } catch (error) {
        console.error('Ошибка загрузки истории цен:', error);
        document.getElementById('priceHistoryList').innerHTML = `<p class="error-message">Ошибка: ${error.message}</p>`;
        showCustomNotification(`Ошибка загрузки истории цен: ${error.message}`, 'error');
    }
}

// Отрисовка списка истории цен
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

// Обработчик отправки формы добавления
document.getElementById('addPriceHistoryForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!currentPriceHistoryProduct) {
        showCustomNotification('Пожалуйста, сначала выберите товар.', 'info');
        return;
    }

    const storeName = document.getElementById('addStoreName').value.trim();
    const price = parseFloat(document.getElementById('addPrice').value);
    const date = document.getElementById('addDate').value;

    if (!storeName || isNaN(price) || price < 0 || !date) {
        showCustomNotification('Пожалуйста, заполните все поля формы корректно.', 'info');
        return;
    }

    const token = localStorage.getItem('techAggregatorToken');
    try {
        const response = await fetch('http://localhost:3000/api/admin/price-history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                productId: currentPriceHistoryProduct,
                storeName: storeName,
                price: price,
                date: date
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
            const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const result = await response.json();
        console.log('Новая запись истории цен добавлена:', result);

        showCustomNotification('Запись истории цен добавлена.', 'success');
        // Сбросим форму
        resetPriceHistoryForm();
        // Перезагрузим историю для текущего товара
        loadPriceHistoryForProduct();

    } catch (error) {
        console.error('Ошибка добавления записи истории цен:', error);
        showCustomNotification(`Ошибка добавления: ${error.message}`, 'error');
    }
});

// Сброс формы добавления
function resetPriceHistoryForm() {
    document.getElementById('addPriceHistoryForm').reset();
}

// Функция редактирования (заглушка, требует реализации формы редактирования)
function editPriceHistoryEntry(entryId) {
    // Найти запись
    const entry = currentPriceHistoryEntries.find(e => e.id === entryId);
    if (!entry) {
        showCustomNotification('Запись не найдена.', 'error');
        return;
    }

    // Здесь должна быть логика для отображения формы редактирования
    // и последующего PUT запроса
    alert(`Редактирование записи ID ${entryId}:\nМагазин: ${entry.storeName}\nЦена: ${entry.price}\nДата: ${entry.date}`);
    // Пока что просто покажем алерт
}

// Функция удаления
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
                window.location.href = 'auth.html';
                return;
            }
            const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const result = await response.json();
        console.log(result.message);

        showCustomNotification(result.message, 'success');
        // Обновим список
        loadPriceHistoryForProduct(); // Перезагружаем для текущего товара

    } catch (error) {
        console.error('Ошибка удаления записи истории цен:', error);
        showCustomNotification(`Ошибка удаления: ${error.message}`, 'error');
    }
}


//Рекоммендации
function initializeRecommendationsPage() {
  // Загружаем рекомендации для всех вкладок
  loadRecommendationsByType('popular');
  loadRecommendationsByType('trending');
  loadRecommendationsByType('bestValue');
  // Загружаем персонализированные рекомендации
  loadPersonalRecommendations();
}


async function loadRecommendationsByType(type) {
  const gridIdMap = {
    'popular': 'popularProducts',
    'trending': 'trendingProducts',
    'bestValue': 'bestValueProducts',
    'personal': 'personalProducts' // Предположим, у вас есть контейнер #personalProducts
  };

  const gridId = gridIdMap[type];
  if (!gridId) {
    console.error(`loadRecommendationsByType: Неизвестный тип рекомендаций: ${type}`);
    return;
  }

  const grid = document.getElementById(gridId);
  if (!grid) {
    console.error(`loadRecommendationsByType: Контейнер #${gridId} не найден.`);
    return;
  }

  grid.innerHTML = '<p>Загрузка...</p>'; // Показываем заглушку

  const token = localStorage.getItem('techAggregatorToken');
  if (!token) {
    showCustomNotification('Требуется авторизация для загрузки рекомендаций.', 'warning');
    grid.innerHTML = '<p>Требуется авторизация.</p>';
    return;
  }

  try {
    let endpoint = '';
    switch (type) {
      case 'popular':
        endpoint = 'http://localhost:3000/api/recommendations/popular';
        break;
      case 'trending':
        endpoint = 'http://localhost:3000/api/recommendations/trending';
        break;
      case 'bestValue':
        endpoint = 'http://localhost:3000/api/recommendations/best-value';
        break;
      case 'personal':
        // endpoint = 'http://localhost:3000/api/recommendations/personal'; // Вызывается отдельно
        return;
      default:
        throw new Error(`Неизвестный тип: ${type}`);
    }

    const response = await fetch(endpoint, {
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
    console.log(`Загружены ${type} рекомендации:`, products);

    // Отрисовываем продукты в соответствующий контейнер
    displayEnhancedProducts(gridId, products, type);

  } catch (error) {
    console.error(`Ошибка загрузки ${type} рекомендаций:`, error);
    grid.innerHTML = `<p class="error-message">Ошибка: ${error.message}</p>`;
  }
}
// --- /ФУНКЦИЯ ЗАГРУЗКИ ---

// --- ФУНКЦИЯ ЗАГРУЗКИ ПЕРСОНАЛЬНЫХ РЕКОМЕНДАЦИЙ ---
async function loadPersonalRecommendations() {
  const gridId = 'personalProducts'; // Убедитесь, что контейнер существует в HTML
  const grid = document.getElementById(gridId);
  if (!grid) {
    console.error(`loadPersonalRecommendations: Контейнер #${gridId} не найден.`);
    return;
  }

  grid.innerHTML = '<p>Загрузка персональных рекомендаций...</p>';

  const token = localStorage.getItem('techAggregatorToken');
  if (!token) {
    showCustomNotification('Требуется авторизация для загрузки персональных рекомендаций.', 'warning');
    grid.innerHTML = '<p>Требуется авторизация.</p>';
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/recommendations/personal', {
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
    console.log('Загружены персональные рекомендации:', products);

    // Отрисовываем продукты в соответствующий контейнер
    displayEnhancedProducts(gridId, products, 'personal');

  } catch (error) {
    console.error('Ошибка загрузки персональных рекомендаций:', error);
    grid.innerHTML = `<p class="error-message">Ошибка: ${error.message}</p>`;
  }
}
// --- /ФУНКЦИЯ ПЕРСОНАЛЬНЫХ РЕКОМЕНДАЦИЙ ---

// --- ОБНОВЛЁННАЯ ФУНКЦИЯ ОТРИСОВКИ РЕКОМЕНДАЦИЙ ---
// displayEnhancedProducts - Отображение товаров в контейнере с расширенной информацией
function displayEnhancedProducts(gridId, products, type) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = products.map(product => {
    const matchScore = calculateMatchScore(product, type);
    const badgeText = getRecommendationBadge(product, type);
    const trendIndicator = getTrendIndicator(product, type); // Если используется
    // --- ИСПРАВЛЕНО: Добавлен onclick для всей карточки ---
    return `
      <div class="product-card product-card-enhanced" onclick="openProduct(${product.id})"> <!-- <-- ДОБАВЛЕНО -->
        ${badgeText ? `<div class="recommendation-badge">${badgeText}</div>` : ''}
        <img src="${product.image || product.imageUrl || 'https://via.placeholder.com/300?text=Нет+изображения'}" alt="${product.name}"
             style="width: 100%; height: 200px; object-fit: contain; background: #f8f9fa; border-radius: 8px;">
        <h3>${product.name}</h3>
        <div class="product-rating">
          <span class="rating-stars">${getStarRating(product.rating)}</span>
          <span class="rating-value">${product.rating}</span>
          ${trendIndicator}
        </div>
        <div class="product-price">${formatPrice(getMinPrice(product))} ₽</div>
        ${type === 'popular' ? `
        <div class="popularity-meter">
          <span style="font-size: 0.9rem; color: #6b7280;">Популярность:</span>
          <div class="meter-bar">
            <div class="meter-fill" style="width: ${Math.random() * 70 + 30}%"></div>
          </div>
        </div>
        ` : ''}
        ${matchScore > 0 ? `<div class="match-percentage">Совпадение: ${Math.round(matchScore)}%</div>` : ''}
        <div class="product-actions" style="margin-top: 1rem;">
          <button class="btn btn-outline" onclick="event.stopPropagation(); addToComparison(${product.id})"> <!-- <-- event.stopPropagation() -->
            Сравнить
          </button>
          <button class="btn btn-primary" onclick="event.stopPropagation(); openProduct(${product.id})"> <!-- <-- event.stopPropagation() -->
            Подробнее
          </button>
        </div>
      </div>
    `;
    // --- /ИСПРАВЛЕНО ---
  }).join('');
}
// --- /ОБНОВЛЁННАЯ ФУНКЦИЯ ОТРИСОВКИ ---

// --- ФУНКЦИЯ РАСЧЁТА СОВПАДЕНИЯ ---
function calculateMatchScore(product, type) {
  // Пример расчёта совпадения для bestValue или personal
  switch (type) {
    case 'bestValue':
      // Используем valueScore, рассчитанный на сервере
      return Math.min(Math.max(product.valueScore || 0, 0), 100);
    case 'personal':
      // Используем similarityScore, рассчитанный на сервере, или просто высокий рейтинг
      // или совпадение по категории с избранным/сравнением
      let score = product.rating * 20; // Базовый счёт за рейтинг
      // Проверим, находится ли товар в избранном или сравнении у пользователя (из localStorage или из данных, полученных с сервера)
      // Для простоты, используем localStorage, как в loadFavorites
      const favIds = JSON.parse(localStorage.getItem('techAggregatorFavorites') || '[]').map(f => f.id);
      const compIds = JSON.parse(localStorage.getItem('techAggregatorComparisons') || '[]').map(c => c.id); // Предположим, что есть такая переменная

      if (favIds.includes(product.id)) score += 30;
      if (compIds.includes(product.id)) score += 20;

      // Если у товара есть similarityScore (из calculateSimilarity на сервере)
      if (product.similarityScore !== undefined) {
        score += (product.similarityScore * 50);
      }

      return Math.min(Math.max(score, 0), 100);
    default:
      return 0; // Для популярных/трендов, совпадение не считается
  }
}
// --- /ФУНКЦИЯ РАСЧЁТА ---

// --- ФУНКЦИЯ ПОЛУЧЕНИЯ БЕЙДЖА ---
function getRecommendationBadge(product, type) {
  switch (type) {
    case 'popular':
      // Пример: бейдж на основе рейтинга
      if (product.rating >= 4.8) return '🔥 Топ-популярный';
      if (product.rating >= 4.5) return '🔥 Популярный';
      return '';
    case 'trending':
      // Пример: бейдж на основе новизны или роста рейтинга
      // const daysSinceCreated = (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      // if (daysSinceCreated < 7) return '🆕 Новинка';
      return '📈 Тренд';
    case 'bestValue':
      // Бейдж на основе valueScore
      if ((product.valueScore || 0) > 8) return '💰 Выгода';
      return '';
    case 'personal':
      // Бейдж для персональных
      return '🎯 Для вас';
    default:
      return '';
  }
}
// --- /ФУНКЦИЯ БЕЙДЖА ---

// --- ФУНКЦИЯ ИНДИКАТОРА ТРЕНДА ---
function getTrendIndicator(product, type) {
  // Пример простого индикатора, если это трендовый товар
  if (type === 'trending') {
    // Можно использовать дату создания или другие метрики
    const date = new Date(product.createdAt);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    // Просто для демонстрации, используем случайный индикатор
    const trend = Math.random() > 0.5 ? 'up' : 'down';
    const percent = (Math.random() * 15 + 5).toFixed(1);
    return trend === 'up'
      ? `<span class="trend-indicator trend-up">↗ +${percent}%</span>`
      : `<span class="trend-indicator trend-down">↘ -${percent}%</span>`;
  }
  return '';
}
// --- /ФУНКЦИЯ ИНДИКАТОРА ---

// --- ОБНОВЛЁННАЯ ФУНКЦИЯ ОТКРЫТИЯ ВКЛАДКИ ---
// openTab - Открытие вкладки на странице рекомендаций
function openTab(tabName) {
  // Скрываем все вкладки
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  // Убираем активный класс со всех кнопок
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  // Показываем выбранную вкладку
  document.getElementById(tabName).classList.add('active');
  // Активируем соответствующую кнопку
  event.target.classList.add('active');
}