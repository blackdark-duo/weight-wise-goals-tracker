
import React, { useEffect, useState } from 'react';
import WebhookSettings from './WebhookSettings';
import WebhookLogViewer from './WebhookLogViewer';
import WebhookTester from './WebhookTester';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/hooks/useAdminProfiles';

const AppControlsTab: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  
  useEffect(() => {
    const fetchProfiles = async () => {
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
          };
        });
        
        setProfiles(combinedProfiles);
      } catch (error) {
        console.error('Error fetching profiles:', error);
      }
    };
    
    fetchProfiles();
  }, []);

  return (
    <div className="space-y-6">
      <WebhookTester profiles={profiles} />
      <WebhookSettings onUpdate={() => console.log('Webhook settings updated')} />
      <WebhookLogViewer />
    </div>
  );
};

export default AppControlsTab;
