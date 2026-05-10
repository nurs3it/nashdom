'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Building2,
  Home as HomeIcon,
  KeyRound,
  Mail,
  Sparkles,
  Users,
} from 'lucide-react';
import { Header } from '@/widgets/header/header';
import { Footer } from '@/widgets/footer/footer';
import { PropertyCard } from '@/entities/property';
import { SearchBar } from '@/features/property-search';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { propertiesApi, contactsApi } from '@/shared/api';
import { cn } from '@/lib/utils';

export function HomePage() {
  const { data: featured } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: propertiesApi.getFeaturedProperties,
  });

  // Общий счётчик объектов
  const { data: totalsData } = useQuery({
    queryKey: ['properties', 'total'],
    queryFn: () => propertiesApi.getProperties({} as never),
    select: (resp) => resp.count,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Hero total={totalsData} />
        <QuickCategories />
        <FeaturedSection featured={featured ?? []} />
        <PartnerCTA />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}

/* ---------- Hero ---------- */

function Hero({ total }: { total?: number }) {
  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-br from-terra-100 via-sand-100 to-ochre-300/30 dark:from-sand-850 dark:via-sand-900 dark:to-sand-850"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,theme(colors.terra-300)_1px,transparent_0)] [background-size:28px_28px] dark:opacity-15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[480px] w-[480px] rounded-full bg-ochre-300/40 blur-3xl dark:bg-terra-500/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-20%] left-[-10%] h-[360px] w-[360px] rounded-full bg-terra-300/30 blur-3xl dark:bg-terra-700/30"
      />

      <div className="container relative pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="max-w-3xl mx-auto text-center">
          {typeof total === 'number' && total > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-ochre-400" strokeWidth={2} />
              <span className="tabular-nums font-semibold text-foreground">{total.toLocaleString('ru-KZ')}</span>{' '}
              {pluralizeRu(total, 'объект', 'объекта', 'объектов')} на платформе
            </span>
          )}
          <h1 className="font-display mt-5 text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-[-0.02em] text-foreground">
            Найди дом, который
            <br />
            <span className="bg-gradient-to-r from-terra-500 via-terra-600 to-ochre-500 bg-clip-text text-transparent dark:from-terra-300 dark:via-terra-400 dark:to-ochre-300">
              чувствуешь своим
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-foreground/70 max-w-xl mx-auto leading-relaxed">
            Квартиры, дома и коммерция по всему Казахстану. Тёплый поиск без сложных фильтров.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-4xl">
          <SearchBar variant="hero" />
        </div>
      </div>
    </section>
  );
}

/* ---------- Quick Categories ---------- */

const CATEGORIES = [
  {
    title: 'Квартиры',
    href: '/properties?property_type=1',
    icon: <Building2 className="h-7 w-7" strokeWidth={1.5} />,
    bg: 'bg-terra-100 dark:bg-terra-900/40',
    fg: 'text-terra-700 dark:text-terra-200',
    ring: 'group-hover:ring-terra-300/60 dark:group-hover:ring-terra-500/40',
  },
  {
    title: 'Дома',
    href: '/properties?property_type=2',
    icon: <HomeIcon className="h-7 w-7" strokeWidth={1.5} />,
    bg: 'bg-ochre-300/30 dark:bg-ochre-500/15',
    fg: 'text-ochre-500 dark:text-ochre-300',
    ring: 'group-hover:ring-ochre-400/60 dark:group-hover:ring-ochre-300/40',
  },
  {
    title: 'Коммерция',
    href: '/properties?property_type=3',
    icon: <Briefcase className="h-7 w-7" strokeWidth={1.5} />,
    bg: 'bg-info/15 dark:bg-info/20',
    fg: 'text-info dark:text-[#9CC3D3]',
    ring: 'group-hover:ring-info/40',
  },
  {
    title: 'Посуточно',
    href: '/properties?deal=daily',
    icon: <KeyRound className="h-7 w-7" strokeWidth={1.5} />,
    bg: 'bg-success/15 dark:bg-success/20',
    fg: 'text-success dark:text-[#7FD8A6]',
    ring: 'group-hover:ring-success/40',
  },
];

