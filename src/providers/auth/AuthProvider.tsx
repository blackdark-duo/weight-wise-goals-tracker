
import { useState, useEffect, ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext, sessionCache } from "./AuthContext";

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(sessionCache.session);
  const [isLoading, setIsLoading] = useState(!sessionCache.initialized);

  useEffect(() => {
    if (sessionCache.initialized) return;

    sessionCache.initialized = true;

    // Set up auth state listener first to prevent infinite type instantiation
    const { data: listener } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      sessionCache.session = currentSession;
      setIsLoading(false);
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      sessionCache.session = data.session;
      setIsLoading(false);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);


  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
