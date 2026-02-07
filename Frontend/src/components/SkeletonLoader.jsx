/* eslint-disable no-unused-vars */
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export const SkeletonLoader = ({ count = 3, type = 'card' }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0.5 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: 'reverse'
      }
    }
  };

  // Pre-compute random widths to avoid calling Math.random() during render
  const textWidths = useMemo(() => 
    Array(count).fill(0).map((_, i) => `${60 + (i * 10) % 40}%`),
    [count]
  );

  if (type === 'card') {
    return (
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {Array(count)
          .fill(0)
          .map((_, i) => (
            <motion.div
              key={i}
              className="bg-gray-200 rounded-lg h-64"
              variants={itemVariants}
            />
          ))}
      </motion.div>
    );
  }

  if (type === 'table') {
    return (
      <motion.div className="space-y-2" variants={containerVariants} initial="hidden" animate="visible">
        {Array(count)
          .fill(0)
          .map((_, i) => (
            <motion.div
              key={i}
              className="bg-gray-200 rounded h-12 w-full"
              variants={itemVariants}
            />
          ))}
      </motion.div>
    );
  }

  if (type === 'text') {
    return (
      <motion.div className="space-y-2" variants={containerVariants} initial="hidden" animate="visible">
        {Array(count)
          .fill(0)
          .map((_, i) => (
            <motion.div
              key={i}
              className="bg-gray-200 rounded h-4"
              variants={itemVariants}
              style={{ width: textWidths[i] }}
            />
          ))}
      </motion.div>
    );
  }

  return null;
};

export default SkeletonLoader;