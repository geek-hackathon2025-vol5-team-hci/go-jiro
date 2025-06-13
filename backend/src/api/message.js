// backend/src/api/messages.js
const express = require('express');
const messageController = require('../controllers/messageController');

const router = express.Router();

router.get('/', messageController.getMessage);

module.exports = router;