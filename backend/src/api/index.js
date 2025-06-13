// backend/src/api/index.js

const express = require('express');
const messageRouter = require('./messages');
const logRouter = require('./logs');

const router = express.Router();

// '/api/message' へのリクエストをmessageRouterに流す
router.use('/message', messageRouter);

// '/api/logs' へのリクエストをlogRouterに流す
router.use('/logs', logRouter);

module.exports = router;