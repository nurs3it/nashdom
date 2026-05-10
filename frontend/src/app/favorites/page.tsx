'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Heart, History, Search, Sparkles } from 'lucide-react';
import { DashboardShell } from '@/widgets/dashboard-shell/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/app/providers/auth-provider';
import { propertiesApi } from '@/shared/api';
import { PropertyCard } from '@/entities/property';

export default function Page() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'saved' | 'recent' | 'searches'>('saved');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/auth/login');
  }, [authLoading, isAuthenticated, router]);

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: propertiesApi.getFavorites,
    enabled: isAuthenticated,
  });

  if (authLoading || !isAuthenticated) return null;

  return (
    <DashboardShell title="Избранное" subtitle="Сохранённые объекты, история и подписки на новые объявления">
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="h-12">
          <TabsTrigger value="saved" className="gap-2">
            <Heart className="h-4 w-4" strokeWidth={1.75} />
            Сохранённые
            {favorites && favorites.length > 0 && (
              <span className="inline-flex h-5 items-center rounded-full bg-secondary px-2 text-[11px] font-semibold tabular-nums">
                {favorites.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="recent" className="gap-2">
            <History className="h-4 w-4" strokeWidth={1.75} />
            Недавно
          </TabsTrigger>
          <TabsTrigger value="searches" className="gap-2">
            <Search className="h-4 w-4" strokeWidth={1.75} />
            Сохранённые поиски
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="mt-6">
          {isLoading ? (
            <SavedSkeleton />
          ) : !favorites || favorites.length === 0 ? (
            <EmptyHero
              icon={<Heart className="h-7 w-7" strokeWidth={1.5} />}
              title="Нет сохранённых объектов"
              desc="Нажимайте на сердечко на объявлении — оно появится здесь, чтобы быстро вернуться позже."
              cta={{ href: '/properties', label: 'Перейти к каталогу' }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {favorites.map((f) => (
                <PropertyCard key={f.id} property={f.property} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          <EmptyHero
            icon={<History className="h-7 w-7" strokeWidth={1.5} />}
            title="История просмотров скоро появится"
            desc="Здесь будут объявления, которые вы недавно открывали — чтобы быстро к ним вернуться."
            cta={{ href: '/properties', label: 'Открыть каталог' }}
          />
        </TabsContent>

        <TabsContent value="searches" className="mt-6">
          <SavedSearchesPlaceholder />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}

function SavedSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="aspect-[4/3] bg-sand-100 dark:bg-sand-800 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-6 w-1/2 bg-sand-100 dark:bg-sand-800 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-sand-100 dark:bg-sand-800 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyHero({
  icon,
  title,
  desc,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center text-center rounded-2xl border border-dashed border-border bg-card/50 py-16 px-6">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-terra-100 text-terra-500 dark:bg-sand-850 dark:text-terra-300 mb-4">
        {icon}
      </div>
      <h3 className="font-display text-xl font-semibold tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-5 leading-relaxed">{desc}</p>
      {cta && (
        <Button asChild size="lg">
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      )}
    </div>
  );
}

function SavedSearchesPlaceholder() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 sm:p-8">
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-terra-100 text-terra-500 dark:bg-sand-850 dark:text-terra-300 shrink-0">
          <Sparkles className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-xl font-semibold tracking-tight">Сохраняйте поиски и получайте уведомления</h3>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Задайте параметры поиска один раз — и мы будем присылать новые объявления, которые подходят под ваши критерии. Скоро эта функция станет доступна прямо из каталога.
          </p>
          <Button asChild className="mt-4" size="lg">
            <Link href="/properties">Подобрать первый поиск</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
