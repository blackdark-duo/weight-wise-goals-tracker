
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";
import { WebhookLog } from "@/types/webhook";

interface WebhookLogViewerProps {
  selectedLog: WebhookLog | null;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  dialogType: 'request' | 'response';
}

const WebhookLogViewer: React.FC<WebhookLogViewerProps> = ({
  selectedLog,
  isDialogOpen,
  setIsDialogOpen,
  dialogType
}) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {dialogType === 'request' ? 'Request Payload' : 'Response Payload'}
          </DialogTitle>
          <DialogDescription>
            {dialogType === 'request'
              ? `Webhook request sent at ${selectedLog?.created_at ? formatDate(selectedLog.created_at) : ''}`
              : `Webhook response received from ${selectedLog?.url}`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          {dialogType === 'request' && selectedLog?.request_payload ? (
            <div className="bg-muted p-4 rounded-md overflow-x-auto">
              <pre className="text-sm">{JSON.stringify(selectedLog.request_payload, null, 2)}</pre>
            </div>
          ) : dialogType === 'response' && selectedLog?.response_payload ? (
            typeof selectedLog.response_payload === 'string' && 
            selectedLog.response_payload.trim().startsWith('<') ? (
              <div className="bg-white border rounded-md h-[400px]">
                <iframe
                  srcDoc={selectedLog.response_payload}
                  className="w-full h-full border-0"
                  title="HTML Response"
                  sandbox="allow-scripts"
                />
              </div>
            ) : (
              <div className="bg-muted p-4 rounded-md overflow-x-auto">
                <pre className="text-sm">
                  {typeof selectedLog.response_payload === 'object' 
                    ? JSON.stringify(selectedLog.response_payload, null, 2) 
                    : selectedLog.response_payload}
                </pre>
              </div>
            )
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No {dialogType} data available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WebhookLogViewer;
