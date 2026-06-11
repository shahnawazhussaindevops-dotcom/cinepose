import React, { useState, useMemo } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { BottomSheet } from '../ui/BottomSheet';
import { StyleTabs } from './StyleTabs';
import { PoseScoringCard } from './PoseScoringCard';
import { AIDirectorMode } from './AIDirectorMode';
import { TrendPanel } from './TrendPanel';
import { sceneEngine } from '../../lib/punk-ai/sceneUnderstanding';
import { poseScoring } from '../../lib/punk-ai/poseScoring';
import { aiDirector } from '../../lib/punk-ai/director';
import { trendEngine } from '../../lib/punk-ai/trendEngine';
import type { StyleTab, PoseScore, DirectorInstruction, TrendData } from '../../lib/punk-ai/types';
import { useCameraStore } from '../../stores/cameraStore';
import { usePoseStore } from '../../stores/poseStore';

interface PUNKOverlayProps {
  active: boolean;
  onClose: () => void;
}

export function PUNKOverlay({ active, onClose }: PUNKOverlayProps) {
  const [selectedStyle, setSelectedStyle] = useState<StyleTab>('Cinematic');
  const [directorActive, setDirectorActive] = useState(false);
  const [directorStep, setDirectorStep] = useState(0);
  const [showTrends, setShowTrends] = useState(false);
  const [expandedPose, setExpandedPose] = useState<PoseScore | null>(null);

  const { currentLighting } = useCameraStore();
  const { selectedGender } = usePoseStore();

  const sceneContext = useMemo(() => {
    if (!currentLighting) return null;
    return sceneEngine.analyzeScene(
      currentLighting.averageLuminance,
      currentLighting.colorTemperature,
      0, 0, false, false,
      currentLighting.shadowClip,
      currentLighting.highlightClip
    );
  }, [currentLighting]);

  const topPoses: PoseScore[] = useMemo(() => {
    if (!sceneContext) return [];
    return poseScoring.getTopPoses(sceneContext, selectedStyle, 5);
  }, [sceneContext, selectedStyle]);

  const directorInstructions: DirectorInstruction[] = useMemo(() => {
    if (topPoses.length === 0) return [];
    return aiDirector.generateInstructions(topPoses[0], sceneContext!);
  }, [topPoses, sceneContext]);

  const trends: TrendData[] = useMemo(() => {
    if (!sceneContext) return [];
    return trendEngine.getTrendsForScene(sceneContext);
  }, [sceneContext]);

  const trendingStyles = useMemo(() => {
    return trendEngine.getTrendingStyles();
  }, []);

  const bestSettings = useMemo(() => {
    if (!sceneContext) return null;
    return sceneEngine.determineBestSettings(sceneContext);
  }, [sceneContext]);

  if (!active) return null;

  return (
    <>
      {/* PUNK AI Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* Scene Analysis Bar */}
        {sceneContext && bestSettings && (
          <div className="absolute top-16 left-4 right-4 pointer-events-auto">
            <GlassCard padding="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#A78BFA]">PUNK AI</span>
                  <span className="text-[8px] text-[#6B7280]">· Pose Understanding Neural Kernel</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setShowTrends(!showTrends)}
                    className={`px-2 py-0.5 rounded-full text-[9px] font-medium transition-colors ${
                      showTrends ? 'bg-[#F472B6]/20 text-[#F472B6]' : 'bg-white/5 text-[#6B7280]'
                    }`}
                  >
                    Trends
                  </button>
                  <button
                    onClick={() => setDirectorActive(!directorActive)}
                    className={`px-2 py-0.5 rounded-full text-[9px] font-medium transition-colors ${
                      directorActive ? 'bg-[#6EE7B7]/20 text-[#6EE7B7]' : 'bg-white/5 text-[#6B7280]'
                    }`}
                  >
                    🎬 Director
                  </button>
                  <button
                    onClick={onClose}
                    className="px-2 py-0.5 rounded-full bg-white/5 text-[#6B7280] text-[9px] hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Scene Info */}
              <div className="flex flex-wrap gap-1 mb-2">
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/50">
                  {sceneContext.locationType}
                </span>
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/50">
                  {sceneContext.environmentMood}
                </span>
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/50">
                  {sceneContext.timeOfDay}
                </span>
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/50">
                  {sceneContext.indoorLighting} light
                </span>
              </div>

              {/* Best Settings */}
              <div className="grid grid-cols-2 gap-1">
                <div className="text-[9px] text-white/40">
                  <span className="text-white/70">Lens: </span>
                  {bestSettings.bestLensSuggestion.split(' — ')[0]}
                </div>
                <div className="text-[9px] text-white/40">
                  <span className="text-white/70">Angle: </span>
                  {sceneContext.cameraAngle.replace(/_/g, ' ')}
                </div>
                <div className="text-[9px] text-white/40 col-span-2">
                  <span className="text-white/70">Framing: </span>
                  {bestSettings.bestFraming.split(' — ')[0]}
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Director Mode */}
        <AIDirectorMode
          instructions={directorInstructions}
          currentStep={directorStep}
          onNextStep={() => setDirectorStep(s => Math.min(s + 1, directorInstructions.length - 1))}
          onPrevStep={() => setDirectorStep(s => Math.max(s - 1, 0))}
          active={directorActive}
          onClose={() => { setDirectorActive(false); setDirectorStep(0); }}
        />

        {/* Trend Panel */}
        {showTrends && (
          <div className="absolute top-48 left-4 right-4 pointer-events-auto max-h-[40vh] overflow-y-auto">
            <GlassCard padding="p-3">
              <TrendPanel
                trends={trends}
                trendingStyles={trendingStyles}
                onSelectTrend={(t) => {}}
                onSelectStyle={(s) => { setSelectedStyle(s); setShowTrends(false); }}
                activeStyle={selectedStyle}
              />
            </GlassCard>
          </div>
        )}

        {/* Bottom Pose Controls */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-auto">
          <div className="px-4 pb-4 pt-2 bg-gradient-to-t from-[#0D0D1A]/90 via-[#0D0D1A]/60 to-transparent">
            {/* Style Tabs */}
            <div className="mb-2">
              <StyleTabs selected={selectedStyle} onSelect={setSelectedStyle} />
            </div>

            {/* Top Poses Preview */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {topPoses.slice(0, 5).map((pose, i) => (
                <button
                  key={pose.poseId}
                  onClick={() => setExpandedPose(pose)}
                  className="flex-shrink-0 glass rounded-xl p-2.5 w-28 hover:bg-white/10 transition-colors text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#6B7280]">#{i + 1}</span>
                    <span
                      className="text-[9px] font-bold font-mono"
                      style={{
                        color: pose.overallScore >= 85 ? '#6EE7B7' : pose.overallScore >= 70 ? '#A78BFA' : '#FB923C',
                      }}
                    >
                      {pose.overallScore}
                    </span>
                  </div>
                  <p className="text-[10px] text-white font-medium truncate">{pose.poseName}</p>
                  <p className="text-[8px] text-[#6B7280] mt-0.5">✦ {pose.engagementPotential}%</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Pose Bottom Sheet */}
      <BottomSheet
        open={!!expandedPose}
        onClose={() => setExpandedPose(null)}
        title="Pose Analysis"
        height="75%"
      >
        {expandedPose && <PoseScoringCard score={expandedPose} rank={topPoses.indexOf(expandedPose) + 1} />}
      </BottomSheet>
    </>
  );
}
