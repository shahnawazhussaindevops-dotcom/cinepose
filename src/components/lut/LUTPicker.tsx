import React from 'react';
import { useLUTStore } from '../../stores/lutStore';
import { LUT_PRESETS } from './LUTPresets';
import { t } from '../../lib/i18n';

const categories = [
  { key: 'featured', labelKey: 'lut.featured', ids: ['revenant', 'hollywood', 'golden_hour', 'blue_hour', 'moody_bw'] },
  { key: 'film', labelKey: 'lut.film', ids: ['fuji_xpro', 'kodak_vision', 'everest', 'arctic'] },
  { key: 'cinematic', labelKey: 'lut.cinematic', ids: ['hollywood', 'anamorphic', 'neon_tokyo', 'revenant'] },
  { key: 'vintage', labelKey: 'lut.vintage', ids: ['kodak_vision', 'soft_matte', 'fuji_xpro', 'desert_dune'] },
  { key: 'custom', labelKey: 'lut.custom', ids: [] },
];

export function LUTPicker() {
  const { currentLUT, setCurrentLUT, intensity, setIntensity, customLUTs, isProMode, toggleProMode } = useLUTStore();
  const [activeCategory, setActiveCategory] = React.useState('featured');

  const allPresets = [...LUT_PRESETS, ...customLUTs];

  const getCategoryPresets = (categoryId: string) => {
    const cat = categories.find(c => c.key === categoryId);
    if (!cat) return [];
    if (cat.key === 'custom') return customLUTs;
    return cat.ids.map(id => allPresets.find(p => p.id === id)).filter(Boolean) as typeof allPresets;
  };

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.key
                ? 'bg-[#A78BFA] text-white'
                : 'bg-white/10 text-[#6B7280] hover:text-[#F9FAFB]'
            }`}
          >
            {t(cat.labelKey)}
          </button>
        ))}
      </div>

      {/* LUT Thumbnails */}
      <div className="grid grid-cols-5 gap-2">
        {getCategoryPresets(activeCategory).map((lut) => (
          <button
            key={lut.id}
            onClick={() => setCurrentLUT(lut)}
            className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
              currentLUT.id === lut.id
                ? 'border-[#A78BFA] shadow-[0_0_10px_rgba(167,139,250,0.3)]'
                : 'border-white/5 hover:border-white/20'
            }`}
          >
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg,
                  rgb(${lut.colors.shadows[0] * 255}, ${lut.colors.shadows[1] * 255}, ${lut.colors.shadows[2] * 255}),
                  rgb(${lut.colors.mids[0] * 255}, ${lut.colors.mids[1] * 255}, ${lut.colors.mids[2] * 255}),
                  rgb(${lut.colors.highlights[0] * 255}, ${lut.colors.highlights[1] * 255}, ${lut.colors.highlights[2] * 255})
                )`,
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-[9px] text-white font-medium truncate">{lut.name}</p>
            </div>
            {currentLUT.id === lut.id && (
              <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-[#A78BFA] flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><path d="M20 6L9 17l-5-5" /></svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Intensity Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#6B7280]">{t('lut.intensity')}</span>
          <span className="text-xs text-[#F9FAFB]">{Math.round(intensity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={intensity}
          onChange={(e) => setIntensity(parseFloat(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#A78BFA]
            [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(167,139,250,0.4)]"
        />
      </div>

      {/* Pro Mode Toggle + Export */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <button
          onClick={toggleProMode}
          className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
            isProMode ? 'bg-[#6EE7B7]/20 text-[#6EE7B7]' : 'bg-white/10 text-[#6B7280]'
          }`}
        >
          {isProMode ? 'Pro Mode Active' : 'Pro Mode'}
        </button>
        <button className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/10 text-[#6B7280] hover:text-[#F9FAFB] transition-colors">
          {t('lut.export_cube')}
        </button>
      </div>
    </div>
  );
}
