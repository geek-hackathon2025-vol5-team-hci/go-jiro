// backend/src/controllers/messageController.js

const accessLogService = require('../services/accessLogService');

exports.getNewMessage = async (req, res) => {
  try {
    // Service層を呼び出してログを作成し、作成されたレコードを取得
    const newLog = await accessLogService.createLog('アクセスがありました。');

    // IDを含んだレスポンスメッセージを作成
    const message = `こんにちは！Backendからのメッセージです 👋 あなたは${newLog.id}番目の訪問者です。`;

    res.json({ message: message }); //
  } catch (error) {
    console.error('Error in messageController:', error);
    res.status(500).json({ error: 'Internal Server Error' }); //
  }
};