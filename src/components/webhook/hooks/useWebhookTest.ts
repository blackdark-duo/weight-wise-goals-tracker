import { useState } from 'react';
import { toast } from 'sonner';
import { testWebhook, generateDefaultTestPayload } from '@/services/webhookService';

interface UseWebhookTestProps {
  onTestComplete?: (result: any) => void;
  onTestError?: (error: Error) => void;
}

export const useWebhookTest = ({ 
  onTestComplete, 
  onTestError 
}: UseWebhookTestProps = {}) => {
  const [isTestInProgress, setIsTestInProgress] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const testWebhookUrl = async (url: string, customPayload?: any) => {
    if (!url) {
      toast.error("Please enter a webhook URL first");
      return;
    }

    setIsTestInProgress(true);
    setTestResult(null);
    
    try {
      const testPayload = customPayload || generateDefaultTestPayload({
        timestamp: new Date().toISOString()
      });
      
      const result = await testWebhook(url, testPayload);
      setTestResult(result);
      toast.success("Webhook test completed successfully");
      onTestComplete?.(result);
      
      return result;
    } catch (error: any) {
      console.error("Error testing webhook:", error);
      const errorMessage = error.message || "Failed to test webhook";
      toast.error(errorMessage);
      setTestResult({ error: errorMessage });
      onTestError?.(error);
      throw error;
    } finally {
      setIsTestInProgress(false);
    }
  };

  const resetTestResult = () => {
    setTestResult(null);
  };

  return {
    testWebhookUrl,
    isTestInProgress,
    testResult,
    resetTestResult
  };
};