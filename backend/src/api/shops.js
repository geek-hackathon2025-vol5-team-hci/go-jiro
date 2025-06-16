// backend/src/api/shops.js

const express = require('express');
const shopController = require('../controllers/shopController');

const router = express.Router();

router.get('/', shopController.getShops);

module.exports = router;