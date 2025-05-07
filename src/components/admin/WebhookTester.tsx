
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Webhook, Play, User } from "lucide-react";
import { Profile } from "@/hooks/useAdminProfiles";

interface WebhookTesterProps {
  profiles: Profile[];
  onRefreshUsers?: () => Promise<void>;
}

interface WebhookFields {
  user_data: boolean;
  weight_data: boolean;
  goal_data: boolean;
  activity_data: boolean;
  detailed_analysis: boolean;
}

const WebhookTester: React.FC<WebhookTesterProps> = ({ profiles, onRefreshUsers }) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestPayload, setRequestPayload] = useState<any | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  const parseWebhookFields = (fieldsJson: any): WebhookFields => {
    // Default values
    const defaultFields = {
      user_data: true,
      weight_data: true,
      goal_data: true,
      activity_data: false,
      detailed_analysis: false
    };
    
    if (!fieldsJson) return defaultFields;
    
    try {
      // If it's a string, try to parse it
      if (typeof fieldsJson === 'string') {
        const parsed = JSON.parse(fieldsJson);
        return {
          user_data: Boolean(parsed.user_data ?? true),
          weight_data: Boolean(parsed.weight_data ?? true),
          goal_data: Boolean(parsed.goal_data ?? true),
          activity_data: Boolean(parsed.activity_data ?? false),
          detailed_analysis: Boolean(parsed.detailed_analysis ?? false)
        };
      }
      
      // If it's already an object
      if (typeof fieldsJson === 'object' && fieldsJson !== null && !Array.isArray(fieldsJson)) {
        return {
          user_data: Boolean(fieldsJson.user_data ?? true),
          weight_data: Boolean(fieldsJson.weight_data ?? true),
          goal_data: Boolean(fieldsJson.goal_data ?? true),
          activity_data: Boolean(fieldsJson.activity_data ?? false),
          detailed_analysis: Boolean(fieldsJson.detailed_analysis ?? false)
        };
      }
    } catch (error) {
      console.error("Error parsing webhook fields:", error);
    }
    
    return defaultFields;
  };

  const fetchUserData = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user first");
      return;
    }

    setIsLoading(true);
    setRequestPayload(null);
    setResponse(null);

    try {
      // Get webhook configuration
      const { data: webhookConfig, error: configError } = await supabase
        .from('webhook_config')
        .select('*')
        .single();

      if (configError) throw new Error("Failed to fetch webhook configuration");
      
      // Get user profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", selectedUserId)
        .single();

      if (profileError) throw new Error("Failed to fetch user profile");

      // Get weight entries based on configured days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - (webhookConfig.days || 30));
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

      const { data: entries, error: entriesError } = await supabase
        .from("weight_entries")
        .select("*")
        .eq("user_id", selectedUserId)
        .gte("date", thirtyDaysAgoStr)
        .order("date", { ascending: true });

      if (entriesError) throw new Error("Failed to fetch weight entries");
      
      // Get user's latest goal
      const { data: goals, error: goalsError } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", selectedUserId)
        .order("created_at", { ascending: false })
        .limit(1);
        
      if (goalsError) throw new Error("Failed to fetch goals");

      // Format data for webhook - new format as requested
      const payload = {
        user_id: selectedUserId,
        displayName: profileData?.display_name || "",
        email: profileData?.email || "",
        unit: profileData?.preferred_unit || "kg",
        entries: {
          weight: entries ? entries.map(entry => entry.weight) : [],
          notes: entries ? entries.map(entry => entry.description || "") : [],
          dates: entries ? entries.map(entry => entry.date) : []
        }
      };
      
      // Add goal data if available
      if (goals && goals.length > 0) {
        payload.goal_weight = goals[0].target_weight;
        
        if (goals[0].target_date) {
          const targetDate = new Date(goals[0].target_date);
          const today = new Date();
          const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          payload.goal_days = daysRemaining > 0 ? daysRemaining : 0;
        }
      }

      setRequestPayload(payload);
      toast.success("User data fetched successfully");
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      toast.error(error.message || "Failed to fetch user data");
    } finally {
      setIsLoading(false);
    }
  };

  const sendToWebhook = async () => {
    if (!requestPayload || !selectedUserId) {
      toast.error("Please fetch user data first");
      return;
    }

    setIsLoading(true);
    try {
      // Get webhook URL from config (admin webhook)
      const { data: webhookConfig, error: configError } = await supabase
        .from('webhook_config')
        .select('url')
        .single();

      if (configError) throw new Error("Failed to fetch webhook configuration");
      
      const webhookUrl = webhookConfig.url;
      
      if (!webhookUrl) {
        throw new Error("No webhook URL configured");
      }

      // Create webhook log entry
      const { data: logData, error: logError } = await supabase
        .from("webhook_logs")
        .insert({
          user_id: selectedUserId,
          request_payload: requestPayload,
          url: webhookUrl,
          status: 'pending'
        })
        .select('id')
        .single();
        
      if (logError) {
        console.error("Error creating webhook log:", logError);
      }

      toast.info("Sending data to webhook...");
      
      // Send request to webhook
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook returned ${webhookResponse.status}`);
      }

      // Get response
      const responseText = await webhookResponse.text();
      setResponse(responseText);

      // Update webhook log
      if (logData?.id) {
        await supabase
          .from("webhook_logs")
          .update({
            response_payload: responseText,
            status: 'success'
          })
          .eq("id", logData.id);
      }

      // Update webhook count in profile
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("webhook_count")
        .eq("id", selectedUserId)
        .single();
        
      const currentCount = currentProfile?.webhook_count || 0;
      
      await supabase
        .from("profiles")
        .update({ 
          webhook_count: currentCount + 1,
          last_webhook_date: new Date().toISOString()
        })
        .eq("id", selectedUserId);
        
      toast.success("Webhook request completed successfully");
      
      // Refresh users data if needed
      if (onRefreshUsers) {
        await onRefreshUsers();
      }
    } catch (error: any) {
      console.error("Error sending to webhook:", error);
      toast.error(error.message || "Failed to send data to webhook");
      
      // Update webhook log with error
      if (selectedUserId) {
        const { data: lastLog } = await supabase
          .from("webhook_logs")
          .select("id")
          .eq("user_id", selectedUserId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
          
        if (lastLog?.id) {
          await supabase
            .from("webhook_logs")
            .update({
              status: 'error',
              response_payload: error.message || "Failed to send data to webhook"
            })
            .eq("id", lastLog.id);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Webhook Tester
        </CardTitle>
        <CardDescription>
          Test webhook functionality with real user data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <Select 
            onValueChange={(value) => setSelectedUserId(value)} 
            disabled={isLoading}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{profile.display_name || profile.email || "Unknown User"}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={fetchUserData} 
            disabled={!selectedUserId || isLoading}
            variant="outline"
          >
            Fetch User Data
          </Button>
          
          <Button 
            onClick={sendToWebhook} 
            disabled={!requestPayload || isLoading}
          >
            <Play className="mr-2 h-4 w-4" />
            Test Webhook
          </Button>
        </div>
        
        {requestPayload && (
          <div className="border rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">Request Payload:</h3>
            <pre className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-[200px]">
              {JSON.stringify(requestPayload, null, 2)}
            </pre>
          </div>
        )}
        
        {response && (
          <div className="border rounded-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium">Response:</h3>
              <Badge>
                Webhook Response
              </Badge>
            </div>
            <div className="bg-white p-2 rounded-md overflow-auto max-h-[300px] border">
              <iframe
                srcDoc={response}
                className="w-full h-[200px] border-0"
                title="Webhook Response"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WebhookTester;
