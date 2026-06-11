import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { directorVision } from '../../lib/ultra-ai/directorVision';
import { useUltraStore } from '../../stores/ultraStore';
import type { SceneTypeAI } from '../../lib/ultra-ai/types';

const SCENE_TYPES: SceneTypeAI[] = [
  'epic_arrival', 'adventure_discovery', 'luxury_lifestyle', 'hero_introduction',
  'road_journey', 'romantic_sunset', 'dream_sequence', 'travel_documentary',
  'motivational_success', 'cinematic_walking', 'editorial_spread', 'street_candid',
  'golden_hour_portrait', 'night_cinematography',
];

const SCENE_LABELS: Record<SceneTypeAI, string> = {
  epic_arrival: 'Epic Arrival', adventure_discovery: 'Adventure Discovery',
  luxury_lifestyle: 'Luxury Lifestyle', hero_introduction: 'Hero Introduction',
  road_journey: 'Road Journey', romantic_sunset: 'Romantic Sunset',
  dream_sequence: 'Dream Sequence', travel_documentary: 'Travel Documentary',
  motivational_success: 'Motivational Success', cinematic_walking: 'Cinematic Walking',
  editorial_spread: 'Editorial Spread', street_candid: 'Street Candid',
  golden_hour_portrait: 'Golden Hour Portrait', night_cinematography: 'Night Cinema',
};

export function HollywoodDirectorPanel() {
  const { hollywoodScene, setHollywoodScene, setActiveMode, lastMoodType } = useUltraStore();
  const [selectedScene, setSelectedScene] = useState<SceneTypeAI>('cinematic_walking');
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const scene = directorVision.generateHollywoodScene(selectedScene, lastMoodType);
    setHollywoodScene(scene);
    setStepIndex(0);
  }, [selectedScene, lastMoodType, setHollywoodScene]);

  if (!hollywoodScene) return null;

  const currentStep = hollywoodScene.directionSteps[stepIndex];

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="absolute top-16 left-4 right-4 pointer-events-auto max-h-[80vh] overflow-y-auto">
        <GlassCard padding="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#FB923C]">HOLLYWOOD DIRECTOR</span>
            <div className="flex gap-1">
              <button onClick={() => setActiveMode(null)} className="text-[#6B7280] text-[9px] px-2 py-0.5 rounded-full bg-white/5 hover:text-white">✕</button>
            </div>
          </div>

          {/* Scene Type Selector */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-hide">
            {SCENE_TYPES.map(st => (
              <button
                key={st}
                onClick={() => setSelectedScene(st)}
                className={`shrink-0 text-[8px] px-2 py-1 rounded-full whitespace-nowrap transition-colors ${
                  selectedScene === st ? 'bg-[#FB923C]/20 text-[#FB923C] border border-[#FB923C]/30' : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                }`}
              >
                {SCENE_LABELS[st]}
              </button>
            ))}
          </div>

          {/* Scene Info */}
          <div className="mb-3">
            <p className="text-[11px] text-white font-medium mb-1">{SCENE_LABELS[selectedScene]}</p>
            <p className="text-[10px] text-[#6B7280] mb-1.5">{hollywoodScene.expectedResult}</p>
          </div>

          {/* Step-by-step direction */}
          <div className="glass rounded-xl p-3 mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] text-[#FB923C] font-medium">Step {stepIndex + 1} of {hollywoodScene.directionSteps.length}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}
                  disabled={stepIndex === 0}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 disabled:opacity-30"
                >◀</button>
                <button
                  onClick={() => setStepIndex(Math.min(hollywoodScene.directionSteps.length - 1, stepIndex + 1))}
                  disabled={stepIndex === hollywoodScene.directionSteps.length - 1}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 disabled:opacity-30"
                >▶</button>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg shrink-0 mt-[-2px]">
                {stepIndex === 0 ? '🎬' : stepIndex === hollywoodScene.directionSteps.length - 1 ? '✨' : '🎯'}
              </span>
              <p className="text-[11px] text-white/80">{currentStep}</p>
            </div>
          </div>

          {/* Technical details */}
          <div className="grid grid-cols-2 gap-1 text-[9px] text-white/40">
            <p><span className="text-white/70">Camera:</span> {hollywoodScene.cameraPosition}</p>
            <p><span className="text-white/70">Subject:</span> {hollywoodScene.subjectPosition}</p>
            <p><span className="text-white/70">Expression:</span> {hollywoodScene.facialExpression.slice(0, 30)}</p>
            <p><span className="text-white/70">Speed:</span> {hollywoodScene.walkingSpeed}</p>
            <p><span className="text-white/70">Hands:</span> {hollywoodScene.handPosition.slice(0, 30)}</p>
            <p><span className="text-white/70">Duration:</span> {hollywoodScene.shotDuration}s</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
