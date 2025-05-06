
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Webhook } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface WebhookSettingsProps {
  userId: string | null;
}

const WebhookSettings: React.FC<WebhookSettingsProps> = ({ userId }) => {
  const [webhookUrl, setWebhookUrl] = useState<string>('http://n8n.cozyapp.uno:5678/webhook-test/36e520c4-f7a4-4872-8e21-e469701eb68e');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchWebhookUrl = async () => {
      if (!userId) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("webhook_url")
          .eq("id", userId)
          .single();
          
        if (error) throw error;
        
        if (data && data.webhook_url) {
          setWebhookUrl(data.webhook_url);
        }
      } catch (err) {
        console.error("Error fetching webhook URL:", err);
      }
    };
    
    fetchWebhookUrl();
  }, [userId]);

  const handleSaveWebhook = async () => {
    if (!userId) {
      toast.error("Please sign in to save webhook URL");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ webhook_url: webhookUrl })
        .eq("id", userId);
        
      if (error) throw error;
      
      toast.success("Webhook URL saved successfully");
    } catch (err: any) {
      console.error("Error saving webhook URL:", err);
      toast.error(err.message || "Failed to save webhook URL");
    } finally {
      setIsSaving(false);
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
    </div>
  );
};

export default WebhookSettings;
