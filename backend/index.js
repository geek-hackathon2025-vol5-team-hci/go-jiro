require('dotenv').config();


const express = require('express');
const cors = require('cors');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

const app = express();
const port = 3000;

// セッションの設定
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

// Passportの初期化
app.use(passport.initialize());
app.use(passport.session());

// CORS(クロスオリジンリクエスト)を許可
app.use(cors({
  origin: 'http://localhost:3000', // フロントエンドのオリジンを許可
  credentials: true
}));

// PassportでのGoogleStrategyの設定
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/auth/google/callback", 
    scope: ['profile', 'email']
  },
  (accessToken, refreshToken, profile, done) => {
    // 認証成功後、ユーザー情報がprofileに入る
    // ここでユーザー情報をDBに保存するなどの処理を行う
    console.log(profile);
    return done(null, profile);
  }
));

// セッションにユーザー情報をシリアライズ(保存)
passport.serializeUser((user, done) => {
  done(null, user);
});

// セッションからユーザー情報をデシリアライズ(取り出す)
passport.deserializeUser((obj, done) => {
  done(null, obj);
});


// ログイン状態をチェックするミドルウェア
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: '認証されていません' });
}



// APIエンドポイント
app.get('/api/message', (req, res) => {
  res.json({ message: 'こんにちは！Backendからのメッセージです 👋' });
});



// ログイン状態に応じてプロフィール情報を返すAPI
app.get('/api/profile', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: req.user });
    } else {
        res.status(401).json({ user: null });
    }
});


// === Google認証用ルート ===

// 1. ログイン開始エンドポイント
app.get('/api/auth/google',
  passport.authenticate('google'));

// 2. Googleからのリダイレクトを受け取るエンドポイント
app.get('/api/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // 認証成功後、フロントエンドのホームページにリダイレクト
    res.redirect('http://localhost:3000');
  }
);

// 3. ログアウト用エンドポイント
app.get('/api/logout', (req, res, next) => {
    req.logout(err => {
        if (err) { return next(err); }
        res.redirect('http://localhost:3000');
    });
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});

