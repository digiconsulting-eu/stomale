
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://hnuhdoycwpjfjhthfqbt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudWhkb3ljd3BqZmpodGhmcWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwOTAxOTcsImV4cCI6MjA0ODY2NjE5N30.oE_g8iFcu9UdsHeZhFLYpArJWa7hNFWnsR5x1E8ZGA0";

// Options for the Supabase client configuration
const supabaseOptions = {
  auth: {
    // Authentication configuration
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' as const,
    // Set the custom domain for authentication
    domain: 'auth.stomale.info'
  }
};

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, supabaseOptions);
