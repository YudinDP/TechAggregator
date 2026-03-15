//backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const bcrypt = require('bcrypt');
const { promisify } = require('util');
const axios = require('axios'); //Добавьте в начало файла, если ещё не подключен
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

//Импортируем адаптер для Prisma 7+
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

//Создаём адаптер с подключением к БД
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
//const prisma = new PrismaClient();


const app = express();
const PORT = process.env.PORT || 3000;

//Middleware
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'] //Live Server
}));
app.use(express.json());

//=== AUTH ROUTES ===
app.post('/api/auth/register', async (req, res) => {
  const { email, password, fullName } = req.body;
  try {
    const hashedPassword = await require('bcrypt').hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        fullName: fullName || null
      },
      select: { id: true, email: true, fullName: true, role: true }
    });
    res.status(201).json({ message: 'Пользователь создан', user });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }
    console.error(error);
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    //Найти пользователя по email
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    //Проверить, существует ли пользователь
    if (!user) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    //Сравнить введённый пароль с хэшем из БД
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }
    //В payload обязательно включаем id, email и role
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,

        role: user.role 
      },
      process.env.JWT_SECRET, 
      { expiresIn: '7d' } //Токен действителен 7 дней
    );



    //Отправляем токен и основную информацию о пользователе
    res.json({
      token: token, 
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName, 
        role: user.role 
      }
    });
    //--- /ОТПРАВКА ОТВЕТА ---

  } catch (error) {
    console.error('Ошибка входа:', error); //Логируем ошибку на сервере
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
});

//=== PRODUCT ROUTES ===
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        specs: true,
        prices: true
      }
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Не удалось загрузить товары' });
  }
});

//=== HEALTH CHECK ===
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Backend + Prisma + PostgreSQL работают!' });
});

//Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});

//=== ПРОФИЛЬ И ЛИЧНЫЕ ДАННЫЕ ===

//Получить профиль текущего пользователя
app.get('/api/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, fullName: true, createdAt: true }
    });
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Ошибка профиля:', err);
    res.status(401).json({ error: 'Неверный токен' });
  }
});

//Получить избранные товары
app.get('/api/favorites', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const favorites = await prisma.favorite.findMany({
      where: { userId: payload.id },
      include: {
        product: {
          include: {
            specs: true,
            prices: true
          }
        }
      }
    });
    res.json(favorites.map(f => f.product));
  } catch (err) {
    console.error('Ошибка избранного:', err);
    res.status(401).json({ error: 'Неверный токен' });
  }
});

//Получить товары в сравнении
app.get('/api/comparisons', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const comparisons = await prisma.comparison.findMany({
      where: { userId: payload.id },
      include: {
        product: {
          include: {
            specs: true,
            prices: true
          }
        }
      }
    });
    res.json(comparisons.map(c => c.product));
  } catch (err) {
    console.error('Ошибка сравнения:', err);
    res.status(401).json({ error: 'Неверный токен' });
  }
});


//Добавить в избранное
app.post('/api/favorites', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const { productId } = req.body;

    //Проверяем, существует ли товар
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Товар не найден' });

    //Добавляем в избранное
    await prisma.favorite.create({
      data: { userId: payload.id, productId }
    });

    res.json({ message: 'Добавлено в избранное' });
  } catch (err) {
    console.error('Ошибка добавления в избранное:', err);
    res.status(500).json({ error: 'Не удалось добавить в избранное' });
  }
});

//Добавить в сравнение
app.post('/api/comparisons', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const { productId } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Товар не найден' });

    await prisma.comparison.create({
      data: { userId: payload.id, productId }
    });

    res.json({ message: 'Добавлено в сравнение' });
  } catch (err) {
    console.error('Ошибка добавления в сравнение:', err);
    res.status(500).json({ error: 'Не удалось добавить в сравнение' });
  }
});

//Удалить все товары пользователя из сравнения по категории
app.delete('/api/comparisons/clear', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const userId = payload.id;
    const category = req.query.category;

    if (!category) {
      return res.status(400).json({ error: 'Укажите категорию для удаления' });
    }

    //Получаем ID всех товаров в указанной категории
    const productsInCategory = await prisma.product.findMany({
      where: { category },
      select: { id: true }
    });

    const productIds = productsInCategory.map(p => p.id);

    if (productIds.length === 0) {
      return res.json({ message: 'Нет товаров в этой категории', count: 0 });
    }

    //Удаляем все записи из таблицы comparisons
    const result = await prisma.comparison.deleteMany({
      where: {
        userId: userId,
        productId: { in: productIds } //← ПРАВИЛЬНЫЙ СИНТАКСИС
      }
    });

    res.json({ 
      message: `Удалено ${result.count} товаров из категории "${category}"`,
      count: result.count 
    });

  } catch (err) {
    console.error('Ошибка очистки сравнения:', err);
    res.status(500).json({ error: 'Не удалось очистить сравнение' });
  }
});

//Удалить из избранного
app.delete('/api/favorites/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const productId = parseInt(req.params.id);
    await prisma.favorite.deleteMany({
      where: { userId: payload.id, productId }
    });
    res.json({ message: 'Удалено из избранного' });
  } catch (err) {
    console.error('Ошибка удаления избранного:', err);
    res.status(500).json({ error: 'Не удалось удалить' });
  }
});

//Удалить из сравнения
//Удалить товар из сравнения по ID товара
app.delete('/api/comparisons/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const userId = payload.id;
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Некорректный ID товара' });
    }

    //Удаляем запись из таблицы comparisons
    const result = await prisma.comparison.deleteMany({
      where: {
        userId: userId,
        productId: productId //← ПРАВИЛЬНО: явное значение
      }
    });

    if (result.count > 0) {
      res.json({ message: 'Товар удалён из сравнения', count: result.count });
    } else {
      res.status(404).json({ error: 'Товар не найден в сравнении' });
    }

  } catch (err) {
    console.error('Ошибка удаления сравнения:', err);
    res.status(500).json({ error: 'Не удалось удалить товар из сравнения' });
  }
});

app.get('/api/favorites/check/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const productId = parseInt(req.params.id);
    const exists = await prisma.favorite.findFirst({
      where: { userId: payload.id, productId }
    });
    res.json({ isFavorite: !!exists });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка проверки' });
  }
});

