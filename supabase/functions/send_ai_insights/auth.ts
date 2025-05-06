
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export interface Profile {
  webhook_limit: number;
  webhook_count: number;
  last_webhook_date: string | null;
  webhook_url: string | null;
  preferred_unit: string;
  is_admin: boolean;
  is_suspended: boolean;
  email: string | null;
  show_ai_insights: boolean;
}

export async function authenticateUser(req: Request) {
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
    .select('*, webhook_limit, webhook_count, last_webhook_date, webhook_url, preferred_unit, timezone, is_admin, is_suspended, created_at, updated_at, email')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) throw new Error('User profile not found');

  // Check if user is suspended
  if (profile.is_suspended) {
    throw new Error('Your account has been suspended. Please contact support.');
  }

  return { user, profile, supabaseClient };
}

export function checkWebhookLimit(profile: Profile): { canProceed: boolean; isNewDay: boolean } {
  // Check if user has exceeded their webhook limit
  const currentDate = new Date();
  const lastWebhookDate = profile.last_webhook_date ? new Date(profile.last_webhook_date) : null;
  const isNewDay = !lastWebhookDate || 
                  currentDate.getDate() !== lastWebhookDate.getDate() ||
                  currentDate.getMonth() !== lastWebhookDate.getMonth() ||
                  currentDate.getFullYear() !== lastWebhookDate.getFullYear();
  
  const canProceed = isNewDay || (profile.webhook_count < profile.webhook_limit);
  
  if (!canProceed) {
    throw new Error(`You have reached your daily limit of ${profile.webhook_limit} AI analyses. Please try again tomorrow or upgrade to a premium plan.`);
  }
  
  return { canProceed, isNewDay };
}
