import React, { createContext, useContext, useState, useRef, useCallback, useEffect, type ReactNode } from 'react';
import { useCameraStore } from '../stores/cameraStore';
import { useLUTStore } from '../stores/lutStore';
import { cameraManager } from './camera/CameraManager';

interface CameraContextValue {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  loading: boolean;
  error: string | null;
  startCamera: () => Promise<boolean>;
  stopCamera: () => void;
  captureFrame: () => ImageData | null;
  capturePhoto: () => string | null;
  takePhoto: () => string | null;
}

const CameraContext = createContext<CameraContextValue | null>(null);

export function CameraProvider({ children }: { children: ReactNode }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Bind video ref to manager
    if (videoRef.current) {
      cameraManager.attachVideoElement(videoRef.current);
    }
  }, [videoRef]);

  useEffect(() => {
    cameraManager.setDiagnosticsCallback((d) => {
      setLoading(d.status === 'starting');
      setError(d.status === 'error' ? d.errorMessage : null);
    });
    return () => cameraManager.destroy();
  }, []);

  const stopCamera = useCallback(() => {
    cameraManager.stopCamera();
  }, []);

  const startCamera = useCallback(async (): Promise<boolean> => {
    const facingFront = useCameraStore.getState().facingFront;
    return await cameraManager.startCamera(facingFront ? 'user' : 'environment');
  }, []);

  const captureFrame = useCallback((): ImageData | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }, []);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (gl) {
      return canvas.toDataURL('image/jpeg', 0.95);
    }

    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.95);
  }, []);

  const takePhoto = useCallback(() => {
    const photoDataUrl = capturePhoto();
    if (photoDataUrl) {
      const currentLutId = useLUTStore.getState().currentLUT.id;
      const photo = {
        id: `${Date.now()}`,
        uri: photoDataUrl,
        thumbnail: photoDataUrl,
        lut: currentLutId,
        date: Date.now(),
        width: videoRef.current?.videoWidth || 1080,
        height: videoRef.current?.videoHeight || 1920,
      };
      useCameraStore.getState().addPhoto(photo);
    }
    return photoDataUrl;
  }, [capturePhoto]);

  return (
    <CameraContext.Provider value={{
      videoRef, canvasRef, loading, error,
      startCamera, stopCamera, captureFrame, capturePhoto, takePhoto,
    }}>
      {children}
    </CameraContext.Provider>
  );
}

export function useCameraContext(): CameraContextValue {
  const ctx = useContext(CameraContext);
  if (!ctx) throw new Error('useCameraContext must be used within CameraProvider');
  return ctx;
}
