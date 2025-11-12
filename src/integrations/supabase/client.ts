
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import type { AuthFlowType } from '@supabase/supabase-js';

const supabaseUrl = "https://hnuhdoycwpjfjhthfqbt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudWhkb3ljd3BqZmpodGhmcWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwOTAxOTcsImV4cCI6MjA0ODY2NjE5N30.oE_g8iFcu9UdsHeZhFLYpArJWa7hNFWnsR5x1E8ZGA0";

// Enhanced initialization options for better stability
const supabaseOptions = {
  auth: {
    persistSession: true,
    storageKey: 'stomale-auth',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce' as AuthFlowType,
    debug: true, // Enable debug mode to log auth events
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // hard timeout 4s

    const response = await fetch(`${supabaseUrl}/rest/v1/PATOLOGIE?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('Supabase health check failed with HTTP status:', response.status);
      return false;
    }

    console.log('Supabase client health check passed');
    return true;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.warn('Supabase health check aborted due to timeout');
      return false;
    }
    console.error('Supabase client health check failed with exception:', error);
    return false;
  }
};

// Reset the Supabase client with cleaner approach
export const resetSupabaseClient = async () => {
  try {
    console.log('Resetting Supabase client state...');
    
    // Sign out to clear session
    await supabase.auth.signOut({ scope: 'local' });
    
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    
    const response = await fetch(`${supabaseUrl}/rest/v1/PATOLOGIE?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('API key verification failed with HTTP status:', response.status);
      return false;
    }
    
    console.log('API key verification passed');
    return true;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.warn('API key verification aborted due to timeout');
      return false;
    }
    console.error('API key verification failed with exception:', error);
    return false;
  }
};

// Check the API key immediately
verifyApiKeyWorks()
  .then(isWorking => {
    if (isWorking) {
      console.log('Supabase API key is valid and working');
    } else {
      console.error('Supabase API key is not working correctly');
    }
  });
