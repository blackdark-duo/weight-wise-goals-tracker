
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Webhook } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { WebhookFields } from "@/types/webhook";

interface WebhookConfig {
  id?: number;
  url: string;
  days: number;
  fields: WebhookFields;
}

const AdminWebhookConfig = () => {
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

  useEffect(() => {
    fetchWebhookConfig();
  }, []);

  const fetchWebhookConfig = async () => {
    try {
      setIsLoading(true);
      
      // Use the RPC function that's more reliable
      const { data, error } = await supabase.rpc('get_webhook_config');
      
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
      
      // Use the RPC function to update the webhook config
      const { data, error } = await supabase.rpc('update_webhook_config', {
        config_url: config.url,
        config_days: config.days,
        config_fields: config.fields
      });
      
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

  const updateField = (field: keyof WebhookFields, value: boolean) => {
    setConfig({
      ...config,
      fields: {
        ...config.fields,
        [field]: value
      }
    });
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

        <div className="space-y-2">
          <Label className="text-base">Data Fields to Include</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="user_data"
                checked={config.fields.user_data} 
                onCheckedChange={(checked) => updateField('user_data', checked === true)}
              />
              <Label htmlFor="user_data">User Data</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="weight_data"
                checked={config.fields.weight_data} 
                onCheckedChange={(checked) => updateField('weight_data', checked === true)}
              />
              <Label htmlFor="weight_data">Weight Data</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="goal_data"
                checked={config.fields.goal_data} 
                onCheckedChange={(checked) => updateField('goal_data', checked === true)}
              />
              <Label htmlFor="goal_data">Goal Data</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="activity_data"
                checked={config.fields.activity_data} 
                onCheckedChange={(checked) => updateField('activity_data', checked === true)}
              />
              <Label htmlFor="activity_data">Activity Data</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="detailed_analysis"
                checked={config.fields.detailed_analysis} 
                onCheckedChange={(checked) => updateField('detailed_analysis', checked === true)}
              />
              <Label htmlFor="detailed_analysis">Detailed Analysis</Label>
            </div>
          </div>
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
