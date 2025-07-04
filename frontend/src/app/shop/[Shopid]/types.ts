export type CallRule = {
  id: number;
  shopId: string; 
  category: string;
  option: string;
  callText: string;
  optionOrder?: number;
};

export type Shop = {
  id: string;
  name: string;
  callticketOrder: string;
  callOrder: string;
  callRules: CallRule[];
};

// --- ↓↓↓ 評価項目の設定をここに集約 ↓↓↓ ---
export const EVALUATION_FACTORS = [
  { key: 'taste',  label: '味',           dbColumn: 'rating_taste' },
  { key: 'volume', label: '量',           dbColumn: 'rating_volume' },
  { key: 'hurdle', label: '敷居の高さ', dbColumn: 'rating_hurdle' },
] as const; // `as const` で型を固定し、安全性を高める

// 設定からキーの型を動的に生成 (例: 'taste' | 'volume' | 'hurdle')
type RatingFactorKey = typeof EVALUATION_FACTORS[number]['key'];

// 評価点のStateが持つべき型を動的に生成 (例: { taste: number; volume: number; ... })
export type Ratings = Record<RatingFactorKey, number>;
// --- ↑↑↑ ---


// 評価データを格納するための型 (変更なし)
export type Evaluation = {
  id: number;
  shopId: number;
  userId: number;
  rating_taste: number;
  rating_volume: number;
  rating_hurdle: number;
  comment?: string;
};

export type ShopEvaluation = {
  id: number;
  jirodo: number;
  comment: string | null;
  createdAt: string; // ISO 8601 形式の文字列
  user: {
    id: number;
    displayName: string | null;
    username: string | null;
  };
  // 必要に応じて他の評価項目も追加
  estimatePortion: number;
  actualPortion: number;
  orderHelp: number;
  exitPressure: number;
};