// backend/src/api/index.js
const express = require('express');
const authRouter = require('./auth');
const messageRouter = require('./messages');
const shopsRouter = require('./shops');
const logRouter = require('./logs');
<<<<<<< HEAD
const usersRouter = require('./users'); // 追記
=======
const evaluationRouter = require('./evaluations');
>>>>>>> develop
const router = express.Router();

router.use('/auth', authRouter);
router.use('/messages', messageRouter); // '/api/message' へのリクエストをmessageRouterに流す
router.use('/logs', logRouter); // '/api/logs' へのリクエストをlogRouterに流す
router.use('/shops', shopsRouter); // '/api/shopへのリクエストをshopsRouterに流す
<<<<<<< HEAD
router.use('/users', usersRouter); // 追記: '/api/users'へのリクエストをusersRouterに流す
=======
router.use('/evaluations', evaluationRouter); 
>>>>>>> develop

module.exports = router;