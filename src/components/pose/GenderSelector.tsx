import React from 'react';
import type { Gender } from '../../lib/types';
import { t } from '../../lib/i18n';
import { GlassCard } from '../ui/GlassCard';
import { PillButton } from '../ui/PillButton';

interface GenderSelectorProps {
  selected: Gender;
  onSelect: (gender: Gender) => void;
  onContinue: () => void;
}

export function GenderSelector({ selected, onSelect, onContinue }: GenderSelectorProps) {
  const options: { gender: Gender; icon: string; label: string }[] = [
    { gender: 'male', icon: '♂', label: t('common.male') },
    { gender: 'female', icon: '♀', label: t('common.female') },
    { gender: 'neutral', icon: '○', label: t('common.neutral') },
  ];

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-[#F9FAFB]">{t('onboarding.gender_title')}</h2>
        <p className="text-sm text-[#6B7280] max-w-xs">{t('onboarding.gender_desc')}</p>
      </div>

      <div className="flex gap-4">
        {options.map(({ gender, icon, label }) => (
          <GlassCard
            key={gender}
            onClick={() => onSelect(gender)}
            className={`flex flex-col items-center gap-3 p-6 min-w-[100px] transition-all ${
              selected === gender
                ? 'border-[#A78BFA] shadow-[0_0_20px_rgba(167,139,250,0.2)]'
                : ''
            }`}
            glow={selected === gender}
          >
            <span className="text-3xl">{icon}</span>
            <span className={`text-sm font-medium ${
              selected === gender ? 'text-[#A78BFA]' : 'text-[#F9FAFB]'
            }`}>
              {label}
            </span>
          </GlassCard>
        ))}
      </div>

      <PillButton onClick={onContinue} disabled={!selected} size="lg">
        {t('common.continue')}
      </PillButton>
    </div>
  );
}
