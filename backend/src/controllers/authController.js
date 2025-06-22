// backend/src/controllers/authController.js

exports.googleCallback = (req, res) => {
  // セッションの保存を保証してからリダイレクトする
  req.session.save((err) => {
    if (err) {
      // エラーハンドリング
      console.error('Session save error:', err);
      return res.status(500).send('Session save error');
    }
    // 保存が成功したら、フロントエンドにリダイレクト
    res.redirect(process.env.FRONTEND_URL);
  });
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
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    // セッションを破棄したことを保存してからリダイレクト
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send('Could not log out.');
      }
      res.clearCookie('connect.sid'); // セッションクッキーをクリア
      res.redirect(process.env.FRONTEND_URL);
    });
  });
};