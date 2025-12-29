import { Router, Request, Response } from 'express';
import { getMovies, getMovieById, getMoviesByMood, getMoviesWithFilters } from '../database/database';
import { Mood } from '../types';

const router = Router();

// Get all movies with pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const { mood, type, language, page = '1', limit = '50' } = req.query;

    const filters: {
      mood?: Mood;
      type?: 'movie' | 'series' | 'all';
      language?: string;
    } = {};

    if (mood && typeof mood === 'string') {
      filters.mood = mood as Mood;
    }

    if (type && typeof type === 'string') {
      filters.type = type as 'movie' | 'series' | 'all';
    }

    if (language && typeof language === 'string') {
      filters.language = language;
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;

    const result = await getMoviesWithFilters(filters, pageNum, limitNum);
    res.json(result);
  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get movie by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const movie = await getMovieById(id);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(movie);
  } catch (error) {
    console.error('Get movie error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get movies by mood
router.get('/mood/:mood', async (req: Request, res: Response) => {
  try {
    const { mood } = req.params;
    const moodMovies = await getMoviesByMood(mood as Mood);
    res.json(moodMovies);
  } catch (error) {
    console.error('Get movies by mood error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