app.get('/api/products/:id/price-history', async (req, res) => {
  try {
    //Получаем ID товара из параметров URL
    const productId = parseInt(req.params.id, 10);

    //Проверяем, является ли ID числом
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    console.log(`Fetching price history for product ID: ${productId}`); //Лог для отладки

    //Запрашиваем историю цен из БД через Prisma
    const priceHistoryRecords = await prisma.priceHistory.findMany({
      where: {
        productId: productId, //Фильтруем по ID товара
      },
      select: {
        storeName: true, //Выбираем имя магазина
        price: true,     //Выбираем цену
        date: true,      //Выбираем дату
        //id и createdAt не обязательны для графика, можно не включать
      },
      orderBy: [
        { storeName: 'asc' }, //Сначала сортируем по магазину
        { date: 'asc' }       //Потом по дате
      ],
    });

    console.log(`Found ${priceHistoryRecords.length} records for product ID: ${productId}`); //Лог для отладки

    //Если записи не найдены
    if (priceHistoryRecords.length === 0) {
       console.log(`No price history found for product ID: ${productId}`);
       return res.status(200).json({}); //Возвращаем пустой объект или массив, если нет данных
    }

    //Группируем записи по магазинам для удобства построения графика
    const groupedByStore = priceHistoryRecords.reduce((acc, record) => {
      const storeName = record.storeName;
      if (!acc[storeName]) {
        acc[storeName] = [];
      }
      //Преобразуем Decimal (Prisma) в Number и форматируем дату, если нужно
      //Chart.js лучше работает с объектами {x: Date, y: Number}
      acc[storeName].push({
        x: new Date(record.date).toISOString(), //Используем ISO строку для Chart.js
        y: parseFloat(record.price) //Преобразуем Decimal в Number
      });
      return acc;
    }, {});

    console.log(`Grouped data by store for product ID: ${productId}`, Object.keys(groupedByStore)); //Лог для отладки

    //Отправляем сгруппированные данные клиенту
    res.json(groupedByStore);

  } catch (error) {
    console.error('Error fetching price history:', error);
    //Отправляем ошибку клиенту
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; //"Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    //Используем promisify для jwt.verify
    const user = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    req.user = user; //Добавляем информацию о пользователе в req
    next(); //Переходим к следующему middleware
  } catch (err) {
    console.error('Token verification error:', err);
    //Проверяем тип ошибки
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token format' }); //Более точное сообщение
    } else {
      //Другие ошибки
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
  }
};

app.post('/api/reviews', authenticateToken, async (req, res) => {
  console.log('--- НАЧАЛО ОБРАБОТКИ POST /api/reviews ---');
  console.log('Тело запроса (req.body):', req.body);
  console.log('Пользователь из токена (req.user):', req.user);

  // ИСПРАВЛЕНО: принимаем productId как строку или число
  const { productId, rating, text } = req.body; // text - это правильно, клиент отправляет 'text'

  // --- ИСПРАВЛЕННАЯ ВАЛИДАЦИЯ ---
  if (
    // productId должен быть числом (как пришедшее с клиента) или строкой, которую можно превратить в число
    productId == null || // Проверка на null или undefined
    (typeof productId !== 'number' && (typeof productId !== 'string' || isNaN(parseInt(productId, 10)))) ||
    !rating ||
    typeof rating !== 'number' ||
    rating < 1 ||
    rating > 5
  ) {
    console.log('  -> ОШИБКА ВАЛИДАЦИИ: productId или rating неверны.');
    console.log(`     productId: ${productId} (type: ${typeof productId}), rating: ${rating} (type: ${typeof rating})`);
    return res.status(400).json({ error: 'Product ID и rating (1-5) обязательны.' });
  }

  // Преобразуем productId к числу для дальнейшего использования
  const parsedProductId = typeof productId === 'string' ? parseInt(productId, 10) : productId;

  // Проверяем, существует ли товар
  const productExists = await prisma.product.findUnique({
    where: { id: parsedProductId } // <-- Используем parsedProductId
  });
  if (!productExists) {
    console.log(`  -> ОШИБКА: Товар с ID ${parsedProductId} не найден.`);
    return res.status(404).json({ error: 'Product not found.' });
  }

  try {
    console.log(`  -> Подготовка к созданию отзыва для товара ${parsedProductId}, рейтинг ${rating}, текст: "${text}"`);
    // Создаём отзыв
    const newReview = await prisma.review.create({
       data:{
        userId: req.user.id,
        productId: parsedProductId, // <-- Используем parsedProductId
        userName: req.user.fullName || req.user.email.split('@')[0],
        rating: rating,
        comment: text ? text.trim() : null, // <-- Сохраняем 'text' (из req.body) в поле 'comment' (в БД)
        // isApproved: false, status: 'pending' - установлены по умолчанию
      }
    });

    console.log(`  -> Отзыв успешно создан в БД с ID ${newReview.id}, comment: "${newReview.comment}"`);
    res.status(201).json(newReview);

  } catch (error) {
    console.error('  -> ОШИБКА СОЗДАНИЯ ОТЗЫВА В БАЗЕ:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
  console.log('--- КОНЕЦ ОБРАБОТКИ POST /api/reviews ---');
});



async function recalculateProductRating(productId) {
  console.log(`[DEBUG] recalculateProductRating: Начинаю пересчёт для товара ID: ${productId}`);

  try {
    // 1. Получаем среднюю оценку только по *одобренным* отзывам для данного товара
    // ВАЖНО: Убедитесь, что используете ПРАВИЛЬНОЕ поле для фильтрации одобренных отзывов!
    // В schemaprisma.txt для модели Review определены и 'isApproved' и 'status'.
    // Пример: использовать 'status'
    const avgRatingResult = await prisma.review.aggregate({
      where: {
        productId: productId,
        // status: 'approved' // <-- ИСПОЛЬЗУЙТЕ ЭТО, если в схеме Review есть поле 'status'
        isApproved: true // <-- ИСПОЛЬЗУЙТЕ ЭТО, если в схеме Review есть поле 'isApproved'
      },
      _avg: {
        rating: true // <-- Вычисляем среднее значение поля 'rating' (Int)
      }
    });

    // avgRatingResult._avg.rating может быть null, если нет одобренных отзывов
    const newAverageRating = avgRatingResult._avg.rating;
    console.log(`[DEBUG] recalculateProductRating: Средняя оценка (из aggregate): ${newAverageRating} (type: ${typeof newAverageRating})`);

    // 2. Обновляем поле 'rating' в таблице 'Product'
    // ИСПРАВЛЕНО: ПРАВИЛЬНЫЙ СИНТАКСИС prisma.product.update
    // ИСПРАВЛЕНО: УБРАНО: 'id: productId' из data
    const updatedProduct = await prisma.product.update({
      where: { id: productId }, // <-- Условие, ЧТО обновлять (id товара)
       data:{
        // Поля, КОТОРЫЕ обновляются (в данном случае - rating)
        // Если newAverageRating - число, используем его, иначе устанавливаем 0.0
        rating: typeof newAverageRating === 'number' ? newAverageRating : 0.0
      }
    });
    // --- /ИСПРАВЛЕНО ---

    console.log(`[DEBUG] recalculateProductRating: Рейтинг товара ID ${productId} обновлён до ${updatedProduct.rating}`);
  } catch (error) {
    console.error(`[ERROR] recalculateProductRating: Ошибка пересчёта для товара ID ${productId}:`, error.message);
    // Не выбрасываем ошибку, чтобы не прерывать основной процесс (например, добавление/одобрение отзыва)
    // Но логируем её.
  }
}

//Получить *одобренные* отзывы для товара (без авторизации)
app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);

    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    //Получаем только *одобренные* отзывы для отображения
    const reviews = await prisma.review.findMany({
      where: {
        productId: productId,
        isApproved: true 
      },
      include: {
        user: { //Подгружаем данные пользователя (если есть), чтобы показать fullName
          select: { fullName: true } //Выбираем только имя, не пароль и т.д.
        }
      },
      orderBy: {
        createdAt: 'desc' 
      }
    });

    res.json(reviews);

  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

//Отправить запрос на добавление товара (требует авторизации)
app.post('/api/requests', authenticateToken, async (req, res) => {
  try {

    const { productName, category, url, comment } = req.body;
    const userId = req.user.id;

    //Валидация
    if (!productName || typeof productName !== 'string' || productName.trim() === '') {
      return res.status(400).json({ error: 'Поле "productName" обязательно и должно быть строкой.' });
    }
    //Опциональные поля: category, url, comment
    //Проверим, что, если поле передано, оно строковое
    if (category && typeof category !== 'string') {
      return res.status(400).json({ error: 'Поле "category", если указано, должно быть строкой.' });
    }
    if (url && typeof url !== 'string') {
      return res.status(400).json({ error: 'Поле "url", если указано, должно быть строкой.' });
    }
    if (comment && typeof comment !== 'string') {
      return res.status(400).json({ error: 'Поле "comment", если указано, должно быть строкой.' });
    }

    //Создаём запрос
    //ПЕРЕДАЁМ url и comment в data
    const newRequest = await prisma.request.create({
       data:{
        userId, //ID пользователя
        productName: productName.trim(), //Название товара
        category: category ? category.trim() : null, //Категория (опционально)
        url: url ? url.trim() : null, 
        comment: comment ? comment.trim() : null, 
      }
    });

    res.status(201).json(newRequest);

  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});


const requireAdminRole = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён. Требуются права администратора.' });
  }
  next();
};

app.get('/api/admin/reviews', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { fullName: true, email: true } }, //Подгрузим данные пользователя
        product: { select: { name: true, category: true } } //Подгрузим данные товара
      },
      orderBy: { createdAt: 'desc' } //Сортируем по дате создания, новые сверху
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews for admin:', error);
    res.status(500).json({ error: 'Не удалось загрузить отзывы' });
  }
});

