'use client'; // このファイルがクライアントサイドで動作することを宣言します

import { useState, useEffect } from 'react';

// ユーザー情報の型
interface UserProfile {
  displayName: string;
  emails: { value: string }[];
  photos: { value: string }[];
}

export default function Home() {
  // 状態管理のためのStateを定義
  const [user, setUser] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState('...');
  const [isLoading, setIsLoading] = useState(true); // ログイン状態の確認中フラグ

  // ページが読み込まれた時に一度だけ実行される処理
  useEffect(() => {
    // ログイン状態を確認するAPIを叩く
    fetch('/api/profile')
      .then(response => {
        if (!response.ok) {
          // 401 Unauthorizedなどの場合は未ログインと判断
          throw new Error('Not authenticated');
        }
        return response.json();
      })
      .then(data => {
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
    setMessage('取得中...');
    fetch('/api/message')
      .then(response => response.json())
      .then(data => {
        setMessage(data.message);
      })
      .catch(error => {
        console.error('Error fetching public data:', error);
        setMessage('エラーが発生しました。');
      });
  };

  // 認証エリアのコンポーネントを定義
  const AuthArea = () => {
    if (isLoading) {
      return <p>読み込み中...</p>;
    }

    if (user) {
      // ログインしている場合の表示
      return (
        <div>
          <p>ようこそ, {user.displayName} さん</p>
          <p>Email: {user.emails[0].value}</p>
          <img src={user.photos[0].value} alt="プロフィール画像" width="50" />
          <br />
          <a href="/api/logout"><button>ログアウト</button></a>
        </div>
      );
    } else {
      // 未ログインの場合の表示
      return (
        <a href="/api/auth/google"><button>Googleでログイン</button></a>
      );
    }
  };

  // ページ全体の見た目を返す
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Docker フロントエンド・バックエンド連携サンプル</h1>
      
      <div id="auth-area">
        <AuthArea />
      </div>

      <hr />

      <button onClick={handleFetchMessage}>公開メッセージ取得</button>
      <p>APIからのメッセージ: <strong>{message}</strong></p>
    </main>
  );
}