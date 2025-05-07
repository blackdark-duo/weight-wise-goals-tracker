
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { History, User, RefreshCw, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Profile {
  id: string;
  email: string;
  display_name: string | null;
}

interface WebhookLog {
  id: string;
  user_id: string;
  request_payload: any;
  response_payload: any;
  status: string;
  url: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

const AdminWebhookLogs = () => {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLogDetails, setShowLogDetails] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [viewMode, setViewMode] = useState<'request' | 'response'>('request');

  useEffect(() => {
    fetchUsers();
  }, []);
  
  useEffect(() => {
    fetchLogs();
  }, [selectedUserId]);

  const fetchUsers = async () => {
    try {
      // Fetch auth users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;
      
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name');
      if (profilesError) throw profilesError;
      
      // Combine data
      const combinedUsers = authUsers.users.map(user => {
        const profile = profiles?.find(p => p.id === user.id);
        return {
          id: user.id,
          email: user.email || "",
          display_name: profile?.display_name || user.email?.split('@')[0] || "Unknown"
        };
      });
      
      setUsers(combinedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    }
  };

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (selectedUserId) {
        query = query.eq('user_id', selectedUserId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Enrich logs with user information
      const enrichedLogs = await Promise.all((data || []).map(async (log) => {
        const user = users.find(u => u.id === log.user_id);
        return {
          ...log,
          user_email: user?.email || "Unknown",
          user_name: user?.display_name || "Unknown"
        };
      }));
      
      setLogs(enrichedLogs);
    } catch (error) {
      console.error("Error fetching webhook logs:", error);
      toast.error("Failed to load webhook logs");
    } finally {
      setIsLoading(false);
    }
  };

  const viewLogDetails = (log: WebhookLog) => {
    setSelectedLog(log);
    setViewMode('request');
    setShowLogDetails(true);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'destructive';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Webhook Logs
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select
            value={selectedUserId}
            onValueChange={setSelectedUserId}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Users</SelectItem>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.display_name} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={fetchLogs}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No webhook logs found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {formatDateTime(log.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{log.user_name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{log.user_email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(log.status)}>
                        {log.status || 'unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs truncate max-w-[200px]" title={log.url}>
                        {log.url}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewLogDetails(log)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Log Details Modal */}
        {selectedLog && (
          <Dialog open={showLogDetails} onOpenChange={setShowLogDetails}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Webhook Log Details</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-sm font-medium">User: </span>
                    <span className="text-sm">{selectedLog.user_name} ({selectedLog.user_email})</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Time: </span>
                    <span className="text-sm">{formatDateTime(selectedLog.created_at)}</span>
                  </div>
                  <Badge variant={getStatusBadgeVariant(selectedLog.status)}>
                    {selectedLog.status || 'unknown'}
                  </Badge>
                </div>

                <div className="flex gap-2 mb-2">
                  <Button
                    variant={viewMode === 'request' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('request')}
                  >
                    Request
                  </Button>
                  <Button
                    variant={viewMode === 'response' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('response')}
                  >
                    Response
                  </Button>
                </div>

                {viewMode === 'request' ? (
                  <div className="bg-muted rounded-md p-4 overflow-auto max-h-[400px]">
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.request_payload, null, 2)}
                    </pre>
                  </div>
                ) : (
                  selectedLog.response_payload ? (
                    <div className="space-y-2">
                      <div className="bg-muted rounded-md p-4 overflow-auto max-h-[400px]">
                        {typeof selectedLog.response_payload === 'string' ? (
                          <iframe
                            srcDoc={selectedLog.response_payload}
                            className="w-full h-[350px] border-0"
                            title="Webhook Response"
                          />
                        ) : (
                          <pre className="text-xs whitespace-pre-wrap">
                            {JSON.stringify(selectedLog.response_payload, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No response data available
                    </div>
                  )
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminWebhookLogs;
