import ShopPageComponent from './ShopPageComponent';
import { Shop } from './types'; 

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * 店舗データをAPIから非同期で取得するヘルパー関数
 * @param shopId 取得する店舗のID
 * @returns {Promise<Shop | null>} 店舗データ、または見つからない場合はnull
 */
async function getShopData(shopId: string): Promise<Shop | null> {
  try {
    // サーバーサイドで直接バックエンドAPIを叩く
    // Next.jsのfetchはデフォルトでキャッシュを利用するため、'no-store'で無効化
    const res = await fetch(`${apiBaseUrl}/api/shops/${shopId}`, { cache: 'no-store' });

    // レスポンスが正常でない場合のエラーハンドリング
    if (!res.ok) {
      if (res.status === 404) {
        return null; // 404の場合はnullを返す
      }
      throw new Error(`Failed to fetch shop data: ${res.statusText}`);
    }
    
    const shopData: Shop = await res.json();
    return shopData;

  } catch (error) {
    console.error('Error fetching shop data:', error);
    return null; // その他のエラー時もnullを返す
  }
}

export default async function ShopPage(props: {params: Promise<{Shopid:string}>}) {
  console.log('params:', props.params);
  const resolvedParams = await props.params;
  const shopId = resolvedParams.Shopid;

  // APIからデータを取得
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

  // Client Componentに、取得したデータとパラメータを渡してレンダリング
  return <ShopPageComponent shop={shop} shopId={shopId} />;
}