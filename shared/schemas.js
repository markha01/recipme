"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTagSchema = exports.updateRecipeSchema = exports.createRecipeSchema = exports.ingredientSchema = exports.updateBoardSchema = exports.createBoardSchema = exports.changePasswordSchema = exports.updateUserSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    username: zod_1.z.string().min(3, 'Username must be at least 3 characters').max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    displayName: zod_1.z.string().min(1, 'Display name is required').max(50),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.updateUserSchema = zod_1.z.object({
    displayName: zod_1.z.string().min(1).max(50).optional(),
    username: zod_1.z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
    avatarUrl: zod_1.z.string().url().nullable().optional(),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z.string().min(8, 'New password must be at least 8 characters'),
});
exports.createBoardSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Board name is required').max(100),
});
exports.updateBoardSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
});
exports.ingredientSchema = zod_1.z.object({
    text: zod_1.z.string().min(1),
    sortOrder: zod_1.z.number().int().min(0),
});
exports.createRecipeSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200),
    imageUrl: zod_1.z.string().url().nullable().optional(),
    servings: zod_1.z.number().int().min(1).nullable().optional(),
    prepTimeMin: zod_1.z.number().int().min(0).nullable().optional(),
    cookTimeMin: zod_1.z.number().int().min(0).nullable().optional(),
    instructions: zod_1.z.string().nullable().optional(),
    boardId: zod_1.z.string().uuid().nullable().optional(),
    ingredients: zod_1.z.array(exports.ingredientSchema).optional().default([]),
    tagIds: zod_1.z.array(zod_1.z.string().uuid()).optional().default([]),
});
exports.updateRecipeSchema = exports.createRecipeSchema.partial();
exports.createTagSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Tag name is required').max(50).toLowerCase(),
});
//# sourceMappingURL=schemas.js.map