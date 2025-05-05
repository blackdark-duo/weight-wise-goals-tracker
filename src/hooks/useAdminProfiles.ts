
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Profile {
  id: string;
  display_name: string;
  email?: string;
  is_admin?: boolean;
  webhook_limit?: number;
  is_suspended?: boolean;
  created_at?: string;
  preferred_unit?: string;
  timezone?: string;
  updated_at?: string;
  webhook_count?: number;
  webhook_url?: string;
  last_webhook_date?: string;
  show_ai_insights?: boolean;
}

export const useAdminProfiles = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return;
      }

      // Get user profile to check admin status
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to verify admin status");
        return;
      }

      if (profile && profile.is_admin) {
        setIsAdmin(true);
        fetchProfiles();
      } else if (session.user.email === "admin@cozyweight.com") {
        // For demo purposes, also allow the default admin
        setIsAdmin(true);
        fetchProfiles();
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      toast.error("Authentication error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
          .select('id, email');  // Now we're selecting email from profiles
          
        if (!usersError && data) {
          setProfiles(profiles);
        } else {
          // If we can't get emails, just use the profiles as is
          setProfiles(profiles);
        }
      } catch (error) {
        console.error("Error fetching user emails:", error);
        setProfiles(profiles);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast.error("Failed to load user profiles");
    }
  };

  return { profiles, isLoading, isAdmin, fetchProfiles };
};
