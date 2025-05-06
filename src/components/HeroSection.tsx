
import React from "react";
import HeroButtons from "./hero/HeroButtons";
import HeroRating from "./hero/HeroRating";
import HeroImage from "./hero/HeroImage";
import HeroTitle from "./hero/HeroTitle";
import HeroDescription from "./hero/HeroDescription";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const HeroSection = () => {
  const keyInsights = [
    "Track and visualize your weight journey over time",
    "Set personalized goals and monitor your progress",
    "Get dietary tips and insights for better health",
    "Secure and private data management"
  ];
  
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#ff7f50]/5 to-[#ff6347]/5 py-20 md:py-28">
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
              highlight="Your"
              afterText="Journey With WeightWise"
              rotatingWords={["Health", "Fitness", "Lifestyle", "Wellness", "Diet"]}
            />
            <HeroDescription 
              text="Track your progress, set meaningful goals, and get personalized AI insights to help you achieve your ideal weight and maintain a healthier lifestyle."
            />
            
            {/* Key Insights List */}
            <motion.ul 
              className="space-y-3 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              {keyInsights.map((insight, index) => (
                <motion.li 
                  key={index}
                  className="flex items-start gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                >
                  <Check className="h-5 w-5 text-[#ff7f50] mt-0.5 flex-shrink-0" />
                  <span>{insight}</span>
                </motion.li>
              ))}
            </motion.ul>
            
            <HeroButtons />
          </motion.div>
          
          <HeroImage 
            src="/images/hero_image.png"
            alt="WeightWise tracking app" 
          />
        </div>
      </div>
      
      <style>{`
        .bg-grid-pattern-light {
          background-image: linear-gradient(to right, rgba(255, 127, 80, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 127, 80, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
