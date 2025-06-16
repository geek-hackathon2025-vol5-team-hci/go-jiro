"use client";

import React, { useEffect, useState, useCallback } from "react"; //useEffectをインポート
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";

//店舗の型
type Shop = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
};

// Mapコンポーネントを子コンポーネントとして分離
// これにより、APIProviderの外でuseStateやuseEffectを使えるようになる
const MapController = () => {
  const map = useMap();
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  //検索する関数
  const handleSearch = useCallback(async (keyword: string) => {
    if (!map) return;
    const center = map.getCenter();
    if (!center) return;
    const lat = center.lat();
    const lng = center.lng();

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(
        `${baseUrl}/api/shops?keyword=${encodeURIComponent(
          keyword
        )}&lat=${lat}&lng=${lng}`
      );
      if (!response.ok) throw new Error("Failed to fetch shops");
      const data: Shop[] = await response.json();
      setShops(data);
      setSelectedShop(null);
    } catch (error) {
      console.error(error);
    }
  }, [map]);
  
  useEffect(() => {
    if (map) {
      handleSearch("ラーメン二郎");
    }
  }, [map, handleSearch]);

  return (
    <>
      {shops.map((shop) => (
        <AdvancedMarker
          key={shop.id}
          position={{ lat: shop.latitude, lng: shop.longitude }}
          title={shop.name}
          onClick={() => setSelectedShop(shop)}
        />
      ))}
      {/*ピンが押された時の挙動*/}
      {selectedShop && (
        <InfoWindow
          position={{
            lat: selectedShop.latitude,
            lng: selectedShop.longitude,
          }}
          onCloseClick={() => setSelectedShop(null)}
        >
          {/*店名を表示*/}
          <p className="font-bold text-lg text-black">{selectedShop.name}</p>
        </InfoWindow>
      )}
    </>
  );
};



export default function MapPage() {
  // ★★★ 現在位置とエラーメッセージを管理するState ★★★
  const [position, setPosition] = useState<{lat: number, lng: number} | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ★★★ ページ読み込み時に現在位置を取得するuseEffect ★★★
  useEffect(() => {
    // ブラウザがGeolocation APIに対応しているかチェック
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // 成功した場合: 緯度・経度をstateにセット
          const { latitude, longitude } = pos.coords;
          setPosition({ lat: latitude, lng: longitude });
        },
        (err) => {
          // 失敗した場合: エラーメッセージをセットし、デフォルト位置（札幌）を設定
          setErrorMsg(`現在位置の取得に失敗しました: ${err.message}`);
          setPosition({ lat: 43.0618, lng: 141.3545 }); // デフォルト: 札幌駅
        }
      );
    } else {
      // Geolocation APIに非対応の場合
      setErrorMsg("お使いのブラウザは位置情報機能に対応していません。");
      setPosition({ lat: 43.0618, lng: 141.3545 }); // デフォルト: 札幌駅
    }
  }, []); // 空の依存配列で、初回レンダリング時に一度だけ実行

  const apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;

  if (!apiKey) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-red-500 font-bold">APIキーが設定されていません。</p></div>;
  }
  
  // ★★★ 位置情報取得中はローディング画面を表示 ★★★
  if (!position) {
    return <div className="flex items-center justify-center min-h-screen"><p>現在位置を取得中...</p></div>;
  }

  return (
    <APIProvider apiKey={apiKey}>
      {errorMsg && <div className="absolute top-0 left-0 bg-red-500 text-white p-2 z-10">{errorMsg}</div>}
      <main style={{ width: "100vw", height: "100vh" }}>
        <Map
          defaultCenter={position} // ★★★ stateから取得した位置情報を中心に設定 ★★★
          defaultZoom={15}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
          mapId="go-jiro-map"
        >
          <MapController />
        </Map>
      </main>
    </APIProvider>
  );
}