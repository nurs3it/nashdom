'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Phone } from 'lucide-react';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/app/providers/auth-provider';
import { authApi } from '@/shared/api';
import { normalizePhoneForWhatsApp } from '@/shared/lib/whatsapp';

/**
 * Модалка, которая принудительно просит риелтора/админа ввести номер,
 * если в профиле он пустой. Без неё кнопка «Написать» в WhatsApp
 * не работает у объявлений этого владельца.
 *
 * Закрытие отключено (showClose=false, onOpenChange игнорируется) —
 * пользователь должен ввести валидный номер.
 */
export function RequirePhoneDialog() {
  const { user, refetchUser } = useAuth();
  const qc = useQueryClient();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const needsPhone =
    !!user && (user.role === 'realtor' || user.role === 'superadmin') && !user.phone?.trim();

  useEffect(() => {
    if (needsPhone) setValue('');
  }, [needsPhone]);

  const save = useMutation({
    mutationFn: (phone: string) => authApi.updateProfile({ phone }),
    onSuccess: () => {
      toast.success('Номер сохранён');
      refetchUser();
      qc.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (e: any) => {
      const msg = e?.message || 'Не удалось сохранить номер';
      setError(msg);
      toast.error(msg);
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhoneForWhatsApp(value);
    if (!normalized) {
      setError('Введите номер в формате +7 (___) ___-__-__');
      return;
    }
    setError('');
    save.mutate(value.trim());
  };

  if (!needsPhone) return null;

  return (
    <Dialog open onOpenChange={() => { /* нельзя закрыть */ }}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <div className="mx-auto -mt-2 mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-terra-100 dark:bg-sand-850">
          <Phone className="h-5 w-5 text-terra-700 dark:text-terra-300" strokeWidth={1.75} />
        </div>
        <DialogTitle className="text-center">Добавьте номер телефона</DialogTitle>
        <DialogDescription className="text-center">
          Покупатели и арендаторы будут связываться с вами по этому номеру —
          через звонок и WhatsApp. Без номера ваши объявления невозможно контактировать.
        </DialogDescription>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="require-phone">Телефон</Label>
            <Input
              id="require-phone"
              autoFocus
              type="tel"
              inputMode="tel"
              placeholder="+7 (___) ___-__-__"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError('');
              }}
              aria-invalid={!!error}
              className="h-11"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={save.isPending}>
            {save.isPending ? 'Сохраняем…' : 'Сохранить и продолжить'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
