
import React, { useState } from "react";
import { motion } from "framer-motion";

type HeroImageProps = {
  src?: string;
  alt: string;
};

const HeroImage = ({ src = "/images/weight-tracker-dashboard.png", alt }: HeroImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.error("Error loading hero image");
    setImageError(true);
    setImageLoaded(false);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <motion.div 
      className="relative mx-auto w-full max-w-md"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 p-4">
        {imageError ? (
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 p-8 text-center">
            <p className="text-muted-foreground">
              {alt || "WeightWise dashboard illustration"}
            </p>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            onError={handleImageError}
            onLoad={handleImageLoad}
            className={`h-full w-full rounded-lg object-cover shadow-lg transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </div>
    </motion.div>
  );
};

export default HeroImage;
