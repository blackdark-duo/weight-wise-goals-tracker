
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

    // Get webhook URL from webhook_config (admin config)
    const { data: webhookConfig } = await supabaseClient
      .from('webhook_config')
      .select('*')
      .single();
    
    if (!webhookConfig || !webhookConfig.url) {
      throw new Error('Default webhook URL not configured by admin');
    }

    // Always use the admin-configured URL (override user URL)
    const webhookUrl = webhookConfig.url;
    
    // Get data for the user
    const daysToFetch = webhookConfig.days || 30;
    const { weightData, goalData } = await fetchUserData(supabaseClient, user.id, daysToFetch);
    
    // Build payload with new format
    const payload = buildPayload(
      user.id, 
      profile.email || user.email,
      profile.display_name,
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
    
    // Get HTML response
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
        message: responseText // Return the full HTML response
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
