// visiting/page.tsx
"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';

function VisitingPageInner() {
  const searchParams = useSearchParams();
  const shopId = searchParams.get('shopId');
  const shopName = searchParams.get('shopName');
  const ticketText = searchParams.get('ticketText');
  const toppingText = searchParams.get('toppingText');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl w-full mx-auto p-8 bg-green-100 rounded-2xl shadow-lg text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-green-900 mb-4">来店中</h1>
        <p className="text-xl sm:text-2xl text-green-800">
          <span className="font-bold">{shopName || "お店"}</span> でのコール
        </p>

        <div className="mt-8 text-left space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-yellow-800 bg-yellow-200 px-3 py-1 rounded-t-lg">券売機コール</h2>
            <div className="bg-white rounded-b-lg shadow-inner border border-yellow-200">
              <p className="p-4 text-black text-lg">{ticketText || "コールの必要なし"}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2 text-blue-800 bg-blue-200 px-3 py-1 rounded-t-lg">無料トッピングコール</h2>
            <div className="bg-white rounded-b-lg shadow-inner border border-blue-200">
              <p className="p-4 text-black text-lg">{toppingText || "そのまま"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center space-x-4">
        <Link href="/map">
          <button className="font-sans bg-white text-black text-xl px-8 py-3 rounded-lg shadow-md hover:bg-gray-300 transition-colors">
            地図に戻る
          </button>
        </Link>
        {shopId && (
          <Link href={`/evaluation/${shopId}`}>
            <button className="font-sans bg-yellow-400 text-black text-xl px-8 py-3 rounded-lg shadow-md hover:bg-yellow-500 transition-colors">
              このお店を評価する
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default function VisitingPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <VisitingPageInner />
    </Suspense>
  );
}
