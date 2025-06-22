// frontend/src/app/components/Header.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../hooks/useAuth';
import { usePathname } from 'next/navigation';

export const Header = () => {
  const { user, isLoading } = useAuth();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const pathname = usePathname();

  // タイトル画面（ルートパス）ではヘッダーを非表示
  if (pathname === '/') {
    return null;
  }

  const renderAuthStatus = () => {
    if (isLoading) {
      return <div className="h-8 w-24 bg-gray-300 rounded animate-pulse"></div>;
    }

    if (user) {
      return (
        <div className="flex items-center gap-4">
          <Link href="/profile" className="flex items-center gap-2 group">
            <Image
              src={user.photos[0].value}
              alt="プロフィール画像"
              width={32}
              height={32}
              className="rounded-full border-2 border-gray-400 group-hover:border-yellow-400 transition-colors"
            />
            <span className="font-semibold text-white group-hover:text-yellow-400 transition-colors">{user.displayName}</span>
          </Link>
          <Link href={`${apiBaseUrl}/api/auth/logout`}>
            <button className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-red-700 transition-colors">
              ログアウト
            </button>
          </Link>
        </div>
      );
    }

    return (
      <Link href={`${apiBaseUrl}/api/auth/google`}>
        <button className="bg-yellow-400 text-black px-4 py-1.5 rounded font-bold hover:bg-yellow-300 transition-colors">
          Googleでログイン
        </button>
      </Link>
    );
  };

  return (
    <header className="bg-black shadow-md sticky top-0 z-50 h-16">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-yellow-400 hover:text-yellow-300 transition-colors">
          Go-jiro
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/map" className="text-white font-semibold hover:text-yellow-400 transition-colors">
            地図
          </Link>
          {/* 他のナビゲーションリンクを追加可能 */}
        </div>

        <div>
          {renderAuthStatus()}
        </div>
      </nav>
    </header>
  );
};