import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

if (JWT_SECRET === 'your-secret-key' && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be set in production.');
}

if (JWT_SECRET === 'your-secret-key') {
  console.warn('WARNING: Using default JWT secret. Set JWT_SECRET in your .env file.');
}
