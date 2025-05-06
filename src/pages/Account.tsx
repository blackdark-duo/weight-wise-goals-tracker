
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MobileNavigation from "@/components/MobileNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, User, Settings, Database } from "lucide-react";
import ProfileSection from "@/components/account/ProfileSection";
import PreferencesSection from "@/components/account/PreferencesSection";
import DataManagementSection from "@/components/account/DataManagementSection";
import DangerZoneSection from "@/components/account/DangerZoneSection";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const Account = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    userId: string | null;
    userName: string | null;
    email: string | null;
    preferredUnit: string;
    timezone: string;
    isAdmin: boolean;
  }>({
    userId: null,
    userName: null,
    email: null,
    preferredUnit: 'kg',
    timezone: 'UTC',
    isAdmin: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if user is authenticated
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        if (!user) {
          navigate('/signin');
          return;
        }
        
        // Set user email and ID
        setProfile(prev => ({
          ...prev,
          email: user.email || null,
          userId: user.id
        }));
        
        // Fetch profile data from profiles table
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("display_name, preferred_unit, timezone, is_admin")
          .eq("id", user.id)
          .maybeSingle();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          throw profileError;
        }

        if (data) {
          setProfile(prev => ({
            ...prev,
            userName: data.display_name || null,
            preferredUnit: data.preferred_unit || 'kg',
            timezone: data.timezone || 'UTC',
            isAdmin: !!data.is_admin
          }));
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        setError(error.message || "Something went wrong. Please try again later.");
        toast.error("Failed to load account data. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [navigate]);

  const updateProfile = (newData: Partial<typeof profile>) => {
    setProfile(prev => ({ ...prev, ...newData }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-amber-50/30">
      <Navbar />
      <div className="container max-w-4xl pt-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2 bg-gradient-to-r from-[#ff7f50] to-[#ff6347] bg-clip-text text-transparent">
            Account Settings
            {isLoading && (
              <Loader2 className="ml-2 h-4 w-4 animate-spin text-[#ff7f50]" />
            )}
          </h1>
          
          {profile.userName && (
            <div className="text-muted-foreground bg-white/70 px-3 py-1 rounded-full shadow-sm border border-[#ff7f50]/10">
              Welcome, {profile.userName}
            </div>
          )}
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!isLoading && !error && (
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid grid-cols-4 md:w-auto w-full bg-white/80 border border-[#ff7f50]/10 p-1">
              <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff7f50]/10 data-[state=active]:to-[#ff7f50]/5">
                <User className="h-4 w-4 mr-2" strokeWidth={1.75} />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff7f50]/10 data-[state=active]:to-[#ff7f50]/5">
                <Settings className="h-4 w-4 mr-2" strokeWidth={1.75} />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff7f50]/10 data-[state=active]:to-[#ff7f50]/5">
                <Database className="h-4 w-4 mr-2" strokeWidth={1.75} />
                <span className="hidden sm:inline">Data</span>
              </TabsTrigger>
              <TabsTrigger value="danger" className="text-destructive data-[state=active]:text-destructive data-[state=active]:bg-gradient-to-r data-[state=active]:from-destructive/10 data-[state=active]:to-destructive/5">
                <Shield className="h-4 w-4 mr-2" strokeWidth={1.75} />
                <span className="hidden sm:inline">Danger</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
              <ProfileSection 
                userName={profile.userName} 
                email={profile.email}
                userId={profile.userId}
                setIsLoading={setIsLoading}
                updateProfile={updateProfile}
              />
            </TabsContent>
            
            <TabsContent value="preferences" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
              <PreferencesSection 
                userId={profile.userId}
                preferredUnit={profile.preferredUnit}
                timezone={profile.timezone}
                setIsLoading={setIsLoading}
                updateProfile={updateProfile}
              />
            </TabsContent>
            
            <TabsContent value="data" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
              <DataManagementSection 
                userId={profile.userId} 
                setIsLoading={setIsLoading} 
              />
            </TabsContent>
            
            <TabsContent value="danger" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
              <DangerZoneSection 
                userId={profile.userId}
                setIsLoading={setIsLoading} 
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
      <MobileNavigation />
    </div>
  );
};

export default Account;
