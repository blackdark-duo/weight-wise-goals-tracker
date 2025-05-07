
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { User } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useUserManagement } from "@/hooks/useUserManagement";
import { updateUserWebhookUrl } from "@/services/webhookService";
import { Profile } from "@/types/webhook";

import UserActions from "./UserActions";
import EmailDialog from "./EmailDialog";
import WebhookUrlDialog from "./WebhookUrlDialog";

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
                <UserActions 
                  profile={profile}
                  onEditWebhookUrl={handleEditWebhookUrl}
                  onSendEmail={handleSendEmail}
                  onSendPasswordReset={handleSendPasswordReset}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EmailDialog
        isOpen={isEmailDialogOpen}
        setIsOpen={setIsEmailDialogOpen}
        selectedProfile={selectedProfile}
        emailSubject={emailSubject}
        setEmailSubject={setEmailSubject}
        emailContent={emailContent}
        setEmailContent={setEmailContent}
        isSendingEmail={isSendingEmail}
        onSendEmail={sendEmail}
      />

      <WebhookUrlDialog
        isOpen={isWebhookDialogOpen}
        setIsOpen={setIsWebhookDialogOpen}
        selectedProfile={selectedProfile}
        webhookUrl={webhookUrl}
        setWebhookUrl={setWebhookUrl}
        isSaving={isSaving}
        onSave={saveWebhookUrl}
      />
    </div>
  );
};

export default UserTable;
