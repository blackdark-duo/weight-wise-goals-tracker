
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MobileNavigation from "@/components/MobileNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import ProfileForm from "@/components/account/ProfileForm";
import PreferencesForm from "@/components/account/PreferencesForm";
import DataManagementCard from "@/components/account/DataManagementCard";
import DangerZoneCard from "@/components/account/DangerZoneCard";
import { Shield, User, Settings, Database } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

const Account = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/signin');
          return;
        }
        
        setEmail(user.email || null);
        
        const { data } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single();
          
        if (data) {
          setUserName(data.display_name || null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    
    fetchUserProfile();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30">
      <Navbar />
      <div className="container max-w-4xl pt-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2 bg-gradient-to-r from-brand-primary to-blue-600 bg-clip-text text-transparent">
            Account Settings
            {isLoading && (
              <div className="animate-spin h-4 w-4 border-2 border-primary border-opacity-50 border-t-primary rounded-full"></div>
            )}
          </h1>
          
          {userName && (
            <div className="text-muted-foreground bg-white/70 px-3 py-1 rounded-full shadow-sm border border-brand-primary/10">
              Welcome, {userName}
            </div>
          )}
        </div>
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-4 md:w-auto w-full bg-white/80 border border-brand-primary/10 p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-primary/10 data-[state=active]:to-brand-primary/5">
              <User className="h-4 w-4 mr-2" strokeWidth={1.75} />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/10 data-[state=active]:to-blue-500/5">
              <Settings className="h-4 w-4 mr-2" strokeWidth={1.75} />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500/10 data-[state=active]:to-teal-500/5">
              <Database className="h-4 w-4 mr-2" strokeWidth={1.75} />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
            <TabsTrigger value="danger" className="text-destructive data-[state=active]:text-destructive data-[state=active]:bg-gradient-to-r data-[state=active]:from-destructive/10 data-[state=active]:to-destructive/5">
              <Shield className="h-4 w-4 mr-2" strokeWidth={1.75} />
              <span className="hidden sm:inline">Danger</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
            <ProfileForm 
              userName={userName} 
              email={email}
              setUserName={setUserName} 
              setIsLoading={setIsLoading} 
            />
          </TabsContent>
          
          <TabsContent value="preferences" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
            <PreferencesForm setIsLoading={setIsLoading} />
          </TabsContent>
          
          <TabsContent value="data" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
            <DataManagementCard setIsLoading={setIsLoading} />
          </TabsContent>
          
          <TabsContent value="danger" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
            <DangerZoneCard setIsLoading={setIsLoading} />
          </TabsContent>
        </Tabs>
      </div>
      <MobileNavigation />
      <Toaster />
    </div>
  );
};

export default Account;
