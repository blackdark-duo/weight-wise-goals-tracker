import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WebhookTestButton } from '../atoms/WebhookTestButton';
import { WebhookIcon } from '../atoms/WebhookIcon';
import { useWebhookTest } from '../hooks/useWebhookTest';

interface WebhookTestPanelProps {
  webhookUrl: string;
  testPayload?: any;
  onTestComplete?: (result: any) => void;
}

export const WebhookTestPanel: React.FC<WebhookTestPanelProps> = ({
  webhookUrl,
  testPayload,
  onTestComplete
}) => {
  const { 
    testWebhookUrl, 
    isTestInProgress, 
    testResult, 
    resetTestResult 
  } = useWebhookTest({ onTestComplete });

  const handleTest = () => {
    testWebhookUrl(webhookUrl, testPayload);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <WebhookIcon size={20} />
          Webhook Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <WebhookTestButton
            onTest={handleTest}
            isLoading={isTestInProgress}
            disabled={!webhookUrl}
          />
          {testResult && (
            <button
              onClick={resetTestResult}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear Result
            </button>
          )}
        </div>
        
        {testResult && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Test Response:</h4>
            <ScrollArea className="h-[200px] w-full rounded border bg-muted/30 p-3">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};