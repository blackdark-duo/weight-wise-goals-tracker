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

    const { data: listener } = supabase.auth.onAuthStateChange((_, currentSession) => {
      setSession(currentSession);
      sessionCache.session = currentSession;
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      sessionCache.session = data.session;
      setIsLoading(false);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const createAdminUser = async () => {
      try {
        const { data: adminExists } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", "admin@cozyweight.com")
          .single();

        if (!adminExists) {
          const { error } = await supabase.auth.signUp({
            email: "admin@cozyweight.com",
            password: "password",
            options: {
              data: {
                is_admin: true,
                display_name: "Admin User",
              },
            },
          });

          if (error) {
            console.error("Failed to create admin user:", error);
          }
        }
      } catch (err) {
        console.error("Error setting up admin user:", err);
      }
    };

    if (process.env.NODE_ENV === "development") {
      createAdminUser();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
