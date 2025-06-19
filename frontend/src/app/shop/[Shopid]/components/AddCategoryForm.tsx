// components/AddCategoryForm.tsx
import React from 'react';

interface AddCategoryFormProps {
  type: 'ticket' | 'topping';
  newCategoryName: string;
  setNewCategoryName: (value: string) => void;
  newFirstOption: string;
  setNewFirstOption: (value: string) => void;
  onAdd: (type: 'ticket' | 'topping') => void;
  onCancel: () => void;
}

export const AddCategoryForm = ({
  type, newCategoryName, setNewCategoryName,
  newFirstOption, setNewFirstOption,
  onAdd, onCancel
}: AddCategoryFormProps) => {
  return (
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
            onClick={() => onAdd(type)}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
          >
            追加
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 px-3 py-1 rounded text-sm"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};