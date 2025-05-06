
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Settings, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import MobileNavigation from "@/components/navigation/MobileNavigation";
import { Toaster } from "@/components/ui/toaster";
import AppControlsTab from "@/components/admin/AppControlsTab";
import UserManagementTab from "@/components/admin/UserManagementTab";
import { useAdminProfiles, Profile } from "@/hooks/useAdminProfiles";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AdminPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Use the profiles from the hook
  const { 
    profiles, 
    fetchProfiles, 
    toggleAdminStatus, 
    updateWebhookLimit,
    toggleAIInsightsVisibility
  } = useAdminProfiles();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if the user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          throw authError;
        }
        
        if (!user) {
          setIsAuthenticated(false);
          return;
        }
        
        setUserId(user.id);
        setIsAuthenticated(true);
        
        // Check if the user is an admin
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();
          
        if (profileError) {
          throw profileError;
        }
        
        const isUserAdmin = !!profileData?.is_admin;
        setIsAdmin(isUserAdmin);
      } catch (error: any) {
        console.error("Error checking admin status:", error);
        setError("Failed to verify admin status. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ff7f50] border-t-transparent"></div>
          <span className="ml-3">Loading...</span>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-muted-foreground mb-6 text-center">
            You need to sign in to access this page.
          </p>
          <button
            onClick={() => navigate("/signin")}
            className="bg-[#ff7f50] text-white px-4 py-2 rounded-md hover:bg-[#ff6347]"
          >
            Sign In
          </button>
        </div>
      );
    }
    
    if (!isAdmin) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6 text-center">
            You do not have permission to access this page.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-[#ff7f50] text-white px-4 py-2 rounded-md hover:bg-[#ff6347]"
          >
            Back to Dashboard
          </button>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-ui-background">
        <Navbar />
        <div className="container px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 flex items-center">
            <Settings className="mr-2 h-8 w-8 text-[#ff7f50]" />
            Admin Dashboard
          </h1>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
              <AppControlsTab />
            </TabsContent>
            
            <TabsContent value="user-controls">
              <Card>
                <UserManagementTab 
                  profiles={profiles} 
                  fetchProfiles={fetchProfiles} 
                  toggleAdminStatus={toggleAdminStatus}
                  updateWebhookLimit={updateWebhookLimit}
                  toggleAIInsightsVisibility={toggleAIInsightsVisibility}
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

  return renderContent();
};

export default AdminPage;
