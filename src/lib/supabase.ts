// src/lib/supabase.ts

import { createClient } from "@supabase/supabase-js";

// Load environment variables using the VITE prefix
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail fast if keys are missing
if (!supabaseUrl || !supabaseAnonKey) {
  // This will throw an error if the .env file is not set up correctly
  console.error("Supabase URL:", supabaseUrl);
  console.error("Supabase Anon Key:", supabaseAnonKey);
  throw new Error(
    "Missing Supabase configuration keys. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file."
  );
}

// Create a single supabase client for the application
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: localStorage, 
        autoRefreshToken: true,
        persistSession: true,
    }
});