//PATCH /api/admin/reviews/:id - Обновить статус отзыва
app.patch('/api/admin/reviews/:id', authenticateToken, requireAdminRole, async (req, res) => {
  const reviewId = parseInt(req.params.id, 10);
  const { status, adminNotes } = req.body; // Ожидаем статус и, опционально, заметки

  if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be pending, approved, or rejected.' });
  }

  try {
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
       data:{
        status: status,
        isApproved: status === 'approved', // <-- Обновляем isApproved на основе status
        adminNotes: adminNotes || null,
        processedAt: new Date()
      },
      include: {
        user: { select: { fullName: true, email: true } },
        product: { select: { id: true, name: true, category: true } } // <-- Включаем product для пересчёта
      }
    });

    // --- ВАЖНО: ПЕРЕСЧИТАТЬ РЕЙТИНГ ПОСЛЕ ОБНОВЛЕНИЯ СТАТУСА ОТЗЫВА ---
    // Обновляем рейтинг для товара, к которому относится отзыв
    // ИСПРАВЛЕНО: передаём productId из обновлённого отзыва
    await recalculateProductRating(updatedReview.productId);

    res.json(updatedReview);
  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({ error: 'Не удалось обновить отзыв' });
  }
});

app.delete('/api/admin/reviews/:id', authenticateToken, requireAdminRole, async (req, res) => {
  const reviewId = parseInt(req.params.id, 10);

  try {
    const reviewToDelete = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { productId: true } // <-- Нужен ID товара для пересчёта
    });

    if (!reviewToDelete) {
      return res.status(404).json({ error: 'Отзыв не найден.' });
    }

    await prisma.review.delete({
      where: { id: reviewId }
    });

    // --- ВАЖНО: ПЕРЕСЧИТАТЬ РЕЙТИНГ ПОСЛЕ УДАЛЕНИЯ ОТЗЫВА ---
    await recalculateProductRating(reviewToDelete.productId);

    res.json({ message: `Отзыв ID ${reviewId} успешно удалён.` });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Не удалось удалить отзыв.' });
  }
});

//GET /api/admin/requests - Получить все запросы на добавление товара
app.get('/api/admin/requests', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    const requests = await prisma.request.findMany({
      include: {
        user: { select: { fullName: true, email: true } } //Подгрузим данные пользователя
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests for admin:', error);
    res.status(500).json({ error: 'Не удалось загрузить запросы' });
  }
});

//PATCH /api/admin/requests/:id - Обновить статус запроса
app.patch('/api/admin/requests/:id', authenticateToken, requireAdminRole, async (req, res) => {
  const requestId = parseInt(req.params.id, 10);
  const { status, adminNotes } = req.body;

  if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be pending, approved, or rejected.' });
  }

  try {
    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: {
        status: status,
        adminNotes: adminNotes || null,
        processedAt: new Date()
      },
      include: {
        user: { select: { fullName: true, email: true } }
      }
    });
    res.json(updatedRequest);
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ error: 'Не удалось обновить запрос' });
  }
});

//--- ОБЩИЙ РЕДАКТОР ТАБЛИЦ ---

//GET /api/admin/tables - Получить список всех таблиц (для выбора в админке)
app.get('/api/admin/tables', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    //Запрос к INFORMATION_SCHEMA PostgreSQL для получения имён таблиц
    const result = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    //Результат возвращается как массив объектов { table_name: '...' }
    const tableNames = result.map(row => row.table_name);
    res.json(tableNames);
  } catch (error) {
    console.error('Error fetching table list:', error);
    res.status(500).json({ error: 'Не удалось получить список таблиц', details: error.message });
  }
});

//GET /api/admin/table/:tableName - Получить данные из таблицы
app.get('/api/admin/table/:tableName', authenticateToken, requireAdminRole, async (req, res) => {
  const tableName = req.params.tableName;
  const allowedTables = ['Product', 'ProductSpec', 'Price', 'Review', 'Request', 'User', 'PriceHistory'];
  const prismaModelMap = {
    'Product': 'product',
    'ProductSpec': 'productSpec',
    'Price': 'price',
    'Review': 'review',
    'Request': 'request',
    'User': 'user',
    'PriceHistory': 'priceHistory'
  };

  if (!allowedTables.includes(tableName)) {
    return res.status(400).json({ error: 'Таблица не разрешена для редактирования' });
  }

  const prismaModelKey = prismaModelMap[tableName];
  if (!prismaModelKey) {
    return res.status(400).json({ error: 'Таблица не найдена в Prisma Client' });
  }

  // --- ПАРАМЕТРЫ ПОИСКА ---
  const { searchField, searchValue } = req.query;
  // --- /ПАРАМЕТРЫ ПОИСКА ---

  try {
    const modelClient = prisma[prismaModelKey];
    if (!modelClient) {
      throw new Error(`Model client for ${tableName} (${prismaModelKey}) not found in Prisma.`);
    }

    // --- УСЛОВИЕ ПОИСКА ---
    let whereClause = {};
    if (searchField && searchValue) {
      // Проверим, существует ли поле в модели (опционально, но безопаснее)
      // Для простоты, будем считать, что клиент отправляет корректные имена полей
      whereClause[searchField] = {
        contains: searchValue,
        mode: 'insensitive'
      };
    }
    // --- /УСЛОВИЕ ПОИСКА ---

    const data = await modelClient.findMany({
      where: whereClause,
      take: 1000 // Увеличенный лимит
    });

    res.json(data);
  } catch (error) {
    console.error(`Error fetching data from table ${tableName}:`, error);
    res.status(500).json({ error: `Не удалось загрузить данные из таблицы ${tableName}` });
  }
});

//POST /api/admin/table/:tableName - Добавить запись в таблицу
app.post('/api/admin/table/:tableName', authenticateToken, requireAdminRole, async (req, res) => {
  const tableName = req.params.tableName;
  const allowedTables = ['Product', 'ProductSpec', 'Price', 'Review', 'Request', 'User', 'PriceHistory'];
  const prismaModelMap = {
    'Product': 'product',
    'ProductSpec': 'productSpec',
    'Price': 'price',
    'Review': 'review',
    'Request': 'request',
    'User': 'user',
    'PriceHistory': 'priceHistory'
  };

  if (!allowedTables.includes(tableName)) {
    return res.status(400).json({ error: 'Таблица не разрешена для редактирования' });
  }

  const prismaModelKey = prismaModelMap[tableName];
  if (!prismaModelKey) {
    return res.status(400).json({ error: 'Таблица не найдена в Prisma Client' });
  }

  const data = req.body;

  try {
    const modelClient = prisma[prismaModelKey];
    if (!modelClient) {
      throw new Error(`Model client for ${tableName} (${prismaModelKey}) not found in Prisma.`);
    }

    //Используем uncheckedCreate, чтобы обойти некоторые проверки связей при необходимости
    //ВАЖНО: Это менее безопасно, чем создание через конкретные поля.
    //Лучше реализовать отдельные маршруты для каждой модели с явной валидацией.
    //Но для универсального редактора, это может быть приемлемым компромиссом.
    const createdRecord = await modelClient.create({
      data: data
    });
    res.status(201).json(createdRecord);
  } catch (error) {
    console.error(`Error creating record in table ${tableName}:`, error);
    res.status(500).json({ error: `Не удалось добавить запись в таблицу ${tableName}` });
  }
});

