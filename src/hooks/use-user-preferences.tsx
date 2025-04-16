
import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";

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

export const UserPreferencesProvider = ({ children }: { children: React.ReactNode }) => {
  const [preferences, setPreferences] = useState<Omit<UserPreferences, "updatePreferences">>({
    preferredUnit: "kg",
    timezone: "UTC",
    isLoading: true
  });
  
  // Load preferences from DB on mount and when localStorage changes
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // First try to get from localStorage for immediate response
        const storedUnit = localStorage.getItem("preferredUnit");
        if (storedUnit) {
          setPreferences(prev => ({
            ...prev,
            preferredUnit: storedUnit
          }));
        }
        
        // Then try to get from DB for accurate data
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("preferred_unit, timezone")
            .eq("id", user.id)
            .single();
            
          if (data && !error) {
            setPreferences({
              preferredUnit: data.preferred_unit || "kg",
              timezone: data.timezone || "UTC",
              isLoading: false
            });
            
            // Update localStorage
            localStorage.setItem("preferredUnit", data.preferred_unit || "kg");
          } else {
            setPreferences(prev => ({ ...prev, isLoading: false }));
          }
        } else {
          setPreferences(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
        setPreferences(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    // Initial load
    loadPreferences();
    
    // Listen for localStorage changes (e.g. from another component)
    const handleStorageChange = () => {
      const storedUnit = localStorage.getItem("preferredUnit");
      if (storedUnit) {
        setPreferences(prev => ({
          ...prev,
          preferredUnit: storedUnit
        }));
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
  
  // Function to update preferences
  const updatePreferences = async (prefs: Partial<Omit<UserPreferences, "isLoading" | "updatePreferences">>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const { error } = await supabase
        .from("profiles")
        .update({
          ...prefs,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
        
      if (error) throw error;
      
      setPreferences(prev => ({
        ...prev,
        ...prefs
      }));
      
      // Update localStorage
      if (prefs.preferredUnit) {
        localStorage.setItem("preferredUnit", prefs.preferredUnit);
        // Dispatch a storage event to notify other components
        window.dispatchEvent(new Event("storage"));
      }
    } catch (error) {
      console.error("Error updating preferences:", error);
      throw error;
    }
  };
  
  return (
    <UserPreferencesContext.Provider value={{ ...preferences, updatePreferences }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => useContext(UserPreferencesContext);
