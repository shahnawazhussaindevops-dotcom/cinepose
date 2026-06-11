import React, { useEffect } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { masterSceneAnalyzer } from '../../lib/ultra-ai/masterSceneAnalyzer';
import { useUltraStore } from '../../stores/ultraStore';

interface MasterScenePanelProps {
  luminance: number;
  temperature: number;
  isGoldenHour: boolean;
  isBacklit: boolean;
  tiltAngle: number;
}

export function MasterScenePanel({ luminance, temperature, isGoldenHour, isBacklit, tiltAngle }: MasterScenePanelProps) {
  const { masterResult, setMasterResult, setActiveMode } = useUltraStore();

  useEffect(() => {
    const result = masterSceneAnalyzer.analyze(luminance, temperature, isGoldenHour, isBacklit, tiltAngle);
    setMasterResult(result);
  }, [luminance, temperature, isGoldenHour, isBacklit, tiltAngle, setMasterResult]);

  if (!masterResult) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="absolute top-16 left-4 right-4 pointer-events-auto max-h-[75vh] overflow-y-auto">
        <GlassCard padding="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-gradient-to-r from-[#A78BFA] to-[#6EE7B7] bg-clip-text text-transparent">MASTER SCENE ANALYZER</span>
            </div>
            <button onClick={() => setActiveMode(null)} className="text-[#6B7280] text-[9px] px-2 py-0.5 rounded-full bg-white/5 hover:text-white">✕</button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { label: 'Location', value: masterResult.location.locationName },
              { label: 'Mood', value: masterResult.mood },
              { label: 'Lighting', value: masterResult.lighting },
              { label: 'Camera Angle', value: masterResult.bestCameraAngle },
              { label: 'Lens', value: masterResult.bestLens },
              { label: 'LUT', value: masterResult.bestLUT },
            ].map((item, i) => (
              <div key={i} className="glass rounded-lg p-2">
                <p className="text-[7px] text-[#6B7280] mb-0.5">{item.label}</p>
                <p className="text-[9px] text-white/80">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-2">
            <div className="glass rounded-lg p-2">
              <p className="text-[7px] text-[#A78BFA] font-medium mb-0.5">Best Pose</p>
              <p className="text-[9px] text-white/70">{masterResult.bestPose}</p>
            </div>
            <div className="glass rounded-lg p-2">
              <p className="text-[7px] text-[#6EE7B7] font-medium mb-0.5">Storytelling Concept</p>
              <p className="text-[9px] text-white/70">{masterResult.bestStorytellingConcept}</p>
            </div>
            <div className="glass rounded-lg p-2">
              <p className="text-[7px] text-[#FB923C] font-medium mb-0.5">Reel Idea</p>
              <p className="text-[9px] text-white/70">{masterResult.bestReelIdea}</p>
            </div>
            <div className="glass rounded-lg p-2">
              <p className="text-[7px] text-[#A78BFA] font-medium mb-0.5">Hollywood Direction</p>
              <p className="text-[9px] text-white/70">{masterResult.bestHollywoodDirection}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5">
            <p className="text-[9px] font-medium text-[#A78BFA] mb-1">Recommendation</p>
            <p className="text-[10px] text-white/70 leading-relaxed">{masterResult.overallRecommendation}</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
