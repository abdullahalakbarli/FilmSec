import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest, requireAdmin } from '../middleware/auth';
import { getUsers, getMovies, getComments, getReviews, getDiscussions } from '../database/database';

const router = Router();

// CTF FLAG: This is the flag that will be displayed in the admin dashboard
// flag{7f3c91d2a8be4c6f9d1eab27c4f80193_filmsec_admin_only}
const CTF_FLAG = 'flag{7f3c91d2a8be4c6f9d1eab27c4f80193_filmsec_admin_only}';

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get admin dashboard stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const [users, movies, comments, reviews, discussions] = await Promise.all([
      getUsers(),
      getMovies(),
      getComments(),
      getReviews(),
      getDiscussions(),
    ]);

    // Calculate stats
    const totalUsers = users.length;
    const totalMovies = movies.length;
    const totalComments = comments.length;
    const totalReviews = reviews.length;
    const totalDiscussions = discussions.length;

    // Get content breakdown
    const moviesCount = movies.filter(m => m.type === 'movie').length;
    const seriesCount = movies.filter(m => m.type === 'series').length;

    // Get recent activity (last 7 days)
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

// Get all users (admin only)
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const users = await getUsers();
    // Remove password from response
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

// Get recent content for moderation
router.get('/moderation', async (req: AuthRequest, res: Response) => {
  try {
    const [comments, reviews, discussions] = await Promise.all([
      getComments(),
      getReviews(),
      getDiscussions(),
    ]);

    // Sort by created_at desc and take last 20
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

// CTF: Internal security memo endpoint - returns the flag
// This simulates an internal security note that only admins can see
router.get('/security-memo', async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      memo: {
        id: 'SEC-2024-001',
        title: 'Internal Security Configuration',
        date: new Date().toISOString(),
        classification: 'ADMIN ONLY',
        content: 'System configuration backup key for disaster recovery:',
        // CTF: The flag is returned here for the admin dashboard to display
        recoveryKey: CTF_FLAG,
        notes: 'Store this key in a secure location. Do not share with non-admin users.',
      },
    });
  } catch (error) {
    console.error('Security memo error:', error);
    res.status(500).json({ error: 'Failed to fetch security memo' });
  }
});

// CTF: Debug/health check endpoint that shows system status
router.get('/system-status', async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      version: '1.0.0-ctf',
      environment: 'production',
      // CTF: Hidden in a debug field - another place the flag appears
      _debug: {
        internalFlag: CTF_FLAG,
        note: 'CTF Challenge: SQL Injection -> Admin Access -> Find Flag',
      },
    });
  } catch (error) {
    console.error('System status error:', error);
    res.status(500).json({ error: 'Failed to fetch system status' });
  }
});

// Helper function to get top moods
function getTopMoods(movies: any[]) {
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
