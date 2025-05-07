
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Webhook } from 'lucide-react';
import { formatInsightsText } from '@/utils/insightsFormatter';

interface AIInsightsProps {
  userId: string | null;
}

const AIInsights: React.FC<AIInsightsProps> = ({ userId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [webhookLimit, setWebhookLimit] = useState<number>(0);
  const [webhookCount, setWebhookCount] = useState<number>(0);
  const [lastWebhookDate, setLastWebhookDate] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('webhook_limit, webhook_count, last_webhook_date, webhook_url')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setWebhookLimit(data.webhook_limit || 0);
        setWebhookCount(data.webhook_count || 0);
        setLastWebhookDate(data.last_webhook_date);
        setWebhookUrl(data.webhook_url);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const fetchInsights = async () => {
    if (!userId) {
      toast.error('You must be logged in to use this feature');
      return;
    }

    setIsLoading(true);
    setInsights(null);
    
    try {
      // Get the most recent webhookLog entry for this user
      const { data: recentLogs, error: logsError } = await supabase
        .from('webhook_logs')
        .select('response_payload, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (logsError) throw logsError;
      
      // If there's a recent log within the last hour, use it
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      
      if (recentLogs && recentLogs.length > 0 && 
          new Date(recentLogs[0].created_at) > oneHourAgo &&
          recentLogs[0].response_payload) {
        // Use cached insights
        const formattedInsights = formatInsightsText(recentLogs[0].response_payload);
        setInsights(formattedInsights);
        toast.info('Showing recent insights');
      } else {
        // Request new insights from the edge function
        const { data, error } = await supabase.functions.invoke('send_ai_insights', {
          method: 'POST',
        });
        
        if (error) throw error;
        
        if (data && data.message) {
          const formattedInsights = formatInsightsText(data.message);
          setInsights(formattedInsights);
          
          // Update webhook count in state
          setWebhookCount(prev => prev + 1);
          setLastWebhookDate(new Date().toISOString());
        } else {
          throw new Error('No insights returned');
        }
      }
    } catch (err: any) {
      console.error('Error fetching AI insights:', err);
      toast.error(err.message || 'Failed to fetch AI insights');
    } finally {
      setIsLoading(false);
    }
  };

  const remainingRequests = Math.max(0, webhookLimit - webhookCount);
  const isLimitExceeded = webhookCount >= webhookLimit;

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-primary" />
              <h3 className="font-medium">AI Weight Analysis</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-muted">
                {remainingRequests}/{webhookLimit} requests
              </Badge>
              
              <Button
                size="sm"
                onClick={fetchInsights}
                disabled={isLoading || isLimitExceeded || !webhookUrl}
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
          
          {!webhookUrl && (
            <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
              <p>Please set up your webhook URL in your account settings to use AI insights.</p>
            </div>
          )}
          
          {webhookUrl && isLimitExceeded && (
            <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
              <p>You've reached your AI insights limit for today. 
                 {lastWebhookDate && 
                  ` Last request: ${new Date(lastWebhookDate).toLocaleString()}`}
              </p>
            </div>
          )}
          
          {insights ? (
            <div className="prose prose-sm max-w-none mt-2">
              <div dangerouslySetInnerHTML={{ __html: insights }} />
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
