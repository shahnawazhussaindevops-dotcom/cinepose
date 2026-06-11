import React from 'react';
import type { TrendData, StyleTab } from '../../lib/punk-ai/types';
import { GlassCard } from '../ui/GlassCard';

interface TrendPanelProps {
  trends: TrendData[];
  trendingStyles: { style: StyleTab; engagement: number; description: string }[];
  onSelectTrend: (trend: TrendData) => void;
  onSelectStyle: (style: StyleTab) => void;
  activeStyle?: StyleTab;
}

export function TrendPanel({ trends, trendingStyles, onSelectTrend, onSelectStyle, activeStyle }: TrendPanelProps) {
  return (
    <div className="space-y-4">
      {/* Trending Styles */}
      <div>
        <h3 className="text-xs font-semibold text-[#F9FAFB] mb-2 flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F472B6" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          Trending Styles
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {trendingStyles.map((ts) => (
            <button
              key={ts.style}
              onClick={() => onSelectStyle(ts.style)}
              className={`
                px-2.5 py-1 rounded-full text-[9px] font-medium transition-all border
                ${activeStyle === ts.style
                  ? 'bg-[#A78BFA]/20 border-[#A78BFA]/40 text-[#A78BFA]'
                  : 'bg-white/5 border-white/5 text-[#6B7280] hover:text-[#F9FAFB]'
                }
              `}
            >
              {ts.style === 'InstagramTrend' ? 'Instagram' :
               ts.style === 'PinterestTrend' ? 'Pinterest' :
               ts.style} · {ts.engagement}%
            </button>
          ))}
        </div>
      </div>

      {/* Scene Trends */}
      {trends.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-[#F9FAFB] mb-2">Recommended for this scene</h3>
          <div className="space-y-2">
            {trends.map((trend, i) => (
              <button
                key={i}
                onClick={() => onSelectTrend(trend)}
                className="w-full glass rounded-xl p-3 text-left hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-medium text-[#F9FAFB]">{trend.category}</h4>
                  <span className="text-[10px] font-mono text-[#6EE7B7]">{trend.engagement}%</span>
                </div>
                <p className="text-[10px] text-[#6B7280] mb-1.5">{trend.recommendedFraming}</p>
                <div className="flex flex-wrap gap-1">
                  {trend.hashtags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[8px] text-[#A78BFA]">#{tag}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
