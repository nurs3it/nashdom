'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Home as HomeIcon } from 'lucide-react';
import { DashboardShell } from '@/widgets/dashboard-shell/dashboard-shell';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/providers/auth-provider';
import { propertiesApi } from '@/shared/api';
import { PropertyForm } from '@/features/property-management/property-form';


export default function Page() {
  const { id } = useParams() as { id: string };
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !['realtor', 'superadmin'].includes(user?.role || ''))) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, user, router]);

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertiesApi.getProperty(id),
    enabled: isAuthenticated,
  });

  if (authLoading || !isAuthenticated || !['realtor', 'superadmin'].includes(user?.role || '')) {
    return null;
  }

  return (
    <DashboardShell
      title="Редактирование объявления"
      subtitle={property ? property.title : 'Загружаем данные…'}
      actions={
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/properties">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            К моим объявлениям
          </Link>
        </Button>
      }
    >
      {isLoading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="h-5 w-1/4 bg-sand-100 dark:bg-sand-800 rounded animate-pulse mb-4" />
              <div className="h-11 w-full bg-sand-100 dark:bg-sand-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : error || !property ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-terra-100 text-terra-500 dark:bg-sand-850 dark:text-terra-300 mb-4">
            <HomeIcon className="h-8 w-8" strokeWidth={1.5} />
          </div>
          <h3 className="font-display text-xl font-semibold tracking-tight mb-2">Объявление не найдено</h3>
          <p className="text-sm text-muted-foreground mb-5">Возможно, оно было удалено или вы не являетесь его автором.</p>
          <Button asChild size="lg">
            <Link href="/dashboard/properties">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} /> К моим объявлениям
            </Link>
          </Button>
        </div>
      ) : (
        <PropertyForm
          property={property}
          onSuccess={() => router.push('/dashboard/properties')}
          onCancel={() => router.push('/dashboard/properties')}
        />
      )}
    </DashboardShell>
  );
}
