import React, { createContext, useContext, useState, useRef, useCallback, useEffect, type ReactNode } from 'react';
import { useCameraStore } from '../stores/cameraStore';
import { useLUTStore } from '../stores/lutStore';
import { cameraManager, type CameraDiagnostics } from './camera/CameraManager';
import { log } from './camera/mediaUtils';

interface CameraContextValue {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  loading: boolean;
  error: string | null;
  startCamera: () => Promise<boolean>;
  stopCamera: () => void;
  captureFrame: () => ImageData | null;
  capturePhoto: () => Promise<string | null>;
  takePhoto: () => Promise<string | null>;
  switchCamera: () => Promise<boolean>;
  reconnectCamera: () => Promise<boolean>;
  isCameraReady: boolean;
  debugError: unknown;
  status: string;
}

const CameraContext = createContext<CameraContextValue | null>(null);

export function CameraProvider({ children }: { children: ReactNode }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugError, setDebugError] = useState<unknown>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [status, setStatus] = useState<string>('idle');
  const startAttemptedRef = useRef(false);

  useEffect(() => {
    const onDiagnostics = (d: CameraDiagnostics) => {
      // Expose raw status to UI for diagnostics display
      setStatus(d.status);
      // Only treat 'starting' and 'checking-permission' as loading.
      // 'idle' means no start attempted yet — show the manual start button instead.
      setLoading(d.status === 'starting' || d.status === 'checking-permission');
      setError(d.status === 'error' ? d.error?.message || null : null);
      setIsCameraReady(d.status === 'active');
      if (d.status === 'error') {
        setDebugError(d.error);
      }
    };

    cameraManager.setDiagnosticsCallback(onDiagnostics);

    // Loading timeout — if camera stays stuck in 'starting' for 10s, show error
    const timeoutId = setTimeout(() => {
      setLoading(false);
      const current = cameraManager.diagnostics.status;
      if (current !== 'active' && current !== 'error') {
        setError('Camera initialization timed out. Please try again or check your camera permissions.');
        setIsCameraReady(false);
      }
    }, 10000);

    return () => {
      clearTimeout(timeoutId);
      cameraManager.removeDiagnosticsCallback(onDiagnostics);
      cameraManager.stopCamera();
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      cameraManager.attachVideoElement(videoRef.current);
    }
  });

  const doStartCamera = useCallback(async () => {
    if (startAttemptedRef.current) return false;
    startAttemptedRef.current = true;
    log.info('CameraContext: auto-starting camera');
    if (videoRef.current) {
      cameraManager.attachVideoElement(videoRef.current);
    }
    try {
      const facingFront = useCameraStore.getState().facingFront;
      const success = await cameraManager.startCamera({
        preferredFacingMode: facingFront ? 'user' : 'environment',
      });
      log.info('CameraContext: auto-start result:', success);
      if (!success) {
        startAttemptedRef.current = false;
      }
      return success;
    } catch (err) {
      log.error('CameraContext: auto-start threw:', err);
      startAttemptedRef.current = false;
      setError(err instanceof Error ? err.message : 'Camera failed to start');
      setLoading(false);
      return false;
    }
  }, []);

  // Auto-start disabled — PermissionsGate handles user-initiated camera start.
  // This avoids getUserMedia failures on mobile Chrome where a user gesture is required.

  const stopCamera = useCallback(() => {
    cameraManager.stopCamera();
    startAttemptedRef.current = false;
  }, []);

  const startCamera = useCallback(async (): Promise<boolean> => {
    log.info('CameraContext: startCamera called');
    if (videoRef.current) {
      cameraManager.attachVideoElement(videoRef.current);
    }
    const facingFront = useCameraStore.getState().facingFront;
    const success = await cameraManager.startCamera({
      preferredFacingMode: facingFront ? 'user' : 'environment',
    });
    startAttemptedRef.current = success;
    return success;
  }, []);

  const switchCamera = useCallback(async (): Promise<boolean> => {
    return await cameraManager.switchCamera();
  }, []);

  const reconnectCamera = useCallback(async (): Promise<boolean> => {
    return await cameraManager.reconnectCamera();
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

  const canvasToDataURL = useCallback((canvas: HTMLCanvasElement): Promise<string | null> => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(canvas.toDataURL('image/jpeg', 0.95));
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(canvas.toDataURL('image/jpeg', 0.95));
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.95);
    });
  }, []);

  const capturePhoto = useCallback(async (): Promise<string | null> => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (gl) {
      return await canvasToDataURL(canvas);
    }

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return await canvasToDataURL(canvas);
  }, [canvasToDataURL]);

  const takePhoto = useCallback(async () => {
    const photoDataUrl = await capturePhoto();
    if (photoDataUrl) {
      const currentLutId = useLUTStore.getState().currentLUT.id;
      const photo = {
        id: `${Date.now()}`,
        uri: photoDataUrl,
        thumbnail: photoDataUrl,
        lut: currentLutId,
        date: Date.now(),
        width: videoRef.current?.videoWidth || 1280,
        height: videoRef.current?.videoHeight || 720,
      };
      useCameraStore.getState().addPhoto(photo);
      log.info('Photo captured', { id: photo.id });
    }
    return photoDataUrl;
  }, [capturePhoto]);

  return (
    <CameraContext.Provider value={{
      videoRef, canvasRef, loading, error, status,
      startCamera, stopCamera, captureFrame, capturePhoto, takePhoto,
      switchCamera, reconnectCamera, isCameraReady, debugError,
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
