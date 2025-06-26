
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Webhook, Loader2 } from 'lucide-react';

interface AIInsightsProps {
  userId: string | null;
}

const AIInsights: React.FC<AIInsightsProps> = ({ userId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [insightsHTML, setInsightsHTML] = useState<string | null>(null);
  const [insightsLimit, setInsightsLimit] = useState<number>(10);
  const [insightsUsed, setInsightsUsed] = useState<number>(0);
  const [lastWebhookDate, setLastWebhookDate] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchInsightsLimits();
    }
  }, [userId]);

  const fetchInsightsLimits = async () => {
    if (!userId) return;
    
    try {
      // Get centralized insights limits from webhook_config
      const { data: configData, error: configError } = await supabase
        .from('webhook_config')
        .select('insights_limit, insights_used, insights_reset_date')
        .eq('id', 1)
        .single();
      
      if (configError) {
        console.error('Config error:', configError);
        // Set defaults if config doesn't exist
        setInsightsLimit(10);
        setInsightsUsed(0);
        return;
      }
      
      if (configData) {
        // Check if we need to reset daily counter
        const today = new Date().toISOString().split('T')[0];
        const resetDate = configData.insights_reset_date;
        
        if (resetDate !== today) {
          // Reset the counter for new day
          const { error: updateError } = await supabase
            .from('webhook_config')
            .update({ 
              insights_used: 0,
              insights_reset_date: today 
            })
            .eq('id', 1);
          
          if (!updateError) {
            setInsightsUsed(0);
          } else {
            setInsightsUsed(configData.insights_used || 0);
          }
        } else {
          setInsightsUsed(configData.insights_used || 0);
        }
        
        setInsightsLimit(configData.insights_limit || 10);
      }
      
      // Also check for recent responses
      checkRecentInsights();
    } catch (err) {
      console.error('Error fetching insights limits:', err);
      // Set defaults on error
      setInsightsLimit(10);
      setInsightsUsed(0);
    }
  };
  
  const checkRecentInsights = async () => {
    if (!userId) return;
    
    try {
      // Get the most recent webhook log for this user
      const { data: recentLogs, error } = await supabase
        .from('webhook_logs')
        .select('response_payload, created_at')
        .eq('user_id', userId)
        .eq('status', 'success')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Error fetching recent logs:', error);
        return;
      }
      
      // If there's a recent log within the last hour, use it
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      
      if (recentLogs && recentLogs.length > 0 && 
          new Date(recentLogs[0].created_at) > oneHourAgo &&
          recentLogs[0].response_payload) {
        
        // Use cached insights
        let responseText = '';
        const responsePayload = recentLogs[0].response_payload;
        
        if (typeof responsePayload === 'string') {
          responseText = responsePayload;
        } else if (responsePayload && typeof responsePayload === 'object') {
          responseText = JSON.stringify(responsePayload);
        } else {
          responseText = String(responsePayload || '');
        }
        
        setInsightsHTML(responseText);
      }
    } catch (err) {
      console.error('Error checking recent insights:', err);
    }
  };

  const fetchInsights = async () => {
    if (!userId) {
      toast.error('You must be logged in to use this feature');
      return;
    }

    setIsLoading(true);
    setInsightsHTML(null);
    
    try {
      console.log('Calling send_ai_insights edge function...');
      const response = await supabase.functions.invoke('send_ai_insights', {
        method: 'POST',
        body: { user_id: userId }
      });
      
      console.log('Edge function response:', response);
      
      if (response.error) {
        console.error('Edge Function error:', response.error);
        throw new Error(`Edge Function error: ${response.error.message || 'Unknown error'}`);
      }
      
      if (response.data && response.data.message) {
        setInsightsHTML(response.data.message);
        
        // Update insights usage count in centralized config
        const { error: updateError } = await supabase
          .from('webhook_config')
          .update({ insights_used: insightsUsed + 1 })
          .eq('id', 1);
        
        if (!updateError) {
          setInsightsUsed(prev => prev + 1);
        }
        setLastWebhookDate(new Date().toISOString());
        toast.success('AI insights generated successfully!');
      } else {
        throw new Error('No insights returned from Edge Function');
      }
    } catch (err: any) {
      console.error('Error fetching AI insights:', err);
      
      if (err.message?.includes('non-2xx status code')) {
        toast.error('The AI insights service is currently unavailable. Please try again later.');
      } else {
        toast.error(err.message || 'Failed to fetch AI insights');
      }
      
      setInsightsHTML('<p>Unable to generate insights at this time. Please try again later.</p>');
    } finally {
      setIsLoading(false);
    }
  };

  const remainingRequests = Math.max(0, insightsLimit - insightsUsed);
  const isLimitExceeded = insightsUsed >= insightsLimit;
  const isButtonDisabled = isLoading || isLimitExceeded || !userId;

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-primary" />
              <h3 className="font-medium">AI Weight Analysis</h3>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300">
                Beta
              </Badge>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Badge variant="outline" className="bg-muted text-xs">
                {remainingRequests}/{insightsLimit} requests today
              </Badge>
              
              <Button
                size="sm"
                onClick={fetchInsights}
                disabled={isButtonDisabled}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Get AI Insights'
                )}
              </Button>
            </div>
          </div>
          
          {isLimitExceeded && (
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-lg">
              <p>You've reached your AI insights limit for today ({insightsLimit} requests). 
                 {lastWebhookDate && 
                  ` Last request: ${new Date(lastWebhookDate).toLocaleString()}`}
              </p>
              <p className="mt-1 text-xs text-amber-600">Limit resets daily at midnight.</p>
            </div>
          )}

          {!userId && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">
              <p>Please sign in to use AI insights.</p>
            </div>
          )}
          
          {insightsHTML ? (
            <div className="prose prose-sm max-w-none mt-2">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-blue-500 text-white">AI Generated</Badge>
                  <span className="text-xs text-blue-600">
                    {new Date().toLocaleString()}
                  </span>
                </div>
                <iframe 
                  srcDoc={insightsHTML} 
                  className="w-full min-h-[200px] border-0 rounded"
                  title="AI Insights" 
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="font-medium mb-2">🤖 AI-Powered Weight Analysis</p>
              <p>Get personalized insights about your weight trends, patterns, and recommendations based on your data.</p>
              <ul className="mt-2 text-xs space-y-1 list-disc list-inside text-gray-600">
                <li>Trend analysis and pattern recognition</li>
                <li>Personalized recommendations</li>
                <li>Goal progress evaluation</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsights;
