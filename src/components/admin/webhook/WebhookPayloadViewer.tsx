
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { WebhookPayload } from "@/types/webhook";

interface WebhookPayloadViewerProps {
  requestPayload: WebhookPayload | null;
  response: string | null;
}

const WebhookPayloadViewer: React.FC<WebhookPayloadViewerProps> = ({
  requestPayload,
  response
}) => {
  if (!requestPayload && !response) return null;
  
  return (
    <div className="space-y-4 mt-4">
      {requestPayload && (
        <div className="border rounded-md p-4">
          <h3 className="text-sm font-medium mb-2">Request Payload:</h3>
          <pre className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-[200px]">
            {JSON.stringify(requestPayload, null, 2)}
          </pre>
        </div>
      )}
      
      {response && (
        <div className="border rounded-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-medium">Response:</h3>
            <Badge>
              Webhook Response
            </Badge>
          </div>
          <div className="bg-white p-2 rounded-md overflow-auto max-h-[300px] border">
            <iframe
              srcDoc={response}
              className="w-full h-[200px] border-0"
              title="Webhook Response"
              sandbox="allow-scripts"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WebhookPayloadViewer;
