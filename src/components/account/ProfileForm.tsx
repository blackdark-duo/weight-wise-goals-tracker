
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useToasts } from "../ui/toast-notification";

interface ProfileFormProps {
  userName: string | null;
  email: string | null;
  setUserName: (name: string | null) => void;
  setIsLoading: (loading: boolean) => void;
}

const ProfileForm = ({ userName, email, setUserName, setIsLoading }: ProfileFormProps) => {
  const [displayName, setDisplayName] = useState(userName || "");
  const { addToast } = useToasts();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to update profile");
        return;
      }
      
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
        
      if (error) throw error;
      
      setUserName(displayName);
      addToast({
        title: "Profile updated",
        message: "Your profile information has been updated successfully",
        variant: "success"
      });
    } catch (err: any) {
      console.error("Error updating profile:", err);
      addToast({
        title: "Update failed",
        message: err.message || "Failed to update profile",
        variant: "error"
      });
    } finally {
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
          
          <Button type="submit" className="w-full md:w-auto bg-gradient-to-r from-brand-primary to-brand-primary/80 hover:from-brand-primary/90 hover:to-brand-primary">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
