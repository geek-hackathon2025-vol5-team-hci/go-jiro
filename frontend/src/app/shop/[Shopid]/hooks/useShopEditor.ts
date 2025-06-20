// shop/[Shopid]/hooks/useShopEditor.ts
import { useState } from 'react';
import { Shop, CallRule } from '../types';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

/**
 * 店舗情報ページの編集に関するすべてのロジックと状態を管理するカスタムフック
 * @param shop - 初期表示用の店舗データ
 * @param shopId - 現在の店舗ID
 */
export const useShopEditor = (shop: Shop, shopId: string) => {
  // --- STATE DEFINITIONS ---

  // カテゴリーの並び順を管理するState
  const [savedTicketCategories, setSavedTicketCategories] = useState<string[]>(
    shop.callticketOrder.split(",").filter(v => v).map((v) => v.trim())
  );
  const [savedToppingCategories, setSavedToppingCategories] = useState<string[]>(
    shop.callOrder.split(",").filter(v => v).map((v) => v.trim())
  );
  const [editableTicketCategories, setEditableTicketCategories] = useState<string[]>(savedTicketCategories);
  const [editableToppingCategories, setEditableToppingCategories] = useState<string[]>(savedToppingCategories);

  // オプションのルール全体を管理するState
  const [savedRules, setSavedRules] = useState<CallRule[]>(
    [...shop.callRules].sort((a, b) => (a.optionOrder ?? 0) - (b.optionOrder ?? 0))
  );
  const [editableRules, setEditableRules] = useState<CallRule[]>(savedRules);

  // UIの制御用State
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeEditId, setActiveEditId] = useState<number | null>(null);
  
  // オプション追加用のState
  const [activeAddFormCategory, setActiveAddFormCategory] = useState<string | null>(null);
  const [newOptions, setNewOptions] = useState<Record<string, { option: string; callText: string }>>({});
  
  // 新規カテゴリー追加用のState
  const [addCategoryFor, setAddCategoryFor] = useState<'ticket' | 'topping' | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newFirstOption, setNewFirstOption] = useState('');

  // --- HANDLERS ---

  const onCategoryChange = (id: number, newCategory: string) =>
    setEditableRules((prev) => prev.map((r) => (r.id === id ? { ...r, category: newCategory } : r)));

  const onOptionChange = (id: number, newOption: string) =>
    setEditableRules((prev) => prev.map((r) => (r.id === id ? { ...r, option: newOption } : r)));

  const onCallTextChange = (id: number, newText: string) =>
    setEditableRules((prev) => prev.map((r) => (r.id === id ? { ...r, callText: newText } : r)));

  const handleAddOptionInline = (category: string) => {
    const { option, callText } = newOptions[category] || { option: "", callText: "" };
    if (!option) return;
    const newId = Math.max(0, ...editableRules.map((r) => r.id)) + 1;
    const newRule: CallRule = { id: newId, shopId: String(shopId), category, option, callText };
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
    if (type === 'ticket') setEditableTicketCategories((prev) => [...prev, newCategoryName]);
    else setEditableToppingCategories((prev) => [...prev, newCategoryName]);
    const newId = Math.max(0, ...editableRules.map((r) => r.id)) + 1;
    const newRule: CallRule = {
      id: newId, shopId: String(shopId), category: newCategoryName,
      option: newFirstOption, callText: newFirstOption, optionOrder: 0
    };
    setEditableRules((prev) => [...prev, newRule]);
    setNewCategoryName('');
    setNewFirstOption('');
    setAddCategoryFor(null);
  };

  const handleDeleteOption = (id: number) =>
    setEditableRules((prev) => prev.filter((r) => r.id !== id));

  /**
   * カテゴリー名を変更する
   * @param oldCategory - 変更前のカテゴリー名
   * @param newCategory - 変更後のカテゴリー名
   */
  const handleCategoryNameChange = (oldCategory: string, newCategory: string) => {
    const trimmedNewCategory = newCategory.trim();
    if (!trimmedNewCategory) {
      alert('カテゴリー名を入力してください。');
      return;
    }
  }
  /**
   * 編集内容をDBに保存する
   */
  const handleSave = async () => {
    setIsSaving(true); // 保存処理開始
    
    // Step 1: 送信データの準備
    const updatedRules = [...editableRules];
    // カテゴリごとにルールをグループ化
    const rulesByCategory = updatedRules.reduce((acc, rule) => {
      (acc[rule.category] = acc[rule.category] || []).push(rule);
      return acc;
    }, {} as Record<string, CallRule[]>);

    // 各カテゴリ内でoptionOrderを0から再採番する
    Object.values(rulesByCategory).forEach(rules => {
      rules.forEach((rule, index) => {
        rule.optionOrder = index;
      });
    });

    // カテゴリの並び順をカンマ区切りの文字列に戻す
    const ticketOrderString = editableTicketCategories.join(',');
    const toppingOrderString = editableToppingCategories.join(',');

    // Step 2: APIへ送信するデータ（ペイロード）を作成
    const payload = {
      callticketOrder: ticketOrderString,
      callOrder: toppingOrderString,
      callRules: updatedRules,
    };

    // Step 3: APIを呼び出し、DBに保存
    try {
    // 環境変数からAPIのベースURLを読み込む
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    // fetchリクエストを修正
    const response = await fetch(`${apiBaseUrl}/api/shops/${shopId}`, {
      method: 'PUT',//置き換えによってページ更新
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include', // Cookieをリクエストに含める
    });

      if (!response.ok) throw new Error('データベースの保存に失敗しました。');

      // Step 4: 保存成功時の処理
      // ローカルの "保存済み" Stateを更新
      setSavedRules(updatedRules);
      setSavedTicketCategories(editableTicketCategories);
      setSavedToppingCategories(editableToppingCategories);
      
      // 編集モードを終了
      setIsEditMode(false);
      setActiveEditId(null);
      alert('保存しました！');

    } catch (error) {
      console.error(error);
      alert('エラーが発生しました。変更は保存されていません。');
    } finally {
      setIsSaving(false); // 保存処理終了
    }
  };

  /**
   * 編集をキャンセルし、保存前の状態に戻す
   */
  const handleCancel = () => {
    // 全ての編集中Stateを保存済みStateに戻す
    setEditableRules(savedRules);
    setEditableTicketCategories(savedTicketCategories);
    setEditableToppingCategories(savedToppingCategories);
    
    // UIの状態をリセット
    setIsEditMode(false);
    setActiveEditId(null);
    setAddCategoryFor(null);
  };

  /**
   * オプションのドラッグ＆ドロップ終了時の処理
   * @param event - D&Dイベントオブジェクト
   * @param category - 対象のカテゴリー名
   */
  const handleOptionDragEnd = (event: DragEndEvent, category: string) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setEditableRules((rules) => {
        const categoryOptions = rules.filter((r) => r.category === category);
        const otherOptions = rules.filter((r) => r.category !== category);
        const oldIndex = categoryOptions.findIndex((r) => r.id === active.id);
        const newIndex = categoryOptions.findIndex((r) => r.id === over.id);
        // 配列の並び順を変更
        const reorderedCategoryOptions = arrayMove(categoryOptions, oldIndex, newIndex);
        // 他のカテゴリーのオプションと結合して新しいルールリストを作成
        return [...otherOptions, ...reorderedCategoryOptions];
      });
    }
  };

  /**
   * カテゴリーのドラッグ＆ドロップ終了時の処理
   * @param event - D&Dイベントオブジェクト
   * @param type - 対象のセクション ('ticket' | 'topping')
   */
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
    onCategoryChange, onOptionChange, onCallTextChange, handleAddOptionInline, handleAddCategory,
    handleDeleteOption, handleSave, handleCancel, handleOptionDragEnd, handleCategoryDragEnd,
    handleCategoryNameChange,
  };
};