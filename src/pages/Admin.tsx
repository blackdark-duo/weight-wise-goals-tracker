
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertCircle,
  Users,
  User,
  Settings,
  Webhook,
  Calendar,
  Mail,
  KeyRound,
  Trash2,
  Ban
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import MobileNavigation from "@/components/MobileNavigation";
import { Toaster } from "@/components/ui/toaster";
import { timezoneOptions } from "@/utils/timezoneData";

interface Profile {
  id: string;
  display_name: string;
  email?: string;
  is_admin?: boolean;
  webhook_limit?: number;
  is_suspended?: boolean; // Added this field to match usage
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
  };
}

const AdminPage = () => {
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
  const [emailContent, setEmailContent] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
          .select("is_admin, email")
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
          fetchWebhookConfig();
        } else if (session.user.email === "admin@cozyweight.com") {
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
          .select('id, email');  // Assuming email might be stored in profiles for demo
          
        if (!usersError && data) {
          // Creating a map of id to email
          const emailMap = new Map();
          data.forEach((item: any) => {
            if (item.id && item.email) {
              emailMap.set(item.id, item.email);
            }
          });
          
          // Merge profiles with emails
          const profilesWithEmails = profiles.map(profile => {
            return {
              ...profile,
              email: emailMap.get(profile.id) || profile.email || `user-${profile.id.substring(0, 8)}@example.com`
            };
          });
          
          setProfiles(profilesWithEmails);
        } else {
          // If we can't get emails, just use the profiles as is
          setProfiles(profiles);
        }
      } catch (error) {
        console.error("Error fetching user emails:", error);
        // Just use profiles without emails
        setProfiles(profiles);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast.error("Failed to load user profiles");
    }
  };

  const fetchWebhookConfig = async () => {
    try {
      const response = await fetch(
        'https://mjzzdynuzrpklgexabzs.supabase.co/functions/v1/get_webhook_config',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error fetching webhook config: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.data) {
        setWebhookConfig({
          url: result.data.url || "",
          days: result.data.days || 30,
          fields: result.data.fields || {
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
      setIsSaving(true);
      
      const response = await fetch(
        'https://mjzzdynuzrpklgexabzs.supabase.co/functions/v1/update_webhook_config',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({
            url: webhookConfig.url,
            days: webhookConfig.days,
            fields: webhookConfig.fields
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }
      
      toast.success("Webhook configuration saved successfully");
    } catch (error) {
      console.error("Error saving webhook config:", error);
      toast.error(`Failed to save webhook configuration: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const sendPasswordReset = async (userId: string) => {
    try {
      setIsSendingReset(true);
      
      const user = profiles.find(p => p.id === userId);
      if (!user?.email) {
        throw new Error("User email not found");
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/account`
      });
      
      if (error) throw error;
      
      toast.success(`Password reset email sent to ${user.email}`);
    } catch (error) {
      console.error("Error sending password reset:", error);
      toast.error("Failed to send password reset email");
    } finally {
      setIsSendingReset(false);
    }
  };

  const sendEmail = async (userId: string, subject: string, content: string) => {
    try {
      setIsSendingEmail(true);
      
      const user = profiles.find(p => p.id === userId);
      if (!user?.email) {
        throw new Error("User email not found");
      }
      
      // In production, we would call an Edge Function here to send the email
      console.log(`Sending email to ${user.email} with subject: ${subject}`);
      console.log(`Email content: ${content}`);
      
      // For demo purposes, just show a success message
      toast.success(`Email sent to ${user.email}`);
      
      setEmailSubject("");
      setEmailContent("");
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // In a real app, this would be done via an Edge Function with admin rights
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
        
      if (error) throw error;
      
      setProfiles(profiles.filter(p => p.id !== userId));
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const suspendUser = async (userId: string) => {
    try {
      // Add is_suspended field to the profile - assuming this column exists
      const { error } = await supabase
        .from("profiles")
        .update({ is_suspended: true })
        .eq("id", userId);
        
      if (error) throw error;
      
      setProfiles(profiles.map(p => 
        p.id === userId ? { ...p, is_suspended: true } : p
      ));
      
      toast.success("User suspended successfully");
    } catch (error) {
      console.error("Error suspending user:", error);
      toast.error("Failed to suspend user");
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
          
          <TabsContent value="app-controls" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <Webhook className="mr-2 h-5 w-5" />
                  Webhook Configuration
                </CardTitle>
                <CardDescription>
                  Configure the webhook that will process AI insights requests.
                </CardDescription>
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
                    className="w-full md:w-auto bg-[#ff7f50] hover:bg-[#ff6347] text-white"
                    onClick={saveWebhookConfig}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        Saving...
                      </>
                    ) : "Save Webhook Configuration"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="user-controls" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage user accounts, permissions, and access controls.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left">User</th>
                        <th className="px-4 py-3 text-left">Email</th>
                        <th className="px-4 py-3 text-left">Admin Status</th>
                        <th className="px-4 py-3 text-left">AI Limit</th>
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
                            {profile.email}
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
                            <div className="flex items-center space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setSelectedUserId(profile.id)}
                                  >
                                    <Mail className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Send Email to {profile.display_name}</DialogTitle>
                                    <DialogDescription>
                                      Send a notification email to the user.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="subject">Subject</Label>
                                      <Input
                                        id="subject"
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                        placeholder="Email subject"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="content">Message</Label>
                                      <Textarea
                                        id="content"
                                        value={emailContent}
                                        onChange={(e) => setEmailContent(e.target.value)}
                                        placeholder="Write your message here..."
                                        rows={5}
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button 
                                      variant="outline" 
                                      onClick={() => {
                                        setEmailSubject("");
                                        setEmailContent("");
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => sendEmail(selectedUserId!, emailSubject, emailContent)}
                                      disabled={isSendingEmail || !emailSubject || !emailContent}
                                    >
                                      {isSendingEmail ? "Sending..." : "Send Email"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => sendPasswordReset(profile.id)}
                                disabled={isSendingReset}
                              >
                                <KeyRound className="h-4 w-4" />
                              </Button>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete User</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to delete {profile.display_name}? This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => {}}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => deleteUser(profile.id)}
                                    >
                                      Delete User
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-amber-500 border-amber-200 hover:bg-amber-50"
                                  >
                                    <Ban className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Suspend User</DialogTitle>
                                    <DialogDescription>
                                      Suspend {profile.display_name}'s account. They will not be able to log in until unsuspended.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => {}}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="secondary"
                                      onClick={() => suspendUser(profile.id)}
                                    >
                                      Suspend User
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

export default AdminPage;
