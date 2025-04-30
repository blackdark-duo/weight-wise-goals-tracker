
import React, { useState } from "react";
import HeroButtons from "./hero/HeroButtons";
import HeroRating from "./hero/HeroRating";
import HeroImage from "./hero/HeroImage";
import HeroTitle from "./hero/HeroTitle";
import HeroDescription from "./hero/HeroDescription";
import { motion } from "framer-motion";

const HeroSection = () => {
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
            <HeroTitle 
              beforeText="Transform"
              highlight="Your Health"
              afterText="Journey With Weight Wise"
            />
            <HeroDescription 
              text="Track your progress, set meaningful goals, and get personalized AI insights to help you achieve your ideal weight and maintain a healthier lifestyle."
            />
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
