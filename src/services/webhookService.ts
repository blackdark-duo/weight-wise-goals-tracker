
import { supabase } from "@/integrations/supabase/client";

export interface WebhookConfig {
  url: string;
  days: number;
  fields: {
    user_data: boolean;
    weight_data: boolean;
    goal_data: boolean;
    activity_data: boolean;
    detailed_analysis: boolean;
  };
  include_account_fields: boolean;
  include_user_fields: boolean;
  include_weight_entries: boolean;
  include_goals: boolean;
  webhook_version: string;
}

export const DEFAULT_WEBHOOK_URL = "http://n8n.cozyapp.uno:5678/webhook-test/2c26d7e3-525a-4080-9282-21b6af883cf2";

const DEFAULT_CONFIG: WebhookConfig = {
  url: DEFAULT_WEBHOOK_URL,
  days: 30,
  fields: {
    user_data: true,
    weight_data: true,
    goal_data: true,
    activity_data: false,
    detailed_analysis: false
  },
  include_account_fields: true,
  include_user_fields: true,
  include_weight_entries: true,
  include_goals: true,
  webhook_version: "1.0"
};

/**
 * Fetches the global webhook configuration from Supabase
 */
export const fetchWebhookConfig = async (): Promise<WebhookConfig> => {
  try {
    const { data, error } = await supabase
      .from('webhook_config')
      .select('*')
      .single();
    
    if (error) {
      console.error("Error fetching webhook config:", error);
      return DEFAULT_CONFIG;
    }
    
    // Create default fields structure if needed
    const defaultFields = {
      user_data: true,
      weight_data: true,
      goal_data: true,
      activity_data: false,
      detailed_analysis: false
    };
    
    // Handle the type conversion safely
    let fieldData;
    try {
      // Try to parse or handle the fields as a proper object
      if (typeof data.fields === 'string') {
        fieldData = JSON.parse(data.fields);
      } else if (data.fields && typeof data.fields === 'object') {
        fieldData = data.fields;
      } else {
        fieldData = defaultFields;
      }
    } catch (err) {
      console.error("Error parsing fields data:", err);
      fieldData = defaultFields;
    }
    
    // Ensure all expected properties exist
    const parsedFields = {
      user_data: fieldData?.user_data ?? defaultFields.user_data,
      weight_data: fieldData?.weight_data ?? defaultFields.weight_data,
      goal_data: fieldData?.goal_data ?? defaultFields.goal_data,
      activity_data: fieldData?.activity_data ?? defaultFields.activity_data,
      detailed_analysis: fieldData?.detailed_analysis ?? defaultFields.detailed_analysis
    };
    
    // Return properly typed WebhookConfig
    return {
      url: data.url || DEFAULT_WEBHOOK_URL,
      days: data.days || 30,
      fields: parsedFields,
      include_account_fields: data.include_account_fields ?? true,
      include_user_fields: data.include_user_fields ?? true,
      include_weight_entries: data.include_weight_entries ?? true,
      include_goals: data.include_goals ?? true,
      webhook_version: data.webhook_version || "1.0"
    };
  } catch (err) {
    console.error("Exception fetching webhook config:", err);
    return DEFAULT_CONFIG;
  }
};

/**
 * Updates the global webhook configuration in Supabase
 */
