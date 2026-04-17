import { FoodItem } from '@/types';
import foodsData from '@/data/foods.json';

const foods: FoodItem[] = foodsData as FoodItem[];

export function searchFoods(query: string): FoodItem[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  return foods.filter((food) =>
    food.name.toLowerCase().includes(trimmed)
  );
}

export function getAllCategories(): string[] {
  const cats = new Set(foods.map((f) => f.category));
  return Array.from(cats);
}
