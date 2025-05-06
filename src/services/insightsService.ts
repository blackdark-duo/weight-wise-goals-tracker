
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
    throw new Error(`Failed to fetch user profile: ${profileError.message}`);
  }

  const webhookUrl = profileData?.webhook_url || 'http://n8n.cozyapp.uno:5678/webhook-test/36e520c4-f7a4-4872-8e21-e469701eb68e';
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
    return "No weight data available for the last 30 days. Please add some weight entries to get insights.";
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

  try {
    // Send data to webhook with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
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
      throw new Error(`Webhook returned ${response.status}`);
    }

    // Get the text response directly without parsing as JSON
    let responseText;
    try {
      responseText = await response.text();
      
      // Check if response is actually empty or just whitespace
      if (!responseText || responseText.trim() === '') {
        throw new Error("Empty response from AI service");
      }
    } catch (error) {
      throw new Error(`Failed to process AI response: ${(error as Error).message}`);
    }
    
    // Beautify the text response by formatting it as HTML
    return formatInsightsText(responseText);
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new Error('AI service request timed out. Please try again later.');
    }
    throw error; // Re-throw other errors
  }
};
