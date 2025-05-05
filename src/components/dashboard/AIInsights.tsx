
import React, { useState } from 'react';
import { toast } from "sonner";
import AIInsightsView from "./AIInsightsView";
import { fetchInsightsData } from "@/services/insightsService";

interface AIInsightsProps {
  userId: string | null;
}

const AIInsights: React.FC<AIInsightsProps> = ({ userId }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    if (!userId) {
      toast.error("Please sign in to fetch insights");
      setError("Authentication required. Please sign in to use AI insights.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchInsightsData(userId);
      
      if (!result.formattedInsights || result.formattedInsights.trim() === "") {
        throw new Error("The AI service returned an empty response. Please try again later.");
      }
      
      setInsights(result.formattedInsights);
      setRawResponse(result.rawResponse);
      toast.success("AI insights updated successfully!");
    } catch (err: any) {
      console.error("Error fetching AI insights:", err);
      
      // Provide more user-friendly error messages based on the error type
      let errorMessage = "Failed to fetch AI insights. Please try again later.";
      
      if (err.message?.includes("fetch")) {
        errorMessage = "Couldn't connect to the AI service. Please check your network connection and try again.";
      } else if (err.message?.includes("Webhook returned 5")) {
        errorMessage = "The AI service is currently unavailable. Our team has been notified.";
      } else if (err.message?.includes("Webhook returned 4")) {
        errorMessage = "Unable to process your request. Please try again in a few moments.";
      } else if (err.message?.includes("Supabase") || err.message?.includes("profiles")) {
        errorMessage = "There was an issue accessing your profile data. Please try again later.";
      } else if (err.message?.includes("daily limit")) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AIInsightsView
      insights={insights}
      rawResponse={rawResponse}
      loading={loading}
      error={error}
      onAnalyzeClick={fetchInsights}
    />
  );
};

export default AIInsights;
