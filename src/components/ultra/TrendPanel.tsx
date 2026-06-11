import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { trendIntegration } from '../../lib/ultra-ai/trendIntegration';
import { useUltraStore } from '../../stores/ultraStore';

export function TrendPanel() {
  const { setActiveMode } = useUltraStore();
  const topTrends = trendIntegration.getTopTrends(6);

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="absolute top-16 left-4 right-4 pointer-events-auto max-h-[70vh] overflow-y-auto">
        <GlassCard padding="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#F472B6]">INSTAGRAM & PINTEREST TRENDS</span>
            </div>
            <button onClick={() => setActiveMode(null)} className="text-[#6B7280] text-[9px] px-2 py-0.5 rounded-full bg-white/5 hover:text-white">✕</button>
          </div>

          <div className="space-y-2">
            {topTrends.map((trend, i) => (
              <div key={i} className="glass rounded-xl p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-white font-medium">{trend.trendName}</span>
                    <span className={`text-[7px] px-1.5 py-0.5 rounded-full ${
                      trend.platform === 'instagram' ? 'bg-gradient-to-r from-[#F472B6]/20 to-[#FB923C]/20 text-[#F472B6]' : 'bg-[#EF4444]/20 text-[#EF4444]'
                    }`}>
                      {trend.platform}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-[#6EE7B7]">{trend.engagement}%</span>
                </div>

                <div className="flex gap-1 flex-wrap mb-1">
                  {trend.styleTags.map((tag, j) => (
                    <span key={j} className="text-[7px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/40">{tag}</span>
                  ))}
                </div>

                <div className="flex gap-1 flex-wrap">
                  {trend.hashtags.slice(0, 3).map((tag, j) => (
                    <span key={j} className="text-[7px] text-[#A78BFA]">#{tag.replace('#', '')}</span>
                  ))}
                  {trend.hashtags.length > 3 && (
                    <span className="text-[7px] text-[#4B5563]">+{trend.hashtags.length - 3}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
