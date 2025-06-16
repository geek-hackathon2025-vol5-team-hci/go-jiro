// ファイルパス: app/profile/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ユーザープロフィールの型定義
interface UserProfile {
  displayName: string;
  emails: { value: string }[];
  photos: { value: string }[];
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // ユーザー情報を取得するAPIを叩く
    fetch("/api/auth/profile")
      .then((response) => {
        // 認証されていない場合はエラーを投げ、catchブロックで処理する
        if (!response.ok) {
          throw new Error("Not authenticated");
        }
        return response.json();
      })
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          // ユーザー情報がない場合もエラーとする
          throw new Error("User data not found");
        }
      })
      .catch(() => {
        // 認証エラーやその他のエラーが発生した場合、ホームページにリダイレクト
        console.log("認証されていないため、ホームページにリダイレクトします。");
        router.push("/");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  // ローディング中の表示
  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-yellow-100">
        <p className="text-gray-700 text-xl">読み込み中...</p>
      </main>
    );
  }

  // ユーザー情報が取得できた場合にページ本体を表示
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-yellow-100 p-8">
      <div className="w-full max-w-md mx-auto bg-white border-2 border-black rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-black mb-4">
          プロフィール
        </h1>
        {user && (
          <div className="text-center">
            <img
              src={user.photos[0].value}
              alt="プロフィール画像"
              className="w-24 h-24 rounded-full mx-auto my-4 border-4 border-black"
            />
            <h2 className="text-2xl font-bold text-black">{user.displayName}</h2>
            <p className="text-md text-gray-700 mt-1">{user.emails[0].value}</p>
            
            <hr className="my-6 border-black" />

            <div className="flex flex-col space-y-4">
              <Link href="/map">
                <button className="w-full px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg shadow-md hover:bg-black hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-75">
                  地図ページへ
                </button>
              </Link>
              <Link href="/">
                <button className="w-full px-6 py-2 bg-gray-200 text-black font-semibold rounded-lg shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75">
                  ホームへ戻る
                </button>
              </Link>
              <a href="/api/auth/logout">
                <button className="w-full mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75">
                  ログアウト
                </button>
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}