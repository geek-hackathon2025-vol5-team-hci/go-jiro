import ShopPageComponent from './ShopPageComponent';
import { Shop } from './types'; 


const mockShops: Shop[] = [
  {
    id: 1,
    name: "ラーメン二郎 新宿店",
    callticketOrder: "リョウ,カタサ",
    callOrder: "ヤサイ,アブラ,ニンニク",
    callRules: [
      { id: 1, shopId: 1, category: "リョウ", option: "普通", callText: "" ,optionOrder: 1},
      { id: 2, shopId: 1, category: "リョウ", option: "少なめ", callText: "スクナメ",optionOrder: 2 },
      { id: 3, shopId: 1, category: "リョウ", option: "半分", callText: "ハンブン" ,optionOrder: 3},
      { id: 4, shopId: 1, category: "カタサ", option: "普通", callText: "" ,optionOrder: 1},
      { id: 5, shopId: 1, category: "カタサ", option: "柔らかめ", callText: "ヤワラカメ" ,optionOrder: 2},
      { id: 6, shopId: 1, category: "カタサ", option: "固め", callText: "カタメ" ,optionOrder: 3},
      { id: 7, shopId: 1, category: "ヤサイ", option: "無し", callText: "ヤサイヌキ" ,optionOrder: 1},
      { id: 8, shopId: 1, category: "ヤサイ", option: "少なめ", callText: "ヤサイスクナメ" ,optionOrder: 2},
      { id: 9, shopId: 1, category: "ヤサイ", option: "普通", callText: "" ,optionOrder: 3},
      { id: 10, shopId: 1, category: "ヤサイ", option: "多め", callText: "ヤサイマシ" ,optionOrder: 4},
      { id: 11, shopId: 1, category: "ヤサイ", option: "非常に多め", callText: "ヤサイマシマシ",optionOrder: 5},
      { id: 12, shopId: 1, category: "アブラ", option: "無し", callText: "アブラヌキ" ,optionOrder: 1},
      { id: 13, shopId: 1, category: "アブラ", option: "少なめ", callText: "アブラスクナメ",optionOrder: 2},
      { id: 14, shopId: 1, category: "アブラ", option: "普通", callText: "" ,optionOrder: 3},
      { id: 15, shopId: 1, category: "アブラ", option: "多め", callText: "アブラマシ" ,optionOrder: 4},
      { id: 16, shopId: 1, category: "アブラ", option: "非常に多め", callText: "アブラマシマシ" ,optionOrder: 5},
      { id: 17, shopId: 1, category: "タレ", option: "少なめ", callText: "カラメスクナメ" ,optionOrder: 1},
      { id: 18, shopId: 1, category: "タレ", option: "普通", callText: "" ,optionOrder: 2},
      { id: 19, shopId: 1, category: "タレ", option: "多め", callText: "カラメマシ" ,optionOrder: 3},
      { id: 20, shopId: 1, category: "タレ", option: "非常に多め", callText: "カラメマシマシ",optionOrder: 4 },
      { id: 21, shopId: 1, category: "ニンニク", option: "無し", callText: "" ,optionOrder: 1},
      { id: 22, shopId: 1, category: "ニンニク", option: "少なめ", callText: "ニンニクスクナメ" ,optionOrder: 2},
      { id: 23, shopId: 1, category: "ニンニク", option: "普通", callText: "ニンニク" ,optionOrder: 3},
      { id: 24, shopId: 1, category: "ニンニク", option: "多め", callText: "ニンニクマシ" ,optionOrder: 4},
      { id: 25, shopId: 1, category: "ニンニク", option: "非常に多め", callText: "ニンニクマシマシ" ,optionOrder: 5},
    ],
  },
];

export default async function ShopPage(props: {params: Promise<{Shopid:string}>}) {
  const resolvedParams = await props.params;
  const shopId = resolvedParams.Shopid;

  // 本来は shopId を使ってデータベースなどから非同期に店舗情報を取得します。
  // 今回はモックデータを使用するため、常に最初の店舗データを取得します。
  const shop = mockShops[0];

  if (!shop) {
    return <div>店舗が見つかりません</div>;
  }

  // Client Componentに、取得したデータとパラメータを渡してレンダリング
  return <ShopPageComponent shop={shop} shopId={shopId} />;
}