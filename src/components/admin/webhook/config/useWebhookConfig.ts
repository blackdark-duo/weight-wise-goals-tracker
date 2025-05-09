
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WebhookFields } from "@/types/webhook";

interface WebhookConfig {
  id?: number;
  url: string;
  days: number;
  fields: WebhookFields;
  default_webhook_limit?: number;
}

interface WebhookConfigResponse {
  url?: string;
  days?: number;
  fields?: WebhookFields;
  default_webhook_limit?: number;
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
    },
    default_webhook_limit: 10
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWebhookConfig = async () => {
    try {
      setIsLoading(true);
      
      // Try to get config from Edge Function first
      let configData: WebhookConfigResponse | null = null;
      let configError: any = null;
      
      console.log("Attempting to fetch webhook config via edge function...");
      
      try {
        const result = await supabase.functions.invoke('get_webhook_config') as {
          data: WebhookConfigResponse | null;
          error: any;
        };
        
        configData = result.data;
        configError = result.error;
        
        console.log("Edge function response:", { data: configData, error: configError });
      } catch (e) {
        console.error("Error invoking get_webhook_config function:", e);
        configError = e;
      }
      
      // If function call fails, fall back to direct database query
      if (configError || !configData) {
        console.warn("Falling back to direct database query for webhook config");
        const { data, error } = await supabase
          .from('webhook_config')
          .select('*')
          .single();
          
        if (error) throw error;
        
        configData = data;
        console.log("Direct database query result:", configData);
      }
      
      if (configData) {
        setConfig({
          id: configData.id || 1,
          url: configData.url || "https://n8n.cozyapp.uno/webhook/2c26d7e3-525a-4080-9282-21b6af883cf2",
          days: configData.days || 30,
          fields: configData.fields || {
            user_data: true,
            weight_data: true,
            goal_data: true,
            activity_data: false,
            detailed_analysis: false
          },
          default_webhook_limit: configData.default_webhook_limit || 10
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
      
      console.log("Saving webhook config:", config);
      
      let saveError = null;
      let saveData = null;
      
      // Try to update via Edge Function first
      try {
        console.log("Attempting to update webhook config via edge function...");
        const response = await supabase.functions.invoke('update_webhook_config', {
          body: {
            url: config.url,
            days: config.days,
            fields: config.fields,
            default_webhook_limit: config.default_webhook_limit
          }
        }) as {
          data: any;
          error: any;
        };
        
        saveData = response.data;
        saveError = response.error;
        
        console.log("Edge function update response:", { data: saveData, error: saveError });
      } catch (e) {
        console.error("Error invoking update_webhook_config function:", e);
        saveError = e;
      }
      
      // If Edge Function fails, fall back to direct database update
      if (saveError) {
        console.warn("Falling back to direct database update for webhook config");
        const { data, error } = await supabase
          .from('webhook_config')
          .update({
            url: config.url,
            days: config.days,
            fields: config.fields,
            default_webhook_limit: config.default_webhook_limit || 10
          })
          .eq('id', config.id || 1);
          
        if (error) throw error;
        
        saveData = data;
        console.log("Direct database update result:", saveData);
      }
      
      // Update all user profiles to use this URL
      console.log("Updating all user profiles to use the new webhook URL");
      const { error: profilesError } = await supabase
        .from('profiles')
        .update({
          webhook_url: config.url
        });
      
      if (profilesError) {
        console.warn("Error updating profiles with new webhook URL:", profilesError);
      }
      
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

  const updateDefaultWebhookLimit = (limit: number) => {
    setConfig({ ...config, default_webhook_limit: limit });
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
    updateDefaultWebhookLimit,
    saveConfig,
  };
};
