
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = Deno.env.get('SUPABASE_URL') 
      ? createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )
      : null;

    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    // Check if user is authorized (admin)
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized: Authentication required');
    }

    // Check if user is an admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    if (!profile?.is_admin) {
      throw new Error('Unauthorized: Admin privileges required');
    }

    // Get the request body
    const { url, days, fields } = await req.json();
    
    // Validate the request data
    if (!url) throw new Error('Webhook URL is required');
    if (!days || isNaN(days) || days < 1) throw new Error('Days must be a positive number');
    if (!fields) throw new Error('Fields configuration is required');
    
    // Update the webhook config
    const { data, error } = await supabaseClient
      .from('webhook_config')
      .update({
        url,
        days,
        fields
      })
      .eq('id', 1)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  } catch (error) {
    console.error('Error updating webhook config:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  }
})
