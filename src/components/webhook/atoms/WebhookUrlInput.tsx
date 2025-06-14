import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WebhookUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const WebhookUrlInput: React.FC<WebhookUrlInputProps> = ({
  value,
  onChange,
  placeholder = "https://your-webhook-url.com/hook",
  label = "Webhook URL",
  description,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="webhookUrl">{label}</Label>
      <Input
        id="webhookUrl"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        type="url"
      />
      {description && (
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
};