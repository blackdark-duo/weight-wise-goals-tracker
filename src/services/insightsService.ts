
import { supabase } from "@/integrations/supabase/client";
import { formatInsightsText } from "@/utils/insightsFormatter";

interface UserProfile {
  display_name: string;
  webhook_url: string;
  webhook_limit?: number;
  webhook_count?: number;
  last_webhook_date?: string;
}

interface Goal {
  target_weight: number;
  unit: string;
  target_date: string | null;
}

interface WeightEntry {
  weight: number;
  date: string;
  description: string | null;
  unit: string;
}

interface WebhookConfig {
  url: string;
  days: number;
  fields: {
    user_data: boolean;
    weight_data: boolean;
    goal_data: boolean;
    activity_data: boolean;
    detailed_analysis: boolean;
  }
}

/**
 * Fetch user data and send to webhook for AI insights analysis
 */
export const fetchInsightsData = async (userId: string) => {
  try {
    // First, get user profile data
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("display_name, webhook_url, webhook_limit, webhook_count, last_webhook_date")
      .eq("id", userId)
      .single();

    if (profileError) {
      throw new Error(`Failed to fetch user profile: ${profileError.message}`);
    }

    // Check webhook limit
    if (profileData.webhook_limit !== undefined && profileData.webhook_count !== undefined) {
      // Reset count if it's a new day
      const lastDate = profileData.last_webhook_date ? new Date(profileData.last_webhook_date).toDateString() : null;
      const today = new Date().toDateString();
      
      let currentCount = profileData.webhook_count;
      
      if (lastDate !== today) {
        // It's a new day, reset the count
        currentCount = 0;
        await supabase
          .from("profiles")
          .update({ webhook_count: 0, last_webhook_date: new Date().toISOString() })
          .eq("id", userId);
      }
      
      if (currentCount >= profileData.webhook_limit) {
        throw new Error(`You've reached your daily limit of ${profileData.webhook_limit} AI insights requests. Please try again tomorrow.`);
      }
      
      // Increment the count
      await supabase
        .from("profiles")
        .update({ 
          webhook_count: currentCount + 1,
          last_webhook_date: new Date().toISOString()
        })
        .eq("id", userId);
    }

    // Get webhook configuration
    const { data: webhookConfigData, error: webhookConfigError } = await supabase
      .from("webhook_config")
      .select("*")
      .single();
    
    const webhookConfig: WebhookConfig = webhookConfigError ? {
      url: "",
      days: 30,
      fields: {
        user_data: true,
        weight_data: true,
        goal_data: true,
        activity_data: false,
        detailed_analysis: false
      }
    } : webhookConfigData;

    const webhookUrl = webhookConfig.url || profileData?.webhook_url || 'http://n8n.cozyapp.uno:5678/webhook-test/36e520c4-f7a4-4872-8e21-e469701eb68e';
    const displayName = profileData?.display_name || 'User';
    const dataDays = webhookConfig.days || 30;

    // Get weight entries based on configured days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - dataDays);
    const daysAgoStr = daysAgo.toISOString().split('T')[0];

    const { data: entries, error: entriesError } = await supabase
      .from("weight_entries")
      .select("*")
      .eq("user_id", userId)
      .gte("date", daysAgoStr)
      .order("date", { ascending: false })
      .order("time", { ascending: false });

    if (entriesError) {
      throw new Error(`Failed to fetch weight entries: ${entriesError.message}`);
    }
    
    // Get user's latest goal
    const { data: goals, error: goalsError } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);
      
    if (goalsError) {
      throw new Error(`Failed to fetch goals: ${goalsError.message}`);
    }

    // Handle case where no entries exist
    if (!entries || entries.length === 0) {
      return "No weight data available for the last " + dataDays + " days. Please add some weight entries to get insights.";
    }

    // Build dynamic data object based on configuration
    const formattedData: any = {
      timestamp: new Date().toISOString(),
    };

    // Add fields based on configuration
    if (webhookConfig.fields.user_data) {
      formattedData.display_name = displayName;
    }

    if (webhookConfig.fields.weight_data) {
      formattedData.entries = {
        weight: entries ? entries.map(entry => entry.weight).join(',') : '',
        date: entries ? entries.map(entry => entry.date).join(',') : '',
        notes: entries ? entries.map(entry => entry.description || '').join(',') : ''
      };
      formattedData.unit = entries && entries.length > 0 ? entries[0].unit : 'kg';
    }

    if (webhookConfig.fields.goal_data && goals && goals.length > 0) {
      formattedData.goal = {
        goalWeight: goals[0].target_weight,
        unit: goals[0].unit,
        daysToGoal: goals[0].target_date ? 
          Math.ceil((new Date(goals[0].target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 30
      };
    }

    if (webhookConfig.fields.detailed_analysis) {
      formattedData.detailed_analysis = true;
    }

    try {
      // Send data to webhook with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
      
      console.log("Sending data to webhook:", webhookUrl);
      console.log("Data being sent:", JSON.stringify(formattedData));
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}: ${await response.text()}`);
      }

      // Get the text response
      let responseText;
      try {
        responseText = await response.text();
        
        // Check if response is empty or just whitespace
        if (!responseText || responseText.trim() === '') {
          throw new Error("Empty response from AI service");
        }
        
        console.log("Response from webhook:", responseText);
      } catch (error) {
        throw new Error(`Failed to process AI response: ${(error as Error).message}`);
      }
      
      // Format the text response
      return formatInsightsText(responseText);
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error('AI service request timed out. Please try again later.');
      }
      throw error; // Re-throw other errors
    }
  } catch (error) {
    console.error("Error in fetchInsightsData:", error);
    throw error;
  }
};
