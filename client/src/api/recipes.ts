import { get, post, patch, del } from './client';
import type { Recipe, RecipeSummary, RecipesQuery } from '../../../shared/types';

export function listRecipes(query: RecipesQuery = {}): Promise<RecipeSummary[]> {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  query.tagIds?.forEach((id) => params.append('tagIds', id));
  if (query.sort) params.set('sort', query.sort);
  if (query.order) params.set('order', query.order);
  const qs = params.toString();
  return get(`/recipes${qs ? `?${qs}` : ''}`);
}

export function getRecipe(id: string): Promise<Recipe> {
  return get(`/recipes/${id}`);
}

export function createRecipe(data: {
  title: string;
  imageUrl?: string | null;
  servings?: number | null;
  prepTimeMin?: number | null;
  cookTimeMin?: number | null;
  instructions?: string | null;
  boardIds?: string[];
  ingredients?: { text: string; sortOrder: number }[];
  tagIds?: string[];
}): Promise<Recipe> {
  return post('/recipes', data);
}

export function updateRecipe(id: string, data: Partial<Parameters<typeof createRecipe>[0]>): Promise<Recipe> {
  return patch(`/recipes/${id}`, data);
}

export function deleteRecipe(id: string): Promise<{ message: string }> {
  return del(`/recipes/${id}`);
}
