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

// 店舗の型を修正
type Shop = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  photo?: string;
  openingHours?: string;
  jiro_difficulty?: number | null; // DBから来る次郎難易度(nullの可能性あり)
  distance?: number; // 現在位置からの距離（km）
  isOpen?: boolean; // 営業中かどうか
};

// 2点間の距離を計算する関数
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // 地球の半径（km）
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 営業時間から営業中かどうかを判定する関数（簡易版）
const checkIsOpen = (openingHours?: string): boolean => {
  if (!openingHours) return Math.random() > 0.3; // 営業時間不明の場合はランダム（70%の確率で営業中）
  
  // 簡易的な営業時間チェック（実際のAPIからのデータに応じて調整が必要）
  const now = new Date();
  const currentHour = now.getHours();
  
  // 基本的なパターンをチェック（11:00-22:00など）
  if (openingHours.includes('定休日') || openingHours.includes('準備')) {
    return false;
  }
  
  // 簡易的に11-22時を営業時間とする（実際はより複雑な解析が必要）
  return currentHour >= 11 && currentHour < 22;
};

// ポップアップウインドウの内容
const ShopCard = ({ shop }: { shop: Shop }) => (
  <div className="shadow-md bg-white">
    <div className="flex items-center space-x-2 mb-2">
      <h2 className="text-2xl font-bold text-black">{shop.name}</h2>
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          shop.isOpen
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {shop.isOpen ? "営業中" : "準備中"}
      </span>
    </div>
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
      <div className="mt-3 p-2 bg-yellow-100 rounded-lg">
        <p className="text-sm font-semibold text-yellow-800">
          今日の営業時間: <span className="font-normal">{shop.openingHours}</span>
        </p>
      </div>
    )}
    {/* jiro_difficulty を表示 */}
    {shop.jiro_difficulty !== undefined && shop.jiro_difficulty !== null && (
      <div className="mt-2 flex items-center space-x-2">
        <Image
          src={getImageByScore(shop.jiro_difficulty)}
          alt="次郎度アイコン"
          className="object-contain"
          width={24}
          height={24}
        />
        <p className="text-black text-sm font-semibold">二郎度: {shop.jiro_difficulty}</p>
      </div>
    )}
    {shop.distance !== undefined && (
      <p className="text-black text-sm mt-1">距離: {shop.distance.toFixed(1)}km</p>
    )}
    <Link href={`/shop/${shop.id}`}>
      <button className="mt-4 px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-md shadow-md hover:bg-blue-800">
        詳細を見る
      </button>
    </Link>
  </div>
);

const HamburgerIcon = () => ( <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /> </svg> );

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

// 店舗にランダムなjiro_difficultyと営業状況を割り当てる関数
const assignJiroScore = (shops: Shop[]): Shop[] => {
  return shops.map((shop) => ({
    ...shop,
    jiro_difficulty: shop.jiro_difficulty ?? Math.floor(Math.random() * 101), // 0～100のランダムスコア
    isOpen: shop.isOpen ?? checkIsOpen(shop.openingHours), // 営業状況を判定
  }));
};

// ソートタイプの定義
type SortType = "distance" | "jiro_high" | "jiro_low";

