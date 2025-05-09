
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error("Error parsing request JSON:", e);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    const { url, days, fields, default_webhook_limit } = body;

    // Validate inputs
    if (!url || typeof url !== 'string') {
      throw new Error('URL is required and must be a string');
    }

    if (!days || typeof days !== 'number' || days <= 0) {
      throw new Error('Days must be a positive number');
    }

    if (!fields || typeof fields !== 'object') {
      throw new Error('Fields must be an object');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are not set');
    }
    
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Check if user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error("Authentication error:", userError);
      throw new Error('Unauthorized: Authentication required');
    }

    // Check if user is an admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw new Error(`Error fetching profile: ${profileError.message}`);
    }

    if (!profile?.is_admin) {
      throw new Error('Unauthorized: Admin privileges required');
    }

    // Update webhook config
    const updateData = {
      url,
      days,
      fields,
    };
    
    // Add default_webhook_limit if provided
    if (default_webhook_limit !== undefined && typeof default_webhook_limit === 'number') {
      Object.assign(updateData, { default_webhook_limit });
    }

    const { data, error } = await supabaseClient
      .from('webhook_config')
      .update(updateData)
      .eq('id', 1)
      .select();

    if (error) {
      console.error("Error updating webhook config:", error);
      throw new Error(`Error updating webhook config: ${error.message}`);
    }

    // Also update all user profiles to use this URL
    const { error: profilesError } = await supabaseClient
      .from('profiles')
      .update({ webhook_url: url });

    if (profilesError) {
      console.warn("Error updating profile webhook URLs:", profilesError);
      // Continue execution, don't throw here to avoid failing the whole operation
    }

    return new Response(
      JSON.stringify({
        message: 'Webhook configuration updated successfully',
        data,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error: any) {
    console.error('Error in update_webhook_config:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});
