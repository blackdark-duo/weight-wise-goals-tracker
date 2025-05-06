
import React, { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserPreferences {
  preferredUnit: string;
  timezone: string;
  isLoading: boolean;
  updatePreferences: (prefs: Partial<Omit<UserPreferences, "isLoading" | "updatePreferences">>) => Promise<void>;
}

const defaultPreferences: UserPreferences = {
  preferredUnit: "kg",
  timezone: "UTC",
  isLoading: true,
  updatePreferences: async () => {}
};

const UserPreferencesContext = createContext<UserPreferences>(defaultPreferences);

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<Omit<UserPreferences, "updatePreferences">>({
    preferredUnit: "kg",
    timezone: "UTC",
    isLoading: true
  });
  
  // Load preferences from DB on mount
  useEffect(() => {
    let mounted = true;
    
    const loadPreferences = async () => {
      try {
        // First get from localStorage for immediate response
        const storedUnit = localStorage.getItem("preferredUnit");
        if (storedUnit && mounted) {
          setPreferences(prev => ({
            ...prev,
            preferredUnit: storedUnit
          }));
        }
        
        // Then get from DB for accurate data
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && mounted) {
          const { data, error } = await supabase
            .from("profiles")
            .select("preferred_unit, timezone")
            .eq("id", user.id)
            .maybeSingle();
            
          if (data && !error && mounted) {
            const updatedPreferences = {
              preferredUnit: data.preferred_unit || "kg",
              timezone: data.timezone || "UTC",
              isLoading: false
            };
            
            setPreferences(updatedPreferences);
            
            // Update localStorage with the correct DB value
            localStorage.setItem("preferredUnit", updatedPreferences.preferredUnit);
          } else if (mounted) {
            setPreferences(prev => ({ ...prev, isLoading: false }));
          }
        } else if (mounted) {
          setPreferences(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
        if (mounted) {
          setPreferences(prev => ({ ...prev, isLoading: false }));
        }
      }
    };
    
    // Initial load
    loadPreferences();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && mounted) {
        loadPreferences();
      } else if (event === 'SIGNED_OUT' && mounted) {
        setPreferences({
          preferredUnit: "kg",
          timezone: "UTC",
          isLoading: false
        });
      }
    });
    
    // Listen for localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "preferredUnit" && e.newValue && mounted) {
        setPreferences(prev => ({
          ...prev,
          preferredUnit: e.newValue as string
        }));
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  
  // Function to update preferences
  const updatePreferences = async (prefs: Partial<Omit<UserPreferences, "isLoading" | "updatePreferences">>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Make sure we're updating the correct columns in the database
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString()
      };
      
      if (prefs.preferredUnit !== undefined) {
        updateData.preferred_unit = prefs.preferredUnit;
      }
      
      if (prefs.timezone !== undefined) {
        updateData.timezone = prefs.timezone;
      }
      
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);
        
      if (error) throw error;
      
      setPreferences(prev => ({
        ...prev,
        ...prefs
      }));
      
      // Update localStorage
      if (prefs.preferredUnit) {
        localStorage.setItem("preferredUnit", prefs.preferredUnit);
        
        // Manually trigger a storage event to notify other components
        window.dispatchEvent(new StorageEvent("storage", {
          key: "preferredUnit",
          newValue: prefs.preferredUnit
        }));
      }
      
      return Promise.resolve();
    } catch (error: any) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences. Please try again.");
      return Promise.reject(error);
    }
  };
  
  return (
    <UserPreferencesContext.Provider value={{ ...preferences, updatePreferences }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => useContext(UserPreferencesContext);
