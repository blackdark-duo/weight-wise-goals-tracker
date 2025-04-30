
import { serve } from 'http/server'

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

    // Get the webhook config
    const { data, error } = await supabaseClient
      .from('webhook_config')
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ data }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  } catch (error) {
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

import { createClient } from '@supabase/supabase-js'
