
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserPreferencesState {
  preferredUnit: string;
  timezone: string;
  loading: boolean;
  error: string | null;
}

interface UpdatePreferencesParams {
  preferredUnit?: string;
  timezone?: string;
}

export function useUserPreferences() {
  const [state, setState] = useState<UserPreferencesState>({
    preferredUnit: localStorage.getItem("preferredUnit") || "kg",
    timezone: localStorage.getItem("timezone") || "UTC",
    loading: true,
    error: null,
  });

  useEffect(() => {
    fetchPreferences();

    // Listen for storage events (in case preferences are updated in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "preferredUnit" && e.newValue) {
        setState(prev => ({ ...prev, preferredUnit: e.newValue || prev.preferredUnit }));
      }
      if (e.key === "timezone" && e.newValue) {
        setState(prev => ({ ...prev, timezone: e.newValue || prev.timezone }));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("preferred_unit, timezone")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          // Update state with fetched preferences
          const preferredUnit = data.preferred_unit || "kg";
          const timezone = data.timezone || "UTC";
          
          // Save to local storage for quick access
          localStorage.setItem("preferredUnit", preferredUnit);
          localStorage.setItem("timezone", timezone);
          
          setState({
            preferredUnit,
            timezone,
            loading: false,
            error: null
          });
        }
      } else {
        // Use defaults if not authenticated
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error: any) {
      console.error("Error fetching user preferences:", error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to load preferences"
      }));
    }
  };

  const updatePreferences = async (params: UpdatePreferencesParams) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const updates: any = {
        updated_at: new Date().toISOString()
      };
      
      if (params.preferredUnit !== undefined) {
        updates.preferred_unit = params.preferredUnit;
      }
      
      if (params.timezone !== undefined) {
        updates.timezone = params.timezone;
      }
      
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);
      
      if (error) throw error;
      
      // Update local state and storage
      if (params.preferredUnit !== undefined) {
        localStorage.setItem("preferredUnit", params.preferredUnit);
      }
      
      if (params.timezone !== undefined) {
        localStorage.setItem("timezone", params.timezone);
      }
      
      setState(prev => ({
        ...prev,
        preferredUnit: params.preferredUnit !== undefined ? params.preferredUnit : prev.preferredUnit,
        timezone: params.timezone !== undefined ? params.timezone : prev.timezone,
      }));
      
      return true;
    } catch (error: any) {
      console.error("Error updating preferences:", error);
      setState(prev => ({
        ...prev,
        error: error.message || "Failed to update preferences"
      }));
      return false;
    }
  };

  return {
    ...state,
    updatePreferences,
    refetchPreferences: fetchPreferences,
  };
}
