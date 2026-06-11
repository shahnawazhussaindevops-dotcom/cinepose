import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: boolean;
  padding?: string;
}

export function GlassCard({ children, className = '', onClick, glow = false, padding = 'p-4' }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        ${padding} rounded-2xl backdrop-blur-md
        bg-white/5 border border-white/10
        ${glow ? 'shadow-[0_0_20px_rgba(167,139,250,0.15)]' : ''}
        ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
