import React, { useState } from 'react';
import { useCameraStore } from '../../stores/cameraStore';
import { GalleryGrid } from './GalleryGrid';
import type { GalleryPhoto } from '../../lib/types';

interface GalleryViewProps {
  onSelect?: (photo: GalleryPhoto) => void;
}

export function GalleryView({ onSelect }: GalleryViewProps) {
  const photosTaken = useCameraStore((s) => s.photosTaken);
  const removePhoto = useCameraStore((s) => s.removePhoto);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  const handleSelect = (photo: GalleryPhoto) => {
    setSelectedPhoto(photo);
    onSelect?.(photo);
  };

  if (selectedPhoto) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="flex items-center justify-between px-4 pt-12 pb-4 bg-gradient-to-b from-black/60 to-transparent">
            <button onClick={() => setSelectedPhoto(null)} className="p-2 rounded-full bg-white/10 text-white/70" aria-label="Back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={() => { removePhoto(selectedPhoto.id); setSelectedPhoto(null); }} className="p-2 rounded-full bg-red-500/20 text-red-400" aria-label="Delete photo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </button>
          </div>
        </div>
        <img src={selectedPhoto.uri} className="w-full h-full object-contain" alt={`Photo with ${selectedPhoto.lut} LUT`} />
      </div>
    );
  }

  return (
    <GalleryGrid
      photos={photosTaken}
      onSelect={handleSelect}
      onDelete={removePhoto}
    />
  );
}
