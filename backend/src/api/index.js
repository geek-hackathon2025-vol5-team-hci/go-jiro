// backend/src/api/index.js
const express = require('express');
const authRouter = require('./auth');
const messageRouter = require('./messages');
const shopsRouter = require('./shops');
const logRouter = require('./logs');
const evaluationRouter = require('./evaluations');
const router = express.Router();

router.use('/auth', authRouter);
router.use('/messages', messageRouter); // '/api/message' へのリクエストをmessageRouterに流す
router.use('/logs', logRouter); // '/api/logs' へのリクエストをlogRouterに流す
router.use('/shops', shopsRouter); // '/api/shopへのリクエストをshopsRouterに流す
router.use('/evaluations', evaluationRouter); 

module.exports = router;