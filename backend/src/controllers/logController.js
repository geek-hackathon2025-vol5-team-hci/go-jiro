// backend/src/controllers/logController.js

const accessLogService = require('../services/accessLogService');

exports.getAllLogs = async (req, res) => {
  try {
    // Service層を呼び出して全ログを取得
    const logs = await accessLogService.getAllLogs();
    res.json(logs); //
  } catch (error) {
    console.error('Error fetching logs:', error); //
    res.status(500).json({ error: 'Internal Server Error' }); //
  }
};