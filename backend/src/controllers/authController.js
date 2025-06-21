// backend/src/controllers/authController.js
exports.googleCallback = (req, res) => {
  // 認証成功後、フロントエンドのホームページにリダイレクト
  res.redirect(process.env.FRONTEND_URL); // 
};

exports.getProfile = (req, res) => {
  if (req.isAuthenticated()) {
    // ★★★【デバッグログ②】★★★
    // セッションから取り出したユーザー情報にisNewUserフラグがあるか確認
    console.log('[DEBUG] /api/auth/profile: Returning user data from session:', {
        displayName: req.user.displayName,
        isNewUser: req.user.isNewUser
    });
    res.json({ user: req.user }); // 
  } else {
    res.status(401).json({ user: null }); // 
  }
};

exports.logout = (req, res, next) => {
  req.logout(err => { // 
    if (err) { return next(err); } // 
    res.redirect(process.env.FRONTEND_URL); // 
  });
};