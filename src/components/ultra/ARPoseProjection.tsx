import React from 'react';
import { useUltraStore } from '../../stores/ultraStore';
import { POSES } from '../pose/PoseLibrary';

interface ARPoseProjectionProps {
  visible: boolean;
}

export function ARPoseProjection({ visible }: ARPoseProjectionProps) {
  const { setActiveMode } = useUltraStore();
  const [currentPoseIndex, setCurrentPoseIndex] = React.useState(0);
  const currentPose = POSES[currentPoseIndex % POSES.length];

  if (!visible) return null;

  const joint = currentPose.joints;

  return (
    <div className="absolute inset-0 z-15 pointer-events-none">
      {/* Holographic pose overlay on camera */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 140" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="hologlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#6EE7B7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.3" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ground circle */}
        <ellipse cx="50" cy="120" rx="8" ry="2" fill="none" stroke="#6EE7B7" strokeOpacity="0.2" strokeWidth="0.3" />

        {/* Joints */}
        {joint.map((j, i) => (
          <circle
            key={i}
            cx={50 + j.x * 30}
            cy={10 + (1 - j.y) * 100}
            r={1.5}
            fill="#A78BFA"
            opacity={0.7}
            filter="url(#glow)"
          />
        ))}

        {/* Bones */}
        {joint.slice(0, -1).map((j, i) => {
          const next = joint[(i + 1) % joint.length];
          return (
            <line
              key={`bone-${i}`}
              x1={50 + j.x * 30}
              y1={10 + (1 - j.y) * 100}
              x2={50 + next.x * 30}
              y2={10 + (1 - next.y) * 100}
              stroke="#6EE7B7"
              strokeOpacity={0.3}
              strokeWidth={0.8}
            />
          );
        })}

        {/* Pose hint text */}
        <text x="50" y="135" textAnchor="middle" fill="#A78BFA" fontSize="2.5" opacity="0.6">
          {currentPose.name}
        </text>
      </svg>

      {/* Controls */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 pointer-events-auto z-20">
        <div className="flex items-center gap-3 glass rounded-full px-4 py-2">
          <button
            onClick={() => setCurrentPoseIndex(i => (i - 1 + POSES.length) % POSES.length)}
            className="text-white/60 hover:text-white text-sm"
          >
            ◀
          </button>
          <span className="text-[10px] text-white/70">AR Pose Guide</span>
          <button
            onClick={() => setCurrentPoseIndex(i => (i + 1) % POSES.length)}
            className="text-white/60 hover:text-white text-sm"
          >
            ▶
          </button>
          <button
            onClick={() => setActiveMode(null)}
            className="text-[9px] text-[#6B7280] hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
