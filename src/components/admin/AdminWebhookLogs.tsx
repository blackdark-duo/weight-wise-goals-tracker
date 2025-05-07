import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { History, RefreshCw, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WebhookLog {
  id: string;
  created_at: string;
  user_id: string;
  request_payload: any;
  response_payload: any;
  status: string;
  url: string;
  user_email?: string;
  user_display_name?: string;
}

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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return dateString;
    }
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No webhook logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{log.user_display_name}</div>
                        <div className="text-xs text-muted-foreground">{log.user_email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(log.status || '')}>
                          {log.status || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        <a
                          href={log.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {log.url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenRequestDialog(log)}
                          >
                            Request
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenResponseDialog(log)}
                            disabled={!log.response_payload}
                          >
                            Response
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Dialog for viewing request/response payloads */}
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
      </CardContent>
    </Card>
  );
};

export default AdminWebhookLogs;
