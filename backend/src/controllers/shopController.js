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
 * 店舗IDに基づいて店舗情報を取得するための新しい関数
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const getShopById = async (req, res, next) => {
  try {
    const { shopId } = req.params;

    // Prismaを使ってShopテーブルからデータを取得
    // 関連するcallRulesも一緒に取得するためにincludeを使用します
    const shop = await prisma.shop.findUnique({
      where: {
        id: shopId, // URLから受け取ったIDを使用
      },
      include: {
        callRules: { // 関連するコールルールも全て取得
          orderBy: {
            optionOrder: 'asc', // optionOrderでソート
          },
        },
      },
    });

    if (!shop) {
      // 店舗が見つからない場合は404エラーを返す
      return res.status(404).json({ message: 'Shop not found' });
    }

    // 取得した店舗情報をJSONで返す
    res.json(shop);

  } catch (error) {
    // エラーハンドリング
    console.error('Error fetching shop by ID:', error);
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
    const { shopId } = req.params;
    const { callticketOrder, callOrder, callRules, name, address, latitude, longitude } = req.body;

// 2. バリデーション
    if (!shopId || !callticketOrder || !callOrder || !Array.isArray(callRules)) {
      return res.status(400).json({ message: 'リクエストデータが不足しています。' });
    }

    // 3. データベース更新処理。すべての更新が完了したらデータベースにコミットする(transaction)
    const updatedShop = await prisma.$transaction(async (tx) => {
      
      // 3-1. Shop情報を更新または作成 (upsert = データがあれば更新(update), なければ挿入(insert))
      const shopData = {
        id: shopId,
        name: name || '店舗名不明', // フロントエンドからnameなども渡す必要がある
        callticketOrder,
        callOrder,
        // 必要に応じて他の店舗情報もここで設定
        latitude: latitude || 0,
        longitude: longitude || 0,
        jiro_difficulty: 0, // 仮の値
      };

      const upsertShop = await tx.shop.upsert({
        where: { id: shopId }, // 条件
        update: { callticketOrder, callOrder }, // 見つかった時、この二つの項目を更新
        create: shopData, // ないとき、新規作成
      });

      // 3-2. 既存のCallRuleをすべて削除
      await tx.callRule.deleteMany({
        where: { shopId: shopId },
      });

      // 3-3. 新しいCallRuleを作成
      if (callRules.length > 0) {
        await tx.callRule.createMany({
          data: callRules.map(({ id, shopId: ruleShopId, ...rule }) => ({
            ...rule,
            shopId: shopId, // どのShopに紐づくかIDをセット
          })),
        });
      }

      return upsertShop;
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
  getShopById,
  updateShop,
};