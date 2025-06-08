
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Webhook } from 'lucide-react';

interface AIInsightsProps {
  userId: string | null;
}

const AIInsights: React.FC<AIInsightsProps> = ({ userId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [insightsHTML, setInsightsHTML] = useState<string | null>(null);
  const [insightsLimit, setInsightsLimit] = useState<number>(0);
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
      
      if (configError) throw configError;
      
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
      
      if (error) throw error;
      
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
          // If it's an object, convert to string
          responseText = JSON.stringify(responsePayload);
        } else {
          // Fallback
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
      // Request new insights from the edge function with improved error handling
      console.log('Calling send_ai_insights edge function...');
      const response = await supabase.functions.invoke('send_ai_insights', {
        method: 'POST',
        body: { user_id: userId }
      });
      
      console.log('Edge function response:', response);
      
      // Check if we have an error object
      if (response.error) {
        console.error('Edge Function error:', response.error);
        throw new Error(`Edge Function error: ${response.error.message || 'Unknown error'}`);
      }
      
      // Check if we have data
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
      } else {
        // Handle case where we got a successful response but no data
        throw new Error('No insights returned from Edge Function');
      }
    } catch (err: any) {
      console.error('Error fetching AI insights:', err);
      
      // Provide a more user-friendly error message
      if (err.message?.includes('non-2xx status code')) {
        toast.error('The AI insights service is currently unavailable. Please try again later.');
      } else {
        toast.error(err.message || 'Failed to fetch AI insights');
      }
      
      // Optionally, provide a fallback experience
      setInsightsHTML('<p>Unable to generate insights at this time. Please try again later.</p>');
    } finally {
      setIsLoading(false);
    }
  };

  const remainingRequests = Math.max(0, insightsLimit - insightsUsed);
  const isLimitExceeded = insightsUsed >= insightsLimit;

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-primary" />
              <h3 className="font-medium">AI Weight Analysis</h3>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300">
                Beta
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-muted">
                {remainingRequests}/{insightsLimit} requests
              </Badge>
              
              <Button
                size="sm"
                onClick={fetchInsights}
                disabled={isLoading || isLimitExceeded}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Loading...
                  </>
                ) : (
                  'Get AI Insights'
                )}
              </Button>
            </div>
          </div>
          
          {isLimitExceeded && (
            <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
              <p>You've reached your AI insights limit for today. 
                 {lastWebhookDate && 
                  ` Last request: ${new Date(lastWebhookDate).toLocaleString()}`}
              </p>
            </div>
          )}
          
          {insightsHTML ? (
            <div className="prose prose-sm max-w-none mt-2">
              <div className="bg-white rounded border border-gray-200 p-4">
                <iframe 
                  srcDoc={insightsHTML} 
                  className="w-full min-h-[200px] border-0"
                  title="AI Insights" 
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              <p>Get AI-powered insights about your weight trends and progress.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsights;
