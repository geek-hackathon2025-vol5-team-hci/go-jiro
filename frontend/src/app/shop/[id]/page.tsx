// frontend/src/app/shop/[id]/page.tsx

// 'params' を受け取ることで、URLの動的な部分（[id]）を取得できます
export default function ShopDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">店舗詳細ページ</h1>
        <p className="text-lg">
          ここは、店舗ID: <span className="font-bold text-red-600">{params.id}</span> の情報を表示するページです。
        </p>
        <div className="mt-6">
          <a href="/map" className="text-blue-500 hover:underline">
            ← マップに戻る
          </a>
        </div>
      </div>
    </main>
  );
}