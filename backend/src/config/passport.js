// backend/src/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('./prisma'); // Prisma Clientをインポート

// PassportでのGoogleStrategyの設定
//profileにはアカウント情報が入る
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, 
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, 
    callbackURL: "http://localhost:3000/api/auth/google/callback", 
    scope: ['profile', 'email'] 
  },
  // asyncキーワードを追加して非同期処理に対応
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 1. Google IDでユーザーを検索(fineUniqueは非同期なのでawait)
      const existingUser = await prisma.user.findUnique({
        where: { googleId: profile.id },
      });

      let userProfile;

      if (existingUser) {
        // 2. ユーザーが存在する場合
        console.log('既存ユーザーがログインしました:', existingUser.email);
        // isNewUserフラグをfalseにして返す
        userProfile = { ...profile, isNewUser: false };
      } else {
        // 3. ユーザーが存在しない場合（初回ログイン） 非同期なのでawait)
        const newUser = await prisma.user.create({
          data: {
            googleId: profile.id,
            email: profile.emails[0].value,
            displayName: profile.displayName,
          },
        });
        console.log('新規ユーザーが登録されました:', newUser.email);
        // isNewUserフラグをtrueにして返す
        userProfile = { ...profile, isNewUser: true };
      }

      // 4. フラグが付与されたプロフィール情報を次の処理に渡す
      return done(null, userProfile);

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