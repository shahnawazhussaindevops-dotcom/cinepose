import React, { useEffect, useRef } from 'react';
import { useCameraContext } from '../../lib/CameraContext';
import { useCameraStore } from '../../stores/cameraStore';

interface CameraFeedProps {
  onFrame?: (video: HTMLVideoElement) => void;
  className?: string;
}

export function CameraFeed({ onFrame, className = '' }: CameraFeedProps) {
  const { videoRef, canvasRef, loading, error, startCamera } = useCameraContext();
  const { facingFront } = useCameraStore();
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!onFrame || !videoRef.current) return;
    const loop = () => {
      if (videoRef.current && onFrame) {
        onFrame(videoRef.current);
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [onFrame, videoRef]);

  return (
    <div className={`relative w-full h-full overflow-hidden bg-black ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0D0D1A] z-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6B7280]">Starting camera...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0D0D1A] z-20">
          <div className="text-center px-6 max-w-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#A78BFA]/10 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="1.5">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </div>
            <p className="text-[#F9FAFB] font-medium mb-1">Camera Access Needed</p>
            <p className="text-sm text-[#6B7280] mb-4">{error}</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={startCamera}
                className="px-6 py-2.5 rounded-full bg-[#A78BFA] text-white text-sm font-medium hover:bg-[#9678E8] transition-colors"
              >
                Try Again
              </button>
              <p className="text-[10px] text-[#4B5563]">Camera access is required for CinePose to work. Please allow camera permissions in your browser.</p>
            </div>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${facingFront ? 'scale-x-[-1]' : ''}`}
      />

      <canvas ref={canvasRef} className="hidden" />

      {!loading && !error && (
        <div className="absolute inset-0 pointer-events-none border border-[#A78BFA]/5" />
      )}
    </div>
  );
}
