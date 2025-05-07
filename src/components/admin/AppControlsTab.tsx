
import React, { useEffect, useState } from 'react';
import WebhookSettings from './WebhookSettings';
import WebhookLogViewer from './WebhookLogViewer';
import WebhookTester from './webhook/WebhookTester';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/webhook';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface AppControlsTabProps {
  onRefreshUsers?: () => Promise<void>;
}

const AppControlsTab: React.FC<AppControlsTabProps> = ({ onRefreshUsers }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      // Fetch all auth users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      // Fetch profile data for all users
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profileError) throw profileError;

      // Combine auth and profile data
      const combinedProfiles = authUsers.users.map(authUser => {
        const profile = profileData?.find(p => p.id === authUser.id) || {};
        
        return {
          id: authUser.id,
          email: authUser.email,
          created_at: authUser.created_at,
          ...profile
        } as Profile;
      });
      
      setProfiles(combinedProfiles);
      toast.success("User profiles refreshed");
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Failed to fetch user profiles');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleRefresh = async () => {
    await fetchProfiles();
    if (onRefreshUsers) {
      await onRefreshUsers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Fetch All Users from DB
        </Button>
      </div>
      <WebhookTester profiles={profiles} onRefreshUsers={handleRefresh} />
      <WebhookSettings />
      <WebhookLogViewer />
    </div>
  );
};

export default AppControlsTab;
