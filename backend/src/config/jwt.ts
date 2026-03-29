// Shared JWT configuration to ensure consistency across all modules
import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Validate on first import
if (JWT_SECRET === 'your-secret-key') {
  console.warn('⚠️  WARNING: Using default JWT secret. Please set JWT_SECRET environment variable in production.');
}

console.log('JWT Secret loaded (first 10 chars):', JWT_SECRET.substring(0, 10) + '...');
