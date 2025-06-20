// frontend/src/app/shop/[Shopid]/components/SortableItems.tsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

interface SortableItemProps {
  id: string | number;
  children: React.ReactNode;
  disabled: boolean;
}

export function SortableCategoryItem({ id, children, disabled }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : "auto",
    opacity: isDragging ? 0.9 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-xl shadow-md">
      <div className="flex items-start p-4">
        {!disabled && (
          <span {...attributes} {...listeners} className="p-1 cursor-grab touch-none text-gray-500 mr-2">⠿</span>
        )}
        {disabled && <div className="w-8"></div>}
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}

export function SortableOptionItem({ id, children, disabled }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : "auto",
    opacity: isDragging ? 0.9 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 w-full bg-gray-50 p-2 rounded-md">
      {!disabled && (
        <span {...attributes} {...listeners} className="cursor-grab touch-none text-gray-500">⠿</span>
      )}
      <div className="w-full">{children}</div>
    </div>
  );
}