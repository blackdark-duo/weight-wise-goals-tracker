import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  fetchWebhookConfig, 
  updateWebhookConfig, 
  WebhookConfig 
} from '@/services/webhookService';

export const useWebhookConfig = () => {
  const [config, setConfig] = useState<WebhookConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const configData = await fetchWebhookConfig();
      setConfig(configData);
    } catch (err: any) {
      console.error("Error loading webhook config:", err);
      setError(err.message || "Failed to load webhook configuration");
      toast.error("Failed to load webhook configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async (newConfig: WebhookConfig) => {
    setIsSaving(true);
    setError(null);
    
    try {
      await updateWebhookConfig(newConfig);
      setConfig(newConfig);
      toast.success("Webhook configuration saved successfully");
      return true;
    } catch (err: any) {
      console.error("Error saving webhook config:", err);
      const errorMessage = err.message || "Failed to save webhook configuration";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfigField = <K extends keyof WebhookConfig>(
    field: K, 
    value: WebhookConfig[K]
  ) => {
    if (!config) return;
    
    setConfig({
      ...config,
      [field]: value
    });
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return {
    config,
    isLoading,
    isSaving,
    error,
    loadConfig,
    saveConfig,
    updateConfigField
  };
};