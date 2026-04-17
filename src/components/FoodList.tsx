'use client';

import { useCalorie } from '@/context/CalorieContext';

export default function FoodList() {
  const { dailyData, removeFood } = useCalorie();
  const { records } = dailyData;

  if (records.length === 0) {
    return (
      <div className="bg-card-bg rounded-2xl p-4 shadow-sm">
        <div className="text-[13px] font-bold text-orange-dark mb-3">🍴 오늘 먹은 것</div>
        <p className="text-sm text-text-muted text-center py-4">
          아직 기록이 없어요. 음식을 추가해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card-bg rounded-2xl p-4 shadow-sm">
      <div className="text-[13px] font-bold text-orange-dark mb-3">🍴 오늘 먹은 것</div>
      <div className="space-y-0">
        {records.map((record, idx) => (
          <div
            key={record.id}
            className={`flex items-center justify-between py-3 ${
              idx < records.length - 1 ? 'border-b border-divider' : ''
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  record.tag === 'good'
                    ? 'bg-green-main'
                    : record.tag === 'caution'
                    ? 'bg-red-warn'
                    : 'bg-gray-300'
                }`}
              />
              <span className="text-sm text-text-primary truncate">{record.foodName}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm text-text-muted font-semibold">
                {record.calories} kcal
              </span>
              <button
                onClick={() => removeFood(record.id)}
                className="text-text-muted/50 hover:text-red-warn text-lg leading-none transition-colors"
                aria-label={`${record.foodName} 삭제`}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
