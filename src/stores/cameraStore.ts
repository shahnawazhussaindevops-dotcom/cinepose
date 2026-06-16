import { create } from 'zustand';
import type { GalleryPhoto, LightingData } from '../lib/types';

interface CameraState {
  isRecording: boolean;
  isFlashOn: boolean;
  zoom: number;
  facingFront: boolean;
  torchMode: boolean;
  timerActive: boolean;
  timerCountdown: number;
  photosTaken: GalleryPhoto[];
  currentLighting: LightingData | null;
  exposure: number;
  focusPoint: { x: number; y: number } | null;

  setRecording: (recording: boolean) => void;
  setFlashOn: (on: boolean) => void;
  setZoom: (zoom: number) => void;
  setFacingFront: (front: boolean) => void;
  toggleCamera: () => void;
  setTorchMode: (on: boolean) => void;
  setTimerActive: (active: boolean) => void;
  setTimerCountdown: (count: number) => void;
  addPhoto: (photo: GalleryPhoto) => void;
  removePhoto: (id: string) => void;
  setCurrentLighting: (lighting: LightingData | null) => void;
  setExposure: (exp: number) => void;
  setFocusPoint: (point: { x: number; y: number } | null) => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  isRecording: false,
  isFlashOn: false,
  zoom: 1,
  facingFront: false,
  torchMode: false,
  timerActive: false,
  timerCountdown: 0,
  photosTaken: [],
  currentLighting: null,
  exposure: 0,
  focusPoint: null,

  setRecording: (recording) => set({ isRecording: recording }),
  setFlashOn: (on) => set({ isFlashOn: on }),
  setZoom: (zoom) => set({ zoom: Math.max(1, Math.min(10, zoom)) }),
  setFacingFront: (front) => set({ facingFront: front }),
  toggleCamera: () => set((state) => ({ facingFront: !state.facingFront })),
  setTorchMode: (on) => set({ torchMode: on }),
  setTimerActive: (active) => set({ timerActive: active }),
  setTimerCountdown: (count) => set({ timerCountdown: count }),

  addPhoto: (photo) =>
    set((state) => ({ photosTaken: [photo, ...state.photosTaken] })),

  removePhoto: (id) =>
    set((state) => ({
      photosTaken: state.photosTaken.filter((p) => p.id !== id),
    })),

  setCurrentLighting: (lighting) => set({ currentLighting: lighting }),
  setExposure: (exp) => set({ exposure: exp }),
  setFocusPoint: (point) => set({ focusPoint: point }),
}));
