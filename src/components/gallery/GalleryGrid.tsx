import React from 'react';
import type { GalleryPhoto } from '../../lib/types';
import { t } from '../../lib/i18n';

interface GalleryGridProps {
  photos: GalleryPhoto[];
  onSelect: (photo: GalleryPhoto) => void;
  onDelete: (id: string) => void;
}

export function GalleryGrid({ photos, onSelect, onDelete }: GalleryGridProps) {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-[#F9FAFB] mb-1">{t('gallery.empty')}</h3>
        <p className="text-sm text-[#6B7280]">{t('gallery.empty_desc')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="relative aspect-square group cursor-pointer overflow-hidden bg-white/5"
          onClick={() => onSelect(photo)}
        >
          <img
            src={photo.thumbnail}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(photo.id);
              }}
              className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/50 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </button>
          </div>
          <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-white bg-black/50 px-1.5 py-0.5 rounded">
              {photo.lut}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
