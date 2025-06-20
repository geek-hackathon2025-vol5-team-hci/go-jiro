// ShopPageComponent.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Shop } from "./types";
import { useShopEditor } from "./hooks/useShopEditor";
import { CategoryList } from "./components/CategoryList";
import Link from "next/link";

interface ShopPageComponentProps {
  shop: Shop;
  shopId: string;
}

export default function ShopPageComponent({
  shop,
  shopId,
}: ShopPageComponentProps) {
  // すべてのロジックと状態をカスタムフックから受け取る
  const editor = useShopEditor(shop, shopId);

  // 表示用のState
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const allCategories = [
      ...new Set([
        ...editor.savedTicketCategories,
        ...editor.savedToppingCategories,
      ]),
    ];
    return allCategories.reduce((acc, category) => {
      const rule = editor.savedRules.find((r) => r.category === category);
      acc[category] = rule?.option || "";
      return acc;
    }, {} as Record<string, string>);
  });

  const [ticketText, setTicketText] = useState("");
  const [toppingText, setToppingText] = useState("");

  // コール文言の生成ロジック
  useEffect(() => {
    const rulesToUse = editor.isEditMode
      ? editor.editableRules
      : editor.savedRules;
    const ticketCategories = editor.isEditMode
      ? editor.editableTicketCategories
      : editor.savedTicketCategories;
    const toppingCategories = editor.isEditMode
      ? editor.editableToppingCategories
      : editor.savedToppingCategories;

    const getCallText = (category: string) => {
      const option = selections[category];
      const rule = rulesToUse.find(
        (r) => r.category === category && r.option === option
      );
      return rule?.callText || "";
    };

    setTicketText(ticketCategories.map(getCallText).filter(Boolean).join(" "));
    setToppingText(
      toppingCategories.map(getCallText).filter(Boolean).join(" ")
    );
  }, [selections, editor]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-yellow-100 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-yellow-900">
          {shop.name} のトッピング選択
        </h1>
        <button
          onClick={() => editor.setIsEditMode(!editor.isEditMode)}
          className="text-sm bg-yellow-400 text-white py-1 px-3 rounded w-28 text-center"
        >
          {editor.isEditMode ? "閲覧モードに戻る" : "編集"}
        </button>
      </div>

      <CategoryList
        title="券売機コール"
        type="ticket"
        editor={editor}
        selections={selections}
        setSelections={setSelections}
      />

      <CategoryList
        title="無料トッピングコール"
        type="topping"
        editor={editor}
        selections={selections}
        setSelections={setSelections}
      />

      {editor.isEditMode ? (
        <div className="mt-6">
          <button
            onClick={editor.handleSave}
            disabled={editor.isSaving}
            className="w-full bg-green-600 text-white font-bold px-4 py-3 rounded mt-2 text-lg disabled:bg-gray-400"
          >
            {editor.isSaving ? "保存中..." : "変更を保存"}
          </button>
        </div>
      ) : (
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
      <Link href={`/shop/${shop.id}/evaluation`}>
        <button className="bg-blue-500 text-white p-2 rounded-md">
          このお店を評価する
        </button>
      </Link>
    </div>
  );
}
