
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

    // Check if user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized: Authentication required');
    }

    // Check if user exists and has not exceeded limit
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*, webhook_limit, webhook_count, last_webhook_date, webhook_url, preferred_unit, timezone, is_admin, is_suspended, created_at, updated_at')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) throw new Error('User profile not found');

    // Check if user is suspended
    if (profile.is_suspended) {
      throw new Error('Your account has been suspended. Please contact support.');
    }

    // Check if user has exceeded their webhook limit
    const currentDate = new Date();
    const lastWebhookDate = profile.last_webhook_date ? new Date(profile.last_webhook_date) : null;
    const isNewDay = !lastWebhookDate || 
                    currentDate.getDate() !== lastWebhookDate.getDate() ||
                    currentDate.getMonth() !== lastWebhookDate.getMonth() ||
                    currentDate.getFullYear() !== lastWebhookDate.getFullYear();
    
    if (!isNewDay && (profile.webhook_count >= profile.webhook_limit)) {
      throw new Error(`You have reached your daily limit of ${profile.webhook_limit} AI analyses. Please try again tomorrow or upgrade to a premium plan.`);
    }

    // Get webhook configuration
    const { data: webhookConfig } = await supabaseClient
      .from('webhook_config')
      .select('*')
      .single();
    
    if (!webhookConfig) {
      throw new Error('Webhook configuration not found');
    }

    const webhookUrl = profile.webhook_url || webhookConfig.url;
    if (!webhookUrl) {
      throw new Error('No webhook URL configured');
    }

    // Get data for the specified time range
    const daysToFetch = webhookConfig.days || 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToFetch);
    
    // Get weight entries
    const { data: weightData, error: weightError } = await supabaseClient
      .from('weight_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true });
      
    if (weightError) throw weightError;
    
    // Get goals
    const { data: goalData, error: goalError } = await supabaseClient
      .from('goals')
      .select('*')
      .eq('user_id', user.id);
      
    if (goalError) throw goalError;

    // Build payload including all user fields
    const payload: Record<string, any> = { 
      timestamp: new Date().toISOString(),
      version: "1.2", 
      account_id: user.id,
      user_id: user.id,
      email: user.email,
      created_at: profile.created_at,
      last_accessed: new Date().toISOString(),
      webhook_call_count: isNewDay ? 1 : (profile.webhook_count + 1),
      api_limit_status: (profile.webhook_count >= profile.webhook_limit) ? "exceeded" : "within_limit",
      authentication_status: "verified",
      preferred_unit: profile.preferred_unit || "kg",
      timezone: profile.timezone || "UTC"
    };
    
    // Include additional account fields if enabled
    if (webhookConfig.include_account_fields) {
      payload.account = {
        id: user.id,
        created_at: profile.created_at,
        last_accessed: new Date().toISOString(),
        api_limit_status: (profile.webhook_count >= profile.webhook_limit) ? "exceeded" : "within_limit",
        webhook_call_count: isNewDay ? 1 : (profile.webhook_count + 1),
      };
    }
    
    // Include additional user fields if enabled
    if (webhookConfig.include_user_fields) {
      payload.user = {
        ...profile,
        email: user.email,
        auth_id: user.id
      };
    }
    
    // Include weight entries if enabled
    if (webhookConfig.include_weight_entries) {
      payload.weight_entries = weightData ? weightData.map(entry => ({
        ...entry,
        weight_unit: profile.preferred_unit || "kg"
      })) : [];
    }
    
    // Include goals if enabled
    if (webhookConfig.include_goals) {
      payload.goals = goalData || [];
    }
    
    // Create webhook log entry
    const { data: webhookLog, error: webhookLogError } = await supabaseClient
      .from('webhook_logs')
      .insert({
        user_id: user.id,
        request_payload: payload,
        url: webhookUrl,
        status: 'pending'
      })
      .select('id')
      .single();

    if (webhookLogError) {
      console.error('Error creating webhook log:', webhookLogError);
    }

    const logId = webhookLog?.id;
    
    // Send data to webhook
    console.log(`Sending data to webhook: ${webhookUrl}`);
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!webhookResponse.ok) {
      throw new Error(`Webhook returned ${webhookResponse.status} ${webhookResponse.statusText}`);
    }
    
    const responseData = await webhookResponse.json();
    
    // Update webhook log with response
    if (logId) {
      await supabaseClient
        .from('webhook_logs')
        .update({
          response_payload: responseData,
          status: webhookResponse.ok ? 'success' : 'error'
        })
        .eq('id', logId);
    }
    
    // Increment webhook count
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        webhook_count: isNewDay ? 1 : (profile.webhook_count + 1),
        last_webhook_date: new Date().toISOString()
      })
      .eq('id', user.id);
      
    if (updateError) {
      console.error('Error updating webhook count:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: responseData.message || "AI analysis complete.",
        insights: responseData.insights || null,
        response: responseData,
        format_version: "1.2"
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  } catch (error) {
    console.error('Error processing AI insights request:', error);
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
