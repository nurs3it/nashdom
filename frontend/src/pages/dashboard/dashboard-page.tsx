'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Eye, Heart, Home as HomeIcon, MessageSquare, Plus, Sparkles, TrendingUp } from 'lucide-react';
import { DashboardShell } from '@/widgets/dashboard-shell/dashboard-shell';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/providers/auth-provider';
import { propertiesApi, contactsApi } from '@/shared/api';
import { PriceTag, StatusBadge, formatRelativeDate } from '@/entities/property';
import { cn } from '@/lib/utils';

export function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !['realtor', 'superadmin'].includes(user?.role || ''))) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router]);

  const { data: stats } = useQuery({
    queryKey: ['user-property-stats'],
    queryFn: propertiesApi.getUserPropertyStats,
    enabled: isAuthenticated,
  });

  const { data: properties } = useQuery({
    queryKey: ['user-properties', 'recent'],
    queryFn: () => propertiesApi.getUserProperties({ ordering: '-created_at' } as never),
    enabled: isAuthenticated,
    select: (resp) => resp.results.slice(0, 5),
  });

  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: propertiesApi.getFavorites,
    enabled: isAuthenticated,
  });

  const { data: requests } = useQuery({
    queryKey: ['user-contact-requests'],
    queryFn: contactsApi.getUserContactRequests,
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !['realtor', 'superadmin'].includes(user?.role || '')) return null;

  const greeting = user?.first_name ? `Привет, ${user.first_name}` : 'Привет';

  return (
    <DashboardShell title={greeting} subtitle="Сводка по объявлениям и активности за всё время">
      {/* Bento metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile
          icon={<HomeIcon className="h-5 w-5" />}
          label="Активные"
          value={stats?.active_properties ?? 0}
          hint={`из ${stats?.total_properties ?? 0} всего`}
          tint="terra"
        />
        <Tile
          icon={<Eye className="h-5 w-5" />}
          label="Просмотры"
          value={(stats?.most_viewed ?? []).reduce((s, p) => s + (p.views_count ?? 0), 0)}
          hint="по топ-объявлениям"
          tint="info"
        />
        <Tile
          icon={<Heart className="h-5 w-5" />}
          label="В избранном"
          value={favorites?.length ?? 0}
          hint="у клиентов"
          tint="ochre"
        />
        <Tile
          icon={<MessageSquare className="h-5 w-5" />}
          label="Заявки"
          value={requests?.length ?? 0}
          hint="всего получено"
          tint="success"
        />
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <Action
          href="/dashboard/properties/add"
          icon={<Plus className="h-5 w-5" />}
          title="Подать объявление"
          desc="Создать новый объект за 2 минуты"
          accent
        />
        <Action
          href="/dashboard/properties"
          icon={<HomeIcon className="h-5 w-5" />}
          title="Все объявления"
          desc="Управлять активными и архивом"
        />
        <Action
          href="/favorites"
          icon={<Heart className="h-5 w-5" />}
          title="Избранное"
          desc="Сохранённые и недавно просмотренные"
        />
      </div>

      {/* 2 columns: recent + popular */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard
          title="Последние объявления"
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/properties">
                Все <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </Button>
          }
        >
          {properties && properties.length > 0 ? (
            <ul className="divide-y divide-border">
              {properties.map((p) => (
                <li key={p.id} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    href={`/properties/${p.id}`}
                    className="flex items-center gap-3 group rounded-lg -mx-2 px-2 py-1.5 hover:bg-secondary/60 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold leading-tight truncate group-hover:text-primary transition-colors">
                        {p.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="truncate">{p.city}{p.district ? `, ${p.district}` : ''}</span>
                        <span aria-hidden>·</span>
                        <span>{formatRelativeDate(p.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                        <Eye className="h-3 w-3" strokeWidth={2} /> {p.views_count}
                      </span>
                      <PriceTag price={p.price} serviceSlug={p.service_type?.slug} size="sm" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyMini
              title="Пока нет объявлений"
              cta={{ href: '/dashboard/properties/add', label: 'Подать первое' }}
            />
          )}
        </SectionCard>

        <SectionCard
          title="Самые просматриваемые"
          action={
            stats?.most_viewed && stats.most_viewed.length > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs text-success font-semibold">
                <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} /> Лидеры
              </span>
            ) : null
          }
        >
          {stats?.most_viewed && stats.most_viewed.length > 0 ? (
            <ul className="divide-y divide-border">
              {stats.most_viewed.slice(0, 5).map((p) => (
                <li key={p.id} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    href={`/properties/${p.id}`}
                    className="flex items-center gap-3 group rounded-lg -mx-2 px-2 py-1.5 hover:bg-secondary/60 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold leading-tight truncate group-hover:text-primary transition-colors">
                        {p.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground truncate">
                        {p.city}{p.district ? `, ${p.district}` : ''}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1 text-sm font-semibold tabular-nums text-foreground">
                      <Eye className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} /> {p.views_count}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyMini title="Пока нет данных по просмотрам" />
          )}
        </SectionCard>
      </div>
    </DashboardShell>
  );
}

/* ---------- Subcomponents ---------- */

const TINTS: Record<string, { bg: string; fg: string }> = {
  terra:   { bg: 'bg-terra-100 dark:bg-terra-900/40',     fg: 'text-terra-700 dark:text-terra-200' },
  ochre:   { bg: 'bg-ochre-300/30 dark:bg-ochre-500/15',  fg: 'text-ochre-500 dark:text-ochre-300' },
  info:    { bg: 'bg-info/15 dark:bg-info/20',            fg: 'text-info dark:text-[#9CC3D3]' },
  success: { bg: 'bg-success/15 dark:bg-success/20',      fg: 'text-success dark:text-[#7FD8A6]' },
};

function Tile({
  icon,
  label,
  value,
  hint,
  tint = 'terra',
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint?: string;
  tint?: keyof typeof TINTS;
}) {
  const t = TINTS[tint];
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
      <div className={cn('inline-flex h-10 w-10 items-center justify-center rounded-lg', t.bg, t.fg)}>{icon}</div>
      <p className="mt-3 text-xs uppercase tracking-wider font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold tracking-tight tabular-nums">{value.toLocaleString('ru-KZ')}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Action({
  href,
  icon,
  title,
  desc,
  accent = false,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative overflow-hidden rounded-xl border p-4 sm:p-5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md',
        accent
          ? 'bg-primary text-primary-foreground border-transparent hover:bg-terra-600 dark:hover:bg-terra-300 dark:hover:text-sand-900'
          : 'bg-card border-border hover:border-sand-300 dark:hover:border-sand-600',
      )}
    >
      <div className={cn('inline-flex h-10 w-10 items-center justify-center rounded-lg', accent ? 'bg-white/20' : 'bg-secondary text-foreground/80')}>
        {icon}
      </div>
      <h3 className="mt-3 font-semibold leading-tight">{title}</h3>
      <p className={cn('mt-1 text-sm leading-snug', accent ? 'text-white/80' : 'text-muted-foreground')}>{desc}</p>
      <ArrowUpRight
        className={cn(
          'absolute right-4 top-4 h-5 w-5 transition-all group-hover:rotate-12',
          accent ? 'text-white/70 group-hover:text-white' : 'text-muted-foreground/60 group-hover:text-primary',
        )}
        strokeWidth={1.75}
      />
    </Link>
  );
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
        <h3 className="font-display text-base font-semibold tracking-tight">{title}</h3>
        {action}
      </div>
      <div className="px-5 py-3">{children}</div>
    </div>
  );
}

function EmptyMini({ title, cta }: { title: string; cta?: { href: string; label: string } }) {
  return (
    <div className="text-center py-8">
      <p className="text-sm text-muted-foreground mb-3">{title}</p>
      {cta && (
        <Button asChild size="sm">
          <Link href={cta.href}>
            <Plus className="h-4 w-4" strokeWidth={2} /> {cta.label}
          </Link>
        </Button>
      )}
    </div>
  );
}
