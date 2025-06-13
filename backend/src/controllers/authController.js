// backend/src/controllers/authController.js
exports.googleCallback = (req, res) => {
  // 認証成功後、フロントエンドのホームページにリダイレクト
  res.redirect('http://localhost:3001'); // 
};

exports.getProfile = (req, res) => {
  if (req.isAuthenticated()) { // 
    res.json({ user: req.user }); // 
  } else {
    res.status(401).json({ user: null }); // 
  }
};

exports.logout = (req, res, next) => {
  req.logout(err => { // 
    if (err) { return next(err); } // 
    res.redirect('http://localhost:3001'); // 
  });
};