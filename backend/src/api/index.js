// backend/src/api/index.js
const express = require('express');
const authRouter = require('./auth');
const messageRouter = require('./messages');
const logRouter = require('./logs');
const router = express.Router();

router.use('/auth', authRouter);
router.use('/message', messageRouter); // '/api/message' へのリクエストをmessageRouterに流す
router.use('/logs', logRouter); // '/api/logs' へのリクエストをlogRouterに流す

module.exports = router;