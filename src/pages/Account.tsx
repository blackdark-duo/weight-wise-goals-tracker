
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Cog, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import MobileNavigation from "@/components/MobileNavigation";
import ProfileSection from "@/components/account/ProfileSection";
import PreferencesSection from "@/components/account/PreferencesSection";
import AccountActions from "@/components/account/AccountActions";

const Account = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [preferredUnit, setPreferredUnit] = useState("kg");
  const [timezone, setTimezone] = useState("UTC");
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        navigate("/signin");
        return;
      }

      setUserId(user?.id);
      setEmail(user?.email);

      // Get profile details
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      } else if (profile) {
        setUserName(profile.display_name);
        setPreferredUnit(profile.preferred_unit || "kg");
        setTimezone(profile.timezone || "UTC");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (data: { userName?: string | null, preferredUnit?: string, timezone?: string }) => {
    if (data.userName !== undefined) setUserName(data.userName);
    if (data.preferredUnit !== undefined) setPreferredUnit(data.preferredUnit);
    if (data.timezone !== undefined) setTimezone(data.timezone);
  };

  return (
    <>
      <Navbar />
      <div className="container py-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold mb-6">My Account</h1>

          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full space-y-6"
          >
            <div className="flex justify-center mb-6">
              <TabsList>
                <TabsTrigger value="profile" className="flex gap-2 items-center">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex gap-2 items-center">
                  <Settings className="h-4 w-4" />
                  Preferences
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="profile" className="space-y-6">
              <ProfileSection 
                userName={userName}
                email={email}
                userId={userId}
                setIsLoading={setIsLoading}
                updateProfile={updateProfile}
              />
              
              <AccountActions userId={userId} />
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <PreferencesSection 
                userId={userId}
                preferredUnit={preferredUnit}
                timezone={timezone}
                setIsLoading={setIsLoading}
                updateProfile={updateProfile}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <MobileNavigation />
      <Toaster />
    </>
  );
};

export default Account;
