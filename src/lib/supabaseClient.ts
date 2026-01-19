// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// ✅ FIXED: Use import.meta.env for Vite. 
// "process.env" does not exist in Vite and causes the "process is not defined" crash.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Key missing. Check your .env file.');
}

// Create and export the client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    auth: {
        storage: localStorage,
        autoRefreshToken: true,
        persistSession: true,
    }
});