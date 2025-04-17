
import React from "react";
import HeroButtons from "./hero/HeroButtons";
import HeroRating from "./hero/HeroRating";
import { TextRotate } from "@/components/ui/text-rotate";
import { motion } from "framer-motion";

const HeroSection = () => {
  const rotatingPhrases = [
    "Weight Loss",
    "Health Goals",
    "Fitness Journey",
    "Wellness Tracking"
  ];

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
                <TextRotate 
                  texts={rotatingPhrases}
                  mainClassName="text-brand-primary font-extrabold bg-gradient-to-r from-brand-primary to-blue-600 bg-clip-text text-transparent"
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
          </motion.div>
          
          <motion.div 
            className="relative mx-auto max-w-[500px] w-full overflow-hidden rounded-xl shadow-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 mix-blend-multiply z-10 rounded-xl"></div>
            <img 
              src="https://images.unsplash.com/photo-1698161246695-450375feed09?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Weight tracking dashboard with charts and statistics"
              className="w-full h-auto rounded-xl shadow-lg relative z-0"
            />
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent z-20 rounded-b-xl"></div>
            <div className="absolute bottom-4 left-6 text-white text-xl font-bold z-30">WeightWise Dashboard</div>
          </motion.div>
        </div>
      </div>
      
      <style jsx>{`
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
