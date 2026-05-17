-- Run once in Supabase SQL Editor to remove a legacy vulnerable login function.
DROP FUNCTION IF EXISTS authenticate_user(TEXT, TEXT);
