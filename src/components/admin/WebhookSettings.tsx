
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Webhook, Calendar, TestTube, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  WebhookConfig, 
  fetchWebhookConfig, 
  updateWebhookConfig, 
  testWebhook 
} from "@/services/webhookService";

const WebhookSettings: React.FC = () => {
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResponse, setTestResponse] = useState<any | null>(null);
  const [testPayload, setTestPayload] = useState<string>("");

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const config = await fetchWebhookConfig();
        setWebhookConfig(config);
        
        // Set default test payload
        setTestPayload(JSON.stringify({
          user_id: "test-user",
          unit: "kg",
          entries: {
            weight: [80.5, 79.8, 79.2],
            dates: ["2025-05-01", "2025-05-02", "2025-05-03"]
          }
        }, null, 2));
      } catch (error) {
        console.error("Error fetching webhook config:", error);
        toast.error("Failed to load webhook configuration");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConfig();
  }, []);

  const saveWebhookConfig = async () => {
    if (!webhookConfig) return;
    
    try {
      setIsSaving(true);
      
      await updateWebhookConfig(webhookConfig);
      toast.success("Webhook configuration saved successfully");
    } catch (error: any) {
      console.error("Error saving webhook config:", error);
      toast.error(`Failed to save webhook configuration: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookConfig) return;
    
    try {
      setIsTesting(true);
      setTestResponse(null);

      let payloadObj = {};
      try {
        payloadObj = JSON.parse(testPayload);
      } catch (err) {
        toast.error("Invalid JSON payload");
        return;
      }

      const response = await testWebhook(webhookConfig.url, payloadObj);
      setTestResponse(response);
      toast.success("Webhook test completed successfully");
    } catch (error: any) {
      console.error("Error testing webhook:", error);
      toast.error(`Failed to test webhook: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading || !webhookConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span className="ml-3">Loading webhook configuration...</span>
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
          Configure the webhook that processes AI insights requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="webhookUrl">Webhook URL</Label>
          <Input 
            id="webhookUrl" 
            value={webhookConfig.url} 
            onChange={(e) => setWebhookConfig({...webhookConfig, url: e.target.value})}
            placeholder="https://api.example.com/webhook"
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
          </div>
        </div>
        
        <div className="pt-4 flex flex-col md:flex-row gap-3">
          <Button 
            onClick={saveWebhookConfig}
            disabled={isSaving}
            className="w-full md:w-auto"
          >
            {isSaving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Saving...
              </>
            ) : "Save Configuration"}
          </Button>
        </div>
        
        <div className="border-t border-border pt-6 mt-4">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <TestTube className="h-5 w-5 mr-2" />
            Test Webhook
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="testPayload" className="mb-2 block">Test Payload (JSON)</Label>
              <textarea
                id="testPayload"
                className="min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground"
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleTestWebhook}
              disabled={isTesting}
              variant="outline"
            >
              {isTesting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Webhook
                </>
              )}
            </Button>
            
            {testResponse && (
              <Alert className="mt-4">
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Badge className="mr-2 bg-green-100 text-green-800">
                        Response Received
                      </Badge>
                    </div>
                    <pre className="text-xs overflow-auto p-2 bg-muted rounded-md max-h-[200px]">
                      {JSON.stringify(testResponse, null, 2)}
                    </pre>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookSettings;
