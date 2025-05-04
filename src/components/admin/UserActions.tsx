
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mail, KeyRound, Trash2, Ban } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  id: string;
  display_name: string;
  email?: string;
  is_suspended?: boolean;
}

interface UserActionsProps {
  profile: Profile;
  onSendEmail: (userId: string) => void;
  onSendPasswordReset: (userId: string) => void;
  fetchProfiles: () => Promise<void>;
}

const UserActions: React.FC<UserActionsProps> = ({
  profile,
  onSendEmail,
  onSendPasswordReset,
  fetchProfiles
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);

  const deleteUser = async (userId: string) => {
    try {
      setIsDeleting(true);
      // In a real app, this would be done via an Edge Function with admin rights
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
        
      if (error) throw error;
      
      await fetchProfiles();
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const suspendUser = async (userId: string) => {
    try {
      setIsSuspending(true);
      
      const { error } = await supabase
        .from("profiles")
        .update({ 
          is_suspended: true,
          display_name: profile.is_suspended 
            ? profile.display_name?.replace(" [SUSPENDED]", "") 
            : `${profile.display_name} [SUSPENDED]`
        })
        .eq("id", userId);
        
      if (error) throw error;
      
      await fetchProfiles();
      toast.success("User suspended successfully");
    } catch (error) {
      console.error("Error suspending user:", error);
      toast.error("Failed to suspend user");
    } finally {
      setIsSuspending(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onSendEmail(profile.id)}
      >
        <Mail className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onSendPasswordReset(profile.id)}
      >
        <KeyRound className="h-4 w-4" />
      </Button>
      
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="destructive" 
            size="sm"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {profile.display_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {}}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteUser(profile.id)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="text-amber-500 border-amber-200 hover:bg-amber-50"
          >
            <Ban className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Suspend {profile.display_name}'s account. They will not be able to log in until unsuspended.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {}}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => suspendUser(profile.id)}
              disabled={isSuspending}
            >
              {isSuspending ? "Processing..." : "Suspend User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserActions;
