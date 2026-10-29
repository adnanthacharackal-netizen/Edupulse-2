// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Load public credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verify if valid Supabase configuration is present
export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes('your-project-id') &&
      !supabaseAnonKey.includes('your-anon-public-key')
  );
};

// Initialize the Supabase client with the public anon key.
// IMPORTANT SECURITY RULE: Never use or import the service_role key in frontend browser code!
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
