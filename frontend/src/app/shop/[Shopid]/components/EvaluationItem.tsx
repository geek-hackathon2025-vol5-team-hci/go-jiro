// frontend/src/app/shop/[Shopid]/components/EvaluationItem.tsx

import React from 'react';
import { ShopEvaluation } from '../types';

interface EvaluationItemProps {
  evaluation: ShopEvaluation;
}

// 評価項目に対応するラベル
const evaluationLabels = {
  orderHelp: {
    1: 'D: コール不要',
    2: 'C: 具体的な説明あり',
    3: 'B: 一般的な説明あり',
    4: 'A: 説明不十分',
    5: 'S: 独自ルール',
  },
  exitPressure: {
    1: 'D: 長居OK',
    2: 'C: 落ち着ける',
    3: 'B: 早めの空気',
    4: 'A: 明確な圧',
    5: 'S: 初心者恐怖',
  },
  estimatePortion: {
    1: '余裕', 2: '少し余裕', 3: 'ちょうどよい', 4: 'ぎり', 5: '限界'
  },
  actualPortion: {
    1: '余裕', 2: '少し余裕', 3: 'ちょうどよい', 4: 'ぎり', 5: '限界'
  }
};

export const EvaluationItem = ({ evaluation }: EvaluationItemProps) => {
  const jirodoColor = evaluation.jirodo > 75 ? 'text-red-600' : evaluation.jirodo > 50 ? 'text-orange-500' : 'text-green-600';

  return (
    <li className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-gray-800">
            {evaluation.user.displayName || '匿名ユーザー'}
            {evaluation.user.username && <span className="text-gray-500 font-normal ml-2">@{evaluation.user.username}</span>}
          </p>
          <p className="text-sm text-gray-500">{new Date(evaluation.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-600">二郎度</p>
          <p className={`text-3xl font-extrabold ${jirodoColor}`}>{evaluation.jirodo.toFixed(1)}</p>
        </div>
      </div>
      {evaluation.comment && (
        <p className="mt-4 bg-gray-50 p-3 rounded-md text-gray-800 whitespace-pre-wrap">{evaluation.comment}</p>
      )}
       <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
          <p><strong>想定した量:</strong> {evaluationLabels.estimatePortion[evaluation.estimatePortion as keyof typeof evaluationLabels.estimatePortion]}</p>
          <p><strong>実際の量:</strong> {evaluationLabels.actualPortion[evaluation.actualPortion as keyof typeof evaluationLabels.actualPortion]}</p>
          <p><strong>注文しやすさ:</strong> {evaluationLabels.orderHelp[evaluation.orderHelp as keyof typeof evaluationLabels.orderHelp]}</p>
          <p><strong>退店圧:</strong> {evaluationLabels.exitPressure[evaluation.exitPressure as keyof typeof evaluationLabels.exitPressure]}</p>
       </div>
    </li>
  );
};