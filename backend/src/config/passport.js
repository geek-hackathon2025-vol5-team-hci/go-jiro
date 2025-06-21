// backend/src/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// PassportでのGoogleStrategyの設定
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // 
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // 
    callbackURL: "http://localhost:3000/api/auth/google/callback", // 
    scope: ['profile', 'email'] // 
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { googleId: profile.id },
      });

      if (existingUser) {
        // ユーザーが存在する場合、isNewUserフラグをfalseにしてDBのユーザー情報を渡す
        const user = { ...existingUser, isNewUser: false };
        console.log('既存ユーザーがログインしました:', user.email);
        return done(null, user);
      } else {
        // ユーザーが存在しない場合、新規作成
        const newUser = await prisma.user.create({
          data: {
            googleId: profile.id,
            email: profile.emails[0].value,
            displayName: profile.displayName,
          },
        });
        // isNewUserフラグをtrueにしてDBのユーザー情報を渡す
        const user = { ...newUser, isNewUser: true };
        console.log('新規ユーザーが登録されました:', user.email);
        return done(null, user);
      }
    } catch (err) {
      console.error("Passport処理中にエラーが発生しました:", err);
      return done(err, null);
    }
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