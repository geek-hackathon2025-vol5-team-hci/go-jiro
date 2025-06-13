// backend/src/middlewares/authMiddleware.js
// ログイン状態をチェックするミドルウェア
exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) { // 
    return next(); // 
  }
  res.status(401).json({ message: '認証されていません' }); // 
}