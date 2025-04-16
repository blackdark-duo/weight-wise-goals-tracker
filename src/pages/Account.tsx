
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import AccountManagement from "@/components/AccountManagement";
import { supabase } from "@/integrations/supabase/client";

const Account = () => {
  const [userName, setUserName] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
            
          if (data && data.display_name) {
            setUserName(data.display_name);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    
    fetchUserProfile();
  }, []);

  return (
    <div className="min-h-screen pb-16 md:pb-0 bg-ui-background">
      <Navbar />
      <div className="container pt-6 pb-24">
        <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
        
        {userName && (
          <div className="mb-4 text-muted-foreground">
            Welcome, {userName}
          </div>
        )}
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountManagement />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Account;
