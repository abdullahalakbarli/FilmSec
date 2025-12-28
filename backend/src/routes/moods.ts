import { Router, Request, Response } from 'express';
import { moods } from '../data/moods';

const router = Router();

// Get all moods
router.get('/', (req: Request, res: Response) => {
  try {
    res.json(moods);
  } catch (error) {
    console.error('Get moods error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get mood by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const mood = moods.find(m => m.id === id);

    if (!mood) {
      return res.status(404).json({ error: 'Mood not found' });
    }

    res.json(mood);
  } catch (error) {
    console.error('Get mood error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

