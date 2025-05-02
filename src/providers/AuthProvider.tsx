import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
};

// Create context with undefined as default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This prevents double rendering in React.StrictMode
const sessionCache = {
  session: null as Session | null,
  initialized: false,
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(sessionCache.session);
  const [isLoading, setIsLoading] = useState(!sessionCache.initialized);
  
  useEffect(() => {
    // Only run this once to prevent double initialization
    if (sessionCache.initialized) {
      return;
    }
    
    sessionCache.initialized = true;
    
    // Store just the unsubscribe function
    let cleanup: (() => void) | undefined;
    
    // Setup auth state listener first (before checking session)
    const { data } = supabase.auth.onAuthStateChange((_, currentSession) => {
      setSession(currentSession);
      sessionCache.session = currentSession;
      setIsLoading(false);
    });

    // Store the subscription cleanup function directly
    cleanup = data?.subscription?.unsubscribe;

    // Then check for existing session
    supabase.auth.getSession().then((response) => {
      const currentSession = response.data.session;
      setSession(currentSession);
      sessionCache.session = currentSession;
      setIsLoading(false);
    });

    // Return cleanup function
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  // Create admin user for demo purposes
  useEffect(() => {
    const createAdminUser = async () => {
      try {
        // Check if admin user already exists
        const { data: adminExists } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', 'admin@weightwise.com')
          .single();
        
        if (!adminExists) {
          // Create admin user
          const { error } = await supabase.auth.signUp({
            email: 'admin@weightwise.com',
            password: 'password',
            options: {
              data: {
                is_admin: true,
                display_name: 'Admin User'
              }
            }
          });
          
          if (error) console.error('Failed to create admin user:', error);
        }
      } catch (err) {
        console.error('Error setting up admin user:', err);
      }
    };
    
    if (process.env.NODE_ENV === 'development') {
      createAdminUser();
    }
  }, []);

  // Create a stable context value to prevent unnecessary re-renders
  const contextValue = {
    session,
    isLoading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Updated useAuth hook with proper type checking
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
