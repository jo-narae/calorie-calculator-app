import { UserProfile, DailyData, DaySummary, FoodRecord } from '@/types';
import { supabase } from './supabase';

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

// ===== Profile =====

export async function loadProfile(): Promise<UserProfile | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('loadProfile failed:', error);
    return null;
  }
  if (!data) return null;

  return {
    height: Number(data.height),
    weight: Number(data.weight),
    age: data.age,
    gender: data.gender,
    activity: data.activity,
    tdee: data.tdee,
  };
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const userId = await getUserId();
  if (!userId) {
    console.error('saveProfile: no signed-in user');
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({
      user_id: userId,
      height: profile.height,
      weight: profile.weight,
      age: profile.age,
      gender: profile.gender,
      activity: profile.activity,
      tdee: profile.tdee,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (error) {
    console.error('saveProfile failed:', error);
  }
}

// ===== Food Records =====

export async function loadDailyData(targetCalories: number): Promise<DailyData> {
  const userId = await getUserId();
  const today = getToday();

  if (!userId) {
    return { date: today, targetCalories, records: [] };
  }

  await checkAndSaveDaySummary(userId, today, targetCalories);

  const { data, error } = await supabase
    .from('food_records')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .order('added_at', { ascending: true });

  if (error) {
    console.error('loadDailyData failed:', error);
    return { date: today, targetCalories, records: [] };
  }

  const records: FoodRecord[] = (data || []).map((row) => ({
    id: row.id,
    foodName: row.food_name,
    calories: row.calories,
    tag: row.tag,
    addedAt: row.added_at,
    source: row.source,
  }));

  return { date: today, targetCalories, records };
}

async function checkAndSaveDaySummary(
  userId: string,
  today: string,
  targetCalories: number
): Promise<void> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const { data: existingSummary } = await supabase
    .from('day_summaries')
    .select('id')
    .eq('user_id', userId)
    .eq('date', yesterdayStr)
    .maybeSingle();

  if (existingSummary) return;

  const { data: yesterdayRecords } = await supabase
    .from('food_records')
    .select('*')
    .eq('user_id', userId)
    .eq('date', yesterdayStr);

  if (!yesterdayRecords || yesterdayRecords.length === 0) return;

  const total = yesterdayRecords.reduce((sum, r) => sum + r.calories, 0);
  const highest = yesterdayRecords.reduce((max, r) =>
    r.calories > max.calories ? r : max
  ).food_name;

  await supabase.from('day_summaries').insert({
    user_id: userId,
    date: yesterdayStr,
    target_calories: targetCalories,
    total_calories: total,
    food_count: yesterdayRecords.length,
    highest_food: highest,
    achievement_rate: targetCalories > 0 ? Math.round((total / targetCalories) * 100) : 0,
  });
}

export async function saveDailyData(_data: DailyData): Promise<void> {
  // Supabase는 레코드 단위로 저장하므로 별도 작업 불필요
}

export async function addFoodRecord(
  data: DailyData,
  record: FoodRecord
): Promise<DailyData> {
  const userId = await getUserId();
  if (!userId) {
    console.error('addFoodRecord: no signed-in user');
    return data;
  }

  const { error } = await supabase.from('food_records').insert({
    id: record.id,
    user_id: userId,
    date: data.date,
    food_name: record.foodName,
    calories: record.calories,
    tag: record.tag,
    source: record.source,
  });

  if (error) {
    console.error('addFoodRecord failed:', error);
  }

  return { ...data, records: [...data.records, record] };
}

export async function removeFoodRecord(
  data: DailyData,
  recordId: string
): Promise<DailyData> {
  const { error } = await supabase
    .from('food_records')
    .delete()
    .eq('id', recordId);

  if (error) {
    console.error('removeFoodRecord failed:', error);
  }

  return {
    ...data,
    records: data.records.filter((r) => r.id !== recordId),
  };
}

// ===== Day Summary =====

export async function loadYesterdaySummary(): Promise<DaySummary | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('day_summaries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', yesterdayStr)
    .maybeSingle();

  if (error) {
    console.error('loadYesterdaySummary failed:', error);
    return null;
  }
  if (!data) return null;

  return {
    date: data.date,
    targetCalories: data.target_calories,
    totalCalories: data.total_calories,
    foodCount: data.food_count,
    highestFood: data.highest_food,
    achievementRate: data.achievement_rate,
  };
}

export async function clearYesterdaySummary(): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  await supabase
    .from('day_summaries')
    .delete()
    .eq('user_id', userId)
    .eq('date', yesterdayStr);
}
