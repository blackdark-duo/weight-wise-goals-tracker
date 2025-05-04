
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/auth";
import { PricingTier } from "@/components/pricing/PricingTier";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { PricingHero } from "@/components/pricing/PricingHero";
import { PricingCTA } from "@/components/pricing/PricingCTA";
import { recordPricingClick } from "@/services/pricingService";

const Pricing = () => {
  const { session } = useAuth();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

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
      
      // If Pro tier, send email notification
      if (tier === "pro") {
        // In a real app, this would call an edge function to send an email
        console.log("Sending pro tier interest email to pro@weightwise.site");
        toast.success("Thank you for your interest! We'll contact you about upgrading to Pro tier.");
      } else if (tier === "free") {
        toast.success("You've selected the Free tier. Continue enjoying WeightWise!");
      } else {
        toast.success("Thank you for your interest in additional credits!");
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
      
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            <PricingTier
              title="Free Tier"
              price="Free"
              description="Perfect for getting started on your weight management journey."
              features={[
                "5 AI insights per month",
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
              title="Pro Tier"
              price="$5"
              description="Enhanced features for serious weight management."
              features={[
                "30 AI insights per month",
                "Unlimited weight tracking",
                "Advanced goal setting",
                "1-year data history",
                "Priority email support",
                "Extended data analysis",
                "API access"
              ]}
              buttonText="Upgrade to Pro"
              highlighted={true}
              onClick={() => handlePricingClick("pro")}
              loading={loadingTier === "pro"}
            />
            
            <PricingTier
              title="Top-Up Credits"
              price="$5"
              description="Need more AI insights? Add more as needed."
              features={[
                "100 additional AI insights",
                "Use anytime",
                "Never expires",
                "Compatible with Free tier",
                "Compatible with Pro tier"
              ]}
              buttonText="Buy Credits"
              onClick={() => handlePricingClick("credits")}
              loading={loadingTier === "credits"}
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
