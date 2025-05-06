
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

export async function fetchUserData(supabaseClient: SupabaseClient, userId: string, days: number) {
  // Get data for the specified time range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Get weight entries
  const { data: weightData, error: weightError } = await supabaseClient
    .from('weight_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date', { ascending: true });
    
  if (weightError) throw weightError;
  
  // Get goals
  const { data: goalData, error: goalError } = await supabaseClient
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);
    
  if (goalError) throw goalError;
  
  return { weightData, goalData };
}

export function buildPayload(userId: string, email: string, preferredUnit: string, weightData: any[], goalData: any[]) {
  // Build standardized payload structure
  return {
    account_id: userId,
    user_id: userId,
    email: email,
    unit: preferredUnit || "kg",
    goal_weight: goalData && goalData.length > 0 ? goalData[0].target_weight : null,
    goal_days: goalData && goalData.length > 0 && goalData[0].target_date ? 
      Math.ceil((new Date(goalData[0].target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 30,
    entries: {
      weight: weightData ? weightData.map(entry => entry.weight) : [],
      notes: weightData ? weightData.map(entry => entry.description || "") : [],
      dates: weightData ? weightData.map(entry => entry.date) : []
    }
  };
}

export async function createWebhookLog(supabaseClient: SupabaseClient, userId: string, payload: any, webhookUrl: string) {
  const { data: webhookLog, error: webhookLogError } = await supabaseClient
    .from('webhook_logs')
    .insert({
      user_id: userId,
      request_payload: payload,
      url: webhookUrl,
      status: 'pending'
    })
    .select('id')
    .single();

  if (webhookLogError) {
    console.error('Error creating webhook log:', webhookLogError);
  }

  return webhookLog?.id;
}

export async function updateWebhookLog(supabaseClient: SupabaseClient, logId: string, responseText: string, success: boolean) {
  if (!logId) return;
  
  await supabaseClient
    .from('webhook_logs')
    .update({
      response_payload: responseText,
      status: success ? 'success' : 'error'
    })
    .eq('id', logId);
}

export async function updateWebhookCount(supabaseClient: SupabaseClient, userId: string, isNewDay: boolean, currentCount: number) {
  const { error: updateError } = await supabaseClient
    .from('profiles')
    .update({
      webhook_count: isNewDay ? 1 : (currentCount + 1),
      last_webhook_date: new Date().toISOString()
    })
    .eq('id', userId);
    
  if (updateError) {
    console.error('Error updating webhook count:', updateError);
  }
}
