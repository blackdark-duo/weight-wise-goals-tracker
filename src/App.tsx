
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Reports from "./pages/Reports";
import Goals from "./pages/Goals";
import Account from "./pages/Account";
import { useState, useEffect } from "react";
import { supabase } from "./integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import MobileNavigation from "./components/MobileNavigation";
import { CustomToastProvider } from "./components/ui/custom-toast";
import { UserPreferencesProvider } from "./hooks/use-user-preferences";

// Create a client with stale time to prevent unnecessary refetches
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session);
        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Private route wrapper component
  const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    return session ? <>{children}</> : <Navigate to="/signin" replace />;
  };

  // Determine if we should show mobile navigation (only for authenticated routes)
  const showMobileNav = session && !isLoading;

  return (
    <QueryClientProvider client={queryClient}>
      <UserPreferencesProvider>
        <CustomToastProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
                <Route path="/account" element={
                  <PrivateRoute>
                    <Account />
                  </PrivateRoute>
                } />
                <Route path="/reports" element={
                  <PrivateRoute>
                    <Reports />
                  </PrivateRoute>
                } />
                <Route path="/goals" element={
                  <PrivateRoute>
                    <Goals />
                  </PrivateRoute>
                } />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              {showMobileNav && <MobileNavigation />}
            </BrowserRouter>
          </TooltipProvider>
        </CustomToastProvider>
      </UserPreferencesProvider>
    </QueryClientProvider>
  );
};

export default App;
