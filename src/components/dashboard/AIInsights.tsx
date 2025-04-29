
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, BrainCircuit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      // First, get user profile data (for display name)
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("display_name, webhook_url")
        .eq("id", userId)
        .single();

      if (profileError) {
        throw new Error("Failed to fetch user profile");
      }

      const webhookUrl = profileData?.webhook_url || 'http://n8n.cozyapp.uno:5678/webhook-test/36e520c4-f7a4-4872-8e21-e469701eb68e';
      const displayName = profileData?.display_name || 'User';

      // Get weight entries (last 30 days)
      const { data: entries, error: entriesError } = await supabase
        .from("weight_entries")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .order("time", { ascending: false })
        .limit(30);

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

      // Format data according to the specified structure
      const formattedData = {
        display_name: displayName,
        timestamp: new Date().toISOString(),
        goal: goals && goals.length > 0 ? {
          goalWeight: goals[0].target_weight,
          unit: goals[0].unit,
          daysToGoal: goals[0].target_date ? 
            Math.ceil((new Date(goals[0].target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 30
        } : {
          goalWeight: null,
          unit: entries && entries.length > 0 ? entries[0].unit : 'kg',
          daysToGoal: 30
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

      const data = await response.json();
      setInsights(data.message || JSON.stringify(data));
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
    <Card className="overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-emerald-500" />
          <span>Weight Wise AI Insights</span>
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchInsights}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? "Analyzing..." : "Analyze Data"}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[70%]" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : !insights ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Click "Analyze Data" to get AI-powered insights about your weight journey</p>
            <p className="text-sm mt-2">We'll analyze your last 30 weight entries</p>
          </div>
        ) : (
          <div className="prose dark:prose-invert max-w-none">
            <div className="bg-muted/40 rounded-lg p-4 border border-border">
              <Badge className="mb-2 bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30">AI Generated</Badge>
              <div dangerouslySetInnerHTML={{ __html: insights }} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsights;
