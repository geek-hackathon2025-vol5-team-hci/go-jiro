// backend/src/app.js
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const apiRouter = require('./api');

// Passportの設定ファイルを読み込みます
require('./config/passport');

const app = express();

// セッションの設定 (Passportより前に記述)
app.use(session({
  secret: process.env.SESSION_SECRET, // 
  resave: false, // 
  saveUninitialized: true, // 
}));

// Passportの初期化
app.use(passport.initialize()); // 
app.use(passport.session()); // 

// CORS(クロスオリジンリクエスト)を許可
app.use(cors({
  origin: 'http://localhost:3000', // 
  credentials: true // 
}));

// APIルーターを適用
app.use('/api', apiRouter);

module.exports = app;