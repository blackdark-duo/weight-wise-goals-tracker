
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
import { Separator } from "@/components/ui/separator";
import { Shield, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DangerZoneCardProps {
  userId: string | null;
  setIsLoading: (loading: boolean) => void;
}

const DangerZoneCard = ({ userId, setIsLoading }: DangerZoneCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteData = async () => {
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }
    
    setIsDeleting(true);
    setIsLoading(true);
    
    try {
      // Delete weight entries
      const { error: weightError } = await supabase
        .from("weight_entries")
        .delete()
        .eq("user_id", userId);
      
      if (weightError) throw weightError;
      
      // Delete goals
      const { error: goalError } = await supabase
        .from("goals")
        .delete()
        .eq("user_id", userId);
      
      if (goalError) throw goalError;
      
      toast.success("All your data has been deleted successfully");
    } catch (error: any) {
      console.error("Error deleting data:", error);
      toast.error(error.message || "Failed to delete user data");
    } finally {
      setIsDeleting(false);
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }
    
    setIsDeleting(true);
    setIsLoading(true);
    
    try {
      // First delete user data
      await handleDeleteData();
      
      // Then delete user account
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;
      
      // Sign out after account deletion
      await supabase.auth.signOut();
      toast.success("Account deleted successfully");
      
      // Redirect to home page
      window.location.href = "/";
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error(error.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-red-200 bg-gradient-to-r from-white to-red-50/30 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-red-600 gap-2">
          <Shield className="h-5 w-5" />
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-md border border-red-200 p-4">
          <h3 className="font-medium mb-2">Delete All My Data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This will permanently delete all your weight entries, goals, and progress. Your account will remain active.
          </p>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
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
                  onClick={handleDeleteData}
                  disabled={isDeleting}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {isDeleting ? "Deleting..." : "Yes, delete all my data"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <Separator className="bg-red-100" />
        
        <div className="rounded-md border border-red-300 p-4">
          <h3 className="font-medium mb-2">Delete Account</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This will permanently delete your account and all associated data. This action cannot be undone.
          </p>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
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
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="bg-red-600 text-white hover:bg-red-700"
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
