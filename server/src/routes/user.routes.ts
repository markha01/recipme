import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { updateUserSchema, changePasswordSchema } from '../../../shared/schemas';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/connection';
import { users } from '../db/schema';
import { verifyPassword, hashPassword } from '../services/auth.service';

const router = Router();
router.use(authMiddleware);

router.get('/me', async (req: AuthRequest, res, next) => {
  try {
    const db = getDb();
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, req.user!.id));

    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(user);
  } catch (err) { next(err); }
});

router.patch('/me', async (req: AuthRequest, res, next) => {
  try {
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const db = getDb();
    const updateData: Partial<typeof users.$inferInsert> = { updatedAt: new Date() };
    if (parsed.data.displayName) updateData.displayName = parsed.data.displayName;
    if (parsed.data.username) updateData.username = parsed.data.username.toLowerCase();
    if (parsed.data.avatarUrl !== undefined) updateData.avatarUrl = parsed.data.avatarUrl;

    try {
      const [updated] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, req.user!.id))
        .returning({
          id: users.id,
          email: users.email,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        });
      res.json(updated);
    } catch (dbErr: unknown) {
      if (dbErr instanceof Error && dbErr.message.includes('unique')) {
        res.status(409).json({ error: 'Username already taken' });
        return;
      }
      throw dbErr;
    }
  } catch (err) { next(err); }
});

router.patch('/me/password', async (req: AuthRequest, res, next) => {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const db = getDb();
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.id));
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!valid) { res.status(400).json({ error: 'Current password is incorrect' }); return; }

    const newHash = await hashPassword(parsed.data.newPassword);
    await db.update(users).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(users.id, req.user!.id));

    res.json({ message: 'Password updated successfully' });
  } catch (err) { next(err); }
});

router.delete('/me', async (req: AuthRequest, res, next) => {
  try {
    const db = getDb();
    await db.delete(users).where(eq(users.id, req.user!.id));
    res.json({ message: 'Account deleted' });
  } catch (err) { next(err); }
});

export default router;
