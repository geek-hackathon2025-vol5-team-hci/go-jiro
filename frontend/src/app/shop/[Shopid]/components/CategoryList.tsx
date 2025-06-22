// components/CategoryList.tsx
import React from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableCategoryItem } from './SortableItems';
import { CategoryItem } from './CategoryItem';
import { AddCategoryForm } from './AddCategoryForm';
import { useShopEditor } from '../hooks/useShopEditor';



/**
 * CategoryListコンポーネントが受け取るPropsの型定義
 * @param title - セクションのタイトル (例: "券売機コール")
 * @param type - 'ticket' または 'topping'。どちらのカテゴリーリストを表示するかを識別
 * @param editor - useShopEditorフックから返される、すべての状態とハンドラ関数を含むオブジェクト
 * @param selections - 現在選択されているオプションの状態
 * @param setSelections - selectionsの状態を更新する関数
 */
type CategoryListProps = {
  title: string;
  type: 'ticket' | 'topping';
  editor: ReturnType<typeof useShopEditor>;
  selections: Record<string, string>;
  setSelections: (value: React.SetStateAction<Record<string, string>>) => void;
  titleClassName?: string;
};

/**
 * カテゴリーのリスト全体（例：「券売機コール」のセクション）の表示と操作を担当するコンポーネント
 * @param props - 親コンポーネントから渡される、タイトル、タイプ、エディターの状態と関数
 */
export const CategoryList = ({ title, type, editor, selections, setSelections }: CategoryListProps) => {
  // ドラッグ操作を検知するセンサー
  const sensors = useSensors(useSensor(PointerSensor));
  // 表示するカテゴリリストを'ticket'か'topping'かで決定
  const categories = type === 'ticket' ? editor.editableTicketCategories : editor.editableToppingCategories;
  // 編集モードか閲覧モードかで、表示するルール（保存済みか編集中か）を決定
  const rules = editor.isEditMode ? editor.editableRules : editor.savedRules;
  
  return (
    <div className="mb-8">
      {/* セクションのタイトル（例：「券売機コール」） */}
      <h2 className="text-xl font-semibold mb-3 text-yellow-900 border-b-2 border-yellow-400 pb-1">{title}</h2>
      
      {/* カテゴリー自体の並び替え（D&D）を管理するコンテキスト */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event: DragEndEvent) => editor.handleCategoryDragEnd(event, type)}>
        {/* D&D可能なアイテムのリストと振る舞いの戦略を定義 */}
        <SortableContext items={categories} strategy={verticalListSortingStrategy} disabled={!editor.isEditMode}>
          <div className="flex flex-col gap-4">
            {/* カテゴリーの配列をループして、各カテゴリーを描画 */}
            {categories.map((category) => (
              // カテゴリー全体をドラッグ可能にするためのラッパーコンポーネント
              <SortableCategoryItem key={category} id={category} disabled={!editor.isEditMode}>
                {/*
                  各カテゴリーの中身を描画する子コンポーネント
                  カスタムフック`useShopEditor`から受け取った状態と関数（まとめて`editor`オブジェクト）を
                  そのままPropsとして"バケツリレー"で渡している
                */}
                <CategoryItem
                  category={category}
                  isEditMode={editor.isEditMode}
                  rules={rules}
                  selections={selections}
                  setSelections={setSelections}
                  activeEditId={editor.activeEditId}
                  setActiveEditId={editor.setActiveEditId}
                  onOptionChange={editor.onOptionChange}
                  onCallTextChange={editor.onCallTextChange}
                  handleDeleteOption={editor.handleDeleteOption}
                  handleDeleteCategory={editor.handleDeleteCategory}
                  handleOptionDragEnd={editor.handleOptionDragEnd}
                  activeAddFormCategory={editor.activeAddFormCategory}
                  setActiveAddFormCategory={editor.setActiveAddFormCategory}
                  newOptions={editor.newOptions}
                  setNewOptions={editor.setNewOptions}
                  handleAddOptionInline={editor.handleAddOptionInline}
                  onCategoryNameChange={editor.handleCategoryNameChange}
                />
              </SortableCategoryItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* --- 編集モード時に、リストの末尾に「カテゴリー追加」機能を表示 --- */}
      {editor.isEditMode && (
        // `addCategoryFor` の状態に応じて、フォームまたは追加ボタンを描画
        editor.addCategoryFor === type ? (
          <AddCategoryForm
            type={type}
            newCategoryName={editor.newCategoryName}
            setNewCategoryName={editor.setNewCategoryName}
            newFirstOption={editor.newFirstOption}
            setNewFirstOption={editor.setNewFirstOption}
            onAdd={editor.handleAddCategory}
            onCancel={() => editor.setAddCategoryFor(null)}
          />
        ) : (
          <button onClick={() => editor.setAddCategoryFor(type)} className="mt-4 text-blue-600 font-semibold">
            ＋ カテゴリーを追加
          </button>
        )
      )}
    </div>
  );
};