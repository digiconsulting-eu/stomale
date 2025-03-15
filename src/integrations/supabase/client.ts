
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://hnuhdoycwpjfjhthfqbt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudWhkb3ljd3BqZmpodGhmcWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwOTAxOTcsImV4cCI6MjA0ODY2NjE5N30.oE_g8iFcu9UdsHeZhFLYpArJWa7hNFWnsR5x1E8ZGA0";

// Use minimal options to avoid configuration issues
const supabaseOptions = {
  auth: {
    persistSession: true,
    storageKey: 'stomale-auth',
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: (url: string, options: RequestInit) => fetch(url, options)
  }
};

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, supabaseOptions);
