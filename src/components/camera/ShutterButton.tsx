import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';

interface ShutterButtonProps {
  onCapture: () => void;
  disabled?: boolean;
  size?: number;
}

export function ShutterButton({ onCapture, disabled = false, size = 76 }: ShutterButtonProps) {
  const [pressed, setPressed] = useState(false);

  const handlePress = useCallback(() => {
    if (disabled) return;
    setPressed(true);
    setTimeout(() => {
      setPressed(false);
      onCapture();
    }, 120);
  }, [disabled, onCapture]);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      onPointerDown={handlePress}
      disabled={disabled}
      className="relative outline-none"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: pressed
            ? 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(200,200,200,0.9))'
            : 'radial-gradient(circle at 30% 30%, #fff, #ddd)',
          boxShadow: pressed
            ? '0 0 0 4px rgba(167,139,250,0.5), 0 0 20px rgba(167,139,250,0.3)'
            : '0 0 0 3px rgba(255,255,255,0.5), 0 0 25px rgba(167,139,250,0.15)',
        }}
      >
        <div
          className="absolute inset-[5px] rounded-full bg-white"
          style={{
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)',
          }}
        />
      </div>
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: pressed
            ? '0 0 30px rgba(167,139,250,0.4), 0 0 60px rgba(167,139,250,0.2)'
            : '0 0 0px transparent',
        }}
        transition={{ duration: 0.2 }}
      />
      <div
        className="absolute inset-0 rounded-full transition-opacity duration-200"
        style={{
          background: 'radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)',
          opacity: pressed ? 1 : 0,
        }}
      />
    </motion.button>
  );
}
