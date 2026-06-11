import React, { useEffect } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { BottomSheet } from '../ui/BottomSheet';
import { aiCinematographer } from '../../lib/ultra-ai/cinematographer';
import { useUltraStore } from '../../stores/ultraStore';

export function AICinematographerPanel() {
  const {
    cinematographerPlan, cinematographerShotList,
    setCinematographerPlan, setCinematographerShotList,
    setActiveMode, lastLocationType, lastMoodType
  } = useUltraStore();
  const [showShotList, setShowShotList] = React.useState(false);
  const [showDetail, setShowDetail] = React.useState(false);

  useEffect(() => {
    const plan = aiCinematographer.generateShot(lastLocationType, lastMoodType, false, 0.5);
    setCinematographerPlan(plan);
    const list = aiCinematographer.generateShotList(lastLocationType, lastMoodType);
    setCinematographerShotList(list);
  }, [lastLocationType, lastMoodType, setCinematographerPlan, setCinematographerShotList]);

  if (!cinematographerPlan) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="absolute top-16 left-4 right-4 pointer-events-auto">
        <GlassCard padding="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#6EE7B7]">AI CINEMATOGRAPHER</span>
              <span className="text-[8px] text-[#6B7280] px-1.5 py-0.5 rounded-full bg-white/5">
                {cinematographerPlan.shotType.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setShowShotList(true)} className="text-[9px] text-[#6EE7B7] px-2 py-0.5 rounded-full bg-[#6EE7B7]/10 hover:bg-[#6EE7B7]/20">Shot List</button>
              <button onClick={() => setActiveMode(null)} className="text-[#6B7280] text-[9px] px-2 py-0.5 rounded-full bg-white/5 hover:text-white">✕</button>
            </div>
          </div>

          <p className="text-[10px] text-white/70 mb-1.5">{cinematographerPlan.description}</p>

          <div className="text-[9px] text-white/40 space-y-0.5">
            <p><span className="text-white/70">Movement:</span> {cinematographerPlan.cameraMovement}</p>
            <p><span className="text-white/70">Subject:</span> {cinematographerPlan.subjectPosition}</p>
            <p><span className="text-white/70">Direction:</span> {cinematographerPlan.direction}</p>
            <p><span className="text-white/70">Duration:</span> {cinematographerPlan.duration}s</p>
          </div>

          <div className="mt-2 pt-2 border-t border-white/5">
            <p className="text-[9px] text-[#6EE7B7] font-medium mb-1">Live Instructions:</p>
            {cinematographerPlan.liveInstructions.map((inst, i) => (
              <div key={i} className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[8px] text-[#6EE7B7]">🎬</span>
                <span className="text-[9px] text-white/60">{inst}</span>
              </div>
            ))}
          </div>

          <div className="mt-2 text-[9px] text-[#6B7280] italic">{cinematographerPlan.expectedResult}</div>
        </GlassCard>
      </div>

      <BottomSheet open={showShotList} onClose={() => setShowShotList(false)} title="Complete Shot List" height="70%">
        <div className="space-y-2">
          {cinematographerShotList?.map((shot, i) => (
            <button
              key={i}
              onClick={() => { setCinematographerPlan(shot); setShowShotList(false); }}
              className="w-full glass rounded-xl p-3 text-left hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-[#F9FAFB]">#{i + 1} {shot.shotType.replace(/_/g, ' ')}</span>
                <span className="text-[9px] text-[#6B7280]">{shot.duration}s</span>
              </div>
              <p className="text-[9px] text-[#6B7280]">{shot.description.slice(0, 80)}...</p>
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
