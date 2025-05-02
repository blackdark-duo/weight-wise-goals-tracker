
import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true
});

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
    
    // Setup auth state listener first (before checking session)
    const subscription = supabase.auth.onAuthStateChange((_, currentSession) => {
      setSession(currentSession);
      sessionCache.session = currentSession;
      setIsLoading(false);
    }).data.subscription;

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      sessionCache.session = currentSession;
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
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

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
