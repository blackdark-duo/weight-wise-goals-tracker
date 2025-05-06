
import React from "react";
import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import UserActions from "./UserActions";
import { Profile } from "@/hooks/useAdminProfiles";

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
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-3 text-left">User</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Admin</th>
            <th className="px-4 py-3 text-left">AI Limit</th>
            <th className="px-4 py-3 text-left">Show AI</th>
            <th className="px-4 py-3 text-left">Last Request</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((profile) => (
            <tr key={profile.id} className="border-b">
              <td className="px-4 py-3 flex items-center">
                <User className="h-5 w-5 mr-2 text-muted-foreground" />
                {profile.display_name || "No Name"}
                {profile.created_at && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                {profile.email || "No Email"}
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
              <td className="px-4 py-3">
                <Switch
                  checked={profile.show_ai_insights !== false}
                  onCheckedChange={() => toggleAIInsightsVisibility(profile)}
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
                  onSendEmail={() => onSendEmail(profile.id)}
                  onSendPasswordReset={() => onSendPasswordReset(profile.id)}
                  fetchProfiles={fetchProfiles}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
