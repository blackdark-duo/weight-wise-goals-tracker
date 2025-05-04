
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Webhook, Calendar, TestTube, ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

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

interface WebhookTestResponse {
  status: string;
  message: string;
  timestamp: string;
  [key: string]: any;
}

const DEFAULT_WEBHOOK_URL = "http://n8n.cozyapp.uno:5678/webhook-test/2c26d7e3-525a-4080-9282-21b6af883cf2";

const WebhookSettings: React.FC<WebhookSettingsProps> = ({ onUpdate }) => {
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfigType>({
    url: DEFAULT_WEBHOOK_URL,
    days: 30,
    fields: {
      user_data: true,
      weight_data: true,
      goal_data: true,
      activity_data: true,
      detailed_analysis: true
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResponse, setTestResponse] = useState<WebhookTestResponse | null>(null);
  const [testPayload, setTestPayload] = useState<string>('{"account_id": "12345", "user_id": "67890", "email": "user@example.com"}');

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
            url: result.data.url || DEFAULT_WEBHOOK_URL,
            days: result.data.days || 30,
            fields: result.data.fields || {
              user_data: true,
              weight_data: true,
              goal_data: true,
              activity_data: true,
              detailed_analysis: true
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

  const testWebhook = async () => {
    try {
      setIsTesting(true);
      setTestResponse(null);

      console.log("Testing webhook with URL:", webhookConfig.url);
      console.log("Test payload:", testPayload);

      let payloadObj = {};
      try {
        payloadObj = JSON.parse(testPayload);
      } catch (err) {
        toast.error("Invalid JSON payload");
        return;
      }

      const response = await fetch(webhookConfig.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: testPayload,
      });

      const responseData = await response.json();
      console.log("Webhook test response:", responseData);

      setTestResponse(responseData);
      toast.success("Webhook test completed successfully");
    } catch (error) {
      console.error("Error testing webhook:", error);
      toast.error(`Failed to test webhook: ${(error as Error).message}`);
    } finally {
      setIsTesting(false);
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
        <CardDescription>
          Configure the webhook that will process AI insights requests and receive data from WeightWise.
        </CardDescription>
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
        
        <div className="pt-4 flex flex-col md:flex-row gap-3">
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
          <Button 
            className="w-full md:w-auto"
            variant="outline"
            onClick={() => setWebhookConfig({...webhookConfig, url: DEFAULT_WEBHOOK_URL})}
          >
            Reset to Default URL
          </Button>
        </div>
        
        <div className="border-t border-border pt-6 mt-4">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <TestTube className="h-5 w-5 mr-2 text-[#ff7f50]" />
            Test Webhook
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="testPayload" className="mb-2 block">Test Payload (JSON)</Label>
              <textarea
                id="testPayload"
                className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground"
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={testWebhook}
              disabled={isTesting}
              className="bg-[#ff7f50] hover:bg-[#ff6347] text-white"
              variant="default"
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
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="response">
                  <AccordionTrigger className="text-sm font-medium">
                    <div className="flex items-center">
                      <Badge className="mr-2 bg-green-100 text-green-800 hover:bg-green-200">
                        Response Received
                      </Badge>
                      <span>View Response Details</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Alert className="bg-muted/50">
                      <AlertDescription>
                        <ScrollArea className="h-[200px]">
                          <pre className="text-xs overflow-auto p-2">
                            {JSON.stringify(testResponse, null, 2)}
                          </pre>
                        </ScrollArea>
                      </AlertDescription>
                    </Alert>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookSettings;
