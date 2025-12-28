import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://wjpothompgvqthbihxsh.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcG90aG9tcGd2cXRoYmloeHNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzU5MTcsImV4cCI6MjA4MjUxMTkxN30.YXPib0SB5ARaGHaenh5soHUSkbhP2MEQt_Zdv-8lJjw';

// Client for regular operations (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for service role operations (if needed)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcG90aG9tcGd2cXRoYmloeHNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjkzNTkxNywiZXhwIjoyMDgyNTExOTE3fQ.KJS2Kl0BS0DSnpapw_v0MPbxuKp0NVC42RK0LJ_i_Kg';
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

