// backend/src/api/shops.js

const express = require('express');
const shopController = require('../controllers/shopController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware'); // 認証ミドルウェアをインポート

const router = express.Router();

router.get('/', shopController.getShops);

router.get('/:shopId', shopController.getShopById);
router.put('/:shopId', ensureAuthenticated, shopController.updateShop); //コールバック関数で先にミドルウェアを挟むことでログインユーザーのみが叩ける

module.exports = router;