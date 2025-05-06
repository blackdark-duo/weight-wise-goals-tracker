
import React, { useEffect, useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { AlertCircle, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface AdminAuthGuardProps {
  isAdmin?: boolean;
  children: React.ReactNode;
}

const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ isAdmin, children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasAdminRights, setHasAdminRights] = useState(isAdmin);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setError("");
        
        // First check if we have a session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setError("Authentication error. Please sign in again.");
          setHasAdminRights(false);
          setLoading(false);
          return;
        }
        
        if (!sessionData.session) {
          setError("You must be signed in to access this page.");
          setHasAdminRights(false);
          setLoading(false);
          return;
        }
        
        // Then check if the user is an admin
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", sessionData.session.user.id)
          .single();
        
        if (profileError) {
          console.error("Profile fetch error:", profileError);
          setError("Failed to verify admin status.");
          setHasAdminRights(false);
          setLoading(false);
          return;
        }
        
        if (!profileData?.is_admin) {
          setError("You do not have admin privileges to access this page.");
          setHasAdminRights(false);
          setLoading(false);
          return;
        }
        
        // All checks passed
        setHasAdminRights(true);
        setLoading(false);
      } catch (err) {
        console.error("Admin check error:", err);
        setError("An unexpected error occurred while verifying access.");
        setHasAdminRights(false);
        setLoading(false);
      }
    };
    
    if (isAdmin === undefined) {
      checkAdminStatus();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ff7f50] border-t-transparent"></div>
        <p className="mt-4 text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  if (!hasAdminRights) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          {error || "You do not have permission to access this page."}
        </p>
        <div className="flex gap-4">
          <Button 
            onClick={() => navigate("/")}
            variant="outline"
          >
            Return Home
          </Button>
          <Button 
            onClick={() => navigate("/signin")}
            className="bg-[#ff7f50] hover:bg-[#ff6347]"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminAuthGuard;
