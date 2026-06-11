import React, { useEffect } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { aiPhotographer } from '../../lib/ultra-ai/photographer';
import { useUltraStore } from '../../stores/ultraStore';

interface AIPhotographerPanelProps {
  luminance: number;
  temperature: number;
}

export function AIPhotographerPanel({ luminance, temperature }: AIPhotographerPanelProps) {
  const { photographerAnalysis, setPhotographerAnalysis, setActiveMode } = useUltraStore();

  useEffect(() => {
    const analysis = aiPhotographer.analyzeScene(luminance, temperature, true, true);
    setPhotographerAnalysis(analysis);
  }, [luminance, temperature, setPhotographerAnalysis]);

  if (!photographerAnalysis) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="absolute top-16 left-4 right-4 pointer-events-auto">
        <GlassCard padding="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#A78BFA]">AI PHOTOGRAPHER</span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${
                photographerAnalysis.qualityScore >= 70 ? 'bg-[#6EE7B7]/20 text-[#6EE7B7]' : 'bg-[#FB923C]/20 text-[#FB923C]'
              }`}>
                Score: {photographerAnalysis.qualityScore}/100
              </span>
            </div>
            <button onClick={() => setActiveMode(null)} className="text-[#6B7280] text-[9px] px-2 py-0.5 rounded-full bg-white/5 hover:text-white">✕</button>
          </div>

          {/* Live guidance */}
          {photographerAnalysis.liveGuidance.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] text-[#6EE7B7] font-medium mb-1">Live Guidance:</p>
              {photographerAnalysis.liveGuidance.map((g, i) => (
                <div key={i} className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6EE7B7]" />
                  <span className="text-[10px] text-white/80">{g}</span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5">
            <div className="text-[9px] text-white/40">
              <span className="text-white/70">Composition: </span>
              {photographerAnalysis.compositionScore}/100
            </div>
            <div className="text-[9px] text-white/40">
              <span className="text-white/70">Pose: </span>
              {photographerAnalysis.poseScore}/100
            </div>
            <div className="text-[9px] text-white/40">
              <span className="text-white/70">Social: </span>
              {photographerAnalysis.socialScore}/100
            </div>
            <div className="text-[9px] text-white/40">
              <span className="text-white/70">Blur: </span>
              {photographerAnalysis.blurDetected ? '⚠ Detected' : '✓ Clean'}
            </div>
          </div>

          {photographerAnalysis.suggestions.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/5">
              <p className="text-[9px] text-[#FB923C] font-medium mb-1">Suggestions:</p>
              {photographerAnalysis.suggestions.map((s, i) => (
                <p key={i} className="text-[9px] text-[#6B7280]">• {s}</p>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
