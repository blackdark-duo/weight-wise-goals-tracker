/**
 * Authentication Guard Hook
 * Handles authentication state and redirects
 * Single responsibility: Authentication validation and navigation
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export interface AuthState {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Hook that guards protected routes and provides auth state
 */
export const useAuthGuard = (redirectTo: string = "/signin") => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Auth check error:", error);
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          });
          navigate(redirectTo);
          return;
        }

        if (!user) {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          });
          navigate(redirectTo);
          return;
        }

        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true
        });
      } catch (err) {
        console.error("Unexpected auth error:", err);
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        });
        navigate(redirectTo);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          });
          navigate(redirectTo);
        } else if (session?.user) {
          setAuthState({
            user: session.user,
            isLoading: false,
            isAuthenticated: true
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, redirectTo]);

  return authState;
};

/**
 * Simple hook to get current user without navigation
 */
export const useCurrentUser = () => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    getCurrentUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, isLoading, isAuthenticated: !!user };
};