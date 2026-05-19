import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import imageRoutes from './routes/image.routes';
import recipeRoutes from './routes/recipe.routes';
import boardRoutes from './routes/board.routes';
import tagRoutes from './routes/tag.routes';

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false, // Vite assets need this disabled in dev
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/tags', tagRoutes);

// Serve React build in production
const clientBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.use(errorHandler);

export default app;
