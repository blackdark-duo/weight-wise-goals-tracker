
import React, { useState } from 'react';
import { toast } from "sonner";
import AIInsightsView from "./AIInsightsView";
import { fetchInsightsData } from "@/services/insightsService";

interface AIInsightsProps {
  userId: string | null;
}

const AIInsights: React.FC<AIInsightsProps> = ({ userId }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    if (!userId) {
      toast.error("Please sign in to fetch insights");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formattedInsights = await fetchInsightsData(userId);
      setInsights(formattedInsights);
      toast.success("AI insights updated successfully!");
    } catch (err: any) {
      console.error("Error fetching AI insights:", err);
      setError(err.message || "Failed to fetch AI insights");
      toast.error("Failed to fetch AI insights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AIInsightsView
      insights={insights}
      loading={loading}
      error={error}
      onAnalyzeClick={fetchInsights}
    />
  );
};

export default AIInsights;
