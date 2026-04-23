import { UserProfile, DailyData, DaySummary, FoodRecord } from '@/types';
import { supabase } from './supabase';

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

// 기기별 고유 ID (익명 사용자 구분)
function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('calorie-device-id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('calorie-device-id', id);
  }
  return id;
}

// ===== Profile =====

export async function loadProfile(): Promise<UserProfile | null> {
  const deviceId = getDeviceId();
  if (!deviceId) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('device_id', deviceId)
    .single();

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
  const deviceId = getDeviceId();

  await supabase
    .from('profiles')
    .upsert({
      device_id: deviceId,
      height: profile.height,
      weight: profile.weight,
      age: profile.age,
      gender: profile.gender,
      activity: profile.activity,
      tdee: profile.tdee,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'device_id' });
}

// ===== Food Records =====

export async function loadDailyData(targetCalories: number): Promise<DailyData> {
  const deviceId = getDeviceId();
  const today = getToday();

  if (!deviceId) {
    return { date: today, targetCalories, records: [] };
  }

  // 어제 데이터가 있으면 요약 저장 (날짜 변경 처리)
  await checkAndSaveDaySummary(deviceId, today, targetCalories);

  const { data } = await supabase
    .from('food_records')
    .select('*')
    .eq('device_id', deviceId)
    .eq('date', today)
    .order('added_at', { ascending: true });

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
  deviceId: string,
  today: string,
  targetCalories: number
): Promise<void> {
  // 어제 날짜 계산
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // 어제 요약이 이미 있는지 확인
  const { data: existingSummary } = await supabase
    .from('day_summaries')
    .select('id')
    .eq('device_id', deviceId)
    .eq('date', yesterdayStr)
    .single();

  if (existingSummary) return; // 이미 저장됨

  // 어제 기록이 있는지 확인
  const { data: yesterdayRecords } = await supabase
    .from('food_records')
    .select('*')
    .eq('device_id', deviceId)
    .eq('date', yesterdayStr);

  if (!yesterdayRecords || yesterdayRecords.length === 0) return;

  // 어제 요약 생성
  const total = yesterdayRecords.reduce((sum, r) => sum + r.calories, 0);
  const highest = yesterdayRecords.reduce((max, r) =>
    r.calories > max.calories ? r : max
  ).food_name;

  await supabase.from('day_summaries').insert({
    device_id: deviceId,
    date: yesterdayStr,
    target_calories: targetCalories,
    total_calories: total,
    food_count: yesterdayRecords.length,
    highest_food: highest,
    achievement_rate: targetCalories > 0 ? Math.round((total / targetCalories) * 100) : 0,
  });
}

export async function saveDailyData(_data: DailyData): Promise<void> {
  // Supabase에서는 개별 레코드 단위로 저장하므로 별도 작업 불필요
}

export async function addFoodRecord(
  data: DailyData,
  record: FoodRecord
): Promise<DailyData> {
  const deviceId = getDeviceId();

  await supabase.from('food_records').insert({
    id: record.id,
    device_id: deviceId,
    date: data.date,
    food_name: record.foodName,
    calories: record.calories,
    tag: record.tag,
    source: record.source,
  });

  return { ...data, records: [...data.records, record] };
}

export async function removeFoodRecord(
  data: DailyData,
  recordId: string
): Promise<DailyData> {
  await supabase.from('food_records').delete().eq('id', recordId);

  return {
    ...data,
    records: data.records.filter((r) => r.id !== recordId),
  };
}

// ===== Day Summary =====

export async function loadYesterdaySummary(): Promise<DaySummary | null> {
  const deviceId = getDeviceId();
  if (!deviceId) return null;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const { data } = await supabase
    .from('day_summaries')
    .select('*')
    .eq('device_id', deviceId)
    .eq('date', yesterdayStr)
    .single();

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
  const deviceId = getDeviceId();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  await supabase
    .from('day_summaries')
    .delete()
    .eq('device_id', deviceId)
    .eq('date', yesterdayStr);
}
