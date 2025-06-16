"use client";
import React, { useState, useEffect } from "react";

type CallRule = {
  id: number;
  shopId: number;
  category: string;
  option: string;
  callText: string;
};

type Shop = {
  id: number;
  name: string;
  callticketOrder: string;
  callOrder: string;
  callRules: CallRule[];
};

const mockShops: Shop[] = [
  {
    id: 1,
    name: "ラーメン二郎 新宿店",
    callticketOrder: "リョウ,カタサ",
    callOrder: "ヤサイ,アブラ,ニンニク",
    callRules: [
      { id: 1, shopId: 1, category: "リョウ", option: "普通", callText: "" },
      { id: 2, shopId: 1, category: "リョウ", option: "少なめ", callText: "スクナメ" },
      { id: 3, shopId: 1, category: "リョウ", option: "半分", callText: "ハンブン" },
      { id: 4, shopId: 1, category: "カタサ", option: "普通", callText: "" },
      { id: 5, shopId: 1, category: "カタサ", option: "柔らかめ", callText: "ヤワラカメ" },
      { id: 6, shopId: 1, category: "カタサ", option: "固め", callText: "カタメ" },
      { id: 7, shopId: 1, category: "ヤサイ", option: "無し", callText: "ヤサイヌキ" },
      { id: 8, shopId: 1, category: "ヤサイ", option: "少なめ", callText: "ヤサイスクナメ" },
      { id: 9, shopId: 1, category: "ヤサイ", option: "普通", callText: "" },
      { id: 10, shopId: 1, category: "ヤサイ", option: "多め", callText: "ヤサイマシ" },
      { id: 11, shopId: 1, category: "ヤサイ", option: "非常に多め", callText: "ヤサイマシマシ" },
      { id: 12, shopId: 1, category: "アブラ", option: "無し", callText: "アブラヌキ" },
      { id: 13, shopId: 1, category: "アブラ", option: "少なめ", callText: "アブラスクナメ" },
      { id: 14, shopId: 1, category: "アブラ", option: "普通", callText: "" },
      { id: 15, shopId: 1, category: "アブラ", option: "多め", callText: "アブラマシ" },
      { id: 16, shopId: 1, category: "アブラ", option: "非常に多め", callText: "アブラマシマシ" },
      { id: 17, shopId: 1, category: "タレ", option: "少なめ", callText: "カラメスクナメ" },
      { id: 18, shopId: 1, category: "タレ", option: "普通", callText: "" },
      { id: 19, shopId: 1, category: "タレ", option: "多め", callText: "カラメマシ" },
      { id: 20, shopId: 1, category: "タレ", option: "非常に多め", callText: "カラメマシマシ" },
      { id: 21, shopId: 1, category: "ニンニク", option: "無し", callText: "" },
      { id: 22, shopId: 1, category: "ニンニク", option: "少なめ", callText: "ニンニクスクナメ" },
      { id: 23, shopId: 1, category: "ニンニク", option: "普通", callText: "ニンニク" },
      { id: 24, shopId: 1, category: "ニンニク", option: "多め", callText: "ニンニクマシ" },
      { id: 25, shopId: 1, category: "ニンニク", option: "非常に多め", callText: "ニンニクマシマシ" },
    ],
  },
];

export default function ShopPage() {
  const shop = mockShops[0];

  const callticketOrderArr = shop.callticketOrder.split(",").map((v) => v.trim());
  const callOrderArr = shop.callOrder.split(",").map((v) => v.trim());
  const allCategories = [...callticketOrderArr, ...callOrderArr];

  // 編集モード切替
  const [isEditMode, setIsEditMode] = useState(false);

  // callRulesのcallTextを編集用に管理
  const [editableRules, setEditableRules] = useState<CallRule[]>(shop.callRules);

  // 選択用のstateは編集モードでは非表示なので閲覧モード用に作成
  const initialSelections = allCategories.reduce<Record<string, string>>((acc, category) => {
    const rules = editableRules.filter((r) => r.category === category);
    acc[category] = rules.length > 0 ? rules[0].option : "";
    return acc;
  }, {});

  const [selections, setSelections] = useState<Record<string, string>>(initialSelections);
  const [ticketText, setTicketText] = useState("");
  const [toppingText, setToppingText] = useState("");

  useEffect(() => {
    // 選択変更時に券売機コール文言と無料トッピング文言を更新
    const ticketParts = callticketOrderArr.map((category) => {
      const option = selections[category];
      const rule = editableRules.find((r) => r.category === category && r.option === option);
      return rule?.callText || "";
    });
    const toppingParts = callOrderArr.map((category) => {
      const option = selections[category];
      const rule = editableRules.find((r) => r.category === category && r.option === option);
      return rule?.callText || "";
    });
    setTicketText(ticketParts.filter((text) => text !== "").join(" "));
    setToppingText(toppingParts.filter((text) => text !== "").join(" "));
  }, [selections, editableRules]);

  const onChange = (category: string, option: string) => {
    setSelections((prev) => ({ ...prev, [category]: option }));
  };

  // callText編集用ハンドラ
  const onCallTextChange = (id: number, newText: string) => {
    setEditableRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, callText: newText } : r))
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-yellow-100 rounded-2xl shadow-lg relative">
      {/* 右上編集切替ボタン */}
      <button
        onClick={() => setIsEditMode((prev) => !prev)}
        className="absolute top-4 right-4 bg-yellow-300 px-3 py-1 rounded-md hover:bg-yellow-400"
      >
        {isEditMode ? "編集を閉じる" : "編集"}
      </button>

      <h1 className="text-2xl font-bold mb-6 text-center text-yellow-900">
        {shop.name} のトッピング選択
      </h1>

      {!isEditMode ? (
        // 閲覧モード：ラジオ選択UI
        <>
          {[...callticketOrderArr, ...callOrderArr].map((category) => {
            const options = editableRules.filter((r) => r.category === category);
            return (
              <div
                key={category}
                className="mb-4 p-4 bg-white rounded-xl shadow-md border border-yellow-300"
              >
                <strong className="block text-lg font-semibold mb-2 text-yellow-800">
                  {category}
                </strong>
                <div className="flex flex-wrap gap-4">
                  {options.map(({ id, option }) => (
                    <label
                      key={id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={category}
                        value={option}
                        checked={selections[category] === option}
                        onChange={() => onChange(category, option)}
                        className="accent-yellow-500"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2 text-yellow-800">
              現在の券売機コール文言
            </h2>
            <p className="p-3 bg-white rounded-md shadow-inner border border-yellow-200">
              {ticketText || "コールの必要なし"}
            </p>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2 text-yellow-800">
              現在の無料トッピングコール文言
            </h2>
            <p className="p-3 bg-white rounded-md shadow-inner border border-yellow-200">
              {toppingText || "そのまま"}
            </p>
          </div>
        </>
      ) : (
        // 編集モード：callTextを編集するテキスト入力フォームを表示
        <div>
           <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2 text-yellow-800">
              現在の無料トッピングコール文言
            </h2>
            <p className="p-3 bg-white rounded-md shadow-inner border border-yellow-200">
              {toppingText || "そのまま"}
            </p>
          </div>
          
        </div>
      )}
    </div>
  );
}
