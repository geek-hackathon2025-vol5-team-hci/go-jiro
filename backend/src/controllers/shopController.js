// backend/src/controllers/shopController.js

// shopServiceからfindShopsFromGoogleをインポート
const { findShopsFromGoogle } = require('../services/shopService');
const prisma = require('../config/prisma');

const getShops = async (req, res, next) => {
  try {
    // フロントエンドからのクエリパラメータを取得
    const { keyword, lat, lng } = req.query;

    if (!keyword || !lat || !lng) {
      return res.status(400).json({ message: 'keyword, lat, lng are required' });
    }
    
    // 緯度と経度を数値に変換
    const searchParams = {
      keyword,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    };

    const shops = await findShopsFromGoogle(searchParams);
    res.json(shops);
  } catch (error) {
    next(error);
  }
};


/**
 * 店舗情報を更新するための新しい関数
 * @param {*} req
 * @param {*} res
 */
const updateShop = async(req, res, next) =>{
try {
// 1. リクエストからデータを取得
    // shopIdは文字列なので、整数に変換する
    const shopId = parseInt(req.params.shopId, 10);
    const { callticketOrder, callOrder, callRules } = req.body;

// 2. バリデーション
    if (isNaN(shopId)) {
      return res.status(400).json({ message: '無効な店舗IDです。' });
    }
    if (!callticketOrder || !callOrder || !Array.isArray(callRules)) {
      return res.status(400).json({ message: 'リクエストデータが不足しています。' });
    }

    // 2. ひとまず成功したことを示す簡単なメッセージを返す
    //    今後のステップで、ここでデータベースの更新処理を実装します。
    res.status(200).json({ 
      message: `Shop ${shopId} updated successfully.`,
      receivedData: updateData // 確認用に受け取ったデータをそのまま返す
    });

    // 3. データベース更新処理。すべての更新が完了したらデータベースにコミットする(transaction)
    const updatedShop = await prisma.$transaction(async (tx) => {
      // 3-1. Shopテーブルの並び順文字列を更新
      const shopUpdate = tx.shop.update({
        where: { id: shopId },
        data: {
          callticketOrder,
          callOrder,
        },
      });

      // 3-2. 既存のCallRuleをすべて削除
      // shopIdに紐づく古いルールを一旦消去する
      const deleteRules = tx.callRule.deleteMany({
        where: { shopId: shopId },
      });

      // 3-3. 新しいCallRuleを作成
      // フロントエンドから送られてきたcallRules配列を元に新しいルールを作成する
      // この時、idやshopIdはDB側で自動採番・設定されるので不要なデータを除く
      const createRules = tx.callRule.createMany({
        data: callRules.map(({ id, shopId: ruleShopId, ...rule }) => rule),
      });
      
      // 上記の3つの処理を同時に実行
      const [updatedShopData] = await Promise.all([shopUpdate, deleteRules, createRules]);
      return updatedShopData;
    });

        // 4. 成功レスポンスを返す
    res.status(200).json({ 
      message: `店舗ID: ${shopId} の情報を更新しました。`,
      data: updatedShop,
    });


  } catch (error) {
    console.error('Error updating shop:', error);
    next(error);
  }
}

module.exports = {
  getShops,
  updateShop,
};