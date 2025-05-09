
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Webhook } from "lucide-react";
import { WebhookConfigForm } from "./WebhookConfigForm";
import { WebhookFieldsSelector } from "./WebhookFieldsSelector";
import { WebhookFields } from "@/types/webhook";

interface WebhookConfigCardProps {
  url: string;
  days: number;
  fields: WebhookFields;
  isSaving: boolean;
  onUrlChange: (url: string) => void;
  onDaysChange: (days: number) => void;
  onFieldChange: (field: keyof WebhookFields, value: boolean) => void;
  onSave: () => void;
}

export const WebhookConfigCard: React.FC<WebhookConfigCardProps> = ({
  url,
  days,
  fields,
  isSaving,
  onUrlChange,
  onDaysChange,
  onFieldChange,
  onSave,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Global Webhook Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <WebhookConfigForm
          url={url}
          days={days}
          isSaving={isSaving}
          onUrlChange={onUrlChange}
          onDaysChange={onDaysChange}
          onSave={onSave}
        />
        
        <WebhookFieldsSelector 
          fields={fields}
          onFieldChange={onFieldChange}
        />
      </CardContent>
    </Card>
  );
};
