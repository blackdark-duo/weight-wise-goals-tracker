/**
 * Weight Entries Data Hook
 * Manages weight entries state and operations
 * Single responsibility: Weight entries data management and state
 */

import { useState, useEffect, useCallback } from "react";
import { 
  WeightEntry, 
  CreateWeightEntryData,
  fetchRecentWeightEntries,
  fetchWeightEntriesInRange,
  createWeightEntry,
  updateWeightEntry,
  deleteWeightEntry
} from "@/services/data/weightEntries";
import { toast } from "sonner";

export interface UseWeightEntriesReturn {
  entries: WeightEntry[];
  isLoading: boolean;
  error: string | null;
  addEntry: (data: CreateWeightEntryData) => Promise<WeightEntry | null>;
  updateEntry: (id: string, data: Partial<CreateWeightEntryData>) => Promise<WeightEntry | null>;
  removeEntry: (id: string) => Promise<boolean>;
  refreshEntries: () => Promise<void>;
  fetchEntriesInRange: (startDate: string, endDate?: string) => Promise<WeightEntry[]>;
}

/**
 * Hook for managing weight entries
 */
export const useWeightEntries = (
  userId: string | null,
  limit: number = 10,
  autoFetch: boolean = true
): UseWeightEntriesReturn => {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const refreshEntries = useCallback(async () => {
    if (!userId) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedEntries = await fetchRecentWeightEntries(userId, limit);
      setEntries(fetchedEntries);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch weight entries";
      setError(errorMessage);
      console.error("Error fetching weight entries:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, limit]);

  const addEntry = useCallback(async (data: CreateWeightEntryData): Promise<WeightEntry | null> => {
    if (!userId) {
      toast.error("User not authenticated");
      return null;
    }

    try {
      const newEntry = await createWeightEntry(userId, data);
      setEntries(prevEntries => [newEntry, ...prevEntries.slice(0, limit - 1)]);
      toast.success("Weight entry added successfully");
      return newEntry;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add weight entry";
      toast.error(errorMessage);
      setError(errorMessage);
      return null;
    }
  }, [userId, limit]);

  const updateEntry = useCallback(async (
    id: string, 
    data: Partial<CreateWeightEntryData>
  ): Promise<WeightEntry | null> => {
    try {
      const updatedEntry = await updateWeightEntry(id, data);
      setEntries(prevEntries => 
        prevEntries.map(entry => entry.id === id ? updatedEntry : entry)
      );
      toast.success("Weight entry updated successfully");
      return updatedEntry;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update weight entry";
      toast.error(errorMessage);
      setError(errorMessage);
      return null;
    }
  }, []);

  const removeEntry = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteWeightEntry(id);
      setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
      toast.success("Weight entry deleted successfully");
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete weight entry";
      toast.error(errorMessage);
      setError(errorMessage);
      return false;
    }
  }, []);

  const fetchEntriesInRange = useCallback(async (
    startDate: string, 
    endDate?: string
  ): Promise<WeightEntry[]> => {
    if (!userId) return [];

    try {
      return await fetchWeightEntriesInRange(userId, startDate, endDate);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch entries in range";
      toast.error(errorMessage);
      setError(errorMessage);
      return [];
    }
  }, [userId]);

  useEffect(() => {
    if (autoFetch) {
      refreshEntries();
    }
  }, [refreshEntries, autoFetch]);

  return {
    entries,
    isLoading,
    error,
    addEntry,
    updateEntry,
    removeEntry,
    refreshEntries,
    fetchEntriesInRange
  };
};