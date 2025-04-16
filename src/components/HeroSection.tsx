
import React from "react";
import HeroTitle from "./hero/HeroTitle";
import HeroDescription from "./hero/HeroDescription";
import HeroButtons from "./hero/HeroButtons";
import HeroRating from "./hero/HeroRating";
import HeroImage from "./hero/HeroImage";
import { TextRotate } from "@/components/ui/text-rotate";

const HeroSection = () => {
  const rotatingPhrases = [
    "Weight Loss",
    "Health Goals",
    "Fitness Journey",
    "Wellness Tracking"
  ];

  return (
    <section className="relative overflow-hidden bg-ui-background py-20 md:py-28">
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Transform Your{" "}
              <span className="relative inline-block">
                <TextRotate 
                  texts={rotatingPhrases}
                  className="text-brand-primary font-extrabold"
                  staggerDuration={0.03}
                  rotationInterval={3000}
                />
              </span>
              {" "}Journey with Precision
            </h1>
            <HeroDescription 
              text="WeightWise is your comprehensive, user-friendly platform designed to help you track, understand, and achieve your weight management goals with scientific accuracy and personalized insights."
            />
            <HeroButtons />
            <HeroRating />
          </div>
          
          <HeroImage 
            src="/images/weight-tracker-dashboard.png"
            alt="Weight Wise App Dashboard"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
