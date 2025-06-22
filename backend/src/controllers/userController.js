// backend/src/controllers/userController.js
const prisma = require('../config/prisma');

/**
 * ログインユーザーのプロフィール情報を取得する
 */
exports.getProfile = async (req, res, next) => {
  try {
    const googleId = req.user.id;
    if (!googleId) {
      return res.status(401).json({ message: '認証されていません。' });
    }

    // データベースから最新のユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { googleId: googleId },
    });

    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません。' });
    }
    console.log('--- Returning user profile data from DB: ---');
    console.log(user);

    // フロントエンドが期待する { user: ... } 形式で返す
    res.status(200).json({ user: user });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    next(error);
  }
};


/**
 * ログインユーザーのプロフィール情報を更新する
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.updateProfile = async (req, res, next) => {
  // --- ▼▼▼ デバッグコードを追加 ▼▼▼ ---
  console.log('--- Profile Update Request Received ---');
  console.log('Request Body (req.body):', req.body);
  console.log('Authenticated User (req.user):', req.user);
  
  // 個別の値と型も確認する
  if (req.body) {
    const { displayName, username, jiroCount, favoriteCall, age, gender } = req.body;
    console.log(`jiroCount: ${jiroCount} (type: ${typeof jiroCount})`);
    console.log(`age: ${age} (type: ${typeof age})`);
  }
  // --- ▲▲▲ デバッグコードここまで ▲▲▲ ---
  try {
    const googleId = req.user.id;
    if (!googleId) {
      return res.status(401).json({ message: '認証されていません。' });
    }

    const {
      displayName,
      username,
      jiroCount,
      favoriteCall,
      age,
      gender
    } = req.body;

    // 3. Prismaを使ってデータベースを更新
    const updatedUser = await prisma.user.update({
      where: {
        googleId: googleId,
      },
      data: {
        displayName,
        username,
        // 修正点: parseIntの結果がNaNなら0を、そうでなければその数値を設定
        jiroCount: isNaN(parseInt(jiroCount, 10)) ? 0 : parseInt(jiroCount, 10),
        favoriteCall,
        // 修正点: ageも同様にNaNチェックを追加。ageはnullを許容するのでNaNならnullに
        age: isNaN(parseInt(age, 10)) ? null : parseInt(age, 10),
        gender,
      },
    });
    // --- ▼▼▼ デバッグコードを追加 ▼▼▼ ---
    console.log('--- Data after update (from returned value) ---');
    console.log(updatedUser);
    // --- ▲▲▲ デバッグコードここまで ▲▲▲ ---

    res.status(200).json({
      message: 'プロフィールを更新しました。',
      data: updatedUser,
    });

  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
        return res.status(409).json({ message: 'そのユーザー名は既に使用されています。' });
    }
    console.error('Error updating profile:', error);
    next(error);
  }
};