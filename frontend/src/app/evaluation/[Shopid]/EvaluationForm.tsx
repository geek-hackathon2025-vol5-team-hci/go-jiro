"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shop } from "../../shop/[Shopid]/types";




interface EvaluationFormProps {
  shop: Shop;
}

export default function JirodoForm({ shop }: EvaluationFormProps) {
  const router = useRouter();
  const shopId = shop.id;

  const [estimatePortion, setEstimatePortion] = useState(0);
  const [actualPortion, setActualPortion] = useState(0);
  const [orderHelp, setOrderHelp] = useState(0);
  const [exitPressure, setExitPressure] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    if (
      estimatePortion === 0 ||
      actualPortion === 0 ||
      orderHelp === 0 ||
      exitPressure === 0
    ) {
      alert("すべての項目を記入してください。");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      shopId,
      estimatePortion,
      actualPortion,
      orderHelp,
      exitPressure,
      comment,
    };
    console.log("📦 payload:", payload);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      console.log("🔗 POST先URL:", `${apiBaseUrl}/api/evaluations`);
      const response = await fetch(`${apiBaseUrl}/api/evaluations`, {
        // Note: endpoint might be /api/evaluations
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "送信に失敗しました。");
      }

      alert("二郎度を送信しました！");
      router.push(`/shop/${shopId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "不明なエラーが発生しました"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const portionLabels = ["余裕", "少し余裕", "ちょうどよい", "ぎり", "限界"];

  return (
    <div className="max-w-2xl mx-auto p-8 bg-yellow-50 border-4 border-yellow-500 rounded-2xl shadow-xl mt-10">
      <h1 className="text-3xl font-bold text-center text-red-700">
        「{shop.name}」の二郎度評価
      </h1>
      <p className="text-center text-gray-800 mt-2 font-semibold">
        初心者としての体験を教えてください
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        <div>
          <label className="font-bold text-lg text-red-800">
            Q1. 注文時に想定していた量
          </label>
          <div className="flex gap-4 mt-2">
            {[1, 2, 3, 4, 5].map((val, idx) => (
              <label key={val} className="flex items-center gap-1">
                <input
                  type="radio"
                  name="estimate"
                  value={val}
                  onChange={() => setEstimatePortion(val)}
                />
                <span className="text-sm">{portionLabels[idx]}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="font-bold text-lg text-red-800">Q2. 実際の量</label>
          <div className="flex gap-4 mt-2">
            {[1, 2, 3, 4, 5].map((val, idx) => (
              <label key={val} className="flex items-center gap-1">
                <input
                  type="radio"
                  name="actual"
                  value={val}
                  onChange={() => setActualPortion(val)}
                />
                <span className="text-sm">{portionLabels[idx]}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="font-bold text-lg text-red-800">
            Q3. 注文しやすかったか
          </label>
          <select
            value={orderHelp}
            onChange={(e) => setOrderHelp(Number(e.target.value))}
            className="w-full mt-2 p-2 border rounded"
          >
            <option value={0}>選択してください</option>
            <option value={5}>S: なんの説明もなく独自のルールがあった</option>
            <option value={4}>A: 説明が不十分で不安があった</option>
            <option value={3}>
              B: 一般的なコールがあり、その説明がされていた
            </option>
            <option value={2}>
              C: 店内掲示に具体的なコール内容が記載されていた
            </option>
            <option value={1}>D: コールそのものが不要だった</option>
          </select>
        </div>

        <div>
          <label className="font-bold text-lg text-red-800">Q4. 退店圧</label>
          <select
            value={exitPressure}
            onChange={(e) => setExitPressure(Number(e.target.value))}
            className="w-full mt-2 p-2 border rounded"
          >
            <option value={0}>選択してください</option>
            <option value={5}>
              S: 店主の気配で早食いになる、初心者が怯える
            </option>
            <option value={4}>A: 回転圧を明確に感じるがギリ礼儀的</option>
            <option value={3}>B: 早めに出なきゃな、程度の空気感</option>
            <option value={2}>C: 特に何も言われず、落ち着いて食える</option>
            <option value={1}>D: 長居しても何も言われない（異例）</option>
          </select>
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="コメント（任意）"
          className="w-full h-24 p-3 border rounded-md focus:ring-2 focus:ring-yellow-500 text-black"
        />

        {error && <p className="text-red-600 text-center my-2">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-red-600 text-white font-bold px-4 py-3 rounded-lg text-lg disabled:bg-gray-400"
        >
          {isSubmitting ? "送信中..." : "二郎度を送信する"}
        </button>
      </form>

      <div className="mt-8 text-center">
        <Link href={`/shop/${shopId}`}>
          <button className="bg-yellow-200 text-black px-8 py-3 rounded-lg shadow-md hover:bg-yellow-300">
            お店のページに戻る
          </button>
        </Link>
      </div>
    </div>
  );
}
