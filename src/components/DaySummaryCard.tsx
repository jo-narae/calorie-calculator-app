'use client';

import { DaySummary } from '@/types';

interface DaySummaryCardProps {
  summary: DaySummary;
  onDismiss: () => void;
}

export default function DaySummaryCard({ summary, onDismiss }: DaySummaryCardProps) {
  const isGood = summary.achievementRate <= 105;

  return (
    <div className="relative bg-gradient-to-br from-[#FFF8E1] to-[#F1F8E9] rounded-2xl p-4 shadow-sm">
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 text-text-muted/50 hover:text-text-primary text-lg leading-none"
        aria-label="닫기"
      >
        ×
      </button>

      <div className="text-[13px] font-bold text-orange-dark mb-3">
        📊 어제 요약
      </div>

      <div className="text-center mb-3">
        <span className={`text-3xl font-extrabold ${isGood ? 'text-green-dark' : 'text-red-warn'}`}>
          {summary.totalCalories.toLocaleString()}
        </span>
        <span className="text-sm text-text-muted ml-1">kcal 섭취</span>
      </div>

      <div className="text-center text-sm text-text-secondary mb-3">
        목표 대비 <span className={`font-bold ${isGood ? 'text-green-dark' : 'text-red-warn'}`}>
          {summary.achievementRate}%
        </span> 달성
      </div>

      <div className="flex justify-center gap-6 text-xs text-text-muted">
        <div className="text-center">
          <div className="text-lg font-bold text-text-primary">{summary.foodCount}</div>
          <div>먹은 음식</div>
        </div>
        {summary.highestFood && (
          <div className="text-center">
            <div className="text-lg font-bold text-text-primary truncate max-w-[120px]">
              {summary.highestFood}
            </div>
            <div>최고 칼로리</div>
          </div>
        )}
      </div>
    </div>
  );
}
