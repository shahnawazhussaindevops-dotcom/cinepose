import React from 'react';
import { usePoseStore } from '../../stores/poseStore';
import { t } from '../../lib/i18n';
import { GlassCard } from '../ui/GlassCard';
import type { Pose } from '../../lib/types';

interface PoseControlsProps {
  currentPose: Pose;
  genderSet: boolean;
  onRequestGender: () => void;
}

export function PoseControls({ currentPose, genderSet, onRequestGender }: PoseControlsProps) {
  const { nextPose, prevPose, recommendedPoses, currentPoseIndex, giveFeedback } = usePoseStore();

  if (!genderSet) {
    return (
      <GlassCard padding="p-4" className="text-center">
        <p className="text-sm text-[#6B7280] mb-2">{t('onboarding.gender_title')}</p>
        <button
          onClick={onRequestGender}
          className="text-sm text-[#A78BFA] font-medium hover:underline"
        >
          {t('onboarding.gender_desc')}
        </button>
      </GlassCard>
    );
  }

  return (
    <GlassCard padding="p-4" className="space-y-3">
      {/* Pose Name & Score */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#F9FAFB]">{currentPose.name}</h3>
          <p className="text-xs text-[#6B7280] capitalize">{currentPose.category}</p>
        </div>
        {currentPose.score && (
          <span className="text-[10px] px-2 py-1 rounded-full bg-[#6EE7B7]/15 text-[#6EE7B7] font-medium">
            {currentPose.score}
          </span>
        )}
      </div>

      {/* Scene Badge */}
      <div className="flex flex-wrap gap-1.5">
        {currentPose.scenes.slice(0, 2).map((scene) => (
          <span key={scene} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50">
            {scene}
          </span>
        ))}
      </div>

      {/* AI Tip */}
      {currentPose.tip && (
        <div className="p-3 rounded-xl bg-[#A78BFA]/5 border border-[#A78BFA]/10">
          <p className="text-xs text-[#A78BFA] leading-relaxed">{currentPose.tip}</p>
        </div>
      )}

      {/* Pose Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevPose}
          disabled={currentPoseIndex <= 0}
          className="p-2 rounded-full bg-white/5 text-white/50 hover:bg-white/10 disabled:opacity-30 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <span className="text-xs text-[#6B7280]">
          {currentPoseIndex + 1} / {recommendedPoses.length}
        </span>

        <button
          onClick={nextPose}
          disabled={currentPoseIndex >= recommendedPoses.length - 1}
          className="p-2 rounded-full bg-white/5 text-white/50 hover:bg-white/10 disabled:opacity-30 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Feedback */}
      <div className="flex items-center justify-center gap-3 pt-2 border-t border-white/5">
        <span className="text-[10px] text-[#6B7280]">{t('pose.helpful')}</span>
        <button
          onClick={() => giveFeedback(currentPose.id, true)}
          className="p-1.5 rounded-full bg-white/5 hover:bg-[#6EE7B7]/20 text-white/50 hover:text-[#6EE7B7] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
          </svg>
        </button>
        <button
          onClick={() => giveFeedback(currentPose.id, false)}
          className="p-1.5 rounded-full bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" />
          </svg>
        </button>
      </div>
    </GlassCard>
  );
}
