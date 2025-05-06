
import React, { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Mail, KeyRound, UserX, AlertCircle } from "lucide-react";
import { Profile } from "@/hooks/useAdminProfiles";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserActionsProps {
  profile: Profile;
  onSendEmail: () => void;
  onSendPasswordReset: () => void;
  fetchProfiles: () => Promise<void>;
}

const UserActions: React.FC<UserActionsProps> = ({
  profile,
  onSendEmail,
  onSendPasswordReset,
  fetchProfiles,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDeleteUser = async () => {
    try {
      setIsDeleting(true);
      
      // Get the current user's session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to delete users");
        return;
      }
      
      // Call our Edge Function with proper authentication
      const { error: functionError } = await supabase.functions.invoke("delete-user", {
        body: { userIdToDelete: profile.id },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (functionError) {
        console.error("Error deleting user:", functionError);
        toast.error(`Failed to delete user: ${functionError.message || "Unknown error"}`);
        return;
      }
      
      toast.success(`User ${profile.display_name || profile.email} has been deleted`);
      await fetchProfiles(); // Refresh the user list
      setIsDialogOpen(false);
      
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(`An unexpected error occurred: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={onSendEmail}>
            <Mail className="mr-2 h-4 w-4" />
            <span>Send Email</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={onSendPasswordReset}>
            <KeyRound className="mr-2 h-4 w-4" />
            <span>Password Reset</span>
          </DropdownMenuItem>
          
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <UserX className="mr-2 h-4 w-4 text-destructive" />
                <span className="text-destructive">Delete User</span>
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Delete User Account
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the user
                  account and remove all their data from the database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                      Deleting...
                    </>
                  ) : (
                    "Delete User"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserActions;
