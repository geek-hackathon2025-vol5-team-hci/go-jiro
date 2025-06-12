const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors()); // CORSを許可

// APIエンドポイント
app.get('/api/message', (req, res) => {
  res.json({ message: 'こんにちは！Backendからのメッセージです 👋' });
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});