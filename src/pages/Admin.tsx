
import React from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import MobileNavigation from "@/components/navigation/MobileNavigation";
import { Toaster } from "@/components/ui/toaster";
import AppControlsTab from "@/components/admin/AppControlsTab";
import UserManagementTab from "@/components/admin/UserManagementTab";
import { useAdminProfiles } from "@/hooks/useAdminProfiles";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminLoader from "@/components/admin/AdminLoader";
import AdminAuthMessage from "@/components/admin/AdminAuthMessage";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

const AdminPage = () => {
  const { 
    isLoading, 
    isAuthenticated, 
    isAdmin, 
    error, 
    userId 
  } = useAdminAuth();
  
  const { 
    profiles, 
    fetchProfiles, 
    toggleAdminStatus, 
    updateWebhookLimit,
    toggleAIInsightsVisibility,
    isLoading: isProfilesLoading
  } = useAdminProfiles();

  const handleRefreshUsers = async () => {
    try {
      toast.info("Refreshing user list...");
      await fetchProfiles();
      toast.success("User list refreshed successfully");
    } catch (error) {
      console.error("Error refreshing users:", error);
      toast.error("Failed to refresh user list");
    }
  };

  if (isLoading) {
    return <AdminLoader />;
  }
  
  if (!isAuthenticated) {
    return <AdminAuthMessage type="auth" />;
  }
  
  if (!isAdmin) {
    return <AdminAuthMessage type="access" />;
  }
  
  return (
    <div className="min-h-screen bg-ui-background">
      <Navbar />
      <div className="container px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <AdminHeader error={error} />
          <Button 
            onClick={handleRefreshUsers}
            className="flex items-center gap-2"
            disabled={isProfilesLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isProfilesLoading ? 'animate-spin' : ''}`} />
            Fetch All Users from DB
          </Button>
        </div>

        <Tabs defaultValue="app-controls" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="app-controls" className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              App Controls
            </TabsTrigger>
            <TabsTrigger value="user-controls" className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              User Management
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="app-controls">
            <AppControlsTab onRefreshUsers={handleRefreshUsers} />
          </TabsContent>
          
          <TabsContent value="user-controls">
            <Card>
              <UserManagementTab 
                profiles={profiles} 
                fetchProfiles={fetchProfiles} 
                toggleAdminStatus={toggleAdminStatus}
                updateWebhookLimit={updateWebhookLimit}
                toggleAIInsightsVisibility={toggleAIInsightsVisibility}
                onRefreshUsers={handleRefreshUsers}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <MobileNavigation />
      <Toaster />
    </div>
  );
};

export default AdminPage;
