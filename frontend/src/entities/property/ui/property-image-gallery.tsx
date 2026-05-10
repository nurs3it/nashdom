'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Expand, ImageOff, Home as HomeIcon, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

interface PropertyImageGalleryProps {
  images: string[];
  title: string;
  className?: string;
}

export function PropertyImageGallery({ images, title, className }: PropertyImageGalleryProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const safe = images.length > 0 ? images : [];
  const main = safe[0];
  const thumbs = safe.slice(1, 5);
  const moreCount = Math.max(0, safe.length - 5);

  const openAt = (i: number) => {
    setActiveIndex(i);
    setOpen(true);
  };

  if (safe.length === 0) {
    return (
      <div
        className={cn(
          'relative w-full aspect-[16/9] overflow-hidden rounded-2xl border border-dashed border-border bg-sand-100 dark:bg-sand-850',
          className,
        )}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,theme(colors.sand-300)_1px,transparent_0)] [background-size:24px_24px] dark:opacity-15"
        />
        <div className="relative h-full w-full grid place-items-center text-center px-6">
          <div>
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-card text-muted-foreground shadow-sm mb-3">
              <ImageOff className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <p className="font-display text-lg font-semibold tracking-tight">Фотографий пока нет</p>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
              Свяжитесь с автором объявления — возможно, он пришлёт фото в личном сообщении.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full', className)}>
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 overflow-hidden rounded-2xl">
        {/* Main image */}
        <button
          type="button"
          onClick={() => openAt(0)}
          className="relative md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto bg-sand-100 dark:bg-sand-800 overflow-hidden group"
        >
          <Image
            src={main}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            priority
          />
        </button>
        {thumbs.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => openAt(i + 1)}
            className="relative hidden md:block aspect-square bg-sand-100 dark:bg-sand-800 overflow-hidden group"
          >
            <Image
              src={src}
              alt={`${title} — фото ${i + 2}`}
              fill
              sizes="20vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
            {i === thumbs.length - 1 && moreCount > 0 && (
              <div className="absolute inset-0 grid place-items-center bg-sand-900/65 text-sand-50 backdrop-blur-sm">
                <span className="font-display text-xl font-semibold tabular-nums">+{moreCount}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* All photos button */}
      <button
        type="button"
        onClick={() => openAt(0)}
        className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-card/90 backdrop-blur px-3.5 py-2 text-sm font-semibold text-foreground shadow-md hover:bg-card transition-colors"
      >
        <Expand className="h-4 w-4" strokeWidth={1.75} />
        Все фото
        <span className="text-muted-foreground tabular-nums">({safe.length})</span>
      </button>

      {/* Lightbox */}
      <Lightbox open={open} onOpenChange={setOpen} images={safe} index={activeIndex} setIndex={setActiveIndex} title={title} />
    </div>
  );
}

function Lightbox({
  open,
  onOpenChange,
  images,
  index,
  setIndex,
  title,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  images: string[];
  index: number;
  setIndex: (i: number) => void;
  title: string;
}) {
  const next = useCallback(() => setIndex((index + 1) % images.length), [index, images.length, setIndex]);
  const prev = useCallback(() => setIndex((index - 1 + images.length) % images.length), [index, images.length, setIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, next, prev]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-sand-900/85 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogContent
          className="fixed inset-0 z-50 flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          {/* top bar */}
          <div className="flex items-center justify-between px-5 py-4 text-sand-50">
            <span className="font-display text-base font-semibold">
              {index + 1} <span className="opacity-60">/ {images.length}</span>
            </span>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Закрыть"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sand-50 hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>

          <div className="relative flex-1 px-5 pb-6">
            <div className="relative h-full w-full">
              <Image
                key={images[index]}
                src={images[index]}
                alt={title}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Назад"
                  className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-sand-50 hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Далее"
                  className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-sand-50 hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" strokeWidth={1.75} />
                </button>
              </>
            )}
          </div>

          {/* thumbnails */}
          {images.length > 1 && (
            <div className="px-5 pb-5">
              <div className="flex gap-2 overflow-x-auto [scrollbar-width:thin]">
                {images.map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={cn(
                      'relative shrink-0 h-16 w-24 overflow-hidden rounded-md ring-2 transition',
                      i === index ? 'ring-primary' : 'ring-transparent opacity-70 hover:opacity-100',
                    )}
                  >
                    <Image src={src} alt="" fill sizes="100px" className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
