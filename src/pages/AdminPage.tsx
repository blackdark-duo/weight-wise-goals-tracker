
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
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import { useAdminProfiles } from "@/hooks/useAdminProfiles";

const AdminPage = () => {
  const navigate = useNavigate();
  const { profiles, isLoading, isAdmin, fetchProfiles } = useAdminProfiles();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ff7f50] border-t-transparent"></div>
        <span className="ml-3">Loading...</span>
      </div>
    );
  }

  return (
    <AdminAuthGuard isAdmin={isAdmin} navigate={navigate}>
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
              <UserManagementTab profiles={profiles} fetchProfiles={fetchProfiles} />
            </TabsContent>
          </Tabs>
        </div>
        <MobileNavigation />
        <Toaster />
      </div>
    </AdminAuthGuard>
  );
};

export default AdminPage;
