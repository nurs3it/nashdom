'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Mail, Pencil, Phone, ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardShell } from '@/widgets/dashboard-shell/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/app/providers/auth-provider';
import { authApi } from '@/shared/api';

export default function Page() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) setForm({ first_name: user.first_name || '', last_name: user.last_name || '', phone: user.phone || '' });
  }, [user]);

  const update = useMutation({
    mutationFn: (d: typeof form) => authApi.updateProfile(d),
    onSuccess: () => {
      toast.success('Профиль обновлён');
      setEditing(false);
      qc.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (e: any) => toast.error(e?.message || 'Не удалось обновить'),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return null;

  const roleLabel =
    user?.role === 'superadmin' ? 'Администратор' : user?.role === 'realtor' ? 'Риелтор' : 'Клиент';

  const initial = (user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase();
  const displayName =
    user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.first_name || user?.username || '—';

  return (
    <DashboardShell title="Профиль" subtitle="Личные данные и контактная информация">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* MAIN */}
        <div className="rounded-2xl border border-border bg-card shadow-sm p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-border">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-terra-100 text-terra-700 dark:bg-sand-850 dark:text-terra-300 font-display font-semibold text-lg">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-display text-xl font-semibold tracking-tight">{displayName}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            {!editing && (
              <Button onClick={() => setEditing(true)} variant="outline" size="sm">
                <Pencil className="h-4 w-4" strokeWidth={1.75} /> Редактировать
              </Button>
            )}
          </div>

          {editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                update.mutate(form);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field id="first_name" label="Имя">
                  <Input id="first_name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="h-11" />
                </Field>
                <Field id="last_name" label="Фамилия">
                  <Input id="last_name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="h-11" />
                </Field>
              </div>
              <Field id="phone" label="Телефон" icon={<Phone className="h-4 w-4" />}>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+7 (___) ___-__-__" className="h-11 pl-10" />
              </Field>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button type="submit" size="lg" disabled={update.isPending}>
                  {update.isPending ? 'Сохраняем…' : 'Сохранить'}
                </Button>
                <Button type="button" variant="ghost" size="lg" onClick={() => setEditing(false)}>
                  <X className="h-4 w-4" strokeWidth={1.75} /> Отмена
                </Button>
              </div>
            </form>
          ) : (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <ReadField label="Имя" value={user?.first_name} />
              <ReadField label="Фамилия" value={user?.last_name} />
              <ReadField label="Email" value={user?.email} icon={<Mail className="h-4 w-4" />} />
              <ReadField label="Телефон" value={user?.phone || '—'} icon={<Phone className="h-4 w-4" />} mono />
            </dl>
          )}
        </div>

        {/* ASIDE — статус */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">Статус</p>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Роль</dt>
                <dd>
                  <Badge variant="secondary" size="md">{roleLabel}</Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Верификация</dt>
                <dd>
                  {user?.is_verified ? (
                    <Badge variant="success" size="md" className="gap-1">
                      <ShieldCheck className="h-3 w-3" strokeWidth={2} /> Подтверждён
                    </Badge>
                  ) : (
                    <Badge variant="outline" size="md">Не подтверждён</Badge>
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} /> Регистрация
                </dt>
                <dd className="font-semibold tabular-nums">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('ru-KZ') : '—'}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}

function Field({ id, label, icon, children }: { id: string; label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-foreground/90">{label}</Label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        )}
        {children}
      </div>
    </div>
  );
}

function ReadField({ label, value, icon, mono = false }: { label: string; value?: string; icon?: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <dt className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className={['mt-1.5 font-medium text-foreground', mono ? 'tabular-nums' : ''].join(' ')}>
        {value || <span className="text-muted-foreground font-normal">не указано</span>}
      </dd>
    </div>
  );
}
