import React, { useEffect } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { directorVision } from '../../lib/ultra-ai/directorVision';
import { useUltraStore } from '../../stores/ultraStore';

interface DirectorVisionProps {
  isGoldenHour: boolean;
}

export function DirectorVisionPanel({ isGoldenHour }: DirectorVisionProps) {
  const { directorVision: vision, setDirectorVision, setActiveMode, lastLocationType } = useUltraStore();
  const mood = useUltraStore(s => s.lastMoodType);

  useEffect(() => {
    if (lastLocationType) {
      const result = directorVision.analyze(lastLocationType, mood, isGoldenHour);
      setDirectorVision(result);
    }
  }, [lastLocationType, mood, isGoldenHour, setDirectorVision]);

  if (!vision) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="absolute top-16 left-4 right-4 pointer-events-auto max-h-[70vh] overflow-y-auto">
        <GlassCard padding="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#A78BFA]">DIRECTOR VISION</span>
              <span className="text-[8px] text-white/60 px-1.5 py-0.5 rounded-full bg-white/5">
                {vision.storyType}
              </span>
            </div>
            <button onClick={() => setActiveMode(null)} className="text-[#6B7280] text-[9px] px-2 py-0.5 rounded-full bg-white/5 hover:text-white">✕</button>
          </div>

          <div className="mb-3">
            <p className="text-[9px] text-[#A78BFA] font-medium mb-1">Visual Storytelling</p>
            <p className="text-[11px] text-white/80 leading-relaxed">{vision.storytellingPotential}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <p className="text-[9px] text-white/70 font-medium mb-1">Foreground</p>
              {vision.foregroundElements.map((el, i) => (
                <p key={i} className="text-[8px] text-[#6B7280]">• {el}</p>
              ))}
            </div>
            <div>
              <p className="text-[9px] text-white/70 font-medium mb-1">Background</p>
              {vision.backgroundElements.map((el, i) => (
                <p key={i} className="text-[8px] text-[#6B7280]">• {el}</p>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <p className="text-[9px] text-white/70 font-medium mb-1">Color Palette</p>
            <div className="flex gap-1.5">
              {vision.colorPalette.map((color, i) => (
                <span key={i} className="text-[8px] px-2 py-0.5 rounded-full bg-white/5 text-white/60 border border-white/10">
                  {color}
                </span>
              ))}
            </div>
          </div>

          <div className="text-[9px] text-white/50 space-y-0.5 mb-2">
            <p><span className="text-white/70">Atmosphere:</span> {vision.atmosphere}</p>
            <p><span className="text-white/70">Theme:</span> {vision.visualTheme}</p>
          </div>

          <div className="pt-2 border-t border-white/5">
            <p className="text-[10px] text-white/80 italic">{vision.suggestion}</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
