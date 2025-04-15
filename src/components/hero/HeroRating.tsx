
import React from "react";
import { motion } from "framer-motion";
import { Users, Star } from "lucide-react";

const HeroRating = () => {
  return (
    <motion.div 
      className="flex items-center gap-2 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex">
        {[1, 2, 3, 4].map((_, i) => (
          <Star 
            key={i} 
            className={`h-5 w-5 ${i < 4 ? "text-yellow-400" : "text-muted"}`} 
            fill={i < 4 ? "currentColor" : "none"} 
          />
        ))}
        <Star className="h-5 w-5 text-muted" />
      </div>
      <div className="flex items-center text-sm text-muted-foreground">
        <Users className="h-4 w-4 mr-1" />
        <span className="font-medium">1000+ Happy Customers</span>
      </div>
    </motion.div>
  );
};

export default HeroRating;
