import { useState, useRef, useCallback, useEffect } from 'react';
import { useCameraStore } from '../stores/cameraStore';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    facingFront,
    zoom,
    isFlashOn,
    setZoom,
    toggleCamera,
    setFlashOn,
    setExposure,
  } = useCameraStore();

  const startCamera = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

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
      setError(err.message || 'Camera access denied');
      setLoading(false);
    }
  }, [facingFront]);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [startCamera]);

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

  return {
    videoRef,
    canvasRef,
    streamRef,
    loading,
    error,
    startCamera,
    captureFrame,
    takePhoto,
    capturePhoto,
    toggleCamera,
    setZoom,
    setFlashOn,
    setExposure,
    zoom,
    isFlashOn,
    facingFront,
  };
}
