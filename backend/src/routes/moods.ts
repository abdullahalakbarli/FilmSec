import { Router, Request, Response } from 'express';
import { getMoods, getMoodById } from '../database/database';

const router = Router();

// Get all moods
router.get('/', async (req: Request, res: Response) => {
  try {
    const moods = await getMoods();
    res.json(moods);
  } catch (error) {
    console.error('Get moods error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get mood by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const mood = await getMoodById(id);

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

