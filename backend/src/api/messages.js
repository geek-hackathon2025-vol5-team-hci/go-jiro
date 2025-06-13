// backend/src/api/messages.js

const express = require('express');
const messageController = require('../controllers/messageController');

const router = express.Router();

// GET /api/message
router.get('/', messageController.getNewMessage);

module.exports = router;