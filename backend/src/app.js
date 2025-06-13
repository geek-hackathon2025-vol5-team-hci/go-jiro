// backend/src/app.js

const express = require('express');
const cors = require('cors');
const apiRouter = require('./api'); // ./api/index.js を読み込む

const app = express();

// 必要なミドルウェアを適用
app.use(cors()); //
app.use(express.json()); // POSTリクエストのbodyをパースするために追加

// APIルーティングを適用
app.use('/api', apiRouter);

module.exports = app;