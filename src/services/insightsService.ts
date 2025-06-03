import { supabase } from "@/integrations/supabase/client";
import { formatInsightsText } from "@/utils/insightsFormatter";
import { fetchUserWebhookUrl } from "./webhookService";
import { webhookService } from "./centralizedWebhookService";

interface UserProfile {
  display_name: string;
  webhook_url: string;
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

export interface InsightsResult {
  formattedInsights: string;
  rawResponse: any;
}

/**
 * Fetch user data and send to webhook for AI insights analysis
 */
export const fetchInsightsData = async (userId: string): Promise<InsightsResult> => {
  // First, get user profile data (for display name)
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("display_name, webhook_url, email, preferred_unit")
    .eq("id", userId)
    .single();

  if (profileError) {
    throw new Error("Failed to fetch user profile");
  }

  // Use the user's webhook URL or fall back to the centralized webhook URL
  const webhookUrl = await fetchUserWebhookUrl(userId) || 
                     profileData?.webhook_url || 
                     await webhookService.getWebhookUrl();
                     
  const displayName = profileData?.display_name || 'User';
  const email = profileData?.email || '';
  const preferredUnit = profileData?.preferred_unit || 'kg';

  // Get weight entries (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  const { data: entries, error: entriesError } = await supabase
    .from("weight_entries")
    .select("*")
    .eq("user_id", userId)
    .gte("date", thirtyDaysAgoStr)
    .order("date", { ascending: true })
    .order("time", { ascending: false });

  if (entriesError) {
    throw new Error("Failed to fetch weight entries");
  }
  
  // Get user's latest goal
  const { data: goals, error: goalsError } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);
    
  if (goalsError) {
    throw new Error("Failed to fetch goals");
  }

  // Format data according to the specified JSON structure
  const formattedData = {
    account_id: userId,
    user_id: userId,
    email: email,
    unit: preferredUnit,
    goal_weight: goals && goals.length > 0 ? goals[0].target_weight : null,
    goal_days: goals && goals.length > 0 && goals[0].target_date ? 
      Math.ceil((new Date(goals[0].target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 30,
    entries: {
      weight: entries ? entries.map(entry => entry.weight) : [],
      notes: entries ? entries.map(entry => entry.description || '') : [],
      dates: entries ? entries.map(entry => entry.date) : []
    }
  };

  try {
    // Send data to webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`);
    }

    // Get the text response
    const responseText = await response.text();
    
    // Attempt to parse as JSON if possible, otherwise keep as string
    let rawResponse: any;
    try {
      rawResponse = JSON.parse(responseText);
    } catch (e) {
      rawResponse = responseText;
    }
    
    // Format the insights text
    const formattedInsights = formatInsightsText(responseText);
    
    // Return both the formatted insights and the raw response
    return {
      formattedInsights,
      rawResponse
    };
  } catch (error) {
    console.error("Error calling webhook:", error);
    throw error;
  }
};
