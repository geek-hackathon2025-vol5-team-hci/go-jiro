// backend/src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const apiRouter = require('./api');
require('./config/passport'); // Passport 設定

const pg = require('pg');
const connectPgSimple = require('connect-pg-simple');

const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const sessionStore = new (connectPgSimple(session))({
  pool: pgPool,
  createTableIfMissing: true,
});

const app = express();

// CORSは先に設定し、cookieを有効にする
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30日間有効
    secure: process.env.NODE_ENV === 'production', // 本番環境ではhttps通信のみ
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  } 
}));

// JSON パースミドルウェア
app.use(express.json());

// セッションの設定（Passportの前）
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: true // trueだと未認証のユーザーにもセッションが作られる
}));

// Passportの初期化
app.use(passport.initialize());
app.use(passport.session());

// APIルーティングは最後
app.use('/api', apiRouter);

module.exports = app;
