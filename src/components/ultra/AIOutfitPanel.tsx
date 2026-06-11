import React, { useEffect } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { aiOutfitAnalyzer } from '../../lib/ultra-ai/outfitAnalyzer';
import { useUltraStore } from '../../stores/ultraStore';

export function AIOutfitPanel() {
  const { outfitAnalysis, setOutfitAnalysis, setActiveMode, lastLocationType } = useUltraStore();

  useEffect(() => {
    const analysis = aiOutfitAnalyzer.analyze(lastLocationType);
    setOutfitAnalysis(analysis);
  }, [lastLocationType, setOutfitAnalysis]);

  if (!outfitAnalysis) return null;

  const scoreColor = outfitAnalysis.outfitMatchScore >= 70 ? '#6EE7B7' : outfitAnalysis.outfitMatchScore >= 50 ? '#FB923C' : '#EF4444';

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="absolute top-16 left-4 right-4 pointer-events-auto max-h-[70vh] overflow-y-auto">
        <GlassCard padding="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#FB923C]">AI OUTFIT ANALYZER</span>
              <span className="text-[8px] text-white/60 px-1.5 py-0.5 rounded-full bg-white/5" style={{ backgroundColor: `${scoreColor}20`, color: scoreColor }}>
                Match: {outfitAnalysis.outfitMatchScore}%
              </span>
            </div>
            <button onClick={() => setActiveMode(null)} className="text-[#6B7280] text-[9px] px-2 py-0.5 rounded-full bg-white/5 hover:text-white">✕</button>
          </div>

          <div className="mb-3">
            <p className="text-[9px] text-[#FB923C] font-medium mb-1.5">Recommended Outfit</p>
            <p className="text-[11px] text-white font-medium mb-1">{outfitAnalysis.recommendedOutfit}</p>
            <p className="text-[9px] text-[#6B7280]">{outfitAnalysis.explanation}</p>
          </div>

          <div className="mb-2">
            <p className="text-[9px] text-white/70 font-medium mb-1">Best Colors</p>
            <div className="flex gap-1.5 flex-wrap">
              {outfitAnalysis.recommendedColors.map((color, i) => (
                <span key={i} className="text-[8px] px-2 py-0.5 rounded-full bg-white/5 text-white/60 border border-white/10">
                  {color}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-2">
            <p className="text-[9px] text-white/70 font-medium mb-1">Accessories</p>
            <div className="flex gap-1.5 flex-wrap">
              {outfitAnalysis.recommendedAccessories.map((acc, i) => (
                <span key={i} className="text-[8px] px-2 py-0.5 rounded-full bg-white/5 text-white/60">✦ {acc}</span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[9px] text-white/70 font-medium mb-1">Footwear</p>
            <p className="text-[9px] text-[#6B7280]">{outfitAnalysis.recommendedFootwear}</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
