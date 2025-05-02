
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
    
    // Get webhook URL from profile or config
    const webhookUrl = profile.webhook_url;
    
    // If webhook_url doesn't exist on profile, get it from webhook_config
    let configWebhookUrl = '';
    
    if (!webhookUrl) {
      const { data: webhookConfigData } = await supabase
        .from('webhook_config')
        .select('*')
        .single();
  
      // Define default webhook configuration
      const defaultWebhookFields: WebhookFields = {
        user_data: true,
        weight_data: true,
        goal_data: true,
        activity_data: false,
        detailed_analysis: false
      };
      
      // Safely extract webhook fields from the database response
      let webhookFields: WebhookFields = defaultWebhookFields;
      
      if (webhookConfigData?.fields && typeof webhookConfigData.fields === 'object' && !Array.isArray(webhookConfigData.fields)) {
        // Cast to unknown first to avoid direct type assertion errors
        const fieldsObject = webhookConfigData.fields as unknown as Record<string, boolean>;
        
        // Safely construct the webhook fields
        webhookFields = {
          user_data: fieldsObject.user_data ?? defaultWebhookFields.user_data,
          weight_data: fieldsObject.weight_data ?? defaultWebhookFields.weight_data,
          goal_data: fieldsObject.goal_data ?? defaultWebhookFields.goal_data,
          activity_data: fieldsObject.activity_data ?? defaultWebhookFields.activity_data,
          detailed_analysis: fieldsObject.detailed_analysis ?? defaultWebhookFields.detailed_analysis
        };
      }
      
      const webhookConfig: WebhookConfig = {
        url: (webhookConfigData?.url as string) || '',
        days: (webhookConfigData?.days as number) || 30,
        fields: webhookFields
      };
      
      configWebhookUrl = webhookConfig.url;
    }
    
    const finalWebhookUrl = webhookUrl || configWebhookUrl || '';
    
    if (!finalWebhookUrl) {
      throw new Error("Webhook URL not configured. Please contact an administrator.");
    }
    
    // Prepare data to send to webhook
    const daysToFetch = 30; // Default to 30 days if not specified
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
    
    // Prepare payload for webhook
    const payload: Record<string, any> = {
      user: userData,
      weight_entries: weightData,
      goals: goalData
    };
    
    // Send data to webhook
    const response = await fetch(finalWebhookUrl, {
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
