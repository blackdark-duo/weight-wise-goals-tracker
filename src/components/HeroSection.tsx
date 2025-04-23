
import React, { useState, useEffect } from "react";
import HeroButtons from "./hero/HeroButtons";
import HeroRating from "./hero/HeroRating";
import HeroImage from "./hero/HeroImage";
import { TextRotate } from "@/components/ui/text-rotate";
import { motion } from "framer-motion";

const HeroSection = () => {
  const [rotatingTexts] = useState<string[]>([
    "Fitness Goals",
    "Health Journey",
    "Wellness Path",
    "Active Lifestyle"
  ]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 py-20 md:py-28">
      <div className="absolute top-0 right-0 w-full h-full bg-grid-pattern-light opacity-10 pointer-events-none"></div>
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
          <motion.div 
            className="flex flex-col gap-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Transform Your{" "}
              <span className="relative inline-block">
                <TextRotate 
                  texts={rotatingTexts}
                  mainClassName="text-brand-primary font-extrabold bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent"
                  staggerDuration={0.05}
                  rotationInterval={3000}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-100%" }}
                />
              </span>
              {" "}With Weight Wise
            </h1>
            <p className="text-muted-foreground md:text-xl max-w-[600px]">
              Weight Wise is Your Personal Companion for a Healthier, More Vibrant Lifestyle. Track, Achieve, and Celebrate Your Wellness Milestones.
            </p>
            <HeroButtons />
            <HeroRating />
          </motion.div>
          
          <HeroImage 
            src="/lovable-uploads/weight-wise-hero.png"
            alt="Weight Wise dashboard showcasing intuitive fitness tracking and wellness insights" 
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
