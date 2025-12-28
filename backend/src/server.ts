import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import moviesRoutes from './routes/movies';
import moodsRoutes from './routes/moods';
import commentsRoutes from './routes/comments';
import reviewsRoutes from './routes/reviews';
import discussionsRoutes from './routes/discussions';
import favoritesRoutes from './routes/favorites';
import watchLaterRoutes from './routes/watchLater';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 4243;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'FilmMood API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api/moods', moodsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/discussions', discussionsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/watch-later', watchLaterRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 FilmMood API server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API base URL: http://localhost:${PORT}/api`);
});

