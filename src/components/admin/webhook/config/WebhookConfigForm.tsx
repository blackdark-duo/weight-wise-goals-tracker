
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { WebhookFields } from "@/types/webhook";

interface WebhookConfigFormProps {
  url: string;
  days: number;
  isSaving: boolean;
  onUrlChange: (url: string) => void;
  onDaysChange: (days: number) => void;
  onSave: () => void;
}

export const WebhookConfigForm: React.FC<WebhookConfigFormProps> = ({
  url,
  days,
  isSaving,
  onUrlChange,
  onDaysChange,
  onSave,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="webhook-url">Global Webhook URL</Label>
        <Input
          id="webhook-url"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
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
          value={days}
          onChange={(e) => onDaysChange(parseInt(e.target.value) || 30)}
        />
        <p className="text-xs text-muted-foreground">
          Number of days of historical data to include in webhook requests
        </p>
      </div>
      
      <Button 
        onClick={onSave} 
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
    </div>
  );
};
