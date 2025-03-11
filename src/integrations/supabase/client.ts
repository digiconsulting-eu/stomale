
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://hnuhdoycwpjfjhthfqbt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudWhkb3ljd3BqZmpodGhmcWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwOTAxOTcsImV4cCI6MjA0ODY2NjE5N30.oE_g8iFcu9UdsHeZhFLYpArJWa7hNFWnsR5x1E8ZGA0";

// Opzioni per la configurazione del client
const supabaseOptions = {
  auth: {
    // Configurazione del dominio personalizzato per l'autenticazione
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Imposta il dominio personalizzato per l'autenticazione
    domain: 'auth.stomale.info',
    // Imposta URL pubblico per la tua app
    redirectTo: 'https://stomale.info/dashboard'
  }
};

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, supabaseOptions);