//PUT /api/admin/table/:tableName/:id - Обновить запись в таблице
app.put('/api/admin/table/:tableName/:id', authenticateToken, requireAdminRole, async (req, res) => {
  const tableName = req.params.tableName;
  const recordId = parseInt(req.params.id, 10);

  const allowedTables = ['Product', 'ProductSpec', 'Price', 'Review', 'Request', 'User', 'PriceHistory'];
  const prismaModelMap = {
    'Product': 'product',
    'ProductSpec': 'productSpec',
    'Price': 'price',
    'Review': 'review',
    'Request': 'request',
    'User': 'user',
    'PriceHistory': 'priceHistory'
  };

  if (!allowedTables.includes(tableName)) {
    return res.status(400).json({ error: 'Таблица не разрешена для редактирования' });
  }

  const prismaModelKey = prismaModelMap[tableName];
  if (!prismaModelKey) {
    return res.status(400).json({ error: 'Таблица не найдена в Prisma Client' });
  }

  let receivedData = req.body;
  console.log(`Получены данные для обновления записи ID ${recordId} в таблице ${tableName}:`, receivedData);

  const { id, ...dataForUpdate } = receivedData;
  console.log(`Данные для обновления (без id):`, dataForUpdate);

  try {
    const modelClient = prisma[prismaModelKey];
    if (!modelClient) {
      throw new Error(`Model client for ${tableName} (${prismaModelKey}) not found in Prisma.`);
    }

    // --- КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ 2: ПРЕОБРАЗОВАНИЕ ТИПОВ ДАННЫХ ---
    const modelTypeMap = {
      'product': {
        id: 'Int',
        name: 'String',
        category: 'String',
        description: 'String',
        imageUrl: 'String',
        rating: 'Float',
        isActive: 'Boolean',
        createdAt: 'DateTime',
        updatedAt: 'DateTime',
      },
      'productSpec': { // <-- Используем имя модели из Prisma
        id: 'Int',
        productId: 'Int', // <-- Ожидается Int
        specKey: 'String',
        specValue: 'String',
      },
      'price': {
        id: 'Int',
        productId: 'Int',
        storeName: 'String',
        price: 'Int', // или Float/Decimal
        url: 'String',
        recordedAt: 'DateTime',
      },
      'review': {
        id: 'Int',
        userId: 'Int',
        productId: 'Int',
        userName: 'String',
        rating: 'Int',
        comment: 'String',
        isApproved: 'Boolean',
        status: 'String',
        adminNotes: 'String?',
        createdAt: 'DateTime',
        updatedAt: 'DateTime',
        processedAt: 'DateTime?',
      },
      'request': {
        id: 'Int',
        userId: 'Int',
        productId: 'Int',
        status: 'String',
        requestType: 'String',
        message: 'String?',
        createdAt: 'DateTime',
        updatedAt: 'DateTime',
      },
      'user': {
        id: 'Int',
        email: 'String',
        fullName: 'String',
        role: 'String',
        createdAt: 'DateTime',
        updatedAt: 'DateTime',
      },
      'priceHistory': {
        id: 'Int',
        productId: 'Int',
        storeName: 'String',
        price: 'Int', // или Float/Decimal
        date: 'DateTime',
      },
    };

    const expectedTypes = modelTypeMap[prismaModelKey];
    if (expectedTypes) {
      for (const [key, value] of Object.entries(dataForUpdate)) {
        const expectedType = expectedTypes[key];
        if (expectedType) {
          switch (expectedType) {
            case 'Int':
              if (typeof value === 'string' && !isNaN(parseInt(value, 10))) {
                dataForUpdate[key] = parseInt(value, 10);
              } else if (typeof value !== 'number') {
                dataForUpdate[key] = 0; // Или null, в зависимости от схемы
              }
              break;
            case 'Float':
            case 'Decimal':
              if (typeof value === 'string' && !isNaN(parseFloat(value))) {
                dataForUpdate[key] = parseFloat(value);
              } else if (typeof value !== 'number') {
                dataForUpdate[key] = 0.0; // Или null
              }
              break;
            case 'Boolean':
              if (typeof value === 'string') {
                dataForUpdate[key] = value.toLowerCase() === 'true';
              } else if (typeof value !== 'boolean') {
                dataForUpdate[key] = false;
              }
              break;
            case 'DateTime':
              if (typeof value === 'string') {
                dataForUpdate[key] = new Date(value);
              } else if (!(value instanceof Date)) {
                dataForUpdate[key] = new Date(); // Или null
              }
              break;
            default:
              if (typeof value === 'string') {
                dataForUpdate[key] = value.trim();
              }
          }
        }
      }
    }
    // --- /КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ 2 ---

    // --- ИСПРАВЛЕНО: ПРАВИЛЬНЫЙ СИНТАКСИС ДЛЯ update ---
    const updatedRecord = await modelClient.update({
       
        where: { id: recordId }, // Условие
         data:{
          ...dataForUpdate // Правильное место для передачи полей обновления
        }
      
    });
    // --- /ИСПРАВЛЕНО ---

    console.log(`Запись ID ${recordId} в таблице ${tableName} успешно обновлена.`, updatedRecord);
    res.json(updatedRecord);

  } catch (error) {
    console.error(`Error updating record in table ${tableName}:`, error);
    res.status(500).json({ error: `Не удалось обновить запись в таблице ${tableName}` });
  }
});

//DELETE /api/admin/table/:tableName/:id - Удалить запись из таблицы
app.delete('/api/admin/table/:tableName/:id', authenticateToken, requireAdminRole, async (req, res) => {
  const tableName = req.params.tableName;
  const recordId = parseInt(req.params.id, 10);
  const allowedTables = ['Product', 'ProductSpec', 'Price', 'Review', 'Request', 'User', 'PriceHistory'];
  const prismaModelMap = {
    'Product': 'product',
    'ProductSpec': 'productSpec',
    'Price': 'price',
    'Review': 'review',
    'Request': 'request',
    'User': 'user',
    'PriceHistory': 'priceHistory'
  };

  if (!allowedTables.includes(tableName)) {
    return res.status(400).json({ error: 'Таблица не разрешена для редактирования' });
  }

  const prismaModelKey = prismaModelMap[tableName];
  if (!prismaModelKey) {
    return res.status(400).json({ error: 'Таблица не найдена в Prisma Client' });
  }

  try {
    const modelClient = prisma[prismaModelKey];
    if (!modelClient) {
      throw new Error(`Model client for ${tableName} (${prismaModelKey}) not found in Prisma.`);
    }

    await modelClient.delete({
      where: { id: recordId }
    });
    res.json({ message: `Запись ID ${recordId} из таблицы ${tableName} успешно удалена.` });
  } catch (error) {
    console.error(`Error deleting record from table ${tableName}:`, error);
    res.status(500).json({ error: `Не удалось удалить запись из таблицы ${tableName}` });
  }
});


//Получить статистику для главной панели
app.get('/api/admin/dashboard-stats', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    const totalProducts = await prisma.product.count();

    const pendingReviews = await prisma.review.count({ where: { isApproved: false } }); 

    const pendingRequests = await prisma.request.count({ where: { status: 'pending' } }); 

    res.json({
      totalProducts,
      pendingReviews,
      pendingRequests
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Не удалось загрузить статистику', details: error.message });
  }
});

//Получить основную аналитику
app.get('/api/admin/analytics/stats', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    //Эти данные нужно будет как-то собирать, возможно, в отдельной таблице или через сложные запросы

    const dailyViews = 1247; 
    const purchaseClicks = 312; 
    const serverLoad = 68; 
    const responseTime = 142; 

    res.json({
      dailyViews,
      purchaseClicks,
      serverLoad,
      responseTime,
      dailyViewsChange: 8.5,
      purchaseClicksChange: 12.3,
      serverLoadChange: 5.0,
      responseTimeChange: -15.0
    });
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    res.status(500).json({ error: 'Не удалось загрузить аналитику' });
  }
});

//Получить популярные поиски
app.get('/api/admin/analytics/popular-searches', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    
    const popularSearches = [
      { term: 'iPhone 15', count: 120 },
      { term: 'Samsung Galaxy S24', count: 98 },
      { term: 'MacBook Air M2', count: 87 },
      { term: 'AirPods Pro', count: 76 },
      { term: 'PlayStation 5', count: 65 }
    ];
    res.json(popularSearches);
  } catch (error) {
    console.error('Error fetching popular searches:', error);
    res.status(500).json({ error: 'Не удалось загрузить популярные поиски' });
  }
});

//Получить список всех пользователей
app.get('/api/admin/users', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' } //Сортировка по дате регистрации
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Не удалось загрузить пользователей' });
  }
});


