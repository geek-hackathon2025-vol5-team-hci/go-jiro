// backend/src/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// PassportでのGoogleStrategyの設定
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // 
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // 
    callbackURL: "http://localhost:3001/api/auth/google/callback", // 
    scope: ['profile', 'email'] // 
  },
  (accessToken, refreshToken, profile, done) => {
    // 認証成功後、ユーザー情報がprofileに入る
    // ここでユーザー情報をDBに保存するなどの処理を行う
    console.log(profile); // 
    return done(null, profile); // 
  }
));

// セッションにユーザー情報をシリアライズ(保存)
passport.serializeUser((user, done) => {
  done(null, user); // 
});

// セッションからユーザー情報をデシリアライズ(取り出す)
passport.deserializeUser((obj, done) => {
  done(null, obj); // 
});