
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://hnuhdoycwpjfjhthfqbt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudWhkb3ljd3BqZmpodGhmcWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwOTAxOTcsImV4cCI6MjA0ODY2NjE5N30.oE_g8iFcu9UdsHeZhFLYpArJWa7hNFWnsR5x1E8ZGA0";

// Enhanced options for better session handling
const supabaseOptions = {
  auth: {
    persistSession: true,
    storageKey: 'stomale-auth',
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-client-info': `supabase-js/2.46.2`,
    },
    fetch: (url: string, options: RequestInit) => {
      // Add a custom header to track requests
      const headers = {
        ...options.headers,
        'x-stomale-timestamp': Date.now().toString(),
      };
      
      // Include a retry mechanism for network errors
      return fetch(url, { ...options, headers })
        .catch(error => {
          console.error('Fetch error in supabase client:', error);
          // For network errors, we could implement retry logic here
          throw error;
        });
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
};

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, supabaseOptions);
