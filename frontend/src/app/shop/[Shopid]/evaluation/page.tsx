// app/shop/[Shopid]/evaluation/page.tsx
import { Shop } from '../types';
import EvaluationPageComponent from '../components/EvaluationPageComponent';

// 仮の店舗データ取得関数 (実際にはDBやAPIから取得)
async function getShopData(shopId: string): Promise<Shop | null> {
  // page.tsxのmockShopsを参考にしています
  const mockShops: Shop[] = [
    {
      id: '1',
      name: "ラーメン二郎 新宿店",
      callticketOrder: "リョウ,カタサ",
      callOrder: "ヤサイ,アブラ,ニンニク",
      callRules: [ /* ...ルール多数... */ ],
    },
  ];
  const shop = mockShops.find(s => s.id.toString() === shopId);
  return shop || null;
}


export default async function EvaluationPage(props: { params: { Shopid: string } }) {
  const shopId = props.params.Shopid;
  const shop = await getShopData(shopId);

  // 店舗が見つからない場合の表示
  if (!shop) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-yellow-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4 text-red-600">店舗が見つかりません</h1>
          <p className="text-gray-700">ID: {shopId}</p>
        </div>
      </div>
    );
  }

  return <EvaluationPageComponent shop={shop} />;
}