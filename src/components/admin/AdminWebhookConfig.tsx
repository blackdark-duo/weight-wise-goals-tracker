
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Webhook } from "lucide-react";

interface WebhookConfig {
  id: number;
  url: string;
  days: number;
}

const AdminWebhookConfig = () => {
  const [config, setConfig] = useState<WebhookConfig>({
    id: 1,
    url: "https://n8n.cozyapp.uno/webhook/2c26d7e3-525a-4080-9282-21b6af883cf2",
    days: 30
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWebhookConfig();
  }, []);

  const fetchWebhookConfig = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('webhook_config')
        .select('*')
        .single();
      
      if (error) throw error;
      
      if (data) {
        setConfig({
          id: data.id || 1,
          url: data.url || "https://n8n.cozyapp.uno/webhook/2c26d7e3-525a-4080-9282-21b6af883cf2",
          days: data.days || 30
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
      
      // Update global configuration
      const { error: configError } = await supabase
        .from('webhook_config')
        .update({
          url: config.url,
          days: config.days
        })
        .eq('id', config.id);
      
      if (configError) throw configError;
      
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Global Webhook Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="webhook-url">Global Webhook URL</Label>
          <Input
            id="webhook-url"
            value={config.url}
            onChange={(e) => setConfig({ ...config, url: e.target.value })}
            placeholder="Enter webhook URL"
          />
          <p className="text-xs text-muted-foreground">
            This URL will be used for all webhook requests and will override individual user settings
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="days">Days of Data</Label>
          <Input
            id="days"
            type="number"
            min={1}
            max={365}
            value={config.days}
            onChange={(e) => setConfig({ ...config, days: parseInt(e.target.value) || 30 })}
          />
          <p className="text-xs text-muted-foreground">
            Number of days of historical data to include in webhook requests
          </p>
        </div>
        
        <Button 
          onClick={saveConfig} 
          className="mt-6"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminWebhookConfig;
