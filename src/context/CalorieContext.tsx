'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { UserProfile, DailyData, FoodRecord, HealthTag } from '@/types';
import {
  loadProfile,
  saveProfile,
  loadDailyData,
  saveDailyData,
  addFoodRecord,
  removeFoodRecord,
} from '@/lib/storage';

interface CalorieContextValue {
  profile: UserProfile | null;
  dailyData: DailyData;
  totalCalories: number;
  remainingCalories: number;
  setProfile: (profile: UserProfile) => void;
  addFood: (name: string, calories: number, tag: HealthTag, source: FoodRecord['source']) => void;
  removeFood: (recordId: string) => void;
  isLoaded: boolean;
}

const CalorieContext = createContext<CalorieContextValue | null>(null);

export function CalorieProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [dailyData, setDailyData] = useState<DailyData>({
    date: '',
    targetCalories: 0,
    records: [],
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedProfile = loadProfile();
    setProfileState(savedProfile);

    const target = savedProfile?.tdee ?? 2000;
    const savedDaily = loadDailyData(target);
    setDailyData(savedDaily);
    setIsLoaded(true);
  }, []);

  const totalCalories = dailyData.records.reduce(
    (sum, r) => sum + r.calories,
    0
  );
  const remainingCalories = dailyData.targetCalories - totalCalories;

  function handleSetProfile(p: UserProfile) {
    setProfileState(p);
    saveProfile(p);
    const updated = { ...dailyData, targetCalories: p.tdee };
    setDailyData(updated);
    saveDailyData(updated);
  }

  function handleAddFood(
    name: string,
    calories: number,
    tag: HealthTag,
    source: FoodRecord['source']
  ) {
    const record: FoodRecord = {
      id: crypto.randomUUID(),
      foodName: name,
      calories,
      tag,
      addedAt: new Date().toISOString(),
      source,
    };
    setDailyData((prev) => addFoodRecord(prev, record));
  }

  function handleRemoveFood(recordId: string) {
    setDailyData((prev) => removeFoodRecord(prev, recordId));
  }

  return (
    <CalorieContext.Provider
      value={{
        profile,
        dailyData,
        totalCalories,
        remainingCalories,
        setProfile: handleSetProfile,
        addFood: handleAddFood,
        removeFood: handleRemoveFood,
        isLoaded,
      }}
    >
      {children}
    </CalorieContext.Provider>
  );
}

export function useCalorie() {
  const ctx = useContext(CalorieContext);
  if (!ctx) throw new Error('useCalorie must be used within CalorieProvider');
  return ctx;
}
