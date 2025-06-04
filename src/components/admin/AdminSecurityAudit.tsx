import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SecurityIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  resolved: boolean;
}

interface AdminSecurityAuditProps {
  currentUserId: string | null;
}

const AdminSecurityAudit: React.FC<AdminSecurityAuditProps> = ({ currentUserId }) => {
  const [issues, setIssues] = useState<SecurityIssue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);

  const runSecurityScan = async () => {
    if (!currentUserId) return;
    
    setIsLoading(true);
    const foundIssues: SecurityIssue[] = [];

    try {
      // Check for weak webhook URLs
      const { data: webhookConfig } = await supabase
        .from('webhook_config')
        .select('url')
        .single();

      if (webhookConfig?.url?.includes('localhost') || webhookConfig?.url?.includes('127.0.0.1')) {
        foundIssues.push({
          id: 'weak-webhook-url',
          severity: 'medium',
          category: 'Configuration',
          title: 'Webhook URL uses localhost',
          description: 'The webhook URL is configured to use localhost, which may not be accessible in production.',
          resolved: false
        });
      }

      // Check for excessive admin privileges
      const { data: adminUsers } = await supabase
        .from('profiles')
        .select('id, is_admin')
        .eq('is_admin', true);

      if (adminUsers && adminUsers.length > 5) {
        foundIssues.push({
          id: 'excessive-admins',
          severity: 'medium',
          category: 'Access Control',
          title: 'Excessive admin users',
          description: `${adminUsers.length} users have admin privileges. Consider reducing admin access.`,
          resolved: false
        });
      }

      // Check for rate limiting configuration
      const { data: rateLimits } = await supabase
        .from('webhook_rate_limits')
        .select('user_id')
        .limit(1);

      if (!rateLimits || rateLimits.length === 0) {
        foundIssues.push({
          id: 'no-rate-limits',
          severity: 'high',
          category: 'Security',
          title: 'No rate limiting detected',
          description: 'No rate limiting records found. Users may be able to abuse webhook endpoints.',
          resolved: false
        });
      }

      // Check for users with webhook limits
      const { data: usersWithoutLimits } = await supabase
        .from('profiles')
        .select('id')
        .is('webhook_limit', null);

      if (usersWithoutLimits && usersWithoutLimits.length > 0) {
        foundIssues.push({
          id: 'users-no-webhook-limits',
          severity: 'medium',
          category: 'Resource Management',
          title: 'Users without webhook limits',
          description: `${usersWithoutLimits.length} users don't have webhook limits configured.`,
          resolved: false
        });
      }

      setIssues(foundIssues);
      setLastScan(new Date());
      
      if (foundIssues.length === 0) {
        toast.success('Security scan completed - no issues found');
      } else {
        toast.warning(`Security scan found ${foundIssues.length} issue(s)`);
      }

    } catch (error) {
      console.error('Error running security scan:', error);
      toast.error('Failed to complete security scan');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': 
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Shield className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    runSecurityScan();
  }, [currentUserId]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Audit
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={runSecurityScan}
          disabled={isLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Scanning...' : 'Run Scan'}
        </Button>
      </CardHeader>
      <CardContent>
        {lastScan && (
          <p className="text-sm text-muted-foreground mb-4">
            Last scan: {lastScan.toLocaleString()}
          </p>
        )}

        {issues.length === 0 && !isLoading ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              No security issues detected. Your system appears to be secure.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="p-4 border rounded-lg bg-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getSeverityColor(issue.severity)}>
                        {getSeverityIcon(issue.severity)}
                        {issue.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{issue.category}</Badge>
                    </div>
                    <h4 className="font-medium mb-1">{issue.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {issue.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminSecurityAudit;