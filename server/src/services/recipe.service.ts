import { and, eq, ilike, inArray, desc, asc, sql } from 'drizzle-orm';
import { getDb } from '../db/connection';
import { recipes, ingredients, tags, recipeTags, boards } from '../db/schema';
import { deleteImage } from './storage.service';

interface RecipeInput {
  title: string;
  imageUrl?: string | null;
  servings?: number | null;
  prepTimeMin?: number | null;
  cookTimeMin?: number | null;
  instructions?: string | null;
  boardId?: string | null;
  ingredients?: { text: string; sortOrder: number }[];
  tagIds?: string[];
}

export async function listRecipes(
  userId: string,
  query: { search?: string; tagId?: string; sort?: string; order?: string }
) {
  const db = getDb();
  const conditions = [eq(recipes.userId, userId)];

  if (query.search) {
    conditions.push(ilike(recipes.title, `%${query.search}%`));
  }

  let recipeList = await db
    .select({
      id: recipes.id,
      title: recipes.title,
      imageUrl: recipes.imageUrl,
      prepTimeMin: recipes.prepTimeMin,
      cookTimeMin: recipes.cookTimeMin,
      createdAt: recipes.createdAt,
      updatedAt: recipes.updatedAt,
    })
    .from(recipes)
    .where(and(...conditions))
    .orderBy(
      query.sort === 'title'
        ? query.order === 'desc'
          ? desc(recipes.title)
          : asc(recipes.title)
        : query.order === 'asc'
        ? asc(recipes.createdAt)
        : desc(recipes.createdAt)
    );

  if (recipeList.length === 0) return [];

  const recipeIds = recipeList.map((r) => r.id);

  // Filter by tag if needed
  if (query.tagId) {
    const taggedRecipeIds = await db
      .select({ recipeId: recipeTags.recipeId })
      .from(recipeTags)
      .where(and(eq(recipeTags.tagId, query.tagId), inArray(recipeTags.recipeId, recipeIds)));
    const taggedSet = new Set(taggedRecipeIds.map((r) => r.recipeId));
    recipeList = recipeList.filter((r) => taggedSet.has(r.id));
    if (recipeList.length === 0) return [];
  }

  const filteredIds = recipeList.map((r) => r.id);

  // Fetch tags for all recipes
  const allRecipeTags = await db
    .select({
      recipeId: recipeTags.recipeId,
      tagId: tags.id,
      tagName: tags.name,
    })
    .from(recipeTags)
    .innerJoin(tags, eq(recipeTags.tagId, tags.id))
    .where(inArray(recipeTags.recipeId, filteredIds));

  const tagsByRecipe = new Map<string, { id: string; name: string; recipeCount: number }[]>();
  for (const rt of allRecipeTags) {
    if (!tagsByRecipe.has(rt.recipeId)) tagsByRecipe.set(rt.recipeId, []);
    tagsByRecipe.get(rt.recipeId)!.push({ id: rt.tagId, name: rt.tagName, recipeCount: 0 });
  }

  return recipeList.map((r) => ({
    ...r,
    tags: tagsByRecipe.get(r.id) ?? [],
  }));
}

export async function getRecipe(recipeId: string, userId: string) {
  const db = getDb();

  const [recipe] = await db
    .select()
    .from(recipes)
    .where(and(eq(recipes.id, recipeId), eq(recipes.userId, userId)));

  if (!recipe) return null;

  const recipeIngredients = await db
    .select()
    .from(ingredients)
    .where(eq(ingredients.recipeId, recipeId))
    .orderBy(asc(ingredients.sortOrder));

  const recipeTagRows = await db
    .select({ id: tags.id, name: tags.name })
    .from(recipeTags)
    .innerJoin(tags, eq(recipeTags.tagId, tags.id))
    .where(eq(recipeTags.recipeId, recipeId));

  let board = null;
  if (recipe.boardId) {
    const [b] = await db.select().from(boards).where(eq(boards.id, recipe.boardId));
    if (b) board = { ...b, recipeCount: 0 };
  }

  return {
    ...recipe,
    ingredients: recipeIngredients,
    tags: recipeTagRows.map((t) => ({ ...t, recipeCount: 0, userId })),
    board,
  };
}

