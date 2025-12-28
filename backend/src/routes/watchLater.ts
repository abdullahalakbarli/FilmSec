import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import {
  getUserWatchLater,
  addWatchLater,
  removeWatchLater,
} from '../database/database';

const router = Router();

// Get user watch later list
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const watchLater = await getUserWatchLater(req.userId);
    res.json(watchLater);
  } catch (error) {
    console.error('Get watch later error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add to watch later
router.post('/:movieId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { movieId } = req.params;
    await addWatchLater(req.userId, movieId);
    
    const watchLater = await getUserWatchLater(req.userId);
    res.json(watchLater);
  } catch (error) {
    console.error('Add watch later error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove from watch later
router.delete('/:movieId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { movieId } = req.params;
    await removeWatchLater(req.userId, movieId);
    
    const watchLater = await getUserWatchLater(req.userId);
    res.json(watchLater);
  } catch (error) {
    console.error('Remove watch later error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

