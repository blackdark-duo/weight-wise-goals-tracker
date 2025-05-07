
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Webhook, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchWebhookConfig, updateWebhookConfig, WebhookConfig } from "@/services/webhookService";

interface WebhookSettingsProps {
  onUpdate?: () => void;
}

const WebhookSettings: React.FC<WebhookSettingsProps> = ({ onUpdate }) => {
  const [config, setConfig] = useState<WebhookConfig>({
    url: "",
    days: 30,
    include_account_fields: true,
    include_user_fields: true,
    fields: {
      user_data: true,
      weight_data: true,
      goal_data: true,
      activity_data: false,
      detailed_analysis: false
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const configData = await fetchWebhookConfig();
      setConfig(configData);
    } catch (error) {
      console.error("Error fetching webhook config:", error);
      toast.error("Failed to load webhook configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateWebhookConfig(config);
      toast.success("Webhook settings saved successfully");
      if (onUpdate) {
        onUpdate();
      }
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
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-3">Loading webhook settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Webhook Configuration
        </CardTitle>
        <CardDescription>
          Configure the default webhook settings for AI insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="webhookUrl">Default Webhook URL</Label>
          <Input
            id="webhookUrl"
            value={config.url}
            onChange={(e) => setConfig({ ...config, url: e.target.value })}
            placeholder="https://example.com/webhook"
          />
          <p className="text-sm text-muted-foreground">
            This URL will be used when sending AI insights data unless a user has their own URL configured
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="days">Days of Data</Label>
          <Input
            id="days"
            type="number"
            min="1"
            max="365"
            value={config.days}
            onChange={(e) => setConfig({ ...config, days: parseInt(e.target.value) })}
          />
          <p className="text-sm text-muted-foreground">
            Number of days of historical data to include in the webhook payload
          </p>
        </div>
        
        <div className="space-y-4 pt-4">
          <h3 className="font-medium">Include Fields</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="accountFields">Account Fields</Label>
              <p className="text-sm text-muted-foreground">Email, user ID, and other account information</p>
            </div>
            <Switch 
              id="accountFields" 
              checked={config.include_account_fields}
              onCheckedChange={(checked) => setConfig({ ...config, include_account_fields: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="userFields">User Fields</Label>
              <p className="text-sm text-muted-foreground">User preferences, settings, and metadata</p>
            </div>
            <Switch 
              id="userFields" 
              checked={config.include_user_fields}
              onCheckedChange={(checked) => setConfig({ ...config, include_user_fields: checked })}
            />
          </div>
          
          <h3 className="font-medium pt-2">Data Fields</h3>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="userData">User Data</Label>
            <Switch 
              id="userData" 
              checked={config.fields.user_data}
              onCheckedChange={(checked) => 
                setConfig({ 
                  ...config, 
                  fields: { ...config.fields, user_data: checked } 
                })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="weightData">Weight Data</Label>
            <Switch 
              id="weightData" 
              checked={config.fields.weight_data}
              onCheckedChange={(checked) => 
                setConfig({ 
                  ...config, 
                  fields: { ...config.fields, weight_data: checked } 
                })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="goalData">Goal Data</Label>
            <Switch 
              id="goalData" 
              checked={config.fields.goal_data}
              onCheckedChange={(checked) => 
                setConfig({ 
                  ...config, 
                  fields: { ...config.fields, goal_data: checked } 
                })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="activityData">Activity Data</Label>
            <Switch 
              id="activityData" 
              checked={config.fields.activity_data}
              onCheckedChange={(checked) => 
                setConfig({ 
                  ...config, 
                  fields: { ...config.fields, activity_data: checked } 
                })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="detailedAnalysis">Detailed Analysis</Label>
            <Switch 
              id="detailedAnalysis" 
              checked={config.fields.detailed_analysis}
              onCheckedChange={(checked) => 
                setConfig({ 
                  ...config, 
                  fields: { ...config.fields, detailed_analysis: checked } 
                })
              }
            />
          </div>
        </div>
        
        <div className="pt-4">
          <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
            {isSaving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Configuration</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookSettings;
