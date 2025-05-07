
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ExternalLink } from "lucide-react";
import { WebhookLog } from "@/types/webhook";

interface WebhookLogListProps {
  logs: WebhookLog[];
  onViewRequest: (log: WebhookLog) => void;
  onViewResponse: (log: WebhookLog) => void;
  getStatusBadgeVariant: (status: string) => "default" | "destructive" | "outline" | "secondary";
}

const WebhookLogList: React.FC<WebhookLogListProps> = ({
  logs,
  onViewRequest,
  onViewResponse,
  getStatusBadgeVariant
}) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  return (
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
                      onClick={() => onViewRequest(log)}
                    >
                      Request
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewResponse(log)}
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
  );
};

export default WebhookLogList;
