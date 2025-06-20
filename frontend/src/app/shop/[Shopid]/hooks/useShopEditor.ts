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
  // "saved"はDBに保存済みの状態、"editable"はユーザーが編集中の一時的な状態
  const [savedTicketCategories, setSavedTicketCategories] = useState<string[]>(
    shop.callticketOrder.split(",").filter(v => v).map((v) => v.trim())
  );
  const [savedToppingCategories, setSavedToppingCategories] = useState<string[]>(
    shop.callOrder.split(",").filter(v => v).map((v) => v.trim())
  );
  const [editableTicketCategories, setEditableTicketCategories] = useState<string[]>(savedTicketCategories);
  const [editableToppingCategories, setEditableToppingCategories] = useState<string[]>(savedToppingCategories);

  // オプションのルール全体を管理するState
  // "saved"はDBに保存済みの状態、"editable"はユーザーが編集中の一時的な状態
  const [newOptions, setNewOptions] = useState<Record<string, { option: string; callText: string }>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  
  // 初期表示時にDBから取得したoptionOrderでソートする
  const [savedRules, setSavedRules] = useState<CallRule[]>(
    [...shop.callRules].sort((a, b) => (a.optionOrder ?? 0) - (b.optionOrder ?? 0))
  );
  const [editableRules, setEditableRules] = useState<CallRule[]>(savedRules);
  
  // UIの制御用State
  const [activeAddFormCategory, setActiveAddFormCategory] = useState<string | null>(null); // オプション追加フォームを表示するカテゴリ名
  const [activeEditId, setActiveEditId] = useState<number | null>(null); // インライン編集中のオプションID

  // 新規カテゴリー追加用のUI制御State
  const [addCategoryFor, setAddCategoryFor] = useState<'ticket' | 'topping' | null>(null); // カテゴリ追加フォームの表示対象
  const [newCategoryName, setNewCategoryName] = useState(''); // 新規カテゴリ名入力
  const [newFirstOption, setNewFirstOption] = useState(''); // 新規カテゴリの最初のオプション名入力

  // DB保存処理中のローディング状態
  const [isSaving, setIsSaving] = useState(false);

  // --- HANDLERS ---

  // オプション名のインライン編集
  const onOptionChange = (id: number, newOption: string) =>
    setEditableRules((prev) => prev.map((r) => (r.id === id ? { ...r, option: newOption } : r)));
  
  // コール文言のインライン編集
  const onCallTextChange = (id: number, newText: string) =>
    setEditableRules((prev) => prev.map((r) => (r.id === id ? { ...r, callText: newText } : r)));

  /**
   * 既存のカテゴリーに新しいオプションを追加する
   * @param category - オプションを追加する対象のカテゴリー名
   */
  const handleAddOptionInline = (category: string) => {
    const { option, callText } = newOptions[category] || { option: "", callText: "" };
    if (!option) return; // オプション名が空なら何もしない
    // 新しいIDを生成（既存のIDの最大値+1）
    const newId = Math.max(0, ...editableRules.map((r) => r.id)) + 1;
    const newRule: CallRule = { id: newId, shopId: shop.id, category, option, callText };
    // 編集中ルールリストの末尾に追加
    setEditableRules((prev) => [...prev, newRule]);
    // 入力フォームをクリア
    setNewOptions((prev) => ({ ...prev, [category]: { option: "", callText: "" }}));
  };
  
  /**
   * 新しいカテゴリーと、その最初のオプションを追加する
   * @param type - 'ticket' | 'topping' 追加先のセクション
   */
  const handleAddCategory = (type: 'ticket' | 'topping') => {
    // 入力値の検証
    if (!newCategoryName || !newFirstOption) {
      alert('カテゴリー名と最初のオプション名を入力してください。');
      return;
    }
    const allEditableCategories = [...editableTicketCategories, ...editableToppingCategories];
    if (allEditableCategories.includes(newCategoryName)) {
      alert('そのカテゴリー名は既に使用されています。');
      return;
    }

    // カテゴリーリストを更新
    if (type === 'ticket') {
      setEditableTicketCategories((prev) => [...prev, newCategoryName]);
    } else {
      setEditableToppingCategories((prev) => [...prev, newCategoryName]);
    }

    // 新しいルール（最初のオプション）を作成
    const newId = Math.max(0, ...editableRules.map((r) => r.id)) + 1;
    const newRule: CallRule = {
      id: newId, shopId: shop.id, category: newCategoryName,
      option: newFirstOption, callText: newFirstOption, optionOrder: 0
    };
    // 編集中ルールリストに追加
    setEditableRules((prev) => [...prev, newRule]);

    // 入力フォームをリセット
    setNewCategoryName('');
    setNewFirstOption('');
    setAddCategoryFor(null);
  };

  /**
   * 指定されたIDのオプションを削除する
   * @param id - 削除するオプションのID
   */
  const handleDeleteOption = (id: number) =>
    setEditableRules((prev) => prev.filter((r) => r.id !== id));

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

  // コンポーネント側で利用するStateと関数をすべて返す
  return {
    // State
    isEditMode, editableRules, editableTicketCategories, editableToppingCategories,
    savedRules, savedTicketCategories, savedToppingCategories,
    newOptions, activeAddFormCategory, activeEditId, addCategoryFor,
    newCategoryName, newFirstOption, isSaving,

    // State Setters
    setIsEditMode, setNewOptions, setActiveAddFormCategory, setActiveEditId,
    setAddCategoryFor, setNewCategoryName, setNewFirstOption,

    // Handlers
    onOptionChange, onCallTextChange, handleAddOptionInline, handleAddCategory,
    handleDeleteOption, handleSave, handleCancel, handleOptionDragEnd, handleCategoryDragEnd,
  };
};