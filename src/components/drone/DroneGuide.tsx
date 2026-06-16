import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';

type DroneMode = 'frame_overlay' | 'cinematic_guide';

interface DroneGuideProps {
  active: boolean;
  onClose: () => void;
}

const movementPatterns = [
  { id: 'spiral', label: 'Spiral Out', icon: '🌀', duration: 8 },
  { id: 'flyover', label: 'Fly Over', icon: '✈', duration: 6 },
  { id: 'topdown', label: 'Top Down', icon: '⬇', duration: 5 },
];

export function DroneGuide({ active, onClose }: DroneGuideProps) {
  const [mode, setMode] = useState<DroneMode>('frame_overlay');
  const [selectedPattern, setSelectedPattern] = useState<string>('spiral');
  const [keyframes, setKeyframes] = useState<number>(0);

  if (!active) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="0" y1="50" x2="100" y2="50" stroke="#6EE7B7" strokeWidth="0.3" opacity="0.4" />
          <line x1="0" y1="30" x2="100" y2="30" stroke="#6EE7B7" strokeWidth="0.2" opacity="0.2" />
          <line x1="0" y1="70" x2="100" y2="70" stroke="#6EE7B7" strokeWidth="0.2" opacity="0.2" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#6EE7B7" strokeWidth="0.3" opacity="0.4" />
          <text x="50" y="8" textAnchor="middle" fill="#6EE7B7" fontSize="3" opacity="0.6">N</text>
          <text x="92" y="52" textAnchor="middle" fill="#6EE7B7" fontSize="3" opacity="0.6">E</text>
          <text x="50" y="96" textAnchor="middle" fill="#6EE7B7" fontSize="3" opacity="0.6">S</text>
          <text x="8" y="52" textAnchor="middle" fill="#6EE7B7" fontSize="3" opacity="0.6">W</text>
          <rect x="25" y="25" width="50" height="50" fill="none" stroke="#6EE7B7" strokeWidth="0.15" opacity="0.15" strokeDasharray="2,2" />
        </svg>
      </div>

      <div className="absolute bottom-24 left-4 right-4 pointer-events-auto">
        <GlassCard padding="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#6EE7B7]">Drone Guide</h3>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setMode('frame_overlay')}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                    mode === 'frame_overlay'
                      ? 'bg-[#6EE7B7]/20 text-[#6EE7B7]'
                      : 'bg-white/5 text-[#6B7280]'
                  }`}
                >
                  Frame Overlay
                </button>
                <button
                  onClick={() => setMode('cinematic_guide')}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                    mode === 'cinematic_guide'
                      ? 'bg-[#6EE7B7]/20 text-[#6EE7B7]'
                      : 'bg-white/5 text-[#6B7280]'
                  }`}
                >
                  Cinematic Guide
                </button>
              </div>
            </div>

            {mode === 'frame_overlay' && (
              <div className="flex gap-2">
                {movementPatterns.map((pattern) => (
                  <button
                    key={pattern.id}
                    onClick={() => setSelectedPattern(pattern.id)}
                    className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                      selectedPattern === pattern.id
                        ? 'bg-[#6EE7B7]/15 border border-[#6EE7B7]/30'
                        : 'bg-white/5 border border-white/5'
                    }`}
                  >
                    <span className="text-lg">{pattern.icon}</span>
                    <span className="text-[9px] text-white/70 text-center">{pattern.label}</span>
                    <span className="text-[8px] text-white/40">{pattern.duration}s</span>
                  </button>
                ))}
              </div>
            )}

            {mode === 'cinematic_guide' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/70">Keyframes: {keyframes}/5</span>
                  {keyframes > 0 && (
                    <span className="text-[10px] text-[#6EE7B7]">✓ Preview Reel</span>
                  )}
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`flex-1 h-1.5 rounded-full transition-colors ${
                        i < keyframes ? 'bg-[#6EE7B7]' : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setKeyframes(Math.min(keyframes + 1, 5))}
                  className="w-full py-2 rounded-xl bg-[#6EE7B7]/20 text-[#6EE7B7] text-xs font-medium hover:bg-[#6EE7B7]/30 transition-colors"
                >
                  Start Capture
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full text-center text-[10px] text-white/40 hover:text-white/70 transition-colors"
            >
              Close
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
