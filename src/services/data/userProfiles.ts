/**
 * User Profiles Data Service
 * Handles all operations related to user profile data
 * Single responsibility: User profile data management
 */

import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  display_name?: string;
  preferred_unit?: string;
  timezone?: string;
  email?: string;
  credits: number;
  show_ai_insights?: boolean;
  is_admin?: boolean;
  webhook_limit?: number;
  webhook_count?: number;
  last_webhook_date?: string;
  is_suspended?: boolean;
  scheduled_for_deletion?: boolean;
  deletion_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateUserProfileData {
  display_name?: string;
  preferred_unit?: string;
  timezone?: string;
  show_ai_insights?: boolean;
}

/**
 * Fetches user profile by user ID
 */
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
    
  if (error) {
    throw new Error(`Failed to fetch user profile: ${error.message}`);
  }
  
  return data;
};

/**
 * Updates user profile
 */
export const updateUserProfile = async (
  userId: string,
  updateData: UpdateUserProfileData
): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId)
    .select()
    .single();
    
  if (error) {
    throw new Error(`Failed to update user profile: ${error.message}`);
  }
  
  return data;
};

/**
 * Updates user credits
 */
export const updateUserCredits = async (
  userId: string,
  credits: number
): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from("profiles")
    .update({ credits })
    .eq("id", userId)
    .select()
    .single();
    
  if (error) {
    throw new Error(`Failed to update user credits: ${error.message}`);
  }
  
  return data;
};

/**
 * Uses a credit (decrements by 1)
 */
export const useCredit = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('use_credit', {
    user_id_param: userId
  });
  
  if (error) {
    throw new Error(`Failed to use credit: ${error.message}`);
  }
  
  return data || false;
};

/**
 * Fetches user preferences subset
 */
export const fetchUserPreferences = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("preferred_unit, timezone, show_ai_insights")
    .eq("id", userId)
    .maybeSingle();
    
  if (error) {
    throw new Error(`Failed to fetch user preferences: ${error.message}`);
  }
  
  return {
    preferredUnit: data?.preferred_unit || 'kg',
    timezone: data?.timezone || 'UTC',
    showAIInsights: data?.show_ai_insights ?? true
  };
};