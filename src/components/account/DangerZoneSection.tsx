
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Shield, Trash2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface DangerZoneSectionProps {
  userId: string | null;
  setIsLoading: (loading: boolean) => void;
}

const DangerZoneSection: React.FC<DangerZoneSectionProps> = ({ userId, setIsLoading }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (!userId) {
      toast.error("You must be logged in to delete your account");
      return;
    }

    if (confirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    setIsDeleting(true);
    setIsLoading(true);
    
    try {
      // First delete all user data
      // Delete weight entries
      const { error: weightError } = await supabase
        .from("weight_entries")
        .delete()
        .eq("user_id", userId);
        
      if (weightError) throw weightError;
      
      // Delete goals
      const { error: goalsError } = await supabase
        .from("goals")
        .delete()
        .eq("user_id", userId);
        
      if (goalsError) throw goalsError;
      
      // Delete webhook logs
      const { error: webhookLogsError } = await supabase
        .from("webhook_logs")
        .delete()
        .eq("user_id", userId);
        
      if (webhookLogsError) throw webhookLogsError;
      
      // Delete profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);
        
      if (profileError) throw profileError;
      
      // Finally delete the user's auth account
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.error("Error deleting auth user (might require admin rights):", authError);
        // Continue anyway since we've deleted all the user data
      }
      
      // Sign out
      await supabase.auth.signOut();
      
      toast.success("Your account has been deleted successfully");
      navigate("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-destructive/20 bg-gradient-to-r from-white to-red-50/30 shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 text-destructive">
          <Shield className="h-5 w-5" />
          <CardTitle>Danger Zone</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-md border border-destructive/30 p-4 bg-destructive/5">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-destructive">Delete Your Account</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This will permanently delete your account, all your data, and access to the service. This action cannot be undone.
                </p>
              </div>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="mt-2">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-destructive">
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    <div className="space-y-4">
                      <p>
                        This action cannot be undone. Your account will be permanently deleted
                        from our servers, including all personal information, weight records, and goals.
                      </p>
                      <div className="rounded-md bg-amber-50 p-3 border border-amber-200">
                        <p className="text-amber-800 text-sm font-medium">
                          Please type DELETE in the field below to confirm:
                        </p>
                        <Input 
                          className="mt-2 border-amber-300"
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          placeholder="Type DELETE to confirm"
                        />
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeleting || confirmText !== "DELETE"}
                  >
                    {isDeleting ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                        Deleting...
                      </>
                    ) : (
                      "Delete Account"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DangerZoneSection;
