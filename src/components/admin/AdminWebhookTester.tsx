
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Play, User, RefreshCw } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  display_name: string | null;
}

const AdminWebhookTester = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(true);
  const [requestPayload, setRequestPayload] = useState<any | null>(null);
  const [responseData, setResponseData] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsFetchingUsers(true);
      
      // Get auth users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;
      
      // Get profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name');
      if (profilesError) throw profilesError;
      
      // Combine data
      const combinedUsers = authUsers.users.map(user => {
        const profile = profiles?.find(p => p.id === user.id);
        return {
          id: user.id,
          email: user.email || "",
          display_name: profile?.display_name || user.email?.split('@')[0] || "Unknown"
        };
      });
      
      setUsers(combinedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsFetchingUsers(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user first");
      return;
    }

    try {
      setIsLoading(true);
      setResponseData(null);
      
      // Call the edge function with the selected user's token
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to test webhooks");
      }
      
      // Impersonate the selected user for this request
      const { data, error } = await supabase.functions.invoke('send_ai_insights', {
        body: { user_id: selectedUserId }
      });
      
      if (error) throw error;
      
      if (data && data.message) {
        setResponseData(data.message);
        toast.success("Webhook test completed successfully");
      }
      
      // Fetch user profile data to use in the request payload example
      const selectedUser = users.find(u => u.id === selectedUserId);
      const { data: profileData } = await supabase
        .from('profiles')
        .select('preferred_unit')
        .eq('id', selectedUserId)
        .single();
      
      // Sample weight entries
      const sampleEntries = {
        weight: [78.5, 78.2, 77.9, 77.5],
        notes: ["Started diet", "", "Went for a run", "Feeling good today"],
        dates: ["2025-05-01", "2025-05-02", "2025-05-03", "2025-05-04"]
      };
      
      // Create sample payload
      const payload = {
        user_id: selectedUserId,
        displayName: selectedUser?.display_name || "",
        email: selectedUser?.email || "",
        unit: profileData?.preferred_unit || "kg",
        goal_weight: 75.0,
        goal_days: 30,
        entries: sampleEntries
      };
      
      setRequestPayload(payload);
    } catch (error: any) {
      console.error("Error testing webhook:", error);
      toast.error(error.message || "Failed to test webhook");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Webhook Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-grow max-w-xs">
            <Select
              disabled={isFetchingUsers}
              value={selectedUserId || ""}
              onValueChange={setSelectedUserId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span>{user.display_name} ({user.email})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchUsers} 
            disabled={isFetchingUsers}
          >
            <RefreshCw className={`h-4 w-4 ${isFetchingUsers ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button 
            onClick={handleTestWebhook} 
            disabled={isLoading || !selectedUserId}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Testing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Test Webhook
              </>
            )}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requestPayload && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Request Payload</h3>
              <div className="bg-muted rounded-md p-4 overflow-auto max-h-[400px]">
                <pre className="text-xs whitespace-pre-wrap">
                  {JSON.stringify(requestPayload, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          {responseData && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">HTML Response</h3>
              <div className="bg-muted rounded-md p-4 overflow-auto max-h-[400px]">
                <iframe
                  srcDoc={responseData}
                  className="w-full h-[350px] border-0"
                  title="Webhook Response"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminWebhookTester;
