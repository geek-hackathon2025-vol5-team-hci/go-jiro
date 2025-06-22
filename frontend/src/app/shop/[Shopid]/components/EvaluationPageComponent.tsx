// app/shop/[shopid]/components/EvaluationPageComponent.tsx

import { Shop } from '../types';

// このコンポーネントが受け取るProps(プロパティ)の型を定義します
interface EvaluationPageComponentProps {
  shop: Shop;
}

// `export default` をつけてコンポーネントを定義し、外部から使えるようにします
export default function EvaluationPageComponent({ shop }: EvaluationPageComponentProps) {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-yellow-100 p-8">
      <div className="w-full max-w-md mx-auto bg-white border-2 border-black rounded-xl shadow-lg p-8">
        
        <h1 className="text-3xl font-bold text-center text-black mb-2">
          {shop.name}
        </h1>
        <p className="text-center text-gray-600 mb-6">
          このお店を評価する
        </p>

        {/* ここから下に、評価フォームなどの具体的な内容を実装していきます */}
        <form className="space-y-4">
          <div>
            <label htmlFor="rating" className="block text-sm font-bold text-gray-700">評価 (1-5)</label>
            <input type="number" id="rating" name="rating" min="1" max="5" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-bold text-gray-700">コメント</label>
            <textarea id="comment" name="comment" rows={4} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"></textarea>
          </div>
          <button type="submit" className="w-full px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
            評価を送信
          </button>
        </form>

      </div>
    </main>
  );
}