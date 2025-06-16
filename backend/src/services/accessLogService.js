// backend/src/services/accessLogService.js

const prisma = require('../config/prisma');

/**
 * アクセスログを作成する
 * @param {string} message ログに保存するメッセージ
 * @returns {Promise<object>} 作成されたログレコード
 */
exports.createLog = async (message) => {
  // 元のindex.jsにあったデータベースへの書き込み処理
  const newLog = await prisma.accessLog.create({
    data: {
      message: message,
    },
  });
  return newLog;
};

/**
 * 全てのアクセスログを取得する
 * @returns {Promise<Array<object>>} ログレコードの配列
 */
exports.getAllLogs = async () => {
  // 元のindex.jsにあったデータベースからの読み取り処理
  const logs = await prisma.accessLog.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
  return logs;
};