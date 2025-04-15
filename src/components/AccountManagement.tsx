
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
import { AlertCircle, Trash2, UserCog, KeyRound, Save } from "lucide-react";

const AccountManagement = () => {
  const [displayName, setDisplayName] = useState("John Doe");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateDisplayName = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // This will be implemented with Supabase later
      console.log("Updating display name to:", displayName);
      
      // Simulate API call
      setTimeout(() => {
        setSuccess("Display name updated successfully");
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError("Failed to update display name");
      console.error("Update error:", err);
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // This will be implemented with Supabase later
      console.log("Changing password");
      
      // Simulate API call
      setTimeout(() => {
        setSuccess("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError("Failed to change password");
      console.error("Password change error:", err);
      setIsLoading(false);
    }
  };

  const handleDeleteData = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // This will be implemented with Supabase later
      console.log("Deleting user data");
      
      // Simulate API call
      setTimeout(() => {
        setSuccess("All user data has been deleted");
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError("Failed to delete user data");
      console.error("Data deletion error:", err);
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    setError("");

    try {
      // This will be implemented with Supabase later
      console.log("Deleting user account");
      
      // Simulate API call
      setTimeout(() => {
        // Will redirect to home after account deletion in real implementation
        console.log("Account deleted");
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError("Failed to delete account");
      console.error("Account deletion error:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
          {success}
        </div>
      )}
      
      {/* Update Display Name */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <UserCog className="h-5 w-5 text-brand-primary" />
          <h3 className="text-lg font-medium">Profile Information</h3>
        </div>
        
        <form onSubmit={handleUpdateDisplayName} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          
          <Button type="submit" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
      
      <Separator />
      
      {/* Change Password */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-brand-primary" />
          <h3 className="text-lg font-medium">Change Password</h3>
        </div>
        
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
      
      <Separator />
      
      {/* Danger Zone */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
        
        <div className="rounded-md border border-destructive/50 p-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Delete All My Data</h4>
              <p className="text-sm text-muted-foreground">
                This will permanently delete all your weight entries, goals, and progress. Your account will remain active.
              </p>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive border-destructive/50 hover:bg-destructive/10">
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
                    disabled={isLoading}
                  >
                    {isLoading ? "Deleting..." : "Yes, delete all my data"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        <div className="rounded-md border border-destructive/50 p-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Delete Account</h4>
              <p className="text-sm text-muted-foreground">
                This will permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            
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
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDeleteAccount}
                    disabled={isLoading}
                  >
                    {isLoading ? "Deleting..." : "Yes, delete my account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountManagement;
