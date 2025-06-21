"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shop, EVALUATION_FACTORS, Ratings } from "../../shop/[Shopid]/types";

// このコンポーネントが受け取るPropsの型を定義
interface EvaluationFormProps {
  shop: Shop;
}

// 星評価コンポーネント
const StarRating = ({ rating, onRate }: { rating: number, onRate: (r: number) => void }) => {
  return (
    <div className="flex space-x-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} onClick={() => onRate(star)} className={`w-8 h-8 cursor-pointer ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.846 5.682a1 1 0 00.95.69h5.986c.969 0 1.371 1.24.588 1.81l-4.84 3.522a1 1 0 00-.364 1.118l1.846 5.681c.3.921-.755 1.688-1.54 1.118l-4.84-3.522a1 1 0 00-1.176 0l-4.84 3.522c-.784.57-1.838-.197-1.539-1.118l1.846-5.681a1 1 0 00-.364-1.118L2.05 11.11c-.783-.57-.38-1.81.588-1.81h5.986a1 1 0 00.95-.69L9.049 2.927z" />
        </svg>
      ))}
    </div>
  );
};


// フォームのUIとロジックを持つクライアントコンポーネント
export default function EvaluationForm({ shop }: EvaluationFormProps) {
  const router = useRouter();
  const shopId = shop.id; // propsからshopIdを安全に取得

  const initialRatings = Object.fromEntries(
    EVALUATION_FACTORS.map(factor => [factor.key, 0])
  ) as Ratings;

  const [ratings, setRatings] = useState<Ratings>(initialRatings);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRatingChange = (factor: keyof Ratings, value: number) => {
    setRatings(prev => ({ ...prev, [factor]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(ratings).some(r => r === 0)) {
      alert('すべての項目を評価（星を選択）してください。');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    const payload = {
      shopId: shopId,
      comment: comment,
      ...EVALUATION_FACTORS.reduce((acc, factor) => {
        acc[factor.dbColumn] = ratings[factor.key];
        return acc;
      }, {} as Record<string, number>),
    };
    
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/api/evaluations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '評価の送信に失敗しました。');
      }

      alert('評価を送信しました！');
      router.push(`/shop/${shopId}`);

    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg mt-10">
      <h1 className="text-2xl font-bold text-center text-gray-800">
        「{shop.name}」の評価
      </h1>
      <p className="text-center text-gray-600 mt-2">今回の来店体験はいかがでしたか？</p>
      
      <form onSubmit={handleSubmit} className="space-y-4 my-6">
        {EVALUATION_FACTORS.map(({ key, label }) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-700">{label}</span>
            <StarRating 
              rating={ratings[key]}
              onRate={(value) => handleRatingChange(key, value)}
            />
          </div>
        ))}
        
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="コメント（任意）"
          className="w-full h-32 p-3 border rounded-md mt-4 focus:ring-2 focus:ring-yellow-400 text-black"
        />

        {error && <p className="text-red-600 text-center my-2">{error}</p>}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-6 bg-yellow-500 text-black font-bold px-4 py-3 rounded-lg text-lg disabled:bg-gray-400"
        >
          {isSubmitting ? '送信中...' : '評価を送信する'}
        </button>
      </form>

       <div className="mt-8 text-center">
        <Link href={`/shop/${shopId}`}>
          <button className="font-sans bg-gray-200 text-black px-8 py-3 rounded-lg shadow-md hover:bg-gray-300">
            お店のページに戻る
          </button>
        </Link>
       </div>
    </div>
  );
}