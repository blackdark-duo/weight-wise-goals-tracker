
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Webhook, TestTube } from "lucide-react";
import { toast } from "sonner";
import { 
  fetchUserWebhookUrl, 
  updateUserWebhookUrl, 
  testWebhook, 
  generateDefaultTestPayload,
  DEFAULT_WEBHOOK_URL
} from "@/services/webhookService";

interface WebhookSettingsProps {
  userId: string | null;
}

const WebhookSettings: React.FC<WebhookSettingsProps> = ({ userId }) => {
  const [webhookUrl, setWebhookUrl] = useState<string>(DEFAULT_WEBHOOK_URL);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    const loadUserWebhook = async () => {
      if (!userId) return;
      
      try {
        const url = await fetchUserWebhookUrl(userId);
        if (url) {
          setWebhookUrl(url);
        }
      } catch (err) {
        console.error("Error fetching webhook URL:", err);
      }
    };
    
    loadUserWebhook();
  }, [userId]);

  const handleSaveWebhook = async () => {
    if (!userId) {
      toast.error("Please sign in to save webhook URL");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const success = await updateUserWebhookUrl(userId, webhookUrl);
        
      if (!success) throw new Error("Failed to update webhook URL");
      
      toast.success("Webhook URL saved successfully");
    } catch (err: any) {
      console.error("Error saving webhook URL:", err);
      toast.error(err.message || "Failed to save webhook URL");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      toast.error("Please enter a webhook URL first");
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    
    try {
      const testPayload = generateDefaultTestPayload({
        user_id: userId,
        timestamp: new Date().toISOString()
      });
      
      const result = await testWebhook(webhookUrl, testPayload);
      setTestResult(result);
      toast.success("Webhook test completed successfully");
    } catch (err: any) {
      console.error("Error testing webhook:", err);
      toast.error(err.message || "Failed to test webhook");
      setTestResult({ error: err.message || "Unknown error occurred" });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Webhook className="h-5 w-5 text-brand-primary" />
        <h3 className="text-lg font-medium">AI Insights Webhook</h3>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="webhookUrl">Webhook URL</Label>
        <div className="flex gap-2">
          <Input
            id="webhookUrl"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://your-webhook-url.com/hook"
            className="flex-1"
          />
          <Button 
            onClick={handleSaveWebhook}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          This webhook will receive your weight data when you request AI insights. The response will be displayed on your dashboard.
        </p>
      </div>

      <div className="pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleTestWebhook}
          disabled={isTesting}
          className="flex items-center gap-2"
        >
          <TestTube className="h-4 w-4" />
          {isTesting ? "Testing..." : "Test Webhook"}
        </Button>
        
        {testResult && (
          <div className="mt-3 p-3 bg-muted rounded-md border border-border">
            <h4 className="text-sm font-medium mb-1">Test Response:</h4>
            <pre className="text-xs overflow-auto max-h-[200px] bg-background p-2 rounded border">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebhookSettings;
