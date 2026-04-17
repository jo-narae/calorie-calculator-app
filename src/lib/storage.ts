import { UserProfile, DailyData, FoodRecord } from '@/types';

const PROFILE_KEY = 'calorie-profile';
const DAILY_KEY = 'calorie-daily';

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function loadProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadDailyData(targetCalories: number): DailyData {
  if (typeof window === 'undefined') {
    return { date: getToday(), targetCalories, records: [] };
  }

  const raw = localStorage.getItem(DAILY_KEY);
  if (!raw) {
    return { date: getToday(), targetCalories, records: [] };
  }

  const saved: DailyData = JSON.parse(raw);
  if (saved.date !== getToday()) {
    // 날짜가 바뀌었으면 리셋
    return { date: getToday(), targetCalories, records: [] };
  }

  return { ...saved, targetCalories };
}

export function saveDailyData(data: DailyData): void {
  localStorage.setItem(DAILY_KEY, JSON.stringify(data));
}

export function addFoodRecord(
  data: DailyData,
  record: FoodRecord
): DailyData {
  const updated = { ...data, records: [...data.records, record] };
  saveDailyData(updated);
  return updated;
}

export function removeFoodRecord(
  data: DailyData,
  recordId: string
): DailyData {
  const updated = {
    ...data,
    records: data.records.filter((r) => r.id !== recordId),
  };
  saveDailyData(updated);
  return updated;
}
