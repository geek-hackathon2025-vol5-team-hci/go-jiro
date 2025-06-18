// backend/src/services/shopService.js
// Google Places API (New) を使用して店舗情報を検索するサービス
const axios = require('axios'); // axiosを使用してHTTPリクエストを送信

// Places API (New) の searchText エンドポイント
const PLACES_API_NEW_URL = 'https://places.googleapis.com/v1/places:searchText';

/**
 * Google Places API (New) の searchText を使って店舗情報を検索する
 * @param {object} params - 検索パラメータ
 * @param {string} params.keyword - 検索キーワード
 * @param {number} params.lat - 中心の緯度
 * @param {number} params.lng - 中心の経度
 * @returns {Promise<Shop[]>}
 */
const findShopsFromGoogle = async ({ keyword, lat, lng }) => {
  try {
    const response = await axios.post(
      PLACES_API_NEW_URL,
      {
        textQuery: keyword,
        languageCode: "ja",
        maxResultCount: 20,  
        includedType: "restaurant",
        locationBias: {
          circle: {
            center: {
              latitude: lat,
              longitude: lng,
            },
            radius: 5000.0,
          },
        },
      },
      // ヘッダー情報
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.Maps_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.location,places.shortFormattedAddress,places.photos',
        },
      }
    );

    // レスポンスのデータが正しいか確認
    if (!response.data || !response.data.places) {
      return [];
    }

    // 取得した店舗情報を整形、json形式で返す
    const shops = response.data.places.map((place) => {
      let photoUrl = null;

      if (place.photos && place.photos.length > 0) {
        const photoResourceName = place.photos[0].name;
        photoUrl = `https://maps.googleapis.com/vi/${photoResourceName}/media?maxHeightPx=400&key=${process.env.Maps_API_KEY}`;
      }

      return {
        id: place.id, // 店舗のID
        name: place.displayName.text, // 店舗名
        latitude: place.location.latitude, // 緯度
        longitude: place.location.longitude, // 経度
        address: place.shortFormattedAddress, // 住所
        photoUrl: photoUrl, // 写真のURL
      };
    });

    return shops;

  } catch (error) {
    if (error.response) {
      console.error('Google Places API (New) Error:', error.response.data);
    } else {
      console.error('Error fetching from Google Places API (New):', error.message);
    }
    return [];
  }
};

module.exports = {
  findShopsFromGoogle,
};