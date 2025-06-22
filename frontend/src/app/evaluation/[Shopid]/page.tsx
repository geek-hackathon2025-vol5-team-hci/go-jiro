import { Shop } from "../../shop/[Shopid]/types";
import EvaluationForm from "./EvaluationForm"; // 画面表示を担当するコンポーネント

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * 店舗データをAPIから非同期で取得するヘルパー関数
 */
async function getShopData(shopId: string): Promise<Shop | null> {
  try {
    const res = await fetch(`${apiBaseUrl}/api/shops/${shopId}`, { cache: 'no-store' });
    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching shop data:', error);
    return null;
  }
}

// ページ本体（サーバーコンポーネント）
export default async function EvaluationPage({
params,
}: {
  params: Promise<{ Shopid: string }>;
}) {
  const { Shopid } = await params; // ← Promise を await で展開

  // APIからデータを取得
  const shop = await getShopData(Shopid);

  // 店舗が見つからない場合の表示
  if (!shop) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4 text-red-600">店舗が見つかりません</h1>
          <p className="text-gray-700">ID: {Shopid}</p>
        </div>
      </div>
    );
  }

  // Client Componentに、取得したデータを渡してレンダリング
  return <EvaluationForm shop={shop} />;
}
