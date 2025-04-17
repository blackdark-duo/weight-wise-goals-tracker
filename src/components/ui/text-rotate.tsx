
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TextRotateProps {
  texts: string[];
  rotationInterval?: number;
  mainClassName?: string;
  staggerDuration?: number;
  // Add the missing props
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
  initial,
  animate,
  exit,
  transition,
  splitLevelClassName,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Set up the rotation interval
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, rotationInterval);

    // Clean up interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [texts.length, rotationInterval]);

  const currentText = texts[currentIndex];
  const characters = currentText.split('');

  // Apply stagger direction logic
  const getStaggerDelay = (index: number) => {
    if (staggerFrom === "last") {
      return staggerDuration * (characters.length - 1 - index);
    } else if (staggerFrom === "middle") {
      const midPoint = Math.floor(characters.length / 2);
      return staggerDuration * Math.abs(midPoint - index);
    } 
    // Default "first"
    return staggerDuration * index;
  };

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={currentIndex}
        className={`inline-flex ${mainClassName}`}
        initial={initial || { opacity: 0 }}
        animate={animate || { opacity: 1 }}
        exit={exit || { opacity: 0 }}
        transition={transition || { duration: 0.3 }}
      >
        {characters.map((char, index) => (
          <div key={`${currentIndex}-${index}`} className={splitLevelClassName || ""}>
            <motion.span
              initial={initial || { y: '100%', opacity: 0 }}
              animate={animate || { y: 0, opacity: 1 }}
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
