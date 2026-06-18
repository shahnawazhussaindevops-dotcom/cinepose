import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCameraContext } from '../../lib/CameraContext';
import { useCameraStore } from '../../stores/cameraStore';
import { useLUTStore } from '../../stores/lutStore';
import { createLUTProgram, setupLUTGeometry, applyLUT } from '../lut/LUTEngine';
import { CameraDebugPanel } from './CameraDebugPanel';
import { cameraManager } from '../../lib/camera/CameraManager';
import { getPlatformInfo } from '../../lib/camera/mediaUtils';

interface CameraFeedProps {
  onFrame?: (video: HTMLVideoElement) => void;
  className?: string;
  children?: React.ReactNode;
}

const LUT_FRAME_SKIP = 2;

export function CameraFeed({ onFrame, className = '', children }: CameraFeedProps) {
  const { videoRef, canvasRef, loading, error, startCamera, isCameraReady } = useCameraContext();
  const { facingFront } = useCameraStore();
  const [showError, setShowError] = useState<string | null>(null);
  const renderLoopRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lutResourcesRef = useRef<{
    gl: WebGL2RenderingContext | null;
    program: WebGLProgram | null;
    positionBuffer: WebGLBuffer | null;
    texCoordBuffer: WebGLBuffer | null;
    texture: WebGLTexture | null;
  }>({ gl: null, program: null, positionBuffer: null, texCoordBuffer: null, texture: null });
  const frameSkipRef = useRef(0);
  const isMobileRef = useRef(false);

  useEffect(() => {
    isMobileRef.current = getPlatformInfo().isMobile;
  }, []);

  useEffect(() => {
    setShowError(error);
  }, [error]);

  useEffect(() => {
    if (isCameraReady) {
      const video = videoRef.current;
      if (video && video.paused && video.srcObject) {
        video.play().catch(() => {});
      }
    }
  }, [isCameraReady, videoRef]);

  useEffect(() => {
    if (isMobileRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const gl = canvas.getContext('webgl2', {
      preserveDrawingBuffer: true,
      alpha: false,
      antialias: true,
      powerPreference: 'high-performance',
    });

    if (gl) {
      gl.clearColor(0, 0, 0, 0);
      setupLUTPipeline(gl, video, canvas);
    }

    const renderLoop = () => {
      if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        const res = lutResourcesRef.current;

        if (res.gl && res.program && res.texture) {
          frameSkipRef.current = (frameSkipRef.current + 1) % (LUT_FRAME_SKIP + 1);
          if (frameSkipRef.current === 0) {
            const w = video.videoWidth;
            const h = video.videoHeight;
            if (canvas.width !== w || canvas.height !== h) {
              canvas.width = w;
              canvas.height = h;
            }

            const g = res.gl;
            g.bindTexture(g.TEXTURE_2D, res.texture);
            g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, video);

            const lutState = useLUTStore.getState();
            const preset = lutState.currentLUT;
            const pro = lutState.proControls;

            applyLUT(g, res.program, res.texture, {
              u_shadows: preset.colors.shadows,
              u_mids: preset.colors.mids,
              u_highlights: preset.colors.highlights,
              u_saturation: pro.saturation * preset.colors.saturation,
              u_contrast: pro.contrast + (preset.colors.contrast - 1),
              u_temperature: pro.temperature + (preset.colors.temperature - 5500),
              u_tint: pro.tint + preset.colors.tint,
              u_intensity: lutState.intensity,
              u_vignette: pro.vignette,
              u_exposure: pro.exposure,
              u_liftR: pro.lift[0],
              u_liftG: pro.lift[1],
              u_liftB: pro.lift[2],
              u_gammaR: pro.gamma[0],
              u_gammaG: pro.gamma[1],
              u_gammaB: pro.gamma[2],
            }, canvas.width, canvas.height);
          }
        }

        if (onFrame) {
          onFrame(video);
        }
      }
      renderLoopRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoopRef.current = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(renderLoopRef.current);
      const res = lutResourcesRef.current;
      if (res.gl) {
        if (res.texture) res.gl.deleteTexture(res.texture);
        if (res.positionBuffer) res.gl.deleteBuffer(res.positionBuffer);
        if (res.texCoordBuffer) res.gl.deleteBuffer(res.texCoordBuffer);
        if (res.program) res.gl.deleteProgram(res.program);
      }
      lutResourcesRef.current = { gl: null, program: null, positionBuffer: null, texCoordBuffer: null, texture: null };
    };
  }, [onFrame, videoRef, canvasRef, facingFront]);

  function setupLUTPipeline(gl: WebGL2RenderingContext, video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    const program = createLUTProgram(gl);
    if (!program) return;

    const { positionBuffer, texCoordBuffer } = setupLUTGeometry(gl);

    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const aTexCoord = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(aTexCoord);
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    lutResourcesRef.current = { gl, program, positionBuffer, texCoordBuffer, texture };
  }

  return (
    <div ref={containerRef} className={`relative w-full h-full overflow-hidden bg-black ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0D0D1A] z-20">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-2 border-[#A78BFA]/30 border-t-[#A78BFA] rounded-full animate-spin" />
              <div className="absolute inset-1 border-2 border-[#6EE7B7]/20 border-b-[#6EE7B7] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
            </div>
            <p className="text-sm text-[#6B7280] font-mono tracking-wider">INITIALIZING CAMERA...</p>
          </div>
        </div>
      )}

      {showError && !loading && !isCameraReady && (
        <CameraErrorOverlay
          error={showError}
          onRetry={() => {
            setShowError(null);
            startCamera();
          }}
        />
      )}

      <video
        ref={videoRef}
        playsInline
        webkit-playsinline="true"
        x5-playsinline="true"
        muted
        disablePictureInPicture
        width="100%"
        height="100%"
        className={`absolute inset-0 w-full h-full object-cover block ${facingFront ? 'scale-x-[-1]' : ''}`}
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ visibility: 'hidden', pointerEvents: 'none' }}
      />

      {isCameraReady && (
        <div className="absolute inset-0 pointer-events-none" style={{
          boxShadow: 'inset 0 0 100px rgba(167, 139, 250, 0.03), inset 0 0 1px rgba(167, 139, 250, 0.1)'
        }} />
      )}

      <CameraDebugPanel />
      {children}
    </div>
  );
}

function CameraErrorOverlay({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0D0D1A] z-20">
      <div className="text-center px-6 max-w-sm">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#A78BFA]/20 to-[#EF4444]/20 flex items-center justify-center border border-white/10">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        </div>
        <p className="text-[#F9FAFB] font-medium mb-1">Camera Access Needed</p>
        <p className="text-sm text-[#6B7280] mb-4">{error}</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={onRetry}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] text-white text-sm font-medium hover:opacity-90 transition-all shadow-[0_0_20px_rgba(167,139,250,0.3)]"
          >
            Try Again
          </button>
          <p className="text-[10px] text-[#4B5563]">Camera access is required for CinePose to work. Please allow camera permissions in your browser.</p>
        </div>
      </div>
    </div>
  );
}
