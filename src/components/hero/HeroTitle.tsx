
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface HeroTitleProps {
  beforeText: string;
  highlight: string;
  afterText: string;
  rotatingWords?: string[];
}

const HeroTitle: React.FC<HeroTitleProps> = ({ 
  beforeText, 
  highlight, 
  afterText,
  rotatingWords = ["Health", "Fitness", "Lifestyle", "Wellness", "Diet"]
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % rotatingWords.length);
        setIsAnimating(false);
      }, 500); // Match this with the animation duration
    }, 3000);

    return () => clearInterval(interval);
  }, [rotatingWords.length]);

  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
      {beforeText}{" "}
      <span className="bg-gradient-to-r from-[#ff7f50] to-[#ff6347] bg-clip-text text-transparent">
        {highlight}{" "}
      </span>
      <motion.span
        key={currentWordIndex}
        initial="initial"
        animate={isAnimating ? "exit" : "animate"}
        variants={variants}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-[#ff7f50] to-[#ff6347] bg-clip-text text-transparent inline-block"
      >
        {rotatingWords[currentWordIndex]}
      </motion.span>
      {" "}{afterText}
    </h1>
  );
};

export default HeroTitle;
