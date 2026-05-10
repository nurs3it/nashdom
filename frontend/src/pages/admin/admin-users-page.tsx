'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Building2, ShieldCheck, User as UserIcon, Users } from 'lucide-react';
import { DashboardShell } from '@/widgets/dashboard-shell/dashboard-shell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/app/providers/auth-provider';
import { authApi } from '@/shared/api';
import type { User } from '@/shared/types/api';
import { cn } from '@/lib/utils';

export function AdminUsersPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'superadmin')) router.push('/');
  }, [isAuthenticated, isLoading, user, router]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: authApi.getUserStats,
    enabled: user?.role === 'superadmin',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated || user?.role !== 'superadmin') return null;

  const recent = stats?.recent_users ?? [];
  const totalUsers = stats?.total_users ?? 0;
  const unverified = totalUsers - (stats?.verified_users ?? 0);

  return (
    <DashboardShell
      title="Пользователи"
      subtitle="Все аккаунты, роли и статусы верификации"
    >
      {/* Bento metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile icon={<Users className="h-5 w-5" />} label="Всего" value={totalUsers} tint="terra" />
        <Tile icon={<ShieldCheck className="h-5 w-5" />} label="Подтверждены" value={stats?.verified_users ?? 0} hint={`Не подтверждены: ${unverified}`} tint="success" />
        <Tile icon={<Building2 className="h-5 w-5" />} label="Риелторы" value={stats?.realtors ?? 0} tint="ochre" />
        <Tile icon={<UserIcon className="h-5 w-5" />} label="Клиенты" value={stats?.clients ?? 0} tint="info" />
      </div>

      {/* Users list */}
      <div className="mt-6 rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
          <h3 className="font-display text-base font-semibold tracking-tight">Недавно зарегистрированные</h3>
          <span className="text-xs text-muted-foreground tabular-nums">{recent.length}</span>
        </div>
        {statsLoading ? (
          <RowSkeleton />
        ) : recent.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground mb-3">
              <Users className="h-7 w-7" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-muted-foreground">Пока нет пользователей</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((u) => (
              <li key={u.id}>
                <UserRow u={u} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}

function UserRow({ u }: { u: User }) {
  const displayName = u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.username;
  const initial = (u.first_name?.[0] || u.username?.[0] || '?').toUpperCase();
  const created = u.created_at ? new Date(u.created_at).toLocaleDateString('ru-KZ', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 hover:bg-secondary/40 transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Avatar className="h-11 w-11 ring-2 ring-border">
          <AvatarImage src={u.avatar} />
          <AvatarFallback className="bg-terra-100 text-terra-700 dark:bg-sand-850 dark:text-terra-300 font-display font-semibold">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="font-semibold leading-tight truncate">{displayName}</p>
            <RoleBadge role={u.role} />
            {u.is_verified ? (
              <Badge variant="success" size="sm" className="gap-1">
                <ShieldCheck className="h-3 w-3" strokeWidth={2} /> Подтверждён
              </Badge>
            ) : (
              <Badge variant="outline" size="sm">Не подтверждён</Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
            <span className="truncate">{u.email}</span>
            {u.phone && (
              <>
                <span aria-hidden>·</span>
                <span className="tabular-nums">{u.phone}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground sm:text-right shrink-0">
        Регистрация: <span className="font-medium text-foreground/80 tabular-nums">{created}</span>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: User['role'] }) {
  const map: Record<string, { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }> = {
    superadmin: { label: 'Администратор', variant: 'soft' },
    realtor:    { label: 'Риелтор',       variant: 'warning' },
    client:     { label: 'Клиент',        variant: 'secondary' },
  };
  const cfg = map[role] ?? map.client;
  return (
    <Badge variant={cfg.variant} size="sm">
      {cfg.label}
    </Badge>
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
  value: number;
  hint?: string;
  tint?: keyof typeof TINTS;
}) {
  const t = TINTS[tint];
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
      <div className={cn('inline-flex h-10 w-10 items-center justify-center rounded-lg', t.bg, t.fg)}>{icon}</div>
      <p className="mt-3 text-xs uppercase tracking-wider font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold tracking-tight tabular-nums">
        {value.toLocaleString('ru-KZ')}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function RowSkeleton() {
  return (
    <ul className="divide-y divide-border">
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 px-5 py-4">
          <div className="h-11 w-11 rounded-full bg-sand-100 dark:bg-sand-800 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 bg-sand-100 dark:bg-sand-800 rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-sand-100 dark:bg-sand-800 rounded animate-pulse" />
          </div>
        </li>
      ))}
    </ul>
  );
}
