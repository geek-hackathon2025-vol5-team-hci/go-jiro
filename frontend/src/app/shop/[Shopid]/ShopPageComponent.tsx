"use client";

import React, { useState, useEffect } from "react";
import { Shop, CallRule } from "./types";
// --- DND-KIT IMPORTS ---
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- TYPES ---
interface ShopPageComponentProps {
  shop: Shop;
  shopId: string;
}

// --- SORTABLE COMPONENTS ---

interface SortableItemProps {
  id: string | number;
  children: React.ReactNode;
  disabled: boolean; // D&Dを無効化するフラグ
}

// カテゴリをドラッグ可能にするコンポーネント
function SortableCategoryItem({ id, children, disabled }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled }); // disabled propを渡す

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : "auto",
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-xl shadow-md"
    >
      <div className="flex items-start p-4">
        {/* 編集モードでのみハンドルを表示 */}
        {!disabled && (
          <span
            {...attributes}
            {...listeners}
            className="p-1 cursor-grab touch-none text-gray-500 mr-2"
          >
            ⠿
          </span>
        )}
        {/* 閲覧モードではハンドルの分のスペースを確保 */}
        {disabled && <div className="w-8"></div>}
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}

// オプションをドラッグ可能にするコンポーネント
function SortableOptionItem({ id, children, disabled }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled }); // disabled propを渡す

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : "auto",
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 w-full bg-gray-50 p-2 rounded-md"
    >
      {/* 編集モードでのみハンドルを表示 */}
      {!disabled && (
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-gray-500"
        >
          ⠿
        </span>
      )}
      <div className="w-full">{children}</div>
    </div>
  );
}

