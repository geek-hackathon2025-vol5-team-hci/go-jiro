// app/shop/[shopid]/evaluation/page.tsx

import { Shop } from '../types';
import EvaluationPageComponent from '../components/EvaluationPageComponent';

// 仮の店舗データ取得関数 (変更なし)
async function getShopData(shopId: string): Promise<Shop | null> {
  // この部分は実際のデータベースなどからの取得処理に置き換えてください
  const mockShops: Shop[] = [
    {
      id: '1',
      name: "ラーメン二郎 新宿店",
      callticketOrder: "リョウ,カタサ",
      callOrder: "ヤサイ,アブラ,ニンニク",
      callRules: [],
    },
    // 他の店舗データ...
  ];
  const shop = mockShops.find(s => s.id.toString() === shopId);
  return shop || null;
}

export default async function EvaluationPage({
  params,
}: {
  params: Promise<{ shopid: string }>; // ★ Promise型に戻します
}) {
  const { shopid } = await params; // ★ await を再度追加します
  const shop = await getShopData(shopid);

  if (!shop) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-yellow-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4 text-red-600">店舗が見つかりません</h1>
          <p className="text-gray-700">ID: {shopid}</p>
        </div>
      </div>
    );
  }

  return <EvaluationPageComponent shop={shop} />;
}