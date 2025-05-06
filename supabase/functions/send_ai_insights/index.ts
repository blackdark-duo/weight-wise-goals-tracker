
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, authenticateUser, checkWebhookLimit } from "./auth.ts";
import { 
  fetchUserData, 
  buildPayload,
  createWebhookLog,
  updateWebhookLog,
  updateWebhookCount
} from "./data.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user and get profile
    const { user, profile, supabaseClient } = await authenticateUser(req);
    
    // Check if user has exceeded their webhook limit
    const { isNewDay } = checkWebhookLimit(profile);

    // Get webhook URL from profile or config
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

    // Get data for the user
    const daysToFetch = webhookConfig.days || 30;
    const { weightData, goalData } = await fetchUserData(supabaseClient, user.id, daysToFetch);
    
    // Build payload
    const payload = buildPayload(
      user.id, 
      profile.email || user.email, 
      profile.preferred_unit, 
      weightData, 
      goalData
    );
    
    // Create webhook log entry
    const logId = await createWebhookLog(supabaseClient, user.id, payload, webhookUrl);
    
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
    
    // Get plain text response
    const responseText = await webhookResponse.text();
    
    // Update webhook log with response
    await updateWebhookLog(supabaseClient, logId, responseText, webhookResponse.ok);
    
    // Increment webhook count
    await updateWebhookCount(
      supabaseClient,
      user.id,
      isNewDay,
      profile.webhook_count
    );

    return new Response(
      JSON.stringify({ 
        success: true,
        message: responseText.substring(0, 1000) // Limit to 1000 characters
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
