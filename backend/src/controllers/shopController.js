// backend/src/controllers/shopController.js

// shopServiceからfindShopsFromGoogleをインポート
const { findShopsFromGoogle, getShopDetailsFromGoogle } = require('../services/shopService');
const prisma = require('../config/prisma');
const shopService = require('../services/shopService');


// 新規店舗作成時に使用するデフォルトのテンプレート
const defaultShopTemplate = {
  callticketOrder: "リョウ,カタサ",
  callOrder: "ヤサイ,アブラ,ニンニク",
  callRules: [
    { category: "リョウ", option: "普通", callText: "" ,optionOrder: 1},
    { category: "リョウ", option: "少なめ", callText: "スクナメ",optionOrder: 2 },
    { category: "リョウ", option: "半分", callText: "ハンブン" ,optionOrder: 3},
    { category: "カタサ", option: "普通", callText: "" ,optionOrder: 1},
    { category: "カタサ", option: "柔らかめ", callText: "ヤワラカメ" ,optionOrder: 2},
    { category: "カタサ", option: "固め", callText: "カタメ" ,optionOrder: 3},
    { category: "ヤサイ", option: "無し", callText: "ヤサイヌキ" ,optionOrder: 1},
    { category: "ヤサイ", option: "少なめ", callText: "ヤサイスクナメ" ,optionOrder: 2},
    { category: "ヤサイ", option: "普通", callText: "" ,optionOrder: 3},
    { category: "ヤサイ", option: "多め", callText: "ヤサイマシ" ,optionOrder: 4},
    { category: "ヤサイ", option: "非常に多め", callText: "ヤサイマシマシ",optionOrder: 5},
    { category: "アブラ", option: "無し", callText: "アブラヌキ" ,optionOrder: 1},
    { category: "アブラ", option: "少なめ", callText: "アブラスクナメ",optionOrder: 2},
    { category: "アブラ", option: "普通", callText: "" ,optionOrder: 3},
    { category: "アブラ", option: "多め", callText: "アブラマシ" ,optionOrder: 4},
    { category: "アブラ", option: "非常に多め", callText: "アブラマシマシ" ,optionOrder: 5},
    { category: "タレ", option: "少なめ", callText: "カラメスクナメ" ,optionOrder: 1},
    { category: "タレ", option: "普通", callText: "" ,optionOrder: 2},
    { category: "タレ", option: "多め", callText: "カラメマシ" ,optionOrder: 3},
    { category: "タレ", option: "非常に多め", callText: "カラメマシマシ",optionOrder: 4 },
    { category: "ニンニク", option: "無し", callText: "" ,optionOrder: 1},
    { category: "ニンニク", option: "少なめ", callText: "ニンニクスクナメ" ,optionOrder: 2},
    { category: "ニンニク", option: "普通", callText: "ニンニク" ,optionOrder: 3},
    { category: "ニンニク", option: "多め", callText: "ニンニクマシ" ,optionOrder: 4},
    { category: "ニンニク", option: "非常に多め", callText: "ニンニクマシマシ" ,optionOrder: 5},
  ]
};



