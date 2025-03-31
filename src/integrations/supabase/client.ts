
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import type { AuthFlowType } from '@supabase/supabase-js';

const supabaseUrl = "https://hnuhdoycwpjfjhthfqbt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudWhkb3ljd3BqZmpodGhmcWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwOTAxOTcsImV4cCI6MjA0ODY2NjE5N30.oE_g8iFcu9UdsHeZhFLYpArJWa7hNFWnsR5x1E8ZGA0";

// Fixed initialization options for better stability
const supabaseOptions = {
  auth: {
    persistSession: true,
    storageKey: 'stomale-auth',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce' as AuthFlowType,
  },
  global: {
    headers: {
      'x-client-info': `supabase-js/2.46.2`,
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 1
    }
  }
};

// Initialize a single instance of the Supabase client to prevent multiple instances
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, supabaseOptions);

// Improved client health check function with better error handling
export const checkClientHealth = async (): Promise<boolean> => {
  try {
    console.log('Checking Supabase client health...');
    
    // Check if client can reach Supabase with a minimal query
    const { error } = await supabase
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
    console.error('Supabase client health check failed with exception:', error);
    return false;
  }
};

// Reset the Supabase client with cleaner approach
export const resetSupabaseClient = async () => {
  try {
    console.log('Resetting Supabase client state...');
    
    // Sign out to clear session
    await supabase.auth.signOut();
    
    // Clear local storage auth data
    localStorage.removeItem('stomale-auth');
    
    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('Supabase client reset successfully');
    
    // Return the existing client after reset (no need to create a new one)
    return supabase;
  } catch (error) {
    console.error('Failed to reset Supabase client:', error);
    throw error;
  }
};

// Verify API key is working
export const verifyApiKeyWorks = async () => {
  try {
    console.log('Verifying Supabase API key is working...');
    
    const { data, error } = await supabase
      .from('PATOLOGIE')
      .select('id')
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

// Check the API key immediately
verifyApiKeyWorks();
