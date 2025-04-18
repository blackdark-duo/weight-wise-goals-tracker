
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, Save, AlertCircle, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfileFormProps {
  userName: string | null;
  email: string | null;
  userId: string | null;
  setIsLoading: (loading: boolean) => void;
  updateProfile: (data: { userName?: string | null }) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ 
  userName, 
  email, 
  userId,
  setIsLoading,
  updateProfile
}) => {
  const [displayName, setDisplayName] = useState(userName || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("You must be logged in to update your profile");
      return;
    }

    setIsSaving(true);
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);
        
      if (error) throw error;
      
      updateProfile({ userName: displayName });
      toast.success("Profile updated successfully", {
        icon: <Check className="h-4 w-4 text-green-500" />
      });
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-brand-primary/10 bg-gradient-to-r from-white to-purple-50 shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-brand-primary" />
          <CardTitle>Profile Information</CardTitle>
        </div>
        <CardDescription>
          Update your account settings and personal information
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="border-brand-primary/20 focus-visible:ring-brand-primary/30"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email || ""}
              disabled
              className="bg-muted/50"
            />
            <p className="text-xs text-muted-foreground">
              Your email address is managed through your authentication provider
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full md:w-auto bg-gradient-to-r from-brand-primary to-brand-primary/80 hover:from-brand-primary/90 hover:to-brand-primary"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
