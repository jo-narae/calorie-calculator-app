'use client';

import { useState } from 'react';
import { useCalorie } from '@/context/CalorieContext';
import { ActivityLevel, Gender } from '@/types';
import { calculateTDEE } from '@/lib/tdee';

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: 'sedentary', label: '거의 안 움직임', desc: '하루 종일 앉아있음' },
  { value: 'light', label: '가벼운 활동', desc: '가벼운 운동 주 1~3회' },
  { value: 'moderate', label: '보통 활동', desc: '운동 주 3~5회' },
  { value: 'active', label: '활발한 활동', desc: '운동 주 6~7회' },
  { value: 'very_active', label: '매우 활발', desc: '강도 높은 운동 매일' },
];

export default function ProfileSetup() {
  const { setProfile } = useCalorie();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>('female');
  const [activity, setActivity] = useState<ActivityLevel>('moderate');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const h = Number(height);
    const w = Number(weight);
    const a = Number(age);
    if (!h || !w || !a) return;

    const tdee = calculateTDEE(h, w, a, gender, activity);
    setProfile({ height: h, weight: w, age: a, gender, activity, tdee });
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary">
            오늘의 <span className="text-orange-dark">칼로리</span>
          </h1>
          <p className="mt-2 text-text-muted text-sm">
            프로필을 입력하면 일일 목표 칼로리를 계산해드려요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 성별 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setGender('female')}
              className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all ${
                gender === 'female'
                  ? 'bg-gradient-to-br from-green-main/20 to-orange-main/10 text-green-dark ring-2 ring-green-main/30'
                  : 'bg-card-bg text-text-muted shadow-sm'
              }`}
            >
              👩 여성
            </button>
            <button
              type="button"
              onClick={() => setGender('male')}
              className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all ${
                gender === 'male'
                  ? 'bg-gradient-to-br from-green-main/20 to-orange-main/10 text-green-dark ring-2 ring-green-main/30'
                  : 'bg-card-bg text-text-muted shadow-sm'
              }`}
            >
              👨 남성
            </button>
          </div>

          {/* 키/몸무게/나이 */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-1 ml-1">키 (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="165"
                className="w-full px-4 py-3 bg-card-bg rounded-2xl text-center text-lg font-semibold text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-green-main/30"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1 ml-1">몸무게 (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="60"
                className="w-full px-4 py-3 bg-card-bg rounded-2xl text-center text-lg font-semibold text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-green-main/30"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1 ml-1">나이</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="28"
                className="w-full px-4 py-3 bg-card-bg rounded-2xl text-center text-lg font-semibold text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-green-main/30"
                required
              />
            </div>
          </div>

          {/* 활동량 */}
          <div>
            <label className="block text-xs text-text-muted mb-2 ml-1">활동량</label>
            <div className="space-y-2">
              {ACTIVITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setActivity(opt.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-all ${
                    activity === opt.value
                      ? 'bg-gradient-to-br from-green-main/20 to-orange-main/10 text-green-dark ring-2 ring-green-main/30'
                      : 'bg-card-bg text-text-primary shadow-sm'
                  }`}
                >
                  <span className="font-semibold">{opt.label}</span>
                  <span className={activity === opt.value ? 'text-green-dark/70' : 'text-text-muted'}>
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 시작 버튼 */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl text-white font-bold text-base bg-gradient-to-r from-green-main to-orange-main shadow-lg shadow-green-main/30 active:scale-[0.98] transition-transform"
          >
            시작하기 🚀
          </button>
        </form>
      </div>
    </div>
  );
}
