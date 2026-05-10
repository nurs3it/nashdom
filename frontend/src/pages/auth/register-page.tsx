'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhoneInput } from '@/components/ui/phone-input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/shared/api';
import { useFormErrors } from '@/shared/hooks/use-form-errors';
import { AuthShell } from '@/widgets/auth-shell/auth-shell';
import { cn } from '@/lib/utils';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'client' | 'realtor';
  company?: string;
  experience?: string;
  specialization?: string;
  description?: string;
  license_number?: string;
}

const STRENGTH_LABELS = ['Очень слабый', 'Слабый', 'Средний', 'Хороший', 'Отличный'];
const STRENGTH_BG = ['bg-destructive', 'bg-ochre-400', 'bg-warning', 'bg-info', 'bg-success'];

export function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '', email: '', password: '', password_confirm: '',
    first_name: '', last_name: '', phone: '',
    role: 'client',
    company: '', experience: '', specialization: '', description: '', license_number: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { isSubmitting, withSubmit } = useFormErrors();

  const registerMutation = useMutation({
    mutationFn: (data: RegisterFormData) => authApi.register(data),
    onError: (e: unknown) => console.error('Registration error:', e),
  });

  const onChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.username.trim()) e.username = 'Имя пользователя обязательно';
    else if (formData.username.length < 3) e.username = 'Минимум 3 символа';
    if (!formData.email.trim()) e.email = 'Email обязателен';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Неверный формат email';
    if (!formData.password) e.password = 'Пароль обязателен';
    else if (formData.password.length < 8) e.password = 'Минимум 8 символов';
    if (formData.password !== formData.password_confirm) e.password_confirm = 'Пароли не совпадают';
    if (!formData.first_name.trim()) e.first_name = 'Имя обязательно';
    if (!formData.last_name.trim()) e.last_name = 'Фамилия обязательна';
    if (formData.phone) {
      const digits = formData.phone.replace(/\D/g, '');
      if (digits.length < 11 || !digits.startsWith('7')) e.phone = 'Введите корректный номер';
    }
    if (!acceptedTerms) e.terms = 'Необходимо принять условия';
    if (formData.role === 'realtor') {
      if (!formData.company?.trim()) e.company = 'Обязательно для риелторов';
      if (!formData.experience?.trim()) e.experience = 'Обязательно для риелторов';
      if (!formData.phone?.trim()) e.phone = 'Обязательно для риелторов';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const result = await withSubmit(async () => {
      await registerMutation.mutateAsync(formData);
    });
    if (result !== null) {
      toast.success('Регистрация прошла успешно. Теперь войдите.');
      router.push('/auth/login');
    }
  };

  const passwordStrength = ((p: string) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[a-z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })(formData.password);

  return (
    <AuthShell
      title="Создать аккаунт"
      subtitle="Зарегистрируйтесь, чтобы сохранять объявления и подавать собственные"
      footer={
        <p className="text-center text-muted-foreground">
          Уже есть аккаунт?{' '}
          <Link href="/auth/login" className="font-semibold text-primary hover:underline underline-offset-4">
            Войти
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Role tabs */}
        <Tabs value={formData.role} onValueChange={(v) => onChange('role', v as 'client' | 'realtor')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="client" className="gap-2"><User className="h-4 w-4" />Клиент</TabsTrigger>
            <TabsTrigger value="realtor" className="gap-2"><Building2 className="h-4 w-4" />Риелтор</TabsTrigger>
          </TabsList>
          <TabsContent value="client" className="text-sm text-muted-foreground">
            Поиск, избранное, заявки и переписка с риелторами.
          </TabsContent>
          <TabsContent value="realtor" className="text-sm text-muted-foreground">
            Размещение объявлений, аналитика, продвижение в подборках. Аккаунт проходит модерацию.
          </TabsContent>
        </Tabs>

        {/* Identity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="first_name" label="Имя *" error={errors.first_name}>
            <Input
              id="first_name"
              autoComplete="given-name"
              placeholder="Айгерим"
              value={formData.first_name}
              onChange={(e) => onChange('first_name', e.target.value)}
              aria-invalid={!!errors.first_name}
              className="h-11"
            />
          </Field>
          <Field id="last_name" label="Фамилия *" error={errors.last_name}>
            <Input
              id="last_name"
              autoComplete="family-name"
              placeholder="Калиева"
              value={formData.last_name}
              onChange={(e) => onChange('last_name', e.target.value)}
              aria-invalid={!!errors.last_name}
              className="h-11"
            />
          </Field>
        </div>

        <Field id="username" label="Имя пользователя *" icon={<User className="h-4 w-4" />} error={errors.username}>
          <Input
            id="username"
            autoComplete="username"
            placeholder="username"
            value={formData.username}
            onChange={(e) => onChange('username', e.target.value)}
            aria-invalid={!!errors.username}
            className="h-11 pl-10"
          />
        </Field>

        <Field id="email" label="Email *" icon={<Mail className="h-4 w-4" />} error={errors.email}>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="example@mail.kz"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            aria-invalid={!!errors.email}
            className="h-11 pl-10"
          />
        </Field>

        <Field id="phone" label={`Телефон ${formData.role === 'realtor' ? '*' : ''}`.trim()} icon={<Phone className="h-4 w-4" />} error={errors.phone}>
          <PhoneInput
            id="phone"
            className="h-11 pl-10"
            value={formData.phone}
            onChange={(value) => onChange('phone', value)}
          />
        </Field>

        {/* Realtor extra */}
        {formData.role === 'realtor' && (
          <div className="rounded-xl border border-border bg-secondary/50 p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <UserCheck className="h-4 w-4 text-primary" /> Профессиональная информация
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="company" label="Компания *" error={errors.company}>
                <Input id="company" placeholder="ООО «Недвижимость+»" value={formData.company} onChange={(e) => onChange('company', e.target.value)} className="h-11" />
              </Field>
              <Field id="experience" label="Опыт *" error={errors.experience}>
                <Input id="experience" placeholder="5 лет" value={formData.experience} onChange={(e) => onChange('experience', e.target.value)} className="h-11" />
              </Field>
              <Field id="specialization" label="Специализация">
                <Input id="specialization" placeholder="Жилая недвижимость" value={formData.specialization} onChange={(e) => onChange('specialization', e.target.value)} className="h-11" />
              </Field>
              <Field id="license_number" label="Номер лицензии">
                <Input id="license_number" placeholder="№123456789" value={formData.license_number} onChange={(e) => onChange('license_number', e.target.value)} className="h-11" />
              </Field>
            </div>
            <Field id="description" label="О себе">
              <Textarea
                id="description"
                rows={3}
                placeholder="Опыт, достижения, подход к работе…"
                value={formData.description}
                onChange={(e) => onChange('description', e.target.value)}
              />
            </Field>
          </div>
        )}

        {/* Password */}
        <Field id="password" label="Пароль *" icon={<Lock className="h-4 w-4" />} error={errors.password}>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Минимум 8 символов"
              value={formData.password}
              onChange={(e) => onChange('password', e.target.value)}
              aria-invalid={!!errors.password}
              className="h-11 pl-10 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {formData.password && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={cn('h-1 flex-1 rounded-full bg-secondary', i < passwordStrength && STRENGTH_BG[passwordStrength - 1])}
                  />
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Надёжность: {STRENGTH_LABELS[passwordStrength - 1] ?? STRENGTH_LABELS[0]}
              </p>
            </div>
          )}
        </Field>

        <Field id="password_confirm" label="Подтвердите пароль *" icon={<Lock className="h-4 w-4" />} error={errors.password_confirm}>
          <div className="relative">
            <Input
              id="password_confirm"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Повторите пароль"
              value={formData.password_confirm}
              onChange={(e) => onChange('password_confirm', e.target.value)}
              aria-invalid={!!errors.password_confirm}
              className="h-11 pl-10 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Скрыть пароль' : 'Показать пароль'}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {formData.password_confirm && formData.password === formData.password_confirm && (
            <p className="mt-1 text-xs text-success inline-flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Пароли совпадают
            </p>
          )}
        </Field>

        {/* Terms */}
        <div className="space-y-2">
          <label className="flex items-start gap-2.5 cursor-pointer text-sm">
            <Checkbox checked={acceptedTerms} onCheckedChange={(v) => setAcceptedTerms(v === true)} className="mt-0.5" />
            <span className="text-foreground/85 leading-relaxed">
              Я принимаю{' '}
              <Link href="/terms" className="text-primary hover:underline underline-offset-4">условия использования</Link>{' '}
              и{' '}
              <Link href="/privacy" className="text-primary hover:underline underline-offset-4">политику конфиденциальности</Link>
            </span>
          </label>
          {errors.terms && (
            <p className="text-xs text-destructive inline-flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.terms}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Создаём аккаунт…' : (<>Создать аккаунт <ArrowRight className="h-4 w-4" /></>)}
        </Button>
      </form>
    </AuthShell>
  );
}

function Field({
  id,
  label,
  icon,
  error,
  children,
}: {
  id: string;
  label: string;
  icon?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-foreground/90">{label}</Label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        )}
        {children}
      </div>
      {error && (
        <p className="text-xs text-destructive inline-flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}
