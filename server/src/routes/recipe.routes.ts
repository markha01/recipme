import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { createRecipeSchema, updateRecipeSchema } from '../../../shared/schemas';
import {
  listRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from '../services/recipe.service';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { search, sort, order } = req.query as Record<string, string>;
    const rawTagIds = req.query.tagIds;
    const tagIds = rawTagIds
      ? Array.isArray(rawTagIds)
        ? (rawTagIds as string[])
        : [rawTagIds as string]
      : undefined;
    const result = await listRecipes(req.user!.id, { search, tagIds, sort, order });
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const parsed = createRecipeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
      return;
    }
    const recipe = await createRecipe(req.user!.id, parsed.data);
    res.status(201).json(recipe);
  } catch (err) { next(err); }
});

router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const recipe = await getRecipe(req.params.id, req.user!.id);
    if (!recipe) { res.status(404).json({ error: 'Recipe not found' }); return; }
    res.json(recipe);
  } catch (err) { next(err); }
});

router.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const parsed = updateRecipeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
      return;
    }
    const recipe = await updateRecipe(req.params.id, req.user!.id, parsed.data);
    if (!recipe) { res.status(404).json({ error: 'Recipe not found' }); return; }
    res.json(recipe);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const deleted = await deleteRecipe(req.params.id, req.user!.id);
    if (!deleted) { res.status(404).json({ error: 'Recipe not found' }); return; }
    res.json({ message: 'Recipe deleted' });
  } catch (err) { next(err); }
});

export default router;
