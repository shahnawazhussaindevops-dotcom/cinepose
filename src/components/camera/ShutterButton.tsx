import React, { useCallback, useState } from 'react';

interface ShutterButtonProps {
  onCapture: () => void;
  disabled?: boolean;
  size?: number;
}

export function ShutterButton({ onCapture, disabled = false, size = 72 }: ShutterButtonProps) {
  const [pressed, setPressed] = useState(false);

  const handlePress = useCallback(() => {
    if (disabled) return;
    setPressed(true);
    const timeout = setTimeout(() => {
      setPressed(false);
      onCapture();
    }, 100);
    return () => clearTimeout(timeout);
  }, [disabled, onCapture]);

  return (
    <button
      onPointerDown={handlePress}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      disabled={disabled}
      className="relative outline-none transition-transform duration-75"
      style={{
        width: size,
        height: size,
        transform: pressed ? 'scale(0.92)' : 'scale(1)',
      }}
    >
      <div
        className="absolute inset-0 rounded-full bg-white shadow-lg"
        style={{
          boxShadow: pressed
            ? '0 0 0 4px rgba(255,255,255,0.4)'
            : '0 0 0 3px rgba(255,255,255,0.6), 0 0 20px rgba(167,139,250,0.2)',
        }}
      >
        <div
          className="absolute inset-[5px] rounded-full bg-white"
          style={{
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
          }}
        />
      </div>
      <div
        className="absolute inset-0 rounded-full transition-opacity duration-200"
        style={{
          background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)',
          opacity: pressed ? 1 : 0,
        }}
      />
    </button>
  );
}
