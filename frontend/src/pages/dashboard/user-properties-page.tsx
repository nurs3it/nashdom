'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Edit, Eye, Plus, Search, SearchX, Trash2 } from 'lucide-react';
import { DashboardShell } from '@/widgets/dashboard-shell/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/app/providers/auth-provider';
import { propertiesApi } from '@/shared/api';
import { PriceTag, StatusBadge, formatRelativeDate } from '@/entities/property';
import { MEDIA_URL } from '@/shared/config/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_TABS = [
  { value: 'all',     label: 'Все' },
  { value: 'active',  label: 'Активные' },
  { value: 'sold',    label: 'Проданные' },
  { value: 'rented',  label: 'Сданные' },
  { value: 'inactive', label: 'В архиве' },
] as const;

type StatusKey = (typeof STATUS_TABS)[number]['value'];

export function UserPropertiesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusKey>('all');

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !['realtor', 'superadmin'].includes(user?.role || ''))) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, user, router]);

  const apiFilters = useMemo(() => {
    const f: { search?: string; status?: string } = {};
    if (search.trim()) f.search = search.trim();
    if (status !== 'all') f.status = status;
    return f;
  }, [search, status]);

  const { data, isLoading } = useQuery({
    queryKey: ['user-properties', apiFilters],
    queryFn: () => propertiesApi.getUserProperties(apiFilters as never),
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => propertiesApi.deleteProperty(id as never),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-properties'] });
      queryClient.invalidateQueries({ queryKey: ['user-property-stats'] });
      toast.success('Объявление удалено');
    },
    onError: () => toast.error('Не получилось удалить'),
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated || !['realtor', 'superadmin'].includes(user?.role || '')) return null;

  const items = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <DashboardShell
      title="Мои объявления"
      subtitle={`Всего ${total} ${pluralizeRu(total, 'объявление', 'объявления', 'объявлений')}`}
      actions={
        <Button asChild size="default">
          <Link href="/dashboard/properties/add">
            <Plus className="h-4 w-4" strokeWidth={2} />
            Подать объявление
          </Link>
        </Button>
      }
    >
      {/* Filters bar */}
      <div className="rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          <Input
            placeholder="Поиск по названию, адресу, описанию…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {STATUS_TABS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStatus(s.value)}
              className={cn(
                'inline-flex h-8 items-center px-3 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors',
                status === s.value
                  ? 'bg-foreground text-background'
                  : 'bg-secondary text-foreground/80 hover:text-foreground hover:bg-sand-200 dark:hover:bg-sand-700',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="mt-5">
        {isLoading ? (
          <ListSkeleton />
        ) : items.length === 0 ? (
          <EmptyList />
        ) : (
          <ul className="space-y-3">
            {items.map((p) => (
              <li
                key={p.id}
                className="group rounded-2xl border border-border bg-card shadow-sm p-3 sm:p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href={`/properties/${p.id}`} className="block relative w-full sm:w-44 aspect-[4/3] shrink-0 rounded-xl overflow-hidden bg-sand-100 dark:bg-sand-800">
                    {p.main_image ? (
                      <img
                        src={p.main_image.startsWith('http') ? p.main_image : `${MEDIA_URL}${p.main_image}`}
                        alt={p.title}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-sand-400">—</div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/properties/${p.id}`} className="font-display text-lg font-semibold leading-tight tracking-tight hover:text-primary transition-colors line-clamp-2">
                        {p.title}
                      </Link>
                      <PriceTag price={p.price} serviceSlug={p.service_type?.slug} size="md" />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {(p as any).status && <StatusBadge status={(p as any).status} />}
                      <span className="truncate">{p.city}{p.district ? `, ${p.district}` : ''}</span>
                      <span aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" strokeWidth={1.75} /> {p.views_count}</span>
                      <span aria-hidden>·</span>
                      <span>{formatRelativeDate(p.created_at)}</span>
                    </div>
                    <div className="mt-auto pt-3 flex flex-wrap items-center gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/properties/${p.id}/edit`}>
                          <Edit className="h-4 w-4" strokeWidth={1.75} /> Редактировать
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/properties/${p.id}`}>
                          <Eye className="h-4 w-4" strokeWidth={1.75} /> Открыть
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" strokeWidth={1.75} /> Удалить
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Удалить объявление?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Это действие нельзя отменить. Объявление «{p.title}» будет удалено навсегда.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(p.id)}
                              className="bg-destructive text-destructive-foreground hover:opacity-90"
                            >
                              Удалить
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}

function ListSkeleton() {
  return (
    <ul className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex gap-4">
            <div className="h-32 w-44 shrink-0 rounded-xl bg-sand-100 dark:bg-sand-800 animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-2/3 bg-sand-100 dark:bg-sand-800 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-sand-100 dark:bg-sand-800 rounded animate-pulse" />
              <div className="h-4 w-1/3 bg-sand-100 dark:bg-sand-800 rounded animate-pulse" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyList() {
  return (
    <div className="text-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-terra-100 text-terra-500 dark:bg-sand-850 dark:text-terra-300 mb-4">
        <SearchX className="h-8 w-8" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-xl font-semibold tracking-tight mb-2">Ничего не найдено</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-5">
        Попробуйте изменить статус или строку поиска.
      </p>
      <Button asChild size="lg">
        <Link href="/dashboard/properties/add">
          <Plus className="h-4 w-4" strokeWidth={2} /> Подать объявление
        </Link>
      </Button>
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
