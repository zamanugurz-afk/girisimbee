'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Maximize2,
  X,
  ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [loaded, setLoaded] = useState<Set<number>>(new Set());
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  const next = useCallback(() => {
    setActiveIdx((i) => (i + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setActiveIdx((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!fullscreen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false);
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [fullscreen, next, prev]);

  useEffect(() => {
    if (images.length === 0) return;
    const handler = (e: KeyboardEvent) => {
      if (fullscreen) return;
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [fullscreen, next, prev, images.length]);

  const markLoaded = (idx: number) => {
    setLoaded((prev) => new Set(prev).add(idx));
  };

  const markError = (idx: number) => {
    setImgErrors((prev) => new Set(prev).add(idx));
  };

  if (images.length === 0) {
    return (
      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-muted/50 to-muted/20">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <ImageIcon className="h-12 w-12" />
          <p className="text-sm">Fotoğraf yok</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Main image */}
        <div
          className={cn(
            'group relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-card',
            zoomed && 'cursor-zoom-out',
            !zoomed && 'cursor-zoom-in',
          )}
          onClick={() => setZoomed(!zoomed)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: zoomed ? 1.5 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full w-full"
            >
              {imgErrors.has(activeIdx) ? (
                <div className="flex h-full w-full items-center justify-center bg-muted/30">
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                </div>
              ) : (
                <>
                  {!loaded.has(activeIdx) && (
                    <div className="absolute inset-0 animate-pulse bg-muted/40" />
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={images[activeIdx]}
                    alt={`${title} — görsel ${activeIdx + 1}`}
                    className="h-full w-full object-cover"
                    onLoad={() => markLoaded(activeIdx)}
                    onError={() => markError(activeIdx)}
                    draggable={false}
                  />
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Image counter */}
          <div className="absolute bottom-3 left-3 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-sm">
            {activeIdx + 1} / {images.length}
          </div>

          {/* Zoom indicator */}
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); setZoomed(!zoomed); }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
              aria-label="Yakınlaştır"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setFullscreen(true); }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
              aria-label="Tam ekran"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>

          {/* Nav arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 backdrop-blur-sm transition-opacity hover:bg-background group-hover:opacity-100"
                aria-label="Önceki görsel"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 backdrop-blur-sm transition-opacity hover:bg-background group-hover:opacity-100"
                aria-label="Sonraki görsel"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={cn(
                  'relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                  idx === activeIdx
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/40',
                )}
              >
                {imgErrors.has(idx) ? (
                  <div className="flex h-full w-full items-center justify-center bg-muted/30">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={`${title} — küçük görsel ${idx + 1}`}
                    className="h-full w-full object-cover"
                    onError={() => markError(idx)}
                    draggable={false}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl"
            onClick={() => setFullscreen(false)}
          >
            <button
              className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-muted"
              aria-label="Kapat"
            >
              <X className="h-6 w-6" />
            </button>

            <motion.img
              key={activeIdx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              src={images[activeIdx]}
              alt={`${title} — tam ekran ${activeIdx + 1}`}
              className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
              // eslint-disable-next-line @next/next/no-img-element
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="absolute left-6 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-muted"
                  aria-label="Önceki"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  className="absolute right-6 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-muted"
                  aria-label="Sonraki"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-foreground">
              {activeIdx + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
