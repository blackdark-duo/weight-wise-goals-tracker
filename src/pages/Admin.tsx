
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import MobileNavigation from "@/components/navigation/MobileNavigation";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAdminProfiles } from "@/hooks/useAdminProfiles";
import { toast } from "sonner";

// Import admin components
import AdminHeader from "@/components/admin/AdminHeader";
import AdminLoader from "@/components/admin/AdminLoader";
import AdminAuthMessage from "@/components/admin/AdminAuthMessage";
import WebhookSettings from "@/components/admin/WebhookSettings";
import WebhookLogViewer from "@/components/admin/WebhookLogViewer";
import WebhookTester from "@/components/admin/WebhookTester";
import UserTable from "@/components/admin/UserTable";

const AdminPage = () => {
  const { 
    isLoading: isAuthLoading, 
    isAuthenticated, 
    isAdmin, 
    error: authError 
  } = useAdminAuth();
  
  const { 
    profiles, 
    fetchProfiles, 
    toggleAdminStatus, 
    updateWebhookLimit,
    updateWebhookUrl,
    toggleAIInsightsVisibility,
    isLoading: isProfilesLoading
  } = useAdminProfiles();

  const [activeTab, setActiveTab] = useState("app-controls");

  const handleRefreshUsers = async () => {
    try {
      toast.info("Refreshing user data...");
      await fetchProfiles();
      toast.success("User data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing users:", error);
      toast.error("Failed to refresh user data");
    }
  };

  if (isAuthLoading) {
    return <AdminLoader />;
  }
  
  if (!isAuthenticated) {
    return <AdminAuthMessage type="auth" />;
  }
  
  if (!isAdmin) {
    return <AdminAuthMessage type="access" />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <AdminHeader error={authError} />
          <Button 
            onClick={handleRefreshUsers}
            className="flex items-center gap-2"
            disabled={isProfilesLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isProfilesLoading ? 'animate-spin' : ''}`} />
            Refresh User Data
          </Button>
        </div>

        <Tabs 
          defaultValue={activeTab} 
          className="w-full"
          onValueChange={(value) => setActiveTab(value)}
        >
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
            <div className="space-y-6">
              <WebhookTester profiles={profiles} onRefreshUsers={handleRefreshUsers} />
              <WebhookSettings />
              <WebhookLogViewer />
            </div>
          </TabsContent>
          
          <TabsContent value="user-controls">
            <div className="bg-card rounded-lg border p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  User Management
                </h2>
                <p className="text-sm text-muted-foreground">
                  Manage user accounts, permissions, and access controls.
                </p>
              </div>
              
              <UserTable 
                profiles={profiles}
                fetchProfiles={fetchProfiles}
                toggleAdminStatus={toggleAdminStatus}
                updateWebhookLimit={updateWebhookLimit}
                updateWebhookUrl={updateWebhookUrl}
                toggleAIInsightsVisibility={toggleAIInsightsVisibility}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <MobileNavigation />
      <Toaster />
    </div>
  );
};

export default AdminPage;
