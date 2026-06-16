import React, { useState, useRef, useEffect } from 'react';
import { useLUTStore } from '../../stores/lutStore';
import { useCameraStore } from '../../stores/cameraStore';
import { LUT_PRESETS } from '../lut/LUTPresets';
import { createLUTProgram, setupLUTGeometry, applyLUT } from '../lut/LUTEngine';

interface GradedImageProps {
  photoUri: string;
}

function GradedImage({ photoUri }: GradedImageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const { currentLUT, intensity, proControls } = useLUTStore();

  useEffect(() => {
    const img = new Image();
    img.src = photoUri;
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      render();
    };
  }, [photoUri]);

  useEffect(() => {
    render();
  }, [currentLUT, intensity, proControls]);

  const render = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    canvas.width = img.naturalWidth || 800;
    canvas.height = img.naturalHeight || 600;

    const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true });
    if (!gl) return;

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
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    const preset = currentLUT;
    const pro = proControls;

    const params = {
      u_shadows: preset.colors.shadows,
      u_mids: preset.colors.mids,
      u_highlights: preset.colors.highlights,
      u_saturation: pro.saturation * preset.colors.saturation,
      u_contrast: pro.contrast + (preset.colors.contrast - 1),
      u_temperature: pro.temperature + (preset.colors.temperature - 5500),
      u_tint: pro.tint + preset.colors.tint,
      u_intensity: intensity,
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

    gl.deleteTexture(texture);
    gl.deleteBuffer(positionBuffer);
    gl.deleteBuffer(texCoordBuffer);
    gl.deleteProgram(program);
  };

  return <canvas ref={canvasRef} className="w-full h-full object-contain" />;
}

export function StudioView() {
  const { currentLUT, setCurrentLUT, proControls, setProControl, resetProControls, intensity, setIntensity } = useLUTStore();
  const photosTaken = useCameraStore((s) => s.photosTaken);
  const [selectedPhoto, setSelectedPhoto] = useState(photosTaken[0] || null);

  const sliders = [
    { key: 'exposure', label: 'Exposure', min: -2, max: 2, step: 0.05 },
    { key: 'contrast', label: 'Contrast', min: -0.5, max: 0.5, step: 0.01 },
    { key: 'saturation', label: 'Saturation', min: 0, max: 2, step: 0.01 },
    { key: 'temperature', label: 'Temperature', min: 2500, max: 9500, step: 50 },
    { key: 'vignette', label: 'Vignette', min: 0, max: 1, step: 0.01 },
  ] as const;

  return (
    <>
      <main className="px-4 pt-6 pb-32">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[#F9FAFB]">Color Studio</h1>
          <button className="px-4 py-2 rounded-full bg-[#A78BFA] text-white text-xs font-medium">Export .cube</button>
        </div>

        {/* Studio Viewport */}
        <div className="aspect-[3/4] rounded-2xl bg-[#111827] mb-4 flex items-center justify-center overflow-hidden border border-white/5">
          {selectedPhoto ? (
            <GradedImage photoUri={selectedPhoto.uri} />
          ) : (
            <div className="text-center p-8">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5" className="mx-auto mb-3">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <p className="text-sm text-[#6B7280] mb-2">Take a photo first, then grade it here</p>
            </div>
          )}
        </div>

        {/* Thumbnail Selector */}
        {photosTaken.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-[#6B7280] mb-2">Select Photo</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {photosTaken.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedPhoto?.id === photo.id ? 'border-[#A78BFA]' : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <img src={photo.thumbnail} className="w-full h-full object-cover" alt="Captured thumbnail" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {sliders.map(({ key, label, min, max, step }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xs text-[#6B7280] w-20">{label}</span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={(proControls as any)[key] ?? 0}
                onChange={(e) => setProControl(key as any, parseFloat(e.target.value))}
                className="flex-1 accent-[#A78BFA]"
              />
              <span className="text-xs text-[#F9FAFB] w-10 text-right font-mono">
                {(proControls as any)[key]?.toFixed?.(1) ?? (proControls as any)[key]}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-[#F9FAFB] mb-3">LUT Presets</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {LUT_PRESETS.map((lut) => (
              <button
                key={lut.id}
                onClick={() => setCurrentLUT(lut)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs border transition-colors ${
                  currentLUT.id === lut.id
                    ? 'bg-[#A78BFA]/20 border-[#A78BFA]/30 text-[#A78BFA]'
                    : 'bg-white/5 border-white/10 text-[#F9FAFB] hover:bg-white/10'
                }`}
              >
                {lut.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6B7280] w-20">Intensity</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={intensity}
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              className="flex-1 accent-[#A78BFA]"
            />
            <span className="text-xs text-[#F9FAFB] w-10 text-right font-mono">{intensity.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={resetProControls} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-xs text-[#F9FAFB] border border-white/10">
            Reset
          </button>
        </div>
      </main>
    </>
  );
}
