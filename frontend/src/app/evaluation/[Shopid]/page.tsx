import { Shop } from "../../shop/[shopid]/types";
import EvaluationForm from "./EvaluationForm"; // クライアントコンポーネント

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// サーバーサイドで店舗データを取得する関数
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
  params: Promise<{ shopid: string }>;
}) {
  const { shopid } = await params; // ← Promise を await で展開

  const shop = await getShopData(shopid);

  if (!shop) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4 text-red-600">店舗が見つかりません</h1>
          <p className="text-gray-700">ID: {shopid}</p>
        </div>
      </div>
    );
  }

  return <EvaluationForm shop={shop} />;
}
