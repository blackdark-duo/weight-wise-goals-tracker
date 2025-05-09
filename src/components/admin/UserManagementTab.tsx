
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Download, RefreshCw } from "lucide-react";
import { Profile } from "@/hooks/useAdminProfiles";
import UserTable from "./UserTable";
import { useUserManagement } from "@/hooks/useUserManagement";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface UserManagementTabProps {
  profiles: Profile[];
  fetchProfiles: () => Promise<void>;
  toggleAdminStatus: (profile: Profile) => Promise<void>;
  updateWebhookLimit: (profile: Profile, limit: number) => Promise<void>;
  toggleAIInsightsVisibility: (profile: Profile) => Promise<void>;
  onRefreshUsers?: () => Promise<void>;
}

const UserManagementTab: React.FC<UserManagementTabProps> = ({ 
  profiles, 
  fetchProfiles, 
  toggleAdminStatus, 
  updateWebhookLimit,
  toggleAIInsightsVisibility,
  onRefreshUsers
}) => {
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isLoadingRefresh, setIsLoadingRefresh] = useState(false);
  
  const {
    selectedUserId,
    setSelectedUserId,
    emailSubject,
    setEmailSubject,
    emailContent,
    setEmailContent,
    isSendingEmail,
    sendPasswordReset,
    sendEmail,
    exportUserData,
  } = useUserManagement(profiles, fetchProfiles);

  const handleSendEmail = (userId: string) => {
    setSelectedUserId(userId);
    setIsEmailDialogOpen(true);
  };

  const handleRefreshUsers = async () => {
    setIsLoadingRefresh(true);
    try {
      await fetchProfiles();
      if (onRefreshUsers) {
        await onRefreshUsers();
      }
    } finally {
      setIsLoadingRefresh(false);
    }
  };

  return (
    <CardContent>
      <CardHeader className="pb-3 px-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            <span>User Management</span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefreshUsers}
              disabled={isLoadingRefresh}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoadingRefresh ? 'animate-spin' : ''}`} />
              Fetch All Users
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={exportUserData}
            >
              <Download className="h-4 w-4 mr-1" />
              Export User Details
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Manage user accounts, permissions, and access controls.
        </CardDescription>
      </CardHeader>

      <UserTable 
        profiles={profiles}
        fetchProfiles={fetchProfiles}
        toggleAdminStatus={toggleAdminStatus}
        updateWebhookLimit={updateWebhookLimit}
        toggleAIInsightsVisibility={toggleAIInsightsVisibility}
      />

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
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
    </CardContent>
  );
};

export default UserManagementTab;
