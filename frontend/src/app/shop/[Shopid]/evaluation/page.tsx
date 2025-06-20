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

  if (!shop) {
    return <div>店舗が見つかりません</div>;
  }

  return <EvaluationPageComponent shop={shop} />;
}