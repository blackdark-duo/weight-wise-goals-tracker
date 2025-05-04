
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Webhook, Calendar, TestTube, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface WebhookSettingsProps {
  onUpdate?: () => void;
}

interface WebhookFields {
  user_data: boolean;
  weight_data: boolean;
  goal_data: boolean;
  activity_data: boolean;
  detailed_analysis: boolean;
}

interface WebhookConfigType {
  url: string;
  days: number;
  fields: WebhookFields;
  include_account_fields: boolean;
  include_user_fields: boolean;
  include_weight_entries: boolean;
  include_goals: boolean;
  webhook_version: string;
}

interface WebhookTestResponse {
  status: string;
  message: string;
  timestamp: string;
  insights?: string[];
  [key: string]: any;
}

const DEFAULT_WEBHOOK_URL = "https://api.example.com/webhook";

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
    },
    include_account_fields: true,
    include_user_fields: true,
    include_weight_entries: true,
    include_goals: true,
    webhook_version: "1.0"
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResponse, setTestResponse] = useState<WebhookTestResponse | null>(null);
  const [testPayload, setTestPayload] = useState<string>('{\n  "account_id": "12345",\n  "user_id": "67890",\n  "email": "user@example.com",\n  "unit": "kg",\n  "goal_weight": 75.0,\n  "goal_days": 30,\n  "entries": {\n    "weight": [78.0, 75.6, 77.0],\n    "notes": ["", "Ate dinner out at a buffet", "Ate pizza today"],\n    "dates": ["2025-05-01", "2025-05-02", "2025-05-03"]\n  }\n}');

  useEffect(() => {
    const fetchWebhookConfig = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('webhook_config')
          .select('*')
          .single();
        
        if (error) throw error;
        
        if (data) {
          // Create default fields structure
          const defaultFields: WebhookFields = {
            user_data: true,
            weight_data: true,
            goal_data: true,
            activity_data: true,
            detailed_analysis: true
          };
          
          // Extract fields from JSON safely
          const fieldsData = data.fields as Record<string, boolean> || {};
          
          setWebhookConfig({
            url: data.url || DEFAULT_WEBHOOK_URL,
            days: data.days || 30,
            fields: {
              user_data: fieldsData.user_data ?? defaultFields.user_data,
              weight_data: fieldsData.weight_data ?? defaultFields.weight_data,
              goal_data: fieldsData.goal_data ?? defaultFields.goal_data,
              activity_data: fieldsData.activity_data ?? defaultFields.activity_data,
              detailed_analysis: fieldsData.detailed_analysis ?? defaultFields.detailed_analysis
            },
            include_account_fields: data.include_account_fields ?? true,
            include_user_fields: data.include_user_fields ?? true,
            include_weight_entries: data.include_weight_entries ?? true,
            include_goals: data.include_goals ?? true,
            webhook_version: data.webhook_version || "1.0"
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
      
      const { error } = await supabase
        .from('webhook_config')
        .update({
          url: webhookConfig.url,
          days: webhookConfig.days,
          fields: {
            user_data: webhookConfig.fields.user_data,
            weight_data: webhookConfig.fields.weight_data,
            goal_data: webhookConfig.fields.goal_data,
            activity_data: webhookConfig.fields.activity_data,
            detailed_analysis: webhookConfig.fields.detailed_analysis
          } as unknown as Record<string, boolean>,
          include_account_fields: webhookConfig.include_account_fields,
          include_user_fields: webhookConfig.include_user_fields,
          include_weight_entries: webhookConfig.include_weight_entries,
          include_goals: webhookConfig.include_goals,
          webhook_version: webhookConfig.webhook_version
        })
        .eq('id', 1);
      
      if (error) throw error;
      
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

      // Record the webhook test in the database
      const { data: webhookLogData, error: webhookLogError } = await supabase
        .from('webhook_logs')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          url: webhookConfig.url,
          request_payload: payloadObj,
          status: 'pending'
        })
        .select('id')
        .single();

      if (webhookLogError) {
        console.error("Error logging webhook test:", webhookLogError);
      }

      const logId = webhookLogData?.id;

      // Send test request to webhook
      const response = await fetch(webhookConfig.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: testPayload,
      });

      const responseData = await response.json();
      console.log("Webhook test response:", responseData);

      // Update the webhook log with the response
      if (logId) {
        await supabase
          .from('webhook_logs')
          .update({
            response_payload: responseData,
            status: response.ok ? 'success' : 'error'
          })
          .eq('id', logId);
      }

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

  const mockResponseExample = `Weight Trend Summary:
- Your weight has shown a general downward trend over the last 3 days (from 78.0 kg to 77.0 kg), which is a great step toward your goal of 75.0 kg in 30 days.
- Despite a slight fluctuation on 2025-05-02 (75.6 kg), your consistency is commendable.
Dietary Insights:
- On 2025-05-02, dining out at a buffet may have influenced the weight drop; monitor portion sizes in such settings.
- On 2025-05-03, consuming pizza could impact progress; consider balancing with lighter meals or increased activity.`;

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
          <Label>Account & User Data</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeAccountFields" 
                checked={webhookConfig.include_account_fields}
                onCheckedChange={(checked) => 
                  setWebhookConfig({
                    ...webhookConfig, 
                    include_account_fields: !!checked
                  })
                }
              />
              <Label htmlFor="includeAccountFields">Include Account Fields</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeUserFields" 
                checked={webhookConfig.include_user_fields}
                onCheckedChange={(checked) => 
                  setWebhookConfig({
                    ...webhookConfig, 
                    include_user_fields: !!checked
                  })
                }
              />
              <Label htmlFor="includeUserFields">Include User Fields</Label>
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
                className="min-h-[180px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground"
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This is an example payload that will be sent to your webhook. Edit as needed.
              </p>
            </div>
            
            <div className="flex justify-between">
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
              
              <Button
                onClick={() => setTestResponse({
                  status: "success",
                  message: "Webhook test successful",
                  timestamp: new Date().toISOString(),
                  insights: mockResponseExample.split('\n')
                })}
                variant="outline"
                disabled={isTesting}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Mock Response
              </Button>
            </div>
            
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
                        <div className="space-y-4">
                          {testResponse.insights ? (
                            <div className="bg-background p-4 rounded-md border text-sm">
                              {testResponse.insights.map((line, index) => (
                                <div key={index} className={line.startsWith('-') ? 'pl-4' : 'font-bold mt-2'}>
                                  {line}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <ScrollArea className="h-[200px]">
                              <pre className="text-xs overflow-auto p-2">
                                {JSON.stringify(testResponse, null, 2)}
                              </pre>
                            </ScrollArea>
                          )}
                        </div>
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
