
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

interface PricingTierProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  notIncluded?: string[];
  buttonText: string;
  highlighted?: boolean;
  onClick: () => void;
  loading?: boolean;
}

const PricingTier: React.FC<PricingTierProps> = ({
  title,
  price,
  description,
  features,
  notIncluded = [],
  buttonText,
  highlighted = false,
  onClick,
  loading = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <Card 
        className={`h-full flex flex-col ${
          highlighted 
            ? "border-[#ff7f50] shadow-lg shadow-[#ff7f50]/10" 
            : "border-border"
        }`}
      >
        {highlighted && (
          <div className="h-1.5 bg-gradient-to-r from-[#ff7f50] to-[#ff6347] rounded-t-lg" />
        )}
        <CardHeader>
          <CardTitle className={`text-2xl ${highlighted ? "text-[#ff7f50]" : ""}`}>
            {title}
          </CardTitle>
          <div className="mt-2">
            <span className="text-3xl font-bold">{price}</span>
            {price !== "Free" && <span className="text-muted-foreground ml-1">/month</span>}
          </div>
          <p className="text-muted-foreground">{description}</p>
        </CardHeader>
        <CardContent className="flex-grow">
          <ul className="space-y-3">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
            {notIncluded.map((feature, i) => (
              <li key={`not-${i}`} className="flex items-start text-muted-foreground">
                <X className="h-5 w-5 text-red-400 mr-2 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={onClick}
            className={`w-full ${
              highlighted 
                ? "bg-[#ff7f50] hover:bg-[#ff6347] text-white" 
                : ""
            }`} 
            variant={highlighted ? "default" : "outline"}
            disabled={loading}
          >
            {loading && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            )}
            {buttonText}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

interface RecordPricingClickParams {
  p_session_id: string;
  p_tier: string;
  p_timestamp: string;
  p_location: string;
  p_browser: string;
  p_referrer: string;
}

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

      // Store click data in Supabase using a direct RPC call to handle the pricing_clicks table access
      // Fix the TypeScript error by properly typing the RPC parameters with both return type and function name
      const { error } = await supabase.rpc('record_pricing_click', {
        p_session_id: sessionData.session_id,
        p_tier: sessionData.tier,
        p_timestamp: sessionData.timestamp,
        p_location: sessionData.location,
        p_browser: sessionData.browser,
        p_referrer: sessionData.referrer
      } as RecordPricingClickParams);

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
      
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Simple, Transparent 
              <span className="bg-gradient-to-r from-[#ff7f50] to-[#ff6347] bg-clip-text text-transparent"> Pricing</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that works best for your weight management journey.
            </p>
          </div>
          
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
      
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our pricing plans.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            <div>
              <h3 className="text-xl font-semibold mb-2">How do AI insights work?</h3>
              <p className="text-muted-foreground">
                AI insights analyze your weight data to provide personalized recommendations,
                identify patterns, and help you achieve your goals faster.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Can I switch between plans?</h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Your benefits will
                adjust immediately upon changing plans.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Do unused insights roll over?</h3>
              <p className="text-muted-foreground">
                Free tier insights do not roll over month to month. Pro tier insights reset
                monthly. Top-up credits never expire.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Is there a refund policy?</h3>
              <p className="text-muted-foreground">
                We offer a 7-day money-back guarantee for Pro tier subscriptions.
                Top-up credits are non-refundable once purchased.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your weight journey?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start for free, no credit card required. Upgrade whenever you're ready.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-[#ff7f50] to-[#ff6347]"
            onClick={() => handlePricingClick("free")}
          >
            Get Started Today
          </Button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Pricing;
