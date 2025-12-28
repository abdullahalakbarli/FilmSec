import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getUserByEmail, addUser, getUserById } from '../database/database';
import { User, UserPublic } from '../types';

const router = Router();

const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

const generateToken = (user: UserPublic): string => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
    },
    jwtSecret,
    { expiresIn: '7d' }
  );
};

// Sign Up
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Bu email artıq qeydiyyatdan keçib' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUserData = {
      id: uuidv4(),
      email,
      name,
      password: hashedPassword,
    };

    const newUser = await addUser(newUserData);
    if (!newUser) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Generate token
    const userPublic: UserPublic = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      avatar: newUser.avatar,
    };

    const token = generateToken(userPublic);

    res.status(201).json({
      token,
      user: userPublic,
    });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign In
router.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'İstifadəçi tapılmadı' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Şifrə yanlışdır' });
    }

    // Generate token
    const userPublic: UserPublic = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    };

    const token = generateToken(userPublic);

    res.json({
      token,
      user: userPublic,
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded: any = jwt.verify(token, jwtSecret);
    const user = await getUserById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userPublic: UserPublic = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    };

    res.json({ user: userPublic });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;

