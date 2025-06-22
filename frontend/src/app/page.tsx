"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface UserProfile {
  displayName: string;
  emails: { value: string }[];
  photos: { value: string }[];
  isNewUser?: boolean;
}

export default function Home() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  //APIのベースURLを.env.localから取得
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/auth/profile`, { credentials: 'include' })
      .then((response) => {
        if (!response.ok) throw new Error("Not authenticated");
        return response.json();
      })
      .then((data) => {
        console.log('[DEBUG] Frontend: Received data from /api/auth/profile:', data);

        if (data.user) {
          setUser(data.user);

          if (data.user.isNewUser) {
            console.log('ようこそ！初回ログインです。プロフィールページにリダイレクトします。');
            router.push('/profile');
          } else {
            console.log('ログイン済みです。マップページにリダイレクトします。');
            router.push('/map');
          }
        }
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router, apiBaseUrl]);

  const LoginButton = () => {
    if (isLoading) {
      return (
        <div className="animate-pulse">
          <div className="px-8 py-4 bg-gray-300 rounded-lg h-12 w-48"></div>
        </div>
      );
    }

    if (!user) {
      return (
        <Link href={`${apiBaseUrl}/api/auth/google`}>
          <button className="px-8 py-4 bg-black text-yellow-400 font-bold text-lg rounded-lg shadow-lg hover:bg-yellow-500 hover:text-black transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-yellow-600 focus:ring-opacity-75">
            Googleでログイン
          </button>
        </Link>
      );
    }

    return null; // ログイン済みの場合は何も表示しない（リダイレクトされるため）
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 to-yellow-200 p-8 overflow-hidden">
      {/* 背景画像 */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/jiros/titleJiro.png"
          alt="背景画像"
          fill
          className="object-cover opacity-30"
          priority
        />
      </div>
      
      {/* コンテンツ */}
      <div className="relative z-10 text-center">
        {/* メインタイトル */}
        <h1 className="text-8xl md:text-9xl font-black text-black mb-4 tracking-wider drop-shadow-lg">
          Go Jiro
        </h1>
        
        {/* サブタイトル */}
        <p className="text-xl md:text-2xl text-gray-700 mb-12 font-medium">
          二郎系ラーメンマップ
        </p>

        {/* ログインボタン */}
        <div className="flex justify-center">
          <LoginButton />
        </div>
      </div>
    </main>
  );
}