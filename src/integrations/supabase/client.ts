
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
  },
  global: {
    headers: {
      'x-client-info': `supabase-js/2.46.2`,
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
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
    console.log('Checking Supabase client health...');
    
    // Simple ping to check if client can reach Supabase
    const { data, error } = await supabase
      .from('PATOLOGIE')
      .select('count(*)', { count: 'exact', head: true })
      .limit(1);
    
    if (error) {
      console.error('Supabase health check failed:', error);
      return false;
    }
    
    console.log('Supabase client health check passed');
    return true;
  } catch (error) {
    console.error('Supabase client health check failed:', error);
    return false;
  }
};

// Reset the Supabase client - useful when client state gets corrupted
export const resetSupabaseClient = async () => {
  try {
    console.log('Resetting Supabase client state...');
    
    // Sign out first to clear any existing session
    await supabase.auth.signOut();
    
    // Clear local storage auth data
    localStorage.removeItem('stomale-auth');
    localStorage.removeItem('supabase.auth.token');
    
    // Wait a moment for everything to clear
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return a new client instance with API key properly set
    const newClient = createClient<Database>(supabaseUrl, supabaseKey, {
      ...supabaseOptions,
      global: {
        ...supabaseOptions.global,
        headers: {
          ...supabaseOptions.global.headers,
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        }
      }
    });
    
    console.log('Supabase client reset successfully');
    return newClient;
  } catch (error) {
    console.error('Failed to reset Supabase client:', error);
    throw error;
  }
};

// Function to verify API key is working
export const verifyApiKeyWorks = async () => {
  try {
    console.log('Verifying Supabase API key is working...');
    
    // Fetch a simple public query to verify the API key works
    const { data, error } = await supabase
      .from('PATOLOGIE')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('API key verification failed:', error);
      return false;
    }
    
    console.log('API key verification passed');
    return true;
  } catch (error) {
    console.error('API key verification failed with exception:', error);
    return false;
  }
};

// Check the API key on load
verifyApiKeyWorks().then(works => {
  if (!works) {
    console.error('WARNING: Supabase API key verification failed on load');
  }
});
