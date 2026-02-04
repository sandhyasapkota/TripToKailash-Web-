/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';

export const LoadingButton = ({ 
  children, 
  loading = false, 
  disabled = false,
  className = '',
  onClick = () => {},
  type = 'button'
}) => {
  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${className} ${(disabled || loading) ? 'opacity-75 cursor-not-allowed' : ''}`}
      whileHover={!disabled && !loading ? { scale: 1.05 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
    >
      {loading ? (
        <motion.div
          className="flex items-center justify-center gap-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.svg
            className="w-4 h-4 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </motion.svg>
          <span>Loading...</span>
        </motion.div>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default LoadingButton;
