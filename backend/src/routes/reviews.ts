import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, optionalAuth, AuthRequest } from '../middleware/auth';
import {
  getReviews,
  getReviewsByMovieId,
  addReview,
  updateReview,
  deleteReview,
} from '../database/database';
import { UserReview } from '../types';

const router = Router();

// Get reviews for a movie
router.get('/movie/:movieId', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { movieId } = req.params;
    const reviews = await getReviewsByMovieId(movieId);
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a review
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { movieId, rating, review } = req.body;

    if (!movieId || rating === undefined || !review) {
      return res.status(400).json({ error: 'Movie ID, rating, and review are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const newReview = await addReview({
      id: uuidv4(),
      movieId,
      username: req.user.name,
      rating,
      review,
      createdAt: new Date().toISOString(),
    });

    if (!newReview) {
      return res.status(500).json({ error: 'Failed to create review' });
    }

    res.status(201).json(newReview);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a review
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const updates: Partial<UserReview> = {};
    if (rating !== undefined) updates.rating = rating;
    if (review !== undefined) updates.review = review;

    const updated = await updateReview(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const allReviews = await getReviews();
    const updatedReview = allReviews.find(r => r.id === id);
    res.json(updatedReview);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a review
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await deleteReview(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

