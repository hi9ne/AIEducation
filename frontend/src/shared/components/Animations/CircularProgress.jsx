import React from 'react';
import { Box, Text } from '@mantine/core';
import { motion } from "framer-motion";

const CircularProgress = ({ value = 0, size = 120, strokeWidth = 12, color = '#37B34A' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(Math.max(value, 0), 100);
  const progressOffset = circumference - (progress / 100) * circumference;

  return (
    <Box
      style={{
        width: size,
        height: size,
        position: 'relative',
      }}
    >
      {/* Background circle */}
      <svg
        width={size}
        height={size}
        style={{
          transform: 'rotate(-90deg)',
          position: 'absolute',
        }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E9ECEF"
          strokeWidth={strokeWidth}
        />
      </svg>

      {/* Progress circle */}
      <motion.svg
        width={size}
        height={size}
        style={{
          transform: 'rotate(-90deg)',
          position: 'absolute',
        }}
      >
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progressOffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </motion.svg>

      {/* Percentage text */}
      <Box
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Text
            size="xl"
            weight={700}
            style={{
              fontSize: size * 0.25,
              color: '#2C2E33',
            }}
          >
            {Math.round(progress)}%
          </Text>
        </motion.div>
      </Box>
    </Box>
  );
};

export default CircularProgress;
