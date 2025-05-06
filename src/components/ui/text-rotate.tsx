
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TextRotateProps {
  texts: string[];
  rotationInterval?: number;
  mainClassName?: string;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "middle";
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  splitLevelClassName?: string;
}

export const TextRotate: React.FC<TextRotateProps> = ({
  texts,
  rotationInterval = 3000,
  mainClassName = '',
  staggerDuration = 0.03,
  staggerFrom = "first",
  initial = { y: '100%', opacity: 0 },
  animate = { y: 0, opacity: 1 },
  exit = { y: '-100%', opacity: 0 },
  transition,
  splitLevelClassName = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Safety check for empty texts array
  if (!texts || texts.length === 0) {
    console.error("TextRotate component received empty texts array");
    return null;
  }

  useEffect(() => {
    // Set up the rotation interval
    intervalRef.current = setInterval(() => {
      setIsVisible(false);
      
      // Wait for exit animation to complete before changing text
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % texts.length);
        setIsVisible(true);
      }, 300); // Match this with exit animation duration
      
    }, rotationInterval);

    // Clean up interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [texts.length, rotationInterval]);

  const currentText = texts[currentIndex] || '';
  const characters = currentText.split('');

  // Apply stagger direction logic
  const getStaggerDelay = (index: number) => {
    try {
      if (staggerFrom === "last") {
        return staggerDuration * (characters.length - 1 - index);
      } else if (staggerFrom === "middle") {
        const midPoint = Math.floor(characters.length / 2);
        return staggerDuration * Math.abs(midPoint - index);
      } 
      // Default "first"
      return staggerDuration * index;
    } catch (error) {
      console.error("Error calculating stagger delay:", error);
      return 0;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={currentIndex}
        className={`inline-flex ${mainClassName}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {characters.map((char, index) => (
          <div key={`${currentIndex}-${index}`} className={splitLevelClassName}>
            <motion.span
              initial={initial}
              animate={animate}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
                delay: getStaggerDelay(index),
                ...(transition || {}),
              }}
              className="inline-block"
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          </div>
        ))}
      </motion.span>
    </AnimatePresence>
  );
};
