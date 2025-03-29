
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface ImportedUser {
  id: string;
  username: string;
  email?: string;
  birth_year?: string;
  gender?: string;
  created_at?: string;
  gdpr_consent?: boolean;
}

serve(async (req) => {
  try {
    // Ottieni le credenziali dal file ENV della funzione
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    // Assicurati che le credenziali siano disponibili
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase credentials" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Crea un client Supabase con il role key che può bypassare RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Ottieni i dati utente dal corpo della richiesta
    const { user } = await req.json() as { user: ImportedUser };

    // Verifica che i dati utente siano presenti
    if (!user || !user.id || !user.username) {
      return new Response(
        JSON.stringify({ error: "Missing required user data" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Inserisci l'utente usando il service role
    const { data, error } = await supabase
      .from("users")
      .insert(user);

    if (error) {
      console.error("Admin import error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Restituisci una risposta di successo
    return new Response(
      JSON.stringify({ success: true, message: "User imported successfully", data }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Function error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
