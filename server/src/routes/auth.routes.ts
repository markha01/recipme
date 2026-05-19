import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { registerSchema, loginSchema } from '../../../shared/schemas';
import { registerUser, loginUser } from '../services/auth.service';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please try again later' },
});

router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
      return;
    }
    const result = await registerUser(parsed.data);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'EMAIL_TAKEN') {
        res.status(409).json({ error: 'Email already in use' });
        return;
      }
      if (err.message === 'USERNAME_TAKEN') {
        res.status(409).json({ error: 'Username already taken' });
        return;
      }
    }
    next(err);
  }
});

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
      return;
    }
    const result = await loginUser(parsed.data.email, parsed.data.password);
    res.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    next(err);
  }
});

export default router;
