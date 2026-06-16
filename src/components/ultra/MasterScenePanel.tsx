import React, { useEffect, useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { masterSceneAnalyzer } from '../../lib/ultra-ai/masterSceneAnalyzer';
import { useUltraStore } from '../../stores/ultraStore';
import { useCameraStore } from '../../stores/cameraStore';
import { usePoseStore } from '../../stores/poseStore';

interface MasterScenePanelProps {
  luminance: number;
  temperature: number;
  isGoldenHour: boolean;
  isBacklit: boolean;
  tiltAngle: number;
}

export function MasterScenePanel({ luminance, temperature, isGoldenHour, isBacklit, tiltAngle }: MasterScenePanelProps) {
  const { masterResult, setMasterResult, setActiveMode } = useUltraStore();
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  useEffect(() => {
    const result = masterSceneAnalyzer.analyze(luminance, temperature, isGoldenHour, isBacklit, tiltAngle);
    setMasterResult(result);
  }, [luminance, temperature, isGoldenHour, isBacklit, tiltAngle, setMasterResult]);

  const handleAIAnalyze = async () => {
    if (!masterResult) return;
    setAnalyzingAI(true);
    setAiNotice(null);

    try {
      const selectedGender = usePoseStore.getState().selectedGender;
      const currentLighting = useCameraStore.getState().currentLighting;

      const res = await fetch('/api/scene-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneType: masterResult.location.locationType === 'unknown' ? 'urban' : masterResult.location.locationType,
          lighting: currentLighting?.condition || 'bright_daylight',
          cameraAngle: 'eye_level',
          genderPreference: selectedGender,
        }),
      });

      if (res.status === 503) {
        setAiNotice('Offline mode: Using local pose intelligence. Define ANTHROPIC_API_KEY for Claude suggestions.');
        setAnalyzingAI(false);
        return;
      }

      if (!res.ok) {
        throw new Error('Claude service returned an error');
      }

      const aiData = await res.json();
      setMasterResult({
        ...masterResult,
        bestPose: aiData.poses ? aiData.poses.join(', ') : masterResult.bestPose,
        bestStorytellingConcept: aiData.mood || masterResult.bestStorytellingConcept,
        overallRecommendation: `${aiData.composition_tip || ''} ${
          aiData.poses ? 'AI recommended poses: ' + aiData.poses.join(' / ') : ''
        }`,
      });
      setAiNotice('Claude AI Scene Analysis completed successfully!');
    } catch (err) {
      console.error(err);
      setAiNotice('Failed to connect to cloud AI. Running in local-only mode.');
    } finally {
      setAnalyzingAI(false);
    }
  };

  if (!masterResult) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="absolute top-16 left-4 right-4 pointer-events-auto max-h-[75vh] overflow-y-auto">
        <GlassCard padding="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-gradient-to-r from-[#A78BFA] to-[#6EE7B7] bg-clip-text text-transparent">MASTER SCENE ANALYZER</span>
            </div>
            <button onClick={() => setActiveMode(null)} className="text-[#6B7280] text-[9px] px-2 py-0.5 rounded-full bg-white/5 hover:text-white">✕</button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { label: 'Location', value: masterResult.location.locationName },
              { label: 'Mood', value: masterResult.mood },
              { label: 'Lighting', value: masterResult.lighting },
              { label: 'Camera Angle', value: masterResult.bestCameraAngle },
              { label: 'Lens', value: masterResult.bestLens },
              { label: 'LUT', value: masterResult.bestLUT },
            ].map((item, i) => (
              <div key={i} className="glass rounded-lg p-2">
                <p className="text-[7px] text-[#6B7280] mb-0.5">{item.label}</p>
                <p className="text-[9px] text-white/80">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-2">
            <div className="glass rounded-lg p-2">
              <p className="text-[7px] text-[#A78BFA] font-medium mb-0.5">Best Pose</p>
              <p className="text-[9px] text-white/70">{masterResult.bestPose}</p>
            </div>
            <div className="glass rounded-lg p-2">
              <p className="text-[7px] text-[#6EE7B7] font-medium mb-0.5">Storytelling Concept</p>
              <p className="text-[9px] text-white/70">{masterResult.bestStorytellingConcept}</p>
            </div>
            <div className="glass rounded-lg p-2">
              <p className="text-[7px] text-[#FB923C] font-medium mb-0.5">Reel Idea</p>
              <p className="text-[9px] text-white/70">{masterResult.bestReelIdea}</p>
            </div>
            <div className="glass rounded-lg p-2">
              <p className="text-[7px] text-[#A78BFA] font-medium mb-0.5">Hollywood Direction</p>
              <p className="text-[9px] text-white/70">{masterResult.bestHollywoodDirection}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 space-y-3">
            <div>
              <p className="text-[9px] font-medium text-[#A78BFA] mb-1">Recommendation</p>
              <p className="text-[10px] text-white/70 leading-relaxed">{masterResult.overallRecommendation}</p>
            </div>

            {aiNotice && (
              <div className="p-2 rounded bg-white/5 border border-white/10 text-[9px] text-[#6EE7B7] leading-relaxed">
                {aiNotice}
              </div>
            )}

            <button
              onClick={handleAIAnalyze}
              disabled={analyzingAI}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#6EE7B7] hover:opacity-90 disabled:opacity-50 text-white font-semibold text-xs tracking-wide transition-opacity shadow-[0_0_15px_rgba(167,139,250,0.2)]"
            >
              {analyzingAI ? 'Analyzing with Claude...' : '✦ Analyze with Cloud AI'}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
