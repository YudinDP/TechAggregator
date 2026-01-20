// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Разрешаем запросы с фронтенда
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'] // Live Server
}));

// Парсим JSON
app.use(express.json());

// Простой маршрут для проверки
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Backend работает!' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});