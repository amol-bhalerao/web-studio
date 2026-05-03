import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import type { GalleryItemPublic } from '../api/types';
import { mediaUrl } from '../lib/mediaUrl';

type Props = {
  items: GalleryItemPublic[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (i: number) => void;
};

export function GalleryLightbox({ items, index, onClose, onIndexChange }: Props) {
  const open = index !== null && items.length > 0;
  const current = open && index !== null ? items[index] : null;

  const goPrev = useCallback(() => {
    if (index === null || !items.length) return;
    onIndexChange((index - 1 + items.length) % items.length);
  }, [index, items.length, onIndexChange]);

  const goNext = useCallback(() => {
    if (index === null || !items.length) return;
    onIndexChange((index + 1) % items.length);
  }, [index, items.length, onIndexChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, goPrev, goNext]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && current && index !== null && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
            aria-label="Close gallery"
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 flex max-h-[min(92vh,900px)] w-full max-w-5xl flex-col"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <div className="relative flex min-h-0 flex-1 items-center justify-center rounded-2xl bg-slate-900/40 p-2 shadow-2xl ring-1 ring-white/10">
              <button
                type="button"
                className="absolute right-3 top-3 z-20 rounded-full bg-black/50 p-2 text-white ring-1 ring-white/20 transition hover:bg-black/70"
                aria-label="Close"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </button>

              {items.length > 1 && (
                <>
                  <button
                    type="button"
                    className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-white ring-1 ring-white/20 transition hover:bg-black/70 sm:left-4"
                    aria-label="Previous"
                    onClick={(e) => {
                      e.stopPropagation();
                      goPrev();
                    }}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-white ring-1 ring-white/20 transition hover:bg-black/70 sm:right-4"
                    aria-label="Next"
                    onClick={(e) => {
                      e.stopPropagation();
                      goNext();
                    }}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              <div className="flex max-h-full w-full flex-col items-center justify-center overflow-hidden rounded-xl">
                {current.media_type === 'image' ? (
                  <img
                    src={mediaUrl(current.url)}
                    alt={current.caption || ''}
                    className="max-h-[min(78vh,800px)] w-auto max-w-full object-contain"
                  />
                ) : (
                  <video
                    key={current.id}
                    src={mediaUrl(current.url)}
                    className="max-h-[min(78vh,800px)] w-full max-w-full rounded-lg"
                    controls
                    playsInline
                    autoPlay
                  />
                )}
                {current.caption && (
                  <p className="mt-3 max-w-2xl px-4 text-center text-sm text-white/90">{current.caption}</p>
                )}
                {items.length > 1 && (
                  <p className="mt-2 text-xs text-white/50">
                    {index + 1} / {items.length}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
