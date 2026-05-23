'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon, Heart, Home as HomeIcon, MessageSquare, Plus, Settings, ShieldCheck, User, BarChart3 } from 'lucide-react';
import { Header } from '@/widgets/header/header';
import { Footer } from '@/widgets/footer/footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/providers/auth-provider';
import { cn } from '@/lib/utils';
import { RequirePhoneDialog } from './require-phone-dialog';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  match?: 'exact' | 'prefix';
  roles?: ('client' | 'realtor' | 'superadmin')[];
}

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Главная', icon: BarChart3, match: 'exact', roles: ['realtor', 'superadmin'] },
  { href: '/dashboard/properties', label: 'Мои объявления', icon: HomeIcon, match: 'prefix', roles: ['realtor', 'superadmin'] },
  { href: '/favorites', label: 'Избранное', icon: Heart, match: 'prefix' },
  { href: '/profile', label: 'Профиль', icon: User, match: 'prefix' },
  { href: '/admin', label: 'Админ', icon: ShieldCheck, match: 'prefix', roles: ['superadmin'] },
];

interface DashboardShellProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardShell({ title, subtitle, actions, children }: DashboardShellProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  const items = NAV.filter((it) => !it.roles || it.roles.includes((user?.role ?? 'client') as never));

  const isActive = (item: NavItem) =>
    item.match === 'exact' ? pathname === item.href : pathname.startsWith(item.href);

  const initial = (user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase();
  const displayName =
    user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.first_name || user?.username || 'Гость';

  const roleLabel =
    user?.role === 'superadmin' ? 'Администратор' : user?.role === 'realtor' ? 'Риелтор' : 'Клиент';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <RequirePhoneDialog />
      <Header />
      <main className="flex-1 pb-24 lg:pb-12">
        <div className="container pt-6 lg:pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 lg:gap-10 items-start">
            {/* Sidebar (desktop) */}
            <aside className="hidden lg:block sticky top-20 space-y-4">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-border">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-terra-100 text-terra-700 dark:bg-sand-850 dark:text-terra-300 font-display font-semibold">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold leading-tight truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{roleLabel}</p>
                  </div>
                </div>
                {(user?.role === 'realtor' || user?.role === 'superadmin') && (
                  <Button asChild size="sm" className="w-full mt-4">
                    <Link href="/dashboard/properties/add">
                      <Plus className="h-4 w-4" strokeWidth={1.75} /> Подать объявление
                    </Link>
                  </Button>
                )}
              </div>

              <nav className="rounded-2xl border border-border bg-card p-2 shadow-sm">
                {items.map((it) => {
                  const Icon = it.icon;
                  const active = isActive(it);
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                        active ? 'bg-secondary text-foreground' : 'text-foreground/75 hover:text-foreground hover:bg-secondary/60',
                      )}
                    >
                      <Icon className={cn('h-[18px] w-[18px]', active ? 'text-primary' : 'text-muted-foreground')} strokeWidth={1.75} />
                      {it.label}
                    </Link>
                  );
                })}
              </nav>
            </aside>

            {/* Content */}
            <section className="min-w-0">
              {(title || actions) && (
                <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
                  <div>
                    {title && (
                      <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
                        {title}
                      </h1>
                    )}
                    {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
                  </div>
                  {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
                </header>
              )}
              {children}
            </section>
          </div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-30 lg:hidden border-t border-border bg-card/95 backdrop-blur-md">
        <div className="grid grid-cols-5 h-16">
          {items.slice(0, 5).map((it) => {
            const Icon = it.icon;
            const active = isActive(it);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.75} />
                {it.label.split(' ')[0]}
              </Link>
            );
          })}
        </div>
      </nav>

      <Footer />
    </div>
  );
}
