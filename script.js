//Глобальные переменные
let currentUser = null;
let comparisonList = [];
let favorites = [];
let currentFilters = {};
let selectedCheckboxes = {};

//Товары
const demoProducts = [

    {
        id: 1,
        name: "iPhone 15 Pro",
        category: "smartphones",
        price: 99990,
        rating: 4.8,
        image: "sources/iphone15pro.png",
        brand: "Apple",
        specs: {
            "Экран": "6.1'' Super Retina XDR",
            "Процессор": "A17 Pro",
            "Память": "128GB",
            "ОЗУ": "8GB",
            "Камера": "48MP + 12MP + 12MP",
            "Батарея": "3274 mAh",
            "Операционная система": "iOS 17",
            "Вес": "187г"
        },
        prices: [
  { store: "DNS", price: 99990, url: "https://dns-shop.ru/product/iphone-15-pro" },
  { store: "MVideo", price: 101990, url: "https://www.mvideo.ru/product/iphone-15-pro" },
  { store: "Citilink", price: 97990, url: "https://citilink.ru/iphone-15-pro" },
  { store: "OZON", price: 98990, url: "https://ozon.ru/product/iphone-15-pro" },
  { store: "Aliexpress", price: 92000, url: "https://aliexpress.com/item/iphone-15-pro" }
]
    },
    {
        id: 2,
        name: "Samsung Galaxy S24 Ultra",
        category: "smartphones",
        price: 129990,
        rating: 4.7,
        image: "sources/s24ultra.jpg",
        brand: "Samsung",
        specs: {
            "Экран": "6.8'' Dynamic AMOLED",
            "Процессор": "Snapdragon 8 Gen 3",
            "Память": "512GB",
            "ОЗУ": "12GB",
            "Камера": "200MP + 50MP + 12MP + 10MP",
            "Батарея": "5000 mAh",
            "Операционная система": "Android 14",
            "Вес": "232г",
            "S Pen": "Да"
        },
        prices: [
  { store: "DNS", price: 129990, url: "https://dns-shop.ru/product/s24-ultra" },
  { store: "MVideo", price: 131990, url: "https://www.mvideo.ru/product/s24-ultra" },
  { store: "OZON", price: 128990, url: "https://ozon.ru/product/s24-ultra" },
  { store: "Aliexpress", price: 120000, url: "https://aliexpress.com/item/s24-ultra" }
]
    },
    {
        id: 3,
        name: "Xiaomi 13 Pro",
        category: "smartphones",
        price: 64990,
        rating: 4.4,
        image: "https://via.placeholder.com/300x300?text=Xiaomi+13+Pro",
        brand: "Xiaomi",
        specs: {
            "Экран": "6.73'' AMOLED",
            "Процессор": "Snapdragon 8 Gen 2",
            "Память": "256GB",
            "ОЗУ": "12GB",
            "Камера": "50MP + 50MP + 50MP",
            "Батарея": "4820 mAh",
            "Операционная система": "Android 13",
            "Вес": "210г"
        },
        prices: [
            { store: "Citilink", price: 64990, url: "https://citilink.ru/xiaomi-13-pro" },
            { store: "DNS", price: 65990, url: "https://dns-shop.ru/product/xiaomi-13-pro" }
        ]
    },
    {
        id: 4,
        name: "Google Pixel 8 Pro",
        category: "smartphones",
        price: 84990,
        rating: 4.6,
        image: "sources/pixel8pro.jpg",
        brand: "Google",
        specs: {
            "Экран": "6.7'' OLED",
            "Процессор": "Tensor G3",
            "Память": "256GB",
            "ОЗУ": "12GB",
            "Камера": "50MP + 48MP + 48MP",
            "Батарея": "5050 mAh",
            "Операционная система": "Android 14",
            "Вес": "213г",
            "Особенность": "ИИ камера"
        },
        prices: [
            { store: "DNS", price: 84990, url: "https://dns-shop.ru/product/pixel-8-pro" },
            { store: "Citilink", price: 83990, url: "https://citilink.ru/pixel-8-pro" }
        ]
    },
    {
        id: 5,
        name: "OnePlus 11",
        category: "smartphones",
        price: 59990,
        rating: 4.5,
        image: "https://via.placeholder.com/300x300?text=OnePlus+11",
        brand: "OnePlus",
        specs: {
            "Экран": "6.7'' AMOLED",
            "Процессор": "Snapdragon 8 Gen 2",
            "Память": "256GB",
            "ОЗУ": "16GB",
            "Камера": "50MP + 48MP + 32MP",
            "Батарея": "5000 mAh",
            "Операционная система": "Android 13",
            "Вес": "205г",
            "Зарядка": "100W"
        },
        prices: [
            { store: "MVideo", price: 59990, url: "https://www.mvideo.ru/product/oneplus-11" },
            { store: "DNS", price: 58990, url: "https://dns-shop.ru/product/oneplus-11" }
        ]
    },
    {
        id: 6,
        name: "MacBook Pro 14 M3",
        category: "laptops",
        price: 189990,
        rating: 4.9,
        image: "https://via.placeholder.com/300x300?text=MacBook+Pro+14+M3",
        brand: "Apple",
        specs: {
            "Экран": "14.2'' Liquid Retina XDR",
            "Процессор": "Apple M3 Pro",
            "Накопитель": "512GB SSD",
            "ОЗУ": "18GB",
            "Видеокарта": "18-core GPU",
            "Батарея": "до 18 часов",
            "Вес": "1.6кг",
            "Порты": "3x Thunderbolt 4, HDMI, SDXC"
        },
        prices: [
            { store: "DNS", price: 189990, url: "https://dns-shop.ru/product/macbook-pro-14-m3" },
            { store: "Citilink", price: 187990, url: "https://citilink.ru/macbook-pro-14-m3" },
            { store: "MVideo", price: 191990, url: "https://www.mvideo.ru/product/macbook-pro-14-m3" }
        ]
    },
    {
        id: 7,
        name: "ASUS ROG Zephyrus G14",
        category: "laptops",
        price: 149990,
        rating: 4.7,
        image: "https://via.placeholder.com/300x300?text=ROG+Zephyrus+G14",
        brand: "ASUS",
        specs: {
            "Экран": "14'' QHD 165Hz",
            "Процессор": "AMD Ryzen 9 7940HS",
            "Видеокарта": "NVIDIA RTX 4060",
            "Накопитель": "1TB SSD",
            "ОЗУ": "32GB",
            "Операционная система": "Windows 11",
            "Вес": "1.7кг",
            "Подсветка": "RGB AniMe Matrix"
        },
        prices: [
            { store: "DNS", price: 149990, url: "https://dns-shop.ru/product/rog-zephyrus-g14" },
            { store: "Citilink", price: 147990, url: "https://citilink.ru/rog-zephyrus-g14" }
        ]
    },
    {
        id: 8,
        name: "Lenovo Legion 5 Pro",
        category: "laptops",
        price: 129990,
        rating: 4.6,
        image: "https://via.placeholder.com/300x300?text=Legion+5+Pro",
        brand: "Lenovo",
        specs: {
            "Экран": "16'' WQXGA 165Hz",
            "Процессор": "Intel Core i7-13700HX",
            "Видеокарта": "NVIDIA RTX 4070",
            "Накопитель": "1TB SSD",
            "ОЗУ": "32GB",
            "Операционная система": "Windows 11",
            "Вес": "2.5кг",
            "Охлаждение": "Legion Coldfront 5.0"
        },
        prices: [
            { store: "MVideo", price: 129990, url: "https://www.mvideo.ru/product/legion-5-pro" },
            { store: "DNS", price: 127990, url: "https://dns-shop.ru/product/legion-5-pro" }
        ]
    },
    {
        id: 9,
        name: "Dell XPS 13 Plus",
        category: "laptops",
        price: 159990,
        rating: 4.8,
        image: "https://via.placeholder.com/300x300?text=XPS+13+Plus",
        brand: "Dell",
        specs: {
            "Экран": "13.4'' OLED 3.5K",
            "Процессор": "Intel Core i7-1360P",
            "Накопитель": "1TB SSD",
            "ОЗУ": "32GB",
            "Операционная система": "Windows 11",
            "Вес": "1.26кг",
            "Батарея": "55Whr",
            "Особенность": "Сенсорная панель"
        },
        prices: [
            { store: "DNS", price: 159990, url: "https://dns-shop.ru/product/xps-13-plus" },
            { store: "Citilink", price: 157990, url: "https://citilink.ru/xps-13-plus" }
        ]
    },
    {
        id: 10,
        name: "Sony WH-1000XM5",
        category: "headphones",
        price: 34990,
        rating: 4.8,
        image: "https://via.placeholder.com/300x300?text=WH-1000XM5",
        brand: "Sony",
        specs: {
            "Тип": "Накладные беспроводные",
            "Шумоподавление": "Адаптивное",
            "Автономность": "30 часов",
            "Bluetooth": "5.2",
            "Вес": "250г",
            "Микрофоны": "8 шумоподавляющих",
            "Кодек": "LDAC, AAC, SBC",
            "Складывание": "Да"
        },
        prices: [
            { store: "DNS", price: 34990, url: "https://dns-shop.ru/product/wh-1000xm5" },
            { store: "MVideo", price: 35990, url: "https://www.mvideo.ru/product/wh-1000xm5" },
            { store: "Citilink", price: 33990, url: "https://citilink.ru/wh-1000xm5" }
        ]
    },
    {
        id: 11,
        name: "Apple AirPods Pro 2",
        category: "headphones",
        price: 24990,
        rating: 4.7,
        image: "https://via.placeholder.com/300x300?text=AirPods+Pro+2",
        brand: "Apple",
        specs: {
            "Тип": "TWS (True Wireless)",
            "Шумоподавление": "Активное",
            "Автономность": "6 часов (30 с кейсом)",
            "Bluetooth": "5.3",
            "Вес": "5.3г (один наушник)",
            "Особенность": "Пространственный звук",
            "Совместимость": "iOS, Android",
            "Защита": "IPX4"
        },
        prices: [
            { store: "DNS", price: 24990, url: "https://dns-shop.ru/product/airpods-pro-2" },
            { store: "MVideo", price: 25990, url: "https://www.mvideo.ru/product/airpods-pro-2" }
        ]
    },
    {
        id: 12,
        name: "Samsung Galaxy Buds2 Pro",
        category: "headphones",
        price: 14990,
        rating: 4.5,
        image: "https://via.placeholder.com/300x300?text=Galaxy+Buds2+Pro",
        brand: "Samsung",
        specs: {
            "Тип": "TWS",
            "Шумоподавление": "Интеллектуальное",
            "Автономность": "8 часов (29 с кейсом)",
            "Bluetooth": "5.3",
            "Вес": "5.5г",
            "Кодек": "24-bit Hi-Fi",
            "Защита": "IPX7",
            "Особенность": "360 Audio"
        },
        prices: [
            { store: "DNS", price: 14990, url: "https://dns-shop.ru/product/galaxy-buds2-pro" },
            { store: "Citilink", price: 14490, url: "https://citilink.ru/galaxy-buds2-pro" }
        ]
    },
    {
        id: 13,
        name: "Samsung QLED Q80C 65",
        category: "tv",
        price: 99990,
        rating: 4.6,
        image: "https://via.placeholder.com/300x300?text=QLED+Q80C+65",
        brand: "Samsung",
        specs: {
            "Диагональ": "65''",
            "Разрешение": "4K UHD",
            "Технология": "QLED",
            "Частота": "120Hz",
            "Smart TV": "Tizen",
            "HDR": "HDR10+, HLG",
            "Звук": "40W, Object Tracking Sound",
            "Порты": "4x HDMI 2.1, 3x USB"
        },
        prices: [
            { store: "DNS", price: 99990, url: "https://dns-shop.ru/product/qled-q80c-65" },
            { store: "MVideo", price: 101990, url: "https://www.mvideo.ru/product/qled-q80c-65" }
        ]
    },
    {
        id: 14,
        name: "LG OLED C3 55",
        category: "tv",
        price: 119990,
        rating: 4.9,
        image: "https://via.placeholder.com/300x300?text=OLED+C3+55",
        brand: "LG",
        specs: {
            "Диагональ": "55''",
            "Разрешение": "4K UHD",
            "Технология": "OLED evo",
            "Частота": "120Hz",
            "Smart TV": "webOS 23",
            "HDR": "Dolby Vision, HDR10",
            "Игровой режим": "NVIDIA G-Sync, AMD FreeSync",
            "Процессор": "α9 Gen6 AI Processor"
        },
        prices: [
            { store: "MVideo", price: 119990, url: "https://www.mvideo.ru/product/oled-c3-55" },
            { store: "DNS", price: 117990, url: "https://dns-shop.ru/product/oled-c3-55" }
        ]
    },
    {
        id: 15,
        name: "Sony Bravia XR A80L 65",
        category: "tv",
        price: 149990,
        rating: 4.8,
        image: "https://via.placeholder.com/300x300?text=Bravia+XR+A80L",
        brand: "Sony",
        specs: {
            "Диагональ": "65''",
            "Разрешение": "4K UHD",
            "Технология": "OLED",
            "Процессор": "Cognitive Processor XR",
            "Smart TV": "Google TV",
            "Звук": "Acoustic Surface Audio+",
            "HDR": "Dolby Vision, IMAX Enhanced",
            "Игровой режим": "Auto HDR, ALLM"
        },
        prices: [
            { store: "DNS", price: 149990, url: "https://dns-shop.ru/product/bravia-xr-a80l" },
            { store: "Citilink", price: 147990, url: "https://citilink.ru/bravia-xr-a80l" }
        ]
    },
    {
        id: 16,
        name: "GoPro HERO12 Black",
        category: "cameras",
        price: 34990,
        rating: 4.6,
        image: "https://via.placeholder.com/300x300?text=HERO12+Black",
        brand: "GoPro",
        specs: {
            "Тип": "Экшн-камера",
            "Разрешение видео": "5.3K 60fps",
            "Фото": "27MP",
            "Стабилизация": "HyperSmooth 6.0",
            "Водонепроницаемость": "10м без бокса",
            "Батарея": "Enduro",
            "Экран": "2.27'' сенсорный + 1.4''",
            "Особенность": "HDR фото/видео"
        },
        prices: [
            { store: "DNS", price: 34990, url: "https://dns-shop.ru/product/hero12-black" },
            { store: "MVideo", price: 35990, url: "https://www.mvideo.ru/product/hero12-black" }
        ]
    },
    {
        id: 17,
        name: "DJI Mini 4 Pro",
        category: "drones",
        price: 89990,
        rating: 4.8,
        image: "https://via.placeholder.com/300x300?text=Mini+4+Pro",
        brand: "DJI",
        specs: {
            "Вес": "249г",
            "Камера": "1/1.3'' 48MP",
            "Видео": "4K 100fps",
            "Дальность": "20км",
            "Время полета": "34 минуты",
            "Стабилизация": "3-осевой подвес",
            "Особенности": "360° препятствия, ActiveTrack",
            "Трансмиссия": "O4"
        },
        prices: [
            { store: "DNS", price: 89990, url: "https://dns-shop.ru/product/mini-4-pro" },
            { store: "Citilink", price: 87990, url: "https://citilink.ru/mini-4-pro" }
        ]
    },
    {
        id: 18,
        name: "Apple iPad Air M1",
        category: "tablets",
        price: 64990,
        rating: 4.7,
        image: "https://via.placeholder.com/300x300?text=iPad+Air+M1",
        brand: "Apple",
        specs: {
            "Диагональ": "10.9'' Liquid Retina",
            "Процессор": "Apple M1",
            "Память": "256GB",
            "ОЗУ": "8GB",
            "Камера": "12MP",
            "Батарея": "до 10 часов",
            "Стилус": "Apple Pencil 2",
            "Операционная система": "iPadOS 17"
        },
        prices: [
            { store: "DNS", price: 64990, url: "https://dns-shop.ru/product/ipad-air-m1" },
            { store: "MVideo", price: 65990, url: "https://www.mvideo.ru/product/ipad-air-m1" }
        ]
    },
    {
        id: 19,
        name: "Samsung Galaxy Tab S9 Ultra",
        category: "tablets",
        price: 119990,
        rating: 4.8,
        image: "https://via.placeholder.com/300x300?text=Tab+S9+Ultra",
        brand: "Samsung",
        specs: {
            "Диагональ": "14.6'' Dynamic AMOLED",
            "Процессор": "Snapdragon 8 Gen 2",
            "Память": "512GB",
            "ОЗУ": "12GB",
            "Батарея": "11200 mAh",
            "Стилус": "S Pen (в комплекте)",
            "Защита": "IP68",
            "Особенность": "Книжная обложка с трекпадом"
        },
        prices: [
            { store: "DNS", price: 119990, url: "https://dns-shop.ru/product/tab-s9-ultra" },
            { store: "Citilink", price: 117990, url: "https://citilink.ru/tab-s9-ultra" }
        ]
    },
    {
        id: 20,
        name: "Xiaomi Pad 6",
        category: "tablets",
        price: 29990,
        rating: 4.4,
        image: "https://via.placeholder.com/300x300?text=Pad+6",
        brand: "Xiaomi",
        specs: {
            "Диагональ": "11'' IPS 144Hz",
            "Процессор": "Snapdragon 870",
            "Память": "256GB",
            "ОЗУ": "8GB",
            "Батарея": "8840 mAh",
            "Зарядка": "33W",
            "Аксессуары": "Клавиатура, стилус",
            "Операционная система": "MIUI Pad 14"
        },
        prices: [
            { store: "Citilink", price: 29990, url: "https://citilink.ru/pad-6" },
            { store: "DNS", price: 30990, url: "https://dns-shop.ru/product/pad-6" }
        ]
    },

    {
        id: 21,
        name: "Nothing Phone (2)",
        category: "smartphones",
        price: 44990,
        rating: 4.3,
        image: "https://via.placeholder.com/300x300?text=Nothing+Phone+2",
        brand: "Nothing",
        specs: {
            "Экран": "6.7'' LTPO OLED",
            "Процессор": "Snapdragon 8+ Gen 1",
            "Память": "256GB",
            "ОЗУ": "12GB",
            "Камера": "50MP + 50MP",
            "Батарея": "4700 mAh",
            "Операционная система": "Nothing OS 2.0",
            "Вес": "201г",
            "Особенность": "Glyph Interface световая панель"
        },
        prices: [
            { store: "DNS", price: 44990, url: "https://dns-shop.ru/product/nothing-phone-2" },
            { store: "Citilink", price: 43990, url: "https://citilink.ru/nothing-phone-2" }
        ]
    },
    {
        id: 22,
        name: "Realme GT 5",
        category: "smartphones",
        price: 52990,
        rating: 4.4,
        image: "https://via.placeholder.com/300x300?text=Realme+GT+5",
        brand: "Realme",
        specs: {
            "Экран": "6.74'' AMOLED 144Hz",
            "Процессор": "Snapdragon 8 Gen 2",
            "Память": "512GB",
            "ОЗУ": "24GB",
            "Камера": "50MP + 8MP + 2MP",
            "Батарея": "5240 mAh",
            "Операционная система": "Android 14",
            "Вес": "205г",
            "Зарядка": "240W SuperVOOC"
        },
        prices: [
            { store: "MVideo", price: 52990, url: "https://www.mvideo.ru/product/realme-gt-5" },
            { store: "DNS", price: 51990, url: "https://dns-shop.ru/product/realme-gt-5" }
        ]
    },
    {
        id: 23,
        name: "Apple MacBook Air 15 M2",
        category: "laptops",
        price: 149990,
        rating: 4.8,
        image: "https://via.placeholder.com/300x300?text=MacBook+Air+15+M2",
        brand: "Apple",
        specs: {
            "Экран": "15.3'' Liquid Retina",
            "Процессор": "Apple M2",
            "Накопитель": "512GB SSD",
            "ОЗУ": "16GB",
            "Батарея": "до 18 часов",
            "Вес": "1.51кг",
            "Толщина": "1.15см",
            "Порты": "MagSafe 3, 2x Thunderbolt"
        },
        prices: [
            { store: "DNS", price: 149990, url: "https://dns-shop.ru/product/macbook-air-15-m2" },
            { store: "Citilink", price: 147990, url: "https://citilink.ru/macbook-air-15-m2" }
        ]
    },
    {
        id: 24,
        name: "HP Spectre x360 14",
        category: "laptops",
        price: 159990,
        rating: 4.7,
        image: "https://via.placeholder.com/300x300?text=Spectre+x360+14",
        brand: "HP",
        specs: {
            "Экран": "14'' OLED 2.8K",
            "Процессор": "Intel Core i7-1355U",
            "Накопитель": "2TB SSD",
            "ОЗУ": "32GB",
            "Операционная система": "Windows 11",
            "Вес": "1.37кг",
            "Тип": "Конвертируемый",
            "Стилус": "HP Rechargeable Pen"
        },
        prices: [
            { store: "MVideo", price: 159990, url: "https://www.mvideo.ru/product/spectre-x360-14" },
            { store: "DNS", price: 157990, url: "https://dns-shop.ru/product/spectre-x360-14" }
        ]
    },
    {
        id: 25,
        name: "Acer Predator Helios 16",
        category: "laptops",
        price: 189990,
        rating: 4.6,
        image: "https://via.placeholder.com/300x300?text=Predator+Helios+16",
        brand: "Acer",
        specs: {
            "Экран": "16'' Mini LED 250Hz",
            "Процессор": "Intel Core i9-13900HX",
            "Видеокарта": "NVIDIA RTX 4090",
            "Накопитель": "2TB SSD",
            "ОЗУ": "32GB DDR5",
            "Операционная система": "Windows 11",
            "Вес": "2.6кг",
            "Охлаждение": "5-я генерация AeroBlade"
        },
        prices: [
            { store: "DNS", price: 189990, url: "https://dns-shop.ru/product/predator-helios-16" },
            { store: "Citilink", price: 187990, url: "https://citilink.ru/predator-helios-16" }
        ]
    },
    {
        id: 26,
        name: "Bose QuietComfort Ultra",
        category: "headphones",
        price: 39990,
        rating: 4.8,
        image: "https://via.placeholder.com/300x300?text=QC+Ultra",
        brand: "Bose",
        specs: {
            "Тип": "Накладные беспроводные",
            "Шумоподавление": "Adaptive ANC",
            "Автономность": "24 часа",
            "Bluetooth": "5.3",
            "Вес": "252г",
            "Особенность": "Immersive Audio",
            "Микрофоны": "8 микрофонов",
            "Складывание": "Плоское складирование"
        },
        prices: [
            { store: "DNS", price: 39990, url: "https://dns-shop.ru/product/qc-ultra" },
            { store: "MVideo", price: 40990, url: "https://www.mvideo.ru/product/qc-ultra" }
        ]
    },
    {
        id: 27,
        name: "Sennheiser Momentum 4 Wireless",
        category: "headphones",
        price: 28990,
        rating: 4.7,
        image: "https://via.placeholder.com/300x300?text=Momentum+4",
        brand: "Sennheiser",
        specs: {
            "Тип": "Накладные беспроводные",
            "Автономность": "60 часов",
            "Bluetooth": "5.2",
            "Кодек": "AAC, aptX Adaptive",
            "Вес": "293г",
            "Шумоподавление": "Adaptive ANC",
            "Складывание": "Поворотные чашки"
        },
        prices: [
            { store: "Citilink", price: 28990, url: "https://citilink.ru/momentum-4" },
            { store: "DNS", price: 29990, url: "https://dns-shop.ru/product/momentum-4" }
        ]
    },
    {
        id: 28,
        name: "Samsung The Frame 2024 55",
        category: "tv",
        price: 89990,
        rating: 4.7,
        image: "https://via.placeholder.com/300x300?text=The+Frame+55",
        brand: "Samsung",
        specs: {
            "Диагональ": "55''",
            "Разрешение": "4K QLED",
            "Особенность": "Режим Art Mode",
            "Частота": "120Hz",
            "Smart TV": "Tizen",
            "Толщина": "24.9мм",
            "Крепление": "Стильный настенный монтаж",
            "Art Store": "Доступ к 1400+ произведений"
        },
        prices: [
            { store: "DNS", price: 89990, url: "https://dns-shop.ru/product/the-frame-55" },
            { store: "MVideo", price: 91990, url: "https://www.mvideo.ru/product/the-frame-55" }
        ]
    },
    {
        id: 29,
        name: "TCL QLED C845 65",
        category: "tv",
        price: 79990,
        rating: 4.5,
        image: "https://via.placeholder.com/300x300?text=QLED+C845+65",
        brand: "TCL",
        specs: {
            "Диагональ": "65''",
            "Разрешение": "4K QLED",
            "Частота": "144Hz",
            "Smart TV": "Google TV",
            "Игровой режим": "VRR, ALLM, FreeSync",
            "Звук": "Onkyo 2.1, 60W",
            "HDR": "Dolby Vision, HDR10+",
            "Процессор": "AiPQ 3.0"
        },
        prices: [
            { store: "MVideo", price: 79990, url: "https://www.mvideo.ru/product/qled-c845-65" },
            { store: "DNS", price: 77990, url: "https://dns-shop.ru/product/qled-c845-65" }
        ]
    },
    {
        id: 30,
        name: "Sony Alpha 7 IV",
        category: "cameras",
        price: 189990,
        rating: 4.8,
        image: "https://via.placeholder.com/300x300?text=Alpha+7+IV",
        brand: "Sony",
        specs: {
            "Тип": "Зеркальная беззеркалка",
            "Матрица": "Full Frame 33MP",
            "Стабилизация": "5-осевая IBIS",
            "Видео": "4K 60fps",
            "Автофокус": "759 точек",
            "Экран": "3'' поворотный сенсорный",
            "Вес": "658г (только корпус)",
            "Совместимость": "Объективы E-mount"
        },
        prices: [
            { store: "DNS", price: 189990, url: "https://dns-shop.ru/product/alpha-7-iv" },
            { store: "Citilink", price: 187990, url: "https://citilink.ru/alpha-7-iv" }
        ]
    },
    {
        id: 31,
        name: "Canon EOS R6 Mark II",
        category: "cameras",
        price: 179990,
        rating: 4.7,
        image: "https://via.placeholder.com/300x300?text=EOS+R6+Mark+II",
        brand: "Canon",
        specs: {
            "Тип": "Беззеркальная камера",
            "Матрица": "Full Frame 24.2MP",
            "Серийная съемка": "40 кадров/сек",
            "Видео": "6K 60fps RAW",
            "Автофокус": "Dual Pixel CMOS AF II",
            "Стабилизация": "IBIS до 8 ступеней",
            "Вес": "670г",
            "Объективы": "RF mount"
        },
        prices: [
            { store: "MVideo", price: 179990, url: "https://www.mvideo.ru/product/eos-r6-mark-ii" },
            { store: "DNS", price: 177990, url: "https://dns-shop.ru/product/eos-r6-mark-ii" }
        ]
    },
    {
        id: 32,
        name: "DJI Air 3",
        category: "drones",
        price: 119990,
        rating: 4.8,
        image: "https://via.placeholder.com/300x300?text=DJI+Air+3",
        brand: "DJI",
        specs: {
            "Вес": "720г",
            "Камеры": "2 камеры (широкоугольная + телефото)",
            "Видео": "4K HDR 60fps",
            "Дальность": "20км",
            "Время полета": "46 минут",
            "Защита": "Всененаправленное избегание",
            "Особенность": "Night Mode для ночной съемки"
        },
        prices: [
            { store: "DNS", price: 119990, url: "https://dns-shop.ru/product/dji-air-3" },
            { store: "Citilink", price: 117990, url: "https://citilink.ru/dji-air-3" }
        ]
    },
    {
        id: 33,
        name: "Apple iPad Pro 12.9 M2",
        category: "tablets",
        price: 129990,
        rating: 4.9,
        image: "https://via.placeholder.com/300x300?text=iPad+Pro+12.9+M2",
        brand: "Apple",
        specs: {
            "Диагональ": "12.9'' Liquid Retina XDR",
            "Процессор": "Apple M2",
            "Память": "1TB",
            "ОЗУ": "16GB",
            "Экран": "Mini-LED, ProMotion",
            "Камера": "12MP + 10MP + LiDAR",
            "Стилус": "Apple Pencil 2",
            "Подключение": "Thunderbolt / USB 4"
        },
        prices: [
            { store: "DNS", price: 129990, url: "https://dns-shop.ru/product/ipad-pro-12-9-m2" },
            { store: "MVideo", price: 131990, url: "https://www.mvideo.ru/product/ipad-pro-12-9-m2" }
        ]
    },
    {
        id: 34,
        name: "Huawei MatePad Pro 13.2",
        category: "tablets",
        price: 89990,
        rating: 4.6,
        image: "https://via.placeholder.com/300x300?text=MatePad+Pro+13.2",
        brand: "Huawei",
        specs: {
            "Диагональ": "13.2'' OLED",
            "Процессор": "Kirin 9000S",
            "Память": "512GB",
            "ОЗУ": "12GB",
            "Батарея": "10100 mAh",
            "Зарядка": "88W SuperCharge",
            "Стилус": "M-Pencil 3",
            "Особенность": "Флагманский Harman Kardon звук"
        },
        prices: [
            { store: "Citilink", price: 89990, url: "https://citilink.ru/matepad-pro-13-2" },
            { store: "DNS", price: 91990, url: "https://dns-shop.ru/product/matepad-pro-13-2" }
        ]
    },
    {
        id: 35,
        name: "Apple Watch Ultra 2",
        category: "smartwatches",
        price: 69990,
        rating: 4.8,
        image: "https://via.placeholder.com/300x300?text=Watch+Ultra+2",
        brand: "Apple",
        specs: {
            "Экран": "49мм Always-On Retina",
            "Процессор": "S9 SiP",
            "Автономность": "36 часов",
            "Защита": "Водонепроницаемость 100м",
            "Давление": "Датчик высоты",
            "Особенности": "Двойной динамик, кнопка Action",
            "Спорт режимы": "Более 50 видов спорта",
            "Операционная система": "watchOS 10"
        },
        prices: [
            { store: "DNS", price: 69990, url: "https://dns-shop.ru/product/watch-ultra-2" },
            { store: "MVideo", price: 70990, url: "https://www.mvideo.ru/product/watch-ultra-2" }
        ]
    },
    {
        id: 36,
        name: "Samsung Galaxy Watch6 Classic",
        category: "smartwatches",
        price: 34990,
        rating: 4.6,
        image: "https://via.placeholder.com/300x300?text=Watch6+Classic",
        brand: "Samsung",
        specs: {
            "Экран": "47мм Super AMOLED",
            "Процессор": "Exynos W930",
            "Автономность": "40 часов",
            "Защита": "IP68, 5ATM",
            "Особенность": "Поворотная рамка bezel",
            "Датчики": "ЭКГ, давление, температура",
            "Совместимость": "Android, iOS",
            "Операционная система": "Wear OS"
        },
        prices: [
            { store: "DNS", price: 34990, url: "https://dns-shop.ru/product/watch6-classic" },
            { store: "Citilink", price: 33990, url: "https://citilink.ru/watch6-classic" }
        ]
    },
    {
        id: 37,
        name: "Garmin Fenix 7X Pro",
        category: "smartwatches",
        price: 89990,
        rating: 4.7,
        image: "https://via.placeholder.com/300x300?text=Fenix+7X+Pro",
        brand: "Garmin",
        specs: {
            "Экран": "51мм MIP",
            "Автономность": "37 дней",
            "Спорт режимы": "Более 50 видов",
            "Навигация": "Многочастотный GNSS",
            "Датчики": "Pulse Ox, HRV, компрессия",
            "Защита": "10 ATM, MIL-STD-810",
            "Особенность": "Фонарик LED",
            "Материал": "Сапфировое стекло, титан"
        },
        prices: [
            { store: "MVideo", price: 89990, url: "https://www.mvideo.ru/product/fenix-7x-pro" },
            { store: "DNS", price: 87990, url: "https://dns-shop.ru/product/fenix-7x-pro" }
        ]
    },
    {
        id: 38,
        name: "Microsoft Surface Pro 9",
        category: "tablets",
        price: 129990,
        rating: 4.7,
        image: "https://via.placeholder.com/300x300?text=Surface+Pro+9",
        brand: "Microsoft",
        specs: {
            "Диагональ": "13'' PixelSense Flow",
            "Процессор": "Intel Core i7-1255U",
            "Память": "512GB SSD",
            "ОЗУ": "16GB",
            "Операционная система": "Windows 11",
            "Вес": "879г",
            "Особенность": "Отсоединяемая клавиатура",
            "Стилус": "Surface Slim Pen 2"
        },
        prices: [
            { store: "DNS", price: 129990, url: "https://dns-shop.ru/product/surface-pro-9" },
            { store: "Citilink", price: 127990, url: "https://citilink.ru/surface-pro-9" }
        ]
    },
    {
        id: 39,
        name: "Amazon Kindle Paperwhite Signature",
        category: "электронная книга",
        price: 18990,
        rating: 4.6,
        image: "https://via.placeholder.com/300x300?text=Kindle+Paperwhite",
        brand: "Amazon",
        specs: {
            "Экран": "6.8'' E-Ink Carta 1200",
            "Подсветка": "32 светодиода",
            "Память": "32GB",
            "Автономность": "10 недель",
            "Защита": "IPX8 водонепроницаемость",
            "Вес": "208г",
            "Особенность": "Автоматическая регулировка света",
            "Подключение": "Wi-Fi, Bluetooth"
        },
        prices: [
            { store: "DNS", price: 18990, url: "https://dns-shop.ru/product/kindle-paperwhite" },
            { store: "MVideo", price: 19990, url: "https://www.mvideo.ru/product/kindle-paperwhite" }
        ]
    },
    {
        id: 40,
        name: "PocketBook 740",
        category: "электронная книга",
        price: 24990,
        rating: 4.5,
        image: "https://via.placeholder.com/300x300?text=PocketBook+740",
        brand: "PocketBook",
        specs: {
            "Экран": "7.8'' E-Ink Carta 1200",
            "Подсветка": "SmartLight RGB",
            "Память": "64GB",
            "Автономность": "2 месяца",
            "Защита": "IPX8",
            "Вес": "250г",
            "Поддержка": "24 формата книг",
            "Особенность": "Голосовое чтение TTS"
        },
        prices: [
            { store: "Citilink", price: 24990, url: "https://citilink.ru/pocketbook-740" },
            { store: "DNS", price: 25990, url: "https://dns-shop.ru/product/pocketbook-740" }
        ]
    }

];

