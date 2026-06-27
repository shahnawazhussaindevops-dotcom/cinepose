import { create } from 'zustand';

interface MemoryEntry {
  id: string;
  type: 'pose' | 'style' | 'lut' | 'angle' | 'lighting' | 'scene' | 'feedback';
  value: string;
  score: number;
  timestamp: number;
  context?: string;
}

interface MemoryState {
  preferredPoseStyles: string[];
  preferredAngles: string[];
  favoriteLUTs: string[];
  rejectedSuggestions: string[];
  pastSuccessfulScenes: string[];
  sessionFrames: { timestamp: number; analysis: string }[];
  userGender: 'male' | 'female' | 'neutral';
  userStylePreference: string;

  shortTerm: MemoryEntry[];
  longTerm: MemoryEntry[];

  addMemory: (entry: Omit<MemoryEntry, 'id' | 'timestamp'>) => void;
  addRejected: (suggestion: string) => void;
  addSuccessfulScene: (scene: string) => void;
  incrementScore: (type: MemoryEntry['type'], value: string) => void;
  getTopPreferences: (type: MemoryEntry['type'], limit?: number) => MemoryEntry[];
  getRecentContext: () => string;
  setUserGender: (gender: 'male' | 'female' | 'neutral') => void;
  setStylePreference: (style: string) => void;
  persistToLocal: () => void;
  loadFromLocal: () => void;
}

const MEMORY_KEY = 'cinepose-memory';

export const useMemoryStore = create<MemoryState>((set, get) => ({
  preferredPoseStyles: [],
  preferredAngles: [],
  favoriteLUTs: [],
  rejectedSuggestions: [],
  pastSuccessfulScenes: [],
  sessionFrames: [],
  userGender: 'neutral',
  userStylePreference: 'cinematic',
  shortTerm: [],
  longTerm: [],

  addMemory: (entry) => {
    const full: MemoryEntry = { ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, timestamp: Date.now() };
    set((s) => ({ shortTerm: [...s.shortTerm.slice(-49), full] }));
    if (entry.score >= 3) {
      set((s) => ({ longTerm: [...s.longTerm.filter(e => e.value !== entry.value || e.type !== entry.type), full].slice(-99) }));
    }
    get().persistToLocal();
  },

  addRejected: (suggestion) => {
    set((s) => ({ rejectedSuggestions: [...s.rejectedSuggestions.slice(-19), suggestion] }));
  },

  addSuccessfulScene: (scene) => {
    set((s) => ({ pastSuccessfulScenes: [...s.pastSuccessfulScenes.slice(-9), scene] }));
    get().persistToLocal();
  },

  incrementScore: (type, value) => {
    set((s) => {
      const updated = s.longTerm.map(e => e.type === type && e.value === value ? { ...e, score: e.score + 1 } : e);
      if (!updated.find(e => e.type === type && e.value === value)) {
        const full: MemoryEntry = { id: `${Date.now()}`, type, value, score: 1, timestamp: Date.now() };
        updated.push(full);
      }
      return { longTerm: updated.slice(-99) };
    });
    get().persistToLocal();
  },

  getTopPreferences: (type, limit = 3) => {
    return get().longTerm.filter(e => e.type === type).sort((a, b) => b.score - a.score).slice(0, limit);
  },

  getRecentContext: () => {
    const state = get();
    const recent = state.shortTerm.slice(-5);
    return recent.map(e => `[${e.type}] ${e.value} (score: ${e.score})`).join('\n');
  },

  setUserGender: (gender) => set({ userGender: gender }),
  setStylePreference: (style) => set({ userStylePreference: style }),

  persistToLocal: () => {
    try {
      const state = get();
      const data = {
        longTerm: state.longTerm,
        rejectedSuggestions: state.rejectedSuggestions,
        pastSuccessfulScenes: state.pastSuccessfulScenes,
        userGender: state.userGender,
        userStylePreference: state.userStylePreference,
        favoriteLUTs: state.favoriteLUTs,
        preferredAngles: state.preferredAngles,
      };
      localStorage.setItem(MEMORY_KEY, JSON.stringify(data));
    } catch {}
  },

  loadFromLocal: () => {
    try {
      const raw = localStorage.getItem(MEMORY_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        set({
          longTerm: data.longTerm || [],
          rejectedSuggestions: data.rejectedSuggestions || [],
          pastSuccessfulScenes: data.pastSuccessfulScenes || [],
          userGender: data.userGender || 'neutral',
          userStylePreference: data.userStylePreference || 'cinematic',
          favoriteLUTs: data.favoriteLUTs || [],
          preferredAngles: data.preferredAngles || [],
        });
      }
    } catch {}
  },
}));
