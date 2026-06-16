import { useState, useRef, useCallback, useEffect } from 'react';
import { analyzeFrameLighting } from '../components/lighting/LightingAnalysis';
import type { LightingData } from '../lib/types';
import { useCameraStore } from '../stores/cameraStore';

export function useLighting() {
  const [lighting, setLighting] = useState<LightingData | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const frameRef = useRef<number>(0);
  const analyzingRef = useRef(false);
  const { setCurrentLighting } = useCameraStore();

  const analyzeFromVideo = useCallback((video: HTMLVideoElement) => {
    if (!video || video.readyState < 2) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 320;
    canvas.height = 240;
    ctx.drawImage(video, 0, 0, 320, 240);

    const imageData = ctx.getImageData(0, 0, 320, 240);
    const result = analyzeFrameLighting(imageData);

    setLighting(result);
    setCurrentLighting(result);
  }, [setCurrentLighting]);

  const startAnalysis = useCallback((video: HTMLVideoElement) => {
    analyzingRef.current = true;
    setAnalyzing(true);

    const loop = () => {
      if (!analyzingRef.current) return;
      analyzeFromVideo(video);
      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
  }, [analyzeFromVideo]);

  const stopAnalysis = useCallback(() => {
    analyzingRef.current = false;
    setAnalyzing(false);
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      analyzingRef.current = false;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return {
    lighting,
    analyzing,
    startAnalysis,
    stopAnalysis,
    analyzeFromVideo,
  };
}
