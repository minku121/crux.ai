import React from 'react'
import { motion } from 'framer-motion';
export default function DotGrid() {
    const size = 20; 
    const dotSize = 2; // Size of each dot
    const dotOpacity = 0.3; // Base opacity of dots
    
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            className="relative w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {Array.from({ length: 500 }).map((_, i) => {
              const x = Math.random() * 100;
              const y = Math.random() * 100;
              const delay = Math.random() * 2;
              
              return (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-primary"
                  style={{
                    width: dotSize,
                    height: dotSize,
                    left: `${x}%`,
                    top: `${y}%`,
                    opacity: dotOpacity,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [dotOpacity, dotOpacity * 2, dotOpacity],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 4,
                    delay: delay,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              );
            })}
          </motion.div>
        </div>
      </div>
    );
  };
