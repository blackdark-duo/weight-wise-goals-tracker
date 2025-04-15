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
import AccountManagement from "./components/AccountManagement";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  // This will be replaced with Supabase auth logic
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Simulate auth check
  useEffect(() => {
    // Check for existing session in localStorage (for demo purposes)
    const hasSession = localStorage.getItem("demo-auth-session");
    setIsAuthenticated(!!hasSession);
  }, []);

  // This will be implemented with Supabase auth
  const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    return isAuthenticated ? <>{children}</> : <Navigate to="/signin" />;
  };

  return (
    <QueryClientProvider client={queryClient}>
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
                <div className="container py-10">
                  <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
                  <AccountManagement />
                </div>
              </PrivateRoute>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
