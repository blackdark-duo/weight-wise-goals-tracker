
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

  useEffect(() => {
    const createAdminUsers = async () => {
      try {
        // Create the admin users as requested
        const adminEmails = [
          "admin@weightwise.com",
          "naveen831459@gmail.com",
          "fitnessfea.t9@gmail.com", 
          "fitnessfeat9@gmail.com"
        ];
        
        for (const email of adminEmails) {
          const { data: adminExists } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", email)
            .maybeSingle();

          if (!adminExists) {
            const { error } = await supabase.auth.signUp({
              email: email,
              password: "password",
              options: {
                data: {
                  is_admin: true,
                  display_name: email === "admin@weightwise.com" ? "Admin User" : "Weight Wise",
                },
              },
            });

            if (error) {
              console.error(`Failed to create admin user ${email}:`, error);
            } else {
              console.log(`Created admin user for ${email}`);
            }
          }
        }
      } catch (err) {
        console.error("Error setting up admin users:", err);
      }
    };

    if (process.env.NODE_ENV === "development") {
      createAdminUsers();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
