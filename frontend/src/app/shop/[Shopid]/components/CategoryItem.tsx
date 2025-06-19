// components/CategoryItem.tsx
import React, { useRef, useEffect } from "react";
import { CallRule } from "../types";
import { SortableOptionItem } from "./SortableItems";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

/**
 * このコンポーネントが親から受け取るProps（状態や関数）の型定義です。
 * 1つのカテゴリーを表示するために必要な情報がすべて含まれています。
 */
interface CategoryItemProps {
  category: string;
  isEditMode: boolean;
  rules: CallRule[];
  selections: Record<string, string>;
  setSelections: (value: React.SetStateAction<Record<string, string>>) => void;
  activeEditId: number | null;
  setActiveEditId: (id: number | null) => void;
  onOptionChange: (id: number, value: string) => void;
  onCallTextChange: (id: number, value: string) => void;
  handleDeleteOption: (id: number) => void;
  handleOptionDragEnd: (event: DragEndEvent, category: string) => void;
  activeAddFormCategory: string | null;
  setActiveAddFormCategory: (value: string | null) => void;
  newOptions: Record<string, { option: string; callText: string }>;
  setNewOptions: (
    value: React.SetStateAction<
      Record<string, { option: string; callText: string }>
    >
  ) => void;
  handleAddOptionInline: (category: string) => void;
}

/**
 * 1つのカテゴリー表示と、その中のオプションリストの表示・編集を担当するコンポーネント
 * @param props - 親コンポーネントから渡される状態とハンドラ関数
 */
export const CategoryItem = ({
  category,
  isEditMode,
  rules,
  selections,
  setSelections,
  activeEditId,
  setActiveEditId,
  onOptionChange,
  onCallTextChange,
  handleDeleteOption,
  handleOptionDragEnd,
  activeAddFormCategory,
  setActiveAddFormCategory,
  newOptions,
  setNewOptions,
  handleAddOptionInline,
}: CategoryItemProps) => {
  // ドラッグ＆ドロップの入力を検知するセンサーを初期化
  const sensors = useSensors(useSensor(PointerSensor));
  // Propsで渡された全ルールの中から、このカテゴリーに属するものだけをフィルタリング
  const options = rules.filter((r) => r.category === category);
  // SortableContextでアイテムを識別するためのIDの配列を生成
  const optionIds = options.map((o) => o.id);

  // 編集フォームのDOM要素を参照するためのrefを作成
  const editorRef = useRef<HTMLDivElement>(null);

  // 「外側クリック」を検知するためのuseEffect
  useEffect(() => {
    // クリックイベントを処理する関数
    const handleClickOutside = (event: MouseEvent) => {
      // refが設定されていて、かつクリックされた場所が編集フォームの外側の場合
      if (
        editorRef.current &&
        !editorRef.current.contains(event.target as Node)
      ) {
        setActiveEditId(null); // フォームを閉じる
      }
    };

    // 編集フォームが表示されているときだけ、イベントリスナーを登録
    if (activeEditId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // クリーンアップ関数：コンポーネントが再描画される前やアンマウントされるときにリスナーを削除
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeEditId, setActiveEditId]); // activeEditIdが変わるたびにこのeffectを再実行

  // 閲覧モードでラジオボタンが選択されたときの処理
  const onChange = (cat: string, opt: string) =>
    setSelections((prev) => ({ ...prev, [cat]: opt }));

  return (
    <>
      {/* カテゴリー名を表示 */}
      <strong className="block text-lg font-semibold mb-2 text-yellow-800">
        {category}
      </strong>

      {/* --- 編集モード時に表示される「オプション追加」機能 --- */}
      {isEditMode && (
        <>
          {/* ボタンクリックでフォームの表示/非表示を切り替える */}
          <button
            className="text-sm text-blue-600 mb-2"
            onClick={() =>
              setActiveAddFormCategory(
                activeAddFormCategory === category ? null : category
              )
            }
          >
            {activeAddFormCategory === category
              ? "キャンセル"
              : "+ オプション追加"}
          </button>
          {/* activeAddFormCategoryが現在のカテゴリ名と一致する場合のみフォームを表示 */}
          {activeAddFormCategory === category && (
            <div className="my-2 flex flex-col gap-2 p-2 bg-blue-50 rounded-md">
              <input
                className="border px-2 py-1 text-sm"
                placeholder="新しいオプション名"
                value={newOptions[category]?.option || ""}
                onChange={(e) =>
                  setNewOptions((prev) => ({
                    ...prev,
                    [category]: { ...prev[category], option: e.target.value },
                  }))
                }
              />
              <input
                className="border px-2 py-1 text-sm"
                placeholder="コール文言（任意）"
                value={newOptions[category]?.callText || ""}
                onChange={(e) =>
                  setNewOptions((prev) => ({
                    ...prev,
                    [category]: {
                      ...prev[category],
                      callText: e.target.value,
                    },
                  }))
                }
              />
              <button
                className="bg-blue-500 text-white text-sm px-3 py-1 rounded"
                onClick={() => {
                  handleAddOptionInline(category);
                  setActiveAddFormCategory(null); // 追加後フォームを閉じる
                }}
              >
                オプション追加
              </button>
            </div>
          )}
        </>
      )}

      {/* --- オプションリストの表示と並び替えエリア --- */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event: DragEndEvent) =>
          handleOptionDragEnd(event, category)
        }
      >
        <SortableContext
          items={optionIds}
          strategy={horizontalListSortingStrategy}
          disabled={!isEditMode}
        >
          <div className="flex flex-row flex-wrap gap-x-6 gap-y-2 mt-2">
            {options.map(({ id, option, callText }) => (
              <div key={id}>
                {/* --- 編集モードか閲覧モードかで表示を切り替える --- */}
                {isEditMode ? (
                  // 【編集モード】ドラッグ＆ドロップ可能なアイテムとしてラップ
                  <SortableOptionItem id={id} disabled={!isEditMode}>
                    {/* activeEditIdが現在のオプションIDと一致する場合、インライン編集フォームを表示 */}
                    {activeEditId === id ? (
                      <div ref={editorRef} className="flex items-center gap-2">
                        <input
                          className="border px-2 py-1 text-sm"
                          value={option}
                          onChange={(e) => onOptionChange(id, e.target.value)}
                        />
                        <input
                          className="border px-2 py-1 text-sm"
                          value={callText}
                          onChange={(e) => onCallTextChange(id, e.target.value)}
                        />
                        <button
                          onClick={() => handleDeleteOption(id)}
                          className="text-red-500"
                        >
                          🗑
                        </button>
                      </div>
                    ) : (
                      // 通常はオプション名のみ表示。クリックで編集フォームに切り替え
                      <div
                        className="cursor-pointer"
                        onClick={() => setActiveEditId(id)}
                      >
                        <span>{option}</span>
                      </div>
                    )}
                  </SortableOptionItem>
                ) : (
                  // 【閲覧モード】選択可能なラジオボタンとして表示
                  <label className="flex items-center gap-2 cursor-pointer p-2">
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
        </SortableContext>
      </DndContext>
    </>
  );
};
