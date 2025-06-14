import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface UsageData {
  insights_used: number;
  insights_limit: number;
  webhook_count: number;
  webhook_limit: number;
}

export const useUsageLimits = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkUsageLimits = async () => {
    if (!session?.user?.id) return;

    try {
      // Get user's current usage from profiles and webhook_config
      const [profileResult, configResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('webhook_count, webhook_limit')
          .eq('id', session.user.id)
          .single(),
        supabase
          .from('webhook_config')
          .select('insights_used, insights_limit')
          .eq('id', 1)
          .single()
      ]);

      if (profileResult.data && configResult.data) {
        const usageData = {
          insights_used: configResult.data.insights_used,
          insights_limit: configResult.data.insights_limit,
          webhook_count: profileResult.data.webhook_count,
          webhook_limit: profileResult.data.webhook_limit
        };

        setUsage(usageData);

        // Check if user has exceeded limits
        const insightsExceeded = usageData.insights_used >= usageData.insights_limit;
        const webhooksExceeded = usageData.webhook_count >= usageData.webhook_limit;

        // Only redirect if on a protected route and limits exceeded
        const currentPath = window.location.pathname;
        const isProtectedRoute = ['/dashboard', '/reports', '/goals', '/account'].includes(currentPath);
        
        if (isProtectedRoute && (insightsExceeded || webhooksExceeded)) {
          navigate('/pricing', { 
            state: { 
              reason: insightsExceeded ? 'insights' : 'webhooks',
              current: insightsExceeded ? usageData.insights_used : usageData.webhook_count,
              limit: insightsExceeded ? usageData.insights_limit : usageData.webhook_limit
            }
          });
        }
      }
    } catch (error) {
      console.error('Error checking usage limits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkUsageLimits();
  }, [session?.user?.id]);

  return {
    usage,
    isLoading,
    checkUsageLimits,
    isInsightsExceeded: usage ? usage.insights_used >= usage.insights_limit : false,
    isWebhooksExceeded: usage ? usage.webhook_count >= usage.webhook_limit : false
  };
};