import React, { useEffect } from 'react';
import { moodDetection } from '../../lib/ultra-ai/moodDetection';
import { useUltraStore } from '../../stores/ultraStore';

interface MoodDetectionBadgeProps {
  luminance: number;
  temperature: number;
  isGoldenHour: boolean;
  isBacklit: boolean;
  tiltAngle: number;
}

const MOOD_ICONS: Record<string, string> = {
  luxury: '💎', adventure: '🏔️', romantic: '💕', happy: '😊',
  confident: '💪', professional: '💼', calm: '🧘', energetic: '⚡',
  dreamy: '🌙', cinematic: '🎬', mysterious: '🔮', edgy: '🔥',
  vintage: '📷', minimal: '◻️', bold: '💥', soft: '🌸',
  dramatic: '🎭', nostalgic: '📻',
};

export function MoodDetectionBadge({ luminance, temperature, isGoldenHour, isBacklit, tiltAngle }: MoodDetectionBadgeProps) {
  const { moodResult, setMoodResult, setLastMoodType } = useUltraStore();

  useEffect(() => {
    const result = moodDetection.detect(luminance, temperature, isGoldenHour, isBacklit, tiltAngle);
    setMoodResult(result);
    setLastMoodType(result.primary);
  }, [luminance, temperature, isGoldenHour, isBacklit, tiltAngle, setMoodResult, setLastMoodType]);

  if (!moodResult) return null;

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-15 pointer-events-none">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
        <span className="text-sm">{MOOD_ICONS[moodResult.primary] || '🎯'}</span>
        <span className="text-[11px] font-medium text-[#F9FAFB] capitalize">{moodResult.primary}</span>
        <div className="w-1 h-1 rounded-full bg-white/20" />
        <span className="text-[9px] text-[#6B7280]">{moodResult.confidence}%</span>
      </div>
    </div>
  );
}
