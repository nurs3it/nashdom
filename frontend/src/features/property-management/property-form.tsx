'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AlertCircle, Bed, Briefcase, Building2, Coins, ImagePlus, Layers, MapPin, Ruler, Star, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { propertiesApi } from '@/shared/api';
import { MEDIA_URL } from '@/shared/config/api';
import type { Property } from '@/shared/types/api';
import { LocationPicker, areaInputToSqm, isLandType, sqmToAreaInput } from '@/entities/property';
import { cn } from '@/lib/utils';

interface PropertyFormProps {
  property?: Property;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const STATUSES = [
  { value: 'active',   label: 'Активное' },
  { value: 'sold',     label: 'Продано' },
  { value: 'rented',   label: 'Сдано' },
  { value: 'inactive', label: 'В архиве' },
] as const;

export function PropertyForm({ property, onSuccess, onCancel }: PropertyFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!property;

  const [formData, setFormData] = useState({
    title: property?.title ?? '',
    description: property?.description ?? '',
    price: property?.price ?? '',
    property_type: property?.property_type?.id?.toString() ?? '',
    service_type: property?.service_type?.id?.toString() ?? '',
    city: property?.city ?? '',
    district: property?.district ?? '',
    address: property?.address ?? '',
    // В БД площадь всегда в м². Для участка показываем введённое значение в гектарах.
    area: property?.area != null ? String(sqmToAreaInput(property.area, property.property_type?.slug)) : '',
    rooms: property?.rooms?.toString() ?? '',
    floor: property?.floor?.toString() ?? '',
    total_floors: property?.total_floors?.toString() ?? '',
    has_parking: property?.has_parking ?? false,
    has_balcony: property?.has_balcony ?? false,
    has_elevator: property?.has_elevator ?? false,
    status: property?.status ?? 'active',
    is_featured: property?.is_featured ?? false,
    latitude: property?.latitude != null ? String(property.latitude) : '',
    longitude: property?.longitude != null ? String(property.longitude) : '',
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragOver, setDragOver] = useState(false);

  const { data: propertyTypes } = useQuery({
    queryKey: ['property-types'],
    queryFn: propertiesApi.getPropertyTypes,
  });
  const { data: serviceTypes } = useQuery({
    queryKey: ['service-types'],
    queryFn: propertiesApi.getServiceTypes,
  });

  // Для участка площадь вводится и показывается в гектарах (в БД хранится в м²).
  const selectedType = propertyTypes?.find((t) => String(t.id) === formData.property_type);
  const isLand = isLandType(selectedType?.slug);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEditing && property) return propertiesApi.updateProperty(property.id, data);
      return propertiesApi.createProperty(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['user-properties'] });
      queryClient.invalidateQueries({ queryKey: ['user-property-stats'] });
      if (property) queryClient.invalidateQueries({ queryKey: ['property', String(property.id)] });
      toast.success(isEditing ? 'Объявление обновлено' : 'Объявление опубликовано');
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Не получилось сохранить');
    },
  });

  const set = (k: string, v: any) => {
    setFormData((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.title.trim()) e.title = 'Введите заголовок';
    if (!formData.price || parseFloat(formData.price) <= 0) e.price = 'Укажите корректную цену';
    if (!formData.area || parseFloat(formData.area) <= 0) e.area = 'Укажите площадь';
    if (!formData.property_type) e.property_type = 'Выберите тип';
    if (!formData.service_type) e.service_type = 'Выберите сделку';
    if (!formData.city.trim()) e.city = 'Город обязателен';
    if (!formData.address.trim()) e.address = 'Адрес обязателен';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error('Проверьте обязательные поля');
      return;
    }
    const fd = new FormData();
    fd.append('title', formData.title);
    fd.append('description', formData.description);
    fd.append('price', formData.price);
    fd.append('property_type', formData.property_type);
    fd.append('service_type', formData.service_type);
    fd.append('city', formData.city);
    fd.append('district', formData.district);
    fd.append('address', formData.address);
    fd.append('area', String(areaInputToSqm(parseFloat(formData.area), selectedType?.slug)));
    if (formData.rooms) fd.append('rooms', formData.rooms);
    if (formData.floor) fd.append('floor', formData.floor);
    if (formData.total_floors) fd.append('total_floors', formData.total_floors);
    fd.append('has_parking', String(formData.has_parking));
    fd.append('has_balcony', String(formData.has_balcony));
    fd.append('has_elevator', String(formData.has_elevator));
    fd.append('status', formData.status);
    fd.append('is_featured', String(formData.is_featured));
    if (formData.latitude) {
      const v = parseFloat(formData.latitude);
      if (Number.isFinite(v)) fd.append('latitude', (Math.round(v * 1e6) / 1e6).toFixed(6));
    }
    if (formData.longitude) {
      const v = parseFloat(formData.longitude);
      if (Number.isFinite(v)) fd.append('longitude', (Math.round(v * 1e6) / 1e6).toFixed(6));
    }
    selectedImages.forEach((file) => fd.append('uploaded_images', file));
    mutation.mutate(fd);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length) setSelectedImages((p) => [...p, ...files]);
  };

  const existingImages = (property?.images ?? []).map((img) =>
    img.image.startsWith('http') ? img.image : `${MEDIA_URL}${img.image}`,
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Section: Основное */}
      <Section title="Основная информация" eyebrow="1 — Что продаёте или сдаёте">
        <Field id="title" label="Заголовок объявления" required error={errors.title} hint="Кратко и по сути: тип, район, главная фишка">
          <Input
            id="title"
            placeholder="Например: 3-комнатная в центре с видом на Кок-Тобе"
            value={formData.title}
            onChange={(e) => set('title', e.target.value)}
            aria-invalid={!!errors.title}
            className="h-11"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="property_type" label="Тип недвижимости" required error={errors.property_type} icon={<Building2 className="h-4 w-4" />}>
            <Select value={formData.property_type} onValueChange={(v) => set('property_type', v)}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Квартира, дом, коммерция…" /></SelectTrigger>
              <SelectContent>
                {propertyTypes?.map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="service_type" label="Сделка" required error={errors.service_type} icon={<Briefcase className="h-4 w-4" />}>
            <Select value={formData.service_type} onValueChange={(v) => set('service_type', v)}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Продажа, аренда, посуточно…" /></SelectTrigger>
              <SelectContent>
                {serviceTypes?.map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="price" label="Цена, ₸" required error={errors.price} icon={<Coins className="h-4 w-4" />}>
            <Input
              id="price"
              type="number"
              inputMode="numeric"
              min={0}
              step={10000}
              placeholder="25 000 000"
              value={formData.price}
              onChange={(e) => set('price', e.target.value)}
              aria-invalid={!!errors.price}
              className="h-11 tabular-nums"
            />
          </Field>
          <Field id="area" label={isLand ? 'Площадь, га' : 'Площадь, м²'} required error={errors.area} icon={<Ruler className="h-4 w-4" />}>
            <Input
              id="area"
              type="number"
              inputMode="decimal"
              min={0}
              step={isLand ? 0.01 : 0.1}
              placeholder={isLand ? '0.12' : '64'}
              value={formData.area}
              onChange={(e) => set('area', e.target.value)}
              aria-invalid={!!errors.area}
              className="h-11 tabular-nums"
            />
          </Field>
        </div>
      </Section>

      {/* Section: Местоположение */}
      <Section title="Местоположение" eyebrow="2 — Где находится">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field id="city" label="Город" required error={errors.city} icon={<MapPin className="h-4 w-4" />}>
            <Input
              id="city"
              placeholder="Алматы"
              value={formData.city}
              onChange={(e) => set('city', e.target.value)}
              aria-invalid={!!errors.city}
              className="h-11"
            />
          </Field>
          <Field id="district" label="Район">
            <Input id="district" placeholder="Бостандыкский" value={formData.district} onChange={(e) => set('district', e.target.value)} className="h-11" />
          </Field>
          <Field id="address" label="Адрес" required error={errors.address}>
            <Input
              id="address"
              placeholder="ул. Абая, 123"
              value={formData.address}
              onChange={(e) => set('address', e.target.value)}
              aria-invalid={!!errors.address}
              className="h-11"
            />
          </Field>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2.5">
            Точка на карте <span className="font-normal text-muted-foreground/70 normal-case tracking-normal">— необязательно, но клиенты быстрее находят</span>
          </p>
          <LocationPicker
            latitude={formData.latitude ? parseFloat(formData.latitude) : null}
            longitude={formData.longitude ? parseFloat(formData.longitude) : null}
            onChange={(la, ln) => {
              set('latitude', la === null ? '' : String(la));
              set('longitude', ln === null ? '' : String(ln));
            }}
          />
        </div>
      </Section>

      {/* Section: Характеристики */}
      <Section title="Характеристики" eyebrow="3 — Подробности об объекте">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field id="rooms" label="Комнаты" icon={<Bed className="h-4 w-4" />}>
            <Input id="rooms" type="number" min={0} placeholder="3" value={formData.rooms} onChange={(e) => set('rooms', e.target.value)} className="h-11 tabular-nums" />
          </Field>
          <Field id="floor" label="Этаж" icon={<Layers className="h-4 w-4" />}>
            <Input id="floor" type="number" min={0} placeholder="5" value={formData.floor} onChange={(e) => set('floor', e.target.value)} className="h-11 tabular-nums" />
          </Field>
          <Field id="total_floors" label="Этажность дома">
            <Input id="total_floors" type="number" min={0} placeholder="9" value={formData.total_floors} onChange={(e) => set('total_floors', e.target.value)} className="h-11 tabular-nums" />
          </Field>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2.5">Удобства</p>
          <div className="flex flex-wrap gap-2">
            <CheckChip checked={formData.has_parking} onCheckedChange={(v) => set('has_parking', v)} label="Парковка" />
            <CheckChip checked={formData.has_balcony} onCheckedChange={(v) => set('has_balcony', v)} label="Балкон" />
            <CheckChip checked={formData.has_elevator} onCheckedChange={(v) => set('has_elevator', v)} label="Лифт" />
          </div>
        </div>
      </Section>

      {/* Section: Описание */}
      <Section title="Описание" eyebrow="4 — Расскажите подробнее">
        <Field id="description" label="Текст объявления" hint="От 80 знаков. Что важного: ремонт, мебель, инфраструктура, причина продажи.">
          <Textarea
            id="description"
            rows={5}
            placeholder="Светлая квартира в тихом дворе. Свежий ремонт, кухня встроенная, рядом школа №25 и парк…"
            value={formData.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </Field>
      </Section>

      {/* Section: Фотографии */}
      <Section title="Фотографии" eyebrow="5 — Чем больше, тем лучше">
        {existingImages.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Уже загружено</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {existingImages.map((src, i) => (
                <div key={src + i} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-sand-100 dark:bg-sand-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            'rounded-2xl border-2 border-dashed bg-card/50 p-8 text-center transition-colors',
            dragOver ? 'border-primary bg-terra-50 dark:bg-sand-850' : 'border-border',
          )}
        >
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-terra-100 text-terra-500 dark:bg-sand-850 dark:text-terra-300 mx-auto mb-3">
            <ImagePlus className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <p className="font-display text-lg font-semibold tracking-tight">Перетащите фотографии сюда</p>
          <p className="mt-1 text-sm text-muted-foreground">или выберите вручную · PNG, JPG, JPEG до 10 MB</p>
          <Label htmlFor="images" className="inline-flex items-center justify-center mt-4 h-10 px-4 rounded-md bg-secondary text-foreground font-semibold text-sm cursor-pointer hover:bg-sand-200 dark:hover:bg-sand-700 transition-colors">
            <Upload className="h-4 w-4 mr-2" strokeWidth={1.75} />
            Выбрать файлы
          </Label>
          <Input
            id="images"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setSelectedImages((p) => [...p, ...files]);
              e.target.value = '';
            }}
          />
        </div>

        {selectedImages.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Будут добавлены</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {selectedImages.map((file, i) => (
                <div key={i} className="relative group aspect-[4/3] rounded-lg overflow-hidden bg-sand-100 dark:bg-sand-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(file)} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  <button
                    type="button"
                    aria-label="Удалить"
                    onClick={() => setSelectedImages((p) => p.filter((_, idx) => idx !== i))}
                    className="absolute top-1.5 right-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-sand-900/70 text-sand-50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Section: Публикация */}
      <Section title="Публикация" eyebrow="6 — Видимость объявления">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="status" label="Статус">
            <Select value={formData.status} onValueChange={(v) => set('status', v)}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="flex items-end">
            <CheckChip
              checked={formData.is_featured}
              onCheckedChange={(v) => set('is_featured', v)}
              label="Рекомендуемое (вывести в подборки)"
              icon={<Star className="h-4 w-4" strokeWidth={1.75} />}
              className="h-11"
            />
          </div>
        </div>
      </Section>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 -mx-4 sm:mx-0 z-10">
        <div className="rounded-t-2xl sm:rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-lg p-3 sm:p-4 flex flex-wrap items-center gap-2 justify-between">
          <p className="text-sm text-muted-foreground inline-flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4" strokeWidth={1.75} />
            {Object.keys(errors).length > 0
              ? `Проверьте поля: ${Object.keys(errors).length}`
              : 'Поля со звёздочкой обязательны'}
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="lg" onClick={onCancel ?? (() => router.back())}>
              Отмена
            </Button>
            <Button type="submit" size="lg" disabled={mutation.isPending}>
              {mutation.isPending ? (isEditing ? 'Сохраняем…' : 'Публикуем…') : (isEditing ? 'Сохранить' : 'Опубликовать')}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

/* ---------- Local UI ---------- */

function Section({ title, eyebrow, children }: { title: string; eyebrow?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm p-5 sm:p-6 space-y-4">
      <header>
        {eyebrow && <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">{eyebrow}</p>}
        <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  required,
  hint,
  error,
  icon,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-foreground/90">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-[1]">
            {icon}
          </span>
        )}
        <div className={cn(icon ? '[&_input]:pl-10 [&_button]:pl-10' : '')}>{children}</div>
      </div>
      {hint && !error && <p className="text-xs text-muted-foreground leading-relaxed">{hint}</p>}
      {error && (
        <p className="text-xs text-destructive inline-flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}

function CheckChip({
  checked,
  onCheckedChange,
  label,
  icon,
  className,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        'inline-flex items-center gap-2.5 cursor-pointer rounded-full border px-3.5 select-none transition-colors',
        checked
          ? 'bg-terra-50 border-terra-300 text-terra-700 dark:bg-sand-850 dark:border-terra-600 dark:text-terra-200'
          : 'bg-card border-border text-foreground/80 hover:border-sand-300 dark:hover:border-sand-600',
        className ?? 'h-10',
      )}
    >
      <Checkbox checked={checked} onCheckedChange={(v) => onCheckedChange(!!v)} />
      <span className="inline-flex items-center gap-1.5 text-sm font-medium">
        {icon}
        {label}
      </span>
    </label>
  );
}
