// components/CategoryItem.tsx
import React, { useRef, useEffect, useState } from "react";
import { CallRule } from "../types";
import { SortableOptionItem } from "./SortableItems";
import {
  DndContext, DragEndEvent, PointerSensor,
  useSensor, useSensors, closestCenter
} from "@dnd-kit/core";
import {
  SortableContext, horizontalListSortingStrategy
} from "@dnd-kit/sortable";

interface CategoryItemProps {
  category: string;
  isEditMode: boolean;
  rules: CallRule[];
  selections: Record<string, string>;
  setSelections: (value: React.SetStateAction<Record<string, string>>) => void;
  activeEditId: number | null;
  setActiveEditId: (id: number | null) => void;
  onCategoryChange: (id: number, newCategory: string) => void;
  onOptionChange: (id: number, value: string) => void;
  onCallTextChange: (id: number, value: string) => void;
  handleDeleteOption: (id: number) => void;
  handleOptionDragEnd: (event: DragEndEvent, category: string) => void;
  activeAddFormCategory: string | null;
  setActiveAddFormCategory: (value: string | null) => void;
  newOptions: Record<string, { option: string; callText: string }>;
  setNewOptions: (value: React.SetStateAction<Record<string, { option: string; callText: string }>>) => void;
  handleAddOptionInline: (category: string) => void;
  onCategoryNameChange: (oldCategory: string, newCategory: string) => void;
}

export const CategoryItem = ({
  category, isEditMode, rules, selections, setSelections,
  activeEditId, setActiveEditId, onCategoryChange, onOptionChange,
  onCallTextChange, handleDeleteOption, handleOptionDragEnd,
  activeAddFormCategory, setActiveAddFormCategory, newOptions,
  setNewOptions, handleAddOptionInline, onCategoryNameChange,
}: CategoryItemProps) => {
  const sensors = useSensors(useSensor(PointerSensor));
  const options = rules.filter((r) => r.category === category);
  const optionIds = options.map((o) => o.id);
  const editorRef = useRef<HTMLDivElement>(null);

  // カテゴリー名編集用のローカルstate
  const [localCategoryName, setLocalCategoryName] = useState(category);

  // 親から渡されるcategoryが変更されたら、ローカルのstateも同期する
  useEffect(() => {
    setLocalCategoryName(category);
  }, [category]);
  
  // inputからフォーカスが外れた時に、変更を親コンポーネントに通知
  const handleNameBlur = () => {
    if (localCategoryName.trim() && localCategoryName !== category) {
      onCategoryNameChange(category, localCategoryName);
    } else {
      setLocalCategoryName(category); // 無効な場合は元の名前に戻す
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        setActiveEditId(null);
      }
    };
    if (activeEditId !== null) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeEditId, setActiveEditId]);

  const onSelectionChange = (cat: string, opt: string) =>
    setSelections((prev) => ({ ...prev, [cat]: opt }));

  return (
    <>
      {/* カテゴリー名を表示・編集 */}
      {isEditMode ? (
        <input
          type="text"
          value={localCategoryName}
          onChange={(e) => setLocalCategoryName(e.target.value)}
          onBlur={handleNameBlur}
          className="block w-full text-lg font-semibold mb-2 text-yellow-800 bg-transparent border-b-2 border-yellow-500 focus:outline-none focus:border-yellow-700"
        />
      ) : (
        <strong className="block text-lg font-semibold mb-2 text-yellow-800">
          {category}
        </strong>
      )}

      {/* オプション追加機能 */}
      {isEditMode && (
        <>
          <button
            className="text-sm text-blue-600 mb-2"
            onClick={() => setActiveAddFormCategory(activeAddFormCategory === category ? null : category)}
          >
            {activeAddFormCategory === category ? "キャンセル" : "+ オプション追加"}
          </button>
          {activeAddFormCategory === category && (
            <div className="my-2 flex flex-col gap-2 p-2 bg-blue-50 rounded-md">
              <input
                className="border px-2 py-1 text-sm text-zinc-500"
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
                className="border px-2 py-1 text-sm text-zinc-500"
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

      {/* オプションリスト */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e: DragEndEvent) => handleOptionDragEnd(e, category)}>
        <SortableContext items={optionIds} strategy={horizontalListSortingStrategy} disabled={!isEditMode}>
          <div className="flex flex-row flex-wrap gap-x-6 gap-y-2 mt-2">
            {options.map(({ id, option, callText }) => (
              <div key={id}>
                {isEditMode ? (
                  <SortableOptionItem id={id} disabled={!isEditMode}>
                    {activeEditId === id ? (
                      <div ref={editorRef} className="flex items-center gap-2 text-black">
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
                        className="cursor-pointer text-black"
                        onClick={() => setActiveEditId(id)}
                      >
                        <span>{option}</span>
                      </div>
                    )}
                  </SortableOptionItem>
                ) : (
                  // 【閲覧モード】選択可能なラジオボタンとして表示
                  <label className="flex items-center gap-2 cursor-pointer p- text-black">
                    <input
                      type="radio"
                      name={category}
                      value={option}
                      checked={selections[category] === option}
                      onChange={() => onSelectionChange(category, option)}
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