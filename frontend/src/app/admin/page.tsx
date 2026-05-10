'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Building, Eye, Home as HomeIcon, MessageSquare, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { DashboardShell } from '@/widgets/dashboard-shell/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/app/providers/auth-provider';
import { authApi, contactsApi, propertiesApi } from '@/shared/api';
import { cn } from '@/lib/utils';

export default function Page() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'superadmin')) router.push('/');
  }, [isAuthenticated, isLoading, user, router]);

  const { data: userStats } = useQuery({ queryKey: ['admin', 'user-stats'], queryFn: authApi.getUserStats, enabled: user?.role === 'superadmin' });
  const { data: propertyStats } = useQuery({ queryKey: ['admin', 'property-stats'], queryFn: propertiesApi.getPropertyStats, enabled: user?.role === 'superadmin' });
  const { data: contactStats } = useQuery({ queryKey: ['admin', 'contact-stats'], queryFn: contactsApi.getContactStats, enabled: user?.role === 'superadmin' });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated || user?.role !== 'superadmin') return null;

  return (
    <DashboardShell
      title="Админ-панель"
      subtitle="Сводка по платформе и быстрые ссылки на разделы"
      actions={
        <Badge variant="soft" size="md" className="gap-1">
          <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} /> superadmin
        </Badge>
      }
    >
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile
          icon={<Users className="h-5 w-5" />}
          label="Пользователи"
          value={userStats?.total_users}
          hint={userStats ? `Подтверждены: ${userStats.verified_users}` : undefined}
          tint="terra"
        />
        <Tile
          icon={<HomeIcon className="h-5 w-5" />}
          label="Объявления"
          value={propertyStats?.total_properties}
          hint={propertyStats ? `Активных: ${propertyStats.active_properties}` : undefined}
          tint="ochre"
        />
        <Tile
          icon={<Eye className="h-5 w-5" />}
          label="Просмотры"
          value={propertyStats?.most_viewed?.reduce((s, p) => s + (p.views_count ?? 0), 0)}
          hint="по топ-объявлениям"
          tint="info"
        />
        <Tile
          icon={<MessageSquare className="h-5 w-5" />}
          label="Заявки"
          value={contactStats?.total_requests}
          tint="success"
        />
      </div>

      {/* Sections */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <SectionLink href="/admin/users" icon={<Users className="h-5 w-5" />} title="Пользователи" desc="Поиск, верификация, роли" />
        <SectionLink href="/admin/properties" icon={<Building className="h-5 w-5" />} title="Объявления" desc="Модерация и продвижение" />
        <SectionLink href="/admin/requests" icon={<MessageSquare className="h-5 w-5" />} title="Заявки" desc="Обращения от клиентов" />
      </div>

      {/* Top viewed */}
      {propertyStats?.most_viewed && propertyStats.most_viewed.length > 0 && (
        <div className="mt-8 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
            <h3 className="font-display text-base font-semibold tracking-tight inline-flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" strokeWidth={2} />
              Самые просматриваемые
            </h3>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/properties">Все объявления</Link>
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {propertyStats.most_viewed.slice(0, 6).map((p) => (
              <li key={p.id}>
                <Link href={`/properties/${p.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-secondary/60 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold leading-tight truncate">{p.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">
                      {p.city}{p.district ? `, ${p.district}` : ''}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold tabular-nums">
                    <Eye className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} /> {p.views_count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </DashboardShell>
  );
}

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
  value?: number;
  hint?: string;
  tint?: keyof typeof TINTS;
}) {
  const t = TINTS[tint];
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
      <div className={cn('inline-flex h-10 w-10 items-center justify-center rounded-lg', t.bg, t.fg)}>{icon}</div>
      <p className="mt-3 text-xs uppercase tracking-wider font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold tracking-tight tabular-nums">
        {(value ?? 0).toLocaleString('ru-KZ')}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SectionLink({ href, icon, title, desc }: { href: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:border-sand-300 dark:hover:border-sand-600"
    >
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground/80">{icon}</div>
      <h3 className="mt-3 font-semibold leading-tight">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </Link>
  );
}
