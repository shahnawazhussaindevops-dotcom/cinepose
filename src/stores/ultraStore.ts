import { create } from 'zustand';
import type { PhotographerAnalysis, CinematographerPlan, OutfitAnalysis, LocationAnalysis, DirectorVisionResult, HollywoodScene, MoodResult, MasterSceneResult, ReelPlan, CineGPTResponse, LocationType, MoodType } from '../lib/ultra-ai/types';

interface UltraState {
  activeMode: 'photographer' | 'cinematographer' | 'outfit' | 'location' | 'director' | 'hollywood' | 'mood' | 'master' | 'reel' | 'cinegpt' | 'ar' | 'human_clone' | null;
  photographerAnalysis: PhotographerAnalysis | null;
  cinematographerPlan: CinematographerPlan | null;
  cinematographerShotList: CinematographerPlan[] | null;
  outfitAnalysis: OutfitAnalysis | null;
  locationAnalysis: LocationAnalysis | null;
  directorVision: DirectorVisionResult | null;
  hollywoodScene: HollywoodScene | null;
  moodResult: MoodResult | null;
  masterResult: MasterSceneResult | null;
  reelPlan: ReelPlan | null;
  cineGPTResponse: CineGPTResponse | null;
  sceneLuminance: number;
  sceneTemperature: number;
  isGoldenHour: boolean;
  isBacklit: boolean;
  tiltAngle: number;
  lastLocationType: LocationType;
  lastMoodType: MoodType;
  chatHistory: { role: 'user' | 'ai'; message: string }[];

  setActiveMode: (mode: UltraState['activeMode']) => void;
  setPhotographerAnalysis: (a: PhotographerAnalysis | null) => void;
  setCinematographerPlan: (p: CinematographerPlan | null) => void;
  setCinematographerShotList: (l: CinematographerPlan[] | null) => void;
  setOutfitAnalysis: (o: OutfitAnalysis | null) => void;
  setLocationAnalysis: (l: LocationAnalysis | null) => void;
  setDirectorVision: (d: DirectorVisionResult | null) => void;
  setHollywoodScene: (h: HollywoodScene | null) => void;
  setMoodResult: (m: MoodResult | null) => void;
  setMasterResult: (m: MasterSceneResult | null) => void;
  setReelPlan: (r: ReelPlan | null) => void;
  setCineGPTResponse: (c: CineGPTResponse | null) => void;
  setSceneParams: (luminance: number, temperature: number, golden: boolean, backlit: boolean, tilt: number) => void;
  setLastLocationType: (l: LocationType) => void;
  setLastMoodType: (m: MoodType) => void;
  addChatMessage: (msg: { role: 'user' | 'ai'; message: string }) => void;
  clearChat: () => void;
}

export const useUltraStore = create<UltraState>((set) => ({
  activeMode: null,
  photographerAnalysis: null,
  cinematographerPlan: null,
  cinematographerShotList: null,
  outfitAnalysis: null,
  locationAnalysis: null,
  directorVision: null,
  hollywoodScene: null,
  moodResult: null,
  masterResult: null,
  reelPlan: null,
  cineGPTResponse: null,
  sceneLuminance: 0.5,
  sceneTemperature: 5500,
  isGoldenHour: false,
  isBacklit: false,
  tiltAngle: 0,
  lastLocationType: 'unknown',
  lastMoodType: 'calm',
  chatHistory: [],

  setActiveMode: (mode) => set({ activeMode: mode }),
  setPhotographerAnalysis: (a) => set({ photographerAnalysis: a }),
  setCinematographerPlan: (p) => set({ cinematographerPlan: p }),
  setCinematographerShotList: (l) => set({ cinematographerShotList: l }),
  setOutfitAnalysis: (o) => set({ outfitAnalysis: o }),
  setLocationAnalysis: (l) => set({ locationAnalysis: l }),
  setDirectorVision: (d) => set({ directorVision: d }),
  setHollywoodScene: (h) => set({ hollywoodScene: h }),
  setMoodResult: (m) => set({ moodResult: m }),
  setMasterResult: (m) => set({ masterResult: m }),
  setReelPlan: (r) => set({ reelPlan: r }),
  setCineGPTResponse: (c) => set({ cineGPTResponse: c }),
  setSceneParams: (luminance, temperature, golden, backlit, tilt) => set({
    sceneLuminance: luminance, sceneTemperature: temperature,
    isGoldenHour: golden, isBacklit: backlit, tiltAngle: tilt,
  }),
  setLastLocationType: (l) => set({ lastLocationType: l }),
  setLastMoodType: (m) => set({ lastMoodType: m }),
  addChatMessage: (msg) => set((s) => ({ chatHistory: [...s.chatHistory, msg] })),
  clearChat: () => set({ chatHistory: [] }),
}));
