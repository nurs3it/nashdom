import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  /** Компактный режим — только иконка, без иллюстрации (для очень маленьких блоков) */
  compact?: boolean;
}

/**
 * Тёплый плейсхолдер вместо плоского блока для карточек / списков
 * объявлений без фото. Согласован с EmptyGallery (детальная страница),
 * но в компактном размере и без текста — для thumb 4:3.
 */
export function PropertyThumbPlaceholder({ className, compact = false }: Props) {
  return (
    <div
      className={cn(
        'relative h-full w-full overflow-hidden bg-gradient-to-br from-terra-100 via-sand-100 to-ochre-300/30 dark:from-sand-850 dark:via-sand-900 dark:to-sand-850',
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,theme(colors.terra-300)_1px,transparent_0)] [background-size:18px_18px] dark:opacity-15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-6 h-32 w-32 rounded-full bg-ochre-300/30 blur-2xl dark:bg-terra-500/15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-6 h-28 w-28 rounded-full bg-terra-300/30 blur-2xl dark:bg-terra-700/30"
      />
      <div className="relative h-full w-full grid place-items-center">
        {compact ? (
          <ImageOff className="h-6 w-6 text-sand-500 dark:text-sand-400" strokeWidth={1.5} />
        ) : (
          <MiniHouse />
        )}
      </div>
    </div>
  );
}

function MiniHouse() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="drop-shadow-sm"
    >
      <defs>
        <linearGradient id="card-house-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FBF4EE" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="card-roof-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D08252" />
          <stop offset="100%" stopColor="#C26537" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="106" rx="30" ry="3.5" fill="rgba(56,32,16,0.18)" />
      <rect x="28" y="48" width="64" height="50" rx="6" fill="url(#card-house-grad)" stroke="#7E3C20" strokeOpacity="0.5" strokeWidth="1.5" />
      <path d="M22 50 L60 22 L98 50 Z" fill="url(#card-roof-grad)" stroke="#7E3C20" strokeOpacity="0.55" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="54" y="74" width="12" height="24" rx="2" fill="#C26537" opacity="0.85" />
      <rect x="36" y="60" width="12" height="10" rx="1.5" fill="#3F7A8E" opacity="0.55" />
      <rect x="72" y="60" width="12" height="10" rx="1.5" fill="#3F7A8E" opacity="0.55" />
    </svg>
  );
}
