/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedCard = ({ children, className = '' }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    },
    hover: {
      y: -5,
      boxShadow: '0 20px 25px -5rgba(0, 0, 0, 0.1)',
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
