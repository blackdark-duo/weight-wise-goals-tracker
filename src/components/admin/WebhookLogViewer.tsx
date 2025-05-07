
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileText, Download, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface WebhookLog {
  id: string;
  created_at: string;
  url: string;
  request_payload: any;
  response_payload: any;
  status: string;
  user_id: string;
}

const WebhookLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmailMap, setUserEmailMap] = useState<Record<string, string>>({});

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("webhook_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setLogs(data || []);
      
      // Get user emails
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(log => log.user_id))];
        
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("id, email, display_name")
          .in("id", userIds);
          
        if (!profileError && profiles) {
          const emailMap: Record<string, string> = {};
          profiles.forEach(profile => {
            emailMap[profile.id] = profile.email || profile.display_name || profile.id.substring(0, 8);
          });
          
          setUserEmailMap(emailMap);
        }
      }
    } catch (error) {
      console.error("Error fetching webhook logs:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLogs();
  }, []);
  
  const exportLogs = () => {
    try {
      const jsonString = JSON.stringify(logs, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const href = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = href;
      link.download = `webhook-logs-${format(new Date(), "yyyy-MM-dd")}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    } catch (error) {
      console.error("Error exporting logs:", error);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>Webhook Logs</span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchLogs}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={exportLogs}
              disabled={logs.length === 0}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          View recent webhook call logs and responses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-3">Loading logs...</span>
          </div>
        ) : logs.length > 0 ? (
          <ScrollArea className="h-[500px] pr-4">
            <Accordion type="single" collapsible className="w-full">
              {logs.map((log) => (
                <AccordionItem value={log.id} key={log.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center">
                        <Badge 
                          variant={log.status === "success" ? "default" : "destructive"}
                          className="mr-2"
                        >
                          {log.status || "pending"}
                        </Badge>
                        <span className="text-sm font-medium">
                          {format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {userEmailMap[log.user_id] || log.user_id.substring(0, 8)}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="bg-muted/30 rounded-md p-3 space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Request:</h4>
                        <pre className="bg-background p-2 rounded text-xs overflow-auto max-h-[200px]">
                          {JSON.stringify(log.request_payload, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Response:</h4>
                        <pre className="bg-background p-2 rounded text-xs overflow-auto max-h-[200px]">
                          {log.response_payload ? JSON.stringify(log.response_payload, null, 2) : "No response data"}
                        </pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No webhook logs found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WebhookLogViewer;
