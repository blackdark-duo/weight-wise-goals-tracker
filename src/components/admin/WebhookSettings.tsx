
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Webhook, Calendar } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface WebhookSettingsProps {
  onUpdate?: () => void;
}

interface WebhookConfigType {
  url: string;
  days: number;
  fields: {
    user_data: boolean;
    weight_data: boolean;
    goal_data: boolean;
    activity_data: boolean;
    detailed_analysis: boolean;
  };
}

const WebhookSettings: React.FC<WebhookSettingsProps> = ({ onUpdate }) => {
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfigType>({
    url: "http://n8n.cozyapp.uno:5678/webhook-test/36e520c4-f7a4-4872-8e21-e469701eb68e",
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
    const fetchWebhookConfig = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch(
          'https://mjzzdynuzrpklgexabzs.supabase.co/functions/v1/get_webhook_config',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Error fetching webhook config: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.data) {
          setWebhookConfig({
            url: result.data.url || "",
            days: result.data.days || 30,
            fields: result.data.fields || {
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
    
    fetchWebhookConfig();
  }, []);

  const saveWebhookConfig = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch(
        'https://mjzzdynuzrpklgexabzs.supabase.co/functions/v1/update_webhook_config',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify(webhookConfig)
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }
      
      toast.success("Webhook configuration saved successfully");
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error saving webhook config:", error);
      toast.error(`Failed to save webhook configuration: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden shadow-sm border border-[#ff7f50]/5">
        <div className="h-1 bg-[#ff7f50]"></div>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Webhook className="h-5 w-5 text-[#ff7f50]" />
            AI Insights Webhook Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ff7f50] border-t-transparent"></div>
          <span className="ml-3">Loading webhook configuration...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-sm border border-[#ff7f50]/5">
      <div className="h-1 bg-[#ff7f50]"></div>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Webhook className="h-5 w-5 text-[#ff7f50]" />
          AI Insights Webhook Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="webhookUrl">Webhook URL</Label>
          <Input 
            id="webhookUrl" 
            value={webhookConfig.url} 
            onChange={(e) => setWebhookConfig({...webhookConfig, url: e.target.value})}
            placeholder="https://your-webhook-endpoint.com"
          />
          <p className="text-xs text-muted-foreground">
            The webhook URL that will be called when users request AI insights analysis.
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="days">Data Range (Days)</Label>
            <span className="text-sm text-muted-foreground">{webhookConfig.days} days</span>
          </div>
          <div className="flex items-center gap-4">
            <Input 
              id="days" 
              type="range" 
              min="1" 
              max="365" 
              value={webhookConfig.days} 
              onChange={(e) => setWebhookConfig({...webhookConfig, days: parseInt(e.target.value)})}
              className="flex-1"
            />
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setWebhookConfig({...webhookConfig, days: 30})}
              >
                <Calendar className="h-4 w-4 mr-1" />
                30d
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setWebhookConfig({...webhookConfig, days: 90})}
              >
                <Calendar className="h-4 w-4 mr-1" />
                90d
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setWebhookConfig({...webhookConfig, days: 365})}
              >
                <Calendar className="h-4 w-4 mr-1" />
                1y
              </Button>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Data to Include</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="userData" 
                checked={webhookConfig.fields.user_data}
                onCheckedChange={(checked) => 
                  setWebhookConfig({
                    ...webhookConfig, 
                    fields: {...webhookConfig.fields, user_data: !!checked}
                  })
                }
              />
              <Label htmlFor="userData">User Data (Name, Email)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="weightData" 
                checked={webhookConfig.fields.weight_data}
                onCheckedChange={(checked) => 
                  setWebhookConfig({
                    ...webhookConfig, 
                    fields: {...webhookConfig.fields, weight_data: !!checked}
                  })
                }
              />
              <Label htmlFor="weightData">Weight History</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="goalData" 
                checked={webhookConfig.fields.goal_data}
                onCheckedChange={(checked) => 
                  setWebhookConfig({
                    ...webhookConfig, 
                    fields: {...webhookConfig.fields, goal_data: !!checked}
                  })
                }
              />
              <Label htmlFor="goalData">Goal Information</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="activityData" 
                checked={webhookConfig.fields.activity_data}
                onCheckedChange={(checked) => 
                  setWebhookConfig({
                    ...webhookConfig, 
                    fields: {...webhookConfig.fields, activity_data: !!checked}
                  })
                }
              />
              <Label htmlFor="activityData">Activity Data</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="detailedAnalysis" 
                checked={webhookConfig.fields.detailed_analysis}
                onCheckedChange={(checked) => 
                  setWebhookConfig({
                    ...webhookConfig, 
                    fields: {...webhookConfig.fields, detailed_analysis: !!checked}
                  })
                }
              />
              <Label htmlFor="detailedAnalysis">Detailed Analysis</Label>
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <Button 
            className="w-full md:w-auto bg-[#ff7f50] hover:bg-[#ff6347] text-white"
            onClick={saveWebhookConfig}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Saving...
              </>
            ) : "Save Webhook Configuration"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookSettings;
