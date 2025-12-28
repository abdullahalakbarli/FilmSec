import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, optionalAuth, AuthRequest } from '../middleware/auth';
import {
  getDiscussions,
  getDiscussionById,
  addDiscussion,
  updateDiscussion,
  deleteDiscussion,
  addDiscussionReply,
  updateDiscussionReply,
} from '../database/database';
import { Discussion, DiscussionReply, Mood } from '../types';

const router = Router();

// Get all discussions
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { mood } = req.query;
    let discussions = await getDiscussions();

    if (mood && mood !== 'all') {
      discussions = discussions.filter(d => d.mood === mood as Mood);
    }

    res.json(discussions);
  } catch (error) {
    console.error('Get discussions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get discussion by ID
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const discussion = await getDiscussionById(id);

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    res.json(discussion);
  } catch (error) {
    console.error('Get discussion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a discussion
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { mood, title, description } = req.body;

    if (!mood || !title || !description) {
      return res.status(400).json({ error: 'Mood, title, and description are required' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const newDiscussion = await addDiscussion({
      id: uuidv4(),
      mood: mood as Mood,
      title,
      description,
      username: req.user.name,
      createdAt: new Date().toISOString(),
    });

    if (!newDiscussion) {
      return res.status(500).json({ error: 'Failed to create discussion' });
    }

    res.status(201).json(newDiscussion);
  } catch (error) {
    console.error('Create discussion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add reply to discussion
router.post('/:id/replies', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    console.log('Add reply request:', { 
      id, 
      content, 
      contentType: typeof content,
      contentLength: content?.length,
      body: req.body,
      bodyKeys: Object.keys(req.body || {})
    });

    // Check if content exists and is a valid string
    if (!content) {
      return res.status(400).json({ error: 'Content field is missing in request body' });
    }

    if (typeof content !== 'string') {
      return res.status(400).json({ error: `Content must be a string, got ${typeof content}` });
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      return res.status(400).json({ error: 'Content cannot be empty or only whitespace' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const discussion = await getDiscussionById(id);
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    const newReply = await addDiscussionReply(id, {
      id: uuidv4(),
      username: req.user.name,
      content: trimmedContent,
      createdAt: new Date().toISOString(),
      likes: 0,
    });

    if (!newReply) {
      return res.status(500).json({ error: 'Failed to add reply' });
    }

    res.status(201).json(newReply);
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update reply (like/unlike)
router.patch('/:id/replies/:replyId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { replyId } = req.params;
    const { likes } = req.body;

    const updated = await updateDiscussionReply(replyId, { likes });
    if (!updated) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    // Fetch updated reply
    const discussion = await getDiscussionById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    const reply = discussion.replies.find(r => r.id === replyId);
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    res.json(reply);
  } catch (error) {
    console.error('Update reply error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a discussion
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await deleteDiscussion(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    res.json({ message: 'Discussion deleted successfully' });
  } catch (error) {
    console.error('Delete discussion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

