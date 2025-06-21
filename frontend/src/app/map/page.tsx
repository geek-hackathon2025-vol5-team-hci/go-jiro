"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState, useCallback } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  Pin,
} from "@vis.gl/react-google-maps";

// 店舗の型
type Shop = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  photo?: string;
  openingHours?: string;
};

// ポップアップウインドウの内容
const ShopCard = ({ shop }: { shop: Shop }) => (
  <div className="p-4 border rounded-lg shadow-md bg-white">
    <h2 className="text-2xl font-bold text-black">{shop.name}</h2>
    {shop.photo && (
      <Image
        src={shop.photo}
        alt={shop.name}
        className="w-full h-48 object-cover rounded-md mt-2"
        width={250}
        height={192}
      />
    )}
    <p className="text-black mt-2">{shop.address}</p>
    {shop.openingHours && (
      <p className="text-black text-sm mt-1">今日の営業時間: {shop.openingHours}</p>
    )}
    <Link href={`/shop/${shop.id}`}>
      <button className="mt-4 px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-md shadow-md hover:bg-blue-800">
        詳細を見る
      </button>
    </Link>
  </div>
);

// ハンバーガーアイコン
const HamburgerIcon = () => (
  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

// 閉じるボタンアイコン
const CloseIcon = () => (
  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// 店舗リストコンポーネント
const ShopList = ({
  shops,
  selectedShop,
  onShopSelect,
  onClose,
}: {
  shops: Shop[];
  selectedShop: Shop | null;
  onShopSelect: (shop: Shop | null) => void;
  onClose: () => void;
}) => (
  <div className="w-80 h-full bg-white p-4 shadow-lg border-r flex flex-col">
    {/* 1. タイトルと閉じるボタンのヘッダー部分 */}
    <div className="flex justify-between items-center mb-4 flex-shrink-0">
      <h2 className="text-2xl text-black font-bold">店舗リスト</h2>
      <button onClick={onClose} className="md:hidden">
        <CloseIcon />
      </button>
    </div>
    {/* 2. スクロール可能なリスト部分 */}
    <ul className="overflow-y-auto flex-grow">
      {shops.map((shop) => (
        <li
          key={shop.id}
          className={`p-3 mb-2 border rounded-lg cursor-pointer transition-colors ${
            selectedShop?.id === shop.id
              ? "bg-blue-100 border-blue-500"
              : "hover:bg-gray-100"
          }`}
          onClick={() => onShopSelect(shop)}
        >
          <p className="font-bold text-black text-lg">{shop.name}</p>
          <p className="text-sm text-gray-600 mt-1">{shop.address}</p>
        </li>
      ))}
    </ul>
  </div>
);


// マップにマーカーを表示
const MapController = ({
  shops,
  onMarkerClick,
  selectedShop,
  onMapLoad,
  position,
}: {
  shops: Shop[];
  onMarkerClick: (shop: Shop | null) => void;
  selectedShop: Shop | null;
  onMapLoad: (map: google.maps.Map) => void;
  position: { lat: number; lng: number } | null;
}) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      onMapLoad(map);
    }
  }, [map, onMapLoad]);

  return (
    <>
      {shops.map((shop) => (
        <AdvancedMarker
          key={shop.id}
          position={{ lat: shop.latitude, lng: shop.longitude }}
          title={shop.name}
          onClick={() => onMarkerClick(shop)}
        />
      ))}
      {selectedShop && (
        <InfoWindow
          position={{
            lat: selectedShop.latitude,
            lng: selectedShop.longitude,
          }}
          onCloseClick={() => onMarkerClick(null)}
        >
          <ShopCard shop={selectedShop} />
        </InfoWindow>
      )}
      {/* 現在位置に青いピンを立てる */}
      {position && (
        <AdvancedMarker position={position} title={"現在位置"}>
          <Pin
            background={"#007bff"} // ピンの背景色を青に
            borderColor={"#ffffff"} // 枠線の色を白に
            glyphColor={"#ffffff"} // 中のアイコンの色を白に
          />
        </AdvancedMarker>
      )}
    </>
  );
};

export default function MapPage() {
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = useCallback(
    async (keyword: string) => {
      if (!mapInstance) return;
      const center = mapInstance.getCenter();
      if (!center) return;
      const lat = center.lat();
      const lng = center.lng();

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(
          `${baseUrl}/api/shops?keyword=${encodeURIComponent(keyword)}&lat=${lat}&lng=${lng}`
        );
        if (!response.ok) throw new Error("Failed to fetch shops");
        const data: Shop[] = await response.json();

        data.forEach((shop) => {
          if (shop.photo) {
            const img = new window.Image();
            img.src = shop.photo;
          }
        });

        setShops(data);
        setSelectedShop(null);
      } catch (error) {
        console.error(error);
      }
    },
    [mapInstance]
  );

  useEffect(() => {
    if (mapInstance) {
      handleSearch("ラーメン二郎");
    }
  }, [mapInstance, handleSearch]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition({ lat: latitude, lng: longitude });
        },
        (err) => {
          setErrorMsg(`現在位置の取得に失敗しました: ${err.message}`);
          setPosition({ lat: 43.0618, lng: 141.3545 });
        }
      );
    } else {
      setErrorMsg("お使いのブラウザは位置情報機能に対応していません。");
      setPosition({ lat: 43.0618, lng: 141.3545 });
    }
  }, []);

  const apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 font-bold">APIキーが設定されていません。</p>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>現在位置を取得中...</p>
      </div>
    );
  }

  return (
    <main className="relative h-screen w-screen md:flex">
      <APIProvider apiKey={apiKey}>
        {/* 店舗リストパネル */}
        <div
          className={`
            z-20 fixed top-16 h-[calc(100%-64px)] left-0 bg-white w-80 
            transition-transform duration-300 ease-in-out 
            ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
            md:static md:h-full md:top-0 md:translate-x-0
          `}
        >
          <ShopList
            key={isMenuOpen ? "open" : "closed"}
            shops={shops}
            selectedShop={selectedShop}
            onShopSelect={setSelectedShop}
            onClose={() => setIsMenuOpen(false)}
          />
        </div>

        {/* 地図領域 */}
        <main className="flex-grow h-full">
          {/* ハンバーガーボタン（モバイルのみ） */}
          {!isMenuOpen && (
            <button
              onClick={() => setIsMenuOpen(true)}
              className="fixed top-16 left-4 z-50 bg-white p-2 rounded-md shadow-lg md:hidden"
            >
              <HamburgerIcon />
            </button>
          )}

          {errorMsg && (
            <div className="absolute left-0 bg-red-500 text-white p-2 z-10">
              {errorMsg}
            </div>
          )}

          <Map
            defaultCenter={position}
            defaultZoom={15}
            gestureHandling="greedy"
            disableDefaultUI={true}
            mapId="go-jiro-map"
          >
            <MapController
              shops={shops} //取得した店舗ステート
              selectedShop={selectedShop} //選択中の店舗ステート
              onMarkerClick={setSelectedShop} //マーカークリック時のリスナーに選択中の店舗ステートを登録
              onMapLoad={setMapInstance} //地図ロード時のリスナーにMapインスタンスステートを登録
              position={position} // ← 追加
            />
          </Map>
        </main>
      </APIProvider>
    </main>
  );
}
