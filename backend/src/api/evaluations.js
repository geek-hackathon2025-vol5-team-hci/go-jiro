// backend/src/api/evaluations.js
const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware'); // 認証済みかチェックするミドルウェア

// POST /api/evaluations - 新しい評価を作成
router.post('/', ensureAuthenticated, evaluationController.createEvaluation);

// GET /api/evaluations/shop/:shopId - 店舗IDで評価を取得
router.get('/shop/:shopId', evaluationController.getEvaluationsByShopId);

module.exports = router;