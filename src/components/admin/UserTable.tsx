
import React from "react";
import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import UserActions from "./UserActions";
import { Profile } from "@/hooks/useAdminProfiles";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface UserTableProps {
  profiles: Profile[];
  fetchProfiles: () => Promise<void>;
  toggleAdminStatus: (profile: Profile) => Promise<void>;
  updateWebhookLimit: (profile: Profile, limit: number) => Promise<void>;
  toggleAIInsightsVisibility: (profile: Profile) => Promise<void>;
  onSendEmail: (userId: string) => void;
  onSendPasswordReset: (userId: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  profiles,
  fetchProfiles,
  toggleAdminStatus,
  updateWebhookLimit,
  toggleAIInsightsVisibility,
  onSendEmail,
  onSendPasswordReset,
}) => {
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
            <TableHead>Status</TableHead>
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
              </TableCell>
              <TableCell>
                <UserActions 
                  profile={profile}
                  onSendEmail={() => onSendEmail(profile.id)}
                  onSendPasswordReset={() => onSendPasswordReset(profile.id)}
                  fetchProfiles={fetchProfiles}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
