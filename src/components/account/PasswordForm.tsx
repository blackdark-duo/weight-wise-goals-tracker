
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, AlertCircle, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PasswordFormProps {
  setIsLoading: (loading: boolean) => void;
}

const PasswordForm: React.FC<PasswordFormProps> = ({ setIsLoading }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setIsSaving(true);
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) throw error;
      
      toast.success("Password updated successfully", {
        icon: <Check className="h-4 w-4 text-green-500" />
      });
      
      // Clear form after successful update
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Error updating password:", err);
      setError(err.message || "Failed to update password");
      toast.error("Failed to update password. Please try again.");
    } finally {
      setIsSaving(false);
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-brand-primary/10 bg-gradient-to-r from-white to-blue-50 shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-blue-500" />
          <CardTitle>Change Password</CardTitle>
        </div>
        <CardDescription>
          Update your password to keep your account secure
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="border-brand-primary/20 focus-visible:ring-brand-primary/30"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="border-brand-primary/20 focus-visible:ring-brand-primary/30"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PasswordForm;
