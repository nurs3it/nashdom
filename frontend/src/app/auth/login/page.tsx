'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form-field';
import { useAuth } from '@/app/providers/auth-provider';
import { useFormErrors } from '@/shared/hooks/use-form-errors';
import { AuthShell } from '@/widgets/auth-shell/auth-shell';

export default function Page() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const { isSubmitting, getFieldError, hasFieldError, withSubmit, clearFieldError } = useFormErrors();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await withSubmit(async () => {
      await login(formData.email, formData.password);
    });
    if (result !== null) router.push('/');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (hasFieldError(name)) clearFieldError(name);
  };

  return (
    <AuthShell
      title="С возвращением"
      subtitle="Войдите, чтобы продолжить поиск и управлять объявлениями"
      footer={
        <p className="text-center text-muted-foreground">
          Нет аккаунта?{' '}
          <Link href="/auth/register" className="font-semibold text-primary hover:underline underline-offset-4">
            Создать
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField>
          <FormItem>
            <FormLabel htmlFor="email">Email</FormLabel>
            <FormControl>
              <Input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="your@email.kz"
                value={formData.email}
                onChange={handleChange}
                aria-invalid={hasFieldError('email')}
                required
                className="h-12"
              />
            </FormControl>
            <FormMessage error={getFieldError('email')} />
          </FormItem>
        </FormField>

        <FormField>
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel htmlFor="password">Пароль</FormLabel>
              <Link href="#" className="text-xs font-medium text-muted-foreground hover:text-foreground">
                Забыли?
              </Link>
            </div>
            <FormControl>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Введите пароль"
                  value={formData.password}
                  onChange={handleChange}
                  aria-invalid={hasFieldError('password')}
                  required
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormControl>
            <FormMessage error={getFieldError('password')} />
          </FormItem>
        </FormField>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Входим…' : 'Войти'}
        </Button>
      </form>
    </AuthShell>
  );
}
