import React, { useEffect } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { aiReelGenerator } from '../../lib/ultra-ai/reelGenerator';
import { useUltraStore } from '../../stores/ultraStore';

interface AIReelGeneratorProps {
  isGoldenHour: boolean;
}

export function AIReelGeneratorPanel({ isGoldenHour }: AIReelGeneratorProps) {
  const { reelPlan, setReelPlan, setActiveMode, lastLocationType, lastMoodType } = useUltraStore();

  useEffect(() => {
    const plan = aiReelGenerator.generate(lastLocationType, lastMoodType, isGoldenHour);
    setReelPlan(plan);
  }, [lastLocationType, lastMoodType, isGoldenHour, setReelPlan]);

  if (!reelPlan) return null;

  const FORMAT_LABELS: Record<string, string> = {
    instagram_reels: 'Instagram Reel', youtube_shorts: 'YouTube Short',
    tiktok: 'TikTok', facebook_reels: 'Facebook Reel',
    travel_vlog: 'Travel Vlog', luxury_content: 'Luxury Content',
  };

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="absolute top-16 left-4 right-4 pointer-events-auto max-h-[70vh] overflow-y-auto">
        <GlassCard padding="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#FB923C]">AI REEL GENERATOR</span>
              <span className="text-[8px] text-white/60 px-1.5 py-0.5 rounded-full bg-white/5">
                {FORMAT_LABELS[reelPlan.format]}
              </span>
              <span className="text-[8px] text-[#6EE7B7]">~{reelPlan.duration}s</span>
            </div>
            <button onClick={() => setActiveMode(null)} className="text-[#6B7280] text-[9px] px-2 py-0.5 rounded-full bg-white/5 hover:text-white">✕</button>
          </div>

          {/* Shot Sequence */}
          <div className="mb-3">
            <p className="text-[9px] text-[#FB923C] font-medium mb-1.5">Shot Sequence</p>
            <div className="space-y-1">
              {reelPlan.shotSequence.map((shot, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[8px] text-[#FB923C] font-mono shrink-0 mt-0.5">{(i + 1).toString().padStart(2, '0')}</span>
                  <span className="text-[9px] text-white/70">{shot}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transitions */}
          <div className="mb-3">
            <p className="text-[9px] text-white/70 font-medium mb-1">Transitions</p>
            <div className="flex gap-1.5 flex-wrap">
              {reelPlan.transitions.map((t, i) => (
                <span key={i} className="text-[8px] px-2 py-0.5 rounded-full bg-white/5 text-white/50">✦ {t}</span>
              ))}
            </div>
          </div>

          {/* Music */}
          <div className="mb-3">
            <p className="text-[9px] text-white/70 font-medium mb-1">Music Suggestions</p>
            <div className="flex gap-1.5 flex-wrap">
              {reelPlan.musicSuggestions.map((m, i) => (
                <span key={i} className="text-[8px] px-2 py-0.5 rounded-full bg-white/5 text-white/50">♪ {m}</span>
              ))}
            </div>
          </div>

          {/* Text Overlays */}
          <div className="mb-2">
            <p className="text-[9px] text-white/70 font-medium mb-1">Text Overlays</p>
            <div className="flex gap-1.5 flex-wrap">
              {reelPlan.textOverlays.map((t, i) => (
                <span key={i} className="text-[8px] px-2 py-0.5 rounded-full bg-white/5 text-[#6EE7B7]">{t}</span>
              ))}
            </div>
          </div>

          {/* Color Grading */}
          <div className="pt-2 border-t border-white/5">
            <p className="text-[9px] text-white/70 font-medium mb-1">Color Grade</p>
            <p className="text-[8px] text-[#6B7280] leading-relaxed">{reelPlan.colorGrading}</p>
          </div>

          {/* Engagement Estimate */}
          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-[8px] text-white/40">Estimated Engagement</span>
            <span className="text-[10px] font-bold text-[#6EE7B7]">{reelPlan.estimatedEngagement}%</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
