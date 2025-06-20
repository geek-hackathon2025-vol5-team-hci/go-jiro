// frontend/src/app/shop/[Shopid]/hooks/useShopEditor.ts
"use client";

import { useState } from 'react';
import { Shop, CallRule } from '../types';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export const useShopEditor = (shop: Shop, shopId: string) => {
  const [savedTicketCategories, setSavedTicketCategories] = useState<string[]>(
    shop.callticketOrder.split(",").filter(v => v).map((v) => v.trim())
  );
  const [savedToppingCategories, setSavedToppingCategories] = useState<string[]>(
    shop.callOrder.split(",").filter(v => v).map((v) => v.trim())
  );
  const [editableTicketCategories, setEditableTicketCategories] = useState<string[]>(savedTicketCategories);
  const [editableToppingCategories, setEditableToppingCategories] = useState<string[]>(savedToppingCategories);

  const [newOptions, setNewOptions] = useState<Record<string, { option: string; callText: string }>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [savedRules, setSavedRules] = useState<CallRule[]>(
    [...shop.callRules].sort((a, b) => (a.optionOrder ?? 0) - (b.optionOrder ?? 0))
  );
  const [editableRules, setEditableRules] = useState<CallRule[]>(savedRules);
  
  const [activeAddFormCategory, setActiveAddFormCategory] = useState<string | null>(null);
  const [activeEditId, setActiveEditId] = useState<number | null>(null);
  const [addCategoryFor, setAddCategoryFor] = useState<'ticket' | 'topping' | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newFirstOption, setNewFirstOption] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const onOptionChange = (id: number, newOption: string) =>
    setEditableRules((prev) => prev.map((r) => (r.id === id ? { ...r, option: newOption } : r)));
  const onCallTextChange = (id: number, newText: string) =>
    setEditableRules((prev) => prev.map((r) => (r.id === id ? { ...r, callText: newText } : r)));

  const handleAddOptionInline = (category: string) => {
    const { option, callText } = newOptions[category] || { option: "", callText: "" };
    if (!option) return;
    const newId = Math.max(0, ...editableRules.map((r) => r.id), 0) + 1;
    const newRule: CallRule = { id: newId, shopId: shop.id, category, option, callText };
    setEditableRules((prev) => [...prev, newRule]);
    setNewOptions((prev) => ({ ...prev, [category]: { option: "", callText: "" }}));
  };
  
  const handleAddCategory = (type: 'ticket' | 'topping') => {
    if (!newCategoryName || !newFirstOption) {
      alert('カテゴリー名と最初のオプション名を入力してください。');
      return;
    }
    const allEditableCategories = [...editableTicketCategories, ...editableToppingCategories];
    if (allEditableCategories.includes(newCategoryName)) {
      alert('そのカテゴリー名は既に使用されています。');
      return;
    }

    if (type === 'ticket') {
      setEditableTicketCategories((prev) => [...prev, newCategoryName]);
    } else {
      setEditableToppingCategories((prev) => [...prev, newCategoryName]);
    }

    const newId = Math.max(0, ...editableRules.map((r) => r.id), 0) + 1;
    const newRule: CallRule = {
      id: newId, shopId: shop.id, category: newCategoryName,
      option: newFirstOption, callText: newFirstOption, optionOrder: 0
    };
    setEditableRules((prev) => [...prev, newRule]);

    setNewCategoryName('');
    setNewFirstOption('');
    setAddCategoryFor(null);
  };

  const handleDeleteOption = (id: number) =>
    setEditableRules((prev) => prev.filter((r) => r.id !== id));
    
  const handleDeleteCategory = (categoryToDelete: string) => {
    if (!window.confirm(`「${categoryToDelete}」カテゴリーをすべてのオプションと一緒に削除します。よろしいですか？`)) {
      return;
    }
    setEditableTicketCategories(prev => prev.filter(c => c !== categoryToDelete));
    setEditableToppingCategories(prev => prev.filter(c => c !== categoryToDelete));
    setEditableRules(prev => prev.filter(rule => rule.category !== categoryToDelete));
  };
    
  const handleCategoryNameChange = (oldName: string, newName: string) => {
    setEditableTicketCategories(prev => prev.map(c => (c === oldName ? newName : c)));
    setEditableToppingCategories(prev => prev.map(c => (c === oldName ? newName : c)));
    setEditableRules(prev => prev.map(rule => rule.category === oldName ? { ...rule, category: newName } : rule));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    const updatedRules = [...editableRules];
    const rulesByCategory = updatedRules.reduce((acc, rule) => {
      (acc[rule.category] = acc[rule.category] || []).push(rule);
      return acc;
    }, {} as Record<string, CallRule[]>);

    Object.values(rulesByCategory).forEach(rules => {
      rules.forEach((rule, index) => {
        rule.optionOrder = index;
      });
    });

    const ticketOrderString = editableTicketCategories.join(',');
    const toppingOrderString = editableToppingCategories.join(',');

    const payload = {
      callticketOrder: ticketOrderString,
      callOrder: toppingOrderString,
      callRules: updatedRules,
    };

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/api/shops/${shopId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('データベースの保存に失敗しました。');

      setSavedRules([...updatedRules]);
      setSavedTicketCategories([...editableTicketCategories]);
      setSavedToppingCategories([...editableToppingCategories]);
      
      setIsEditMode(false);
      setActiveEditId(null);
      alert('保存しました！');

    } catch (error) {
      console.error(error);
      alert('エラーが発生しました。変更は保存されていません。');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditableRules([...savedRules]);
    setEditableTicketCategories([...savedTicketCategories]);
    setEditableToppingCategories([...savedToppingCategories]);
    setIsEditMode(false);
    setActiveEditId(null);
    setAddCategoryFor(null);
  };

  const handleOptionDragEnd = (event: DragEndEvent, category: string) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setEditableRules((rules) => {
        const categoryOptions = rules.filter((r) => r.category === category);
        const otherOptions = rules.filter((r) => r.category !== category);
        const oldIndex = categoryOptions.findIndex((r) => r.id === active.id);
        const newIndex = categoryOptions.findIndex((r) => r.id === over.id);
        const reorderedCategoryOptions = arrayMove(categoryOptions, oldIndex, newIndex);
        return [...otherOptions, ...reorderedCategoryOptions];
      });
    }
  };

  const handleCategoryDragEnd = (event: DragEndEvent, type: "ticket" | "topping") => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const reorderFn = (items: string[]) => arrayMove(items, items.indexOf(active.id as string), items.indexOf(over.id as string));
      if (type === "ticket") {
        setEditableTicketCategories(reorderFn);
      } else {
        setEditableToppingCategories(reorderFn);
      }
    }
  };

  return {
    isEditMode, editableRules, editableTicketCategories, editableToppingCategories,
    savedRules, savedTicketCategories, savedToppingCategories,
    newOptions, activeAddFormCategory, activeEditId, addCategoryFor,
    newCategoryName, newFirstOption, isSaving,
    setIsEditMode, setNewOptions, setActiveAddFormCategory, setActiveEditId,
    setAddCategoryFor, setNewCategoryName, setNewFirstOption,
    onOptionChange, onCallTextChange, handleAddOptionInline, handleAddCategory,
    handleDeleteOption, handleCategoryNameChange, handleSave, handleCancel,
    handleOptionDragEnd, handleCategoryDragEnd,handleDeleteCategory
  };
};