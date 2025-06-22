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

// --- 型定義 ---
type Shop = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  photo?: string;
  openingHours?: string;
  jiro_difficulty?: number | null;
  distance?: number;
  isOpen?: boolean;
};

type SortType = "distance" | "jiro_high" | "jiro_low";

// --- ヘルパー関数群 ---
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const checkIsOpen = (openingHours?: string): boolean => {
    if (!openingHours || openingHours === "営業時間不明") return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const timeRanges = openingHours.split(/、|,/);
    for (const range of timeRanges) {
        const match = range.match(/(\d{1,2}):(\d{2})～(\d{1,2}):(\d{2})/);
        if (match) {
            const [, sh, sm, eh, em] = match.map(Number);
            const startMinutes = sh * 60 + sm;
            let endMinutes = eh * 60 + em;
            if (endMinutes < startMinutes) endMinutes += 24 * 60;
            if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) return true;
        }
    }
    return false;
};

const getImageByScore = (score: number | null | undefined) => {
    const s = score ?? -1;
    if (s < 0) return "/jiros/nazoJiro.png";
    if (s <= 25) return "/jiros/umeJiro.png";
    if (s <= 50) return "/jiros/takeJiro.png";
    if (s <= 75) return "/jiros/matsuJiro.png";
    return "/jiros/oniJiro.png";
};

const getColorByScore = (score: number | null | undefined) => {
    const s = score ?? -1;
    if (s < 0) return "#7d7d7d";
    if (s <= 25) return "#ec4899";
    if (s <= 50) return "#a3e635";
    if (s <= 75) return "#15803d";
    return "#7e22ce";
};

const getLevelByScore = (score: number | null | undefined) => {
    const s = score ?? -1;
    if (s < 0) return "謎";
    if (s <= 25) return "梅";
    if (s <= 50) return "竹";
    if (s <= 75) return "松";
    return "鬼";
};

const HamburgerIcon = () => (<svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>);
const CloseIcon = () => (<svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>);

// --- 子コンポーネント ---

const ShopCard = ({ shop }: { shop: Shop }) => (
    <div className="shadow-md bg-white p-4 rounded-md max-w-xs">
        <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-2xl font-bold text-black">{shop.name}</h2>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ shop.isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {shop.isOpen ? "営業中" : "準備中"}
            </span>
        </div>
        {shop.photo && <Image src={shop.photo} alt={shop.name} className="w-full h-48 object-cover rounded-md mt-2" width={250} height={192} />}
        <p className="text-black mt-2">{shop.address}</p>
        {shop.openingHours && (
            <div className="mt-3 p-2 bg-yellow-100 rounded-lg">
                <p className="text-sm font-semibold text-yellow-800">
                    今日の営業時間: <span className="font-normal">{shop.openingHours}</span>
                </p>
            </div>
        )}
        {(shop.jiro_difficulty ?? -1) >= 0 && (
            <div className="mt-2 flex items-center space-x-2">
                <Image src={getImageByScore(shop.jiro_difficulty)} alt="次郎度アイコン" className="object-contain" width={24} height={24} />
                <p className="text-black text-sm font-semibold">
                    二郎度: {shop.jiro_difficulty}
                </p>
            </div>
        )}
        {shop.distance !== undefined && <p className="text-black text-sm mt-1">距離: {shop.distance.toFixed(1)}km</p>}
        <Link href={`/shop/${shop.id}`}>
            <button className="mt-4 px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-md shadow-md hover:bg-blue-800">詳細を見る</button>
        </Link>
    </div>
);

