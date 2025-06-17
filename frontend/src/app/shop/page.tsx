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
  const allCategories = [...new Set([...callticketOrderArr, ...callOrderArr])];

  const [isEditMode, setIsEditMode] = useState(false);
  const [savedRules, setSavedRules] = useState<CallRule[]>(shop.callRules);
  const [editableRules, setEditableRules] = useState<CallRule[]>(shop.callRules);
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    return allCategories.reduce((acc, category) => {
      const rule = savedRules.find((r) => r.category === category);
      acc[category] = rule?.option || "";
      return acc;
    }, {} as Record<string, string>);
  });
  const [ticketText, setTicketText] = useState("");
  const [toppingText, setToppingText] = useState("");

  // 新カテゴリー追加フォーム
  const [newCategory, setNewCategory] = useState("");
  const [newOption, setNewOption] = useState("");
  const [newCallText, setNewCallText] = useState("");

  useEffect(() => {
    const ticketParts = callticketOrderArr.map((category) => {
      const option = selections[category];
      const rule = savedRules.find((r) => r.category === category && r.option === option);
      return rule?.callText || "";
    });
    const toppingParts = callOrderArr.map((category) => {
      const option = selections[category];
      const rule = savedRules.find((r) => r.category === category && r.option === option);
      return rule?.callText || "";
    });
    setTicketText(ticketParts.filter(Boolean).join(" "));
    setToppingText(toppingParts.filter(Boolean).join(" "));
  }, [selections, savedRules]);

  const onChange = (category: string, option: string) => {
    setSelections((prev) => ({ ...prev, [category]: option }));
  };

  const onCallTextChange = (id: number, newText: string) => {
    setEditableRules((prev) => prev.map((r) => (r.id === id ? { ...r, callText: newText } : r)));
  };

  const handleAddCategory = () => {
    if (!newCategory || !newOption) return;
    const newId = Math.max(...editableRules.map((r) => r.id)) + 1;
    const newRule: CallRule = {
      id: newId,
      shopId: shop.id,
      category: newCategory,
      option: newOption,
      callText: newCallText,
    };
    setEditableRules((prev) => [...prev, newRule]);
    setNewCategory("");
    setNewOption("");
    setNewCallText("");
  };

  const handleAddOption = (category: string) => {
    const option = prompt("新しいオプション名は？");
    if (!option) return;
    const callText = prompt("コール文言は？") || "";
    const newId = Math.max(...editableRules.map((r) => r.id)) + 1;
    setEditableRules((prev) => [
      ...prev,
      { id: newId, shopId: shop.id, category, option, callText },
    ]);
  };

  const handleDeleteOption = (id: number) => {
    setEditableRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSave = () => {
    setSavedRules(editableRules);
    setIsEditMode(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-yellow-100 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-yellow-900">{shop.name} のトッピング選択</h1>
        <button
          onClick={() => {
            if (isEditMode) {
              setEditableRules(savedRules);
            }
            setIsEditMode(!isEditMode);
          }}
          className="text-sm bg-yellow-400 text-white py-1 px-3 rounded"
        >
          {isEditMode ? "閲覧モードに戻る" : "編集"}
        </button>
      </div>

      {allCategories.map((category) => {
        const options = editableRules.filter((r) => r.category === category);
        return (
          <div
            key={category}
            className="mb-4 p-4 bg-white rounded-xl shadow-md border border-yellow-300"
          >
            <strong className="block text-lg font-semibold mb-2 text-yellow-800">
              {category}
            </strong>

            {isEditMode && (
              <button
                className="text-sm text-blue-600 mb-2"
                onClick={() => handleAddOption(category)}
              >
                + オプション追加
              </button>
            )}

            <div className="flex flex-wrap gap-4">
              {options.map(({ id, option, callText }) => (
                <div key={id} className="flex items-center gap-2">
                  {isEditMode ? (
                    <>
                      <span>{option}</span>
                      <input
                        className="border px-2 py-1 text-sm"
                        value={callText}
                        onChange={(e) => onCallTextChange(id, e.target.value)}
                      />
                      <button onClick={() => handleDeleteOption(id)} className="text-red-500">
                        🗑
                      </button>
                    </>
                  ) : (
                    <label className="flex items-center gap-2 cursor-pointer">
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
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {isEditMode && (
        <>
          <div className="mt-6 bg-white p-4 rounded-xl border border-yellow-300">
            <h3 className="font-semibold mb-2 text-yellow-800">カテゴリー追加</h3>
            <div className="flex flex-col gap-2">
              <input
                className="border px-3 py-2"
                placeholder="カテゴリー名"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <input
                className="border px-3 py-2"
                placeholder="オプション名"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
              />
              <input
                className="border px-3 py-2"
                placeholder="コール文言（任意）"
                value={newCallText}
                onChange={(e) => setNewCallText(e.target.value)}
              />
              <button
                onClick={handleAddCategory}
                className="bg-yellow-500 text-white px-4 py-2 rounded"
              >
                カテゴリーを追加
              </button>
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded mt-2"
              >
                変更を保存
              </button>
            </div>
          </div>
        </>
      )}

      {!isEditMode && (
        <>
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
      )}
    </div>
  );
}