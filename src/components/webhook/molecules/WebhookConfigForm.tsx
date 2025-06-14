import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { WebhookUrlInput } from '../atoms/WebhookUrlInput';
import { WebhookIcon } from '../atoms/WebhookIcon';
import { WebhookConfig } from '@/services/webhookService';

interface WebhookConfigFormProps {
  config: WebhookConfig;
  onConfigChange: (field: keyof WebhookConfig, value: any) => void;
  onSave: () => void;
  isSaving?: boolean;
  showAdvanced?: boolean;
}

export const WebhookConfigForm: React.FC<WebhookConfigFormProps> = ({
  config,
  onConfigChange,
  onSave,
  isSaving = false,
  showAdvanced = false
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WebhookIcon size={20} />
          Webhook Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <WebhookUrlInput
          value={config.url}
          onChange={(value) => onConfigChange('url', value)}
          description="This URL will receive webhook requests"
        />
        
        <div className="space-y-2">
          <Label htmlFor="days">Days of Historical Data</Label>
          <Input
            id="days"
            type="number"
            min="1"
            max="365"
            value={config.days}
            onChange={(e) => onConfigChange('days', parseInt(e.target.value))}
          />
          <p className="text-sm text-muted-foreground">
            Number of days of data to include in webhook payload
          </p>
        </div>
        
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium">Advanced Settings</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="includeAccount">Include Account Fields</Label>
                <input
                  id="includeAccount"
                  type="checkbox"
                  checked={config.include_account_fields}
                  onChange={(e) => onConfigChange('include_account_fields', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="includeUser">Include User Fields</Label>
                <input
                  id="includeUser"
                  type="checkbox"
                  checked={config.include_user_fields}
                  onChange={(e) => onConfigChange('include_user_fields', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
            </div>
          </div>
        )}
        
        <Button 
          onClick={onSave}
          disabled={isSaving}
          className="w-full"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </CardContent>
    </Card>
  );
};