//Фильтры на все категории
const categoryFilters = {
    smartphones: [
        { 
            name: "brand", 
            label: "Бренд", 
            type: "checkbox", 
            options: ["Apple", "Samsung", "Xiaomi", "Google", "OnePlus", "Nothing", "Realme"] 
        },
        { 
            name: "ram", 
            label: "ОЗУ", 
            type: "checkbox", 
            options: ["4GB", "6GB", "8GB", "12GB", "16GB", "24GB"] 
        },
        { 
            name: "storage", 
            label: "Память", 
            type: "checkbox", 
            options: ["64GB", "128GB", "256GB", "512GB", "1TB"] 
        },
        { 
            name: "os", 
            label: "Операционная система", 
            type: "checkbox", 
            options: ["iOS", "Android"] 
        },
        { 
            name: "battery", 
            label: "Батарея", 
            type: "checkbox", 
            options: ["До 4000 mAh", "4000-5000 mAh", "Свыше 5000 mAh"] 
        }
    ],
    
    laptops: [
        { 
            name: "brand", 
            label: "Бренд", 
            type: "checkbox", 
            options: ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "Microsoft"] 
        },
        { 
            name: "ram", 
            label: "ОЗУ", 
            type: "checkbox", 
            options: ["8GB", "16GB", "32GB", "64GB"] 
        },
        { 
            name: "storage", 
            label: "Накопитель", 
            type: "checkbox", 
            options: ["256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD"] 
        },
        { 
            name: "os", 
            label: "Операционная система", 
            type: "checkbox", 
            options: ["Windows", "macOS", "Linux"] 
        },
        { 
            name: "gpu", 
            label: "Видеокарта", 
            type: "checkbox", 
            options: ["Интегрированная", "NVIDIA", "AMD"] 
        },
        { 
            name: "screen_size", 
            label: "Диагональ экрана", 
            type: "checkbox", 
            options: ["13'' и меньше", "14''-15''", "16''-17''", "18'' и больше"] 
        }
    ],
    
    tv: [
        { 
            name: "brand", 
            label: "Бренд", 
            type: "checkbox", 
            options: ["Samsung", "LG", "Sony", "TCL"] 
        },
        { 
            name: "screen_size", 
            label: "Диагональ", 
            type: "checkbox", 
            options: ["43'' и меньше", "50''-55''", "65''", "75'' и больше"] 
        },
        { 
            name: "resolution", 
            label: "Разрешение", 
            type: "checkbox", 
            options: ["Full HD", "4K UHD", "8K"] 
        },
        { 
            name: "technology", 
            label: "Технология экрана", 
            type: "checkbox", 
            options: ["LED", "QLED", "OLED"] 
        },
        { 
            name: "smart_tv", 
            label: "Smart TV", 
            type: "checkbox", 
            options: ["Есть", "Нет"] 
        },
        { 
            name: "refresh_rate", 
            label: "Частота обновления", 
            type: "checkbox", 
            options: ["60Hz", "120Hz", "144Hz и выше"] 
        }
    ],
    
    headphones: [
        { 
            name: "brand", 
            label: "Бренд", 
            type: "checkbox", 
            options: ["Sony", "Apple", "Samsung", "Bose", "Sennheiser"] 
        },
        { 
            name: "type", 
            label: "Тип", 
            type: "checkbox", 
            options: ["Накладные", "Внутриканальные", "TWS"] 
        },
        { 
            name: "connection", 
            label: "Подключение", 
            type: "checkbox", 
            options: ["Проводные", "Беспроводные"] 
        },
        { 
            name: "noise_cancel", 
            label: "Шумоподавление", 
            type: "checkbox", 
            options: ["Есть", "Нет"] 
        },
        { 
            name: "battery_life", 
            label: "Автономность", 
            type: "checkbox", 
            options: ["До 20 часов", "20-30 часов", "30+ часов"] 
        }
    ],
    
    cameras: [
        { 
            name: "brand", 
            label: "Бренд", 
            type: "checkbox", 
            options: ["Sony", "Canon", "GoPro"] 
        },
        { 
            name: "type", 
            label: "Тип камеры", 
            type: "checkbox", 
            options: ["Зеркальная", "Беззеркальная", "Экшн-камера"] 
        },
        { 
            name: "resolution", 
            label: "Разрешение", 
            type: "checkbox", 
            options: ["До 20MP", "20-30MP", "30+ MP"] 
        },
        { 
            name: "video_resolution", 
            label: "Видео", 
            type: "checkbox", 
            options: ["Full HD", "4K", "6K и выше"] 
        }
    ],
    
    drones: [
        { 
            name: "brand", 
            label: "Бренд", 
            type: "checkbox", 
            options: ["DJI"] 
        },
        { 
            name: "camera_resolution", 
            label: "Камера", 
            type: "checkbox", 
            options: ["До 12MP", "12-20MP", "20+ MP"] 
        },
        { 
            name: "flight_time", 
            label: "Время полета", 
            type: "checkbox", 
            options: ["До 20 мин", "20-30 мин", "30+ мин"] 
        },
        { 
            name: "range", 
            label: "Дальность", 
            type: "checkbox", 
            options: ["До 5км", "5-10км", "10+ км"] 
        }
    ],
    
    tablets: [
        { 
            name: "brand", 
            label: "Бренд", 
            type: "checkbox", 
            options: ["Apple", "Samsung", "Xiaomi", "Huawei", "Microsoft"] 
        },
        { 
            name: "screen_size", 
            label: "Диагональ", 
            type: "checkbox", 
            options: ["До 10''", "10''-11''", "12'' и больше"] 
        },
        { 
            name: "storage", 
            label: "Память", 
            type: "checkbox", 
            options: ["64GB", "128GB", "256GB", "512GB", "1TB"] 
        },
        { 
            name: "ram", 
            label: "ОЗУ", 
            type: "checkbox", 
            options: ["4GB", "6GB", "8GB", "12GB"] 
        },
        { 
            name: "os", 
            label: "Операционная система", 
            type: "checkbox", 
            options: ["iPadOS", "Android", "Windows"] 
        }
    ],
    
    smartwatches: [
        { 
            name: "brand", 
            label: "Бренд", 
            type: "checkbox", 
            options: ["Apple", "Samsung", "Garmin"] 
        },
        { 
            name: "screen_size", 
            label: "Размер экрана", 
            type: "checkbox", 
            options: ["До 42мм", "42-45мм", "46мм и больше"] 
        },
        { 
            name: "battery_life", 
            label: "Автономность", 
            type: "checkbox", 
            options: ["До 2 дней", "3-7 дней", "7+ дней"] 
        },
        { 
            name: "water_resistance", 
            label: "Водонепроницаемость", 
            type: "checkbox", 
            options: ["IP68", "5ATM", "10ATM"] 
        }
    ],
    
    ereaders: [
        { 
            name: "brand", 
            label: "Бренд", 
            type: "checkbox", 
            options: ["Amazon", "PocketBook"] 
        },
        { 
            name: "screen_size", 
            label: "Диагональ", 
            type: "checkbox", 
            options: ["6''", "7''-8''", "10'' и больше"] 
        },
        { 
            name: "storage", 
            label: "Память", 
            type: "checkbox", 
            options: ["8GB", "16GB", "32GB", "64GB"] 
        },
        { 
            name: "waterproof", 
            label: "Водонепроницаемость", 
            type: "checkbox", 
            options: ["Есть", "Нет"] 
        },
        { 
            name: "backlight", 
            label: "Подсветка", 
            type: "checkbox", 
            options: ["Есть", "Нет"] 
        }
    ]
};

