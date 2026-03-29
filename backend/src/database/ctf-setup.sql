-- ============================================
-- FilmSEC CTF Challenge - Complete Database Setup
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Add role column to users table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' 
        CHECK (role IN ('user', 'admin'));
    END IF;
END $$;

-- 3. Create the vulnerable RPC function for CTF SQL injection challenge
-- This function is INTENTIONALLY VULNERABLE - uses dynamic SQL with string concatenation
CREATE OR REPLACE FUNCTION authenticate_user(p_email TEXT, p_password TEXT)
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  name VARCHAR,
  avatar TEXT,
  role VARCHAR,
  password VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- CTF INTENTIONAL SQL INJECTION VULNERABILITY
  -- Using string concatenation makes this vulnerable to SQL injection
  RETURN QUERY EXECUTE '
    SELECT u.id, u.email, u.name, u.avatar, u.role, u.password, u.created_at
    FROM users u
    WHERE u.email = ''' || p_email || '''
    LIMIT 1';
END;
$$;

-- 4. Create or update admin user
-- CTF Admin Credentials:
-- Email: admin@filmsec.com
-- Password: AdminSecure2024!
INSERT INTO users (id, email, name, password, role, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',  -- Fixed UUID for admin
  'admin@filmsec.com',
  'System Administrator',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  -- bcrypt hash of 'AdminSecure2024!'
  'admin',
  NOW()
)
ON CONFLICT (email) DO UPDATE 
SET 
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  password = EXCLUDED.password;

-- 5. Verify setup
SELECT 'Database setup complete!' as status;
SELECT 'Admin user:' as info, email, name, role FROM users WHERE role = 'admin';
SELECT 'Total users:' as info, COUNT(*) as count FROM users;
