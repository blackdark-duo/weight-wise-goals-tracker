
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useToasts } from "../ui/toast-notification";

interface PasswordFormProps {
  setIsLoading: (loading: boolean) => void;
}

const PasswordForm = ({ setIsLoading }: PasswordFormProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToasts();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast({
        title: "Missing fields",
        message: "Please fill in all password fields",
        variant: "warning"
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      addToast({
        title: "Passwords don't match",
        message: "New password and confirmation must match",
        variant: "error"
      });
      return;
    }
    
    if (newPassword.length < 6) {
      addToast({
        title: "Password too short",
        message: "Password must be at least 6 characters long",
        variant: "warning"
      });
      return;
    }
    
    setIsSaving(true);
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      addToast({
        title: "Password updated",
        message: "Your password has been updated successfully",
        variant: "success"
      });
    } catch (err: any) {
      console.error("Error updating password:", err);
      addToast({
        title: "Update failed",
        message: err.message || "Failed to update password",
        variant: "error"
      });
    } finally {
      setIsSaving(false);
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-brand-primary/10 bg-gradient-to-r from-white to-purple-50/50 shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-brand-primary" />
          <CardTitle>Password</CardTitle>
        </div>
        <CardDescription>
          Update your password to keep your account secure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="border-brand-primary/20 focus-visible:ring-brand-primary/30"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border-brand-primary/20 focus-visible:ring-brand-primary/30"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border-brand-primary/20 focus-visible:ring-brand-primary/30"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isSaving}
            className="w-full md:w-auto bg-gradient-to-r from-brand-primary to-brand-primary/80 hover:from-brand-primary/90 hover:to-brand-primary"
          >
            {isSaving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Password
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PasswordForm;
