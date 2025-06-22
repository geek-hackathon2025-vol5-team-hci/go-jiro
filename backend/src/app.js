// backend/src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const apiRouter = require('./api');
require('./config/passport'); // Passport 設定

const app = express();

// CORSは先に設定し、cookieを有効にする
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001', // フロントエンドのローカル環境のURLを許可
  credentials: true,
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