// Сохраняем товары в localStorage для доступа на других страницах
try {
    localStorage.setItem('techAggregatorProducts', JSON.stringify(demoProducts));
    console.log('Товары сохранены в localStorage для страницы сравнения');
} catch (e) {
    console.error('Ошибка сохранения товаров в localStorage:', e);
}

// Делаем переменную глобально доступной
window.demoProducts = demoProducts;
console.log('demoProducts доступна глобально, количество:', demoProducts.length);

//Инициализация
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Проверяем текущую страницу
    const path = window.location.pathname;
    
    console.log('Инициализация приложения, страница:', path);
    
    if (path.includes('catalog.html')) {
        initializeCatalog();
    } else if (path.includes('product.html')) {
        initializeProductPage();
    } else if (path.includes('comparison.html')) {
        updateComparisonCounter();
    } else if (path.includes('recommendations.html')) {
        initializeRecommendationsPage();
    } else if (path.includes('admin.html')) {
        initializeAdminPage();
    } else if (path.includes('auth.html')) {
        const user = JSON.parse(localStorage.getItem('techAggregatorUser') || 'null');
        if (user) {
            window.location.href = 'index.html';
        }
    }
    
    loadUserData();
    updateComparisonCounter();
}

//===================== КАТАЛОГ И ФИЛЬТРЫ =====================

