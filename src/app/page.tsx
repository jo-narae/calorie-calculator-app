'use client';

import { useState } from 'react';
import { useCalorie } from '@/context/CalorieContext';
import ProfileSetup from '@/components/ProfileSetup';
import CalorieRing from '@/components/CalorieRing';
import CommentCard from '@/components/CommentCard';
import StatCards from '@/components/StatCards';
import QuickAddChips from '@/components/QuickAddChips';
import FoodList from '@/components/FoodList';
import RecommendSection from '@/components/RecommendSection';
import AddFoodModal from '@/components/AddFoodModal';

export default function Home() {
  const { profile, isLoaded, dailyData, totalCalories, remainingCalories } = useCalorie();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex flex-1 items-center justify-center bg-bg-primary">
        <p className="text-text-muted">로딩 중...</p>
      </div>
    );
  }

  if (!profile) {
    return <ProfileSetup />;
  }

  return (
    <div className="flex flex-col flex-1 bg-bg-primary pb-24">
      <div className="w-full max-w-md mx-auto px-4 py-6 space-y-4">
        {/* 헤더 */}
        <h1 className="text-lg font-bold text-text-primary">
          오늘의 <span className="text-orange-dark">칼로리</span>
        </h1>

        {/* 한 줄 코멘트 */}
        <CommentCard
          remaining={remainingCalories}
          total={dailyData.targetCalories}
        />

        {/* 메인 칼로리 링 */}
        <div className="bg-gradient-to-br from-[#E8F5E9] to-[#F1F8E9] rounded-3xl py-6 px-5">
          <CalorieRing
            remaining={remainingCalories}
            total={dailyData.targetCalories}
            consumed={totalCalories}
          />
          <p className="text-center text-sm text-text-secondary mt-3">
            {totalCalories.toLocaleString()} / {dailyData.targetCalories.toLocaleString()} kcal 섭취
          </p>
        </div>

        {/* 통계 카드 */}
        <StatCards
          target={dailyData.targetCalories}
          consumed={totalCalories}
        />

        {/* 빠른 추가 */}
        <QuickAddChips />

        {/* 오늘 먹은 것 */}
        <FoodList />

        {/* 추천 음식 */}
        <RecommendSection />
      </div>

      {/* FAB 버튼 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-green-main to-orange-main text-white text-3xl font-bold shadow-lg shadow-green-main/40 active:scale-95 transition-transform flex items-center justify-center"
        >
          +
        </button>
      </div>

      {/* 음식 추가 모달 */}
      <AddFoodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
