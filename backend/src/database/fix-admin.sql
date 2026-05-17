-- Admin user setup (run in Supabase SQL Editor)
-- Set a strong password via the seed script (ADMIN_PASSWORD) or update manually.

ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'
CHECK (role IN ('user', 'admin'));

UPDATE users
SET role = 'admin'
WHERE email = 'admin@filmmood.app';

-- Remove legacy SQL injection RPC if it exists from older deployments
DROP FUNCTION IF EXISTS authenticate_user(TEXT, TEXT);

SELECT 'Admin setup complete' AS status;
SELECT email, role FROM users WHERE role = 'admin';
