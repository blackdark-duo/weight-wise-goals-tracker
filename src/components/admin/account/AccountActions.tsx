
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Profile } from "@/types/webhook";

export function AccountActions() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const scheduleAccountDeletion = async () => {
    try {
      setIsScheduling(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to perform this action");
        return;
      }
      
      // Set deletion date to 30 days from now
      const deletionDate = new Date();
      deletionDate.setDate(deletionDate.getDate() + 30);
      
      // Update profile with scheduled deletion flag and date
      const { error } = await supabase
        .from('profiles')
        .update({
          scheduled_for_deletion: true, 
          deletion_date: deletionDate.toISOString()
        } as any) // Cast to any to bypass type checking
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast.success("Account scheduled for deletion in 30 days");
    } catch (error) {
      console.error("Error scheduling account deletion:", error);
      toast.error("Failed to schedule account deletion");
    } finally {
      setIsScheduling(false);
    }
  };

  const cancelAccountDeletion = async () => {
    try {
      setIsCanceling(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to perform this action");
        return;
      }
      
      // Update profile to remove deletion flag and date
      const { error } = await supabase
        .from('profiles')
        .update({ 
          scheduled_for_deletion: false, 
          deletion_date: null 
        } as any) // Cast to any to bypass type checking
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast.success("Account deletion canceled");
    } catch (error) {
      console.error("Error canceling account deletion:", error);
      toast.error("Failed to cancel account deletion");
    } finally {
      setIsCanceling(false);
    }
  };
  
  const deleteAccountImmediately = async () => {
    try {
      setIsDeleting(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to perform this action");
        return;
      }
      
      // Call the delete-user Edge Function
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { user_id: user.id }
      });
      
      if (error) throw error;
      
      // Sign out after successful deletion
      await supabase.auth.signOut();
      
      toast.success("Account deleted successfully");
      
      // Redirect to home page after short delay
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Delete Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>You can schedule your account for deletion or delete it immediately. 
          Scheduled deletions can be canceled any time before the deletion date.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={scheduleAccountDeletion}
            disabled={isScheduling || isDeleting}
          >
            {isScheduling ? 
              "Scheduling..." : 
              "Schedule Deletion (30 days)"
            }
          </Button>
          
          <Button
            variant="outline"
            onClick={cancelAccountDeletion}
            disabled={isCanceling || isDeleting}
          >
            {isCanceling ? 
              "Canceling..." : 
              "Cancel Scheduled Deletion"
            }
          </Button>
          
          <Button
            variant="destructive"
            onClick={deleteAccountImmediately}
            disabled={isDeleting}
          >
            {isDeleting ? 
              "Deleting..." : 
              "Delete Immediately"
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