app.post('/api/admin/users/:id/send-message', authenticateToken, requireAdminRole, async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Текст сообщения обязателен.' });
  }

  try {
    //Найти пользователя
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден.' });
    }

    //Отправить сообщение (например, на email, или сохранить в отдельную таблицу сообщений)
    console.log(`Сообщение для пользователя ${user.email} (${user.id}): ${message}`);

    res.json({ message: 'Сообщение отправлено.' });
  } catch (error) {
    console.error('Error sending message to user:', error);
    res.status(500).json({ error: 'Не удалось отправить сообщение.' });
  }
});

//Удалить пользователя
app.delete('/api/admin/users/:id', authenticateToken, requireAdminRole, async (req, res) => {
  const userId = parseInt(req.params.id, 10);

  try {
    //Удаление пользователя (каскадно удалит связанные данные, если настроено в schema.prisma)
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: `Пользователь ID ${userId} успешно удалён.` });
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Пользователь не найден.' });
    }
    res.status(500).json({ error: 'Не удалось удалить пользователя.' });
  }
});


async function parseProductFromDnsShop(url, proxy = null) {
  console.log(`Парсим товар с DNS (puppeteer): ${url}, через proxy: ${proxy || 'нет'}`);

  let browser;
  try {
    const launchOptions = {
      headless: true, // false для отладки
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-ipc-flooding-protection',
        '--disable-background-networking',
        '--lang=ru-RU',
        '--timezone-policy=host',
        // '--proxy-server=http://your-proxy-ip:port', //Если прокси передан, можно указать здесь
        // '--user-data-dir=/tmp/chrome-user-data', 
      ],
    };

    // Если передан прокси, добавляем его в опции
    if (proxy) {
      launchOptions.args.push(`--proxy-server=${proxy}`);
      console.log(`  -> Используется прокси: ${proxy}`);
    }

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    //Иммитация браузера
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Ch-Ua': '"Chromium";v="120", "Not_A Brand";v="8"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    });

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Отключим детектор headless браузера
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      // Дополнительно: изменим некоторые свойства
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5], // Имитация плагинов
      });
      Object.defineProperty(navigator, 'languages', {
        get: () => ['ru-RU', 'ru', 'en-US', 'en'],
      });
    });
    // --- /НАСТРОЙКА PAGE ---

    console.log(`  -> Открываем страницу: ${url}`);
    const response = await page.goto(url, {
      waitUntil: 'networkidle2', // Ждём, пока сеть не станет "тихой"
      timeout: 30000, // 30 секунд
    });

    //Проверка ответа
    const status = response.status();
    if (status === 401 || status === 403 || status === 429) {
      throw new Error(`DNS-шоп вернул статус ${status} - доступ запрещён или ограничение скорости. IP может быть заблокирован.`);
    } else if (!response.ok()) {
      throw new Error(`DNS-шоп вернул статус ${status} - ошибка загрузки страницы.`);
    }
    // --- /ПРОВЕРКА ОТВЕТА ---

    // --- ИМИТАЦИЯ ЧЕЛОВЕКА ---
    // Подождать немного (имитация человеческой задержки)
    await page.waitForTimeout(Math.random() * 2000 + 1000); // Случайная задержка 1-3 сек

    // Прокрутка страницы (имитация просмотра)
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight / 2);
    });

    await page.waitForTimeout(Math.random() * 1000 + 500); // Ещё задержка
    // --- /ИМИТАЦИЯ ЧЕЛОВЕКА ---

    // Ждём, пока появится элемент с названием (увеличиваем таймаут)
    await page.waitForSelector('.product-card-top__name span, .product-buy__title, h1', { timeout: 15000 });

    // Извлекаем данные с помощью evaluate
    const data = await page.evaluate(() => {
      // --- ИЗВЛЕЧЕНИЕ ДАННЫХ ---
      // Название
      const nameElement = document.querySelector('.product-card-top__name span');
      const buyTitleElement = document.querySelector('.product-buy__title');
      const h1Element = document.querySelector('h1');
      const name = (nameElement || buyTitleElement || h1Element)?.innerText?.trim() || 'Неизвестное название';

      // Цена (пример, может измениться)
      let price = null;
      const priceSelectors = [
        '.product-buy__price-current',
        '.product-price__current',
        '.actual-price',
      ];

      for (const sel of priceSelectors) {
        const priceEl = document.querySelector(sel);
        if (priceEl) {
          let priceText = priceEl.innerText;
          priceText = priceText.replace(/\s/g, '').replace(/[^\d]/g, '');
          if (priceText) {
            price = parseInt(priceText, 10);
            if (!isNaN(price)) break; // Нашли цену, выходим из цикла
          }
        }
      }

      // Изображение
      let imageUrl = document.querySelector('.swiper-slide__img')?.src ||
                     document.querySelector('.product-image__preview img')?.src ||
                     document.querySelector('.gallery__main-image img')?.src ||
                     null;
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = 'https:' + imageUrl;
      }

      // Характеристики (пример)
      const specs = {};
      const specRows = document.querySelectorAll('.product-characteristics__list dl'); // Таблица характеристик
      specRows.forEach(dl => {
        const dt = dl.querySelector('dt');
        const dd = dl.querySelector('dd');
        if (dt && dd) {
          const key = dt.innerText.trim();
          const value = dd.innerText.trim();
          if (key && value) {
            specs[key] = value;
          }
        }
      });

      return {
        name,
        price, // Может быть null
        imageUrl, // Может быть null
        specs, // Объект
      };
    });

    console.log('  -> Данные извлечены puppeteer:', data);

    // Закрываем браузер
    await browser.close();

    // Возвращаем объект с данными
    return {
      source: 'DNS-shop (puppeteer)',
      name: data.name,
      price: data.price,
      imageUrl: data.imageUrl,
      sourceUrl: url,
      specs: data.specs
    };

  } catch (error) {
    // Обязательно закрываем браузер в случае ошибки
    if (browser) {
      await browser.close().catch(console.error);
    }
    console.error('  -> Ошибка парсинга с DNS (puppeteer):', error.message);
    // Более информативное сообщение об ошибке
    throw new Error(`Ошибка парсинга с DNS (puppeteer): ${error.message}`);
  }
}
// --- /ФУНКЦИЯ ПАРСИНГА С DNS-SHOP ---

