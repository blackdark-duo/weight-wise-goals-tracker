
import React from "react";
import { Button } from "@/components/ui/button";

interface PricingCTAProps {
  handlePricingClick: (tier: string) => void;
}

export const PricingCTA: React.FC<PricingCTAProps> = ({ handlePricingClick }) => {
  return (
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
  );
};
