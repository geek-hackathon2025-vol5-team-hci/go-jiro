// frontend/src/app/shop/[Shopid]/ShopPageComponent.tsx

"use client";
import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Shop, ShopEvaluation } from "./types";
import { useShopEditor } from "./hooks/useShopEditor";
import { CategoryList } from "./components/CategoryList";
import { EvaluationList } from "./components/EvaluationList";

interface ShopPageComponentProps {
  shop: Shop;
  shopId: string;
}

export default function ShopPageComponent({ shop, shopId }: ShopPageComponentProps) {
  const searchParams = useSearchParams();
  const shopNameParam = searchParams.get('shopName');
  const openHour = searchParams.get('openHour');
  const jiroScore = searchParams.get('jiroScore');
 // const jiroIcon = searchParams.get('jiroIcon');
  const score = jiroScore ? Number(jiroScore) : null;
  const editor = useShopEditor(shop, shopId);

  const [evaluations, setEvaluations] = useState<ShopEvaluation[]>([]);
  const [isLoadingEvals, setIsLoadingEvals] = useState(true);
  const [errorEvals, setErrorEvals] = useState<string | null>(null);

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

  const getLevelByScore = (score: number): string => {
    if (score <= 25) return "梅";
    if (score <= 50) return "竹";
    if (score <= 75) return "松";
    return "鬼";
  };

  const getImageByScore = (score: number): string => {
    if (score <= 25) return "/jiros/umeJiro.png";
    if (score <= 50) return "/jiros/takeJiro.png";
    if (score <= 75) return "/jiros/matsuJiro.png";
    return "/jiros/oniJiro.png";
  };

  const [ticketText, setTicketText] = useState("");
  const [toppingText, setToppingText] = useState("");

  useEffect(() => {
    const fetchEvaluations = async () => {
      setIsLoadingEvals(true);
      setErrorEvals(null);
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${apiBaseUrl}/api/evaluations/shop/${shopId}`);
        if (!response.ok) {
          throw new Error('評価の取得に失敗しました。');
        }
        const data: ShopEvaluation[] = await response.json();
        setEvaluations(data);
        } catch (err: unknown) { // anyをunknownに変更
          if (err instanceof Error) {
            setErrorEvals(err.message);
          } else {
            setErrorEvals('不明なエラーが発生しました');
          }
      } finally {
        setIsLoadingEvals(false);
      }
    };

    fetchEvaluations();
  }, [shopId]);

  useEffect(() => {
    const rulesToUse = editor.isEditMode ? editor.editableRules : editor.savedRules;
    const ticketCategories = editor.isEditMode ? editor.editableTicketCategories : editor.savedTicketCategories;
    const toppingCategories = editor.isEditMode ? editor.editableToppingCategories : editor.savedToppingCategories;

    const getCallText = (category: string) => {
      const option = selections[category];
      const rule = rulesToUse.find(
        (r) => r.category === category && r.option === option
      );
      return rule?.callText || "";
    };

    setTicketText(ticketCategories.map(getCallText).filter(Boolean).join(" "));
    setToppingText(toppingCategories.map(getCallText).filter(Boolean).join(" "));
  }, [
    selections,
    editor.isEditMode,
    editor.editableRules,
    editor.savedRules,
    editor.editableTicketCategories,
    editor.savedTicketCategories,
    editor.editableToppingCategories,
    editor.savedToppingCategories,
  ]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4 font-bold text-black" style={{ fontFamily: 'Impact, sans-serif' }}>
      <div className="max-w-3xl w-full mx-auto p-8 bg-yellow-300 rounded-2xl shadow-xl text-center">
        <div className="mb-6 space-y-4">
          <p className="text-5xl">
            {shopNameParam ?? shop.name ?? "店舗名未定"}
          </p>
          {openHour && (
            <p className="text-black text-sm mt-1">
              営業時間: <span className="font-normal">{openHour}</span>
            </p>
          )}

          {score !== null && (
            <div className="mt-4 flex flex-col items-center space-y-2">
              <img
                src={getImageByScore(score)}
                alt="次郎度アイコン"
                className="w-16 h-16 object-contain"
              />
              {(() => {
                const level = getLevelByScore(score);
                const color =
                  level === "鬼" ? "#7e22ce" :
                    level === "松" ? "#15803d" :
                      level === "竹" ? "#a3e635" : "#ec4899";
                return (
                  <p className="text-2xl text-black font-bold">
                    二郎度: {score}
                    <span className="ml-2 px-3 py-1 rounded-full text-white text-xl font-semibold" style={{ backgroundColor: color }}>
                      {level}
                    </span>
                  </p>
                );
              })()}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold bg-red-600 text-black px-2 rounded">トッピング選択</h1>
          <button
            onClick={() => editor.setIsEditMode(!editor.isEditMode)}
            className="text-sm bg-black text-yellow-300 py-1 px-3 rounded w-32 text-center hover:bg-gray-800"
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
          titleClassName="text-2xl text-black bg-yellow-300 px-3 py-1 rounded text-center"

        />

        <CategoryList
          title="無料トッピングコール"
          type="topping"
          editor={editor}
          selections={selections}
          setSelections={setSelections}
          titleClassName="text-2xl text-black bg-yellow-300 px-3 py-1 rounded text-center"

        />


        {editor.isEditMode ? (
          <div className="mt-6">
            <button
              onClick={editor.handleSave}
              disabled={editor.isSaving}
              className="w-full bg-green-600 text-white px-4 py-3 rounded mt-2 text-lg disabled:bg-gray-400"
            >
              {editor.isSaving ? "保存中..." : "変更を保存"}
            </button>
          </div>
        ) : (
          <>
            <div className="mt-8 text-left">
              <h2 className="text-xl mb-2 text-black">現在の券売機コール文言</h2>
              <p className="p-3 bg-white rounded-md text-black">
                {ticketText || "コールの必要なし"}
              </p>
            </div>
            <div className="mt-6 text-left">
              <h2 className="text-xl mb-2 text-black">現在の無料トッピングコール文言</h2>
              <p className="p-3 bg-white rounded-md text-black">
                {toppingText || "そのまま"}
              </p>
            </div>
            <div className="mt-8 text-center">
              <Link
                href={`/visiting?shopId=${shopId}&shopName=${encodeURIComponent(shop.name)}&ticketText=${encodeURIComponent(ticketText)}&toppingText=${encodeURIComponent(toppingText)}`}
              >
                <button className="bg-red-600 text-white text-2xl px-12 py-4 rounded-lg shadow-md hover:bg-red-700">
                  この店に来店する
                </button>
              </Link>
            </div>
            <EvaluationList
              evaluations={evaluations}
              isLoading={isLoadingEvals}
              error={errorEvals}
            />
          </>
        )}
      </div>

      <div className="mt-10 text-center space-x-4">
        <Link href="/map">
          <button className="bg-white text-black text-xl px-6 py-2 rounded-lg shadow-md hover:bg-gray-300 transition-colors">
            地図に戻る
          </button>
        </Link>
        {shopId && (
          <Link href={`/evaluation/${shopId}`}>
            <button className="bg-black text-yellow-300 text-xl px-6 py-2 rounded-lg shadow-md hover:bg-yellow-500 transition-colors">
              このお店を評価する
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