const ShopList = ({ shops, selectedShop, onShopSelect, onClose, sortType, setSortType }: { shops: Shop[], selectedShop: Shop | null, onShopSelect: (shop: Shop | null) => void, onClose: () => void, sortType: SortType, setSortType: (type: SortType) => void }) => {
    const sortOptions = [{ value: "distance", label: "📍 近い順" }, { value: "jiro_high", label: "🔥 二郎度: 高い順" }, { value: "jiro_low", label: "🌱 二郎度: 低い順" }] as const;

    return (
        <div className="w-80 h-full bg-white p-4 shadow-lg border-r flex flex-col">
            <div className="flex justify-between items-center mb-2 flex-shrink-0">
                <h2 className="text-2xl text-black font-bold">店舗リスト</h2>
                <button onClick={onClose} className="md:hidden"><CloseIcon /></button>
            </div>
            <div className="mb-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                    {sortOptions.map((option) => (<button key={option.value} onClick={() => setSortType(option.value)} className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${sortType === option.value ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>{option.label}</button>))}
                </div>
            </div>
            <ul className="overflow-y-auto flex-grow">
                {shops.map((shop) => (
                    <li key={shop.id} className={`p-3 mb-2 border rounded-lg cursor-pointer transition-colors ${selectedShop?.id === shop.id ? "bg-blue-100 border-blue-500" : "hover:bg-gray-100"} ${!shop.isOpen ? "opacity-70" : ""}`} onClick={() => onShopSelect(shop)}>
                        <div className="flex items-center space-x-3">
                            <Image src={getImageByScore(shop.jiro_difficulty)} alt={`${shop.name} アイコン`} className="object-contain" width={40} height={40} />
                            <div className="flex-grow">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="font-bold text-black text-lg">{shop.name}</p>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${shop.isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{shop.isOpen ? "営業中" : "準備中"}</span>
                                </div>
                                <p className="text-sm text-gray-600">{shop.address}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                    <p className="text-xs text-gray-500">二郎度: {(shop.jiro_difficulty ?? -1) < 0 ? "不明" : shop.jiro_difficulty}</p>
                                    <span className="text-xs px-2 py-1 rounded-full text-white font-semibold" style={{ backgroundColor: getColorByScore(shop.jiro_difficulty) }}>{getLevelByScore(shop.jiro_difficulty)}</span>
                                </div>
                                {shop.distance !== undefined && <p className="text-xs text-gray-500 mt-1">距離: {shop.distance.toFixed(1)}km</p>}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const MapController = ({ shops, onMarkerClick, selectedShop, position }: { shops: Shop[], onMarkerClick: (shop: Shop | null) => void, selectedShop: Shop | null, position: { lat: number, lng: number } | null }) => {
    return (
        <>
            {shops.map((shop) => {
                if (typeof shop.latitude !== "number" || typeof shop.longitude !== "number") return null;
                const score = shop.jiro_difficulty ?? -1;
                const glyph = score === -1 ? "?" : score.toString();
                return (
                    <AdvancedMarker key={shop.id} position={{ lat: shop.latitude, lng: shop.longitude }} title={`${shop.name} - 次郎度: ${getLevelByScore(score)}`} onClick={() => onMarkerClick(shop)} style={{ opacity: shop.isOpen ? 1 : 0.6 }}>
                        <Pin background={getColorByScore(score)} borderColor="#ffffff" glyphColor="#ffffff" glyph={glyph} />
                    </AdvancedMarker>
                );
            })}
            {selectedShop && <InfoWindow position={{ lat: selectedShop.latitude, lng: selectedShop.longitude }} onCloseClick={() => onMarkerClick(null)}><ShopCard shop={selectedShop} /></InfoWindow>}
            {position && <AdvancedMarker position={position} title="現在位置"><Pin background="#007bff" borderColor="#ffffff" glyphColor="#ffffff" /></AdvancedMarker>}
        </>
    );
};

// 地図のイベントを扱うためのコンポーネント
const MapEventsHandler = ({ onMapIdle }: { onMapIdle: (map: google.maps.Map) => void; }) => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;
        
        // 初回読み込み時に一度検索を実行
        onMapIdle(map);

        const idleListener = map.addListener('idle', () => onMapIdle(map));
        return () => google.maps.event.removeListener(idleListener);
    }, [map, onMapIdle]);

    return null;
};


// --- メインページコンポーネント ---
function MapPageInner() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [position, setPosition] = useState<{ lat: number, lng: number } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [sortType, setSortType] = useState<SortType>("distance");

    const handleSearch = useCallback(async (map: google.maps.Map) => {
        const center = map.getCenter();
        if (!center) return;
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
            const response = await fetch(`${baseUrl}/api/shops?keyword=${encodeURIComponent("ラーメン二郎")}&lat=${center.lat()}&lng=${center.lng()}`);
            if (!response.ok) throw new Error("店舗情報の取得に失敗しました");
            const data: Shop[] = await response.json();
            setShops(data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => {
                    setErrorMsg(`現在位置の取得に失敗: ${err.message}`);
                    setPosition({ lat: 35.681236, lng: 139.767125 }); // 東京駅
                }
            );
        } else {
            setErrorMsg("お使いのブラウザは位置情報機能に対応していません。");
            setPosition({ lat: 35.681236, lng: 139.767125 });
        }
    }, []);

    const processedAndSortedShops = useMemo(() => {
        if (!position) return [];
        const processed = shops.map((shop) => ({
            ...shop,
            distance: calculateDistance(position.lat, position.lng, shop.latitude, shop.longitude),
            isOpen: checkIsOpen(shop.openingHours),
            jiro_difficulty: shop.jiro_difficulty ?? -1,
        }));
        return [...processed].sort((a, b) => {
            switch (sortType) {
                case "distance": return (a.distance ?? 0) - (b.distance ?? 0);
                case "jiro_high": return (b.jiro_difficulty ?? -1) - (a.jiro_difficulty ?? -1);
                case "jiro_low": return (a.jiro_difficulty ?? -1) - (b.jiro_difficulty ?? -1);
                default: return 0;
            }
        });
    }, [shops, sortType, position]);

    if (!position) return <div className="p-4">現在位置を取得中...</div>;

    return (
        <div className="relative h-full w-full md:flex">
            <div className={`z-20 fixed top-16 h-[calc(100%-64px)] left-0 bg-white w-80 transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} md:static md:h-full md:top-0 md:translate-x-0`}>
                <ShopList shops={processedAndSortedShops} selectedShop={selectedShop} onShopSelect={setSelectedShop} onClose={() => setIsMenuOpen(false)} sortType={sortType} setSortType={setSortType} />
            </div>
            <main className="flex-grow h-full">
                {!isMenuOpen && <button onClick={() => setIsMenuOpen(true)} className="fixed top-20 left-4 z-50 bg-white p-2 rounded-md shadow-lg md:hidden"><HamburgerIcon /></button>}
                {errorMsg && <div className="absolute top-16 left-0 bg-red-500 text-white p-2 z-10">{errorMsg}</div>}
                <Map
                    defaultCenter={position}
                    defaultZoom={15}
                    gestureHandling="greedy"
                    disableDefaultUI={true}
                    mapId="go-jiro-map"
                >
                    <MapController shops={processedAndSortedShops} selectedShop={selectedShop} onMarkerClick={setSelectedShop} position={position} />
                    <MapEventsHandler onMapIdle={handleSearch} />
                </Map>
            </main>
        </div>
    );
}

export default function MapPage() {
    const apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;
    if (!apiKey) return <div className="p-4 text-red-500">APIキーが設定されていません。</div>;
    return (
        <APIProvider apiKey={apiKey}>
            <MapPageInner />
        </APIProvider>
    )
}