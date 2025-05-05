import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Settings, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import MobileNavigation from "@/components/MobileNavigation";
import { Toaster } from "@/components/ui/toaster";
import AppControlsTab from "@/components/admin/AppControlsTab";
import UserManagementTab from "@/components/admin/UserManagementTab";
import { Profile } from "@/hooks/useAdminProfiles";

const AdminPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/signin");
          return;
        }

        // Get user profile to check admin status
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          toast.error("Failed to verify admin status");
          navigate("/dashboard");
          return;
        }

        if (profile && profile.is_admin) {
          setIsAdmin(true);
          fetchProfiles();
        } else if (session.user.email === "admin@cozyweight.com") {
          // For demo purposes, also allow the default admin
          setIsAdmin(true);
          fetchProfiles();
        } else {
          toast.error("You do not have permission to access this page");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast.error("Authentication error. Please sign in again.");
        navigate("/signin");
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [navigate]);

  const fetchProfiles = async () => {
    try {
      // First get profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("display_name");

      if (profilesError) throw profilesError;
      
      // Then get user emails from auth.users - this requires admin rights
      // In a real app, this would be done in a Supabase Edge Function with service_role key
      const profiles = profilesData || [];
      
      try {
        // Fetch emails for all users - using auth admin API (simulated here)
        // NOTE: In production, this should be done via an Edge Function with proper authentication
        const { data, error: usersError } = await supabase
          .from('profiles')  // We're actually just getting profiles again as a workaround
          .select('id, email');  // Now we're selecting email from profiles
          
        if (!usersError && data) {
          setProfiles(profiles);
        } else {
          // If we can't get emails, just use the profiles as is
          setProfiles(profiles);
        }
      } catch (error) {
        console.error("Error fetching user emails:", error);
        setProfiles(profiles);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast.error("Failed to load user profiles");
    }
  };

  const toggleAdminStatus = async (profile: Profile) => {
    try {
      const newStatus = !profile.is_admin;
      
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: newStatus })
        .eq("id", profile.id);
      
      if (error) throw error;
      
      await fetchProfiles();
      
      toast.success(`${profile.display_name} is now ${newStatus ? "an admin" : "a regular user"}`);
    } catch (error) {
      console.error("Error updating admin status:", error);
      toast.error("Failed to update user privileges");
    }
  };

  const updateWebhookLimit = async (profile: Profile, limit: number) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ webhook_limit: limit })
        .eq("id", profile.id);
      
      if (error) throw error;
      
      await fetchProfiles();
      
      toast.success(`Updated webhook limit for ${profile.display_name}`);
    } catch (error) {
      console.error("Error updating webhook limit:", error);
      toast.error("Failed to update webhook limit");
    }
  };

  const toggleAIInsightsVisibility = async (profile: Profile) => {
    try {
      const currentValue = profile.show_ai_insights !== false;
      
      const { error } = await supabase
        .from("profiles")
        .update({ show_ai_insights: !currentValue })
        .eq("id", profile.id);
        
      if (error) throw error;
      
      await fetchProfiles();
      toast.success(`AI Insights ${!currentValue ? "enabled" : "disabled"} for ${profile.display_name}`);
    } catch (error) {
      console.error("Error toggling AI insights visibility:", error);
      toast.error("Failed to update AI insights visibility");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ff7f50] border-t-transparent"></div>
        <span className="ml-3">Loading...</span>
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

export default AdminPage;
