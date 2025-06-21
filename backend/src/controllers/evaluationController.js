// backend/src/controllers/evaluationController.js
const prisma = require('../config/prisma');

exports.createEvaluation = async (req, res, next) => {
  try {
    // ログインユーザーのIDは req.user.id から取得（passportの修正により可能になる）
    const userId = req.user.id;
    // フロントエンドから送られてくるデータ
    const { shopId, comment, rating_taste, rating_volume, rating_hurdle } = req.body;

    // バリデーション
    if (!shopId || !userId || !rating_taste || !rating_volume || !rating_hurdle) {
      return res.status(400).json({ message: '必須項目が不足しています。' });
    }

    // データベースに評価を作成
    const newEvaluation = await prisma.evaluation.create({
      data: {
        shopId,
        userId,
        comment,
        rating_taste,
        rating_volume,
        rating_hurdle,
      },
    });

    res.status(201).json(newEvaluation);
  } catch (error) {
    console.error('評価の作成中にエラーが発生しました:', error);
    next(error);
  }
};