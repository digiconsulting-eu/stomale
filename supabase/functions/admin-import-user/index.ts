
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

// Define CORS headers for the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  try {
    // Get credentials from ENV file
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    // Make sure credentials are available
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase credentials");
      return new Response(
        JSON.stringify({ error: "Missing Supabase credentials" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Create Supabase client with service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user data from request body
    const { user } = await req.json() as { user: ImportedUser };

    // Verify that user data is present
    if (!user || !user.id || !user.username) {
      console.error("Missing required user data:", JSON.stringify(user));
      return new Response(
        JSON.stringify({ error: "Missing required user data", data: user }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Attempting to insert user with service role:", {
      id: user.id,
      username: user.username,
      hasEmail: !!user.email
    });

    // Insert user with service role
    const { data, error } = await supabase
      .from("users")
      .insert({
        id: user.id,
        username: user.username,
        email: user.email,
        birth_year: user.birth_year,
        gender: user.gender,
        created_at: user.created_at || new Date().toISOString(),
        gdpr_consent: user.gdpr_consent
      });

    if (error) {
      console.error("Admin import error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Return success response
    console.log("User imported successfully");
    return new Response(
      JSON.stringify({ success: true, message: "User imported successfully", data }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Function error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
