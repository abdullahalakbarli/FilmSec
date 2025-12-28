import { Router, Request, Response } from 'express';
import { movies } from '../data/movies';
import { Mood, Filters } from '../types';

const router = Router();

// Get all movies
router.get('/', (req: Request, res: Response) => {
  try {
    const { mood, type, duration, language } = req.query;

    let filteredMovies = [...movies];

    // Filter by mood
    if (mood && typeof mood === 'string') {
      filteredMovies = filteredMovies.filter(m => m.mood === mood as Mood);
    }

    // Filter by type
    if (type && type !== 'all') {
      filteredMovies = filteredMovies.filter(m => m.type === type);
    }

    // Filter by language
    if (language && language !== 'any') {
      filteredMovies = filteredMovies.filter(m => m.language === language);
    }

    // Note: Duration filtering would require parsing the duration string
    // This is a simplified version

    res.json(filteredMovies);
  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get movie by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const movie = movies.find(m => m.id === id);

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
router.get('/mood/:mood', (req: Request, res: Response) => {
  try {
    const { mood } = req.params;
    const moodMovies = movies.filter(m => m.mood === mood as Mood);
    res.json(moodMovies);
  } catch (error) {
    console.error('Get movies by mood error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

