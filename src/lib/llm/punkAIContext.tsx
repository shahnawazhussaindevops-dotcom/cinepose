import React, { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { punkAIDirector, type AgentResult } from './punkAIDirector';
import { useCameraStore } from '../../stores/cameraStore';
import { usePoseStore } from '../../stores/poseStore';
import { useUltraStore } from '../../stores/ultraStore';
import type { SceneInput, UserContext, AgentID } from './types';

interface PunkAIContextValue {
  agentResult: AgentResult | null;
  loading: boolean;
  enabled: boolean;
  toggleLLM: () => void;
  runAnalysis: () => Promise<void>;
  llmEnabled: boolean;
  activeAgents: AgentID[];
  setActiveAgents: (agents: AgentID[]) => void;
}

const PunkAIContext = createContext<PunkAIContextValue | null>(null);

export function PunkAIProvider({ children }: { children: ReactNode }) {
  const [agentResult, setAgentResult] = useState<AgentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [llmEnabled, setLLmEnabled] = useState(true);
  const [activeAgents, setActiveAgents] = useState<AgentID[]>(['scene_analyzer']);
  const lastAnalysisRef = useRef(0);

  const toggleLLM = useCallback(() => {
    const next = !llmEnabled;
    setLLmEnabled(next);
    punkAIDirector.setLLMEnabled(next);
  }, [llmEnabled]);

  const runAnalysis = useCallback(async () => {
    const now = Date.now();
    if (now - lastAnalysisRef.current < 2000) return;
    lastAnalysisRef.current = now;

    setLoading(true);
    try {
      const { currentLighting } = useCameraStore.getState();
      const { selectedGender, currentPoseIndex } = usePoseStore.getState();
      const { sceneLuminance, sceneTemperature, isGoldenHour, isBacklit, tiltAngle } = useUltraStore.getState();

      if (!currentLighting) {
        setLoading(false);
        return;
      }

      const sceneInput: SceneInput = {
        luminance: currentLighting.averageLuminance || sceneLuminance,
        temperature: currentLighting.colorTemperature || sceneTemperature,
        isGoldenHour: isGoldenHour || currentLighting.condition === 'golden_hour',
        isBacklit: isBacklit || currentLighting.condition === 'backlit',
        tiltAngle,
        cameraAngle: currentLighting.condition || 'eye_level',
        locationType: '',
        weather: '',
        timeOfDay: isGoldenHour ? 'golden_hour' : isBacklit ? 'afternoon' : 'day',
      };

      const userContext: UserContext = {
        selectedGender,
        selectedStyle: 'Cinematic',
        preferredFacingMode: useCameraStore.getState().facingFront ? 'user' : 'environment',
        recentFeedback: [],
        sessionHistory: [],
      };

      const result = await punkAIDirector.analyze(sceneInput, userContext, activeAgents);
      setAgentResult(result);
    } catch (e) {
      console.warn('Punk AI analysis failed:', e);
    } finally {
      setLoading(false);
    }
  }, [activeAgents]);

  useEffect(() => {
    punkAIDirector.setLLMEnabled(llmEnabled);
  }, [llmEnabled]);

  return (
    <PunkAIContext.Provider value={{
      agentResult,
      loading,
      enabled: true,
      toggleLLM,
      runAnalysis,
      llmEnabled,
      activeAgents,
      setActiveAgents,
    }}>
      {children}
    </PunkAIContext.Provider>
  );
}

export function usePunkAIContext(): PunkAIContextValue {
  const ctx = useContext(PunkAIContext);
  if (!ctx) throw new Error('usePunkAIContext must be used within PunkAIProvider');
  return ctx;
}
