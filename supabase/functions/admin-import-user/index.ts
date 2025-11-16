
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
  'Content-Type': 'application/json',
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
          headers: corsHeaders
        }
      );
    }

    // Create Supabase client with service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Safely parse the request body with error handling
    let requestData;
    try {
      const text = await req.text();
      console.log("Request payload:", text.substring(0, 200) + (text.length > 200 ? "..." : ""));
      requestData = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid request format", success: false }),
        { 
          status: 400, 
          headers: corsHeaders
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
          headers: corsHeaders
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
          headers: corsHeaders
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

    // First check if a profile for this user ID exists in the auth.users table
    // If not, we need to create it to satisfy the foreign key constraint
    const { data: existingAuthUser } = await supabase.auth.admin.getUserById(user.id);
    
    if (!existingAuthUser || !existingAuthUser.user) {
      console.log("User ID not found in auth.users table, creating placeholder auth user");
      
      // Try to use the email from the imported user data, or generate a placeholder one
      const email = user.email || `placeholder_${user.id}@example.com`;
      
      // Create a placeholder user in the auth.users table
      const { error: createAuthUserError } = await supabase.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: {
          user_id: user.id,
          birth_year: user.birth_year,
          gender: user.gender,
          gdprConsent: user.gdpr_consent === undefined ? true : user.gdpr_consent
        },
        created_at: user.created_at || new Date().toISOString()
      });
      
      if (createAuthUserError) {
        console.error("Failed to create auth user:", createAuthUserError);
        return new Response(
          JSON.stringify({ 
            error: "Failed to create auth user: " + createAuthUserError.message,
            success: false 
          }),
          { 
            status: 400, 
            headers: corsHeaders
          }
        );
      }
      
      console.log("Created placeholder auth user successfully");
    }

    // Now run the admin_insert_user RPC function
    const { data, error } = await supabase.rpc('admin_insert_user', {
      p_id: user.id,
      p_username: user.username,
      p_email: user.email || null,
      p_birth_year: user.birth_year || null,
      p_gender: user.gender || null,
      p_created_at: user.created_at || new Date().toISOString(),
      p_gdpr_consent: user.gdpr_consent === undefined ? true : user.gdpr_consent
    });

    if (error) {
      console.error("Admin import error:", error);
      return new Response(
        JSON.stringify({ error: error.message, success: false }),
        { 
          status: 400, 
          headers: corsHeaders
        }
      );
    }

    // Return success response
    console.log("User imported successfully:", data);
    return new Response(
      JSON.stringify({ success: true, message: "User imported successfully", data }),
      { 
        status: 200, 
        headers: corsHeaders
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Function error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, stack: errorStack, success: false }),
      { 
        status: 500, 
        headers: corsHeaders
      }
    );
  }
});
