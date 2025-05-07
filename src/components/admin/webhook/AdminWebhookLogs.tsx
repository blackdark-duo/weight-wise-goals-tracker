
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { History, RefreshCw } from "lucide-react";
import { WebhookLog } from "@/types/webhook";
import WebhookLogViewer from "./WebhookLogViewer";
import WebhookLogList from "./WebhookLogList";

const AdminWebhookLogs: React.FC = () => {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'request' | 'response'>('request');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Get user details for each log
      const logsWithUserDetails = await Promise.all(
        (data || []).map(async (log) => {
          try {
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('email, display_name')
              .eq('id', log.user_id)
              .single();

            if (userError) throw userError;

            return {
              ...log,
              user_email: userData?.email || 'Unknown Email',
              user_display_name: userData?.display_name || 'Unknown User'
            };
          } catch (error) {
            console.error(`Error fetching user details for log ${log.id}:`, error);
            return {
              ...log,
              user_email: 'Unknown Email',
              user_display_name: 'Unknown User'
            };
          }
        })
      );

      setLogs(logsWithUserDetails);
    } catch (error) {
      console.error("Error fetching webhook logs:", error);
      toast.error("Failed to load webhook logs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenRequestDialog = (log: WebhookLog) => {
    setSelectedLog(log);
    setDialogType('request');
    setIsDialogOpen(true);
  };

  const handleOpenResponseDialog = (log: WebhookLog) => {
    setSelectedLog(log);
    setDialogType('response');
    setIsDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'outline';
      case 'error':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <History className="h-5 w-5" />
          Webhook Logs
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <WebhookLogList 
            logs={logs} 
            onViewRequest={handleOpenRequestDialog}
            onViewResponse={handleOpenResponseDialog}
            getStatusBadgeVariant={getStatusBadgeVariant}
          />
        )}

        <WebhookLogViewer
          selectedLog={selectedLog}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          dialogType={dialogType}
        />
      </CardContent>
    </Card>
  );
};

export default AdminWebhookLogs;
