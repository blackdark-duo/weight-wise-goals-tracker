
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
import { Trash2, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToasts } from "../ui/toast-notification";

interface DangerZoneCardProps {
  setIsLoading: (loading: boolean) => void;
}

const DangerZoneCard = ({ setIsLoading }: DangerZoneCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToasts();

  const handleDeleteData = async () => {
    try {
      setIsDeleting(true);
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        addToast({
          title: "Authentication required",
          message: "You must be logged in to delete your data",
          variant: "error"
        });
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
      
      addToast({
        title: "Data deleted successfully",
        message: "All your records have been permanently deleted",
        variant: "success"
      });
    } catch (err: any) {
      console.error("Data deletion error:", err);
      addToast({
        title: "Deletion failed",
        message: err.message || "Failed to delete user data",
        variant: "error"
      });
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
      // First delete all user data
      await handleDeleteData(); 
      
      await supabase.auth.signOut();
      addToast({
        title: "Account deleted",
        message: "Your account has been successfully deleted",
        variant: "success"
      });
      navigate("/");
    } catch (err: any) {
      console.error("Account deletion error:", err);
      addToast({
        title: "Deletion failed",
        message: err.message || "Failed to delete account",
        variant: "error"
      });
    } finally {
      setIsDeleting(false);
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-destructive/30 bg-gradient-to-r from-white to-rose-50 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-destructive">
          <ShieldAlert className="h-5 w-5" />
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3 border border-destructive/20 rounded-md p-4 bg-white/80">
          <h3 className="font-medium">Delete All My Data</h3>
          <p className="text-sm text-muted-foreground">
            This will permanently delete all your weight entries, goals, and progress. Your account will remain active.
          </p>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive border-destructive/50 hover:bg-destructive/10 w-full sm:w-auto bg-white">
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
        
        <div className="space-y-3 border border-destructive rounded-md p-4 bg-destructive/5">
          <h3 className="font-medium text-destructive">Delete Account</h3>
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

export default DangerZoneCard;
