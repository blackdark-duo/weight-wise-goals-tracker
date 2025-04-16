
import React from "react";
import HeroButtons from "./hero/HeroButtons";
import HeroRating from "./hero/HeroRating";
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
                  mainClassName="text-brand-primary font-extrabold"
                  staggerDuration={0.03}
                  rotationInterval={3000}
                />
              </span>
              {" "}Journey with Precision
            </h1>
            <p className="text-muted-foreground md:text-xl max-w-[600px]">
              WeightWise is your comprehensive, user-friendly platform designed to help you track, understand, and achieve your weight management goals with scientific accuracy and personalized insights.
            </p>
            <HeroButtons />
            <HeroRating />
          </div>
          
          <div className="relative mx-auto max-w-[500px] w-full overflow-hidden rounded-xl shadow-xl">
            <img 
              src="/images/weight-tracker-dashboard.png"
              alt="Weight Wise App Dashboard"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 mix-blend-multiply"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
