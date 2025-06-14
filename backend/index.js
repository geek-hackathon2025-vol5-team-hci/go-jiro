// backend/index.js
require('dotenv').config(); // 環境変数を読み込みます

const app = require('./src/app');
const listEndpoints = require('express-list-endpoints'); // 追加

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  // ここでルーティング一覧を出力
  console.log('Registered API Endpoints:');
  console.table(listEndpoints(app));
});