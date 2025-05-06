
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ImageOff } from "lucide-react";

type HeroImageProps = {
  src?: string;
  alt: string;
};

const HeroImage = ({ src = "/images/hero_image.png", alt }: HeroImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  // Reset loading state when src changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [src]);

  // Try to preload the image
  useEffect(() => {
    if (imageError && retryCount < maxRetries) {
      const timer = setTimeout(() => {
        console.log(`Retrying image load (${retryCount + 1}/${maxRetries})...`);
        setImageError(false);
        setRetryCount(prevCount => prevCount + 1);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [imageError, retryCount]);

  const handleImageError = () => {
    console.error(`Error loading hero image: ${src}`);
    setImageError(true);
    setImageLoaded(false);
  };

  const handleImageLoad = () => {
    console.log("Hero image loaded successfully");
    setImageLoaded(true);
    setImageError(false);
  };

  const renderDashboardImage = () => (
    <img
      src="/lovable-uploads/app_logo.png"
      alt="Weight Wise tracking app logo"
      className="w-full h-auto max-w-[320px] mx-auto"
    />
  );

  const renderPlaceholder = () => (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-gradient-to-br from-[#ff7f50]/10 to-[#ff6347]/10 p-8 text-center">
      <ImageOff className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
      <p className="text-muted-foreground">
        {alt || "Weight Wise dashboard illustration"}
      </p>
    </div>
  );

  return (
    <motion.div 
      className="relative mx-auto w-full max-w-md"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-[#ff7f50]/20 to-[#ff6347]/20 p-4 shadow-xl">
        {imageError ? 
          renderDashboardImage() :
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ff7f50]/30 border-t-[#ff7f50]"></div>
              </div>
            )}
            <img
              src={src}
              alt={alt}
              onError={handleImageError}
              onLoad={handleImageLoad}
              className={`h-full w-full rounded-lg object-cover shadow-lg transition-opacity duration-500 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </>
        }
      </div>
    </motion.div>
  );
};

export default HeroImage;
