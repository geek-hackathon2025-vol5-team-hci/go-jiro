// backend/src/api/index.js
const express = require('express');
const authRouter = require('./auth');
const messageRouter = require('./messages');

const router = express.Router();

router.use('/auth', authRouter);
router.use('/message', messageRouter);

// /api/profile も認証関連なのでauthRouterに含めます
// router.use('/profile', authRouter); // これは不要

module.exports = router;