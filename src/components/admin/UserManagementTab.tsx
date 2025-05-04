
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Mail, KeyRound, Trash2, Ban, Download } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import UserActions from "./UserActions";

interface Profile {
  id: string;
  display_name: string;
  email?: string;
  is_admin?: boolean;
  webhook_limit?: number;
  is_suspended?: boolean;
  created_at?: string;
  preferred_unit?: string;
  timezone?: string;
  updated_at?: string;
  webhook_count?: number;
  webhook_url?: string;
  last_webhook_date?: string;
}

interface UserManagementTabProps {
  profiles: Profile[];
  fetchProfiles: () => Promise<void>;
}

const UserManagementTab: React.FC<UserManagementTabProps> = ({ profiles, fetchProfiles }) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const toggleAdminStatus = async (profile: Profile) => {
    try {
      const newStatus = !profile.is_admin;
      
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: newStatus })
        .eq("id", profile.id);
      
      if (error) throw error;
      
      await fetchProfiles();
      
      toast.success(`${profile.display_name} is now ${newStatus ? "an admin" : "a regular user"}`);
    } catch (error) {
      console.error("Error updating admin status:", error);
      toast.error("Failed to update user privileges");
    }
  };

  const updateWebhookLimit = async (profile: Profile, limit: number) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ webhook_limit: limit })
        .eq("id", profile.id);
      
      if (error) throw error;
      
      await fetchProfiles();
      
      toast.success(`Updated webhook limit for ${profile.display_name}`);
    } catch (error) {
      console.error("Error updating webhook limit:", error);
      toast.error("Failed to update webhook limit");
    }
  };

  const sendPasswordReset = async (userId: string) => {
    try {
      setIsSendingReset(true);
      
      const user = profiles.find(p => p.id === userId);
      if (!user?.email) {
        throw new Error("User email not found");
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/account`
      });
      
      if (error) throw error;
      
      toast.success(`Password reset email sent to ${user.email}`);
    } catch (error) {
      console.error("Error sending password reset:", error);
      toast.error("Failed to send password reset email");
    } finally {
      setIsSendingReset(false);
    }
  };

  const sendEmail = async (userId: string, subject: string, content: string) => {
    try {
      setIsSendingEmail(true);
      
      const user = profiles.find(p => p.id === userId);
      if (!user?.email) {
        throw new Error("User email not found");
      }
      
      // In production, we would call an Edge Function here to send the email
      console.log(`Sending email to ${user.email} with subject: ${subject}`);
      console.log(`Email content: ${content}`);
      
      // For demo purposes, just show a success message
      toast.success(`Email sent to ${user.email}`);
      
      setEmailSubject("");
      setEmailContent("");
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const exportUserData = () => {
    try {
      const csvContent = [
        // Header row
        ["ID", "Name", "Email", "Admin", "Unit", "Timezone", "Created At", "Updated At", "Webhook Limit", "Webhook Count", "Last Webhook Date", "Status"].join(","),
        // Data rows
        ...profiles.map(p => [
          p.id,
          p.display_name,
          p.email || "",
          p.is_admin ? "Yes" : "No",
          p.preferred_unit || "",
          p.timezone || "",
          p.created_at || "",
          p.updated_at || "",
          p.webhook_limit || 0,
          p.webhook_count || 0,
          p.last_webhook_date || "",
          p.is_suspended ? "Suspended" : "Active"
        ].join(","))
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv" });
      const href = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = href;
      link.download = `users-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      
      toast.success("User data exported successfully");
    } catch (error) {
      console.error("Error exporting user data:", error);
      toast.error("Failed to export user data");
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            <span>User Management</span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={exportUserData}
          >
            <Download className="h-4 w-4 mr-1" />
            Export User Details
          </Button>
        </CardTitle>
        <CardDescription>
          Manage user accounts, permissions, and access controls.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Admin</th>
                <th className="px-4 py-3 text-left">AI Limit</th>
                <th className="px-4 py-3 text-left">Last Request</th>
                <th className="px-4 py-3 text-left">API Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id} className="border-b">
                  <td className="px-4 py-3 flex items-center">
                    <User className="h-5 w-5 mr-2 text-muted-foreground" />
                    {profile.display_name}
                    {profile.created_at && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {profile.email}
                  </td>
                  <td className="px-4 py-3">
                    <Checkbox 
                      checked={!!profile.is_admin} 
                      onCheckedChange={() => toggleAdminStatus(profile)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input 
                      type="number" 
                      min="0" 
                      max="100" 
                      className="w-24" 
                      value={profile.webhook_limit || 0} 
                      onChange={(e) => updateWebhookLimit(profile, parseInt(e.target.value))}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {profile.last_webhook_date ? 
                      new Date(profile.last_webhook_date).toLocaleString() : 
                      "Never"
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      {profile.webhook_count && profile.webhook_limit ? (
                        profile.webhook_count >= profile.webhook_limit ? (
                          <span className="text-red-500">exceeded</span>
                        ) : (
                          <span className="text-green-500">within_limit</span>
                        )
                      ) : (
                        <span className="text-yellow-500">not_used</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <UserActions 
                      profile={profile}
                      onSendEmail={(userId) => {
                        setSelectedUserId(userId);
                      }}
                      onSendPasswordReset={sendPasswordReset}
                      fetchProfiles={fetchProfiles}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Email Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <span style={{ display: 'none' }}>Send Email</span>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Email</DialogTitle>
              <DialogDescription>
                Send a notification email to the user.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="subject">Subject</label>
                <Input
                  id="subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="content">Message</label>
                <Textarea
                  id="content"
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  placeholder="Write your message here..."
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setEmailSubject("");
                  setEmailContent("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedUserId && sendEmail(selectedUserId, emailSubject, emailContent)}
                disabled={isSendingEmail || !emailSubject || !emailContent}
              >
                {isSendingEmail ? "Sending..." : "Send Email"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default UserManagementTab;