function initializeCatalog() {
    //Загружаем параметры из URL
    loadFiltersFromURL();
    displayProducts(demoProducts);
}

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

function updateFilters() {
    const category = document.getElementById('categorySelect').value;
    const dynamicFilters = document.getElementById('dynamicFilters');
    
    // Сбрасываем выбранные чекбоксы для предыдущей категории
    selectedCheckboxes = {};
    
    if (category && categoryFilters[category]) {
        dynamicFilters.innerHTML = `
            <h4 style="margin: 1.5rem 0 1rem; color: #374151; font-size: 1.1rem;">
                Характеристики ${getCategoryName(category)}
            </h4>
            ${categoryFilters[category].map(filter => `
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
    
    // Обновляем счетчик товаров
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

function filterProducts() {
    const category = document.getElementById('categorySelect')?.value;
    const minPrice = parseFloat(document.getElementById('minPrice')?.value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice')?.value) || Infinity;
    const sortBy = document.getElementById('sortSelect')?.value;
    
    let filtered = [...demoProducts];
    
    // 1. Фильтрация по категории
    if (category) {
        filtered = filtered.filter(p => p.category === category);
    }
    
    // 2. Фильтрация по цене
    filtered = filtered.filter(p => p.price >= minPrice && p.price <= maxPrice);
    
    // 3. Фильтрация по чекбоксам (улучшенная логика)
    Object.keys(selectedCheckboxes).forEach(filterName => {
        const selectedValues = selectedCheckboxes[filterName];
        
        if (selectedValues.length > 0) {
            filtered = filtered.filter(product => {
                // Для каждого товара проверяем совпадение с выбранными значениями
                return selectedValues.some(value => {
                    return matchFilter(product, filterName, value);
                });
            });
        }
    });
    
    // 4. Сортировка
    if (sortBy) {
        filtered = sortProductsList(filtered, sortBy);
    }
    
    // 5. Обновляем информацию о количестве товаров
    updateProductsInfo(filtered.length, category);
    
    // 6. Отображаем результат
    displayProducts(filtered);
}

// Вспомогательная функция для проверки совпадения фильтра
function matchFilter(product, filterName, filterValue) {
    // Преобразуем значение фильтра и характеристики товара к нижнему регистру для сравнения
    const valueLower = filterValue.toLowerCase();
    
    // Проверяем бренд
    if (filterName === 'brand') {
        return product.brand.toLowerCase().includes(valueLower);
    }
    
    // Для числовых диапазонов (батарея, время полета и т.д.)
    if (filterName === 'battery' || filterName === 'battery_life' || 
        filterName === 'flight_time' || filterName === 'range') {
        return checkRangeFilter(product, filterName, valueLower);
    }
    
    // Для размеров экрана
    if (filterName === 'screen_size') {
        return checkScreenSizeFilter(product, valueLower);
    }
    
    // Для памяти и ОЗУ
    if (filterName === 'storage' || filterName === 'ram') {
        return checkMemoryFilter(product, filterName, valueLower);
    }
    
    // Для операционных систем
    if (filterName === 'os') {
        return checkOSFilter(product, valueLower);
    }
    
    // Для разрешения экрана/камеры
    if (filterName === 'resolution' || filterName === 'video_resolution' || 
        filterName === 'camera_resolution') {
        return checkResolutionFilter(product, filterName, valueLower);
    }
    
    // Для типа подключения
    if (filterName === 'connection') {
        return checkConnectionFilter(product, valueLower);
    }
    
    // Для шумоподавления
    if (filterName === 'noise_cancel') {
        return checkNoiseCancelFilter(product, valueLower);
    }
    
    // Для типа устройств
    if (filterName === 'type') {
        return checkTypeFilter(product, valueLower);
    }
    
    // Для водонепроницаемости
    if (filterName === 'water_resistance' || filterName === 'waterproof') {
        return checkWaterResistanceFilter(product, valueLower);
    }
    
    // Для подсветки
    if (filterName === 'backlight') {
        return checkBacklightFilter(product, valueLower);
    }
    
    // Для Smart TV
    if (filterName === 'smart_tv') {
        return checkSmartTVFilter(product, valueLower);
    }
    
    // Для частоты обновления
    if (filterName === 'refresh_rate') {
        return checkRefreshRateFilter(product, valueLower);
    }
    
    // Для технологии экрана
    if (filterName === 'technology') {
        return checkTechnologyFilter(product, valueLower);
    }
    
    // Для видеокарты
    if (filterName === 'gpu') {
        return checkGPUFilter(product, valueLower);
    }
    
    // Поиск в характеристиках
    const specsString = JSON.stringify(product.specs).toLowerCase();
    if (specsString.includes(valueLower)) {
        return true;
    }
    
    // Поиск в названии
    if (product.name.toLowerCase().includes(valueLower)) {
        return true;
    }
    
    return false;
}

// Вспомогательные функции для проверки конкретных типов фильтров
function checkRangeFilter(product, filterName, value) {
    // Получаем значение из характеристик
    let productValue = null;
    
    if (filterName === 'battery') {
        productValue = product.specs['Батарея'] || product.specs['Автономность'];
    } else if (filterName === 'flight_time') {
        productValue = product.specs['Время полета'] || product.specs['Батарея'];
    } else if (filterName === 'range') {
        productValue = product.specs['Дальность'];
    } else if (filterName === 'battery_life') {
        productValue = product.specs['Автономность'] || product.specs['Батарея'];
    }
    
    if (!productValue) return false;
    
    // Извлекаем число из строки
    const match = productValue.match(/(\d+)/);
    if (!match) return false;
    
    const numValue = parseInt(match[1]);
    
    // Проверяем диапазоны
    if (value.includes('до 4000') && numValue < 4000) return true;
    if (value.includes('4000-5000') && numValue >= 4000 && numValue <= 5000) return true;
    if (value.includes('свыше 5000') && numValue > 5000) return true;
    
    if (value.includes('до 20') && numValue < 20) return true;
    if (value.includes('20-30') && numValue >= 20 && numValue <= 30) return true;
    if (value.includes('30+') && numValue > 30) return true;
    
    if (value.includes('до 5') && numValue < 5) return true;
    if (value.includes('5-10') && numValue >= 5 && numValue <= 10) return true;
    if (value.includes('10+') && numValue > 10) return true;
    
    if (value.includes('до 2') && numValue < 2) return true;
    if (value.includes('3-7') && numValue >= 3 && numValue <= 7) return true;
    if (value.includes('7+') && numValue > 7) return true;
    
    return false;
}

function checkScreenSizeFilter(product, value) {
    const screenSpec = product.specs['Экран'] || product.specs['Диагональ'] || 
                       product.specs['Диагональ экрана'] || '';
    
    if (!screenSpec) return false;
    
    // Извлекаем число из строки (например, "6.1''" или "55''")
    const match = screenSpec.match(/(\d+\.?\d*)/);
    if (!match) return false;
    
    const size = parseFloat(match[1]);
    
    if (value.includes("13'' и меньше") && size <= 13) return true;
    if (value.includes("14''-15''") && size >= 14 && size <= 15) return true;
    if (value.includes("16''-17''") && size >= 16 && size <= 17) return true;
    if (value.includes("18'' и больше") && size >= 18) return true;
    
    if (value.includes("43'' и меньше") && size <= 43) return true;
    if (value.includes("50''-55''") && size >= 50 && size <= 55) return true;
    if (value.includes("65''") && size === 65) return true;
    if (value.includes("75'' и больше") && size >= 75) return true;
    
    if (value.includes("до 10''") && size < 10) return true;
    if (value.includes("10''-11''") && size >= 10 && size <= 11) return true;
    if (value.includes("12'' и больше") && size >= 12) return true;
    
    if (value.includes("до 42") && size < 42) return true;
    if (value.includes("42-45") && size >= 42 && size <= 45) return true;
    if (value.includes("46") && size >= 46) return true;
    
    if (value.includes("6''") && size === 6) return true;
    if (value.includes("7''-8''") && size >= 7 && size <= 8) return true;
    if (value.includes("10''") && size >= 10) return true;
    
    return false;
}

function checkMemoryFilter(product, filterName, value) {
    let productValue = '';
    
    if (filterName === 'storage') {
        productValue = product.specs['Память'] || product.specs['Накопитель'] || 
                       product.specs['storage'] || '';
    } else if (filterName === 'ram') {
        productValue = product.specs['ОЗУ'] || product.specs['ram'] || '';
    }
    
    if (!productValue) return false;
    
    // Проверяем содержит ли значение фильтра
    return productValue.includes(value.replace('gb', '')) || 
           value.includes(productValue.toLowerCase());
}

function checkOSFilter(product, value) {
    const osValue = product.specs['Операционная система'] || '';
    if (!osValue) return false;
    
    const osLower = osValue.toLowerCase();
    
    if (value === 'ios' && (osLower.includes('ios') || osLower.includes('ipados'))) return true;
    if (value === 'android' && osLower.includes('android')) return true;
    if (value === 'windows' && osLower.includes('windows')) return true;
    if (value === 'macos' && osLower.includes('macos')) return true;
    if (value === 'linux' && osLower.includes('linux')) return true;
    
    return false;
}

// Добавим другие вспомогательные функции
function checkConnectionFilter(product, value) {
    const type = product.specs['Тип'] || '';
    if (!type) return false;
    
    if (value === 'проводные' && type.includes('Проводные')) return true;
    if (value === 'беспроводные' && type.includes('Беспроводные')) return true;
    
    // Также проверяем по наличию Bluetooth
    if (value === 'беспроводные' && product.specs['Bluetooth']) return true;
    
    return false;
}

function checkNoiseCancelFilter(product, value) {
    const noiseCancel = product.specs['Шумоподавление'] || '';
    if (!noiseCancel) return false;
    
    if (value === 'есть' && noiseCancel !== 'Нет') return true;
    if (value === 'нет' && (noiseCancel === 'Нет' || !noiseCancel)) return true;
    
    return false;
}

// ... (остальные вспомогательные функции по аналогии)

// Функция для обновления информации о товарах
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

// Функция для сортировки товаров
function sortProductsList(products, sortBy) {
    return [...products].sort((a, b) => {
        switch(sortBy) {
            case 'price_asc':
                return a.price - b.price;
            case 'price_desc':
                return b.price - a.price;
            case 'rating':
                return b.rating - a.rating;
            case 'brand':
                return a.brand.localeCompare(b.brand);
            case 'name':
            default:
                return a.name.localeCompare(b.name);
        }
    });
}

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
    
    grid.innerHTML = products.map(product => `
        <div class="product-card" onclick="openProduct(${product.id})">
            <img src="${product.image}" alt="${product.name}" 
                 style="width: 100%; height: 200px; object-fit: contain; background: #f8f9fa; border-radius: 8px;">
            <h3>${product.name}</h3>
            <div class="product-rating">
                <span class="rating-stars">${getStarRating(product.rating)}</span>
                <span class="rating-value">${product.rating}</span>
            </div>
            <div class="product-price">${formatPrice(product.price)} ₽</div>
            <div class="product-specs-preview">
                ${Object.entries(product.specs).slice(0, 2).map(([key, value]) => `
                    <div class="spec-preview">${key}: ${value}</div>
                `).join('')}
            </div>
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

function resetFilters() {
    document.getElementById('categorySelect').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('dynamicFilters').innerHTML = '';
    selectedCheckboxes = {};
    displayProducts(demoProducts);
}

//===================== КАРТОЧКА ТОВАРА =====================

function initializeProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        loadProduct(parseInt(productId));
    }
}

function loadProduct(productId) {
    const product = demoProducts.find(p => p.id === productId);
    
    if (!product) {
        showCustomNotification('Товар не найден', 'info');
        window.location.href = 'catalog.html';
        return;
    }
    
    //Обновляем информацию на странице
    document.getElementById('productTitle').textContent = product.name;
    document.getElementById('productCategory').textContent = getCategoryName(product.category);
    document.getElementById('productName').textContent = product.name;
    
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) {
        mainImage.src = product.image;
        mainImage.alt = product.name;
    }
    
    //Заполняем характеристики
    const specsList = document.getElementById('productSpecs');
    if (specsList) {
        specsList.innerHTML = Object.entries(product.specs).map(([key, value]) => `
            <div class="spec-item">
                <span>${key}:</span>
                <span>${value}</span>
            </div>
        `).join('');
    }
    
    //Заполняем цены с рабочими ссылками
// Заполняем цены с графиками
const priceList = document.getElementById('priceList');
if (priceList) {
  priceList.innerHTML = product.prices.map(price => {
    // Генерируем фиктивные данные за последние 5 недель
    const dates = [];
    const prices = [];
    let basePrice = price.price;
    for (let i = 4; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i * 7);
      dates.push(date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }));
      const variation = (Math.random() - 0.5) * 0.15;
      prices.push(Math.round(basePrice * (1 + variation)));
    }

    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const range = maxP - minP || 1;

    // Параметры SVG
    const svgWidth = 240;
    const svgHeight = 60;
    const paddingX = 20;
    const paddingY = 10;
    const chartWidth = svgWidth - 2 * paddingX;
    const chartHeight = svgHeight - 2 * paddingY;

    // Масштабирование Y: инвертируем, т.к. SVG растёт вниз
    const scaleY = (p) => paddingY + chartHeight - ((p - minP) / range) * chartHeight;
    // Равномерное распределение X
    const scaleX = (i) => paddingX + (i / (prices.length - 1)) * chartWidth;

    // Формируем точки
    const points = prices.map((p, i) => `${scaleX(i)},${scaleY(p)}`).join(' ');

    // SVG график — зелёный цвет
    const chartSVG = `
      <div style="margin-top: 12px; position: relative;">
        <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}"
             style="background:#f8f9fa; border-radius:6px; overflow: visible; display: block;">
          <!-- Линия графика -->
          <polyline fill="none" stroke="#10b981" stroke-width="2" points="${points}" />
          <!-- Точки с подсказками -->
          ${prices.map((p, i) => `
            <circle cx="${scaleX(i)}" cy="${scaleY(p)}" r="6" fill="#10b981">
              <title>${dates[i]}: ${formatPrice(p)} ₽</title>
            </circle>
          `).join('')}
        </svg>
        <!-- Подписи дат -->
        <div style="font-size:0.7rem; color:#6b7280; margin-top:6px; display:flex; justify-content:space-between;">
          ${dates.map(d => `<span>${d}</span>`).join('')}
        </div>
      </div>
    `;

    return `
      <div class="price-item">
        <div class="store-info">
          <strong>${price.store}</strong>
          <span style="color: #6b7280; font-size: 0.9rem;">В наличии</span>
        </div>
        <div class="price-actions">
          <span class="price">${formatPrice(price.price)} ₽</span>
          <a href="${price.url}" target="_blank" class="buy-button" onclick="trackPurchase(${product.id}, '${price.store}')">
            Купить
          </a>
        </div>
        ${chartSVG}
      </div>
    `;
  }).join('');
}
    
    //Загружаем отзывы
    loadProductReviews(productId);
}

function trackPurchase(productId, store) {
    //В реальном приложении здесь будет отправка аналитики
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

function submitReview() {
    if (!checkAuth()) {
        showAuthModal();
        return;
    }
    
    const reviewText = document.getElementById('reviewText').value;
    const rating = document.getElementById('reviewRating').value;
    
    if (!reviewText || !rating) {
        showCustomNotification('Пожалуйста, заполните все поля', 'info');
        return;
    }
    
    //В реальном приложении здесь будет отправка на сервер
    showCustomNotification('Отзыв отправлен на модерацию. Спасибо!', 'info');
    closeReviewModal();
    
    //Очищаем форму
    document.getElementById('reviewText').value = '';
    document.getElementById('reviewRating').value = '5';
}

function submitRequest() {
    if (!checkAuth()) {
        showAuthModal();
        return;
    }
    
    const requestText = document.getElementById('requestText').value;
    const requestCategory = document.getElementById('requestCategory').value;
    
    if (!requestText || !requestCategory) {
        showCustomNotification('Пожалуйста, заполните все поля', 'info');
        return;
    }
    
    //В реальном приложении здесь будет отправка на сервер
    
    showCustomNotification('Запрос отправлен администратору. Мы уведомим вас, когда товар будет добавлен.', 'info');
    closeRequestModal();
    
    //Очищаем форму
    document.getElementById('requestText').value = '';
    document.getElementById('requestCategory').value = '';
}

function loadProductReviews(productId) {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;
    
    //Временные демо-отзывы
    const reviews = [
        {
            id: 1,
            user: "Иван Петров",
            rating: 5,
            text: "Отличный товар! Все работает идеально, очень доволен покупкой.",
            date: "2 дня назад",
            verified: true
        },
        {
            id: 2,
            user: "Мария Сидорова",
            rating: 4,
            text: "Хороший товар, но цена немного завышена. В остальном все отлично.",
            date: "1 неделю назад",
            verified: true
        }
    ];
    
    reviewsList.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <div>
                    <strong>${review.user}</strong>
                    ${review.verified ? '<span style="color: #10b981; margin-left: 0.5rem;">✓ Проверенный покупатель</span>' : ''}
                </div>
                <div class="review-rating">
                    <span class="rating-stars">${getStarRating(review.rating)}</span>
                    <span style="color: #6b7280; font-size: 0.9rem;">${review.date}</span>
                </div>
            </div>
            <p>${review.text}</p>
        </div>
    `).join('');
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
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
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

function openProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

function loadUserData() {
    const saved = localStorage.getItem('techAggregatorUser');
    if (saved) {
        currentUser = JSON.parse(saved);
        updateAuthButtons();
    }
}

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

// Функция обновления счетчика
function updateComparisonCounter() {
    // Загружаем актуальные данные из localStorage
    try {
        const savedIds = JSON.parse(localStorage.getItem('techAggregatorComparison') || '[]');
        const count = savedIds.length;
        
        const counters = document.querySelectorAll('.comparison-counter');
        counters.forEach(counter => {
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
        
        console.log('Счетчик обновлен:', count, 'товаров');
    } catch (e) {
        console.error('Ошибка обновления счетчика:', e);
    }
}

//===================== СРАВНЕНИЕ =====================
(function() {
    try {
        const saved = localStorage.getItem('techAggregatorComparison');
        if (saved) {
            const savedIds = JSON.parse(saved);
            comparisonList = demoProducts.filter(p => savedIds.includes(p.id));
        }
    } catch (e) {
        console.error('Ошибка загрузки сравнения:', e);
    }
})();

function loadComparisonData() {
    try {
        const saved = localStorage.getItem('techAggregatorComparison');
        if (saved) {
            const savedIds = JSON.parse(saved);
            comparisonList = demoProducts.filter(p => savedIds.includes(p.id));
            console.log('[script.js] Загружено товаров в сравнение:', comparisonList.length);
        }
    } catch (e) {
        console.error('[script.js] Ошибка загрузки сравнения:', e);
        comparisonList = [];
    }
}

// Функция добавления в сравнение
function addToComparison(productId) {
    console.log('addToComparison: добавление товара ID', productId);
    
    const product = demoProducts.find(p => p.id === productId);
    
    if (!product) {
        console.error('Товар не найден:', productId);
        showCustomNotification('Товар не найден', 'error', 3000);
        return;
    }
    
    // Получаем текущий список из localStorage
    let savedIds = JSON.parse(localStorage.getItem('techAggregatorComparison') || '[]');
    
    // Проверка на дубликат
    if (savedIds.includes(productId)) {
        showCustomNotification('Товар уже добавлен в сравнение', 'info', 3000);
        return;
    }
    
    // Проверка категории
    if (savedIds.length > 0) {
        const firstProduct = demoProducts.find(p => p.id === savedIds[0]);
        if (firstProduct && firstProduct.category !== product.category) {
            const categoryName = getCategoryName(firstProduct.category);
            showCustomNotification(`Можно сравнивать только товары категории "${categoryName}"`, 'warning', 5000);
            return;
        }
    }
    
    // Проверка лимита
    if (savedIds.length >= 4) {
        showCustomNotification('Максимум 4 товара для сравнения', 'warning', 4000);
        return;
    }
    
    // Добавляем ID
    savedIds.push(productId);
    
    // Сохраняем
    try {
        localStorage.setItem('techAggregatorComparison', JSON.stringify(savedIds));
        comparisonList = demoProducts.filter(p => savedIds.includes(p.id));
        updateComparisonCounter();
        
        // Уведомление об успехе
        showCustomNotification(`${product.name} добавлен в сравнение`, 'success', 3000);
        
        // Если на странице сравнения, обновляем
        if (window.location.pathname.includes('comparison.html')) {
            if (typeof window.comparisonReload === 'function') {
                window.comparisonReload();
            }
        }
    } catch (e) {
        console.error('Ошибка сохранения:', e);
        showCustomNotification('Ошибка сохранения', 'error', 4000);
    }
}

// Функция для добавления текущего товара в сравнение (со страницы товара)
function addCurrentProductToComparison() {
    // Получаем ID товара из URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        showCustomNotification('Не удалось определить товар', 'error');
        console.error('Product ID not found in URL');
        return;
    }
    
    // Преобразуем в число и вызываем основную функцию
    addToComparison(parseInt(productId));
}

function saveComparisonToStorage() {
    try {
        const ids = comparisonList.map(p => p.id);
        localStorage.setItem('techAggregatorComparison', JSON.stringify(ids));
        console.log('Сохранено в localStorage:', ids);
    } catch (e) {
        console.error('Ошибка сохранения:', e);
    }
}

function removeFromComparison(productId) {
    const productName = comparisonList.find(p => p.id === productId)?.name || 'Товар';
    const initialCount = comparisonList.length;
    
    comparisonList = comparisonList.filter(p => p.id !== productId);
    console.log(`Удален товар ${productId}, было: ${initialCount}, стало: ${comparisonList.length}`);
    
    // Сохраняем обновленный список
    saveComparisonToStorage();
    
    // Обновляем отображение
    updateComparisonDisplay();
    updateComparisonCounter();
    
    // Показываем уведомление
    showNotification(`${productName} удален из сравнения`, 'info');
}

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

//===================== УВЕДОМЛЕНИЯ =====================

function showNotification(message, type = 'info', action = null) {
    // Создаем уведомление
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

//===================== ОБРАБОТЧИКИ ФОРМ =====================

document.addEventListener('DOMContentLoaded', function() {
    //Обработчики для модальных окон
    const reviewForm = document.getElementById('reviewForm');
    const requestForm = document.getElementById('requestForm');
    const addProductForm = document.getElementById('addProductForm');
    
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitReview();
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

//===================== ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ =====================

function searchProductsGlobal() {
    const query = document.getElementById('mainSearch')?.value.toLowerCase();
    if (query) {
        window.location.href = `catalog.html?search=${encodeURIComponent(query)}`;
    }
}

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




// Обновляем функцию updateComparisonDisplay
function updateComparisonDisplay() {
    console.log('updateComparisonDisplay: товаров =', comparisonList.length);
    
    const emptyState = document.getElementById('emptyComparison');
    const comparisonTable = document.getElementById('comparisonTable');
    const comparisonCount = document.getElementById('comparisonCount');
    const comparisonCategory = document.getElementById('comparisonCategory');
    const comparisonContent = document.getElementById('comparisonContent');
    
    // Проверяем элементы
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
        
        // Обновляем счетчик
        if (comparisonCount) {
            comparisonCount.textContent = comparisonList.length;
            console.log('Счетчик обновлен:', comparisonList.length);
        }
        
        // Обновляем информацию о категории
        if (comparisonCategory && comparisonList.length > 0) {
            const categoryName = getCategoryName(comparisonList[0].category);
            comparisonCategory.innerHTML = `
                <span style="font-weight: 600; color: #2563eb;">${categoryName}</span>
                <span style="color: #6b7280; margin-left: 1rem;">
                    ${comparisonList.length} товар${comparisonList.length > 1 ? 'а' : ''} для сравнения
                </span>
            `;
        }
        
        // Отрисовываем таблицу сравнения
        if (comparisonContent) {
            console.log('Начинаем отрисовку в comparisonContent');
            renderComparisonTable(comparisonContent);
        } else {
            console.error('Элемент comparisonContent не найден');
            // Пробуем создать его
            createComparisonContent();
        }
    }
    
    // Обновляем счетчик в шапке
    updateComparisonCounter();
}

function createComparisonContent() {
    console.log('Создаем элемент comparisonContent');
    const comparisonTable = document.getElementById('comparisonTable');
    if (comparisonTable) {
        // Находим или создаем контейнер для контента
        let content = document.getElementById('comparisonContent');
        if (!content) {
            content = document.createElement('div');
            content.id = 'comparisonContent';
            // Вставляем после кнопок управления
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
    //Загрузка рекомендаций
}

//Инициализация админ-панели (если на странице)
function initializeAdminPage() {
    //Проверка прав доступа
    if (!currentUser || currentUser.role !== 'admin') {
        showCustomNotification('Доступ запрещён', 'info');
        window.location.href = 'index.html';
        return;
    }
    //Загрузка данных админ-панели
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

function handleSearchEnter(event) {
    if (event.key === 'Enter') {
        searchProducts();
        document.getElementById('searchSuggestions').style.display = 'none';
    }
}

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

function initializeComparisonPage() {
  console.log('Инициализация страницы сравнения через script.js');

  // 1. Обновляем кнопки авторизации
  updateAuthButtons();

  // 2. Обновляем счётчик
  updateComparisonCounter();

  // 3. Загружаем ID из localStorage
  const savedIds = JSON.parse(localStorage.getItem('techAggregatorComparison') || '[]');
  if (savedIds.length === 0) {
    document.getElementById('emptyState').classList.remove('hidden');
    document.getElementById('emptyState').classList.add('visible');
    document.getElementById('comparisonTable').classList.remove('visible');
    document.getElementById('comparisonTable').classList.add('hidden');
    document.getElementById('comparisonCount').textContent = '0';
    return;
  }

  // 4. Находим товары
  const products = demoProducts.filter(p => savedIds.includes(p.id));
  if (products.length === 0) {
    alert('Не удалось загрузить товары для сравнения');
    return;
  }

  // 5. Обновляем заголовок
  const categoryMap = {
    'smartphones': 'Смартфоны',
    'laptops': 'Ноутбуки',
    'tv': 'Телевизоры',
    'headphones': 'Наушники'
  };
  const categoryName = categoryMap[products[0].category] || products[0].category;
  document.getElementById('comparisonCategory').innerHTML = `
    <span style="font-weight: 600; color: #2563eb;">${categoryName}</span>
    <span style="color: #6b7280; margin-left: 10px;">
      ${products.length} товар${products.length > 1 ? 'а' : ''} для сравнения
    </span>
  `;
  document.getElementById('comparisonCount').textContent = products.length;

  // 6. Рендерим таблицу
  renderComparisonTableFromScript(products);

  // 7. Показываем таблицу
  document.getElementById('emptyState').classList.add('hidden');
  document.getElementById('comparisonTable').classList.remove('hidden');
  document.getElementById('comparisonTable').classList.add('visible');
}


function renderComparisonTableFromScript(products) {
  const tableContent = document.getElementById('tableContent');
  if (!tableContent) return;

  // Собираем все характеристики
  const allSpecs = new Set();
  products.forEach(p => Object.keys(p.specs).forEach(k => allSpecs.add(k)));
  const specsArray = Array.from(allSpecs);

  let html = '<div class="scroll-wrapper"><div class="fixed-header"><div class="header-container">';
  html += '<div class="specs-header"><div style="font-weight:600;color:#374151;">Характеристики</div></div>';

  // Заголовки товаров
  products.forEach(p => {
    html += `
      <div class="product-header" style="position:relative;">
        <button class="close-btn" data-id="${p.id}"
          onclick="removeProductFromComparison(${p.id})"
          style="position:absolute;top:10px;right:10px;background:#ef4444;color:white;border:none;width:24px;height:24px;border-radius:50%;cursor:pointer;font-size:14px;z-index:10;">×</button>
        <img src="${p.image}" alt="${p.name}" class="product-image" onclick="openProduct(${p.id})" style="cursor:pointer;">
        <div class="product-name" onclick="openProduct(${p.id})" style="cursor:pointer;">${p.name}</div>
        <div class="product-price">${formatPrice(p.price)} ₽</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin:10px 0;">
          <span style="color:#f59e0b;">${getStarRating(p.rating)}</span>
          <span style="color:#6b7280;font-size:14px;">${p.rating}</span>
        </div>
      </div>
    `;
  });

  html += '</div></div><div class="scrollable-table">';

  // Характеристики
  specsArray.forEach(spec => {
    html += '<div class="spec-row">';
    html += `<div class="spec-label">${spec}</div>`;
    products.forEach(p => {
      const value = p.specs[spec] || '—';
      html += `<div class="spec-cell">${value}</div>`;
    });
    html += '</div>';
  });

  // Цены
  html += '<div class="spec-row" style="background:#f0f9ff;"><div class="spec-label" style="font-weight:600;color:#374151;">Цены в магазинах</div>';
  products.forEach(p => {
    html += '<div class="spec-cell" style="background:#f0f9ff;flex-direction:column;align-items:stretch;">';
    if (p.prices && p.prices.length > 0) {
      p.prices.forEach(price => {
        html += `
          <div class="store-price">
            <span style="font-weight:500;">${price.store}</span>
            <a href="${price.url}" target="_blank" style="color:#2563eb;text-decoration:none;font-weight:500;"
               onclick="trackPurchase && trackPurchase(${p.id}, '${price.store}')">
              ${formatPrice(price.price)} ₽
            </a>
          </div>
        `;
      });
    } else {
      html += '<div style="color:#6b7280;text-align:center;padding:10px;">Цены отсутствуют</div>';
    }
    html += '</div>';
  });
  html += '</div></div></div>';

  tableContent.innerHTML = html;
}

function removeProductFromComparison(productId) {
  let ids = JSON.parse(localStorage.getItem('techAggregatorComparison') || '[]');
  ids = ids.filter(id => id !== productId);
  localStorage.setItem('techAggregatorComparison', JSON.stringify(ids));
  initializeComparisonPage(); // Перезагружаем страницу
  updateComparisonCounter();
  showCustomNotification('Товар удалён из сравнения', 'info');
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
        // Показываем популярные товары
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
        // Показываем товары той же категории
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

//Обновляем инициализацию в script.js:
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
        setupSearch();
    }
});

// Инициализация звёздного рейтинга для отзывов
function initializeStarRating() {
    const starContainer = document.getElementById('starRating');
    if (!starContainer) return;
    
    const stars = starContainer.querySelectorAll('.star');
    const ratingInput = document.getElementById('reviewRating');
    const ratingDisplay = document.getElementById('ratingValueDisplay');
    
    // Функция для установки рейтинга
    function setRating(value) {
        ratingInput.value = value;
        if (ratingDisplay) {
            ratingDisplay.textContent = value;
        }
        
        // Обновляем отображение звёзд
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
    
    // Добавляем обработчики для каждой звезды
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
    
    // Устанавливаем начальное значение
    setRating(parseInt(ratingInput.value));
}

// Функция для открытия модального окна отзыва
function showReviewModal() {
    if (!checkAuth()) {
        showAuthModal();
        showCustomNotification('Для оставления отзыва необходимо авторизоваться', 'warning');
        return;
    }
    
    const modal = document.getElementById('reviewModal');
    if (modal) {
        modal.style.display = 'block';
        initializeStarRating(); // Инициализируем звёзды при открытии модалки
    }
}

// Функция для закрытия модального окна отзыва
function closeReviewModal() {
    const modal = document.getElementById('reviewModal');
    if (modal) {
        modal.style.display = 'none';
        // Сбрасываем форму при закрытии
        document.getElementById('reviewForm').reset();
        
        // Восстанавливаем рейтинг по умолчанию
        const ratingInput = document.getElementById('reviewRating');
        const ratingDisplay = document.getElementById('ratingValueDisplay');
        if (ratingInput) ratingInput.value = '5';
        if (ratingDisplay) ratingDisplay.textContent = '5';
        
        // Обновляем звёзды
        initializeStarRating();
    }
}

// Функция для отправки отзыва
function submitReview(event) {
    event.preventDefault();
    
    if (!checkAuth()) {
        showAuthModal();
        return;
    }
    
    const name = document.getElementById('reviewName').value.trim();
    const rating = document.getElementById('reviewRating').value;
    const text = document.getElementById('reviewText').value.trim();
    
    // Валидация
    if (!name || !rating || !text) {
        showCustomNotification('Пожалуйста, заполните все поля', 'warning');
        return;
    }
    
    if (text.length < 5) {
        showCustomNotification('Отзыв должен содержать минимум 10 символов', 'warning');
        return;
    }
    
    if (text.length > 1000) {
        showCustomNotification('Отзыв слишком длинный (максимум 1000 символов)', 'warning');
        return;
    }
    
    // Получаем ID текущего товара
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    // Сохраняем отзыв в localStorage
    const review = {
        id: Date.now(),
        productId: productId ? parseInt(productId) : null,
        userName: name,
        rating: parseInt(rating),
        text: text,
        date: new Date().toISOString(),
        verified: false // Пока не проверен
    };
    
    // Получаем существующие отзывы
    let reviews = JSON.parse(localStorage.getItem('techAggregatorReviews')) || [];
    
    // Добавляем новый отзыв
    reviews.push(review);
    
    // Сохраняем
    localStorage.setItem('techAggregatorReviews', JSON.stringify(reviews));
    
    // Показываем уведомление
    showCustomNotification('Отзыв отправлен на модерацию. Спасибо!', 'success');
    
    // Закрываем модальное окно
    closeReviewModal();
    
    // Обновляем список отзывов на странице
    loadProductReviews(productId);
    
    // Логируем для отладки
    console.log('Отзыв сохранен:', review);
}

// Функция для загрузки отзывов товара
function loadProductReviews(productId) {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;
    
    // Загружаем отзывы из localStorage
    const allReviews = JSON.parse(localStorage.getItem('techAggregatorReviews')) || [];
    
    // Фильтруем отзывы для текущего товара
    const productReviews = allReviews.filter(review => review.productId === parseInt(productId));
    
    // Если нет отзывов, показываем демо данные
    if (productReviews.length === 0) {
        // Демо-отзывы для тестирования
        const demoReviews = [
            {
                id: 1,
                userName: "Иван Петров",
                rating: 5,
                text: "Отличный товар! Все работает идеально, очень доволен покупкой.",
                date: "2024-01-15",
                verified: true
            },
            {
                id: 2,
                userName: "Мария Сидорова",
                rating: 4,
                text: "Хороший товар, но цена немного завышена. В остальном все отлично.",
                date: "2024-01-10",
                verified: true
            }
        ];
        
        reviewsList.innerHTML = demoReviews.map(review => createReviewHTML(review)).join('');
    } else {
        reviewsList.innerHTML = productReviews.map(review => createReviewHTML(review)).join('');
    }
}

// Функция для создания HTML отзыва
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

// Инициализация страницы товара
function initializeProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        loadProduct(parseInt(productId));
        
        // Загружаем отзывы для этого товара
        loadProductReviews(productId);
        
        // Инициализируем звёздный рейтинг
        setTimeout(initializeStarRating, 100);
        
        // Настраиваем обработчик формы
        const reviewForm = document.getElementById('reviewForm');
        if (reviewForm) {
            reviewForm.addEventListener('submit', submitReview);
        }
    }
}

//Обновляем функцию инициализации product.html:
function initializeProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        loadProduct(parseInt(productId));
    }
    
    //Инициализируем звёздный рейтинг
    initializeStarRating();
    
    //Инициализируем обработчики форм
    setupReviewForm();
    setupRequestForm();
}

//Настройка формы отзыва
function setupReviewForm() {
    const reviewForm = document.getElementById('reviewForm');
    if (!reviewForm) return;
    
    reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitReview();
    });
}

function submitReview() {
    if (!checkAuth()) {
        showAuthModal();
        return;
    }
    
    const name = document.getElementById('reviewName').value;
    const rating = document.getElementById('reviewRating').value;
    const text = document.getElementById('reviewText').value;
    
    if (!name || !rating || !text) {

        showCustomNotification('Пожалуйста, заполните все поля', 'info');
        return;
    }
    
    if (text.length < 10) {
        
        showCustomNotification('Отзыв должен содержать минимум 10 символов', 'info');
        return;
    }
    
    //В реальном приложении здесь будет отправка на сервер
    showNotification('Отзыв отправлен на модерацию. Спасибо!');
    closeReviewModal();
    
    //Очищаем форму
    document.getElementById('reviewName').value = '';
    document.getElementById('reviewRating').value = '5';
    document.getElementById('reviewText').value = '';
    
    //Сбрасываем звёзды
    const stars = document.querySelectorAll('#starRating .star');
    stars.forEach((star, index) => {
        if (index < 5) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    document.getElementById('ratingValueDisplay').textContent = '5';
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

function submitRequest() {
    if (!checkAuth()) {
        showAuthModal();
        return;
    }
    
    const product = document.getElementById('requestProduct').value;
    const category = document.getElementById('requestCategory').value;
    const comment = document.getElementById('requestComment').value;
    
    if (!product || !category) {
        
        showCustomNotification('Пожалуйста, заполните обязательные поля', 'info');
        return;
    }
    
    //В реальном приложении здесь будет отправка на сервер
    showNotification('Запрос отправлен администратору. Мы уведомим вас, когда товар будет добавлен.');
    closeRequestModal();
    
    //Очищаем форму
    document.getElementById('requestProduct').value = '';
    document.getElementById('requestCategory').value = '';
    document.getElementById('requestComment').value = '';
}

function closeRequestModal() {
    const modal = document.getElementById('requestModal');
    if (modal) modal.style.display = 'none';
}

// Карта соответствия английских категорий на русские
const categoryTranslations = {
    'smartphones': 'Смартфоны',
    'laptops': 'Ноутбуки',
    'tv': 'Телевизоры',
    'headphones': 'Наушники',
    'cameras': 'Камеры',
    'tablets': 'Планшеты'
};

// Обратная карта для поиска по русским названиям категорий
const reverseCategoryMap = {};
Object.entries(categoryTranslations).forEach(([en, ru]) => {
    reverseCategoryMap[ru.toLowerCase()] = en;
});

// Функция для получения русского названия категории
function getCategoryName(categoryKey) {
    return categoryTranslations[categoryKey] || categoryKey;
}

// Функция для поиска по категории (по русскому названию)
function findProductsByCategoryQuery(query) {
    const lowerQuery = query.toLowerCase();
    const matchedCategoryKey = reverseCategoryMap[lowerQuery];
    if (matchedCategoryKey) {
        return demoProducts.filter(product => product.category === matchedCategoryKey);
    }
    return [];
}

// Функции для поиска в навигации
function showNavSearchSuggestions() {
    const searchInput = document.getElementById('navSearch');
    const suggestionsContainer = document.getElementById('navSearchSuggestions');

    if (!searchInput || !suggestionsContainer) return;

    const query = searchInput.value.trim();

    if (query.length < 2) {
        suggestionsContainer.style.display = 'none';
        return;
    }

    // Поиск по названию/бренду/спецификациям
    let filteredProducts = demoProducts.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.brand.toLowerCase().includes(query.toLowerCase()) ||
        Object.values(product.specs).some(value =>
            value.toString().toLowerCase().includes(query.toLowerCase())
        )
    );

    // Если обычный поиск не дал результатов, пробуем поиск по категории
    if (filteredProducts.length === 0) {
        filteredProducts = findProductsByCategoryQuery(query);
    }

    // Ограничиваем количество результатов
    filteredProducts = filteredProducts.slice(0, 5);

    if (filteredProducts.length === 0) {
        suggestionsContainer.style.display = 'none';
        return;
    }

    // Показываем подсказки
    suggestionsContainer.innerHTML = filteredProducts.map(product => `
        <div class="search-suggestion-item" onclick="selectNavSearchSuggestion(${product.id})">
            <img src="${product.image}" alt="${product.name}">
            <div class="search-suggestion-info">
                <div class="search-suggestion-name">${product.name}</div>
                <div class="search-suggestion-category">${getCategoryName(product.category)} • ${formatPrice(product.price)} ₽</div>
            </div>
        </div>
    `).join('');

    suggestionsContainer.style.display = 'block';
}

function selectNavSearchSuggestion(productId) {
    const product = demoProducts.find(p => p.id == productId);
    if (product) {
        // Переход на страницу каталога с фильтром по категории
        window.location.href = `catalog.html?category=${product.category}&search=${encodeURIComponent(product.name)}`;
    }
}

function navSearchProducts() {
    const searchInput = document.getElementById('navSearch');
    if (!searchInput) return;

    const query = searchInput.value.trim();
    if (!query) return;

    // Сначала проверим, является ли запрос русским названием категории
    const lowerQuery = query.toLowerCase();
    const matchedCategoryKey = reverseCategoryMap[lowerQuery];

    if (matchedCategoryKey) {
        // Если это категория, переходим на каталог с фильтром по категории
        window.location.href = `catalog.html?category=${matchedCategoryKey}`;
    } else {
        // Иначе ищем по имени/бренду/спецификациям и показываем результаты на странице каталога
        // Можно передать весь запрос как строку поиска
        window.location.href = `catalog.html?search=${encodeURIComponent(query)}`;
    }
}

function handleNavSearchEnter(event) {
    if (event.key === 'Enter') {
        navSearchProducts();
    }
}

function selectNavSearchSuggestion(productId) {
    const product = demoProducts.find(p => p.id === productId);
    if (product) {
        document.getElementById('navSearch').value = product.name;
        document.getElementById('navSearchSuggestions').style.display = 'none';
        openProduct(productId);
    }
}

function handleNavSearchEnter(event) {
    if (event.key === 'Enter') {
        navSearchProducts();
        document.getElementById('navSearchSuggestions').style.display = 'none';
    }
}

function navSearchProducts() {
    const query = document.getElementById('navSearch').value.trim();
    if (query) {
        document.getElementById('navSearchSuggestions').style.display = 'none';
        window.location.href = `catalog.html?search=${encodeURIComponent(query)}`;
    }
}

//Закрытие подсказок при клике вне области для навигационного поиска
document.addEventListener('click', function(event) {
    const navSearchContainer = document.querySelector('.nav-search-container');
    const navSuggestions = document.getElementById('navSearchSuggestions');
    
    if (navSearchContainer && navSuggestions && 
        !navSearchContainer.contains(event.target) && 
        navSuggestions.style.display === 'block') {
        navSuggestions.style.display = 'none';
    }
});

// Функция для добавления в избранное
function addToFavorites() {
    if (!currentUser) {
        showAuthModal();
        showNotification('Для добавления в избранное необходимо авторизоваться', 'warning');
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        showNotification('Не удалось определить товар', 'error');
        return;
    }
    
    const product = demoProducts.find(p => p.id === parseInt(productId));
    
    if (!product) {
        showNotification('Товар не найден', 'error');
        return;
    }
    
    // Получаем текущий список избранного из localStorage
    let favorites = JSON.parse(localStorage.getItem('techAggregatorFavorites')) || [];
    
    // Проверяем, не добавлен ли уже товар
    if (favorites.some(fav => fav.id === product.id)) {
        showNotification('Этот товар уже в избранном', 'info');
        return;
    }
    
    // Добавляем товар в избранное
    favorites.push({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        image: product.image,
        addedAt: new Date().toISOString()
    });
    
    // Сохраняем в localStorage
    localStorage.setItem('techAggregatorFavorites', JSON.stringify(favorites));
    
    // Обновляем состояние кнопки
    updateFavoriteButton(true);
    
    showNotification(`${product.name} добавлен в избранное`, 'success');
}

// Функция для запроса добавления товара
function requestProductAddition() {
    if (!currentUser) {
        showAuthModal();
        showNotification('Для отправки запроса необходимо авторизоваться', 'warning');
        return;
    }
    
    // Создаем модальное окно для запроса
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h3>Запрос на добавление товара</h3>
            <form id="productRequestForm" onsubmit="submitProductRequest(event)">
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
                    <label>Ссылка на товар (если есть)</label>
                    <input type="url" id="requestUrl" 
                           placeholder="https://example.com/product">
                </div>
                <div class="form-group">
                    <label>Комментарий</label>
                    <textarea id="requestComment" rows="3" 
                              placeholder="Дополнительная информация о товаре..."></textarea>
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
    
    // Добавляем стили для модального окна, если их нет
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
    
    // Закрытие при клике вне модального окна
    modal.onclick = function(event) {
        if (event.target === modal) {
            modal.remove();
        }
    };
}

// Функция отправки запроса на добавление
function submitProductRequest(event) {
    event.preventDefault();
    
    const productName = document.getElementById('requestProductName').value;
    const category = document.getElementById('requestCategory').value;
    const brand = document.getElementById('requestBrand').value;
    const url = document.getElementById('requestUrl').value;
    const comment = document.getElementById('requestComment').value;
    const priority = document.getElementById('requestPriority').value;
    
    // В реальном приложении здесь был бы AJAX запрос к серверу
    // Для демонстрации сохраняем в localStorage
    
    const requestData = {
        id: Date.now(),
        productName,
        category,
        brand,
        url,
        comment,
        priority,
        userId: currentUser?.id || 'anonymous',
        userName: currentUser?.name || 'Аноним',
        createdAt: new Date().toISOString(),
        status: 'pending'
    };
    
    // Получаем существующие запросы
    let productRequests = JSON.parse(localStorage.getItem('techAggregatorProductRequests')) || [];
    
    // Добавляем новый запрос
    productRequests.push(requestData);
    
    // Сохраняем
    localStorage.setItem('techAggregatorProductRequests', JSON.stringify(productRequests));
    
    // Закрываем модальное окно
    event.target.closest('.modal').remove();
    
    // Показываем подтверждение
    showNotification('Запрос на добавление товара отправлен. Мы рассмотрим его в ближайшее время.', 'success');
    
    // Логируем в консоль для отладки
    console.log('Product request submitted:', requestData);
}

// Функция для добавления отзыва
function addReview() {
    if (!currentUser) {
        showAuthModal();
        showNotification('Для оставления отзыва необходимо авторизоваться', 'warning');
        return;
    }
    
    // Показываем модальное окно для отзыва
    showReviewModal();
}

// Функция для обновления состояния кнопки избранного
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

// Функция для удаления из избранного
function removeFromFavorites() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) return;
    
    let favorites = JSON.parse(localStorage.getItem('techAggregatorFavorites')) || [];
    const product = demoProducts.find(p => p.id === parseInt(productId));
    
    // Удаляем товар из избранного
    favorites = favorites.filter(fav => fav.id !== parseInt(productId));
    
    // Сохраняем обновленный список
    localStorage.setItem('techAggregatorFavorites', JSON.stringify(favorites));
    
    // Обновляем кнопку
    updateFavoriteButton(false);
    
    if (product) {
        showNotification(`${product.name} удален из избранного`, 'info');
    }
}

// Функция проверки, находится ли товар в избранном
function checkIfFavorite() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId || !currentUser) return false;
    
    const favorites = JSON.parse(localStorage.getItem('techAggregatorFavorites')) || [];
    return favorites.some(fav => fav.id === parseInt(productId));
}

