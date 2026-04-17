'use client';

import { useCalorie } from '@/context/CalorieContext';

const QUICK_ITEMS = [
  { name: '밥 한 공기', calories: 300, emoji: '🍚' },
  { name: '계란 1개', calories: 80, emoji: '🥚' },
  { name: '우유 한 잔', calories: 130, emoji: '🥛' },
  { name: '사과 1개', calories: 95, emoji: '🍎' },
  { name: '아메리카노', calories: 10, emoji: '☕' },
  { name: '고구마 1개', calories: 140, emoji: '🍠' },
];

export default function QuickAddChips() {
  const { addFood } = useCalorie();

  return (
    <div className="bg-card-bg rounded-2xl p-4 shadow-sm">
      <div className="text-[13px] font-bold text-green-dark mb-3">⚡ 빠른 추가</div>
      <div className="flex gap-2 flex-wrap">
        {QUICK_ITEMS.map((item) => (
          <button
            key={item.name}
            onClick={() => addFood(item.name, item.calories, 'normal', 'quick')}
            className="px-3 py-2 bg-gradient-to-br from-[#E8F5E9] to-[#FFF8E1] rounded-full text-[13px] text-text-primary active:scale-95 transition-transform"
          >
            {item.emoji} {item.name} +{item.calories}
          </button>
        ))}
      </div>
    </div>
  );
}
