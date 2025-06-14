/**
 * Dashboard Data Management Hook
 * Orchestrates all dashboard-related data fetching and state management
 * Single responsibility: Dashboard data coordination and state management
 */

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { useWeightEntries } from "@/hooks/data/useWeightEntries";
import { fetchUserProfile } from "@/services/data/userProfiles";
import { formatWeightEntriesForChart, groupEntriesByDate } from "@/utils/formatters/chartDataFormatter";
import { calculateWeightStats, WeightStats } from "@/utils/analytics/weightStatistics";

export interface DashboardData {
  recentEntries: any[];
  chartData: any[];
  stats: WeightStats | null;
  userCredits: number;
  showAIInsights: boolean;
  minWeight?: number;
  maxWeight?: number;
  isLoading: boolean;
  error: string | null;
}

export interface UseDashboardDataReturn extends DashboardData {
  refreshData: () => Promise<void>;
  handleEntryAdded: (newEntry: any) => void;
  updateUserCredits: (credits: number) => void;
}

/**
 * Main dashboard data management hook
 */
export const useDashboardData = (userId: string | null): UseDashboardDataReturn => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState<WeightStats | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [showAIInsights, setShowAIInsights] = useState<boolean>(true);
  const [minWeight, setMinWeight] = useState<number | undefined>(undefined);
  const [maxWeight, setMaxWeight] = useState<number | undefined>(undefined);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Use the weight entries hook
  const {
    entries: recentEntries,
    isLoading: isLoadingEntries,
    error: entriesError,
    addEntry,
    refreshEntries,
    fetchEntriesInRange
  } = useWeightEntries(userId, 10, !!userId);

  // Fetch user profile data
  const fetchProfileData = useCallback(async () => {
    if (!userId) {
      setIsLoadingProfile(false);
      return;
    }

    try {
      setIsLoadingProfile(true);
      setProfileError(null);
      
      const profile = await fetchUserProfile(userId);
      
      if (profile) {
        setShowAIInsights(profile.show_ai_insights ?? true);
        setUserCredits(profile.credits || 0);
      } else {
        // Default values if no profile found
        setShowAIInsights(true);
        setUserCredits(0);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch profile data";
      setProfileError(errorMessage);
      console.error("Error fetching profile:", err);
      // Set defaults on error
      setShowAIInsights(true);
      setUserCredits(0);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [userId]);

  // Fetch and process chart data
  const fetchChartData = useCallback(async () => {
    if (!userId) return;

    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const startDate = format(sevenDaysAgo, "yyyy-MM-dd");

      const chartEntries = await fetchEntriesInRange(startDate);
      
      if (chartEntries && chartEntries.length > 0) {
        // Group by date to avoid multiple entries per day in chart
        const groupedEntries = groupEntriesByDate(chartEntries);
        
        // Format for chart display
        const formattedChartData = formatWeightEntriesForChart(groupedEntries);
        setChartData(formattedChartData);
        
        // Calculate statistics
        const calculatedStats = calculateWeightStats(formattedChartData);
        setStats(calculatedStats);
        
        if (calculatedStats) {
          setMinWeight(calculatedStats.minWeight);
          setMaxWeight(calculatedStats.maxWeight);
        }
      } else {
        setChartData([]);
        setStats(null);
        setMinWeight(undefined);
        setMaxWeight(undefined);
      }
    } catch (err) {
      console.error("Error fetching chart data:", err);
    }
  }, [userId, fetchEntriesInRange]);

  // Handle new entry addition
  const handleEntryAdded = useCallback(async (newEntry: any) => {
    // The useWeightEntries hook will automatically update recent entries
    // We need to refresh chart data to include the new entry
    await fetchChartData();
  }, [fetchChartData]);

  // Refresh all dashboard data
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchProfileData(),
      refreshEntries(),
      fetchChartData()
    ]);
  }, [fetchProfileData, refreshEntries, fetchChartData]);

  // Update user credits locally
  const updateUserCredits = useCallback((credits: number) => {
    setUserCredits(credits);
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (userId) {
      fetchProfileData();
      fetchChartData();
    }
  }, [userId, fetchProfileData, fetchChartData]);

  const isLoading = isLoadingProfile || isLoadingEntries;
  const error = profileError || entriesError;

  return {
    recentEntries,
    chartData,
    stats,
    userCredits,
    showAIInsights,
    minWeight,
    maxWeight,
    isLoading,
    error,
    refreshData,
    handleEntryAdded,
    updateUserCredits
  };
};