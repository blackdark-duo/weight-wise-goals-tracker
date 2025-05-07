
import React, { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Pencil, Calendar, Key, Mail } from "lucide-react";
import { Profile } from "@/hooks/useAdminProfiles";

interface AdminUserTableProps {
  onSendEmail?: (userId: string) => void;
  onSendPasswordReset?: (userId: string, email: string) => void;
}

const AdminUserTable: React.FC<AdminUserTableProps> = ({ onSendEmail, onSendPasswordReset }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isWebhookLimitDialogOpen, setIsWebhookLimitDialogOpen] = useState(false);
  const [newWebhookLimit, setNewWebhookLimit] = useState(5);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      
      // Fetch auth users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;
      
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      if (profilesError) throw profilesError;
      
      // Combine data
      const combinedData = authUsers.users.map(authUser => {
        const profile = profilesData?.find(p => p.id === authUser.id) || {};
        return {
          id: authUser.id,
          email: authUser.email,
          display_name: (profile as any).display_name || authUser.email?.split('@')[0] || 'Unknown',
          is_admin: (profile as any).is_admin || false,
          created_at: authUser.created_at,
          webhook_limit: (profile as any).webhook_limit || 5,
          webhook_count: (profile as any).webhook_count || 0,
          last_webhook_date: (profile as any).last_webhook_date || null,
          webhook_url: (profile as any).webhook_url || null,
          show_ai_insights: (profile as any).show_ai_insights !== false, // default to true
          is_suspended: (profile as any).is_suspended || false,
          preferred_unit: (profile as any).preferred_unit || 'kg',
          timezone: (profile as any).timezone || 'UTC',
          updated_at: (profile as any).updated_at || null,
          scheduled_for_deletion: (profile as any).scheduled_for_deletion || false,
          deletion_date: (profile as any).deletion_date || null
        };
      });
      
      setProfiles(combinedData);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast.error("Failed to load user profiles");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAdminStatus = async (profile: Profile) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !profile.is_admin })
        .eq('id', profile.id);
      
      if (error) throw error;
      
      // Update local state
      setProfiles(profiles.map(p => 
        p.id === profile.id ? { ...p, is_admin: !p.is_admin } : p
      ));
      
      toast.success(`Admin status ${profile.is_admin ? 'removed from' : 'granted to'} ${profile.display_name || profile.email}`);
    } catch (error) {
      console.error("Error toggling admin status:", error);
      toast.error("Failed to update admin status");
    }
  };

  const openWebhookLimitDialog = (profile: Profile) => {
    setSelectedUser(profile);
    setNewWebhookLimit(profile.webhook_limit || 5);
    setIsWebhookLimitDialogOpen(true);
  };

  const updateWebhookLimit = async () => {
    if (!selectedUser) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ webhook_limit: newWebhookLimit })
        .eq('id', selectedUser.id);
      
      if (error) throw error;
      
      // Update local state
      setProfiles(profiles.map(p => 
        p.id === selectedUser.id ? { ...p, webhook_limit: newWebhookLimit } : p
      ));
      
      toast.success(`Webhook limit updated for ${selectedUser.display_name || selectedUser.email}`);
      setIsWebhookLimitDialogOpen(false);
    } catch (error) {
      console.error("Error updating webhook limit:", error);
      toast.error("Failed to update webhook limit");
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast.success(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error("Error sending password reset:", error);
      toast.error("Failed to send password reset email");
    }
  };

  const handleSendEmail = (userId: string) => {
    if (onSendEmail) {
      onSendEmail(userId);
    } else {
      // Default behavior if no prop provided
      const user = profiles.find(p => p.id === userId);
      if (user && user.email) {
        toast.info(`Would send email to ${user.email}`);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Management
        </CardTitle>
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
                  <TableHead>User</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Webhook Limit</TableHead>
                  <TableHead>Webhook Usage</TableHead>
                  <TableHead>Last Request</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="font-medium">{profile.display_name}</div>
                      <div className="text-xs text-muted-foreground">{profile.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">
                          {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Checkbox 
                        checked={profile.is_admin || false}
                        onCheckedChange={() => toggleAdminStatus(profile)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openWebhookLimitDialog(profile)}
                        className="flex items-center gap-1"
                      >
                        {profile.webhook_limit || 5}
                        <Pencil className="h-3 w-3 ml-1" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge variant={(profile.webhook_count || 0) >= (profile.webhook_limit || 5) ? "destructive" : "outline"}>
                        {profile.webhook_count || 0} / {profile.webhook_limit || 5}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {profile.last_webhook_date ? (
                        <div className="text-xs">
                          {new Date(profile.last_webhook_date).toLocaleString()}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => sendPasswordResetEmail(profile.email || '')}
                        >
                          <Key className="h-3 w-3 mr-1" />
                          Reset
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendEmail(profile.id)}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Webhook Limit Dialog */}
        <Dialog open={isWebhookLimitDialogOpen} onOpenChange={setIsWebhookLimitDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Webhook Limit</DialogTitle>
              <DialogDescription>
                Set the maximum number of webhook requests per day for{" "}
                {selectedUser?.display_name || selectedUser?.email}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label className="text-sm font-medium" htmlFor="webhook-limit">
                Webhook Limit
              </label>
              <Input
                id="webhook-limit"
                type="number"
                min="0"
                value={newWebhookLimit}
                onChange={(e) => setNewWebhookLimit(parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsWebhookLimitDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updateWebhookLimit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminUserTable;
