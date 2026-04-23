'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { UserProfile, DailyData, DaySummary, FoodRecord, HealthTag } from '@/types';
import { supabase } from '@/lib/supabase';
import {
  loadProfile,
  saveProfile,
  loadDailyData,
  addFoodRecord,
  removeFoodRecord,
  loadYesterdaySummary,
  clearYesterdaySummary,
} from '@/lib/storage';

interface CalorieContextValue {
  profile: UserProfile | null;
  dailyData: DailyData;
  totalCalories: number;
  remainingCalories: number;
  yesterdaySummary: DaySummary | null;
  setProfile: (profile: UserProfile) => void;
  addFood: (name: string, calories: number, tag: HealthTag, source: FoodRecord['source']) => void;
  removeFood: (recordId: string) => void;
  dismissYesterdaySummary: () => void;
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
  const [yesterdaySummary, setYesterdaySummary] = useState<DaySummary | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadAll() {
      const savedProfile = await loadProfile();
      setProfileState(savedProfile);

      const target = savedProfile?.tdee ?? 2000;
      const savedDaily = await loadDailyData(target);
      setDailyData(savedDaily);

      const summary = await loadYesterdaySummary();
      setYesterdaySummary(summary);

      setIsLoaded(true);
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        loadAll();
      }
      if (event === 'SIGNED_OUT') {
        setProfileState(null);
        setDailyData({ date: '', targetCalories: 0, records: [] });
        setYesterdaySummary(null);
        setIsLoaded(true);
      }
    });
    return () => sub.subscription.unsubscribe();
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
    setDailyData((prev) => {
      addFoodRecord(prev, record);
      return { ...prev, records: [...prev.records, record] };
    });
  }

  function handleRemoveFood(recordId: string) {
    setDailyData((prev) => {
      removeFoodRecord(prev, recordId);
      return { ...prev, records: prev.records.filter((r) => r.id !== recordId) };
    });
  }

  function handleDismissYesterdaySummary() {
    setYesterdaySummary(null);
    clearYesterdaySummary();
  }

  return (
    <CalorieContext.Provider
      value={{
        profile,
        dailyData,
        totalCalories,
        remainingCalories,
        yesterdaySummary,
        setProfile: handleSetProfile,
        addFood: handleAddFood,
        removeFood: handleRemoveFood,
        dismissYesterdaySummary: handleDismissYesterdaySummary,
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
