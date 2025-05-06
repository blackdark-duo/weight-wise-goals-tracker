
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAdminAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if the user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          throw authError;
        }
        
        if (!user) {
          setIsAuthenticated(false);
          return;
        }
        
        setUserId(user.id);
        setIsAuthenticated(true);
        
        // Check if the user is an admin
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();
          
        if (profileError) {
          throw profileError;
        }
        
        const isUserAdmin = !!profileData?.is_admin;
        setIsAdmin(isUserAdmin);
      } catch (error: any) {
        console.error("Error checking admin status:", error);
        setError("Failed to verify admin status. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, []);
  
  return {
    isLoading,
    isAuthenticated,
    isAdmin,
    error,
    userId,
    setError
  };
};
