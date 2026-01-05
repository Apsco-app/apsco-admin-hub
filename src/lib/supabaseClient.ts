// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace the placeholders with your actual keys from your Supabase project settings
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_PROJECT_URL';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided in environment variables or directly.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);