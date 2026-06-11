import React, { createContext, useContext, useState, useRef, useCallback, useEffect, type ReactNode } from 'react';
import { useCameraStore } from '../stores/cameraStore';

interface CameraContextValue {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  streamRef: React.MutableRefObject<MediaStream | null>;
  loading: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureFrame: () => ImageData | null;
  capturePhoto: () => string | null;
  takePhoto: () => string | null;
  setZoom: (zoom: number) => void;
  zoom: number;
  isFlashOn: boolean;
  facingFront: boolean;
  toggleCamera: () => void;
}

const CameraContext = createContext<CameraContextValue | null>(null);

export function CameraProvider({ children }: { children: ReactNode }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { facingFront, zoom, isFlashOn, setZoom, toggleCamera, setFlashOn } = useCameraStore();

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: facingFront ? 'user' : 'environment',
          frameRate: { ideal: 60 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setLoading(false);
    } catch (err: any) {
      const msg = err.name === 'NotAllowedError'
        ? 'Camera access was denied. Please enable camera permissions in your browser settings.'
        : err.name === 'NotFoundError'
          ? 'No camera found on this device.'
          : err.message || 'Camera access failed';
      setError(msg);
      setLoading(false);
    }
  }, [facingFront, stopCamera]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

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
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    if (facingFront) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.95);
  }, [facingFront]);

  const takePhoto = useCallback(() => {
    const photoDataUrl = capturePhoto();
    if (photoDataUrl) {
      const photo = {
        id: `${Date.now()}`,
        uri: photoDataUrl,
        thumbnail: photoDataUrl,
        lut: 'revenant',
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
      videoRef, canvasRef, streamRef, loading, error,
      startCamera, stopCamera,
      captureFrame, capturePhoto, takePhoto,
      setZoom, zoom, isFlashOn, facingFront, toggleCamera,
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
