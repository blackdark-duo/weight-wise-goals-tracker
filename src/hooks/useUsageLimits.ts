import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface UsageData {
  credits: number;
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
      // Get user's current credits and webhook usage from profiles
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('credits, webhook_count, webhook_limit')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile data:', error);
        return;
      }

      if (profileData) {
        const usageData = {
          credits: profileData.credits,
          webhook_count: profileData.webhook_count,
          webhook_limit: profileData.webhook_limit
        };

        setUsage(usageData);

        // Check if user has no credits left
        const creditsExceeded = usageData.credits <= 0;
        const webhooksExceeded = usageData.webhook_count >= usageData.webhook_limit;

        // Only redirect if on a protected route and limits exceeded
        const currentPath = window.location.pathname;
        const isProtectedRoute = ['/dashboard', '/reports', '/goals', '/account'].includes(currentPath);
        
        if (isProtectedRoute && (creditsExceeded || webhooksExceeded)) {
          navigate('/signup', { 
            state: { 
              reason: creditsExceeded ? 'credits' : 'webhooks',
              current: creditsExceeded ? usageData.credits : usageData.webhook_count,
              limit: creditsExceeded ? 5 : usageData.webhook_limit
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
    isCreditsExceeded: usage ? usage.credits <= 0 : false,
    isWebhooksExceeded: usage ? usage.webhook_count >= usage.webhook_limit : false
  };
};