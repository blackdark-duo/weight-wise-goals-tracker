
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Webhook, Calendar, TestTube, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  WebhookConfig, 
  fetchWebhookConfig, 
  updateWebhookConfig, 
  testWebhook,
  generateDefaultTestPayload
} from "@/services/webhookService";

interface WebhookSettingsProps {
  onUpdate?: () => void;
}

const DEFAULT_TEST_PAYLOAD = `{
  "account_id": "12345",
  "user_id": "67890",
  "email": "user@example.com",
  "unit": "kg",
  "goal_weight": 75.0,
  "goal_days": 30,
  "entries": {
    "weight": [78.0, 75.6, 77.0],
    "notes": ["", "Ate dinner out at a buffet", "Ate pizza today"],
    "dates": ["2025-05-01", "2025-05-02", "2025-05-03"]
  }
}`;

const WebhookSettings: React.FC<WebhookSettingsProps> = ({ onUpdate }) => {
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResponse, setTestResponse] = useState<any | null>(null);
  const [testPayload, setTestPayload] = useState<string>(DEFAULT_TEST_PAYLOAD);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const config = await fetchWebhookConfig();
        setWebhookConfig(config);
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
      
      const result = await updateWebhookConfig(webhookConfig);
      
      if (!result) throw new Error("Failed to save webhook configuration");
      
      toast.success("Webhook configuration saved successfully");
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error saving webhook config:", error);
      toast.error(`Failed to save webhook configuration: ${(error as Error).message}`);
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
    } catch (error) {
      console.error("Error testing webhook:", error);
      toast.error(`Failed to test webhook: ${(error as Error).message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const generateMockResponse = () => {
    const mockInsights = [
      "Weight Trend Summary:",
      "- Your weight has shown a general downward trend over the last 3 days (from 78.0 kg to 77.0 kg), which is a great step toward your goal of 75.0 kg in 30 days.",
      "- Despite a slight fluctuation on 2025-05-02 (75.6 kg), your consistency is commendable.",
      "Dietary Insights:",
      "- On 2025-05-02, dining out at a buffet may have influenced the weight drop; monitor portion sizes in such settings.",
      "- On 2025-05-03, consuming pizza could impact progress; consider balancing with lighter meals or increased activity."
    ];
    
    setTestResponse({
      status: "success",
      message: "Webhook test successful",
      timestamp: new Date().toISOString(),
      insights: mockInsights
    });
  };

  if (isLoading || !webhookConfig) {
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
          Configure the webhook that will process AI insights requests and receive data from Weight Wise.
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
            onClick={() => setWebhookConfig({...webhookConfig, url: "http://n8n.cozyapp.uno:5678/webhook-test/2c26d7e3-525a-4080-9282-21b6af883cf2"})}
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
                onClick={handleTestWebhook}
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
                onClick={generateMockResponse}
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
                              {testResponse.insights.map((line: string, index: number) => (
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
