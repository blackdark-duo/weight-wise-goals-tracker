
import { supabase } from "@/integrations/supabase/client";

export const DEFAULT_WEBHOOK_URL = 'http://n8n.cozyapp.uno:5678/webhook-test/36e520c4-f7a4-4872-8e21-e469701eb68e';

export interface WebhookConfig {
  id?: number;
  url: string;
  days: number;
  include_account_fields: boolean;
  include_user_fields: boolean;
  fields: {
    user_data: boolean;
    weight_data: boolean;
    goal_data: boolean;
    activity_data: boolean;
    detailed_analysis: boolean;
  };
}

/**
 * Fetch the webhook URL for a user from their profile
 */
export const fetchUserWebhookUrl = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('webhook_url')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching user webhook URL:", error);
      return null;
    }
    
    return data?.webhook_url || null;
  } catch (error) {
    console.error("Exception fetching user webhook URL:", error);
    return null;
  }
};

/**
 * Update the webhook URL for a user in their profile
 */
export const updateUserWebhookUrl = async (userId: string, url: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ webhook_url: url })
      .eq('id', userId);
    
    if (error) {
      console.error("Error updating user webhook URL:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception updating user webhook URL:", error);
    return false;
  }
};

/**
 * Test a webhook by sending a request with test data
 */
export const testWebhook = async (url: string, payload: any): Promise<any> => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`Webhook test failed with status: ${response.status}`);
    }
    
    // Try to parse as JSON, but fall back to text if needed
    try {
      return await response.json();
    } catch (e) {
      return await response.text();
    }
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
    account_id: "test-user-id",
    user_id: "test-user-id",
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
 * Fetch the global webhook configuration
 */
export const fetchWebhookConfig = async (): Promise<WebhookConfig> => {
  try {
    const { data: config, error } = await supabase
      .functions.invoke('get_webhook_config', {
        method: 'GET',
      });

    if (error) {
      console.error("Error fetching webhook config:", error);
      throw new Error("Failed to fetch webhook configuration");
    }

    if (!config || !config.data) {
      // Return default config if none exists
      return {
        url: DEFAULT_WEBHOOK_URL,
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

    return config.data;
  } catch (error) {
    console.error("Error in fetchWebhookConfig:", error);
    // Return default config in case of error
    return {
      url: DEFAULT_WEBHOOK_URL,
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
    const { data, error } = await supabase
      .functions.invoke('update_webhook_config', {
        method: 'POST',
        body: { 
          url: config.url,
          days: config.days,
          fields: config.fields,
          include_account_fields: config.include_account_fields,
          include_user_fields: config.include_user_fields
        }
      });

    if (error) {
      console.error("Error updating webhook config:", error);
      throw new Error("Failed to update webhook configuration");
    }

    return true;
  } catch (error) {
    console.error("Error in updateWebhookConfig:", error);
    throw error;
  }
};
