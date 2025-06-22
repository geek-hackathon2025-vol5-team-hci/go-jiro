// frontend/src/app/shop/[Shopid]/components/EvaluationList.tsx

import React from 'react';
import { ShopEvaluation } from '../types';
import { EvaluationItem } from './EvaluationItem';

interface EvaluationListProps {
  evaluations: ShopEvaluation[];
  isLoading: boolean;
  error: string | null;
}

export const EvaluationList = ({ evaluations, isLoading, error }: EvaluationListProps) => {
  if (isLoading) {
    return <div className="text-center p-4">評価を読み込んでいます...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">エラー: {error}</div>;
  }

  if (evaluations.length === 0) {
    return <div className="text-center p-4 text-gray-600">まだ評価がありません。</div>;
  }

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold text-yellow-900 mb-4 border-b-2 border-yellow-400 pb-2">
        みんなの評価
      </h2>
      <ul className="space-y-4">
        {evaluations.map((evaluation) => (
          <EvaluationItem key={evaluation.id} evaluation={evaluation} />
        ))}
      </ul>
    </div>
  );
};