
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MobileNavigation from "@/components/MobileNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "sonner";
import { Shield, User, Settings, Database } from "lucide-react";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import AccountProfile from "@/components/account/AccountProfile";
import AccountPreferences from "@/components/account/AccountPreferences";
import AccountDataManagement from "@/components/account/AccountDataManagement";
import AccountDangerZone from "@/components/account/AccountDangerZone";

const Account = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    userName: null as string | null,
    email: null as string | null,
    userId: null as string | null
  });
  const navigate = useNavigate();
  const { preferredUnit } = useUserPreferences();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/signin');
          return;
        }
        
        setUserData(prev => ({
          ...prev,
          email: user.email || null,
          userId: user.id
        }));
        
        const { data, error } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching profile:", error);
          toast.error("Failed to load profile. Please refresh the page.");
        }

        if (data) {
          setUserData(prev => ({
            ...prev,
            userName: data.display_name || null
          }));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Something went wrong. Please try again later.");
      } finally {
        setIsLoading(false);
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
          
          {userData.userName && (
            <div className="text-muted-foreground bg-white/70 px-3 py-1 rounded-full shadow-sm border border-brand-primary/10">
              Welcome, {userData.userName}
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
            <AccountProfile 
              userName={userData.userName} 
              email={userData.email}
              userId={userData.userId}
              setIsLoading={setIsLoading} 
            />
          </TabsContent>
          
          <TabsContent value="preferences" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
            <AccountPreferences 
              userId={userData.userId}
              preferredUnit={preferredUnit}
              setIsLoading={setIsLoading} 
            />
          </TabsContent>
          
          <TabsContent value="data" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
            <AccountDataManagement 
              userId={userData.userId} 
              setIsLoading={setIsLoading} 
            />
          </TabsContent>
          
          <TabsContent value="danger" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
            <AccountDangerZone 
              userId={userData.userId}
              setIsLoading={setIsLoading} 
            />
          </TabsContent>
        </Tabs>
      </div>
      <MobileNavigation />
      <Toaster />
    </div>
  );
};

export default Account;
