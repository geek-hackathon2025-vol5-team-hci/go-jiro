// components/CategoryList.tsx
import React from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableCategoryItem } from './SortableItems';
import { CategoryItem } from './CategoryItem';
import { AddCategoryForm } from './AddCategoryForm';
import { useShopEditor } from '../hooks/useShopEditor';

type CategoryListProps = {
  title: string;
  type: 'ticket' | 'topping';
  editor: ReturnType<typeof useShopEditor>;
  selections: Record<string, string>;
  setSelections: (value: React.SetStateAction<Record<string, string>>) => void;
};

export const CategoryList = ({ title, type, editor, selections, setSelections }: CategoryListProps) => {
  const sensors = useSensors(useSensor(PointerSensor));
  const categories = type === 'ticket' ? editor.editableTicketCategories : editor.editableToppingCategories;
  const rules = editor.isEditMode ? editor.editableRules : editor.savedRules;
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-3 text-yellow-900 border-b-2 border-yellow-400 pb-1">{title}</h2>
      
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event: DragEndEvent) => editor.handleCategoryDragEnd(event, type)}>
        <SortableContext items={categories} strategy={verticalListSortingStrategy} disabled={!editor.isEditMode}>
          <div className="flex flex-col gap-4">
            {categories.map((category) => (
              <SortableCategoryItem key={category} id={category} disabled={!editor.isEditMode}>
                <CategoryItem
                  category={category}
                  isEditMode={editor.isEditMode}
                  rules={rules}
                  selections={selections}
                  setSelections={setSelections}
                  activeEditId={editor.activeEditId}
                  setActiveEditId={editor.setActiveEditId}
                  onCategoryChange={editor.onCategoryChange}
                  onOptionChange={editor.onOptionChange}
                  onCallTextChange={editor.onCallTextChange}
                  handleDeleteOption={editor.handleDeleteOption}
                  handleOptionDragEnd={editor.handleOptionDragEnd}
                  activeAddFormCategory={editor.activeAddFormCategory}
                  setActiveAddFormCategory={editor.setActiveAddFormCategory}
                  newOptions={editor.newOptions}
                  setNewOptions={editor.setNewOptions}
                  handleAddOptionInline={editor.handleAddOptionInline}
                  // 新しいカテゴリー名変更ハンドラを渡す
                  onCategoryNameChange={editor.handleCategoryNameChange}
                />
              </SortableCategoryItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {editor.isEditMode && (
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