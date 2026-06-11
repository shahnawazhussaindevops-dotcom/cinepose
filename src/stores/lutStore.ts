import { create } from 'zustand';
import type { LUTPreset, ProColorControls } from '../lib/types';
import { LUT_PRESETS } from '../components/lut/LUTPresets';

const defaultProControls: ProColorControls = {
  exposure: 0,
  highlights: 0,
  shadows: 0,
  temperature: 5500,
  tint: 0,
  vibrance: 0,
  saturation: 1,
  vignette: 0,
  grain: 0,
  hueShift: [0, 0, 0, 0, 0, 0],
  satShift: [0, 0, 0, 0, 0, 0],
  lumShift: [0, 0, 0, 0, 0, 0],
  lift: [0, 0, 0],
  gamma: [0.5, 0.5, 0.5],
  gain: [1, 1, 1],
};

interface LUTState {
  presets: LUTPreset[];
  currentLUT: LUTPreset;
  intensity: number;
  proControls: ProColorControls;
  isProMode: boolean;
  customLUTs: LUTPreset[];

  setCurrentLUT: (preset: LUTPreset) => void;
  setIntensity: (intensity: number) => void;
  setProControl: (key: keyof ProColorControls, value: any) => void;
  resetProControls: () => void;
  toggleProMode: () => void;
  addCustomLUT: (lut: LUTPreset) => void;
  resetToDefault: () => void;
}

export const useLUTStore = create<LUTState>((set) => ({
  presets: LUT_PRESETS,
  currentLUT: LUT_PRESETS[0],
  intensity: 1.0,
  proControls: { ...defaultProControls },
  isProMode: false,
  customLUTs: [],

  setCurrentLUT: (preset) => set({ currentLUT: preset }),

  setIntensity: (intensity) => set({ intensity: Math.max(0, Math.min(1, intensity)) }),

  setProControl: (key, value) =>
    set((state) => ({
      proControls: { ...state.proControls, [key]: value },
    })),

  resetProControls: () => set({ proControls: { ...defaultProControls } }),

  toggleProMode: () => set((state) => ({ isProMode: !state.isProMode })),

  addCustomLUT: (lut) =>
    set((state) => ({ customLUTs: [...state.customLUTs, lut] })),

  resetToDefault: () =>
    set({
      currentLUT: LUT_PRESETS[0],
      intensity: 1.0,
      proControls: { ...defaultProControls },
      isProMode: false,
    }),
}));
