'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* LEFT — form */}
      <div className="flex w-full lg:w-1/2 flex-col">
        <div className="flex items-center justify-between px-6 lg:px-10 py-5">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground font-display text-lg font-semibold shadow-sm transition-transform group-hover:-rotate-3">
              N
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">NashDom</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 lg:px-10 py-8">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
              На главную
            </Link>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
              {title}
            </h1>
            {subtitle && <p className="mt-2.5 text-muted-foreground">{subtitle}</p>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-6 text-sm">{footer}</div>}
          </div>
        </div>
      </div>

      {/* RIGHT — visual */}
      <aside className="hidden lg:flex relative w-1/2 overflow-hidden bg-gradient-to-br from-terra-500 via-terra-600 to-ochre-500 dark:from-terra-600 dark:via-terra-700 dark:to-sand-900">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.4)_1px,transparent_0)] [background-size:32px_32px]"
        />
        <div
          aria-hidden
          className="absolute -top-32 -right-20 h-[480px] w-[480px] rounded-full bg-ochre-300/40 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-40 -left-20 h-[420px] w-[420px] rounded-full bg-terra-700/50 blur-3xl"
        />

        <div className="relative z-10 flex flex-col justify-end p-12 text-white w-full">
          <div className="max-w-lg">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 backdrop-blur-md font-display text-2xl font-semibold mb-6">
              N
            </div>
            <p className="font-display text-3xl xl:text-4xl leading-tight font-semibold tracking-tight">
              Найди дом, который чувствуешь своим.
            </p>
            <p className="mt-4 text-base text-white/80 leading-relaxed">
              Тёплый поиск недвижимости по всему Казахстану — без сложных фильтров и тяжёлых форм.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
