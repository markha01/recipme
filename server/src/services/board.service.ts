import { and, desc, eq, sql } from 'drizzle-orm';
import { getDb } from '../db/connection';
import { boards, recipes, recipeBoards } from '../db/schema';

export async function listBoards(userId: string) {
  const db = getDb();

  const boardList = await db
    .select({
      id: boards.id,
      name: boards.name,
      createdAt: boards.createdAt,
      updatedAt: boards.updatedAt,
    })
    .from(boards)
    .where(eq(boards.userId, userId))
    .orderBy(boards.name);

  if (boardList.length === 0) return [];

  // Fetch recipe images per board (used for counts and preview thumbnails)
  const boardRecipes = await db
    .select({
      boardId: recipeBoards.boardId,
      imageUrl: recipes.imageUrl,
    })
    .from(recipeBoards)
    .innerJoin(recipes, eq(recipeBoards.recipeId, recipes.id))
    .where(eq(recipes.userId, userId))
    .orderBy(desc(recipes.createdAt));

  const countMap = new Map<string, number>();
  const imageMap = new Map<string, (string | null)[]>();

  for (const row of boardRecipes) {
    countMap.set(row.boardId, (countMap.get(row.boardId) ?? 0) + 1);
    const imgs = imageMap.get(row.boardId) ?? [];
    if (imgs.length < 3) imgs.push(row.imageUrl);
    imageMap.set(row.boardId, imgs);
  }

  return boardList.map((b) => ({
    ...b,
    userId,
    recipeCount: countMap.get(b.id) ?? 0,
    previewImages: imageMap.get(b.id) ?? [],
  }));
}

export async function getBoard(boardId: string, userId: string) {
  const db = getDb();
  const [board] = await db
    .select()
    .from(boards)
    .where(and(eq(boards.id, boardId), eq(boards.userId, userId)));

  if (!board) return null;

  const count = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(recipeBoards)
    .innerJoin(recipes, eq(recipeBoards.recipeId, recipes.id))
    .where(and(eq(recipeBoards.boardId, boardId), eq(recipes.userId, userId)));

  return {
    ...board,
    userId,
    recipeCount: count[0]?.count ?? 0,
  };
}

export async function createBoard(userId: string, name: string) {
  const db = getDb();
  const [board] = await db
    .insert(boards)
    .values({ userId, name })
    .returning();
  return { ...board, userId, recipeCount: 0 };
}

export async function updateBoard(boardId: string, userId: string, name: string) {
  const db = getDb();
  const [updated] = await db
    .update(boards)
    .set({ name, updatedAt: new Date() })
    .where(and(eq(boards.id, boardId), eq(boards.userId, userId)))
    .returning();

  if (!updated) return null;
  return { ...updated, userId, recipeCount: 0 };
}

export async function deleteBoard(boardId: string, userId: string): Promise<boolean> {
  const db = getDb();
  const result = await db
    .delete(boards)
    .where(and(eq(boards.id, boardId), eq(boards.userId, userId)))
    .returning({ id: boards.id });

  return result.length > 0;
}
