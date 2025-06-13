// backend/src/api/logs.js

const express = require('express');
const logController = require('../controllers/logController');

const router = express.Router();

// GET /api/logs
router.get('/', logController.getAllLogs);

module.exports = router;