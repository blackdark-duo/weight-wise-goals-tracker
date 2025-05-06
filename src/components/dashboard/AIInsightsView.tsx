
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, BrainCircuit, AlertTriangle, WifiOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AIInsightsViewProps {
  insights: string | null;
  loading: boolean;
  error: string | null;
  onAnalyzeClick: () => void;
}

const AIInsightsView: React.FC<AIInsightsViewProps> = ({ 
  insights, 
  loading, 
  error, 
  onAnalyzeClick 
}) => {
  // Determine the appropriate icon for error messages
  const ErrorIcon = error?.includes("network") || error?.includes("connect") ? WifiOff : AlertTriangle;

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
          onClick={onAnalyzeClick}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? "Analyzing..." : "Analyze Data"}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-6 w-[250px]" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[70%]" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <ErrorIcon className="h-5 w-5" />
            <AlertTitle className="mb-1 font-medium">Unable to generate insights</AlertTitle>
            <AlertDescription className="text-sm">
              {error}
              <div className="mt-3">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={onAnalyzeClick}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : !insights ? (
          <div className="text-center text-muted-foreground py-8">
            <BrainCircuit className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
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

export default AIInsightsView;
