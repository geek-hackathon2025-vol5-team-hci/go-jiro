'use client'; // ブラウザで動作するコンポーネントであることを示す

import { useState, useEffect } from 'react';

export default function Home() {
  const [message, setMessage] = useState('...');

  useEffect(() => {
    fetch('/api/message')
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setMessage('エラーが発生しました。');
      });
  }, []);

  return (
    <main>
      <h1>Next.js 分離構成サンプル</h1>
      <p>APIからのメッセージ: <strong>{message}</strong></p>
    </main>
  );
}