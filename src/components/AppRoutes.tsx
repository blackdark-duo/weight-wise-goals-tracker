
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/providers/auth";
import Index from "@/pages/Index";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import Reports from "@/pages/Reports";
import Goals from "@/pages/Goals";
import Account from "@/pages/Account";

import ContactUs from "@/pages/ContactUs";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import About from "@/pages/About";
import Features from "@/pages/Features";
import Pricing from "@/pages/Pricing";
import ForgotPassword from "@/pages/ForgotPassword";
import MobileNavigation from "@/components/navigation/MobileNavigation";

// Private route wrapper component that excludes the admin path
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useAuth();
  
  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  return session ? <>{children}</> : <Navigate to="/signin" replace />;
};

const AppRoutes = () => {
  const { session, isLoading } = useAuth();
  
  // Determine if we should show mobile navigation (only for authenticated routes)
  const showMobileNav = session && !isLoading;

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
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
        
        {/* Domain/Settings redirect to Account */}
        <Route path="/settings" element={<Navigate to="/account" replace />} />
        <Route path="/domain" element={<Navigate to="/account" replace />} />
        
        {/* Pricing page removed as requested */}
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showMobileNav && <MobileNavigation />}
    </>
  );
};

export default AppRoutes;
