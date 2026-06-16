import React, { useEffect, useRef, useState } from 'react';
import { useCameraContext } from '../../lib/CameraContext';
import { useCameraStore } from '../../stores/cameraStore';
import { useLUTStore } from '../../stores/lutStore';
import { createLUTProgram, setupLUTGeometry, applyLUT } from '../lut/LUTEngine';

interface CameraFeedProps {
  onFrame?: (video: HTMLVideoElement) => void;
  className?: string;
  children?: React.ReactNode;
}

export function CameraFeed({ onFrame, className = '', children }: CameraFeedProps) {
  const { videoRef, canvasRef, loading, error, startCamera } = useCameraContext();
  const { facingFront } = useCameraStore();
  const [webglSupported, setWebglSupported] = useState(true);
  const renderLoopRef = useRef<number>(0);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || loading || error) return;

    // Try initializing WebGL2 context
    const gl = canvas.getContext('webgl2', {
      preserveDrawingBuffer: true,
      alpha: false,
      antialias: true,
      powerPreference: 'high-performance',
    });

    if (!gl) {
      console.warn('WebGL2 not supported, using standard video element.');
      setWebglSupported(false);
      return;
    }

    setWebglSupported(true);

    const program = createLUTProgram(gl);
    if (!program) {
      setWebglSupported(false);
      return;
    }

    const { positionBuffer, texCoordBuffer } = setupLUTGeometry(gl);

    // Setup attributes
    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const aTexCoord = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(aTexCoord);
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);

    // Setup input frame texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const render = () => {
      if (video.readyState >= 2) {
        // Match canvas dimensions to video
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        // Upload new frame
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

        // Fetch LUT & pro parameters
        const lutState = useLUTStore.getState();
        const preset = lutState.currentLUT;
        const pro = lutState.proControls;

        const params = {
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
          u_gainR: pro.gain[0],
          u_gainG: pro.gain[1],
          u_gainB: pro.gain[2],
        };

        applyLUT(gl, program, texture, params, canvas.width, canvas.height);

        if (onFrame) {
          onFrame(video);
        }
      }
      renderLoopRef.current = requestAnimationFrame(render);
    };

    renderLoopRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(renderLoopRef.current);
      gl.deleteTexture(texture);
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(texCoordBuffer);
      gl.deleteProgram(program);
    };
  }, [onFrame, videoRef, canvasRef, loading, error]);

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

      {/* Render raw video in offscreen/hidden state if WebGL works, otherwise show it normally */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={
          webglSupported
            ? 'absolute top-0 left-0 w-1 h-1 opacity-0 pointer-events-none'
            : `w-full h-full object-cover ${facingFront ? 'scale-x-[-1]' : ''}`
        }
      />

      {/* WebGL viewport canvas */}
      <canvas
        ref={canvasRef}
        className={
          webglSupported
            ? `w-full h-full object-cover ${facingFront ? 'scale-x-[-1]' : ''}`
            : 'hidden'
        }
      />

      {!loading && !error && (
        <div className="absolute inset-0 pointer-events-none border border-[#A78BFA]/5" />
      )}

      {children}
    </div>
  );
}