function QuickCategories() {
  return (
    <section className="container py-14 lg:py-20">
      <SectionHeader eyebrow="Категории" title="С чего начать поиск" />
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className={cn(
              'group relative overflow-hidden rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm',
              'transition-all duration-200 ease-out hover:shadow-lg hover:-translate-y-0.5',
              'ring-1 ring-transparent',
              c.ring,
            )}
          >
            <div className={cn('inline-flex h-12 w-12 items-center justify-center rounded-xl', c.bg, c.fg)}>
              {c.icon}
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">{c.title}</h3>
            <ArrowUpRight
              className="absolute right-4 top-4 h-5 w-5 text-muted-foreground/60 transition-all group-hover:text-primary group-hover:rotate-12"
              strokeWidth={1.75}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ---------- Featured / Подборки сегодня ---------- */

function FeaturedSection({ featured }: { featured: any[] }) {
  if (!featured || featured.length === 0) return null;
  return (
    <section className="container pt-2 pb-14 lg:pb-20">
      <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
            Подборки
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            Подборки сегодня
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Лучшее из новых объявлений, отобранное редакцией
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/properties?is_featured=true">
            Смотреть все
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </Button>
      </div>

      <div className="-mx-4 sm:mx-0 overflow-x-auto pb-2 [scrollbar-width:thin]">
        <div className="flex gap-4 px-4 sm:px-0 snap-x snap-mandatory">
          {featured.slice(0, 6).map((p) => (
            <div key={p.id} className="snap-start shrink-0 w-[88vw] sm:w-[420px] lg:w-[460px]">
              <PropertyCard property={p} variant="featured" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Partner CTA ---------- */

function PartnerCTA() {
  return (
    <section className="container py-14 lg:py-20">
      <div className="relative overflow-hidden rounded-2xl bg-terra-500 dark:bg-terra-600 px-6 py-10 lg:px-12 lg:py-14 text-white shadow-lg">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-ochre-300/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 bottom-[-40%] h-72 w-72 rounded-full bg-terra-700/30 blur-3xl"
        />
        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] items-end gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3 py-1.5 text-xs font-semibold uppercase tracking-wider">
              <Users className="h-3.5 w-3.5" strokeWidth={2} /> Для риелторов и агентств
            </span>
            <h3 className="font-display mt-4 text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
              Размещайте объявления и получайте звонки от целевых клиентов
            </h3>
            <p className="mt-3 text-base text-white/85 max-w-xl leading-relaxed">
              Бесплатное размещение, аналитика просмотров, продвижение в подборках.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-white text-terra-600 hover:bg-sand-100">
              <Link href="/auth/register">Стать партнёром</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/15">
              <Link href="/properties">Узнать больше</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Newsletter ---------- */

function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await contactsApi.subscribeNewsletter(email);
      setDone(true);
      setEmail('');
    } catch {
      /* toast позже */
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container pb-16 lg:pb-24">
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              <Mail className="h-3.5 w-3.5" strokeWidth={2} /> Подборка раз в неделю
            </div>
            <h3 className="font-display mt-2 text-xl sm:text-2xl font-semibold tracking-tight">
              Получайте новые объекты по вашим параметрам
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Без спама. Только новые объявления и снижения цены — в вашем почтовом ящике.
            </p>
          </div>
          <form onSubmit={onSubmit} className="flex w-full flex-col sm:flex-row gap-2 lg:min-w-[420px]">
            <Input
              type="email"
              placeholder="ваш@email.kz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 h-12"
            />
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? 'Отправляем…' : done ? 'Подписаны' : 'Подписаться'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ---------- Helpers ---------- */

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function pluralizeRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
