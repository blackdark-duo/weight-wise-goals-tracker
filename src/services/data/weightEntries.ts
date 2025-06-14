/**
 * Weight Entries Data Service
 * Handles all CRUD operations for weight entries
 * Single responsibility: Weight entry data management
 */

import { supabase } from "@/integrations/supabase/client";

export interface WeightEntry {
  id: string;
  weight: number;
  unit: string;
  date: string;
  time: string;
  description?: string;
  user_id: string;
  created_at?: string;
}

export interface CreateWeightEntryData {
  weight: number;
  unit: string;
  date: string;
  time: string;
  description?: string;
}

/**
 * Fetches recent weight entries for a user
 */
export const fetchRecentWeightEntries = async (
  userId: string, 
  limit: number = 10
): Promise<WeightEntry[]> => {
  const { data, error } = await supabase
    .from("weight_entries")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("time", { ascending: false })
    .limit(limit);
    
  if (error) {
    throw new Error(`Failed to fetch weight entries: ${error.message}`);
  }
  
  return data || [];
};

/**
 * Fetches weight entries within a date range
 */
export const fetchWeightEntriesInRange = async (
  userId: string,
  startDate: string,
  endDate?: string
): Promise<WeightEntry[]> => {
  let query = supabase
    .from("weight_entries")
    .select("*")
    .eq("user_id", userId)
    .gte("date", startDate);
    
  if (endDate) {
    query = query.lte("date", endDate);
  }
  
  const { data, error } = await query
    .order("date", { ascending: true })
    .order("time", { ascending: true });
    
  if (error) {
    throw new Error(`Failed to fetch weight entries in range: ${error.message}`);
  }
  
  return data || [];
};

/**
 * Creates a new weight entry
 */
export const createWeightEntry = async (
  userId: string,
  entryData: CreateWeightEntryData
): Promise<WeightEntry> => {
  const { data, error } = await supabase
    .from("weight_entries")
    .insert({
      user_id: userId,
      ...entryData
    })
    .select()
    .single();
    
  if (error) {
    throw new Error(`Failed to create weight entry: ${error.message}`);
  }
  
  return data;
};

/**
 * Updates an existing weight entry
 */
export const updateWeightEntry = async (
  entryId: string,
  updateData: Partial<CreateWeightEntryData>
): Promise<WeightEntry> => {
  const { data, error } = await supabase
    .from("weight_entries")
    .update(updateData)
    .eq("id", entryId)
    .select()
    .single();
    
  if (error) {
    throw new Error(`Failed to update weight entry: ${error.message}`);
  }
  
  return data;
};

/**
 * Deletes a weight entry
 */
export const deleteWeightEntry = async (entryId: string): Promise<void> => {
  const { error } = await supabase
    .from("weight_entries")
    .delete()
    .eq("id", entryId);
    
  if (error) {
    throw new Error(`Failed to delete weight entry: ${error.message}`);
  }
};