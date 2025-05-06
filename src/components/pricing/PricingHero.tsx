
import React from "react";

export const PricingHero: React.FC = () => {
  return (
    <div className="text-center mb-16 py-20 px-4">
      <h1 className="text-4xl md:text-5xl font-bold mb-6">
        Simple, Transparent 
        <span className="bg-gradient-to-r from-[#ff7f50] to-[#ff6347] bg-clip-text text-transparent"> Pricing</span>
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Choose the plan that works best for your weight management journey.
      </p>
    </div>
  );
};
