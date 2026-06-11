import React, { useEffect } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { aiLocationIntel } from '../../lib/ultra-ai/locationIntel';
import { useUltraStore } from '../../stores/ultraStore';

interface AILocationPanelProps {
  luminance: number;
  temperature: number;
  isGoldenHour: boolean;
  tiltAngle: number;
}

export function AILocationPanel({ luminance, temperature, isGoldenHour, tiltAngle }: AILocationPanelProps) {
  const { locationAnalysis, setLocationAnalysis, setLastLocationType, setActiveMode } = useUltraStore();

  useEffect(() => {
    const analysis = aiLocationIntel.analyze(luminance, temperature, isGoldenHour, tiltAngle);
    setLocationAnalysis(analysis);
    setLastLocationType(analysis.locationType);
  }, [luminance, temperature, isGoldenHour, tiltAngle, setLocationAnalysis, setLastLocationType]);

  if (!locationAnalysis) return null;

  const ScoreBar = ({ label, score }: { label: string; score: number }) => (
    <div className="flex items-center gap-2">
      <span className="text-[8px] text-white/50 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${score}%`,
            background: score >= 80 ? 'linear-gradient(90deg, #6EE7B7, #A78BFA)' : score >= 60 ? 'linear-gradient(90deg, #FB923C, #FCD34D)' : '#6B7280',
          }}
        />
      </div>
      <span className="text-[8px] font-mono text-white/60 w-7 text-right">{score}</span>
    </div>
  );

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="absolute top-16 left-4 right-4 pointer-events-auto max-h-[70vh] overflow-y-auto">
        <GlassCard padding="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#6EE7B7]">AI LOCATION INTELLIGENCE</span>
              <span className="text-[8px] text-white/60 px-1.5 py-0.5 rounded-full bg-white/5">
                {locationAnalysis.locationType.replace(/_/g, ' ')}
              </span>
            </div>
            <button onClick={() => setActiveMode(null)} className="text-[#6B7280] text-[9px] px-2 py-0.5 rounded-full bg-white/5 hover:text-white">✕</button>
          </div>

          <p className="text-[11px] text-white font-medium mb-2">{locationAnalysis.locationName}</p>

          <div className="space-y-1 mb-3">
            <ScoreBar label="Cinematic" score={locationAnalysis.scores.cinematic} />
            <ScoreBar label="Instagram" score={locationAnalysis.scores.instagram} />
            <ScoreBar label="Travel" score={locationAnalysis.scores.travel} />
            <ScoreBar label="Romantic" score={locationAnalysis.scores.romantic} />
            <ScoreBar label="Luxury" score={locationAnalysis.scores.luxury} />
            <ScoreBar label="Drone" score={locationAnalysis.scores.drone} />
            <ScoreBar label="Sunset" score={locationAnalysis.scores.sunset} />
          </div>

          <div className="text-[9px] text-white/50 space-y-0.5">
            <p><span className="text-white/70">Weather:</span> {locationAnalysis.weather}</p>
            <p><span className="text-white/70">Best Time:</span> {locationAnalysis.bestTimeToShoot}</p>
          </div>

          <div className="mt-2 pt-2 border-t border-white/5">
            <p className="text-[9px] text-white/70 font-medium mb-1">Tips</p>
            {locationAnalysis.tips.map((tip, i) => (
              <p key={i} className="text-[8px] text-[#6B7280]">• {tip}</p>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
