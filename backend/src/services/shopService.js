// backend/src/services/shopService.js

const axios = require('axios');

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
          'X-Goog-FieldMask': 'places.id,places.displayName,places.location,places.shortFormattedAddress',
        },
      }
    );

    if (!response.data || !response.data.places) {
      return [];
    }

    const shops = response.data.places.map((place) => ({
      id: place.id,
      name: place.displayName.text,
      latitude: place.location.latitude,
      longitude: place.location.longitude,
      address: place.shortFormattedAddress,
    }));

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