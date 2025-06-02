
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { WebhookFields } from "@/types/webhook";
import { WebhookFieldsSelector } from "./WebhookFieldsSelector";

interface WebhookConfigCardProps {
  url: string;
  days: number;
  fields: WebhookFields;
  defaultWebhookLimit?: number;
  isSaving: boolean;
  onUrlChange: (url: string) => void;
  onDaysChange: (days: number) => void;
  onFieldChange: (field: keyof WebhookFields, value: boolean) => void;
  onDefaultWebhookLimitChange?: (limit: number) => void;
  onSave: () => void;
}

export const WebhookConfigCard: React.FC<WebhookConfigCardProps> = ({
  url,
  days,
  fields,
  defaultWebhookLimit = 10,
  isSaving,
  onUrlChange,
  onDaysChange,
  onFieldChange,
  onDefaultWebhookLimitChange,
  onSave,
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Webhook Configuration</CardTitle>
        <CardDescription>
          Configure the default webhook settings for AI insights
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="webhook-url">Webhook URL</Label>
          <Input
            id="webhook-url"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://example.com/webhook/endpoint"
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            This URL will be used for sending AI insights data
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="days">Days of Historical Data</Label>
          <Input
            id="days"
            type="number"
            min={1}
            value={days}
            onChange={(e) => onDaysChange(parseInt(e.target.value) || 30)}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            Number of days of historical data to include in webhook payloads
          </p>
        </div>

        {onDefaultWebhookLimitChange && (
          <div className="space-y-2">
            <Label htmlFor="defaultWebhookLimit">Default Webhook Limit for New Users</Label>
            <Input
              id="defaultWebhookLimit"
              type="number"
              min={1}
              value={defaultWebhookLimit}
              onChange={(e) => onDefaultWebhookLimitChange(parseInt(e.target.value) || 10)}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Default number of webhook requests allowed per user per day
            </p>
          </div>
        )}

        <WebhookFieldsSelector fields={fields} onFieldChange={onFieldChange} />

        <div className="pt-4">
          <Button 
            onClick={onSave} 
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Saving...
              </>
            ) : (
              "Save Configuration"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
