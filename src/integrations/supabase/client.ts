
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import type { AuthFlowType } from '@supabase/supabase-js';

const supabaseUrl = "https://hnuhdoycwpjfjhthfqbt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudWhkb3ljd3BqZmpodGhmcWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwOTAxOTcsImV4cCI6MjA0ODY2NjE5N30.oE_g8iFcu9UdsHeZhFLYpArJWa7hNFWnsR5x1E8ZGA0";

// Enhanced options for better session handling
const supabaseOptions = {
  auth: {
    persistSession: true,
    storageKey: 'stomale-auth',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce' as AuthFlowType, // Type cast to resolve TypeScript error
    // Added timeout settings
    sessionRefreshThrottleMs: 10000, // Wait 10s before initiating another refresh
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
      
      // Create a timeout promise that rejects after 15 seconds
      const timeoutPromise = new Promise<Response>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timeout - La richiesta è scaduta. Riprova più tardi.'));
        }, 15000); // 15 seconds timeout
      });
      
      // Include a retry mechanism for network errors
      const fetchWithRetry = async (attemptsLeft: number = 2): Promise<Response> => {
        try {
          const response = await fetch(url, { ...options, headers });
          return response;
        } catch (error) {
          console.error(`Fetch error in supabase client (${attemptsLeft} attempts left):`, error);
          if (attemptsLeft > 0) {
            console.log('Retrying request...');
            // Wait 1 second before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            return fetchWithRetry(attemptsLeft - 1);
          }
          throw error;
        }
      };
      
      // Return a promise that races between the fetch and the timeout
      return Promise.race([
        fetchWithRetry(),
        timeoutPromise
      ]);
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
};

// Initialize client with improved error handling
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, supabaseOptions);

// Add client health check function
export const checkClientHealth = async (): Promise<boolean> => {
  try {
    // Simple ping to check if client can reach Supabase
    const { data, error } = await supabase.from('users')
      .select('count(*)', { count: 'exact', head: true })
      .limit(1)
      .throwOnError();
    
    return !error;
  } catch (error) {
    console.error('Supabase client health check failed:', error);
    return false;
  }
};

