import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminLogData {
  action: string;
  target_user_id?: string;
  details?: any;
}

export const useAdminLogger = () => {
  const [isLogging, setIsLogging] = useState(false);

  const logAdminAction = async (logData: AdminLogData) => {
    setIsLogging(true);
    try {
      // Get client IP (simplified - in production, you'd get this from headers)
      const ip_address = 'client-ip'; // Placeholder

      // Call the secure admin audit log edge function
      const { error } = await supabase.functions.invoke('admin-audit-log', {
        body: {
          ...logData,
          ip_address
        }
      });

      if (error) {
        console.error('Failed to log admin action:', error);
        // In production, you might want to fallback to direct database insert
        // or queue the log for retry
      }
    } catch (error) {
      console.error('Error logging admin action:', error);
    } finally {
      setIsLogging(false);
    }
  };

  // Convenience methods for common admin actions
  const logUserAction = (action: string, userId: string, details?: any) => {
    return logAdminAction({
      action,
      target_user_id: userId,
      details
    });
  };

  const logSystemAction = (action: string, details?: any) => {
    return logAdminAction({
      action,
      details
    });
  };

  const logWebhookAction = (action: string, webhookUrl?: string, details?: any) => {
    return logAdminAction({
      action,
      details: {
        webhook_url: webhookUrl,
        ...details
      }
    });
  };

  return {
    logAdminAction,
    logUserAction,
    logSystemAction,
    logWebhookAction,
    isLogging
  };
};