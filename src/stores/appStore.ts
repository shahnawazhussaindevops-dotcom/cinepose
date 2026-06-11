import { create } from 'zustand';
import type { AppSettings, OnboardingState, PermissionState } from '../lib/types';

interface AppState {
  settings: AppSettings;
  onboarding: OnboardingState;
  permissions: PermissionState;
  isOnline: boolean;
  showPoseMode: boolean;
  showDroneMode: boolean;
  showLUTPicker: boolean;

  updateSettings: (partial: Partial<AppSettings>) => void;
  setOnboarding: (partial: Partial<OnboardingState>) => void;
  completeOnboarding: () => void;
  setPermission: (key: keyof PermissionState, value: boolean) => void;
  setOnline: (online: boolean) => void;
  setShowPoseMode: (show: boolean) => void;
  setShowDroneMode: (show: boolean) => void;
  setShowLUTPicker: (show: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  settings: {
    theme: 'dark',
    language: 'en',
    gender: 'neutral',
    gridOverlay: 'off',
    focusPeaking: false,
    histogram: false,
    levelIndicator: false,
    timerDelay: 0,
    burstMode: false,
    cloudBackup: false,
    haptics: true,
    showTutorial: true,
    telemetry: false,
  },
  onboarding: {
    completed: false,
    currentStep: 0,
    genderSelected: false,
    permissionsGranted: false,
  },
  permissions: {
    camera: false,
    microphone: false,
    storage: false,
    location: false,
  },
  isOnline: true,
  showPoseMode: false,
  showDroneMode: false,
  showLUTPicker: false,

  updateSettings: (partial) =>
    set((state) => ({ settings: { ...state.settings, ...partial } })),

  setOnboarding: (partial) =>
    set((state) => ({ onboarding: { ...state.onboarding, ...partial } })),

  completeOnboarding: () =>
    set((state) => ({
      onboarding: { ...state.onboarding, completed: true, currentStep: 3 },
    })),

  setPermission: (key, value) =>
    set((state) => ({
      permissions: { ...state.permissions, [key]: value },
    })),

  setOnline: (online) => set({ isOnline: online }),

  setShowPoseMode: (show) => set({ showPoseMode: show }),

  setShowDroneMode: (show) => set({ showDroneMode: show }),

  setShowLUTPicker: (show) => set({ showLUTPicker: show }),
}));
