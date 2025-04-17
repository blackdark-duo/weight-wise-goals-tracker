
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TextRotateProps {
  texts: string[];
  rotationInterval?: number;
  mainClassName?: string;
  staggerDuration?: number;
}

export const TextRotate: React.FC<TextRotateProps> = ({
  texts,
  rotationInterval = 3000,
  mainClassName = '',
  staggerDuration = 0.03,
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
          <motion.span
            key={`${currentIndex}-${index}`}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
              delay: staggerDuration * index,
            }}
            className="inline-block"
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.span>
    </AnimatePresence>
  );
};
