import React, { useState } from 'react';
import { useCameraStore } from '../../stores/cameraStore';
import { useAppStore } from '../../stores/appStore';
import { ShutterButton } from './ShutterButton';

interface CameraControlsProps {
  onCapture: () => void;
  onTogglePose: () => void;
  onToggleDrone: () => void;
  onOpenLUT: () => void;
  onTogglePUNK: () => void;
}

export function CameraControls({ onCapture, onTogglePose, onToggleDrone, onOpenLUT, onTogglePUNK }: CameraControlsProps) {
  const { isFlashOn, setFlashOn, facingFront, toggleCamera, zoom, setZoom } = useCameraStore();
  const { settings, showPoseMode, showDroneMode } = useAppStore();

  return (
    <>
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between px-4 pt-12 pb-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFlashOn(!isFlashOn)}
              className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                isFlashOn ? 'bg-[#A78BFA]/30 text-[#A78BFA]' : 'bg-white/10 text-white/70'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </button>

            <button
              className="p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
              title="Timer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </button>

            <button
              className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                settings.gridOverlay !== 'off' ? 'bg-[#A78BFA]/30 text-[#A78BFA]' : 'bg-white/10 text-white/70'
              }`}
              title="Grid"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md">
            <span className="text-xs text-[#FB923C]">✦</span>
            <span className="text-xs text-[#F9FAFB] font-medium">Golden Hour</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePUNK}
              className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                showDroneMode ? 'bg-[#A78BFA]/30 text-[#A78BFA]' : 'bg-white/10 text-white/70'
              }`}
              title="PUNK AI"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v12M6 12h12" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
              </svg>
            </button>
            <button
              onClick={onToggleDrone}
              className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                showDroneMode ? 'bg-[#6EE7B7]/30 text-[#6EE7B7]' : 'bg-white/10 text-white/70'
              }`}
              title="Drone View"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 9l10 7 10-7-10-7z" />
                <path d="M2 9v5l10 7 10-7V9" />
              </svg>
            </button>

            <button
              onClick={toggleCamera}
              className="p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
              title="Flip Camera"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="px-6 pb-8 pt-4 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-end justify-between">
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={onOpenLUT}
                className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors"
              >
                <span className="text-xs text-[#F9FAFB] font-medium">LUT</span>
              </button>
              <div className="w-6 h-0.5 rounded-full bg-[#A78BFA]/50" />
            </div>

            <ShutterButton onCapture={onCapture} />

            <div className="flex flex-col items-center gap-1">
              <button
                onClick={onTogglePose}
                className={`p-3 rounded-full backdrop-blur-md border transition-all ${
                  showPoseMode
                    ? 'bg-[#A78BFA]/30 border-[#A78BFA] shadow-[0_0_15px_rgba(167,139,250,0.3)]'
                    : 'bg-white/10 border-white/10 hover:bg-white/20'
                }`}
                title="Pose Guide"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={showPoseMode ? 'text-[#A78BFA]' : 'text-white/70'}>
                  <circle cx="12" cy="5" r="3" />
                  <path d="M12 8v4" />
                  <path d="M8 14l-3 6" />
                  <path d="M16 14l3 6" />
                  <path d="M12 12l-4 6" />
                  <path d="M12 12l4 6" />
                  <path d="M9 18l3-2 3 2" />
                </svg>
              </button>
              {showPoseMode && <div className="w-6 h-0.5 rounded-full bg-[#A78BFA]" />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
