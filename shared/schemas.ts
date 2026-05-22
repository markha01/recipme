import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  displayName: z.string().min(1, 'Display name is required').max(50),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateUserSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const createBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required').max(100),
});

export const updateBoardSchema = z.object({
  name: z.string().min(1).max(100),
});

export const ingredientSchema = z.object({
  text: z.string().min(1),
  sortOrder: z.number().int().min(0),
});

export const createRecipeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  imageUrl: z.string().url().nullable().optional(),
  servings: z.number().int().min(1).nullable().optional(),
  prepTimeMin: z.number().int().min(0).nullable().optional(),
  cookTimeMin: z.number().int().min(0).nullable().optional(),
  instructions: z.string().nullable().optional(),
  boardIds: z.array(z.string().uuid()).optional().default([]),
  ingredients: z.array(ingredientSchema).optional().default([]),
  tagIds: z.array(z.string().uuid()).optional().default([]),
});

export const updateRecipeSchema = createRecipeSchema.partial();

export const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50).toLowerCase(),
});