export async function createRecipe(userId: string, input: RecipeInput) {
  const db = getDb();

  const [recipe] = await db
    .insert(recipes)
    .values({
      userId,
      title: input.title,
      imageUrl: input.imageUrl ?? null,
      servings: input.servings ?? null,
      prepTimeMin: input.prepTimeMin ?? null,
      cookTimeMin: input.cookTimeMin ?? null,
      instructions: input.instructions ?? null,
      boardId: input.boardId ?? null,
    })
    .returning();

  if (input.ingredients?.length) {
    await db.insert(ingredients).values(
      input.ingredients.map((ing) => ({
        recipeId: recipe.id,
        sortOrder: ing.sortOrder,
        text: ing.text,
      }))
    );
  }

  if (input.tagIds?.length) {
    await db.insert(recipeTags).values(
      input.tagIds.map((tagId) => ({ recipeId: recipe.id, tagId }))
    );
  }

  return getRecipe(recipe.id, userId);
}

export async function updateRecipe(recipeId: string, userId: string, input: Partial<RecipeInput>) {
  const db = getDb();

  const [existing] = await db
    .select()
    .from(recipes)
    .where(and(eq(recipes.id, recipeId), eq(recipes.userId, userId)));

  if (!existing) return null;

  const updateData: Partial<typeof recipes.$inferInsert> = {};
  if (input.title !== undefined) updateData.title = input.title;
  if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
  if (input.servings !== undefined) updateData.servings = input.servings;
  if (input.prepTimeMin !== undefined) updateData.prepTimeMin = input.prepTimeMin;
  if (input.cookTimeMin !== undefined) updateData.cookTimeMin = input.cookTimeMin;
  if (input.instructions !== undefined) updateData.instructions = input.instructions;
  if (input.boardId !== undefined) updateData.boardId = input.boardId;
  updateData.updatedAt = new Date();

  await db
    .update(recipes)
    .set(updateData)
    .where(and(eq(recipes.id, recipeId), eq(recipes.userId, userId)));

  if (input.ingredients !== undefined) {
    await db.delete(ingredients).where(eq(ingredients.recipeId, recipeId));
    if (input.ingredients.length > 0) {
      await db.insert(ingredients).values(
        input.ingredients.map((ing) => ({
          recipeId,
          sortOrder: ing.sortOrder,
          text: ing.text,
        }))
      );
    }
  }

  if (input.tagIds !== undefined) {
    await db.delete(recipeTags).where(eq(recipeTags.recipeId, recipeId));
    if (input.tagIds.length > 0) {
      await db.insert(recipeTags).values(
        input.tagIds.map((tagId) => ({ recipeId, tagId }))
      );
    }
  }

  return getRecipe(recipeId, userId);
}

export async function deleteRecipe(recipeId: string, userId: string): Promise<boolean> {
  const db = getDb();

  const [existing] = await db
    .select()
    .from(recipes)
    .where(and(eq(recipes.id, recipeId), eq(recipes.userId, userId)));

  if (!existing) return false;

  if (existing.imageUrl) {
    await deleteImage(existing.imageUrl);
  }

  await db
    .delete(recipes)
    .where(and(eq(recipes.id, recipeId), eq(recipes.userId, userId)));

  return true;
}

export async function listBoardRecipes(boardId: string, userId: string) {
  const db = getDb();

  const recipeList = await db
    .select({
      id: recipes.id,
      title: recipes.title,
      imageUrl: recipes.imageUrl,
      prepTimeMin: recipes.prepTimeMin,
      cookTimeMin: recipes.cookTimeMin,
      createdAt: recipes.createdAt,
      updatedAt: recipes.updatedAt,
    })
    .from(recipes)
    .where(and(eq(recipes.boardId, boardId), eq(recipes.userId, userId)))
    .orderBy(desc(recipes.createdAt));

  if (recipeList.length === 0) return [];

  const recipeIds = recipeList.map((r) => r.id);

  const allRecipeTags = await db
    .select({
      recipeId: recipeTags.recipeId,
      tagId: tags.id,
      tagName: tags.name,
    })
    .from(recipeTags)
    .innerJoin(tags, eq(recipeTags.tagId, tags.id))
    .where(inArray(recipeTags.recipeId, recipeIds));

  const tagsByRecipe = new Map<string, { id: string; name: string; recipeCount: number }[]>();
  for (const rt of allRecipeTags) {
    if (!tagsByRecipe.has(rt.recipeId)) tagsByRecipe.set(rt.recipeId, []);
    tagsByRecipe.get(rt.recipeId)!.push({ id: rt.tagId, name: rt.tagName, recipeCount: 0 });
  }

  return recipeList.map((r) => ({
    ...r,
    tags: tagsByRecipe.get(r.id) ?? [],
  }));
}
