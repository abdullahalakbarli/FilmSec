import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: jwt.JwtPayload | string | undefined) => {
    if (err || !decoded || typeof decoded === 'string') {
      let errorMessage = 'Invalid or expired token';
      if (err?.name === 'TokenExpiredError') {
        errorMessage = 'Token expired';
      } else if (err?.name === 'JsonWebTokenError') {
        errorMessage = 'Invalid token';
      }
      return res.status(401).json({ error: errorMessage });
    }

    req.userId = decoded.userId as string;
    req.user = {
      id: decoded.userId as string,
      email: decoded.email as string,
      name: decoded.name as string,
      role: (decoded.role as string) || 'user',
    };

    next();
  });
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded: jwt.JwtPayload | string | undefined) => {
      if (!err && decoded && typeof decoded !== 'string') {
        req.userId = decoded.userId as string;
        req.user = {
          id: decoded.userId as string,
          email: decoded.email as string,
          name: decoded.name as string,
          role: (decoded.role as string) || 'user',
        };
      }
    });
  }

  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};
