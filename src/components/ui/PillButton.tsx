import React from 'react';

interface PillButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const variants = {
  primary: 'bg-[#A78BFA] text-white hover:bg-[#9678E8] shadow-[0_0_12px_rgba(167,139,250,0.3)]',
  secondary: 'bg-white/10 text-[#F9FAFB] hover:bg-white/20 border border-white/10',
  ghost: 'bg-transparent text-[#F9FAFB] hover:bg-white/10',
  danger: 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function PillButton({ children, onClick, variant = 'primary', size = 'md', disabled = false, className = '', icon }: PillButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-full font-medium
        transition-all duration-200
        active:scale-[0.97]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
}
