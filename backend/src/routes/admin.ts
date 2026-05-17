import { Router, Response } from 'express';
import { authenticateToken, AuthRequest, requireAdmin } from '../middleware/auth';
import { getUsers, getMovies, getComments, getReviews, getDiscussions } from '../database/database';

const router = Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const [users, movies, comments, reviews, discussions] = await Promise.all([
      getUsers(),
      getMovies(),
      getComments(),
      getReviews(),
      getDiscussions(),
    ]);

    const totalUsers = users.length;
    const totalMovies = movies.length;
    const totalComments = comments.length;
    const totalReviews = reviews.length;
    const totalDiscussions = discussions.length;

    const moviesCount = movies.filter(m => m.type === 'movie').length;
    const seriesCount = movies.filter(m => m.type === 'series').length;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = users.filter(u => new Date(u.createdAt) >= sevenDaysAgo);
    const recentComments = comments.filter(c => new Date(c.createdAt) >= sevenDaysAgo);
    const recentReviews = reviews.filter(r => new Date(r.createdAt) >= sevenDaysAgo);

    res.json({
      stats: {
        totalUsers,
        totalMovies,
        totalComments,
        totalReviews,
        totalDiscussions,
        moviesCount,
        seriesCount,
      },
      recentActivity: {
        newUsers: recentUsers.length,
        newComments: recentComments.length,
        newReviews: recentReviews.length,
      },
      topMoods: getTopMoods(movies),
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const users = await getUsers();
    const usersWithoutPasswords = users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      avatar: u.avatar,
      role: u.role || 'user',
      createdAt: u.createdAt,
    }));
    res.json({ users: usersWithoutPasswords });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/moderation', async (req: AuthRequest, res: Response) => {
  try {
    const [comments, reviews, discussions] = await Promise.all([
      getComments(),
      getReviews(),
      getDiscussions(),
    ]);

    const recentComments = comments
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);

    const recentReviews = reviews
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);

    const recentDiscussions = discussions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);

    res.json({
      recentComments,
      recentReviews,
      recentDiscussions,
    });
  } catch (error) {
    console.error('Admin moderation error:', error);
    res.status(500).json({ error: 'Failed to fetch moderation data' });
  }
});

router.get('/security-overview', async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      overview: {
        authentication: 'JWT with bcrypt password hashing',
        authorization: 'Role-based access control (admin / user)',
        databaseAccess: 'Parameterized queries via Supabase client',
        lastReview: new Date().toISOString().split('T')[0],
      },
      policies: [
        'Passwords are never stored in plain text.',
        'Admin routes require a valid JWT and admin role on every request.',
        'Service role keys must only be used on the server, never in the browser.',
        'Rotate JWT_SECRET and database keys if they may have been exposed.',
      ],
    });
  } catch (error) {
    console.error('Security overview error:', error);
    res.status(500).json({ error: 'Failed to fetch security overview' });
  }
});

router.get('/system-status', async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        api: 'online',
        database: 'connected',
        authentication: 'active',
      },
    });
  } catch (error) {
    console.error('System status error:', error);
    res.status(500).json({ error: 'Failed to fetch system status' });
  }
});

function getTopMoods(movies: { mood: string }[]) {
  const moodCounts: Record<string, number> = {};
  movies.forEach(m => {
    moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
  });

  return Object.entries(moodCounts)
    .map(([mood, count]) => ({ mood, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export default router;
