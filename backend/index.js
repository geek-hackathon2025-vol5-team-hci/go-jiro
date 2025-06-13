// backend/index.js

const app = require('./src/app');

// package.jsonの記述を元にポート番号を設定
const port = 3000;

app.listen(port, () => {
  // 元のindex.jsにあった起動メッセージ
  console.log(`Backend server listening at http://localhost:${port}`);
});