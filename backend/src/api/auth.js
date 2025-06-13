// backend/src/api/auth.js
const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');

const router = express.Router();

// 1. ログイン開始エンドポイント
router.get('/google',
  passport.authenticate('google')); // 

// 2. Googleからのリダイレクトを受け取るエンドポイント
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }), // 
  authController.googleCallback
);

// ログイン状態に応じてプロフィール情報を返すAPI
router.get('/profile', authController.getProfile);

// 3. ログアウト用エンドポイント
router.get('/logout', authController.logout);

module.exports = router;