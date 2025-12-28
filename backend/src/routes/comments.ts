import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, optionalAuth, AuthRequest } from '../middleware/auth';
import {
  getCommentsByMovieId,
  addComment,
  updateComment,
  deleteComment,
} from '../database/database';
import { Comment } from '../types';

const router = Router();

// Get comments for a movie
router.get('/movie/:movieId', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { movieId } = req.params;
    const comments = await getCommentsByMovieId(movieId);
    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a comment
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { movieId, content } = req.body;

    if (!movieId || !content) {
      return res.status(400).json({ error: 'Movie ID and content are required' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const newComment = await addComment({
      id: uuidv4(),
      movieId,
      username: req.user.name,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
    });

    if (!newComment) {
      return res.status(500).json({ error: 'Failed to create comment' });
    }

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a comment (like/unlike)
router.patch('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { likes } = req.body;

    const updated = await updateComment(id, { likes });
    if (!updated) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const allComments = await getCommentsByMovieId('');
    const comment = allComments.find(c => c.id === id);
    res.json(comment);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a comment
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await deleteComment(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

