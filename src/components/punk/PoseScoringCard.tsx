import React from 'react';
import type { PoseScore } from '../../lib/punk-ai/types';

interface PoseScoringCardProps {
  score: PoseScore;
  rank: number;
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-[#6B7280] w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] text-[#F9FAFB] w-6 text-right font-mono">{value}</span>
    </div>
  );
}

export function PoseScoringCard({ score, rank }: PoseScoringCardProps) {
  const overallColor = score.overallScore >= 85 ? '#6EE7B7' : score.overallScore >= 70 ? '#A78BFA' : score.overallScore >= 55 ? '#FB923C' : '#F87171';
  const engagementColor = score.engagementPotential >= 85 ? '#6EE7B7' : '#A78BFA';

  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#6B7280]">#{rank}</span>
          <h3 className="text-sm font-semibold text-[#F9FAFB]">{score.poseName}</h3>
        </div>
        <div
          className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono"
          style={{ backgroundColor: `${overallColor}20`, color: overallColor }}
        >
          {score.overallScore}/100
        </div>
      </div>

      {/* Difficulty & Comfort badges */}
      <div className="flex gap-1.5">
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
          score.difficulty === 'easy' ? 'bg-[#6EE7B7]/15 text-[#6EE7B7]' :
          score.difficulty === 'medium' ? 'bg-[#FB923C]/15 text-[#FB923C]' :
          'bg-[#F87171]/15 text-[#F87171]'
        }`}>
          {score.difficulty}
        </span>
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
          score.comfort === 'comfortable' ? 'bg-[#6EE7B7]/15 text-[#6EE7B7]' :
          score.comfort === 'moderate' ? 'bg-[#FB923C]/15 text-[#FB923C]' :
          'bg-[#F87171]/15 text-[#F87171]'
        }`}>
          {score.comfort}
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#A78BFA]/15 text-[#A78BFA]">
          ✦ {score.engagementPotential}% engagement
        </span>
      </div>

      {/* Score Bars */}
      <div className="space-y-1.5">
        <ScoreBar label="Pose Match" value={score.poseMatchScore} color="#A78BFA" />
        <ScoreBar label="Lighting" value={score.lightingScore} color="#FB923C" />
        <ScoreBar label="Composition" value={score.compositionScore} color="#6EE7B7" />
        <ScoreBar label="Background" value={score.backgroundScore} color="#60A5FA" />
        <ScoreBar label="Trend Score" value={score.trendScore} color="#F472B6" />
        <ScoreBar label="Comfort" value={score.comfortScore} color="#34D399" />
        <ScoreBar label="Uniqueness" value={score.uniquenessScore} color="#818CF8" />
      </div>

      {/* Explanation */}
      <p className="text-[11px] text-[#6B7280] leading-relaxed">{score.explanation}</p>

      {/* Instructions */}
      <div className="space-y-1.5 pt-2 border-t border-white/5">
        <div className="flex gap-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" className="flex-shrink-0 mt-0.5">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <p className="text-[10px] text-white/60">{score.cameraInstructions}</p>
        </div>
        <div className="flex gap-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FB923C" strokeWidth="2" className="flex-shrink-0 mt-0.5">
            <path d="M12 3v18M3 12h18" />
          </svg>
          <p className="text-[10px] text-white/60">{score.lightingInstructions}</p>
        </div>
      </div>

      {/* Expected Result */}
      <div
        className="p-2 rounded-xl text-[10px] leading-relaxed"
        style={{ backgroundColor: `${overallColor}10` }}
      >
        <span className="font-medium text-white/70">Expected: </span>
        <span className="text-white/50">{score.expectedResult}</span>
      </div>
    </div>
  );
}
