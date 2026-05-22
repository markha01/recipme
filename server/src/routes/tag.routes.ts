import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { createTagSchema } from '../../../shared/schemas';
import { eq, and, ilike, sql } from 'drizzle-orm';
import { getDb } from '../db/connection';
import { tags, recipeTags } from '../db/schema';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const db = getDb();
    const { search } = req.query as { search?: string };

    const conditions = [eq(tags.userId, req.user!.id)];
    if (search) conditions.push(ilike(tags.name, `%${search}%`));

    const tagList = await db
      .select({
        id: tags.id,
        name: tags.name,
        userId: tags.userId,
        recipeCount: sql<number>`count(${recipeTags.recipeId})::int`,
      })
      .from(tags)
      .leftJoin(recipeTags, eq(recipeTags.tagId, tags.id))
      .where(and(...conditions))
      .groupBy(tags.id)
      .having(sql`count(${recipeTags.recipeId}) >= 1`)
      .orderBy(tags.name);

    res.json(tagList);
  } catch (err) { next(err); }
});

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const parsed = createTagSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const db = getDb();
    const tagName = parsed.data.name.toLowerCase();

    // Idempotent — return existing if found
    const [existing] = await db
      .select({ id: tags.id, name: tags.name, userId: tags.userId })
      .from(tags)
      .where(and(eq(tags.userId, req.user!.id), eq(tags.name, tagName)));

    if (existing) {
      const [countRow] = await db
        .select({ recipeCount: sql<number>`count(${recipeTags.recipeId})::int` })
        .from(recipeTags)
        .where(eq(recipeTags.tagId, existing.id));
      res.json({ ...existing, recipeCount: countRow?.recipeCount ?? 0 });
      return;
    }

    const [newTag] = await db
      .insert(tags)
      .values({ userId: req.user!.id, name: tagName })
      .returning();

    res.status(201).json({ ...newTag, recipeCount: 0 });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const db = getDb();
    const result = await db
      .delete(tags)
      .where(and(eq(tags.id, req.params.id), eq(tags.userId, req.user!.id)))
      .returning({ id: tags.id });

    if (result.length === 0) { res.status(404).json({ error: 'Tag not found' }); return; }
    res.json({ message: 'Tag deleted' });
  } catch (err) { next(err); }
});

export default router;
