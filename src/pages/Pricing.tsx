
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, AlertTriangle, ToggleLeft, ToggleRight } from "lucide-react";
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
import { CurrencySelector, Currency } from "@/components/pricing/CurrencySelector";
import { detectLocalCurrency, formatPrice, formatPriceWithPeriod } from "@/utils/currencyUtils";

const Pricing = () => {
  const { session } = useAuth();
  const location = useLocation();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(detectLocalCurrency());
  const [isYearly, setIsYearly] = useState(false);
  
  // Check if user was redirected due to exceeding limits
  const limitExceeded = location.state?.reason;
  const currentUsage = location.state?.current;
  const usageLimit = location.state?.limit;

  useEffect(() => {
    setSelectedCurrency(detectLocalCurrency());
  }, []);

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
      
      {/* Currency Selector and Billing Toggle */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <CurrencySelector 
              selectedCurrency={selectedCurrency}
              onCurrencyChange={setSelectedCurrency}
            />
            
            <div className="flex items-center gap-3 bg-background/80 backdrop-blur-sm border rounded-lg p-2">
              <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsYearly(!isYearly)}
                className="p-1 h-auto"
              >
                {isYearly ? (
                  <ToggleRight className="h-6 w-6 text-primary" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                )}
              </Button>
              <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                Yearly
              </span>
              {isYearly && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full ml-2">
                  Save 2 months!
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
      
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
              period={isYearly ? 'yearly' : 'monthly'}
            />
            
            <PricingTier
              title="Basic Plan"
              price={isYearly 
                ? formatPriceWithPeriod(50, selectedCurrency, 'yearly') // 10 months worth (5*10)
                : formatPriceWithPeriod(5, selectedCurrency, 'monthly')
              }
              originalPrice={isYearly 
                ? formatPriceWithPeriod(60, selectedCurrency, 'yearly') // 12 months worth (5*12)
                : formatPriceWithPeriod(10, selectedCurrency, 'monthly') // MRP
              }
              savings={isYearly 
                ? `Save ${formatPrice(10, selectedCurrency)} (2 months free!)`
                : `Save ${formatPrice(5, selectedCurrency)} off MRP`
              }
              description="Enhanced features for serious weight management."
              features={[
                "Unlimited credits",
                "Unlimited weight tracking", 
                "Advanced goal setting",
                isYearly ? "Unlimited data history" : "1-year data history",
                "Priority email support",
                "Extended data analysis", 
                "Webhook integrations",
                ...(isYearly ? ["2 months free!", "Best value for long-term users"] : [])
              ]}
              buttonText={isYearly ? "Get Yearly Plan" : "Upgrade to Basic"}
              highlighted={true}
              onClick={() => handlePricingClick(isYearly ? "basic-yearly" : "basic")}
              loading={loadingTier === "basic" || loadingTier === "basic-yearly"}
              period={isYearly ? 'yearly' : 'monthly'}
            />
          </div>
          
          {/* Pricing explanation */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              All prices are converted from our base USD pricing. 
              {isYearly && " Yearly plans include 2 months free - pay for 10 months, get 12 months of service!"} 
              {!isYearly && " Monthly plans are discounted from MRP to make them more affordable."}
            </p>
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
