import React from 'react';
import type { LightingCondition } from '../../lib/types';
import { t } from '../../lib/i18n';

interface LightingBadgeProps {
  condition: LightingCondition;
  timeRemaining?: number;
  suggestion?: string;
}

const conditionConfig: Record<LightingCondition, { icon: string; color: string; labelKey: string }> = {
  golden_hour: { icon: '☀', color: '#FB923C', labelKey: 'camera.golden_hour' },
  blue_hour: { icon: '🌙', color: '#818CF8', labelKey: 'camera.blue_hour' },
  bright_daylight: { icon: '☀', color: '#FBBF24', labelKey: 'camera.harsh_midday' },
  harsh_midday: { icon: '☀', color: '#F87171', labelKey: 'camera.harsh_midday' },
  overcast: { icon: '☁', color: '#9CA3AF', labelKey: 'camera.overcast' },
  indoor_low_light: { icon: '💡', color: '#FBBF24', labelKey: 'camera.indoor_low' },
  indoor_tungsten: { icon: '💡', color: '#FB923C', labelKey: 'camera.indoor_low' },
  indoor_fluorescent: { icon: '💡', color: '#A3E635', labelKey: 'camera.indoor_low' },
  backlit: { icon: '↗', color: '#A78BFA', labelKey: 'camera.golden_hour' },
  side_lit: { icon: '→', color: '#6EE7B7', labelKey: 'camera.golden_hour' },
  front_lit: { icon: '↓', color: '#60A5FA', labelKey: 'camera.golden_hour' },
};

export function LightingBadge({ condition, timeRemaining, suggestion }: LightingBadgeProps) {
  const config = conditionConfig[condition];
  if (!config) return null;

  return (
    <div className="flex flex-col items-center">
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md"
        style={{ backgroundColor: `${config.color}15`, borderColor: `${config.color}30`, border: '1px solid' }}
      >
        <span className="text-xs">{config.icon}</span>
        <span className="text-xs font-medium" style={{ color: config.color }}>
          {t(config.labelKey)}
        </span>
        {timeRemaining && (
          <span className="text-[10px] text-white/50">{timeRemaining}min</span>
        )}
      </div>
      {suggestion && (
        <p className="text-[10px] text-white/60 mt-1 max-w-[200px] text-center leading-tight">
          {suggestion}
        </p>
      )}
    </div>
  );
}
