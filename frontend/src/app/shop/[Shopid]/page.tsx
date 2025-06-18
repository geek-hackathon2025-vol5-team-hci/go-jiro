import ShopPageComponent from './ShopPageComponent';
import { Shop } from './types'; 


const mockShops: Shop[] = [
  {
    id: 1,
    name: "ラーメン二郎 新宿店",
    callticketOrder: "リョウ,カタサ",
    callOrder: "ヤサイ,アブラ,ニンニク",
    callRules: [
      { id: 1, shopId: 1, category: "リョウ", option: "普通", callText: "" },
      { id: 2, shopId: 1, category: "リョウ", option: "少なめ", callText: "スクナメ" },
      { id: 3, shopId: 1, category: "リョウ", option: "半分", callText: "ハンブン" },
      { id: 4, shopId: 1, category: "カタサ", option: "普通", callText: "" },
      { id: 5, shopId: 1, category: "カタサ", option: "柔らかめ", callText: "ヤワラカメ" },
      { id: 6, shopId: 1, category: "カタサ", option: "固め", callText: "カタメ" },
      { id: 7, shopId: 1, category: "ヤサイ", option: "無し", callText: "ヤサイヌキ" },
      { id: 8, shopId: 1, category: "ヤサイ", option: "少なめ", callText: "ヤサイスクナメ" },
      { id: 9, shopId: 1, category: "ヤサイ", option: "普通", callText: "" },
      { id: 10, shopId: 1, category: "ヤサイ", option: "多め", callText: "ヤサイマシ" },
      { id: 11, shopId: 1, category: "ヤサイ", option: "非常に多め", callText: "ヤサイマシマシ" },
      { id: 12, shopId: 1, category: "アブラ", option: "無し", callText: "アブラヌキ" },
      { id: 13, shopId: 1, category: "アブラ", option: "少なめ", callText: "アブラスクナメ" },
      { id: 14, shopId: 1, category: "アブラ", option: "普通", callText: "" },
      { id: 15, shopId: 1, category: "アブラ", option: "多め", callText: "アブラマシ" },
      { id: 16, shopId: 1, category: "アブラ", option: "非常に多め", callText: "アブラマシマシ" },
      { id: 17, shopId: 1, category: "タレ", option: "少なめ", callText: "カラメスクナメ" },
      { id: 18, shopId: 1, category: "タレ", option: "普通", callText: "" },
      { id: 19, shopId: 1, category: "タレ", option: "多め", callText: "カラメマシ" },
      { id: 20, shopId: 1, category: "タレ", option: "非常に多め", callText: "カラメマシマシ" },
      { id: 21, shopId: 1, category: "ニンニク", option: "無し", callText: "" },
      { id: 22, shopId: 1, category: "ニンニク", option: "少なめ", callText: "ニンニクスクナメ" },
      { id: 23, shopId: 1, category: "ニンニク", option: "普通", callText: "ニンニク" },
      { id: 24, shopId: 1, category: "ニンニク", option: "多め", callText: "ニンニクマシ" },
      { id: 25, shopId: 1, category: "ニンニク", option: "非常に多め", callText: "ニンニクマシマシ" },
    ],
  },
];

export default async function ShopPage(props: {params: Promise<{id:string}>}) {
  const resolvedParams = await props.params;
  const shopId = resolvedParams.id;

  // 本来は shopId を使ってデータベースなどから非同期に店舗情報を取得します。
  // 今回はモックデータを使用するため、常に最初の店舗データを取得します。
  const shop = mockShops[0];

  if (!shop) {
    return <div>店舗が見つかりません</div>;
  }

  // Client Componentに、取得したデータとパラメータを渡してレンダリング
  return <ShopPageComponent shop={shop} shopId={shopId} />;
}