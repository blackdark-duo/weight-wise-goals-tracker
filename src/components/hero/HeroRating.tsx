
import React from "react";
import { motion } from "framer-motion";
import { Users, Star } from "lucide-react";

const HeroRating = () => {
  return (
    <motion.div 
      className="flex items-center gap-2 mt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex">
        {[1, 2, 3, 4, 5].map((_, i) => (
          <Star 
            key={i} 
            className={`h-5 w-5 ${i < 5 ? "text-yellow-400" : "text-muted"}`} 
            fill={i < 5 ? "currentColor" : "none"} 
          />
        ))}
      </div>
      <div className="flex items-center text-sm text-muted-foreground">
        <Users className="h-4 w-4 mr-1" />
        <span className="font-medium">2,000+ Happy Customers</span>
      </div>
    </motion.div>
  );
};

export default HeroRating;
