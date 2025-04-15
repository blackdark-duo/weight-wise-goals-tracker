
import React from "react";
import HeroTitle from "./hero/HeroTitle";
import HeroDescription from "./hero/HeroDescription";
import HeroButtons from "./hero/HeroButtons";
import HeroRating from "./hero/HeroRating";
import HeroImage from "./hero/HeroImage";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-ui-background py-20 md:py-28">
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
          <div className="flex flex-col gap-6">
            <HeroTitle 
              beforeText="Transform Your"
              highlight="Weight Loss"
              afterText="Journey with Precision"
            />
            <HeroDescription 
              text="WeightWise is your comprehensive, user-friendly platform designed to help you track, understand, and achieve your weight management goals with scientific accuracy and personalized insights."
            />
            <HeroButtons />
            <HeroRating />
          </div>
          
          <HeroImage 
            src="/lovable-uploads/f9e9f46c-9dea-4df5-96a3-cc6bc8d960e1.png"
            alt="Weight Wise App Dashboard"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
