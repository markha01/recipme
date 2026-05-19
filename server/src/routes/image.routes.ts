import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadImage, deleteImage } from '../services/storage.service';

const router = Router();
router.use(authMiddleware);

router.post('/upload', upload.single('image'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }
    const url = await uploadImage(req.file.buffer, req.file.originalname, req.file.mimetype);
    res.json({ url });
  } catch (err) { next(err); }
});

router.delete('/', async (req: AuthRequest, res, next) => {
  try {
    const { url } = req.body;
    if (!url) { res.status(400).json({ error: 'URL is required' }); return; }
    await deleteImage(url);
    res.json({ message: 'Image deleted' });
  } catch (err) { next(err); }
});

export default router;