// --- ФУНКЦИЯ ПАРСИНГА С OZON (с использованием puppeteer, улучшенная) ---
// (Код остаётся тем же, что был предоставлен ранее)
async function parseProductFromOzon(url, proxy = null) {
  console.log(`Парсим товар с OZON (puppeteer): ${url}, через proxy: ${proxy || 'нет'}`);

  let browser;
  try {
    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-ipc-flooding-protection',
        '--disable-background-networking',
        '--lang=ru-RU',
        '--timezone-policy=host',
        // '--proxy-server=http://your-proxy-ip:port',
      ],
    };

    if (proxy) {
      launchOptions.args.push(`--proxy-server=${proxy}`);
      console.log(`  -> Используется прокси: ${proxy}`);
    }

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    // --- НАСТРОЙКА PAGE (для OZON) ---
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Ch-Ua': '"Chromium";v="120", "Not_A Brand";v="8"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    });

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      Object.defineProperty(navigator, 'languages', {
        get: () => ['ru-RU', 'ru', 'en-US', 'en'],
      });
    });
    // --- /НАСТРОЙКА PAGE ---

    console.log(`  -> Открываем страницу: ${url}`);
    const response = await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    const status = response.status();
    if (status === 401 || status === 403 || status === 429) {
      throw new Error(`OZON вернул статус ${status} - доступ запрещён или ограничение скорости. IP может быть заблокирован.`);
    } else if (!response.ok()) {
      throw new Error(`OZON вернул статус ${status} - ошибка загрузки страницы.`);
    }

    // --- ИМИТАЦИЯ ЧЕЛОВЕКА (для OZON) ---
    await page.waitForTimeout(Math.random() * 2000 + 1000);
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight / 3);
    });
    await page.waitForTimeout(Math.random() * 1000 + 500);
    // --- /ИМИТАЦИЯ ЧЕЛОВЕКА ---

    // Ждём загрузки названия и цены (OZON часто использует динамическую загрузку)
    await page.waitForSelector('h1[data-widget="webTitle"]', { timeout: 15000 });
    // Цена может быть в разных элементах, ждём хотя бы один
    await page.waitForSelector('[class*="c-price"] span, [data-widget="price"] span', { timeout: 15000 });

    const data = await page.evaluate(() => {
      // --- ИЗВЛЕЧЕНИЕ ДАННЫХ С OZON ---
      const nameElement = document.querySelector('h1[data-widget="webTitle"]');
      const name = nameElement?.innerText?.trim() || 'Неизвестное название';

      let price = null;
      const priceSelectors = [
        '[class*="c-price"] span',
        '[data-widget="price"] span',
        '.ui-kit-product-price span'
      ];

      for (const sel of priceSelectors) {
        const priceEl = document.querySelector(sel);
        if (priceEl) {
          let priceText = priceEl.innerText;
          priceText = priceText.replace(/\s/g, '').replace(/[^\d]/g, '');
          if (priceText) {
            price = parseInt(priceText, 10);
            if (!isNaN(price)) break;
          }
        }
      }

      let imageUrl = document.querySelector('[data-widget="primaryImage"] img')?.src ||
                     document.querySelector('[data-widget="secondaryImage"] img')?.src ||
                     null;
      if (imageUrl && !imageUrl.startsWith('http')) {
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          imageUrl = 'https://www.ozon.ru' + imageUrl;
        }
      }

      // Характеристики (пример)
      const specs = {};
      // OZON часто хранит характеристики в отдельной вкладке или загружает динамически
      // Это сложнее, чем на DNS. Попробуем найти таблицу или список
      const specBlock = document.querySelector('[data-widget="description"]'); // Это просто пример
      if (specBlock) {
        // Извлечение из таблицы, если есть
        const specRows = specBlock.querySelectorAll('table tr'); // Или dl dt/dd
        specRows.forEach(tr => {
          const th = tr.querySelector('th'); // Или dt
          const td = tr.querySelector('td'); // Или dd
          if (th && td) {
            const key = th.innerText.trim();
            const value = td.innerText.trim();
            if (key && value) {
              specs[key] = value;
            }
          }
        });
      }

      return {
        name,
        price, // Может быть null
        imageUrl, // Может быть null
        specs, // Может быть пустым объектом
      };
    });

    console.log('  -> Данные извлечены из OZON (puppeteer):', data);

    await browser.close();

    return {
      source: 'OZON (puppeteer)',
      name: data.name,
      price: data.price,
      imageUrl: data.imageUrl,
      sourceUrl: url,
      specs: data.specs
    };

  } catch (error) {
    if (browser) {
      await browser.close().catch(console.error);
    }
    console.error('  -> Ошибка парсинга с OZON (puppeteer):', error.message);
    throw new Error(`Ошибка парсинга с OZON (puppeteer): ${error.message}`);
  }
}
// --- /ФУНКЦИЯ ПАРСИНГА С OZON ---

// --- ОБНОВЛЁННЫЙ МАРШРУТ ДЛЯ ПАРСИНГА ---
// POST /api/admin/parse-product - Парсить товар по URL (реализация на сервере, с поддержкой прокси)
app.post('/api/admin/parse-product', authenticateToken, requireAdminRole, async (req, res) => {
  const { url, category, proxy } = req.body; // <-- Добавлен параметр proxy

  if (!url) {
    return res.status(400).json({ error: 'URL товара обязателен.' });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (e) {
    return res.status(400).json({ error: 'Неверный формат URL.' });
  }

  let parsedData;

  // --- ОПРЕДЕЛЕНИЕ САЙТА И ВЫЗОВ СООТВЕТСТВУЮЩЕЙ ФУНКЦИИ ---
  if (parsedUrl.hostname.includes('dns-shop.ru')) {
    try {
      // Передаём proxy в функцию
      parsedData = await parseProductFromDnsShop(url, proxy);
    } catch (e) {
      console.error(`Ошибка парсинга с DNS для URL ${url}:`, e.message);
      return res.status(500).json({ error: e.message });
    }
  } else if (parsedUrl.hostname.includes('ozon.ru')) {
    try {
      // Передаём proxy в функцию
      parsedData = await parseProductFromOzon(url, proxy);
    } catch (e) {
      console.error(`Ошибка парсинга с OZON для URL ${url}:`, e.message);
      return res.status(500).json({ error: e.message });
    }
  } else {
    return res.status(400).json({ error: 'Поддержка сайта не реализована или не указана.' });
  }

  // --- ВОЗВРАТ РАСПАРСЕННЫХ ДАННЫХ (НЕ СОХРАНЯЕМ В БД) ---
  console.log('Парсинг завершён, данные:', parsedData);
  res.json({
    message: 'Парсинг завершён (данные НЕ сохранены в БД)',
    parsedData: parsedData
  });
});
// --- /ОБНОВЛЁННЫЙ МАРШРУТ ---

// --- ОБНОВЛЁННЫЙ МАРШРУТ ДЛЯ РУЧНОГО ДОБАВЛЕНИЯ (с правильным синтаксисом create) ---
// POST /api/admin/manual-add-product - Добавить товар вручную
app.post('/api/admin/manual-add-product', authenticateToken, requireAdminRole, async (req, res) => {
  const { name, category, description, imageUrl, specs, prices } = req.body;

  // Валидация основных полей
  if (!name || typeof name !== 'string' || !category || typeof category !== 'string') {
    return res.status(400).json({ error: 'Название и категория обязательны и должны быть строками.' });
  }

  // Валидация specs (должен быть объектом или null/undefined)
  if (specs && typeof specs !== 'object') {
    return res.status(400).json({ error: 'Поле specs, если указано, должно быть объектом.' });
  }

  // Валидация prices (должен быть непустым массивом объектов с определённой структурой)
  if (!Array.isArray(prices) || prices.length === 0) {
    return res.status(400).json({ error: 'Поле prices обязательно и должно быть непустым массивом.' });
  }

  for (const priceEntry of prices) {
    // Проверяем, что каждый элемент массива - объект
    if (typeof priceEntry !== 'object' || priceEntry === null) {
      return res.status(400).json({ error: 'Каждая запись в prices должна быть объектом.' });
    }
    // Проверяем поля объекта
    if (typeof priceEntry.storeName !== 'string' ||
        typeof priceEntry.price !== 'number' ||
        typeof priceEntry.url !== 'string' ||
        priceEntry.price < 0) {
      return res.status(400).json({ error: 'Каждая запись в prices должна содержать storeName (string), price (number >= 0), и url (string).' });
    }
  }

  try {
    // Начинаем транзакцию для согласованности данных
    const newProduct = await prisma.$transaction(async (tx) => {
      // 1. Создаём продукт
      // ИСПРАВЛЕНО: теперь используется правильный синтаксис {  { ... } }
      // УБРАНО: явное указание updatedAt, если в schema.prisma стоит @updatedAt
      const product = await tx.product.create({
         data:{
          name: name.trim(),
          category: category.trim(),
          description: description ? description.trim() : null,
          imageUrl: imageUrl ? imageUrl.trim() : null,
          // rating, isActive, createdAt, updatedAt будут установлены по умолчанию
          // Если в schema.prisma для updatedAt НЕ стоит @updatedAt, и оно обязательно,
          // тогда нужно указать: updatedAt: new Date(),
        }
      });

      // 2. Создаём характеристики (если есть)
      if (specs && Object.keys(specs).length > 0) {
        const specPromises = Object.entries(specs).map(([key, value]) => {
          // Проверяем, что значение - строка перед сохранением
          if (typeof value === 'string') {
            // ИСПРАВЛЕНО: теперь используется правильный синтаксис {  { ... } }
            return tx.productSpec.create({
               data:{
                productId: product.id,
                specKey: key.trim(), // Убедимся, что ключ - строка
                specValue: value.trim()
              }
            });
          }
          // Если значение не строка, пропускаем его или логируем
          console.warn(`Пропущена характеристика ${key} для продукта ${product.id}, т.к. значение не строка:`, value);
          // Возвращаем Promise.resolve(), чтобы Promise.all не сломался
          return Promise.resolve();
        });
        // Ожидаем завершения всех операций создания характеристик
        await Promise.all(specPromises);
      }

      // 3. Создаём цены (если есть)
      if (prices && prices.length > 0) {
        const pricePromises = prices.map(priceEntry => {
          // ИСПРАВЛЕНО: теперь используется правильный синтаксис {  { ... } }
          return tx.price.create({
             data:{
              productId: product.id,
              storeName: priceEntry.storeName.trim(),
              price: priceEntry.price,
              url: priceEntry.url.trim()
            }
          });
        });
        // Ожидаем завершения всех операций создания цен
        await Promise.all(pricePromises);

        // 4. Создаём начальную запись в PriceHistory для каждой цены (опционально)
        // const historyPromises = prices.map(priceEntry => {
        //   // ИСПРАВЛЕНО: теперь используется правильный синтаксис {  { ... } }
        //   return tx.priceHistory.create({
        //      {
        //       productId: product.id,
        //       storeName: priceEntry.storeName.trim(),
        //       price: priceEntry.price,
        //       date: new Date() // Текущая дата
        //     }
        //   });
        // });
        // await Promise.all(historyPromises); // Не забудьте await
      }

      // Возвращаем созданный продукт из транзакции
      return product;
    });

    console.log('Товар успешно добавлен вручную:', newProduct);
    res.status(201).json({ message: 'Товар успешно добавлен.', product: newProduct });

  } catch (error) {
    console.error('Ошибка добавления товара вручную:', error);
    // В случае ошибки транзакция откатится автоматически
    res.status(500).json({ error: 'Не удалось добавить товар.' });
  }
});


//История цен

app.get('/api/admin/price-history/:productId', authenticateToken, requireAdminRole, async (req, res) => {
  const productId = parseInt(req.params.productId, 10);

  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID.' });
  }

  try {
    const history = await prisma.priceHistory.findMany({
      where: { productId: productId },
      orderBy: { date: 'desc' } // Сортировка по дате, новые сверху
    });

    res.json(history);
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ error: 'Failed to fetch price history.' });
  }
});

