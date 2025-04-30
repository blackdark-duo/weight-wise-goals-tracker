
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Users, User, Settings, Webhook, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import MobileNavigation from "@/components/MobileNavigation";
import { Toaster } from "@/components/ui/toaster";

interface Profile {
  id: string;
  display_name: string;
  is_admin?: boolean;
  webhook_limit?: number;
}

interface WebhookConfig {
  url: string;
  days: number;
  fields: {
    user_data: boolean;
    weight_data: boolean;
    goal_data: boolean;
    activity_data: boolean;
    detailed_analysis: boolean;
  }
}

const Admin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({
    url: "",
    days: 30,
    fields: {
      user_data: true,
      weight_data: true,
      goal_data: true,
      activity_data: false,
      detailed_analysis: false
    }
  });

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
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", session.user.id)
          .single();

        if (profile && profile.is_admin) {
          setIsAdmin(true);
          fetchProfiles();
          fetchWebhookConfig();
        } else if (session.user.email === "admin@weightwise.com") {
          // For demo purposes, also allow the default admin
          setIsAdmin(true);
          fetchProfiles();
          fetchWebhookConfig();
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
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("display_name");

      if (error) throw error;
      
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast.error("Failed to load user profiles");
    }
  };

  const fetchWebhookConfig = async () => {
    try {
      // Use raw SQL query for the webhook_config table until we update the types
      const { data, error } = await supabase
        .rpc('get_webhook_config');

      if (error) {
        throw error;
      }
      
      if (data) {
        setWebhookConfig({
          url: data.url || "",
          days: data.days || 30,
          fields: data.fields || {
            user_data: true,
            weight_data: true,
            goal_data: true,
            activity_data: false,
            detailed_analysis: false
          }
        });
      }
    } catch (error) {
      console.error("Error fetching webhook config:", error);
      toast.error("Failed to load webhook configuration");
      
      // Use default values if we can't fetch
      setWebhookConfig({
        url: "http://n8n.cozyapp.uno:5678/webhook-test/36e520c4-f7a4-4872-8e21-e469701eb68e",
        days: 30,
        fields: {
          user_data: true,
          weight_data: true,
          goal_data: true,
          activity_data: false,
          detailed_analysis: false
        }
      });
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
      
      setProfiles(profiles.map(p => 
        p.id === profile.id ? { ...p, is_admin: newStatus } : p
      ));
      
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
      
      setProfiles(profiles.map(p => 
        p.id === profile.id ? { ...p, webhook_limit: limit } : p
      ));
      
      toast.success(`Updated webhook limit for ${profile.display_name}`);
    } catch (error) {
      console.error("Error updating webhook limit:", error);
      toast.error("Failed to update webhook limit");
    }
  };

  const saveWebhookConfig = async () => {
    try {
      // Use raw SQL for updating the webhook_config table
      const { error } = await supabase
        .rpc('update_webhook_config', {
          config_url: webhookConfig.url,
          config_days: webhookConfig.days,
          config_fields: webhookConfig.fields
        });
      
      if (error) throw error;
      
      toast.success("Webhook configuration saved successfully");
    } catch (error) {
      console.error("Error saving webhook config:", error);
      toast.error("Failed to save webhook configuration");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
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
        <Button onClick={() => navigate("/dashboard")}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ui-background">
      <Navbar />
      <div className="container px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 flex items-center">
          <Settings className="mr-2 h-8 w-8 text-purple-600" />
          Admin Dashboard
        </h1>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="users" className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="webhook" className="flex items-center">
              <Webhook className="mr-2 h-5 w-5" />
              Webhook Configuration
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  User Profiles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left">User</th>
                        <th className="px-4 py-3 text-left">Admin Status</th>
                        <th className="px-4 py-3 text-left">Webhook Limit</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.map((profile) => (
                        <tr key={profile.id} className="border-b">
                          <td className="px-4 py-3 flex items-center">
                            <User className="h-5 w-5 mr-2 text-muted-foreground" />
                            {profile.display_name}
                          </td>
                          <td className="px-4 py-3">
                            <Checkbox 
                              checked={!!profile.is_admin} 
                              onCheckedChange={() => toggleAdminStatus(profile)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input 
                              type="number" 
                              min="0" 
                              max="100" 
                              className="w-24" 
                              value={profile.webhook_limit || 0} 
                              onChange={(e) => updateWebhookLimit(profile, parseInt(e.target.value))}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="mr-2"
                              onClick={() => updateWebhookLimit(profile, profile.webhook_limit || 0)}
                            >
                              Update Limit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="webhook" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <Webhook className="mr-2 h-5 w-5" />
                  Webhook Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input 
                    id="webhookUrl" 
                    value={webhookConfig.url} 
                    onChange={(e) => setWebhookConfig({...webhookConfig, url: e.target.value})}
                    placeholder="https://your-webhook-endpoint.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="days">Data Range (Days)</Label>
                    <span className="text-sm text-muted-foreground">{webhookConfig.days} days</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Input 
                      id="days" 
                      type="range" 
                      min="1" 
                      max="365" 
                      value={webhookConfig.days} 
                      onChange={(e) => setWebhookConfig({...webhookConfig, days: parseInt(e.target.value)})}
                      className="flex-1"
                    />
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setWebhookConfig({...webhookConfig, days: 30})}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        30d
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setWebhookConfig({...webhookConfig, days: 90})}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        90d
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setWebhookConfig({...webhookConfig, days: 365})}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        1y
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Data to Include</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="userData" 
                        checked={webhookConfig.fields.user_data}
                        onCheckedChange={(checked) => 
                          setWebhookConfig({
                            ...webhookConfig, 
                            fields: {...webhookConfig.fields, user_data: !!checked}
                          })
                        }
                      />
                      <Label htmlFor="userData">User Data (Name, Email)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="weightData" 
                        checked={webhookConfig.fields.weight_data}
                        onCheckedChange={(checked) => 
                          setWebhookConfig({
                            ...webhookConfig, 
                            fields: {...webhookConfig.fields, weight_data: !!checked}
                          })
                        }
                      />
                      <Label htmlFor="weightData">Weight History</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="goalData" 
                        checked={webhookConfig.fields.goal_data}
                        onCheckedChange={(checked) => 
                          setWebhookConfig({
                            ...webhookConfig, 
                            fields: {...webhookConfig.fields, goal_data: !!checked}
                          })
                        }
                      />
                      <Label htmlFor="goalData">Goal Information</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="activityData" 
                        checked={webhookConfig.fields.activity_data}
                        onCheckedChange={(checked) => 
                          setWebhookConfig({
                            ...webhookConfig, 
                            fields: {...webhookConfig.fields, activity_data: !!checked}
                          })
                        }
                      />
                      <Label htmlFor="activityData">Activity Data</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="detailedAnalysis" 
                        checked={webhookConfig.fields.detailed_analysis}
                        onCheckedChange={(checked) => 
                          setWebhookConfig({
                            ...webhookConfig, 
                            fields: {...webhookConfig.fields, detailed_analysis: !!checked}
                          })
                        }
                      />
                      <Label htmlFor="detailedAnalysis">Detailed Analysis</Label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600"
                    onClick={saveWebhookConfig}
                  >
                    Save Webhook Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <MobileNavigation />
      <Toaster />
    </div>
  );
};

export default Admin;
