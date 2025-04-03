
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
  console.log("Admin import user function called");
  
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request");
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  try {
    console.log("Processing import request");
    
    // Get credentials from ENV file
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Make sure credentials are available
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase credentials");
      return new Response(
        JSON.stringify({ error: "Missing Supabase credentials", success: false }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Create Supabase client with service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Safely parse the request body with error handling
    let requestData;
    try {
      const text = await req.text();
      console.log("Request payload:", text);
      requestData = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid request format", success: false }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get user data from request body with safety check
    const { user } = requestData as { user?: ImportedUser };

    // Verify that user data is present
    if (!user) {
      console.error("Missing user data:", JSON.stringify(requestData));
      return new Response(
        JSON.stringify({ error: "Missing user data", data: requestData, success: false }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Verify that required fields are present
    if (!user.username) {
      console.error("Missing required username:", JSON.stringify(user));
      return new Response(
        JSON.stringify({ error: "Username is required", success: false }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Generate ID if not provided
    if (!user.id) {
      console.log("No ID provided, generating one");
      const uuid = crypto.randomUUID();
      user.id = uuid;
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
        gdpr_consent: user.gdpr_consent === undefined ? true : user.gdpr_consent
      })
      .select();

    if (error) {
      console.error("Admin import error:", error);
      return new Response(
        JSON.stringify({ error: error.message, success: false }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Return success response
    console.log("User imported successfully:", data);
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
      JSON.stringify({ error: error.message, stack: error.stack, success: false }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
