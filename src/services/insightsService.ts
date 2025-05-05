
import { supabase } from "@/integrations/supabase/client";
import { formatInsightsText } from "@/utils/insightsFormatter";

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

/**
 * Fetch user data and send to webhook for AI insights analysis
 */
export const fetchInsightsData = async (userId: string) => {
  // First, get user profile data (for display name)
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("display_name, webhook_url")
    .eq("id", userId)
    .single();

  if (profileError) {
    throw new Error("Failed to fetch user profile");
  }

  const webhookUrl = profileData?.webhook_url || 'http://n8n.cozyapp.uno:5678/webhook-test/2c26d7e3-525a-4080-9282-21b6af883cf2';
  const displayName = profileData?.display_name || 'User';

  // Get weight entries (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  const { data: entries, error: entriesError } = await supabase
    .from("weight_entries")
    .select("*")
    .eq("user_id", userId)
    .gte("date", thirtyDaysAgoStr)
    .order("date", { ascending: false })
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

  // Format data according to the specified structure with comma-separated arrays
  const formattedData = {
    display_name: displayName,
    timestamp: new Date().toISOString(),
    goal: {
      goalWeight: goals && goals.length > 0 ? goals[0].target_weight : null,
      unit: goals && goals.length > 0 ? goals[0].unit : (entries && entries.length > 0 ? entries[0].unit : 'kg'),
      daysToGoal: goals && goals.length > 0 && goals[0].target_date ? 
        Math.ceil((new Date(goals[0].target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 30
    },
    entries: {
      weight: entries ? entries.map(entry => entry.weight).join(',') : '',
      date: entries ? entries.map(entry => entry.date).join(',') : '',
      notes: entries ? entries.map(entry => entry.description || '').join(',') : ''
    },
    unit: entries && entries.length > 0 ? entries[0].unit : 'kg'
  };

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
  
  // Format the insights text
  const formattedInsights = formatInsightsText(responseText);
  
  // Return both the formatted insights and the raw response
  return {
    formattedInsights,
    rawResponse: responseText
  };
};
