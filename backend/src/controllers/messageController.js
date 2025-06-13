exports.getNewMessage = async (req, res) => {
  try {
    // const newLog = await accessLogService.createLog('アクセスがありました。');
    const newLog = { id: 999 }; // 仮のIDを返す

    const message = `こんにちは！Backendからのメッセージです 👋 あなたは${newLog.id}番目の訪問者です。`;

    res.json({ message: message });
  } catch (error) {
    console.error('Error in messageController:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
