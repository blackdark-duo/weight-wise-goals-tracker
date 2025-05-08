
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

interface AccountActionsProps {
  userId: string | null;
}

const AccountActions: React.FC<AccountActionsProps> = ({ userId }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const scheduleAccountDeletion = async () => {
    if (!userId) {
      toast.error("You must be logged in to delete your account");
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // Add the account to a scheduled deletion list by setting a flag in the profile
      const deletionDate = new Date();
      deletionDate.setDate(deletionDate.getDate() + 7); // 7 days from now
      
      // Use type assertion to tell TypeScript these properties are valid
      const { error } = await supabase
        .from('profiles')
        .update({
          scheduled_for_deletion: true,
          deletion_date: deletionDate.toISOString()
        } as any)
        .eq('id', userId);
      
      if (error) throw error;
      
      toast.success("Your account has been scheduled for deletion in 7 days");
      
      // Log the user out
      setTimeout(async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
      }, 3000);
    } catch (error: any) {
      console.error("Error scheduling account deletion:", error);
      toast.error(error.message || "Failed to schedule account deletion");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border-destructive/10 bg-destructive/5">
      <CardHeader className="pb-3">
        <CardTitle>Danger Zone</CardTitle>
        <CardDescription>
          Actions here can't be undone. Please proceed with caution.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Delete Your Account?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Your account will be scheduled for deletion and will be permanently removed after 7 days.
                During this time, you can contact support to cancel the deletion.
                All your data will be permanently removed and cannot be recovered.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={scheduleAccountDeletion}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Scheduling..." : "Schedule Deletion"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default AccountActions;
