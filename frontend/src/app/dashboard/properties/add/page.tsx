'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/widgets/dashboard-shell/dashboard-shell';
import { useAuth } from '@/app/providers/auth-provider';
import { PropertyForm } from '@/features/property-management/property-form';

export default function Page() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !['realtor', 'superadmin'].includes(user?.role || ''))) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated || !['realtor', 'superadmin'].includes(user?.role || '')) return null;

  return (
    <DashboardShell
      title="Новое объявление"
      subtitle="Заполните данные — на это уйдёт около 2 минут"
    >
      <PropertyForm
        onSuccess={() => router.push('/dashboard/properties')}
        onCancel={() => router.push('/dashboard/properties')}
      />
    </DashboardShell>
  );
}
