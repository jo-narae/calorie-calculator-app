import { FoodItem } from '@/types';
import foodsData from '@/data/foods.json';

const foods: FoodItem[] = foodsData as FoodItem[];

export function getRecommendations(remainingCalories: number): FoodItem[] {
  if (remainingCalories <= 0) return [];

  return foods
    .filter((food) => food.calories <= remainingCalories)
    .sort((a, b) => {
      // good 태그 우선
      if (a.tag === 'good' && b.tag !== 'good') return -1;
      if (a.tag !== 'good' && b.tag === 'good') return 1;
      return 0;
    })
    .slice(0, 8);
}
