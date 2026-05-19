import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { createBoardSchema, updateBoardSchema } from '../../../shared/schemas';
import {
  listBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
} from '../services/board.service';
import { listBoardRecipes } from '../services/recipe.service';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const result = await listBoards(req.user!.id);
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const parsed = createBoardSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
      return;
    }
    const board = await createBoard(req.user!.id, parsed.data.name);
    res.status(201).json(board);
  } catch (err) {
    if (err instanceof Error && err.message.includes('unique')) {
      res.status(409).json({ error: 'Board name already exists' });
      return;
    }
    next(err);
  }
});

router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const board = await getBoard(req.params.id, req.user!.id);
    if (!board) { res.status(404).json({ error: 'Board not found' }); return; }
    const recipes = await listBoardRecipes(req.params.id, req.user!.id);
    res.json({ ...board, recipes });
  } catch (err) { next(err); }
});

router.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const parsed = updateBoardSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
      return;
    }
    const board = await updateBoard(req.params.id, req.user!.id, parsed.data.name);
    if (!board) { res.status(404).json({ error: 'Board not found' }); return; }
    res.json(board);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const deleted = await deleteBoard(req.params.id, req.user!.id);
    if (!deleted) { res.status(404).json({ error: 'Board not found' }); return; }
    res.json({ message: 'Board deleted' });
  } catch (err) { next(err); }
});

export default router;
