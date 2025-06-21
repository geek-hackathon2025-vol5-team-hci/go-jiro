"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// ユーザープロフィールの型定義
interface UserProfile {
  id: number;
  googleId: string;
  displayName: string;
  username: string | null;
  email: string;
  jiroCount: number | null;
  age: number | null;
  gender: string | null;
  favoriteCall: string | null;
  photos: { value: string }[];
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    let initialUser: UserProfile | null = null;

    // ステップ1: セッションから高速に基本情報を取得
    fetch(`${apiBaseUrl}/api/auth/profile`, { credentials: 'include' })
      .then(response => {
        if (!response.ok) throw new Error("Not authenticated (auth)");
        return response.json();
      })
      .then(authData => {
        if (!authData.user) throw new Error("User data not found in session");

        initialUser = {
          ...authData.user,
          email: authData.user.emails?.[0]?.value || authData.user.email,
        };

        // ステップ2: DBから最新の完全なプロフィールを取得
        return fetch(`${apiBaseUrl}/api/users/profile`, { credentials: 'include' });
      })
      .then(response => {
        if (!response.ok) throw new Error("Not authenticated (users)");
        return response.json();
      })
      .then(dbData => {
        if (!dbData.user) throw new Error("User data not found in database");

        // ステップ3: データを結合
        const combinedUser = {
          ...initialUser,
          ...dbData.user,
        };
        
        setUser(combinedUser);
      })
      .catch(err => {
        console.error("ユーザー情報の取得に失敗しました:", err.message);
        router.push("/");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  // フォーム入力のハンドラ
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!user) return;
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value === '' ? null : value,
    });
  };

  // フォームの送信ハンドラ
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          displayName: user.displayName,
          username: user.username,
          jiroCount: user.jiroCount ? Number(user.jiroCount) : null,
          favoriteCall: user.favoriteCall,
          age: user.age ? Number(user.age) : null,
          gender: user.gender,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'プロフィールの更新に失敗しました。');
      }

      const result = await response.json();
      setUser(prevUser => ({
        ...prevUser!,
        ...result.data,
      }));
      setMessage('プロフィールが正常に更新されました！');

    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-yellow-100">
        <p className="text-gray-700 text-xl">読み込み中...</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-yellow-100 p-8">
      <div className="w-full max-w-md mx-auto bg-white border-2 border-black rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-black mb-6">
          プロフィール編集
        </h1>
        {user && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center">
              <Image
                src={user.photos[0].value}
                alt="プロフィール画像"
                width={96}
                height={96}
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-black"
              />
              <p className="text-md text-gray-500">{user.email}</p>
            </div>

            <div>
              <label htmlFor="displayName" className="block text-sm font-bold text-gray-700">表示名</label>
              <input type="text" name="displayName" id="displayName" value={user.displayName || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
            </div>
            
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-gray-700">ユーザー名 (@...)</label>
              <input type="text" name="username" id="username" value={user.username || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
            </div>

            <div>
              <label htmlFor="jiroCount" className="block text-sm font-bold text-gray-700">二郎を食べた回数</label>
              <input type="number" name="jiroCount" id="jiroCount" value={user.jiroCount ?? ''} onChange={handleInputChange} min="0" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
            </div>

            <div>
              <label htmlFor="favoriteCall" className="block text-sm font-bold text-gray-700">好きなコール</label>
              <input type="text" name="favoriteCall" id="favoriteCall" value={user.favoriteCall || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-bold text-gray-700">年齢</label>
              <input type="number" name="age" id="age" value={user.age ?? ''} onChange={handleInputChange} min="0" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-bold text-gray-700">性別</label>
              <select name="gender" id="gender" value={user.gender || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500">
                <option value="">選択しない</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
                <option value="other">その他</option>
              </select>
            </div>

            <hr className="my-6 border-black" />

            {message && <div className="text-green-600 bg-green-100 p-3 rounded-md text-center">{message}</div>}
            {error && <div className="text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</div>}

            <div className="flex flex-col space-y-4">
              <button type="submit" className="w-full px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
                プロフィールを保存
              </button>
              <Link href="/map">
                <button type="button" className="w-full px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg shadow-md hover:bg-black hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-75">
                  地図ページへ
                </button>
              </Link>
              <Link href={`${apiBaseUrl}/api/auth/logout`}>
                <button type="button" className="w-full mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75">
                  ログアウト
                </button>
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}