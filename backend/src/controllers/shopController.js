// backend/src/controllers/shopController.js

// shopServiceからfindShopsFromGoogleをインポート
const { findShopsFromGoogle } = require('../services/shopService');

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

module.exports = {
  getShops,
};