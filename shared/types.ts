export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  id: string;
  userId: string;
  name: string;
  recipeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  recipeCount: number;
}

export interface Ingredient {
  id: string;
  recipeId: string;
  sortOrder: number;
  text: string;
}

export interface Recipe {
  id: string;
  userId: string;
  title: string;
  imageUrl: string | null;
  servings: number | null;
  prepTimeMin: number | null;
  cookTimeMin: number | null;
  instructions: string | null;
  ingredients: Ingredient[];
  tags: Tag[];
  boards: Board[];
  createdAt: string;
  updatedAt: string;
}

export interface RecipeSummary {
  id: string;
  title: string;
  imageUrl: string | null;
  prepTimeMin: number | null;
  cookTimeMin: number | null;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export type SortField = 'created_at' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface RecipesQuery {
  search?: string;
  tagIds?: string[];
  sort?: SortField;
  order?: SortOrder;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
  details?: unknown;
}

export interface ImageUploadResponse {
  url: string;
}
