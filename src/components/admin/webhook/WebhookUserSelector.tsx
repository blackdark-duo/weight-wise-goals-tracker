
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "lucide-react";
import { Profile } from "@/types/webhook";

interface WebhookUserSelectorProps {
  profiles: Profile[];
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  isLoading: boolean;
}

const WebhookUserSelector: React.FC<WebhookUserSelectorProps> = ({
  profiles,
  selectedUserId,
  onSelectUser,
  isLoading
}) => {
  return (
    <Select 
      onValueChange={onSelectUser} 
      disabled={isLoading}
      value={selectedUserId || undefined}
    >
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder="Select a user" />
      </SelectTrigger>
      <SelectContent>
        {profiles.map((profile) => (
          <SelectItem key={profile.id} value={profile.id}>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{profile.display_name || profile.email || "Unknown User"}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default WebhookUserSelector;
