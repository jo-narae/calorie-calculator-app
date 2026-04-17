import { ActivityLevel, Gender } from '@/types';

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calculateTDEE(
  height: number,
  weight: number,
  age: number,
  gender: Gender,
  activity: ActivityLevel
): number {
  const bmr =
    gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  return Math.round(bmr * ACTIVITY_MULTIPLIER[activity]);
}
