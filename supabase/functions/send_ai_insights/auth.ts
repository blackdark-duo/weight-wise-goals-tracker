
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Authenticate user and get profile data
export async function authenticateUser(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

  // Create authenticated Supabase client
  const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

  // Get the authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Missing Authorization header');
  }
  
  // Get the JWT token
  const accessToken = authHeader.replace('Bearer ', '');
  
  // Get user from JWT
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser(accessToken);

  if (userError || !user) {
    throw new Error('Invalid user token');
  }
  
  // Get user profile
  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (profileError) {
    console.error("Error fetching profile:", profileError);
    throw new Error('Error fetching user profile');
  }
  
  return {
    user,
    profile,
    supabaseClient
  };
}

// Check if user has exceeded their webhook limit
export function checkWebhookLimit(profile: any) {
  const webhookCount = profile.webhook_count || 0;
  const webhookLimit = profile.webhook_limit || 5;
  
  if (webhookCount >= webhookLimit) {
    // Check if it's a new day to reset the counter
    const lastWebhookDate = profile.last_webhook_date ? new Date(profile.last_webhook_date) : null;
    const today = new Date();
    const isNewDay = !lastWebhookDate || 
      lastWebhookDate.getDate() !== today.getDate() || 
      lastWebhookDate.getMonth() !== today.getMonth() || 
      lastWebhookDate.getFullYear() !== today.getFullYear();
      
    if (!isNewDay) {
      throw new Error(`Webhook limit reached (${webhookCount}/${webhookLimit})`);
    }
    
    return { isNewDay };
  }
  
  return { isNewDay: false };
}
