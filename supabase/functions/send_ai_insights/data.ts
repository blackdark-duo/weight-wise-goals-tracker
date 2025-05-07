
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// Fetch user data including weight entries and goals
export async function fetchUserData(
  supabaseClient: SupabaseClient,
  userId: string,
  daysToFetch: number
) {
  // Calculate date range
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - daysToFetch);
  const pastDateStr = pastDate.toISOString().split('T')[0];
  
  // Fetch weight entries
  const { data: weightEntries, error: entriesError } = await supabaseClient
    .from('weight_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('date', pastDateStr)
    .order('date', { ascending: true });
    
  if (entriesError) {
    console.error("Error fetching weight entries:", entriesError);
    throw entriesError;
  }

  // Fetch latest goal
  const { data: goals, error: goalsError } = await supabaseClient
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);
    
  if (goalsError) {
    console.error("Error fetching goals:", goalsError);
    throw goalsError;
  }

  return {
    weightData: weightEntries || [],
    goalData: goals && goals.length > 0 ? goals[0] : null
  };
}

// Build webhook payload in the new format
export function buildPayload(
  userId: string,
  email: string | null,
  displayName: string | null,
  preferredUnit: string | null,
  weightData: any[],
  goalData: any
) {
  // Format entries data
  const weights = weightData.map(entry => entry.weight);
  const notes = weightData.map(entry => entry.description || "");
  const dates = weightData.map(entry => entry.date);
  
  // Build the payload in the new format
  const payload = {
    user_id: userId,
    displayName: displayName || "",
    email: email || "",
    unit: preferredUnit || "kg",
    entries: {
      weight: weights,
      notes: notes,
      dates: dates
    }
  };
  
  // Add goal data if available
  if (goalData) {
    payload["goal_weight"] = goalData.target_weight;
    
    if (goalData.target_date) {
      const targetDate = new Date(goalData.target_date);
      const today = new Date();
      const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      payload["goal_days"] = daysRemaining > 0 ? daysRemaining : 0;
    }
  }
  
  return payload;
}

// Create webhook log entry
export async function createWebhookLog(
  supabaseClient: SupabaseClient,
  userId: string,
  payload: any,
  webhookUrl: string
) {
  const { data, error } = await supabaseClient
    .from('webhook_logs')
    .insert({
      user_id: userId,
      request_payload: payload,
      url: webhookUrl,
      status: 'pending'
    })
    .select('id')
    .single();
    
  if (error) {
    console.error("Error creating webhook log:", error);
    throw error;
  }
  
  return data.id;
}

// Update webhook log with response data
export async function updateWebhookLog(
  supabaseClient: SupabaseClient,
  logId: string,
  responseText: string,
  success: boolean
) {
  const { error } = await supabaseClient
    .from('webhook_logs')
    .update({
      response_payload: responseText,
      status: success ? 'success' : 'error'
    })
    .eq('id', logId);
    
  if (error) {
    console.error("Error updating webhook log:", error);
    throw error;
  }
}

// Update webhook count for user
export async function updateWebhookCount(
  supabaseClient: SupabaseClient,
  userId: string,
  isNewDay: boolean,
  currentCount: number = 0
) {
  const newCount = isNewDay ? 1 : (currentCount + 1);
  
  const { error } = await supabaseClient
    .from('profiles')
    .update({
      webhook_count: newCount,
      last_webhook_date: new Date().toISOString()
    })
    .eq('id', userId);
    
  if (error) {
    console.error("Error updating webhook count:", error);
    throw error;
  }
}
