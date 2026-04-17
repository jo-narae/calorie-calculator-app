export type Gender = 'male' | 'female';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export interface UserProfile {
  height: number;
  weight: number;
  age: number;
  gender: Gender;
  activity: ActivityLevel;
  tdee: number;
}

export type HealthTag = 'good' | 'caution' | 'normal';

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  category: string;
  tag: HealthTag;
}

export interface FoodRecord {
  id: string;
  foodName: string;
  calories: number;
  tag: HealthTag;
  addedAt: string;
  source: 'search' | 'manual' | 'quick';
}

export interface DailyData {
  date: string;
  targetCalories: number;
  records: FoodRecord[];
}

export interface DaySummary {
  date: string;
  targetCalories: number;
  totalCalories: number;
  foodCount: number;
  highestFood: string;
  achievementRate: number;
}
