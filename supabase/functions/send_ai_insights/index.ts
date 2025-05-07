
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with admin privileges
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get request body
    const requestData = await req.json();
    const userId = requestData.user_id;
    
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) throw profileError;
    
    // Check webhook limit
    if ((profile.webhook_count || 0) >= (profile.webhook_limit || 5)) {
      throw new Error("Webhook limit exceeded for this user");
    }
    
    // Get webhook URL from webhook_config (admin config)
    const { data: webhookConfig, error: webhookConfigError } = await supabase
      .from('webhook_config')
      .select('*')
      .single();
    
    if (webhookConfigError) throw webhookConfigError;
    
    if (!webhookConfig || !webhookConfig.url) {
      throw new Error('Default webhook URL not configured by admin');
    }

    // Always use the admin-configured URL (override user URL)
    const webhookUrl = webhookConfig.url;
    
    // Get data for the user
    const daysToFetch = webhookConfig.days || 30;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - daysToFetch);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
    
    // Get weight entries
    const { data: weightData, error: weightError } = await supabase
      .from('weight_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgoStr)
      .order('date', { ascending: true });
      
    if (weightError) throw weightError;
    
    // Get goals
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (goalsError) throw goalsError;
    
    // Create payload in new format
    const payload = {
      user_id: userId,
      displayName: profile.display_name || "",
      email: profile.email || "",
      unit: profile.preferred_unit || "kg",
      entries: {
        weight: weightData ? weightData.map(entry => entry.weight) : [],
        notes: weightData ? weightData.map(entry => entry.description || "") : [],
        dates: weightData ? weightData.map(entry => entry.date) : []
      }
    };
    
    // Add goal data if available
    if (goals && goals.length > 0) {
      const goal = goals[0];
      payload.goal_weight = goal.target_weight;
      
      if (goal.target_date) {
        const targetDate = new Date(goal.target_date);
        const today = new Date();
        const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        payload.goal_days = daysRemaining > 0 ? daysRemaining : 0;
      }
    }
    
    // Create webhook log entry
    const { data: logData, error: logError } = await supabase
      .from("webhook_logs")
      .insert({
        user_id: userId,
        request_payload: payload,
        url: webhookUrl,
        status: 'pending'
      })
      .select('id')
      .single();
      
    if (logError) {
      console.error("Error creating webhook log:", logError);
    }
    
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
    
    // Get HTML response
    const responseText = await webhookResponse.text();
    
    // Update webhook log with response
    if (logData?.id) {
      await supabase
        .from("webhook_logs")
        .update({
          response_payload: responseText,
          status: 'success'
        })
        .eq("id", logData.id);
    }
    
    // Increment webhook count
    await supabase
      .from("profiles")
      .update({ 
        webhook_count: (profile.webhook_count || 0) + 1,
        last_webhook_date: new Date().toISOString()
      })
      .eq("id", userId);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: responseText
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
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
    );
  }
});
