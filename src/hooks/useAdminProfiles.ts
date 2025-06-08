
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
        // Find matching profile or create a default profile object
        const profile = profileData?.find(p => p.id === authUser.id) || {
          id: authUser.id,
          display_name: undefined,
          preferred_unit: undefined,
          timezone: undefined,
          updated_at: undefined,
          webhook_limit: undefined,
          webhook_count: undefined,
          last_webhook_date: undefined,
          
          is_admin: undefined,
          is_suspended: undefined,
          show_ai_insights: undefined,
          scheduled_for_deletion: false,
          deletion_date: null
        };
        
        // Create a complete profile with all necessary properties
        const completeProfile: Profile = {
          id: authUser.id,
          email: authUser.email,
          created_at: authUser.created_at,
          display_name: profile.display_name,
          preferred_unit: profile.preferred_unit,
          timezone: profile.timezone,
          updated_at: profile.updated_at,
          webhook_limit: profile.webhook_limit,
          webhook_count: profile.webhook_count,
          last_webhook_date: profile.last_webhook_date,
          
          is_admin: profile.is_admin,
          is_suspended: profile.is_suspended,
          show_ai_insights: profile.show_ai_insights,
          scheduled_for_deletion: profile.scheduled_for_deletion || false,
          deletion_date: profile.deletion_date || null
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
  
  // Note: Webhook URLs are now centralized and no longer user-specific
  const updateWebhookUrl = async (profile: Profile, url: string) => {
    console.warn('Individual webhook URLs are deprecated. Use centralized webhook configuration instead.');
    toast.error('Individual webhook URLs are no longer supported. Use centralized configuration.');
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
