import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  duration?: number;
  onDismiss: () => void;
}

export function Toast({ message, type = 'info', duration = 2500, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const colors = {
    info: 'bg-[#A78BFA]/20 border-[#A78BFA]/30 text-[#A78BFA]',
    success: 'bg-[#6EE7B7]/20 border-[#6EE7B7]/30 text-[#6EE7B7]',
    error: 'bg-red-500/20 border-red-500/30 text-red-400',
    warning: 'bg-[#FB923C]/20 border-[#FB923C]/30 text-[#FB923C]',
  };

  const icons = {
    info: '✦',
    success: '✓',
    error: '✕',
    warning: '⚠',
  };

  return (
    <div
      className={`
        fixed bottom-20 left-1/2 -translate-x-1/2 z-[100]
        px-5 py-3 rounded-xl backdrop-blur-md border
        flex items-center gap-3 shadow-lg
        transition-all duration-300
        ${colors[type]}
        ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
    >
      <span className="text-sm">{icons[type]}</span>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
