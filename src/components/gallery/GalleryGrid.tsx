import React from 'react';
import type { GalleryPhoto } from '../../lib/types';

interface GalleryGridProps {
  photos: GalleryPhoto[];
  onSelect: (photo: GalleryPhoto) => void;
  onDelete: (id: string) => void;
}

export function GalleryGrid({ photos, onSelect, onDelete }: GalleryGridProps) {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#A78BFA]/10 to-[#6EE7B7]/10 flex items-center justify-center mb-4 border border-white/5">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-[#F9FAFB] mb-1">No photos yet</h3>
        <p className="text-sm text-[#6B7280]">Take your first photo with the CinePose camera.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="relative aspect-square group cursor-pointer overflow-hidden bg-white/5"
          onClick={() => onSelect(photo)}
        >
          <img
            src={photo.thumbnail}
            alt=""
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(photo.id);
              }}
              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/60 transition-colors border border-white/10"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </button>
          </div>
          <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <span className="text-[10px] text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10 font-mono">
              {photo.lut}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
