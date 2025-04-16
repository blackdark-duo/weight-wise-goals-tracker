
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AccountProfile from "@/components/account/AccountProfile";
import AccountPreferences from "@/components/account/AccountPreferences";
import AccountDataManagement from "@/components/account/AccountDataManagement";
import AccountDangerZone from "@/components/account/AccountDangerZone";

const Account = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const navigate = useNavigate();
  const { preferredUnit, timezone, updatePreferences } = useUserPreferences();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/signin');
          return;
        }
        
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
    <div className="min-h-screen bg-ui-background">
      <Navbar />
      <div className="container max-w-4xl pt-6 pb-24">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          Account Settings
          {isLoading && (
            <div className="animate-spin h-4 w-4 border-2 border-primary border-opacity-50 border-t-primary rounded-full"></div>
          )}
        </h1>
        
        {userName && (
          <div className="mb-6 text-muted-foreground">
            Welcome, {userName}
          </div>
        )}
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-4 md:w-auto w-full">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="danger" className="text-destructive">Danger Zone</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4">
            <AccountProfile 
              userName={userName} 
              setUserName={setUserName} 
              setIsLoading={setIsLoading} 
            />
          </TabsContent>
          
          <TabsContent value="preferences" className="space-y-4">
            <AccountPreferences 
              preferredUnit={preferredUnit}
              timezone={timezone}
              updatePreferences={updatePreferences}
              setIsLoading={setIsLoading}
            />
          </TabsContent>
          
          <TabsContent value="data" className="space-y-4">
            <AccountDataManagement setIsLoading={setIsLoading} />
          </TabsContent>
          
          <TabsContent value="danger" className="space-y-4">
            <AccountDangerZone setIsLoading={setIsLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Account;
