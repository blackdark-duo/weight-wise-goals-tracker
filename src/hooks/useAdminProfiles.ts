
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Profile } from '@/types/webhook';

export { type Profile } from '@/types/webhook';

export const useAdminProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch all user profiles including those with unverified emails
  const fetchProfiles = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get the current user ID for checking admin status
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }

      // Fetch all auth users (including unverified ones)
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      // Fetch profile data for all users
      const { data: profileData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) throw profilesError;

      // Combine auth and profile data
      const combinedProfiles = authUsers.users.map(authUser => {
        // Find matching profile or create empty object
        const profile = profileData?.find(p => p.id === authUser.id) || {};
        
        // Create a complete profile with all necessary properties
        const completeProfile: Profile = {
          id: authUser.id,
          email: authUser.email,
          created_at: authUser.created_at,
          display_name: profile.display_name as string | undefined,
          preferred_unit: profile.preferred_unit as string | undefined,
          timezone: profile.timezone as string | undefined,
          updated_at: profile.updated_at as string | undefined,
          webhook_limit: profile.webhook_limit as number | undefined,
          webhook_count: profile.webhook_count as number | undefined,
          last_webhook_date: profile.last_webhook_date as string | undefined,
          webhook_url: profile.webhook_url as string | undefined,
          is_admin: profile.is_admin as boolean | undefined,
          is_suspended: profile.is_suspended as boolean | undefined,
          show_ai_insights: profile.show_ai_insights as boolean | undefined,
          // Explicitly type these properties from the profile object
          scheduled_for_deletion: profile.scheduled_for_deletion as boolean | undefined || false,
          deletion_date: profile.deletion_date as string | null | undefined || null
        };
        
        return completeProfile;
      });
      
      setProfiles(combinedProfiles);
    } catch (err: any) {
      console.error('Error fetching profiles:', err);
      setError(err.message || 'Failed to fetch user profiles');
      toast.error('Failed to load user profiles');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle admin status for a user
  const toggleAdminStatus = async (profile: Profile) => {
    if (!currentUserId) return;
    
    try {
      // Don't allow removing admin status from yourself
      if (profile.id === currentUserId && profile.is_admin) {
        toast.error('You cannot remove your own admin status');
        return;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !profile.is_admin })
        .eq('id', profile.id);
        
      if (error) throw error;
      
      await fetchProfiles();
      toast.success(`Admin status ${profile.is_admin ? 'revoked from' : 'granted to'} ${profile.display_name || profile.email}`);
    } catch (err: any) {
      console.error('Error toggling admin status:', err);
      toast.error('Failed to update admin status');
    }
  };
  
  // Update webhook limit for a user
  const updateWebhookLimit = async (profile: Profile, limit: number) => {
    if (!currentUserId) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ webhook_limit: limit })
        .eq('id', profile.id);
        
      if (error) throw error;
      
      await fetchProfiles();
      toast.success(`Updated webhook limit for ${profile.display_name || profile.email}`);
    } catch (err: any) {
      console.error('Error updating webhook limit:', err);
      toast.error('Failed to update webhook limit');
    }
  };
  
  // Update webhook URL for a user
  const updateWebhookUrl = async (profile: Profile, url: string) => {
    if (!currentUserId) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ webhook_url: url })
        .eq('id', profile.id);
        
      if (error) throw error;
      
      await fetchProfiles();
      toast.success(`Updated webhook URL for ${profile.display_name || profile.email}`);
    } catch (err: any) {
      console.error('Error updating webhook URL:', err);
      toast.error('Failed to update webhook URL');
    }
  };
  
  // Toggle AI insights visibility for a user
  const toggleAIInsightsVisibility = async (profile: Profile) => {
    if (!currentUserId) return;
    
    try {
      const currentValue = profile.show_ai_insights === undefined ? true : profile.show_ai_insights;
      
      const { error } = await supabase
        .from('profiles')
        .update({ show_ai_insights: !currentValue })
        .eq('id', profile.id);
        
      if (error) throw error;
      
      await fetchProfiles();
      toast.success(`AI Insights ${currentValue ? 'disabled' : 'enabled'} for ${profile.display_name || profile.email}`);
    } catch (err: any) {
      console.error('Error toggling AI insights visibility:', err);
      toast.error('Failed to update AI insights visibility');
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchProfiles();
  }, []);

  return {
    profiles,
    isLoading,
    error,
    fetchProfiles,
    toggleAdminStatus,
    updateWebhookLimit,
    updateWebhookUrl,
    toggleAIInsightsVisibility
  };
};
