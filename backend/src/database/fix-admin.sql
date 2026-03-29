-- Fix the admin user role and ensure proper setup

-- 1. Ensure role column exists on users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' 
CHECK (role IN ('user', 'admin'));

-- 2. Update existing admin@filmsec.com user to have admin role
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@filmsec.com';

-- 3. If admin user doesn't exist, create it
INSERT INTO users (id, email, name, password, role, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'admin@filmsec.com',
  'System Administrator',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin',
  NOW()
)
ON CONFLICT (email) DO UPDATE 
SET role = 'admin';

-- 4. Create the SQL injection vulnerable function if not exists
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
  RETURN QUERY EXECUTE '
    SELECT u.id, u.email, u.name, u.avatar, u.role, u.password, u.created_at
    FROM users u
    WHERE u.email = ''' || p_email || '''
    LIMIT 1';
END;
$$;

-- 5. Verify admin user
SELECT 'Admin user role:' as check, email, role FROM users WHERE email = 'admin@filmsec.com';
