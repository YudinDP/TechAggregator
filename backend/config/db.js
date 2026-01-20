// backend/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'tech_aggregator',
  password: process.env.DB_PASSWORD || 'ваш_пароль_postgres',
  port: process.env.DB_PORT || 5432,
});

// Тест подключения
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Ошибка подключения к БД:', err.stack);
  } else {
    console.log('✅ Подключение к PostgreSQL установлено');
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};