// Обновляем функцию initializeProductPage для проверки избранного
function initializeProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        loadProduct(parseInt(productId));
        
        // Проверяем, находится ли товар в избранном
        const isFavorite = checkIfFavorite();
        updateFavoriteButton(isFavorite);
    }
}

// Обновляем функцию showNotification для поддержки разных типов
function showNotification(message, type = 'info') {
    // Удаляем существующие уведомления
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
    
    // Стили для уведомления
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
    
    // Стиль для кнопки закрытия
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
    
    // Автоматическое скрытие через 5 секунд
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

// Функция для быстрого сброса всех фильтров
function resetAllFilters() {
    // Сбрасываем селекты
    document.getElementById('categorySelect').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('sortSelect').value = 'name';
    
    // Сбрасываем динамические фильтры
    document.getElementById('dynamicFilters').innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #6b7280;">
            <p>Выберите категорию для отображения фильтров</p>
        </div>
    `;
    
    // Сбрасываем выбранные чекбоксы
    selectedCheckboxes = {};
    
    // Отображаем все товары
    displayProducts(demoProducts);
    updateProductsInfo(demoProducts.length, '');
}

// Функция для применения фильтров по URL параметрам
function applyURLFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Категория из URL
    const category = urlParams.get('category');
    if (category && document.getElementById('categorySelect')) {
        document.getElementById('categorySelect').value = category;
        updateFilters();
    }
    
    // Поисковый запрос из URL
    const search = urlParams.get('search');
    if (search) {
        performSearch(search);
    }
    
    // Цены из URL
    const minPrice = urlParams.get('minPrice');
    const maxPrice = urlParams.get('maxPrice');
    if (minPrice && document.getElementById('minPrice')) {
        document.getElementById('minPrice').value = minPrice;
    }
    if (maxPrice && document.getElementById('maxPrice')) {
        document.getElementById('maxPrice').value = maxPrice;
    }
    
    // Применяем фильтры
    filterProducts();
}

// Функция для поиска товаров
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

// Функция для сохранения фильтров в URL
function saveFiltersToURL() {
    const urlParams = new URLSearchParams();
    const category = document.getElementById('categorySelect')?.value;
    const minPrice = document.getElementById('minPrice')?.value;
    const maxPrice = document.getElementById('maxPrice')?.value;
    const search = document.getElementById('mainSearch')?.value;
    
    if (category) urlParams.set('category', category);
    if (minPrice) urlParams.set('minPrice', minPrice);
    if (maxPrice) urlParams.set('maxPrice', maxPrice);
    if (search) urlParams.set('search', search);
    
    // Сохраняем выбранные чекбоксы
    Object.keys(selectedCheckboxes).forEach(filterName => {
        if (selectedCheckboxes[filterName].length > 0) {
            urlParams.set(filterName, selectedCheckboxes[filterName].join(','));
        }
    });
    
    const newURL = window.location.pathname + '?' + urlParams.toString();
    window.history.pushState({}, '', newURL);
}

function renderComparisonTable() {
    const container = document.querySelector('.comparison-container');
    if (!container) return;
    
    if (comparisonList.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    // Собираем все уникальные характеристики
    const allSpecs = new Set();
    comparisonList.forEach(product => {
        Object.keys(product.specs).forEach(spec => allSpecs.add(spec));
    });
    
    const specsArray = Array.from(allSpecs);
    
    container.innerHTML = `
        <div class="comparison-table-header">
            <div class="spec-header">Характеристика</div>
            ${comparisonList.map(product => `
                <div class="product-header">
                    <img src="${product.image}" alt="${product.name}" class="comparison-img">
                    <h3>${product.name}</h3>
                    <div class="product-price">${formatPrice(product.price)} ₽</div>
                    <div class="product-rating">
                        <span class="rating-stars">${getStarRating(product.rating)}</span>
                        <span>${product.rating}</span>
                    </div>
                    <button class="btn btn-outline btn-small" onclick="removeFromComparison(${product.id})">
                        Удалить
                    </button>
                </div>
            `).join('')}
        </div>
        
        <div class="comparison-specs">
            ${specsArray.map(spec => `
                <div class="spec-row">
                    <div class="spec-name">${spec}</div>
                    ${comparisonList.map(product => `
                        <div class="spec-value">
                            ${product.specs[spec] || '—'}
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
        
        <div class="comparison-prices">
            <div class="spec-name">Цены в магазинах</div>
            ${comparisonList.map(product => `
                <div class="price-comparison">
                    ${product.prices.map(price => `
                        <div class="store-price">
                            <span>${price.store}:</span>
                            <a href="${price.url}" target="_blank" class="price-link">
                                ${formatPrice(price.price)} ₽
                            </a>
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
    `;
}

// Добавляем в конец script.js функцию для проверки данных
function debugComparison() {
    console.log('=== DEBUG COMPARISON ===');
    console.log('comparisonList:', comparisonList);
    console.log('Length:', comparisonList.length);
    
    // Проверяем localStorage
    const saved = localStorage.getItem('techAggregatorComparison');
    console.log('localStorage saved:', saved);
    
    if (saved) {
        try {
            const ids = JSON.parse(saved);
            console.log('Parsed IDs:', ids);
            console.log('Demo products count:', demoProducts.length);
            
            // Проверяем какие товары найдены
            const found = demoProducts.filter(p => ids.includes(p.id));
            console.log('Found products:', found.map(p => ({id: p.id, name: p.name})));
        } catch (e) {
            console.error('Parse error:', e);
        }
    }
    
    // Проверяем DOM элементы
    const emptyState = document.getElementById('emptyComparison');
    const table = document.getElementById('comparisonTable');
    console.log('emptyState exists:', !!emptyState);
    console.log('comparisonTable exists:', !!table);
    
    if (table) {
        console.log('table display:', table.style.display);
    }
    
    // Показываем уведомление с информацией
    showNotification(`Отладка: ${comparisonList.length} товаров в сравнении`, 'info');
}

function forceRenderComparison() {
    console.log('=== FORCE RENDER COMPARISON ===');
    console.log('Товаров в сравнении:', comparisonList.length);
    console.log('Товары:', comparisonList.map(p => ({id: p.id, name: p.name})));
    
    // Очищаем контейнер и рисуем заново
    const content = document.getElementById('comparisonContent');
    if (content) {
        console.log('Контейнер найден, очищаем и перерисовываем');
        content.innerHTML = '';
        renderComparisonTable(content);
        
        // Показываем сообщение об успехе
        showNotification('Таблица сравнения перерисована', 'success');
    } else {
        console.error('Контейнер comparisonContent не найден');
        
        // Пробуем найти по другому селектору
        const container = document.querySelector('.comparison-table') || 
                         document.querySelector('#comparisonTable > div') ||
                         document.getElementById('comparisonTable');
        
        if (container) {
            console.log('Найден альтернативный контейнер:', container);
            container.innerHTML = '';
            
            // Создаем новый контейнер для контента
            const newContent = document.createElement('div');
            newContent.id = 'comparisonContent';
            container.appendChild(newContent);
            
            renderComparisonTable(newContent);
            showNotification('Таблица сравнения создана заново', 'success');
        } else {
            console.error('Не найден ни один подходящий контейнер');
            showNotification('Не удалось найти контейнер для отрисовки', 'error');
        }
    }
}

function showCustomNotification(message, type = 'info', duration = 5000) {
    // Создаем контейнер для уведомлений, если его нет
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Иконки для разных типов
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
    
    // Добавляем в контейнер
    container.appendChild(notification);
    
    // Автоматическое закрытие через указанное время
    const closeTimeout = setTimeout(() => {
        closeNotification(notification);
    }, duration);
    
    // Обработчик для закрытия при клике
    notification.querySelector('.notification-close').addEventListener('click', () => {
        clearTimeout(closeTimeout);
        closeNotification(notification);
    });
    
    // Закрытие при клике на само уведомление (кроме кнопки закрытия)
    notification.addEventListener('click', (e) => {
        if (!e.target.closest('.notification-close')) {
            clearTimeout(closeTimeout);
            closeNotification(notification);
        }
    });
    
    // Функция плавного закрытия
    function closeNotification(notification) {
        notification.classList.add('hiding');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
            // Удаляем контейнер если он пустой
            if (container && container.children.length === 0) {
                container.remove();
            }
        }, 300);
    }
    
    // Логирование для отладки
    console.log(`Notification [${type}]: ${message}`);
}

// Удаляем старую функцию showNotification если она есть
if (typeof showNotification === 'function') {
    console.warn('Старая функция showNotification будет заменена');
}

// --- КАРУСЕЛЬ ПОПУЛЯРНЫХ ТОВАРОВ ---

// Пример данных популярных товаров (замените на реальные данные из вашего API/базы данных)
const popularProducts = [
    { id: 1, name: "iPhone 15 Pro", category: "smartphones", price: 99990, image: "https://via.placeholder.com/250x180.png?text=iPhone+15+Pro" },
    { id: 2, name: "MacBook Air M2", category: "laptops", price: 129990, image: "https://via.placeholder.com/250x180.png?text=MacBook+Air" },
    { id: 3, name: "Samsung QLED TV", category: "tv", price: 159990, image: "https://via.placeholder.com/250x180.png?text=Samsung+TV" },
    { id: 4, name: "Sony WH-1000XM5", category: "headphones", price: 24990, image: "https://via.placeholder.com/250x180.png?text=Sony+WH-1000XM5" },
    { id: 5, name: "iPad Pro 12.9", category: "laptops", price: 89990, image: "https://via.placeholder.com/250x180.png?text=iPad+Pro" },
    { id: 6, name: "AirPods Pro 2", category: "headphones", price: 22990, image: "https://via.placeholder.com/250x180.png?text=AirPods+Pro" },
    { id: 7, name: "Dell XPS 13", category: "laptops", price: 119990, image: "https://via.placeholder.com/250x180.png?text=Dell+XPS+13" },
    { id: 8, name: "LG OLED TV", category: "tv", price: 189990, image: "https://via.placeholder.com/250x180.png?text=LG+OLED" }
];

let currentIndex = 0;
const carouselTrack = document.getElementById('popularProductsCarousel');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const visibleItemsCount = 4; // Количество видимых элементов (может быть динамическим)

function renderCarousel() {
    carouselTrack.innerHTML = '';
    const itemsToShow = Math.min(popularProducts.length, visibleItemsCount);
    const startIndex = Math.max(0, Math.min(currentIndex, popularProducts.length - itemsToShow));

    for (let i = startIndex; i < startIndex + itemsToShow && i < popularProducts.length; i++) {
        const product = popularProducts[i];
        const itemElement = document.createElement('div');
        itemElement.className = 'carousel-item';
        itemElement.onclick = () => window.location.href = `product.html?id=${product.id}`; // Предполагаемая страница товара
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

    // Обновляем состояние кнопок
    prevBtn.disabled = startIndex === 0;
    nextBtn.disabled = startIndex + itemsToShow >= popularProducts.length;
}

function nextSlide() {
    if ((currentIndex + visibleItemsCount) < popularProducts.length) {
        currentIndex += 1; // Прокручиваем по одному элементу
        renderCarousel();
    }
}

function prevSlide() {
    if (currentIndex > 0) {
        currentIndex -= 1; // Прокручиваем по одному элементу
        renderCarousel();
    }
}

// Инициализация карусели
document.addEventListener('DOMContentLoaded', function() {
    renderCarousel();
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
});
// Глобальная функция для использования на других страницах
window.addToComparison = addToComparison;
window.updateComparisonCounter = updateComparisonCounter;
window.showCustomNotification = showCustomNotification;
window.getItemById = getProductById;
window.getItem = getProduct;