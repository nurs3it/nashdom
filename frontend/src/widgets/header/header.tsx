'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCookie, setCookie } from '@/shared/lib/cookies';

const CITY_COOKIE = 'nashdom-city';
const DEFAULT_CITY = 'Алматы';
import {
  Bell,
  Heart,
  LogOut,
  MapPin,
  Menu,
  Settings,
  User,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/app/providers/auth-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ThemeToggle } from '@/shared/ui/theme-toggle';
import { cn } from '@/lib/utils';

const NAV_ITEMS: { label: string; href: string; matchPrefix?: string }[] = [
  { label: 'Купить', href: '/properties?deal=sale', matchPrefix: '/properties' },
  { label: 'Снять', href: '/properties?deal=rent' },
  { label: 'Посуточно', href: '/properties?deal=daily' },
  { label: 'Коммерческая', href: '/properties?deal=commercial' },
  { label: 'Карта', href: '/properties?view=map' },
];

const CITIES = ['Алматы', 'Астана', 'Шымкент', 'Караганда', 'Атырау', 'Актобе', 'Усть-Каменогорск'];

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [city, setCityState] = useState<string>(DEFAULT_CITY);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = getCookie(CITY_COOKIE);
    if (stored) setCityState(stored);
  }, []);

  const setCity = (next: string) => {
    setCityState(next);
    setCookie(CITY_COOKIE, next);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="container flex h-16 items-center gap-4">
        {/* Лого */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground font-display text-lg font-semibold shadow-sm transition-transform group-hover:-rotate-3">
            N
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">NashDom</span>
        </Link>

        {/* Город (десктоп) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="hidden md:inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:border-sand-300 dark:hover:border-sand-600 transition-colors"
            >
              <MapPin className="h-4 w-4 text-primary" strokeWidth={1.75} />
              {city}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44 p-1.5">
            <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground px-2">
              Выберите город
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {CITIES.map((c) => (
              <DropdownMenuItem
                key={c}
                onClick={() => setCity(c)}
                className={cn('cursor-pointer rounded-md', c === city && 'bg-secondary font-semibold')}
              >
                {c}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Навигация (десктоп) */}
        <nav className="hidden lg:flex items-center gap-1 mx-auto">
          {NAV_ITEMS.map((item) => {
            const active = item.matchPrefix
              ? pathname.startsWith(item.matchPrefix)
              : pathname === item.href.split('?')[0];
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'inline-flex h-9 items-center px-3 rounded-full text-sm font-medium transition-colors',
                  active
                    ? 'bg-secondary text-foreground'
                    : 'text-foreground/75 hover:text-foreground hover:bg-secondary',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action panel (десктоп) */}
        <div className="ml-auto hidden md:flex items-center gap-1.5">
          <Button variant="default" size="sm" className="hidden lg:inline-flex" asChild>
            <Link href={isAuthenticated ? '/dashboard/properties/add' : '/auth/register'}>
              <Plus className="h-4 w-4" strokeWidth={2} />
              Подать объявление
            </Link>
          </Button>
          <ThemeToggle />
          {isAuthenticated && (
            <>
              <Link
                href="/favorites"
                aria-label="Избранное"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/75 hover:bg-secondary hover:text-foreground transition-colors"
              >
                <Heart className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </Link>
              <button
                type="button"
                aria-label="Уведомления"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/75 hover:bg-secondary hover:text-foreground transition-colors"
              >
                <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </button>
            </>
          )}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card pl-1 pr-3 hover:border-sand-300 dark:hover:border-sand-600 transition-colors"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-foreground/80">
                    <User className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <span className="text-sm font-medium max-w-[140px] truncate">
                    {user?.first_name || user?.username}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1.5">
                <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground px-2">
                  Аккаунт
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer rounded-md">
                  <Link href={user?.role === 'client' ? '/profile' : '/dashboard'}>
                    <User className="mr-2 h-4 w-4" strokeWidth={1.75} />
                    {user?.role === 'client' ? 'Профиль' : 'Кабинет'}
                  </Link>
                </DropdownMenuItem>
                {(user?.role === 'realtor' || user?.role === 'superadmin') && (
                  <DropdownMenuItem asChild className="cursor-pointer rounded-md">
                    <Link href="/dashboard/properties">
                      <Settings className="mr-2 h-4 w-4" strokeWidth={1.75} />
                      Мои объявления
                    </Link>
                  </DropdownMenuItem>
                )}
                {user?.role === 'superadmin' && (
                  <DropdownMenuItem asChild className="cursor-pointer rounded-md">
                    <Link href="/admin">
                      <Settings className="mr-2 h-4 w-4" strokeWidth={1.75} />
                      Админ-панель
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer rounded-md text-destructive">
                  <LogOut className="mr-2 h-4 w-4" strokeWidth={1.75} />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Войти</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile actions */}
        <div className="ml-auto flex md:hidden items-center gap-1">
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Меню">
                <Menu className="h-5 w-5" strokeWidth={1.75} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0">
              <SheetHeader className="border-b border-border pb-4 px-5 pt-5">
                <SheetTitle className="font-display">Меню</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-2 py-3">
                <div className="flex items-center gap-2 px-3 py-2 mb-2">
                  <MapPin className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  <span className="text-sm font-medium">{city}</span>
                </div>
                <nav className="flex flex-col">
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between rounded-md px-3 py-3 text-base font-medium text-foreground/85 hover:bg-secondary hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="my-3 border-t border-border" />
                {isAuthenticated ? (
                  <div className="flex flex-col">
                    <Link href="/favorites" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-3 text-sm font-medium hover:bg-secondary">
                      <Heart className="h-4 w-4" strokeWidth={1.75} /> Избранное
                    </Link>
                    <Link href={user?.role === 'client' ? '/profile' : '/dashboard'} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-3 text-sm font-medium hover:bg-secondary">
                      <User className="h-4 w-4" strokeWidth={1.75} /> {user?.role === 'client' ? 'Профиль' : 'Кабинет'}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-2 rounded-md px-3 py-3 text-sm font-medium text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" strokeWidth={1.75} /> Выйти
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 px-3 py-3">
                    <Button asChild size="lg">
                      <Link href="/auth/register" onClick={() => setMobileOpen(false)}>Регистрация</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                      <Link href="/auth/login" onClick={() => setMobileOpen(false)}>Войти</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
