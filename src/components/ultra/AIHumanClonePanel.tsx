import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { HumanoidRobot } from '../pose/HumanoidRobot';
import { POSES } from '../pose/PoseLibrary';
import { useUltraStore } from '../../stores/ultraStore';

export function AIHumanClonePanel() {
  const { setActiveMode } = useUltraStore();
  const [poseIndex, setPoseIndex] = React.useState(0);
  const currentPose = POSES[poseIndex % POSES.length];

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="absolute top-16 left-4 right-[30%] pointer-events-auto">
        <GlassCard padding="p-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-bold text-[#A78BFA]">AI HUMAN CLONE</span>
            <button onClick={() => setActiveMode(null)} className="text-[#6B7280] text-[8px] px-1.5 py-0.5 rounded-full bg-white/5 hover:text-white">✕</button>
          </div>

          {/* 3D Preview */}
          <div className="h-40 rounded-xl overflow-hidden bg-black/30 mb-2">
            <HumanoidRobot pose={currentPose} gender="neutral" animating />
          </div>

          {/* Controls */}
          <div className="flex gap-1">
            <button
              onClick={() => setPoseIndex(i => (i - 1 + POSES.length) % POSES.length)}
              className="text-[9px] px-2 py-1 rounded-full bg-white/5 text-white/50 hover:bg-white/10"
            >◀ Pose</button>
            <button
              onClick={() => setPoseIndex(i => (i + 1) % POSES.length)}
              className="text-[9px] px-2 py-1 rounded-full bg-white/5 text-white/50 hover:bg-white/10"
            >Pose ▶</button>
          </div>
          <p className="text-[8px] text-white/50 mt-1">{currentPose.name}</p>
        </GlassCard>
      </div>

      {/* Outfit Preview */}
      <div className="absolute top-16 right-4 w-[28%] pointer-events-auto">
        <GlassCard padding="p-2">
          <p className="text-[8px] text-white/70 font-medium mb-1">Outfit Test</p>
          <div className="flex gap-1 flex-wrap">
            {['Linen', 'Silk', 'Denim', 'Leather'].map((fabric, i) => (
              <button key={i} className="text-[7px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10 hover:bg-white/10">
                {fabric}
              </button>
            ))}
          </div>
          <div className="mt-1 flex gap-1">
            {['#000', '#fff', '#A78BFA', '#6EE7B7', '#FB923C'].map((color, i) => (
              <button key={i} className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: color }} />
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
