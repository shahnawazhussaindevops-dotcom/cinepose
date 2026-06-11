import React, { useCallback, useEffect, useRef } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: string;
  showHandle?: boolean;
}

export function BottomSheet({ open, onClose, title, children, height = '40%', showHandle = true }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    startY.current = e.clientY;
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    currentY.current = e.clientY - startY.current;
    if (sheetRef.current && currentY.current > 0) {
      sheetRef.current.style.transform = `translateY(${currentY.current}px)`;
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (currentY.current > 100) {
      onClose();
    }
    if (sheetRef.current) {
      sheetRef.current.style.transform = '';
    }
    currentY.current = 0;
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className="relative w-full rounded-t-2xl bg-[#111827] border-t border-white/10 transition-transform duration-300 ease-out"
        style={{ height, maxHeight: '90vh' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {showHandle && (
          <div
            className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown}
          >
            <div className="w-10 h-1 rounded-full bg-white/30" />
          </div>
        )}
        {title && (
          <h2 className="px-6 pb-4 text-lg font-semibold text-[#F9FAFB]">{title}</h2>
        )}
        <div className="px-4 pb-6 overflow-y-auto max-h-[calc(100%-60px)]">
          {children}
        </div>
      </div>
    </div>
  );
}
