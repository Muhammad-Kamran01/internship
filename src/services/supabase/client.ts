import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase configuration from environment or project defaults
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://lgtimlxilrzvgpfmkoin.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndGltbHhpbHJ6dmdwZm1rb2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMzI4ODksImV4cCI6MjEwMDgwODg4OX0.T_omXNQOq7nlbUlTNDjrrRyTiMkXL5_XfEOp4B9OgLw';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY &&
  !SUPABASE_ANON_KEY.includes('placeholder') &&
  SUPABASE_ANON_KEY !== 'your-anon-key-here'
);

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const SUPABASE_PROJECT_URL = SUPABASE_URL;

/**
 * Storage Bucket Constants for Supabase Storage
 */
export const STORAGE_BUCKET_NAME = 'project-attachments';