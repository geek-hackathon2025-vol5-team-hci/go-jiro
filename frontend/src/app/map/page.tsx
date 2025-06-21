"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  jiro_score?: number; // 次郎度スコア
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
    {shop.jiro_score !== undefined && (
      <div className="mt-2 flex items-center space-x-2">
        <img
          src={getImageByScore(shop.jiro_score)}
          alt="次郎度アイコン"
          className="w-6 h-6 object-contain"
        />
        <p className="text-black text-sm font-semibold">二郎度: {shop.jiro_score}</p>
      </div>
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

// スコアに応じた画像を返す関数
const getImageByScore = (score: number) => {
  if (score <= 25) return "/jiros/umeJiro.png";
  if (score <= 50) return "/jiros/takeJiro.png";
  if (score <= 75) return "/jiros/matsuJiro.png";
  return "/jiros/oniJiro.png";
};

// スコアに応じたピンの色を返す関数
const getColorByScore = (score: number) => {
  if (score <= 25) return "#ec4899"; // ピンク（梅）
  if (score <= 50) return "#a3e635"; // 黄緑（竹）
  if (score <= 75) return "#15803d"; // 深緑（松）
  return "#7e22ce"; // 紫（鬼）
};

// スコアに応じたレベル名を返す関数
const getLevelByScore = (score: number) => {
  if (score <= 25) return "梅";
  if (score <= 50) return "竹";
  if (score <= 75) return "松";
  return "鬼";
};

// 店舗にランダムなjiro_scoreを割り当てる関数（APIから取得できない場合の代替）
const assignJiroScore = (shops: Shop[]): Shop[] => {
  return shops.map((shop) => ({
    ...shop,
    jiro_score: shop.jiro_score ?? Math.floor(Math.random() * 101), // 0～100のランダムスコア
  }));
};

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
}) => {
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // 並び替え処理（次郎度が未定義のときは0扱い）
  const sortedShops = useMemo(() => {
    return [...shops].sort((a, b) => {
      const scoreA = a.jiro_score ?? 0;
      const scoreB = b.jiro_score ?? 0;
      return sortOrder === "asc" ? scoreA - scoreB : scoreB - scoreA;
    });
  }, [shops, sortOrder]);

  return (
    <div className="w-80 h-full bg-white p-4 shadow-lg border-r flex flex-col">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-2 flex-shrink-0">
        <h2 className="text-2xl text-black font-bold">店舗リスト</h2>
        <button onClick={onClose} className="md:hidden">
          <CloseIcon />
        </button>
      </div>

      {/* 並び替えボタン */}
      <div className="mb-4">
        <button
          onClick={() =>
            setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
          }
          className="px-3 py-1 text-sm text-black bg-gray-200 hover:bg-gray-300 rounded"
        >
          二郎度: {sortOrder === "desc" ? "高い順" : "低い順"}
        </button>
      </div>

      {/* 店舗リスト */}
      <ul className="overflow-y-auto flex-grow">
        {sortedShops.map((shop) => (
          <li
            key={shop.id}
            className={`p-3 mb-2 border rounded-lg cursor-pointer transition-colors ${
              selectedShop?.id === shop.id
                ? "bg-blue-100 border-blue-500"
                : "hover:bg-gray-100"
            }`}
            onClick={() => onShopSelect(shop)}
          >
            <div className="flex items-center space-x-3">
              {/* スコアに応じた画像 */}
              <img
                src={getImageByScore(shop.jiro_score!)}
                alt={`${shop.name} アイコン`}
                className="w-10 h-10 object-contain"
              />
              <div className="flex-grow">
                <p className="font-bold text-black text-lg">{shop.name}</p>
                <p className="text-sm text-gray-600">{shop.address}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-xs text-gray-500">
                    二郎度: {shop.jiro_score}
                  </p>
                  <span
                    className="text-xs px-2 py-1 rounded-full text-white font-semibold"
                    style={{
                      backgroundColor: getColorByScore(shop.jiro_score!),
                    }}
                  >
                    {getLevelByScore(shop.jiro_score!)}
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};


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
      {shops.map((shop) => {
        const score = shop.jiro_score!;
        const color = getColorByScore(score);

        return (
          <AdvancedMarker
            key={shop.id}
            position={{ lat: shop.latitude, lng: shop.longitude }}
            title={`${shop.name} - 次郎度: ${score} (${getLevelByScore(score)})`}
            onClick={() => onMarkerClick(shop)}
          >
            <Pin
              background={color}
              borderColor={"#ffffff"}
              glyphColor={"#ffffff"}
              glyph={score.toString()}
            />
          </AdvancedMarker>
        );
      })}

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
            background={"#007bff"}
            borderColor={"#ffffff"}
            glyphColor={"#ffffff"}
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

  // スコアが割り当てられた店舗リスト（一度だけスコアを生成）
  const shopsWithScore = React.useMemo(() => assignJiroScore(shops), [shops]);

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

        // 写真のプリロード
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
            shops={shopsWithScore}
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
              shops={shopsWithScore}
              selectedShop={selectedShop}
              onMarkerClick={setSelectedShop}
              onMapLoad={setMapInstance}
              position={position}
            />
          </Map>
        </main>
      </APIProvider>
    </main>
  );
}