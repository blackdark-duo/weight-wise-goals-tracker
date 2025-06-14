
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/auth";
import { useLocation } from "react-router-dom";
import { PricingTier } from "@/components/pricing/PricingTier";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { PricingHero } from "@/components/pricing/PricingHero";
import { PricingCTA } from "@/components/pricing/PricingCTA";
import { recordPricingClick } from "@/services/pricingService";

const Pricing = () => {
  const { session } = useAuth();
  const location = useLocation();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  
  // Check if user was redirected due to exceeding limits
  const limitExceeded = location.state?.reason;
  const currentUsage = location.state?.current;
  const usageLimit = location.state?.limit;

  const handlePricingClick = async (tier: string) => {
    setLoadingTier(tier);
    
    try {
      // Gather session information
      const sessionData = {
        session_id: session?.user?.id || "anonymous",
        tier: tier,
        timestamp: new Date().toISOString(),
        location: "Not available", // In a real app, you might get this from a geolocation API
        browser: navigator.userAgent,
        referrer: document.referrer
      };
      
      console.log("Recording pricing click:", sessionData);

      // Store click data using our service
      const error = await recordPricingClick(sessionData);

      if (error) {
        console.error("Error recording pricing click:", error);
      }
      
      // Handle different tier selections
      if (tier === "basic") {
        toast.success("Thank you for your interest! We'll contact you about upgrading to Basic plan.");
      } else if (tier === "free") {
        toast.success("You've selected the Free tier. Continue enjoying Weight Wise!");
      } else {
        toast.success("Thank you for your interest!");
      }
    } catch (error) {
      console.error("Error in pricing click handler:", error);
      toast.error("There was an issue processing your request. Please try again.");
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <PricingHero />
      
      {limitExceeded && (
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <Alert className="border-destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You've reached your {limitExceeded === 'credits' ? 'credit' : limitExceeded === 'insights' ? 'AI insights' : 'webhook'} limit 
                ({currentUsage}/{usageLimit}). Upgrade to Basic plan to continue using all features.
              </AlertDescription>
            </Alert>
          </div>
        </section>
      )}
      
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid gap-8 md:grid-cols-2">
            <PricingTier
              title="Free Tier"
              price="Free"
              description="Perfect for getting started on your weight management journey."
              features={[
                "5 credits included",
                "Weight tracking",
                "Basic goal setting",
                "30-day data history",
                "Email support"
              ]}
              notIncluded={[
                "Extended data analysis",
                "Priority support",
                "Advanced goal features",
                "API access"
              ]}
              buttonText="Get Started"
              onClick={() => handlePricingClick("free")}
              loading={loadingTier === "free"}
            />
            
            <PricingTier
              title="Basic Plan"
              price="$5"
              description="Enhanced features for serious weight management."
              features={[
                "Unlimited credits",
                "Unlimited weight tracking",
                "Advanced goal setting",
                "1-year data history",
                "Priority email support",
                "Extended data analysis",
                "Webhook integrations"
              ]}
              buttonText="Upgrade to Basic"
              highlighted={true}
              onClick={() => handlePricingClick("basic")}
              loading={loadingTier === "basic"}
            />
          </div>
        </div>
      </section>
      
      <PricingFAQ />
      
      <PricingCTA handlePricingClick={handlePricingClick} />
      
      <Footer />
    </div>
  );
};

export default Pricing;
