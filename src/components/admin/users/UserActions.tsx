
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Edit, Mail, Key, MoreHorizontal } from "lucide-react";
import { Profile } from "@/types/webhook";

interface UserActionsProps {
  profile: Profile;
  onEditWebhookUrl: (profile: Profile) => void;
  onSendEmail: (profile: Profile) => void;
  onSendPasswordReset: (profile: Profile) => void;
}

const UserActions: React.FC<UserActionsProps> = ({
  profile,
  onEditWebhookUrl,
  onSendEmail,
  onSendPasswordReset
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onEditWebhookUrl(profile)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Webhook URL
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSendEmail(profile)}>
          <Mail className="h-4 w-4 mr-2" />
          Send Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSendPasswordReset(profile)}>
          <Key className="h-4 w-4 mr-2" />
          Reset Password
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserActions;
