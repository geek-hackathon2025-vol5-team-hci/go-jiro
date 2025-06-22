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
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="max-w-md w-full mx-auto p-6 bg-yellow-300 rounded-2xl shadow-lg text-center">
        <h1 className="text-4xl font-extrabold text-black mb-2">来店中</h1>
        <p className="text-lg font-medium text-black mb-6">
          <span className="font-bold">{shopName || "お店"}</span> でのコール
        </p>

        <div className="text-left space-y-6">
          {/* 券売機コール */}
          <div>
            <div className="bg-red-600 text-white text-lg font-bold px-4 py-2 rounded-t-lg">
              券売機コール
            </div>
            <div className="bg-white text-black text-lg px-4 py-4 rounded-b-lg">
              {ticketText || "コールの必要なし"}
            </div>
          </div>

          {/* 無料トッピングコール */}
          <div>
            <div className="bg-red-600 text-white text-lg font-bold px-4 py-2 rounded-t-lg">
              無料トッピングコール
            </div>
            <div className="bg-white text-black text-lg px-4 py-4 rounded-b-lg">
              {toppingText || "そのまま"}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center space-x-4">
        <Link href="/map">
          <button className="bg-white text-black text-xl font-bold px-6 py-2 rounded-lg shadow-md hover:bg-gray-300 transition-colors">
            地図に戻る
          </button>
        </Link>
        {shopId && (
          <Link href={`/evaluation/${shopId}`}>
            <button className="bg-black text-yellow-300 text-xl font-bold px-6 py-2 rounded-lg shadow-md hover:bg-yellow-500 transition-colors">
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
