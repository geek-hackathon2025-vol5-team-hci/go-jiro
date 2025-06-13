"use client"; // このファイルがクライアントサイドで動作することを宣言します

import { useState, useEffect } from "react";

// ユーザー情報の型
interface UserProfile {
  displayName: string;
  emails: { value: string }[];
  photos: { value: string }[];
}

export default function Home() {
  // 状態管理のためのStateを定義
  const [user, setUser] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState("...");
  const [isLoading, setIsLoading] = useState(true); // ログイン状態の確認中フラグ

  // ページが読み込まれた時に一度だけ実行される処理
  useEffect(() => {
    // ログイン状態を確認するAPIを叩く
    fetch("/api/profile")
      .then((response) => {
        if (!response.ok) {
          // 401 Unauthorizedなどの場合は未ログインと判断
          throw new Error("Not authenticated");
        }
        return response.json();
      })
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        // エラーが発生した場合（=未ログイン）はuserをnullのままにする
        setUser(null);
      })
      .finally(() => {
        // 確認処理が完了したらローディング状態を解除
        setIsLoading(false);
      });
  }, []); // 第2引数の空配列は「初回レンダリング時にのみ実行」を意味する

  // 公開メッセージを取得するボタンの処理
  const handleFetchMessage = () => {
    setMessage("取得中...");
    fetch("/api/message")
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
      })
      .catch((error) => {
        console.error("Error fetching public data:", error);
        setMessage("エラーが発生しました。");
      });
  };

  // 認証エリアのコンポーネントを定義
  const AuthArea = () => {
    if (isLoading) {
      return <p className="text-gray-500">読み込み中...</p>;
    }

    if (user) {
      // ログインしている場合の表示
      return (
        <div className="text-center">
          <p className="text-xl font-semibold">
            ようこそ, {user.displayName} さん
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Email: {user.emails[0].value}
          </p>
          <img
            src={user.photos[0].value}
            alt="プロフィール画像"
            className="w-16 h-16 rounded-full mx-auto mt-4 border-2 border-gray-300"
          />
          <a href="/api/logout">
            <button className="mt-4 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75">
              ログアウト
            </button>
          </a>
        </div>
      );
    } else {
      // 未ログインの場合の表示
      return (
        <a href="/api/auth/google">
          <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75">
            Googleでログイン
          </button>
        </a>
      );
    }
  };

  // ページ全体の見た目を返す
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Docker フロントエンド・バックエンド連携サンプル
        </h1>

        <div id="auth-area" className="flex justify-center items-center mb-6">
          <AuthArea />
        </div>

        <hr className="my-6" />

        <div className="text-center">
          <a href="/mappage">
            <button className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75">
              地図ページへ移動
            </button>
          </a>
        </div>
      </div>
    </main>
  );
}
