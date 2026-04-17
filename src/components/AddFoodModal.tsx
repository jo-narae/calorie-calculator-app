'use client';

import { useState } from 'react';
import { useCalorie } from '@/context/CalorieContext';
import { searchFoods } from '@/lib/search';
import { FoodItem } from '@/types';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddFoodModal({ isOpen, onClose }: AddFoodModalProps) {
  const { addFood } = useCalorie();
  const [tab, setTab] = useState<'search' | 'manual'>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);

  // 수동 입력
  const [manualName, setManualName] = useState('');
  const [manualCal, setManualCal] = useState('');

  function handleSearch(value: string) {
    setQuery(value);
    if (value.trim()) {
      setResults(searchFoods(value));
    } else {
      setResults([]);
    }
  }

  function handleSelectFood(food: FoodItem) {
    addFood(food.name, food.calories, food.tag, 'search');
    setQuery('');
    setResults([]);
    onClose();
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cal = Number(manualCal);
    if (!manualName.trim() || !cal) return;
    addFood(manualName.trim(), cal, 'normal', 'manual');
    setManualName('');
    setManualCal('');
    onClose();
  }

  if (!isOpen) return null;

  return (
    <>
      {/* 백드롭 */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* 모달 시트 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-bg-primary rounded-t-3xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-text-muted/30 rounded-full" />
        </div>

        {/* 탭 */}
        <div className="flex mx-4 mb-3 bg-card-bg rounded-2xl p-1 shadow-sm">
          <button
            onClick={() => setTab('search')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === 'search'
                ? 'bg-gradient-to-r from-green-main to-orange-main text-white'
                : 'text-text-muted'
            }`}
          >
            🔍 검색
          </button>
          <button
            onClick={() => setTab('manual')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === 'manual'
                ? 'bg-gradient-to-r from-green-main to-orange-main text-white'
                : 'text-text-muted'
            }`}
          >
            ✏️ 수동 입력
          </button>
        </div>

        {/* 검색 탭 */}
        {tab === 'search' && (
          <div className="flex-1 overflow-y-auto px-4 pb-8">
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="음식 이름을 검색하세요"
              autoFocus
              className="w-full px-4 py-3 bg-card-bg rounded-2xl text-sm text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-green-main/30 mb-3"
            />

            {query.trim() && results.length === 0 && (
              <p className="text-center text-text-muted text-sm py-6">
                검색 결과가 없어요. 수동 입력을 이용해보세요.
              </p>
            )}

            <div className="space-y-2">
              {results.map((food) => (
                <button
                  key={food.id}
                  onClick={() => handleSelectFood(food)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-card-bg rounded-2xl shadow-sm active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        food.tag === 'good'
                          ? 'bg-green-main'
                          : food.tag === 'caution'
                          ? 'bg-red-warn'
                          : 'bg-gray-300'
                      }`}
                    />
                    <span className="text-sm text-text-primary">{food.name}</span>
                    <span className="text-xs text-text-muted">{food.category}</span>
                  </div>
                  <span className="text-sm text-text-muted font-semibold">
                    {food.calories} kcal
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 수동 입력 탭 */}
        {tab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="px-4 pb-8 space-y-3">
            <input
              type="text"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="음식 이름"
              autoFocus
              className="w-full px-4 py-3 bg-card-bg rounded-2xl text-sm text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-green-main/30"
              required
            />
            <input
              type="number"
              value={manualCal}
              onChange={(e) => setManualCal(e.target.value)}
              placeholder="칼로리 (kcal)"
              className="w-full px-4 py-3 bg-card-bg rounded-2xl text-sm text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-green-main/30"
              required
            />
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl text-white font-bold text-sm bg-gradient-to-r from-green-main to-orange-main shadow-lg shadow-green-main/30 active:scale-[0.98] transition-transform"
            >
              추가하기
            </button>
          </form>
        )}
      </div>
    </>
  );
}
