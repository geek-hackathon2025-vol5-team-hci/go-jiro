// frontend/src/app/hooks/useAuth.ts
"use client";

import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// UserProfileの型定義
interface UserProfile {
  displayName: string;
  emails: { value: string }[];
  photos: { value: string }[];
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // const router = useRouter();

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/auth/profile`, { credentials: 'include' })
      .then((response) => {
        if (!response.ok) {
          // 認証されていない場合はエラーとし、catchで処理
          throw new Error("Not authenticated");
        }
        return response.json();
      })
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        // エラー時は未ログイン状態とする
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { user, isLoading };
};