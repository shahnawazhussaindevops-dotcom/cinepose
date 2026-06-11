import React from 'react';
import type { StyleTab } from '../../lib/punk-ai/types';
import { STYLE_TABS } from './PunkPoseDatabase';

interface StyleTabsProps {
  selected: StyleTab;
  onSelect: (style: StyleTab) => void;
}

const styleColors: Record<string, string> = {
  Aesthetic: '#A78BFA', Cinematic: '#6EE7B7', Lovely: '#F472B6',
  Natural: '#34D399', Travel: '#FBBF24', Street: '#F87171',
  Luxury: '#F59E0B', Fashion: '#EC4899', Editorial: '#8B5CF6',
  Hero: '#EF4444', Minimal: '#9CA3AF', Cute: '#F9A8D4',
  Adventure: '#FB923C', Creative: '#818CF8', Drone: '#38BDF8',
  Couple: '#FB7185', Wedding: '#E879F9', InstagramTrend: '#F97316',
  PinterestTrend: '#E11D48', Viral: '#EF4444', Vintage: '#D97706',
  Retro: '#B45309', Moody: '#4B5563', Dark: '#1F2937',
  Bright: '#FCD34D', Professional: '#3B82F6', Business: '#2563EB',
  Fitness: '#10B981',
};

export function StyleTabs({ selected, onSelect }: StyleTabsProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide flex-wrap">
      {STYLE_TABS.map((style) => (
        <button
          key={style}
          onClick={() => onSelect(style)}
          className={`
            px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap
            transition-all duration-200 border
            ${selected === style
              ? 'text-white shadow-[0_0_10px_rgba(167,139,250,0.2)]'
              : 'text-[#6B7280] hover:text-[#F9FAFB] border-white/5 hover:border-white/20'
            }
          `}
          style={{
            backgroundColor: selected === style ? `${styleColors[style] || '#A78BFA'}30` : 'rgba(255,255,255,0.05)',
            borderColor: selected === style ? `${styleColors[style] || '#A78BFA'}60` : 'rgba(255,255,255,0.05)',
          }}
        >
          {style === 'InstagramTrend' ? 'Instagram' :
           style === 'PinterestTrend' ? 'Pinterest' :
           style === 'cinematic_hero' ? 'Hero' :
           style}
        </button>
      ))}
    </div>
  );
}
