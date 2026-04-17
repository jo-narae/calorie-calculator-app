'use client';

import { useCalorie } from '@/context/CalorieContext';
import { getRecommendations } from '@/lib/recommend';

export default function RecommendSection() {
  const { remainingCalories, addFood } = useCalorie();
  const recommendations = getRecommendations(remainingCalories);

  if (recommendations.length === 0) {
    return (
      <div className="bg-card-bg rounded-2xl p-4 shadow-sm">
        <div className="text-[13px] font-bold text-green-dark mb-3">🌿 추천 음식</div>
        <p className="text-sm text-text-muted text-center py-4">
          {remainingCalories <= 0
            ? '오늘 목표를 초과했어요. 내일 다시 도전!'
            : '추천할 음식이 없어요.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card-bg rounded-2xl p-4 shadow-sm">
      <div className="text-[13px] font-bold text-green-dark mb-3">
        🌿 추천 음식 ({remainingCalories.toLocaleString()}kcal 이내)
      </div>
      <div className="space-y-2">
        {recommendations.map((food) => (
          <button
            key={food.id}
            onClick={() => addFood(food.name, food.calories, food.tag, 'search')}
            className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-br from-[#F1F8E9] to-[#FFFDE7] rounded-xl active:scale-[0.98] transition-transform"
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
            </div>
            <span className="text-[13px] text-green-dark font-semibold">
              {food.calories} kcal
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
