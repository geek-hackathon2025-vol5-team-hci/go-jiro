// backend/src/api/users.js
const express = require('express');
const userController = require('../controllers/userController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware'); // 認証ミドルウェア

const router = express.Router();

// ログイン中のユーザーのプロフィールを更新する
// PUT /api/users/profile
router.put('/profile', ensureAuthenticated, userController.updateProfile);

module.exports = router;