const ShopList = ({ shops, selectedShop, onShopSelect, onClose, userPosition }: { shops: Shop[]; selectedShop: Shop | null; onShopSelect: (shop: Shop | null) => void; onClose: () => void; userPosition: { lat: number; lng: number } | null; }) => {
  const [sortType, setSortType] = useState<SortType>("distance");

  const sortedShops = useMemo(() => {
    if (!userPosition) return shops;
    const shopsWithDistance = shops.map((shop) => ({ ...shop, distance: calculateDistance(userPosition.lat, userPosition.lng, shop.latitude, shop.longitude), }));

    // jiro_difficulty でソートするように修正
    return [...shopsWithDistance].sort((a, b) => {
      switch (sortType) {
        case "distance": return (a.distance ?? 0) - (b.distance ?? 0);
        case "jiro_high": return (b.jiro_difficulty ?? 0) - (a.jiro_difficulty ?? 0);
        case "jiro_low": return (a.jiro_difficulty ?? 0) - (b.jiro_difficulty ?? 0);
        default: return 0;
      }
    });
  }, [shops, sortType, userPosition]);

  const sortOptions = [ { value: "distance", label: "📍 近い順" }, { value: "jiro_high", label: "🔥 二郎度: 高い順" }, { value: "jiro_low", label: "🌱 二郎度: 低い順" }, ] as const;

  return (
    <div className="w-80 h-full bg-white p-4 shadow-lg border-r flex flex-col">
      <div className="flex justify-between items-center mb-2 flex-shrink-0">
        <h2 className="text-2xl text-black font-bold">店舗リスト</h2>
        <button onClick={onClose} className="md:hidden"> <CloseIcon /> </button>
      </div>
      <div className="mb-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {sortOptions.map((option) => ( <button key={option.value} onClick={() => setSortType(option.value)} className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${ sortType === option.value ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900" }`}> {option.label} </button> ))}
        </div>
      </div>
      <ul className="overflow-y-auto flex-grow">
        {sortedShops.map((shop) => (
          <li
            key={shop.id}
            className={`p-3 mb-2 border rounded-lg cursor-pointer transition-colors ${
              selectedShop?.id === shop.id
                ? "bg-blue-100 border-blue-500"
                : "hover:bg-gray-100"
            } ${!shop.isOpen ? "opacity-70" : ""}`}
            onClick={() => onShopSelect(shop)}
          >
            <div className="flex items-center space-x-3">
              {/* スコアに応じた画像 */}
              <Image
                src={getImageByScore(shop.jiro_difficulty!)}
                alt={`${shop.name} アイコン`}
                className="object-contain"
                width={40}
                height={40}
              />
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-black text-lg">{shop.name}</p>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                      shop.isOpen
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {shop.isOpen ? "営業中" : "準備中"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{shop.address}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-xs text-gray-500">
                    二郎度: {shop.jiro_difficulty}
                  </p>
                  <span
                    className="text-xs px-2 py-1 rounded-full text-white font-semibold"
                    style={{
                      backgroundColor: getColorByScore(shop.jiro_difficulty!),
                    }}
                  >
                    {getLevelByScore(shop.jiro_difficulty!)}
                  </span>
                </div>
                {shop.distance !== undefined && (
                  <p className="text-xs text-gray-500 mt-1">
                    距離: {shop.distance.toFixed(1)}km
                  </p>
                )}
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
  useEffect(() => { if (map) onMapLoad(map); }, [map, onMapLoad]);

  return (
    <>
      {shops.map((shop) => {
        const score = shop.jiro_difficulty ?? 0; // nullの場合は0として扱う
        const color = getColorByScore(score);
        return (
          <AdvancedMarker
            key={shop.id}
            position={{ lat: shop.latitude, lng: shop.longitude }}
            title={`${shop.name} - 次郎度: ${score} (${getLevelByScore(score)}) - ${shop.isOpen ? '営業中' : '準備中'}`}
            onClick={() => onMarkerClick(shop)}
            style={{
              opacity: shop.isOpen ? 1 : 0.5, // 準備中は半透明
            }}
          >
            <div style={{ opacity: shop.isOpen ? 1 : 0.5 }}>
              <Pin
                background={color}
                borderColor={"#ffffff"}
                glyphColor={"#ffffff"}
                glyph={score.toString()}
              />
            </div>
          </AdvancedMarker>
        );
      })}
      {selectedShop && ( <InfoWindow position={{ lat: selectedShop.latitude, lng: selectedShop.longitude, }} onCloseClick={() => onMarkerClick(null)}> <ShopCard shop={selectedShop} /> </InfoWindow> )}
      {position && ( <AdvancedMarker position={position} title={"現在位置"}> <Pin background={"#007bff"} borderColor={"#ffffff"} glyphColor={"#ffffff"}/> </AdvancedMarker> )}
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

  // ランダムスコアを生成するロジックは不要になったので削除
  
  const handleSearch = useCallback( async (keyword: string) => {
    if (!mapInstance) return;
    const center = mapInstance.getCenter();
    if (!center) return;
    const lat = center.lat();
    const lng = center.lng();
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${baseUrl}/api/shops?keyword=${encodeURIComponent(keyword)}&lat=${lat}&lng=${lng}`);
      if (!response.ok) throw new Error("Failed to fetch shops");
      const data: Shop[] = await response.json();
      data.forEach((shop) => { if (shop.photo) { const img = new window.Image(); img.src = shop.photo; } });
      setShops(data);
      setSelectedShop(null);
    } catch (error) { console.error(error); }
  }, [mapInstance] );

  useEffect(() => { if (mapInstance) { handleSearch("ラーメン二郎"); } }, [mapInstance, handleSearch]);
  useEffect(() => { if (navigator.geolocation) { navigator.geolocation.getCurrentPosition( (pos) => { setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }); }, (err) => { setErrorMsg(`現在位置の取得に失敗しました: ${err.message}`); setPosition({ lat: 43.0618, lng: 141.3545 }); } ); } else { setErrorMsg("お使いのブラウザは位置情報機能に対応していません。"); setPosition({ lat: 43.0618, lng: 141.3545 }); } }, []);

  const apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;
  if (!apiKey) return <div className="flex items-center justify-center min-h-screen"><p className="text-red-500 font-bold">APIキーが設定されていません。</p></div>;
  if (!position) return <div className="flex items-center justify-center min-h-screen"><p>現在位置を取得中...</p></div>;

  return (
    <main className="relative h-screen w-screen md:flex">
      <APIProvider apiKey={apiKey}>
        <div className={`z-20 fixed top-16 h-[calc(100%-64px)] left-0 bg-white w-80 transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} md:static md:h-full md:top-0 md:translate-x-0`}>
          {/* propsに渡すのを `shops` に変更 */}
          <ShopList key={isMenuOpen ? "open" : "closed"} shops={shops} selectedShop={selectedShop} onShopSelect={setSelectedShop} onClose={() => setIsMenuOpen(false)} userPosition={position}/>
        </div>
        <main className="flex-grow h-full">
          {!isMenuOpen && ( <button onClick={() => setIsMenuOpen(true)} className="fixed top-16 left-4 z-50 bg-white p-2 rounded-md shadow-lg md:hidden"> <HamburgerIcon /> </button> )}
          {errorMsg && ( <div className="absolute left-0 bg-red-500 text-white p-2 z-10"> {errorMsg} </div> )}
          <Map defaultCenter={position} defaultZoom={15} gestureHandling="greedy" disableDefaultUI={true} mapId="go-jiro-map">
            {/* propsに渡すのを `shops` に変更 */}
            <MapController shops={shops} selectedShop={selectedShop} onMarkerClick={setSelectedShop} onMapLoad={setMapInstance} position={position}/>
          </Map>
        </main>
      </APIProvider>
    </main>
  );
}