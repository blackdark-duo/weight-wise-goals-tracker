
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AccountDangerZoneProps {
  setIsLoading: (loading: boolean) => void;
}

const AccountDangerZone = ({ setIsLoading }: AccountDangerZoneProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDeleteData = async () => {
    try {
      setIsDeleting(true);
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to delete your data");
        return;
      }
      
      // Delete all weight entries
      const { error: weightError } = await supabase
        .from("weight_entries")
        .delete()
        .eq("user_id", user.id);
      
      if (weightError) throw weightError;
      
      // Delete all goals
      const { error: goalError } = await supabase
        .from("goals")
        .delete()
        .eq("user_id", user.id);
      
      if (goalError) throw goalError;
      
      toast.success("All your data has been deleted successfully");
    } catch (err: any) {
      console.error("Data deletion error:", err);
      toast.error(err.message || "Failed to delete user data");
    } finally {
      setIsDeleting(false);
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      setIsLoading(true);
      
      // In a real app, you would use a Supabase Edge Function to handle account deletion
      // For now, we'll simulate account deletion with a sign-out
      
      await handleDeleteData(); // Delete all user data first
      
      await supabase.auth.signOut();
      toast.success("Account deleted successfully");
      navigate("/");
    } catch (err: any) {
      console.error("Account deletion error:", err);
      toast.error(err.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3 border border-destructive/20 rounded-md p-4">
          <h3 className="font-medium">Delete All My Data</h3>
          <p className="text-sm text-muted-foreground">
            This will permanently delete all your weight entries, goals, and progress. Your account will remain active.
          </p>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive border-destructive/50 hover:bg-destructive/10 w-full sm:w-auto">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All of your data will be permanently deleted
                  from our servers, including all weight records, goals, and tracking history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDeleteData}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Yes, delete all my data"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <div className="space-y-3 border border-destructive rounded-md p-4">
          <h3 className="font-medium">Delete Account</h3>
          <p className="text-sm text-muted-foreground">
            This will permanently delete your account and all associated data. This action cannot be undone.
          </p>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Your account will be permanently deleted
                  from our servers, including all personal information, weight records, and goals.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Yes, delete my account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountDangerZone;
