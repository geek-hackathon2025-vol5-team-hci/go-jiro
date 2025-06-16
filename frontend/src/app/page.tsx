"use client";

import { useState, useEffect } from "react";

interface UserProfile {
  displayName: string;
  emails: { value: string }[];
  photos: { value: string }[];
  isNewUser?: boolean; // 初回ログインフラグ (オプショナル)
}

export default function Home() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/profile")
      .then((response) => {
        if (!response.ok) throw new Error("Not authenticated");
        return response.json();
      })
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          // isNewUserフラグを受け取ってコンソールに出力
          if (data.user.isNewUser) {
            console.log('ようこそ！初回ログインです。');
          // ここでウェルカムモーダルを表示するなどの処理を実装できます
          }
        }
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const AuthArea = () => {
    if (isLoading) {
      return <p className="text-gray-700">読み込み中...</p>;
    }

    if (user) {
      return (
        <div className="text-center">
          <p className="text-xl font-bold text-black">ようこそ, {user.displayName} さん</p>
          <p className="text-sm text-gray-800 mt-1">Email: {user.emails[0].value}</p>
          <img
            src={user.photos[0].value}
            alt="プロフィール画像"
            className="w-16 h-16 rounded-full mx-auto mt-4 border-2 border-black"
          />
          <a href="/api/logout">
            <button className="mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75">
              ログアウト
            </button>
          </a>
        </div>
      );
    } else {
      return (
        <a href="/api/auth/google">
          <button className="px-6 py-2 bg-black text-yellow-400 font-semibold rounded-lg shadow-md hover:bg-yellow-500 hover:text-black focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-opacity-75">
            Googleでログイン
          </button>
        </a>
      );
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-yellow-100 p-8">
      <div className="w-full max-w-md mx-auto bg-white border-2 border-black rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-black mb-6">
          二郎系マップ連携サンプル
        </h1>

        <div id="auth-area" className="flex justify-center items-center mb-6">
          <AuthArea />
        </div>

        <hr className="my-6 border-black" />

        <div className="text-center">
          <a href="/map">
            <button className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg shadow-md hover:bg-black hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-75">
              地図ページへ移動
            </button>
          </a>
        </div>
      </div>
    </main>
  );
}
