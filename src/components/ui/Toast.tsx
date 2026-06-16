import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  duration?: number;
  onDismiss: () => void;
}

export function Toast({ message, type = 'info', duration = 2500, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const colors = {
    info: 'border-[#A78BFA]/30 text-[#A78BFA]',
    success: 'border-[#6EE7B7]/30 text-[#6EE7B7]',
    error: 'border-red-500/30 text-red-400',
    warning: 'border-[#FB923C]/30 text-[#FB923C]',
  };

  const icons = {
    info: '✦',
    success: '✓',
    error: '✕',
    warning: '⚠',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.9 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`
        fixed bottom-20 left-1/2 -translate-x-1/2 z-[100]
        px-5 py-3 rounded-xl backdrop-blur-md border
        flex items-center gap-3 shadow-lg
        bg-black/60 ${colors[type]}
      `}
    >
      <span className="text-sm">{icons[type]}</span>
      <span className="text-sm font-medium">{message}</span>
    </motion.div>
  );
}
