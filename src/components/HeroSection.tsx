
import React, { useState, useEffect } from "react";
import HeroButtons from "./hero/HeroButtons";
import HeroRating from "./hero/HeroRating";
import HeroImage from "./hero/HeroImage";
import { TextRotate } from "@/components/ui/text-rotate";
import { motion } from "framer-motion";

const HeroSection = () => {
  const [rotatingTexts, setRotatingTexts] = useState<string[]>([
    "Weight Loss",
    "Health Goals",
    "Fitness Journey",
    "Wellness Tracking"
  ]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Simulate a check for text rotation functionality
    try {
      if (rotatingTexts.length === 0) {
        throw new Error("Rotating texts array cannot be empty");
      }
      setIsLoaded(true);
    } catch (error) {
      console.error("Error in HeroSection:", error);
      setHasError(true);
      // Fallback to a single text option if there's an error
      setRotatingTexts(["Weight Management"]);
    }
  }, [rotatingTexts]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 py-20 md:py-28">
      <div className="absolute top-0 right-0 w-full h-full bg-grid-pattern-light opacity-10 pointer-events-none"></div>
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
          <motion.div 
            className="flex flex-col gap-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Transform Your{" "}
              <span className="relative inline-block">
                {isLoaded && !hasError ? (
                  <TextRotate 
                    texts={rotatingTexts}
                    mainClassName="text-brand-primary font-extrabold bg-gradient-to-r from-brand-primary to-blue-600 bg-clip-text text-transparent"
                    staggerDuration={0.03}
                    rotationInterval={3000}
                  />
                ) : (
                  <span className="text-brand-primary font-extrabold bg-gradient-to-r from-brand-primary to-blue-600 bg-clip-text text-transparent">
                    {rotatingTexts[0] || "Weight Journey"}
                  </span>
                )}
              </span>
              {" "}Journey with Precision
            </h1>
            <p className="text-muted-foreground md:text-xl max-w-[600px]">
              WeightWise is your comprehensive, user-friendly platform designed to help you track, understand, and achieve your weight management goals with scientific accuracy and personalized insights.
            </p>
            <HeroButtons />
            <HeroRating />
          </motion.div>
          
          <HeroImage 
            alt="WeightWise dashboard showing weight tracking chart and progress indicators" 
          />
        </div>
      </div>
      
      <style>{`
        .bg-grid-pattern-light {
          background-image: linear-gradient(to right, rgba(139, 92, 246, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(139, 92, 246, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
