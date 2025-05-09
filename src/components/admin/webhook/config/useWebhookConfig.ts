
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WebhookFields } from "@/types/webhook";

interface WebhookConfig {
  id?: number;
  url: string;
  days: number;
  fields: WebhookFields;
}

interface WebhookConfigResponse {
  url?: string;
  days?: number;
  fields?: WebhookFields;
  [key: string]: any;
}

export const useWebhookConfig = () => {
  const [config, setConfig] = useState<WebhookConfig>({
    id: 1,
    url: "https://n8n.cozyapp.uno/webhook/2c26d7e3-525a-4080-9282-21b6af883cf2",
    days: 30,
    fields: {
      user_data: true,
      weight_data: true,
      goal_data: true,
      activity_data: false,
      detailed_analysis: false
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWebhookConfig = async () => {
    try {
      setIsLoading(true);
      
      // Correctly cast the RPC function response
      const { data, error } = await supabase.functions.invoke('get_webhook_config') as {
        data: WebhookConfigResponse | null;
        error: any;
      };
      
      if (error) throw error;
      
      if (data) {
        setConfig({
          id: 1,
          url: data.url || "https://n8n.cozyapp.uno/webhook/2c26d7e3-525a-4080-9282-21b6af883cf2",
          days: data.days || 30,
          fields: data.fields || {
            user_data: true,
            weight_data: true,
            goal_data: true,
            activity_data: false,
            detailed_analysis: false
          }
        });
      }
    } catch (error) {
      console.error("Error fetching webhook config:", error);
      toast.error("Failed to load webhook configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      setIsSaving(true);
      
      // Validate URL format
      if (!config.url || !config.url.trim()) {
        throw new Error("Webhook URL cannot be empty");
      }
      
      if (config.days <= 0) {
        throw new Error("Days must be a positive number");
      }
      
      // Correctly cast the RPC function response
      const { data, error } = await supabase.functions.invoke('update_webhook_config', {
        body: {
          url: config.url,
          days: config.days,
          fields: config.fields
        }
      }) as {
        data: WebhookConfigResponse | null;
        error: any;
      };
      
      if (error) throw error;
      
      // Update all user profiles to use this URL
      const { error: profilesError } = await supabase
        .from('profiles')
        .update({
          webhook_url: config.url
        });
      
      if (profilesError) throw profilesError;
      
      toast.success("Webhook configuration saved and applied to all users");
    } catch (error: any) {
      console.error("Error saving webhook config:", error);
      toast.error(error.message || "Failed to save webhook configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const updateUrl = (url: string) => {
    setConfig({ ...config, url });
  };

  const updateDays = (days: number) => {
    setConfig({ ...config, days });
  };

  const updateField = (field: keyof WebhookFields, value: boolean) => {
    setConfig({
      ...config,
      fields: {
        ...config.fields,
        [field]: value
      }
    });
  };

  useEffect(() => {
    fetchWebhookConfig();
  }, []);

  return {
    config,
    isLoading,
    isSaving,
    updateUrl,
    updateDays,
    updateField,
    saveConfig,
  };
};
