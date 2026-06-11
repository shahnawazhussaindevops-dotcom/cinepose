import React, { useState, useEffect } from 'react';
import type { DirectorInstruction } from '../../lib/punk-ai/types';
import { GlassCard } from '../ui/GlassCard';

interface AIDirectorModeProps {
  instructions: DirectorInstruction[];
  currentStep: number;
  onNextStep: () => void;
  onPrevStep: () => void;
  active: boolean;
  onClose: () => void;
}

export function AIDirectorMode({ instructions, currentStep, onNextStep, onPrevStep, active, onClose }: AIDirectorModeProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    setCompletedSteps(new Set());
  }, [instructions]);

  const markComplete = (stepIndex: number) => {
    setCompletedSteps(prev => new Set(prev).add(stepIndex));
    if (stepIndex < instructions.length - 1) {
      onNextStep();
    }
  };

  if (!active || instructions.length === 0) return null;

  const current = instructions[currentStep];

  const instructionIcons: Record<string, string> = {
    turn: '↻', look: '👁', step: '🦶', relax: '◌', move: '✋',
    tilt: '↕', shift: '⇄', breathe: '○', angle: '∠',
  };

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      {/* Director overlay instructions */}
      <div className="absolute top-20 left-4 right-4 pointer-events-auto">
        <GlassCard padding="p-4" glow className="border-[#6EE7B7]/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎬</span>
              <h3 className="text-sm font-bold text-[#6EE7B7]">Director Mode</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white/30 hover:text-white/70 text-xs"
            >
              ✕
            </button>
          </div>

          {/* Progress */}
          <div className="flex gap-1 mb-3">
            {instructions.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1 rounded-full transition-all ${
                  completedSteps.has(i) ? 'bg-[#6EE7B7]' :
                  i === currentStep ? 'bg-[#A78BFA]' :
                  'bg-white/10'
                }`}
              />
            ))}
          </div>

          {/* Current instruction */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">{instructionIcons[current.type] || '○'}</span>
              <div>
                <p className="text-sm text-white font-medium">{current.description}</p>
                <p className="text-[10px] text-white/40 mt-0.5">
                  {current.type} · {current.target} → {current.value}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={onPrevStep}
                disabled={currentStep === 0}
                className="text-[10px] text-white/40 hover:text-white/70 disabled:opacity-30 transition-colors"
              >
                ← Back
              </button>

              <button
                onClick={() => markComplete(currentStep)}
                className="px-4 py-1.5 rounded-full bg-[#6EE7B7]/20 text-[#6EE7B7] text-[10px] font-medium hover:bg-[#6EE7B7]/30 transition-colors"
              >
                {currentStep < instructions.length - 1 ? '✓ Done — Next' : '✓ Complete'}
              </button>
            </div>
          </div>

          {/* All instructions mini list */}
          <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
            {instructions.map((inst, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 text-[10px] transition-opacity ${
                  i < currentStep ? 'text-[#6EE7B7]' :
                  i === currentStep ? 'text-white' :
                  'text-white/30'
                }`}
              >
                <span>{completedSteps.has(i) ? '✓' : i + 1}</span>
                <span className="truncate">{inst.description}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
