'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Expand, ImageOff, Sparkles, X } from 'lucide-react';
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
    return <EmptyGallery className={className} />;
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

/* ---------- Empty gallery (нет фото) ---------- */

function EmptyGallery({ className }: { className?: string }) {
  return (
    <div className={cn('relative w-full', className)}>
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 overflow-hidden rounded-2xl">
        {/* Главный «no-photo» блок — занимает 2x2 как обычная главная фотка */}
        <div className="relative md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto overflow-hidden bg-gradient-to-br from-terra-100 via-sand-100 to-ochre-300/40 dark:from-sand-850 dark:via-sand-900 dark:to-sand-850">
          {/* dot-pattern */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,theme(colors.terra-300)_1px,transparent_0)] [background-size:24px_24px] dark:opacity-15"
          />
          {/* warm glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-12 h-72 w-72 rounded-full bg-ochre-300/40 blur-3xl dark:bg-terra-500/20"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-12 h-60 w-60 rounded-full bg-terra-300/30 blur-3xl dark:bg-terra-700/30"
          />

          {/* SVG-иллюстрация дома + камеры */}
          <div className="relative h-full w-full grid place-items-center px-6 py-8">
            <div className="text-center">
              <HouseCameraIllustration />
              <p className="font-display mt-4 text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                Фотографий пока нет
              </p>
              <p className="mt-2 text-sm text-foreground/70 max-w-xs mx-auto leading-relaxed">
                Автор объявления ещё не загрузил снимки. Уточните детали в звонке или сообщении.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-card/80 backdrop-blur-md border border-border/60 px-3 py-1.5 text-xs font-medium text-foreground/70 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-ochre-400" strokeWidth={2} />
                Объявление ещё свежее
              </div>
            </div>
          </div>
        </div>

        {/* 4 «thumb» плейсхолдера для сохранения пропорций bento */}
        {Array.from({ length: 4 }).map((_, i) => (
          <PlaceholderThumb key={i} />
        ))}
      </div>
    </div>
  );
}

function PlaceholderThumb() {
  return (
    <div className="relative hidden md:block aspect-square overflow-hidden bg-sand-100 dark:bg-sand-850">
      <div
        aria-hidden
        className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,theme(colors.sand-300)_1px,transparent_0)] [background-size:18px_18px] dark:opacity-10"
      />
      <div className="absolute inset-0 grid place-items-center text-sand-300 dark:text-sand-700">
        <ImageOff className="h-7 w-7" strokeWidth={1.25} />
      </div>
    </div>
  );
}

function HouseCameraIllustration() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="mx-auto drop-shadow-sm"
    >
      <defs>
        <linearGradient id="house-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FBF4EE" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="roof-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D08252" />
          <stop offset="100%" stopColor="#C26537" />
        </linearGradient>
      </defs>
      {/* Тень под домом */}
      <ellipse cx="60" cy="106" rx="30" ry="3.5" fill="rgba(56,32,16,0.18)" />
      {/* Корпус дома */}
      <rect x="28" y="48" width="64" height="50" rx="6" fill="url(#house-grad)" stroke="#7E3C20" strokeOpacity="0.5" strokeWidth="1.5" />
      {/* Крыша — терракотовая */}
      <path d="M22 50 L60 22 L98 50 Z" fill="url(#roof-grad)" stroke="#7E3C20" strokeOpacity="0.55" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Дверь */}
      <rect x="54" y="74" width="12" height="24" rx="2" fill="#C26537" opacity="0.85" />
      <circle cx="63" cy="86" r="0.9" fill="#FBF4EE" />
      {/* Окна */}
      <rect x="36" y="60" width="12" height="10" rx="1.5" fill="#3F7A8E" opacity="0.55" />
      <rect x="72" y="60" width="12" height="10" rx="1.5" fill="#3F7A8E" opacity="0.55" />
      {/* Камера-overlay сверху-справа */}
      <g transform="translate(74, 12)">
        <rect x="0" y="6" width="34" height="22" rx="4" fill="#1B1812" />
        <rect x="10" y="2" width="14" height="8" rx="1.5" fill="#1B1812" />
        <circle cx="17" cy="17" r="6.5" fill="#3D372D" stroke="#D08252" strokeWidth="1.5" />
        <circle cx="17" cy="17" r="2.5" fill="#FBF4EE" />
        {/* блик */}
        <circle cx="15" cy="15.5" r="0.9" fill="#FFFFFF" />
        {/* индикатор */}
        <circle cx="29" cy="11" r="1.2" fill="#E5B547" />
      </g>
    </svg>
  );
}
