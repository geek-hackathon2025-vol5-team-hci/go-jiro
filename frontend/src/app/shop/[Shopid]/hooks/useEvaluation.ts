// hooks/useEvaluation.ts
"use client";

import { useState } from 'react';
import { Shop, Ratings, EVALUATION_FACTORS } from '../types';
import { useRouter } from 'next/navigation';

export const useEvaluation = (shop: Shop) => {
  const initialRatings = Object.fromEntries(
    EVALUATION_FACTORS.map(factor => [factor.key, 0])
  ) as Ratings;

  const [ratings, setRatings] = useState<Ratings>(initialRatings);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleRatingChange = (factor: keyof Ratings, value: number) => {
    setRatings(prev => ({ ...prev, [factor]: value }));
  };

  const handleSubmit = async () => {
    if (Object.values(ratings).some(r => r === 0)) {
      alert('すべての項目を評価（星を選択）してください。');
      return;
    }
    
    setIsSubmitting(true);

    const payload: { [key: string]: any } = {
      shopId: shop.id,
      comment,
    };

    EVALUATION_FACTORS.forEach(factor => {
      payload[factor.dbColumn] = ratings[factor.key];
    });
    
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/api/evaluations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('評価の送信に失敗しました。');

      alert('評価を送信しました。ありがとうございます！');
      router.push(`/shop/${shop.id}`);

    } catch (error) {
      console.error(error);
      alert('エラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    ratings,
    handleRatingChange,
    comment,
    setComment,
    isSubmitting,
    handleSubmit,
  };
};