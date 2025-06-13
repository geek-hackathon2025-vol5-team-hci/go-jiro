const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const port = 3000;
const prisma = new PrismaClient();

app.use(cors());

// APIエンドポイント
app.get('/api/message', async (req, res) => {
  try {
    // データベースにアクセスログを保存し、作成されたレコードを取得
    const newLog = await prisma.accessLog.create({
      data: {
        message: 'アクセスがありました。', // データベースに保存するメッセージ
      },
    });

    // IDを含んだレスポンスメッセージを作成
    const message = `こんにちは！Backendからのメッセージです 👋 あなたは${newLog.id}番目の訪問者です。`;

    res.json({ message: message });
  } catch (error) {
    console.error('Error saving access log:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 保存されているログを取得するAPIエンドポイント（変更なし）
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await prisma.accessLog.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});