// POST /api/admin/price-history - Добавить новую запись в историю цен
app.post('/api/admin/price-history', authenticateToken, requireAdminRole, async (req, res) => {
  const { productId, storeName, price, date } = req.body; // Принимаем productId, storeName, price, и date

  // Валидация
  if (!productId || !storeName || typeof price !== 'number' || isNaN(price) || price < 0 || !date) {
    return res.status(400).json({ error: 'Product ID, Store Name, Price (number >= 0), and Date are required.' });
  }

  // Проверим, существует ли товар
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  try {
    const newHistoryEntry = await prisma.priceHistory.create({
       data:{
        productId: productId,
        storeName: storeName.trim(),
        price: price,
        date: new Date(date) // Убедимся, что это Date объект
      }
    });

    res.status(201).json({ message: 'Price history entry added.', entry: newHistoryEntry });
  } catch (error) {
    console.error('Error adding price history entry:', error);
    res.status(500).json({ error: 'Failed to add price history entry.' });
  }
});

// PUT /api/admin/price-history/:id - Обновить запись в истории цен
app.put('/api/admin/price-history/:id', authenticateToken, requireAdminRole, async (req, res) => {
  const historyId = parseInt(req.params.id, 10);
  const { storeName, price, date } = req.body; // Обновляем только storeName, price, date

  if (isNaN(historyId) || !storeName || typeof price !== 'number' || isNaN(price) || price < 0 || !date) {
    return res.status(400).json({ error: 'History ID, Store Name, Price (number >= 0), and Date are required.' });
  }

  try {
    const updatedEntry = await prisma.priceHistory.update({
      where: { id: historyId },
       data:{
        storeName: storeName.trim(),
        price: price,
        date: new Date(date)
      }
    });

    res.json({ message: 'Price history entry updated.', entry: updatedEntry });
  } catch (error) {
    console.error('Error updating price history entry:', error);
    // Может быть P2025 если запись не найдена
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Price history entry not found.' });
    }
    res.status(500).json({ error: 'Failed to update price history entry.' });
  }
});

// DELETE /api/admin/price-history/:id - Удалить запись из истории цен
app.delete('/api/admin/price-history/:id', authenticateToken, requireAdminRole, async (req, res) => {
  const historyId = parseInt(req.params.id, 10);

  if (isNaN(historyId)) {
    return res.status(400).json({ error: 'Invalid history ID.' });
  }

  try {
    await prisma.priceHistory.delete({
      where: { id: historyId }
    });

    res.json({ message: `Price history entry ID ${historyId} deleted.` });
  } catch (error) {
    console.error('Error deleting price history entry:', error);
    // Может быть P2025 если запись не найдена
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Price history entry not found.' });
    }
    res.status(500).json({ error: 'Failed to delete price history entry.' });
  }
});

app.get('/api/admin/products', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    // Загружаем продукты, возможно, с пагинацией/поиском в будущем
    // Выбираем только нужные поля
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        // imageUrl: true, // Опционально
        // rating: true,  // Опционально
        // isActive: true, // Опционально
        // createdAt: true, // Опционально
        // updatedAt: true, // Опционально
      },
      orderBy: { id: 'asc' } // Сортировка
    });

    res.json(products);

  } catch (error) {
    console.error('Error fetching products for admin:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});


//рекоммендации
async function getUserPreferences(userId) {
  try {
    // Получаем товары из избранного
    const favoriteProducts = await prisma.favorite.findMany({
      where: { userId: userId },
      include: {
        product: {
          select: { id: true, category: true }
        }
      }
    });

    // Получаем товары из сравнения
    const comparisonProducts = await prisma.comparison.findMany({
      where: { userId: userId },
      include: {
        product: {
          select: { id: true, category: true }
        }
      }
    });

    // Получаем товары, для которых пользователь оставлял отзывы
    const reviewedProducts = await prisma.review.findMany({
      where: { userId: userId },
      select: { productId: true, rating: true, comment: true },
      orderBy: { createdAt: 'desc' }
    });

    // Возвращаем объект с предпочтениями
    return {
      favoriteProductIds: favoriteProducts.map(fp => fp.product.id),
      favoriteCategories: [...new Set(favoriteProducts.map(fp => fp.product.category))], // Уникальные категории
      comparisonProductIds: comparisonProducts.map(cp => cp.product.id),
      comparisonCategories: [...new Set(comparisonProducts.map(cp => cp.product.category))], // Уникальные категории
      reviewedProducts: reviewedProducts // Включаем отзывы для анализа
    };

  } catch (error) {
    console.error(`[ERROR] getUserPreferences: Не удалось получить предпочтения для пользователя ID ${userId}:`, error);
    // Возвращаем пустой объект в случае ошибки
    return {
      favoriteProductIds: [],
      favoriteCategories: [],
      comparisonProductIds: [],
      comparisonCategories: [],
      reviewedProducts: []
    };
  }
}
// --- /ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ---

// --- МАРШРУТЫ ДЛЯ РЕКОМЕНДАЦИЙ ---

// GET /api/recommendations/popular - Получить популярные товары (по рейтингу и количеству отзывов)
app.get('/api/recommendations/popular', authenticateToken, async (req, res) => {
  try {
    const popularProducts = await prisma.product.findMany({
      where: {
        isActive: true
      },
      include: {
        specs: true,
        prices: {
          orderBy: { price: 'asc' } // Включаем цены, отсортированные по возрастанию
        },
        reviews: {
          where: { isApproved: true },
          select: { rating: true }
        }
      },
      orderBy: [
        { rating: 'desc' }, // Сначала по рейтингу
        { reviews: { _count: 'desc' } } // Потом по количеству отзывов
      ],
      take: 6 // Ограничиваем количество
    });

    // Добавляем среднюю цену и количество отзывов к каждому товару
    const enhancedProducts = popularProducts.map(product => {
      const avgRating = product.rating; // Уже рассчитан в Product
      const reviewCount = product.reviews.length;
      const minPrice = product.prices.length > 0 ? product.prices[0].price : null; // Цена уже отсортирована

      return {
        ...product,
        avgRating: avgRating,
        reviewCount: reviewCount,
        minPrice: minPrice,
        // Рассчитываем "популярность" (например, на основе рейтинга и количества отзывов)
        popularityScore: (avgRating * 10) + reviewCount
      };
    });

    res.json(enhancedProducts);

  } catch (error) {
    console.error('Error fetching popular recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch popular recommendations' });
  }
});

// GET /api/recommendations/trending - Получить трендовые товары (например, недавно добавленные или с растущим рейтингом)
app.get('/api/recommendations/trending', authenticateToken, async (req, res) => {
  try {
    // Пример: товары, добавленные за последние 30 дней, отсортированные по ID (новые сверху)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendingProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        createdAt: { gte: thirtyDaysAgo }
      },
      include: {
        specs: true,
        prices: {
          orderBy: { price: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 6
    });

    res.json(trendingProducts);

  } catch (error) {
    console.error('Error fetching trending recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch trending recommendations' });
  }
});