// --- MAIN COMPONENT: ShopPageComponent ---
export default function ShopPageComponent({
  shop,
  shopId,
}: ShopPageComponentProps) {
  // --- STATE DEFINITIONS ---
  const [savedTicketCategories, setSavedTicketCategories] = useState<string[]>(
    shop.callticketOrder.split(",").map((v) => v.trim())
  );
  const [savedToppingCategories, setSavedToppingCategories] = useState<
    string[]
  >(shop.callOrder.split(",").map((v) => v.trim()));
  const [editableTicketCategories, setEditableTicketCategories] = useState<
    string[]
  >(savedTicketCategories);
  const [editableToppingCategories, setEditableToppingCategories] = useState<
    string[]
  >(savedToppingCategories);

  const [newOptions, setNewOptions] = useState<
    Record<string, { option: string; callText: string }>
  >({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [savedRules, setSavedRules] = useState<CallRule[]>(shop.callRules);
  const [editableRules, setEditableRules] = useState<CallRule[]>(
    shop.callRules
  );
  const [activeAddFormCategory, setActiveAddFormCategory] = useState<
    string | null
  >(null);
  const [activeEditId, setActiveEditId] = useState<number | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const allCategories = [
      ...new Set([...savedTicketCategories, ...savedToppingCategories]),
    ];
    return allCategories.reduce((acc, category) => {
      const rule = savedRules.find((r) => r.category === category);
      acc[category] = rule?.option || "";
      return acc;
    }, {} as Record<string, string>);
  });

  const [ticketText, setTicketText] = useState("");
  const [toppingText, setToppingText] = useState("");

  // --- NEW STATE for adding a category ---
  const [addCategoryFor, setAddCategoryFor] = useState<
    "ticket" | "topping" | null
  >(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newFirstOption, setNewFirstOption] = useState("");

  useEffect(() => {
    const categoriesToUse = isEditMode
      ? [...editableTicketCategories, ...editableToppingCategories]
      : [...savedTicketCategories, ...savedToppingCategories];
    const rulesToUse = isEditMode ? editableRules : savedRules;

    const ticketParts = (
      isEditMode ? editableTicketCategories : savedTicketCategories
    ).map((category) => {
      const option = selections[category];
      const rule = rulesToUse.find(
        (r) => r.category === category && r.option === option
      );
      return rule?.callText || "";
    });
    const toppingParts = (
      isEditMode ? editableToppingCategories : savedToppingCategories
    ).map((category) => {
      const option = selections[category];
      const rule = rulesToUse.find(
        (r) => r.category === category && r.option === option
      );
      return rule?.callText || "";
    });
    setTicketText(ticketParts.filter(Boolean).join(" "));
    setToppingText(toppingParts.filter(Boolean).join(" "));
  }, [
    selections,
    savedRules,
    savedTicketCategories,
    savedToppingCategories,
    editableRules,
    editableTicketCategories,
    editableToppingCategories,
    isEditMode,
  ]);

  // --- HANDLERS ---
  const onChange = (category: string, option: string) =>
    setSelections((prev) => ({ ...prev, [category]: option }));
  const onOptionChange = (id: number, newOption: string) =>
    setEditableRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, option: newOption } : r))
    );
  const onCallTextChange = (id: number, newText: string) =>
    setEditableRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, callText: newText } : r))
    );
  const handleAddOptionInline = (category: string) => {
    const { option, callText } = newOptions[category] || {
      option: "",
      callText: "",
    };
    if (!option) return;
    const newId = Math.max(0, ...editableRules.map((r) => r.id)) + 1;
    const newRule: CallRule = {
      id: newId,
      shopId: shop.id,
      category,
      option,
      callText,
    };
    setEditableRules((prev) => [...prev, newRule]);
    setNewOptions((prev) => ({
      ...prev,
      [category]: { option: "", callText: "" },
    }));
  };

  // --- NEW HANDLER for adding a category ---
  const handleAddCategory = (type: "ticket" | "topping") => {
    if (!newCategoryName || !newFirstOption) {
      alert("カテゴリー名と最初のオプション名を入力してください。");
      return;
    }
    const allEditableCategories = [
      ...editableTicketCategories,
      ...editableToppingCategories,
    ];
    if (allEditableCategories.includes(newCategoryName)) {
      alert("そのカテゴリー名は既に使用されています。");
      return;
    }

    // Add new category to the list
    if (type === "ticket") {
      setEditableTicketCategories((prev) => [...prev, newCategoryName]);
    } else {
      setEditableToppingCategories((prev) => [...prev, newCategoryName]);
    }

    // Add the first option as a new rule
    const newId = Math.max(0, ...editableRules.map((r) => r.id)) + 1;
    const newRule: CallRule = {
      id: newId,
      shopId: shop.id,
      category: newCategoryName,
      option: newFirstOption,
      callText: newFirstOption, // デフォルトではオプション名をコール文言に設定
    };
    setEditableRules((prev) => [...prev, newRule]);

    // Reset form
    setNewCategoryName("");
    setNewFirstOption("");
    setAddCategoryFor(null);
  };

  const handleDeleteOption = (id: number) =>
    setEditableRules((prev) => prev.filter((r) => r.id !== id));

  const handleSave = () => {
    setSavedRules(editableRules);
    setSavedTicketCategories(editableTicketCategories);
    setSavedToppingCategories(editableToppingCategories);
    setIsEditMode(false);
    setActiveEditId(null);
  };

  const handleCancel = () => {
    setEditableRules(savedRules);
    setEditableTicketCategories(savedTicketCategories);
    setEditableToppingCategories(savedToppingCategories);
    setIsEditMode(false);
    setActiveEditId(null);
  };

  const handleOptionDragEnd = (event: DragEndEvent, category: string) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setEditableRules((rules) => {
        const categoryOptions = rules.filter((r) => r.category === category);
        const otherOptions = rules.filter((r) => r.category !== category);
        const oldIndex = categoryOptions.findIndex((r) => r.id === active.id);
        const newIndex = categoryOptions.findIndex((r) => r.id === over.id);
        const reorderedCategoryOptions = arrayMove(
          categoryOptions,
          oldIndex,
          newIndex
        );
        return [...otherOptions, ...reorderedCategoryOptions];
      });
    }
  };

  const handleCategoryDragEnd = (
    event: DragEndEvent,
    type: "ticket" | "topping"
  ) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      if (type === "ticket") {
        setEditableTicketCategories((items) =>
          arrayMove(
            items,
            items.indexOf(active.id as string),
            items.indexOf(over.id as string)
          )
        );
      } else {
        setEditableToppingCategories((items) =>
          arrayMove(
            items,
            items.indexOf(over.id as string),
            items.indexOf(active.id as string)
          )
        );
      }
    }
  };

  // --- RENDER SECTION ---
  const renderCategoryContent = (category: string) => {
    const rulesToUse = isEditMode ? editableRules : savedRules;
    const options = rulesToUse.filter((r) => r.category === category);
    const optionIds = options.map((o) => o.id);

    return (
      <>
        <strong className="block text-lg font-semibold mb-2 text-yellow-800">
          {category}
        </strong>
        {isEditMode && (
          <>
            <button
              className="text-sm text-blue-600 mb-2"
              onClick={() =>
                setActiveAddFormCategory((prev) =>
                  prev === category ? null : category
                )
              }
            >
              {activeAddFormCategory === category
                ? "キャンセル"
                : "+ オプション追加"}
            </button>
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
                    setActiveAddFormCategory(null);
                  }}
                >
                  オプション追加
                </button>
              </div>
            )}
          </>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event: DragEndEvent) =>
            handleOptionDragEnd(event, category)
          }
        >
          <SortableContext
            items={optionIds}
            strategy={
              isEditMode
                ? verticalListSortingStrategy
                : horizontalListSortingStrategy
            }
            disabled={!isEditMode}
          >
            <div className="flex flex-row flex-wrap gap-x-6 gap-y-2 mt-2">
              {options.map(({ id, option, callText }) => (
                <div key={id}>
                  {isEditMode ? (
                    <SortableOptionItem id={id} disabled={!isEditMode}>
                      {activeEditId === id ? (
                        <div className="flex items-center gap-2 w-full">
                          <input
                            className="border px-2 py-1 text-sm flex-grow"
                            value={option}
                            onChange={(e) => onOptionChange(id, e.target.value)}
                          />
                          <input
                            className="border px-2 py-1 text-sm flex-grow"
                            value={callText}
                            onChange={(e) =>
                              onCallTextChange(id, e.target.value)
                            }
                          />
                          <button
                            onClick={() => handleDeleteOption(id)}
                            className="text-red-500 pr-2"
                          >
                            🗑
                          </button>
                        </div>
                      ) : (
                        <div
                          className="w-full flex items-center justify-between cursor-pointer"
                          onClick={() => setActiveEditId(id)}
                        >
                          <span>{option}</span>
                        </div>
                      )}
                    </SortableOptionItem>
                  ) : (
                    <label className="flex items-center gap-2 cursor-pointer w-full p-2">
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
  const renderAddCategoryForm = (type: "ticket" | "topping") => (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="font-semibold text-blue-800 mb-2">新規カテゴリー追加</h3>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="新しいカテゴリー名"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="border px-2 py-1"
        />
        <input
          type="text"
          placeholder="最初のオプション名"
          value={newFirstOption}
          onChange={(e) => setNewFirstOption(e.target.value)}
          className="border px-2 py-1"
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => handleAddCategory(type)}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
          >
            追加
          </button>
          <button
            onClick={() => setAddCategoryFor(null)}
            className="bg-gray-300 px-3 py-1 rounded text-sm"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 bg-yellow-100 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-yellow-900">
          {shop.name} のトッピング選択
        </h1>
        <button
          onClick={() => (isEditMode ? handleCancel() : setIsEditMode(true))}
          className="text-sm bg-yellow-400 text-white py-1 px-3 rounded w-28 text-center"
        >
          {isEditMode ? "閲覧モードに戻る" : "編集"}
        </button>
      </div>

      {/* --- Ticket Machine Categories Section --- */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-yellow-900 border-b-2 border-yellow-400 pb-1">
          券売機コール
        </h2>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event: DragEndEvent) =>
            handleCategoryDragEnd(event, "ticket")
          }
        >
          <SortableContext
            items={editableTicketCategories}
            strategy={verticalListSortingStrategy}
            disabled={!isEditMode}
          >
            <div className="flex flex-col gap-4">
              {(isEditMode
                ? editableTicketCategories
                : savedTicketCategories
              ).map((category) => (
                <SortableCategoryItem
                  key={category}
                  id={category}
                  disabled={!isEditMode}
                >
                  {renderCategoryContent(category)}
                </SortableCategoryItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        {/* --- NEW Add Category Button/Form --- */}
        {isEditMode &&
          (addCategoryFor === "ticket" ? (
            renderAddCategoryForm("ticket")
          ) : (
            <button
              onClick={() => setAddCategoryFor("ticket")}
              className="mt-4 text-blue-600 font-semibold"
            >
              ＋ カテゴリーを追加
            </button>
          ))}
      </div>

      {/* --- Free Toppings Categories Section --- */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-yellow-900 border-b-2 border-yellow-400 pb-1">
          無料トッピングコール
        </h2>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event: DragEndEvent) =>
            handleCategoryDragEnd(event, "topping")
          }
        >
          <SortableContext
            items={editableToppingCategories}
            strategy={verticalListSortingStrategy}
            disabled={!isEditMode}
          >
            <div className="flex flex-col gap-4">
              {(isEditMode
                ? editableToppingCategories
                : savedToppingCategories
              ).map((category) => (
                <SortableCategoryItem
                  key={category}
                  id={category}
                  disabled={!isEditMode}
                >
                  {renderCategoryContent(category)}
                </SortableCategoryItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        {/* --- NEW Add Category Button/Form --- */}
        {isEditMode &&
          (addCategoryFor === "topping" ? (
            renderAddCategoryForm("topping")
          ) : (
            <button
              onClick={() => setAddCategoryFor("topping")}
              className="mt-4 text-blue-600 font-semibold"
            >
              ＋ カテゴリーを追加
            </button>
          ))}
      </div>

      {isEditMode ? (
        <div className="mt-6">
          <button
            onClick={handleSave}
            className="w-full bg-green-600 text-white font-bold px-4 py-3 rounded mt-2 text-lg"
          >
            変更を保存
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
            {/* --- NEW Add Category Button/Form --- */}
            {isEditMode &&
              (addCategoryFor === "ticket" ? (
                renderAddCategoryForm("ticket")
              ) : (
                <button
                  onClick={() => setAddCategoryFor("ticket")}
                  className="mt-4 text-blue-600 font-semibold"
                >
                  ＋ カテゴリーを追加
                </button>
              ))}
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