const getShops = async (req, res, next) => {
  try {
    const { keyword, lat, lng } = req.query;

    if (!keyword || !lat || !lng) {
      return res.status(400).json({ message: 'keyword, lat, lng are required' });
    }
    
    const searchParams = {
      keyword,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    };

    // 1. Googleから店舗リストを取得
    const googleShops = await findShopsFromGoogle(searchParams);
    const shopIds = googleShops.map(shop => shop.id);

    // 2. DBから対応する店舗のjiro_difficultyを取得
    const prismaShops = await prisma.shop.findMany({
      where: {
        id: {
          in: shopIds,
        },
      },
      select: {
        id: true,
        jiro_difficulty: true,
      },
    });
    
    // ★★★ デバッグログ ★★★
    console.log("[DEBUG] getShops: DBから読み取ったデータ:", prismaShops);

    // 3. 効率的にマージするための準備
    const prismaShopsMap = new Map(
      prismaShops.map(shop => [shop.id, shop])
    );

    // 4. Googleの情報とDBの情報をマージ
    const mergedShops = googleShops.map(googleShop => {
      const prismaShop = prismaShopsMap.get(googleShop.id);
      return {
        ...googleShop,
        jiro_difficulty: prismaShop ? prismaShop.jiro_difficulty : null,
      };
    });

    res.json(mergedShops);

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

     // まず、指定されたIDで店舗を検索する
    let shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        callRules: {
          orderBy: {
            optionOrder: 'asc',
          },
        },
      },
    });

    // 店舗が見つかった場合は、その情報を返す
    if (shop) {
      console.log(`[DEBUG] getShopById: DBから見つかった店舗「${shop.name}」のjiro_difficulty:`, shop.jiro_difficulty);
      return res.json(shop);
    }

    // 店舗が見つからない場合、Google APIから情報を取得し、初期化する
    const googleShopDetails = await getShopDetailsFromGoogle(shopId);

    // APIから取得した名前と位置情報を使う。取得失敗時はフォールバック値を設定
    const shopName = googleShopDetails?.name || '（店舗名未設定）';
    const shopLatitude = googleShopDetails?.latitude || 0.0;
    const shopLongitude = googleShopDetails?.longitude || 0.0;

    const newShop = await prisma.shop.create({
      data: {
        id: shopId,
        name: shopName,
        latitude: shopLatitude,
        longitude: shopLongitude,
        jiro_difficulty: 0,
        
        callticketOrder: defaultShopTemplate.callticketOrder,   // 初期値は空の配列（文字列）
        callOrder: defaultShopTemplate.callOrder,         // 初期値は空の配列（文字列）

        // 関連するcallRulesもテンプレートを基に一括で作成する（ネストした書き込み）
        callRules: {
          create: defaultShopTemplate.callRules.map(rule => ({
            // テンプレートからidとshopIdを除いたデータを渡す
            // idは自動採番され、shopIdは自動で関連付けられる
            category: rule.category,
            option: rule.option,
            callText: rule.callText,
            optionOrder: rule.optionOrder,
          })),
        },
      },
      include: {
        callRules: true, // 関連付けられているCallRuleテーブルも取得する
      },
    });
    // 新しく作成したリソースを示すステータスコード201と共に、店舗情報を返す
    return res.status(201).json(newShop);

  } catch (error) {
    // エラーハンドリング
    console.error('Error in getShopById (find or create):', error);
    next(error);
  }
};
exports.getShopAverageEvaluation = async (req, res) => {
    const shopId = parseInt(req.params.id, 10);

    if (isNaN(shopId)) {
        return res.status(400).json({ message: 'Invalid shop ID' });
    }

    try {
        const averageEvaluation = await prisma.evaluation.aggregate({
            where: {
                shopId: shopId,
            },
            _avg: {
                jirodo: true,
                estimatePortion: true,
                actualPortion: true,
                orderHelp: true,
                exitPressure: true,
            },
            _count: {
                id: true, // 評価の総数をカウント
            }
        });

        // 評価が1件もない場合は、平均(avg)がnullになるため、その場合のレスポンスを定義
        if (averageEvaluation._count.id === 0) {
            return res.status(200).json({
                message: 'No evaluations found for this shop.',
                _avg: {
                    jirodo: 0,
                    estimatePortion: 0,
                    actualPortion: 0,
                    orderHelp: 0,
                    exitPressure: 0,
                },
                _count: { id: 0 }
            });
        }

        res.status(200).json(averageEvaluation);
    } catch (error) {
        res.status(500).json({ message: 'Error calculating average evaluation', error: error.message });
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

// 2. バリデーション（緩和版）
    if (!shopId || !Array.isArray(callRules)) {
      return res.status(400).json({ message: 'リクエストデータが不足しています。' });
    }

    // 3. データベース更新処理。すべての更新が完了したらデータベースにコミットする(transaction)
    const updatedShop = await prisma.$transaction(async (tx) => {
      
      // 3-1. Shop情報を更新または作成 (upsert = データがあれば更新(update), なければ挿入(insert))
      const shopData = {
        id: shopId,
        name: name || '店舗名不明', // フロントエンドからnameなども渡す必要がある
        callticketOrder ,
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