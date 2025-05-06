
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { formatInsightsText } from "@/utils/insightsFormatter";
import { Textarea } from "@/components/ui/textarea";
import { fetchWebhookConfig } from "@/services/webhookService";

interface WebhookTesterProps {
  profiles: any[];
  onRefreshUsers?: () => Promise<void>;
}

const WebhookTester: React.FC<WebhookTesterProps> = ({ profiles, onRefreshUsers }) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestPayload, setRequestPayload] = useState<any | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [formattedResponse, setFormattedResponse] = useState<string | null>(null);

  const fetchUserData = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user first");
      return;
    }

    setIsLoading(true);
    setRequestPayload(null);
    setResponse(null);
    setFormattedResponse(null);

    try {
      // Get webhook configuration
      const webhookConfig = await fetchWebhookConfig();
      
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

      // Format data according to the standardized JSON structure
      const payload: any = {
        account_id: selectedUserId,
        user_id: selectedUserId,
        unit: profileData?.preferred_unit || "kg",
        entries: {
          weight: entries ? entries.map(entry => entry.weight) : [],
          notes: entries ? entries.map(entry => entry.description || "") : [],
          dates: entries ? entries.map(entry => entry.date) : []
        }
      };
      
      // Add configurable fields based on webhook configuration
      if (webhookConfig.include_account_fields) {
        payload.email = profileData?.email || "";
      }
      
      if (webhookConfig.fields.goal_data && goals && goals.length > 0) {
        payload.goal_weight = goals[0].target_weight;
        payload.goal_days = goals[0].target_date ? 
          Math.ceil((new Date(goals[0].target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 30;
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
      // Get webhook URL from profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("webhook_url, webhook_count")
        .eq("id", selectedUserId)
        .single();

      if (profileError) throw new Error("Failed to fetch webhook URL");
      
      const webhookUrl = profileData?.webhook_url || 'http://n8n.cozyapp.uno:5678/webhook-test/36e520c4-f7a4-4872-8e21-e469701eb68e';

      // Create webhook log entry
      const { data: webhookLog, error: webhookLogError } = await supabase
        .from("webhook_logs")
        .insert({
          user_id: selectedUserId,
          request_payload: requestPayload,
          url: webhookUrl,
          status: 'pending'
        })
        .select('id')
        .single();
        
      if (webhookLogError) {
        console.error("Error creating webhook log:", webhookLogError);
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

      // Get plain text response - important: clone the response before reading it
      const responseClone = webhookResponse.clone();
      const responseText = await responseClone.text();
      setResponse(responseText);
      
      // Format the response for display
      const formatted = formatInsightsText(responseText);
      setFormattedResponse(formatted);

      // Update webhook log with response
      if (webhookLog?.id) {
        await supabase
          .from("webhook_logs")
          .update({
            response_payload: responseText,
            status: 'success'
          })
          .eq("id", webhookLog.id);
      }

      toast.success("Webhook request completed successfully");
      
      // Update webhook count in profile
      const currentCount = profileData?.webhook_count || 0;
      
      await supabase
        .from("profiles")
        .update({ 
          webhook_count: currentCount + 1,
          last_webhook_date: new Date().toISOString()
        })
        .eq("id", selectedUserId);
        
    } catch (error: any) {
      console.error("Error sending to webhook:", error);
      
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
      
      toast.error(error.message || "Failed to send data to webhook");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Webhook Tester
        </CardTitle>
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
            Fetch Data
          </Button>
          
          <Button 
            onClick={sendToWebhook} 
            disabled={!requestPayload || isLoading}
          >
            <Play className="mr-2 h-4 w-4" />
            Test Webhook
          </Button>
          
          {onRefreshUsers && (
            <Button 
              onClick={onRefreshUsers}
              variant="outline"
              className="ml-auto"
            >
              Refresh User List
            </Button>
          )}
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
          <div>
            <div className="border rounded-md p-4 mb-4">
              <h3 className="text-sm font-medium mb-2">Raw Response:</h3>
              <Textarea 
                value={response}
                readOnly
                className="text-xs bg-muted min-h-[100px] max-h-[200px] overflow-auto"
              />
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                Formatted Response
                <Badge className="bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30">AI Generated</Badge>
              </h3>
              {formattedResponse && (
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: formattedResponse }} />
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WebhookTester;
