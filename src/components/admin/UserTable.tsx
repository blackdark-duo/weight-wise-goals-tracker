
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { User, Edit, Trash2, MoreHorizontal, Mail, Key, X } from "lucide-react";
import { Profile } from "@/hooks/useAdminProfiles";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useUserManagement } from "@/hooks/useUserManagement";
import { updateUserWebhookUrl } from "@/services/webhookService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface UserTableProps {
  profiles: Profile[];
  fetchProfiles: () => Promise<void>;
  toggleAdminStatus: (profile: Profile) => Promise<void>;
  updateWebhookLimit: (profile: Profile, limit: number) => Promise<void>;
  updateWebhookUrl?: (profile: Profile, url: string) => Promise<void>;
  toggleAIInsightsVisibility: (profile: Profile) => Promise<void>;
  onSendEmail?: (userId: string) => void;
  onSendPasswordReset?: (userId: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  profiles,
  fetchProfiles,
  toggleAdminStatus,
  updateWebhookLimit,
  updateWebhookUrl,
  toggleAIInsightsVisibility,
  onSendEmail,
  onSendPasswordReset
}) => {
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const {
    emailSubject,
    setEmailSubject,
    emailContent,
    setEmailContent,
    isSendingEmail,
    sendPasswordReset,
    sendEmail,
  } = useUserManagement(profiles, fetchProfiles);

  const handleSendEmail = (profile: Profile) => {
    setSelectedProfile(profile);
    if (onSendEmail) {
      onSendEmail(profile.id);
    } else {
      setIsEmailDialogOpen(true);
    }
  };

  const handleSendPasswordReset = (profile: Profile) => {
    if (!profile.id) return;
    
    if (onSendPasswordReset) {
      onSendPasswordReset(profile.id);
    } else {
      sendPasswordReset(profile.id);
    }
  };

  const handleEditWebhookUrl = (profile: Profile) => {
    setSelectedProfile(profile);
    setWebhookUrl(profile.webhook_url || "");
    setIsWebhookDialogOpen(true);
  };

  const saveWebhookUrl = async () => {
    if (!selectedProfile) return;
    
    setIsSaving(true);
    try {
      if (updateWebhookUrl) {
        await updateWebhookUrl(selectedProfile, webhookUrl);
      } else {
        // Fallback to the service function
        await updateUserWebhookUrl(selectedProfile.id, webhookUrl);
        await fetchProfiles();
      }
      
      toast.success(`Webhook URL updated for ${selectedProfile.display_name || selectedProfile.email}`);
      setIsWebhookDialogOpen(false);
    } catch (error: any) {
      console.error("Error updating webhook URL:", error);
      toast.error("Failed to update webhook URL");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>AI Limit</TableHead>
            <TableHead>Show AI</TableHead>
            <TableHead>Last Request</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => (
            <TableRow key={profile.id}>
              <TableCell className="flex items-center">
                <User className="h-5 w-5 mr-2 text-muted-foreground" />
                {profile.display_name || "No Name"}
                {profile.created_at && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                )}
              </TableCell>
              <TableCell>
                {profile.email || "No Email"}
              </TableCell>
              <TableCell>
                <Checkbox 
                  checked={!!profile.is_admin} 
                  onCheckedChange={() => toggleAdminStatus(profile)}
                />
              </TableCell>
              <TableCell>
                <Input 
                  type="number" 
                  min="0" 
                  max="100" 
                  className="w-24" 
                  value={profile.webhook_limit || 0} 
                  onChange={(e) => updateWebhookLimit(profile, parseInt(e.target.value))}
                />
              </TableCell>
              <TableCell>
                <Switch
                  checked={profile.show_ai_insights !== false}
                  onCheckedChange={() => toggleAIInsightsVisibility(profile)}
                />
              </TableCell>
              <TableCell className="text-sm">
                {profile.last_webhook_date ? 
                  new Date(profile.last_webhook_date).toLocaleString() : 
                  "Never"
                }
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleEditWebhookUrl(profile)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Webhook URL
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSendEmail(profile)}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSendPasswordReset(profile)}>
                      <Key className="h-4 w-4 mr-2" />
                      Reset Password
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
            <DialogDescription>
              Send an email to {selectedProfile?.email || "the user"}.
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
              <textarea
                id="content"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground"
                placeholder="Write your message here..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEmailDialogOpen(false);
                setEmailSubject("");
                setEmailContent("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                sendEmail();
                setIsEmailDialogOpen(false);
              }}
              disabled={isSendingEmail || !emailSubject || !emailContent}
            >
              {isSendingEmail ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Webhook URL Dialog */}
      <Dialog open={isWebhookDialogOpen} onOpenChange={setIsWebhookDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Webhook URL</DialogTitle>
            <DialogDescription>
              Update the webhook URL for {selectedProfile?.display_name || selectedProfile?.email || "this user"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="webhookUrl">Webhook URL</label>
              <Input
                id="webhookUrl"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://example.com/webhook"
              />
              <p className="text-xs text-muted-foreground">
                This webhook URL will be used when the user requests AI insights.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsWebhookDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={saveWebhookUrl}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save URL"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserTable;
