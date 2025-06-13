// backend/index.js
require('dotenv').config(); // 環境変数を読み込みます

const app = require('./src/app');
const port = 3000;

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`); // 
});