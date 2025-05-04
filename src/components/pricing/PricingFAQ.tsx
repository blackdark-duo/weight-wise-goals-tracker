
import React from "react";

export const PricingFAQ: React.FC = () => {
  return (
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
  );
};
