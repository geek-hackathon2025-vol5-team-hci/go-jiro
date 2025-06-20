// components/EvaluationPageComponent.tsx
"use client";

import React from 'react';
import { Shop, EVALUATION_FACTORS, Ratings } from '../types'; 
import { useEvaluation } from '../hooks/useEvaluation';

const StarRating = ({ rating, onRate }: { rating: number, onRate: (r: number) => void }) => {
  return (
    <div className="flex space-x-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          onClick={() => onRate(star)}
          className={`w-8 h-8 cursor-pointer ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.846 5.682a1 1 0 00.95.69h5.986c.969 0 1.371 1.24.588 1.81l-4.84 3.522a1 1 0 00-.364 1.118l1.846 5.681c.3.921-.755 1.688-1.54 1.118l-4.84-3.522a1 1 0 00-1.176 0l-4.84 3.522c-.784.57-1.838-.197-1.539-1.118l1.846-5.681a1 1 0 00-.364-1.118L2.05 11.11c-.783-.57-.38-1.81.588-1.81h5.986a1 1 0 00.95-.69L9.049 2.927z" />
        </svg>
      ))}
    </div>
  );
};

export default function EvaluationPageComponent({ shop }: { shop: Shop }) {
  const { ratings, handleRatingChange, comment, setComment, isSubmitting, handleSubmit } = useEvaluation(shop);

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg mt-10">
      <h1 className="text-2xl font-bold text-center text-gray-800">
        「{shop.name}」の評価
      </h1>
      <p className="text-center text-gray-600 mt-2">今回の来店体験はいかがでしたか？</p>
      
      <div className="space-y-4 my-6">
        {EVALUATION_FACTORS.map(({ key, label }) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-700">{label}</span>
            <StarRating 
              rating={ratings[key]}
              onRate={(value) => handleRatingChange(key, value)}
            />
          </div>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="コメント（任意）"
        className="w-full h-32 p-3 border rounded-md mt-4 focus:ring-2 focus:ring-yellow-400"
      />

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full mt-6 bg-yellow-500 text-black font-bold px-4 py-3 rounded-lg text-lg disabled:bg-gray-400"
      >
        {isSubmitting ? '送信中...' : '評価を送信する'}
      </button>
    </div>
  );
}