
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { webhookService } from "./centralizedWebhookService";

export interface WebhookFields {
  user_data: boolean;
  weight_data: boolean;
  goal_data: boolean;
  activity_data: boolean;
  detailed_analysis: boolean;
}

export interface WebhookConfig {
  id?: number;
  url: string;
  days: number;
  include_account_fields: boolean;
  include_user_fields: boolean;
  fields: WebhookFields;
  include_goals?: boolean;
  include_weight_entries?: boolean;
  webhook_version?: string;
}

/**
 * Fetch the webhook URL for a user from their profile
 * Now uses centralized webhook service
 */
export const fetchUserWebhookUrl = async (userId: string): Promise<string | null> => {
  try {
    return await webhookService.getUserWebhookUrl(userId);
  } catch (error) {
    console.error("Exception fetching user webhook URL:", error);
    return null;
  }
};

/**
 * Update the webhook URL for a user in their profile
 * Now uses centralized webhook service
 */
export const updateUserWebhookUrl = async (userId: string, url: string): Promise<boolean> => {
  try {
    return await webhookService.updateUserWebhookUrl(userId, url);
  } catch (error) {
    console.error("Exception updating user webhook URL:", error);
    return false;
  }
};

/**
 * Test a webhook by sending a request with test data
 * Now uses centralized webhook service
 */
export const testWebhook = async (url: string, payload: any): Promise<any> => {
  try {
    return await webhookService.testWebhook(url, payload);
  } catch (error: any) {
    console.error("Error testing webhook:", error);
    throw error;
  }
};

/**
 * Generate a default test payload for the webhook
 */
export const generateDefaultTestPayload = (overrides = {}): any => {
  return {
    timestamp: new Date().toISOString(),
    test_mode: true,
    user_id: "test-user-id",
    displayName: "Test User",
    email: "test@example.com",
    unit: "kg",
    goal_weight: 75.0,
    goal_days: 30,
    entries: {
      weight: [80.5, 79.8, 79.2, 78.6, 78.2],
      notes: ["Started diet", "", "Went for a run", "", "Felt great today"],
      dates: [
        "2025-05-01",
        "2025-05-02",
        "2025-05-03",
        "2025-05-04",
        "2025-05-05"
      ]
    },
    ...overrides
  };
};

/**
 * Parse webhook fields from JSON
 */
export const parseWebhookFields = (fieldsJson: Json | null): WebhookFields => {
  const defaultFields: WebhookFields = {
    user_data: true,
    weight_data: true,
    goal_data: true,
    activity_data: false,
    detailed_analysis: false
  };
  
  if (!fieldsJson) return defaultFields;
  
  if (typeof fieldsJson === 'object' && fieldsJson !== null && !Array.isArray(fieldsJson)) {
    return {
      user_data: Boolean(fieldsJson.user_data ?? true),
      weight_data: Boolean(fieldsJson.weight_data ?? true),
      goal_data: Boolean(fieldsJson.goal_data ?? true),
      activity_data: Boolean(fieldsJson.activity_data ?? false),
      detailed_analysis: Boolean(fieldsJson.detailed_analysis ?? false)
    };
  }
  
  return defaultFields;
};

/**
 * Fetch the global webhook configuration
 * Now uses centralized webhook service for URL
 */
export const fetchWebhookConfig = async (): Promise<WebhookConfig> => {
  try {
    const { data, error } = await supabase
      .from('webhook_config')
      .select('*')
      .single();

    if (error) {
      console.error("Error fetching webhook config:", error);
      throw new Error("Failed to fetch webhook configuration");
    }

    // Get URL from centralized service
    const webhookUrl = await webhookService.getWebhookUrl();

    if (!data) {
      // Return default config if none exists
      return {
        url: webhookUrl,
        days: 30,
        include_account_fields: true,
        include_user_fields: true,
        fields: {
          user_data: true,
          weight_data: true,
          goal_data: true,
          activity_data: false,
          detailed_analysis: false
        }
      };
    }

    // Parse fields from JSON
    const fields = parseWebhookFields(data.fields);
    
    // Return the complete config
    return {
      id: data.id,
      url: webhookUrl,
      days: data.days || 30,
      include_account_fields: data.include_account_fields !== false,
      include_user_fields: data.include_user_fields !== false,
      fields: fields,
      include_goals: data.include_goals,
      include_weight_entries: data.include_weight_entries,
      webhook_version: data.webhook_version
    };
  } catch (error) {
    console.error("Error in fetchWebhookConfig:", error);
    // Get fallback URL from centralized service
    const fallbackUrl = await webhookService.getWebhookUrl().catch(() => 'https://n8n.cozyapp.uno/webhook/2c26d7e3-525a-4080-9282-21b6af883cf2');
    
    // Return default config in case of error
    return {
      url: fallbackUrl,
      days: 30,
      include_account_fields: true,
      include_user_fields: true,
      fields: {
        user_data: true,
        weight_data: true,
        goal_data: true,
        activity_data: false,
        detailed_analysis: false
      }
    };
  }
};

/**
 * Update the global webhook configuration
 */
export const updateWebhookConfig = async (config: WebhookConfig): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('webhook_config')
      .update({ 
        url: config.url,
        days: config.days,
        fields: config.fields as any,
        include_account_fields: config.include_account_fields,
        include_user_fields: config.include_user_fields,
        include_goals: config.include_goals,
        include_weight_entries: config.include_weight_entries,
        webhook_version: config.webhook_version
      })
      .eq('id', config.id || 1);

    if (error) {
      console.error("Error updating webhook config:", error);
      throw new Error(`Failed to update webhook configuration: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error("Error in updateWebhookConfig:", error);
    throw error;
  }
};
