
import React from "react";
import { motion } from "framer-motion";

type HeroImageProps = {
  src: string;
  alt: string;
};

const HeroImage = ({ src, alt }: HeroImageProps) => {
  return (
    <motion.div 
      className="relative mx-auto w-full max-w-md"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 p-4">
        <img
          src={src}
          alt={alt}
          className="h-full w-full rounded-lg object-cover shadow-lg"
        />
      </div>
    </motion.div>
  );
};

export default HeroImage;
