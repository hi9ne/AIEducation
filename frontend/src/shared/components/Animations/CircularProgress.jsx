import React from 'react';
import { Box, Text, useMantineTheme } from '@mantine/core';
import { motion } from "framer-motion";

const CircularProgress = ({ value = 0, size = 120, strokeWidth = 12, color = '#37B34A', textColor }) => {
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === 'dark';
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
          stroke={isDark ? '#374151' : '#E9ECEF'}
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
        <defs>
          <linearGradient id={`gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#10b981' : '#37B34A'} />
            <stop offset="50%" stopColor={isDark ? '#059669' : '#2d8f3f'} />
            <stop offset="100%" stopColor={isDark ? '#047857' : '#1f6b2f'} />
          </linearGradient>
        </defs>
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#gradient-${size})`}
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
              color: textColor || (isDark ? '#ffffff' : '#000000'),
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
