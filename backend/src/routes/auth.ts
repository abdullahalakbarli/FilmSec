import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getUserByEmail, addUser, getUserById } from '../database/database';
import { User, UserPublic } from '../types';
import { JWT_SECRET } from '../config/jwt';

const router = Router();

const generateToken = (user: UserPublic): string => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
    },
    JWT_SECRET,
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

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Bu email artıq qeydiyyatdan keçib' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserData = {
      id: uuidv4(),
      email,
      name,
      password: hashedPassword,
      role: 'user',
    };

    const newUser = await addUser(newUserData);
    if (!newUser) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    const userPublic: UserPublic = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      avatar: newUser.avatar,
      role: newUser.role || 'user',
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

// Sign In — parameterized lookup + bcrypt only (no dynamic SQL)
router.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'İstifadəçi tapılmadı' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Şifrə yanlışdır' });
    }

    const userPublic: UserPublic = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role || 'user',
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

    const decoded: jwt.JwtPayload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    const user = await getUserById(decoded.userId as string);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userPublic: UserPublic = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role || 'user',
    };

    res.json({ user: userPublic });
  } catch (error: unknown) {
    const err = error as { name?: string };
    let errorMessage = 'Invalid token';
    if (err.name === 'TokenExpiredError') {
      errorMessage = 'Token expired';
    } else if (err.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid token';
    }
    res.status(401).json({ error: errorMessage });
  }
});

export default router;
