import React, { useEffect, useState } from 'react';

interface PunkScanningUIProps {
  onScanComplete: () => void;
}

export function PunkScanningUI({ onScanComplete }: PunkScanningUIProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onScanComplete, 400);
          return 100;
        }
        return prev + 3;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [onScanComplete]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm font-mono text-[#22D3EE] overflow-hidden pointer-events-none">
      {/* Scanning Line Animation */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#22D3EE] opacity-50 shadow-[0_0_15px_#22D3EE] animate-[scan_2s_ease-in-out_infinite]" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-4 text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#06B6D4] to-[#22D3EE] animate-pulse drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
          PUNK AI
        </div>
        <div className="text-sm tracking-widest opacity-80 mb-10 text-center px-4">
          POSE UNDERSTANDING KERNEL
        </div>

        {/* Circular Radar / Target */}
        <div className="relative w-48 h-48 mb-10 flex items-center justify-center">
          <div className="absolute inset-0 border border-[#22D3EE]/30 rounded-full animate-[spin_4s_linear_infinite]" />
          <div className="absolute inset-2 border-2 border-dashed border-[#22D3EE]/40 rounded-full animate-[spin_6s_linear_infinite_reverse]" />
          <div className="absolute inset-10 border border-[#22D3EE]/20 rounded-full" />
          
          {/* Progress text in middle */}
          <div className="text-5xl font-light tracking-tighter text-white drop-shadow-[0_0_8px_#22D3EE]">
            {progress}<span className="text-2xl text-[#22D3EE]/80">%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mb-6 relative">
          <div 
            className="absolute top-0 left-0 h-full bg-[#22D3EE] shadow-[0_0_10px_#22D3EE] transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-xs opacity-70 tracking-widest uppercase h-4">
          {progress < 25 ? 'Analyzing Environment...' : 
           progress < 50 ? 'Mapping Light & Depth...' : 
           progress < 75 ? 'Calculating Pose Vectors...' : 
           progress < 100 ? 'Synthesizing Suggestions...' :
           'Optimal Configuration Found'}
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