// GET /api/recommendations/best-value - Получить товары с лучшим соотношением цена/качество
app.get('/api/recommendations/best-value', authenticateToken, async (req, res) => {
  try {
    const productsWithRatingsAndPrices = await prisma.product.findMany({
      where: {
        isActive: true,
        rating: { gt: 0 } // Только товары с каким-то рейтингом
      },
      include: {
        specs: true,
        prices: {
          orderBy: { price: 'asc' }
        }
      },
      take: 20 // Берём больше товаров для анализа
    });

    // Рассчитываем "ценность" (например, rating / (minPrice / 10000))
    const bestValueProducts = productsWithRatingsAndPrices
      .filter(p => p.prices.length > 0) // Убедимся, что цена есть
      .map(p => ({
        ...p,
        minPrice: p.prices[0].price,
        valueScore: p.rating / (p.prices[0].price / 10000)
      }))
      .sort((a, b) => b.valueScore - a.valueScore) // Сортируем по valueScore
      .slice(0, 6); // Берём 6 лучших

    res.json(bestValueProducts);

  } catch (error) {
    console.error('Error fetching best-value recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch best-value recommendations' });
  }
});

// GET /api/recommendations/personal - Получить персонализированные рекомендации
app.get('/api/recommendations/personal', authenticateToken, async (req, res) => {
  const userId = req.user.id; // ID пользователя из токена
  try {
    // Получаем предпочтения пользователя
    const userPrefs = await getUserPreferences(userId);
    console.log(`[DEBUG] Personal Recommendations for User ID ${userId}:`, userPrefs);

    let recommendedProducts = [];
    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        specs: true,
        prices: {
          orderBy: { price: 'asc' }
        },
        reviews: {
          where: { isApproved: true },
          select: { rating: true }
        }
      }
    });

    // 1. Рекомендации на основе избранных категорий
    if (userPrefs.favoriteCategories.length > 0) {
      const favoriteCatProducts = allProducts.filter(p => userPrefs.favoriteCategories.includes(p.category));
      recommendedProducts.push(...favoriteCatProducts);
    }

    // 2. Рекомендации на основе категорий сравнения
    if (userPrefs.comparisonCategories.length > 0) {
      const comparisonCatProducts = allProducts.filter(p => userPrefs.comparisonCategories.includes(p.category) && !recommendedProducts.some(rp => rp.id === p.id));
      recommendedProducts.push(...comparisonCatProducts);
    }

    // 3. Рекомендации на основе товаров, для которых были отзывы (похожие категории)
    const reviewedProductIds = userPrefs.reviewedProducts.map(r => r.productId);
    const reviewedCatProducts = allProducts.filter(p => reviewedProductIds.includes(p.id)).map(p => p.category);
    if (reviewedCatProducts.length > 0) {
      const similarCatProducts = allProducts.filter(p => reviewedCatProducts.includes(p.category) && !recommendedProducts.some(rp => rp.id === p.id));
      recommendedProducts.push(...similarCatProducts);
    }

    // 4. Рекомендации на основе товаров из избранного (похожие характеристики)
    if (userPrefs.favoriteProductIds.length > 0) {
      const favoriteProductsDetailed = await prisma.product.findMany({
        where: { id: { in: userPrefs.favoriteProductIds } },
        include: { specs: true }
      });
      // Простой пример: найти товары с похожими характеристиками (например, RAM, Storage, CPU Brand)
      favoriteProductsDetailed.forEach(favProd => {
        const similarProducts = allProducts.filter(p => p.category === favProd.category && p.id !== favProd.id && !recommendedProducts.some(rp => rp.id === p.id))
          .map(p => ({
            ...p,
            similarityScore: calculateSimilarity(favProd, p) // Вспомогательная функция
          }))
          .filter(p => p.similarityScore > 0.5) // Порог схожести
          .sort((a, b) => b.similarityScore - a.similarityScore)
          .slice(0, 2); // Добавим до 2 похожих товаров
        recommendedProducts.push(...similarProducts);
      });
    }

    // 5. Рекомендации на основе товаров из сравнения (похожие характеристики)
    if (userPrefs.comparisonProductIds.length > 0) {
      const comparisonProductsDetailed = await prisma.product.findMany({
        where: { id: { in: userPrefs.comparisonProductIds } },
        include: { specs: true }
      });
      comparisonProductsDetailed.forEach(compProd => {
        const similarProducts = allProducts.filter(p => p.category === compProd.category && p.id !== compProd.id && !recommendedProducts.some(rp => rp.id === p.id))
          .map(p => ({
            ...p,
            similarityScore: calculateSimilarity(compProd, p)
          }))
          .filter(p => p.similarityScore > 0.5)
          .sort((a, b) => b.similarityScore - a.similarityScore)
          .slice(0, 2);
        recommendedProducts.push(...similarProducts);
      });
    }

    // 6. Рекомендации на основе популярности (если не хватает персонализированных)
    if (recommendedProducts.length < 6) {
      const popularFallback = allProducts
        .sort((a, b) => b.rating - a.rating)
        .filter(p => !recommendedProducts.some(rp => rp.id === p.id))
        .slice(0, 6 - recommendedProducts.length);
      recommendedProducts.push(...popularFallback);
    }

    // Убираем дубликаты и ограничиваем количество
    const uniqueRecommendedProducts = [...new Map(recommendedProducts.map(item => [item.id, item])).values()];
    const finalRecommendations = uniqueRecommendedProducts.slice(0, 6);

    console.log(`[DEBUG] Generated ${finalRecommendations.length} personal recommendations for User ID ${userId}.`);

    res.json(finalRecommendations);

  } catch (error) {
    console.error('Error fetching personal recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch personal recommendations' });
  }
});

// Вспомогательная функция для расчёта схожести товаров (упрощённый пример)
function calculateSimilarity(productA, productB) {
  let score = 0;
  let totalPossibleScore = 0;

  // Сравниваем характеристики (например, RAM, Storage, CPU Brand)
  const commonSpecKeys = ['ram_size', 'storage_capacity', 'cpu_brand', 'os', 'screen_size'];

  commonSpecKeys.forEach(key => {
    const valA = productA.specs.find(s => s.specKey === key)?.specValue;
    const valB = productB.specs.find(s => s.specKey === key)?.specValue;

    if (valA && valB) {
      totalPossibleScore += 1;
      if (valA.toLowerCase() === valB.toLowerCase()) {
        score += 1;
      }
    }
  });

  // Сравниваем цены (например, разница до 10%)
  const minPriceA = productA.prices.length > 0 ? productA.prices[0].price : Infinity;
  const minPriceB = productB.prices.length > 0 ? productB.prices[0].price : Infinity;

  if (isFinite(minPriceA) && isFinite(minPriceB)) {
    totalPossibleScore += 1;
    const priceDiffPercent = Math.abs(minPriceA - minPriceB) / ((minPriceA + minPriceB) / 2) * 100;
    if (priceDiffPercent <= 10) {
      score += 1;
    }
  }

  return totalPossibleScore > 0 ? score / totalPossibleScore : 0;
}