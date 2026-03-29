import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getUserByEmail, addUser, getUserById } from '../database/database';
import { User, UserPublic } from '../types';
import { JWT_SECRET } from '../config/jwt';
import { supabase } from '../config/supabase';

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

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Bu email artıq qeydiyyatdan keçib' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user (default role: user)
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

    // Generate token
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

// Sign In
// CTF NOTE: This endpoint contains an INTENTIONAL SQL INJECTION vulnerability for the challenge.
// The vulnerability allows bypassing authentication via the email parameter.
// Example exploit payload in email field: admin@filmsec.com' OR '1'='1' -- 
router.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // CTF INTENTIONAL SQL INJECTION VULNERABILITY:
    // The following query uses string concatenation with user input (email) directly,
    // making it vulnerable to SQL injection attacks.
    // This allows attackers to bypass authentication by injecting SQL code.
    // Vulnerable pattern: .eq('email', email) uses parameterized queries normally,
    // but we will use a raw query approach for the vulnerability demonstration.
    
    // For CTF challenge: Using raw SQL query that concatenates user input
    const { data: users, error } = await supabase
      .rpc('authenticate_user', { p_email: email, p_password: password });
    
    console.log('=== DEBUG authenticate_user ===');
    console.log('Input email:', email);
    console.log('RPC error:', error);
    console.log('RPC users result:', JSON.stringify(users, null, 2));
    
    // Also check via direct query
    const { data: directUser, error: directError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    console.log('Direct query result:', JSON.stringify(directUser, null, 2));
    console.log('Direct query error:', directError);
    console.log('=== END DEBUG ===');
    
    // Fallback to normal secure flow if RPC doesn't exist (development mode)
    let user: User | null = null;
    
    if (error || !users) {
      console.log('RPC failed, using fallback. Error:', error);
      // SECURE FALLBACK: Use parameterized query (this is the normal secure path)
      user = await getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ error: 'İstifadəçi tapılmadı' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Şifrə yanlışdır' });
      }
    } else {
      user = (users as User[])[0];
      console.log('User from RPC (using this):', user);
    }

    // Safety check - user should not be null at this point
    if (!user) {
      return res.status(401).json({ error: 'İstifadəçi tapılmadı' });
    }

    // DEBUG: Check what we have
    console.log('BEFORE TOKEN - user object:', JSON.stringify(user, null, 2));
    console.log('BEFORE TOKEN - user.role:', user.role);
    console.log('BEFORE TOKEN - user.role type:', typeof user.role);

    // Force admin role for admin@filmsec.com (CTF workaround)
    if (user.email === 'admin@filmsec.com') {
      console.log('Forcing admin role for admin email');
      user.role = 'admin';
    }

    // Generate token with role
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

    const decoded: any = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded:', decoded);
    
    const user = await getUserById(decoded.userId);
    console.log('User lookup result:', user);

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
  } catch (error: any) {
    console.error('Auth /me error:', error);
    let errorMessage = 'Invalid token';
    if (error.name === 'TokenExpiredError') {
      errorMessage = 'Token expired';
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid token';
    }
    res.status(401).json({ error: errorMessage });
  }
});

export default router;

