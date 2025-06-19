//map/page.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';

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
  photo?: string; // 画像URL
};

//ポップアップウインドウの内容
const ShopCard = ({ shop }: { shop: Shop }) => {
  return (
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
      <Link href={`/shop/${shop.id}`}>
        <button className="
            mt-4 px-3 py-1 
            bg-blue-600 text-white text-sm 
            font-semibold rounded-md shadow-md hover:bg-blue-800
          "
        >
          詳細を見る
        </button>
      </Link>
    </div>
  );
}

//ハンバーガーボタンのアイコン
const HamburgerIcon = () => (
    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
);

//とじるボタンのアイコンコンポーネント
const CloseIcon = () => (
    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);


//ショップをリストで表示
const ShopList = ({ shops, selectedShop, onShopSelect, onClose }: { shops: Shop[], selectedShop: Shop | null, onShopSelect: (shop: Shop | null) => void, onClose: () => void }) => {
  return (
    <div className="w-80 h-full bg-white p-4 shadow-lg border-r">
      <div className = "flex justify-between items-center mb-4">
        <h2 className="text-2xl text-black font-bold">店舗リスト</h2>
        <button onClick={onClose} className="">
            <CloseIcon />
        </button>
      </div>
      <ul>
        {shops.map((shop) => (
          <li
            key={shop.id}
            className={`p-3 mb-2 border rounded-lg cursor-pointer transition-colors ${
              selectedShop?.id === shop.id ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-100'
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
}


//Mapをインスタンス化し、マーカーの挙動をきめる
const MapController = ({ shops, onMarkerClick, selectedShop, onMapLoad }: { shops: Shop[], onMarkerClick: (shop: Shop | null) 
                      => void, selectedShop: Shop | null, onMapLoad: (map: google.maps.Map) => void }) => {
  
  //<Map>の中だから実行できる
  const map = useMap(); //下のuseEffectが動作

  //地図をインスタンス化
  useEffect(() => {
    if (map) {
      onMapLoad(map); // setMapInstance(map)を実行、MapPageの検索が開始される
    }
  }, [map, onMapLoad]);

  return (
    <>
      {shops.map((shop) => (
        //マーカーコンポーネントを作成
        <AdvancedMarker
          key={shop.id}
          position={{ lat: shop.latitude, lng: shop.longitude }}
          title={shop.name}
          onClick={() => onMarkerClick(shop)}
        />
      ))}
      {/*選択された店舗がある場合*/}
            {selectedShop && (
        //ポップアップウインドウを表示
        <InfoWindow
          position={{
            lat: selectedShop.latitude,
            lng: selectedShop.longitude,
          }}
          //バツボタンが押された時
          onCloseClick={() => onMarkerClick(null)}
        >
          {/*カードを表示*/}
          <ShopCard shop={selectedShop} />
        </InfoWindow>
      )}
    </>
  );
};


export default function MapPage() {
  //Stateを定義
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null); //Mapインスタンスを格納するためのstate
  const [shops, setShops] = useState<Shop[]>([]); //Shopのステート
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null); //選択中のShop
  const [position, setPosition] = useState<{lat: number, lng: number} | null>(null); 
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); //メニューの開閉状態

  //検索する関数
  const handleSearch = useCallback(async (keyword: string) => {
    if (!mapInstance) return;
    const center = mapInstance.getCenter();
    if (!center) return;
    const lat = center.lat();
    const lng = center.lng();

    //APIから店舗情報を取得
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(
        `${baseUrl}/api/shops?keyword=${encodeURIComponent(keyword)}&lat=${lat}&lng=${lng}`
      );
      if (!response.ok) throw new Error("Failed to fetch shops");
      const data: Shop[] = await response.json(); // レスポンスをShop型の配列として受け取る

      //店舗の写真をプリロードする
      data.forEach((shop) => {
        // shopオブジェクトに写真のURLが含まれている場合
        if (shop.photo) {
          // メモリ上にImageオブジェクトを作成し、画像のURLをセットする。
          // これによりブラウザは画像のダウンロードを開始し、キャッシュに保存する。
          const img = new window.Image();
          img.src = shop.photo;
        }
      });

      setShops(data); //ステートに格納
      setSelectedShop(null);
    } catch (error) {
      console.error(error);
    }
  }, [mapInstance]);

  //地図が読まれたら検索を開始する
  useEffect(() => {
    if (mapInstance) {
      handleSearch("ラーメン二郎");
    }
  }, [mapInstance, handleSearch]);

  //ロード時に現在位置を取得
  useEffect(() => {
    // ブラウザがGeolocation APIに対応しているかチェック
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
    return <div className="flex items-center justify-center min-h-screen"><p className="text-red-500 font-bold">APIキーが設定されていません。</p></div>;
  }
  
  if (!position) {
    return <div className="flex items-center justify-center min-h-screen"><p>現在位置を取得中...</p></div>;
  }

  return (
    <div className = "relative h-screen w-screen md:flex">
      <APIProvider apiKey={apiKey}>
        {/*isMenuOpenの状態に応じてShopListを表示する*/}
        <div className={`
          h-full z-20 
          transition-transform duration-300 ease-in-out 
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          fixed top-0 left-0 bg-white w-80 md:static md:translate-x-0
        `}>
          {/*keyによってボタンを押すごとにcssのスタイルを再描画する。 */}
          <ShopList 
            key={isMenuOpen ? "open" : "closed"}
            shops={shops}
            selectedShop={selectedShop}
            onShopSelect={setSelectedShop}
            onClose={() => setIsMenuOpen(false)}
              />
        </div>
        
        <main className="flex-grow h-full">
          {/*ハンバーガーボタンを配置*/}
          <button 
            onClick={() => setIsMenuOpen(true)} 
            className="fixed top-4 left-4 z-50 bg-white p-2 rounded-md shadow-lg"
          >
            <HamburgerIcon />
          </button>

          {errorMsg && <div className="absolute top-0 left-0 bg-red-500 text-white p-2 z-10">{errorMsg}</div>}
          {/*地図の設定 ここがMapコンポーネントで、内側ではマップインスタンスの情報を利用できる */}
          <Map
            defaultCenter={position}
            defaultZoom={15}
            gestureHandling={"greedy"}
            disableDefaultUI={true}
            mapId="go-jiro-map"
          >
            {/*MapControllerにpropsを渡す */}
            <MapController
              shops={shops} //取得した店舗ステート
              selectedShop={selectedShop} //選択中の店舗ステート
              onMarkerClick={setSelectedShop} //マーカークリック時のリスナーに選択中の店舗ステートを登録
              onMapLoad={setMapInstance} //地図ロード時のリスナーにMapインスタンスステートを登録
            />
          </Map>
        </main>
      </APIProvider>
    </div>
  );
}