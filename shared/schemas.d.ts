import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    username: z.ZodString;
    displayName: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    username: string;
    displayName: string;
    password: string;
}, {
    email: string;
    username: string;
    displayName: string;
    password: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const updateUserSchema: z.ZodObject<{
    displayName: z.ZodOptional<z.ZodString>;
    username: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    username?: string | undefined;
    displayName?: string | undefined;
    avatarUrl?: string | null | undefined;
}, {
    username?: string | undefined;
    displayName?: string | undefined;
    avatarUrl?: string | null | undefined;
}>;
export declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
export declare const createBoardSchema: z.ZodObject<{
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
}, {
    name: string;
}>;
export declare const updateBoardSchema: z.ZodObject<{
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
}, {
    name: string;
}>;
export declare const ingredientSchema: z.ZodObject<{
    text: z.ZodString;
    sortOrder: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    text: string;
    sortOrder: number;
}, {
    text: string;
    sortOrder: number;
}>;
export declare const createRecipeSchema: z.ZodObject<{
    title: z.ZodString;
    imageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    servings: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    prepTimeMin: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    cookTimeMin: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    instructions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    boardId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ingredients: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        sortOrder: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        text: string;
        sortOrder: number;
    }, {
        text: string;
        sortOrder: number;
    }>, "many">>>;
    tagIds: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    ingredients: {
        text: string;
        sortOrder: number;
    }[];
    tagIds: string[];
    imageUrl?: string | null | undefined;
    servings?: number | null | undefined;
    prepTimeMin?: number | null | undefined;
    cookTimeMin?: number | null | undefined;
    instructions?: string | null | undefined;
    boardId?: string | null | undefined;
}, {
    title: string;
    imageUrl?: string | null | undefined;
    servings?: number | null | undefined;
    prepTimeMin?: number | null | undefined;
    cookTimeMin?: number | null | undefined;
    instructions?: string | null | undefined;
    boardId?: string | null | undefined;
    ingredients?: {
        text: string;
        sortOrder: number;
    }[] | undefined;
    tagIds?: string[] | undefined;
}>;
export declare const updateRecipeSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    servings: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    prepTimeMin: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    cookTimeMin: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    instructions: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    boardId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    ingredients: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        sortOrder: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        text: string;
        sortOrder: number;
    }, {
        text: string;
        sortOrder: number;
    }>, "many">>>>;
    tagIds: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    imageUrl?: string | null | undefined;
    servings?: number | null | undefined;
    prepTimeMin?: number | null | undefined;
    cookTimeMin?: number | null | undefined;
    instructions?: string | null | undefined;
    boardId?: string | null | undefined;
    ingredients?: {
        text: string;
        sortOrder: number;
    }[] | undefined;
    tagIds?: string[] | undefined;
}, {
    title?: string | undefined;
    imageUrl?: string | null | undefined;
    servings?: number | null | undefined;
    prepTimeMin?: number | null | undefined;
    cookTimeMin?: number | null | undefined;
    instructions?: string | null | undefined;
    boardId?: string | null | undefined;
    ingredients?: {
        text: string;
        sortOrder: number;
    }[] | undefined;
    tagIds?: string[] | undefined;
}>;
export declare const createTagSchema: z.ZodObject<{
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
}, {
    name: string;
}>;
//# sourceMappingURL=schemas.d.ts.map