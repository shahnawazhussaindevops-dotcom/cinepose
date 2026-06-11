import React, { useRef, useEffect, useCallback } from 'react';
import { useCamera } from '../../hooks/useCamera';
import { useCameraStore } from '../../stores/cameraStore';

interface CameraFeedProps {
  onFrame?: (video: HTMLVideoElement) => void;
  className?: string;
}

export function CameraFeed({ onFrame, className = '' }: CameraFeedProps) {
  const { videoRef, canvasRef, loading, error, startCamera } = useCamera();
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
        <div className="absolute inset-0 flex items-center justify-center bg-[#0D0D1A]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6B7280]">Starting camera...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0D0D1A]">
          <div className="text-center px-6 max-w-sm">
            <div className="text-4xl mb-4">📷</div>
            <p className="text-[#F9FAFB] font-medium mb-2">Camera Access Needed</p>
            <p className="text-sm text-[#6B7280] mb-4">{error}</p>
            <button
              onClick={startCamera}
              className="px-6 py-2.5 rounded-full bg-[#A78BFA] text-white text-sm font-medium hover:bg-[#9678E8] transition-colors"
            >
              Try Again
            </button>
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
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full border border-[#A78BFA]/10" />
        </div>
      )}
    </div>
  );
}
