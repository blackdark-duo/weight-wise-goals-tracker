
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

interface WebhookFields {
  user_data: boolean;
  weight_data: boolean;
  goal_data: boolean;
  activity_data: boolean;
  detailed_analysis: boolean;
}

interface WebhookConfig {
  url: string;
  days: number;
  fields: WebhookFields;
}

export async function fetchInsightsData(userId: string): Promise<string> {
  try {
    // First check if the user is within their rate limit
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('webhook_limit, webhook_count, last_webhook_date, webhook_url')
      .eq('id', userId)
      .single();
      
    if (profileError) throw profileError;
    
    if (!profile) {
      throw new Error("User profile not found");
    }
    
    // Check if user has exceeded their webhook limit
    const currentDate = new Date();
    const lastWebhookDate = profile.last_webhook_date ? new Date(profile.last_webhook_date) : null;
    const isNewDay = !lastWebhookDate || 
                    currentDate.getDate() !== lastWebhookDate.getDate() ||
                    currentDate.getMonth() !== lastWebhookDate.getMonth() ||
                    currentDate.getFullYear() !== lastWebhookDate.getFullYear();
    
    if (!isNewDay && (profile.webhook_count >= profile.webhook_limit)) {
      throw new Error(`You have reached your daily limit of ${profile.webhook_limit} AI analyses. Please try again tomorrow.`);
    }
    
    // Get webhook URL from profile
    const { data: webhookConfigData } = await supabase
      .from('webhook_config')
      .select('*')
      .single();

    const webhookConfig: WebhookConfig = webhookConfigData ? {
      url: webhookConfigData.url as string || '',
      days: webhookConfigData.days as number || 30,
      fields: {
        user_data: false,
        weight_data: false,
        goal_data: false,
        activity_data: false,
        detailed_analysis: false,
        ...((webhookConfigData.fields as Record<string, boolean>) || {})
      }
    } : {
      url: '',
      days: 30,
      fields: {
        user_data: true,
        weight_data: true,
        goal_data: true,
        activity_data: false,
        detailed_analysis: false
      }
    };
    
    const webhookUrl = profile.webhook_url || webhookConfig.url || '';
    
    if (!webhookUrl) {
      throw new Error("Webhook URL not configured. Please contact an administrator.");
    }
    
    // Prepare data to send to webhook
    const daysToFetch = webhookConfig?.days || 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToFetch);
    
    // Fetch weight entries
    const { data: weightData, error: weightError } = await supabase
      .from('weight_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true });
      
    if (weightError) throw weightError;
    
    // Fetch goals
    const { data: goalData, error: goalError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);
      
    if (goalError) throw goalError;
    
    // Fetch user data
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('display_name, preferred_unit')
      .eq('id', userId)
      .single();
      
    if (userError) throw userError;
    
    // Prepare payload based on the fields configuration
    const fields = webhookConfig?.fields || {
      user_data: true,
      weight_data: true,
      goal_data: true,
      activity_data: false,
      detailed_analysis: false
    };
    
    const payload: Record<string, any> = {};
    
    if (fields.user_data) {
      payload.user = userData;
    }
    
    if (fields.weight_data) {
      payload.weight_entries = weightData;
    }
    
    if (fields.goal_data) {
      payload.goals = goalData;
    }
    
    // Send data to webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status} ${response.statusText}`);
    }
    
    // Update user's webhook count and last date
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        webhook_count: isNewDay ? 1 : profile.webhook_count + 1,
        last_webhook_date: new Date().toISOString(),
      })
      .eq('id', userId);
    
    if (updateError) {
      console.error("Failed to update webhook count:", updateError);
    }
    
    const result = await response.json();
    
    return result.message || "AI analysis complete. No insights available.";
  } catch (error: any) {
    console.error("Error in fetchInsightsData:", error);
    throw error;
  }
}