export const updateWebhookConfig = async (config: WebhookConfig): Promise<WebhookConfig | null> => {
  try {
    const { data, error } = await supabase
      .from('webhook_config')
      .update({
        url: config.url,
        days: config.days,
        fields: config.fields,
        include_account_fields: config.include_account_fields,
        include_user_fields: config.include_user_fields,
        include_weight_entries: config.include_weight_entries,
        include_goals: config.include_goals,
        webhook_version: config.webhook_version
      })
      .eq('id', 1)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating webhook config:", error);
      return null;
    }
    
    // Create default fields structure if needed
    const defaultFields = DEFAULT_CONFIG.fields;
    
    // Handle the type conversion for the returned data safely
    let fieldData;
    try {
      // Try to parse or handle the fields as a proper object
      if (typeof data.fields === 'string') {
        fieldData = JSON.parse(data.fields);
      } else if (data.fields && typeof data.fields === 'object') {
        fieldData = data.fields;
      } else {
        fieldData = defaultFields;
      }
    } catch (err) {
      console.error("Error parsing fields data in update response:", err);
      fieldData = defaultFields;
    }
    
    // Ensure all expected properties exist in a properly typed object
    const parsedFields = {
      user_data: fieldData?.user_data ?? defaultFields.user_data,
      weight_data: fieldData?.weight_data ?? defaultFields.weight_data,
      goal_data: fieldData?.goal_data ?? defaultFields.goal_data,
      activity_data: fieldData?.activity_data ?? defaultFields.activity_data,
      detailed_analysis: fieldData?.detailed_analysis ?? defaultFields.detailed_analysis
    };
    
    // Return properly typed WebhookConfig
    return {
      url: data.url || DEFAULT_WEBHOOK_URL,
      days: data.days || 30,
      fields: parsedFields,
      include_account_fields: data.include_account_fields ?? true,
      include_user_fields: data.include_user_fields ?? true,
      include_weight_entries: data.include_weight_entries ?? true,
      include_goals: data.include_goals ?? true,
      webhook_version: data.webhook_version || "1.0"
    };
  } catch (err) {
    console.error("Exception updating webhook config:", err);
    return null;
  }
};

/**
 * Fetches the user-specific webhook URL from their profile
 */
export const fetchUserWebhookUrl = async (userId: string): Promise<string | null> => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("webhook_url")
      .eq("id", userId)
      .single();
      
    if (error) {
      console.error("Error fetching user webhook URL:", error);
      return null;
    }
    
    return data?.webhook_url || null;
  } catch (err) {
    console.error("Exception fetching user webhook URL:", err);
    return null;
  }
};

/**
 * Updates the user-specific webhook URL in their profile
 */
export const updateUserWebhookUrl = async (userId: string, url: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ webhook_url: url })
      .eq("id", userId);
      
    if (error) {
      console.error("Error updating user webhook URL:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Exception updating user webhook URL:", err);
    return false;
  }
};

/**
 * Tests the webhook by sending a sample payload and verifying the response
 */
export const testWebhook = async (url: string, testPayload: any): Promise<any> => {
  try {
    console.log("Testing webhook with URL:", url);
    console.log("Test payload:", testPayload);

    // Record the webhook test in the database
    const { data: webhookLogData } = await supabase
      .from('webhook_logs')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        url: url,
        request_payload: testPayload,
        status: 'pending'
      })
      .select('id')
      .single();

    const logId = webhookLogData?.id;

    // Send test request to webhook
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned status ${response.status}`);
    }

    const responseData = await response.json();
    console.log("Webhook test response:", responseData);

    // Update the webhook log with the response
    if (logId) {
      await supabase
        .from('webhook_logs')
        .update({
          response_payload: responseData,
          status: response.ok ? 'success' : 'error'
        })
        .eq('id', logId);
    }

    return responseData;
  } catch (error) {
    console.error("Error testing webhook:", error);
    throw error;
  }
};

/**
 * Generates a default test payload for webhook testing
 */
export const generateDefaultTestPayload = (customValues = {}): any => {
  const defaultPayload = {
    account_id: "sample-user-id",
    user_id: "sample-user-id",
    email: "user@example.com",
    unit: "kg",
    goal_weight: 75.0,
    goal_days: 30,
    entries: {
      weight: [78.0, 77.5, 77.0],
      notes: ["Starting my journey", "Feeling good today", "Ate healthy all day"],
      dates: [
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      ]
    }
  };
  
  return { ...defaultPayload, ...customValues };
};
