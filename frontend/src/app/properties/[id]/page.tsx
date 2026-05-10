'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Bed,
  Building2,
  Calendar,
  Check,
  ChevronRight,
  Eye,
  Heart,
  Home as HomeIcon,
  Layers,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  ShieldCheck,
  Share2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/widgets/header/header';
import { Footer } from '@/widgets/footer/footer';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/app/providers/auth-provider';
import { propertiesApi } from '@/shared/api';
import { MEDIA_URL } from '@/shared/config/api';
import {
  DealBadge,
  FeaturedBadge,
  NewBadge,
  PriceTag,
  PropertyImageGallery,
  PropertyCard,
  PropertyMap,
  formatRelativeDate,
  isNewListing,
} from '@/entities/property';
import { cn } from '@/lib/utils';


const formatDateLong = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

export default function Page() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const qc = useQueryClient();

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertiesApi.getProperty(id),
  });

  const { data: similar } = useQuery({
    enabled: !!property,
    queryKey: ['similar-properties', property?.property_type?.id],
    queryFn: () =>
      propertiesApi.getProperties({
        property_type: property?.property_type?.id,
      } as never),
    select: (resp) => resp.results.filter((p) => p.id !== Number(id)).slice(0, 4),
  });

  const favorite = useMutation({
    mutationFn: () => propertiesApi.toggleFavorite(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['property', id] });
      qc.invalidateQueries({ queryKey: ['favorites'] });
      toast.success(property?.is_favorited ? 'Удалено из избранного' : 'Добавлено в избранное');
    },
  });

  const onFavorite = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    favorite.mutate();
  };

  const onShare = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: property?.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Ссылка скопирована');
      }
    } catch {
      /* cancel */
    }
  };

  if (isLoading) return <DetailSkeleton />;
  if (error || !property) return <NotFound />;

  const allImages = [
    ...(property.main_image
      ? [property.main_image.startsWith('http') ? property.main_image : `${MEDIA_URL}${property.main_image}`]
      : []),
    ...property.images.map((img) => (img.image.startsWith('http') ? img.image : `${MEDIA_URL}${img.image}`)),
  ];

  const fresh = isNewListing(property.created_at);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pb-24 lg:pb-8">
        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb" className="border-b border-border bg-card/50">
          <div className="container py-3 flex items-center gap-1.5 text-sm text-muted-foreground overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-foreground">Главная</Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            <Link href="/properties" className="hover:text-foreground">Недвижимость</Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            <span className="text-foreground font-medium truncate">{property.title}</span>
          </div>
        </nav>

        <div className="container pt-6">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
            <Link href="/properties">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
              К каталогу
            </Link>
          </Button>

          {/* Gallery */}
          <PropertyImageGallery images={allImages} title={property.title} />

          {/* Main grid */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
            {/* LEFT */}
            <div className="space-y-10 min-w-0">
              {/* Title block */}
              <header>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <DealBadge serviceSlug={property.service_type?.slug} />
                  {property.is_featured && <FeaturedBadge />}
                  {fresh && <NewBadge />}
                  {property.status !== 'active' && (
                    <span className="inline-flex h-6 items-center rounded-full bg-secondary px-2.5 text-xs font-medium text-muted-foreground">
                      {property.status === 'sold' ? 'Продано' : property.status === 'rented' ? 'Сдано' : 'Снято'}
                    </span>
                  )}
                </div>
                <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
                  {property.title}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" strokeWidth={1.75} />
                    {[property.city, property.district, property.address].filter(Boolean).join(', ')}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" strokeWidth={1.75} />
                    {formatRelativeDate(property.created_at)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="h-4 w-4" strokeWidth={1.75} />
                    <span className="tabular-nums">{property.views_count}</span> просмотров
                  </span>
                </div>
              </header>

              {/* Bento — Key facts */}
              <section>
                <SectionTitle eyebrow="Параметры" title="О квартире" />
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  <Tile icon={<HomeIcon className="h-5 w-5" />} label="Тип" value={property.property_type?.name} />
                  <Tile icon={<Ruler className="h-5 w-5" />} label="Площадь" value={`${property.area} м²`} />
                  {property.rooms !== undefined && property.rooms !== null && (
                    <Tile icon={<Bed className="h-5 w-5" />} label="Комнаты" value={String(property.rooms)} />
                  )}
                  {property.floor && (
                    <Tile
                      icon={<Layers className="h-5 w-5" />}
                      label="Этаж"
                      value={property.total_floors ? `${property.floor} из ${property.total_floors}` : `${property.floor}`}
                    />
                  )}
                  <Tile icon={<Building2 className="h-5 w-5" />} label="Сделка" value={property.service_type?.name} />
                </div>
              </section>

              {/* Описание */}
              {property.description && (
                <section>
                  <SectionTitle eyebrow="Описание" title="Об объекте" />
                  <div className="mt-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <p className="whitespace-pre-line text-[15px] leading-relaxed text-foreground/85">
                      {property.description}
                    </p>
                  </div>
                </section>
              )}

              {/* Удобства */}
              <section>
                <SectionTitle eyebrow="Удобства" title="Что есть" />
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <FeatureRow active={property.has_parking} label="Парковка" />
                  <FeatureRow active={property.has_balcony} label="Балкон" />
                  <FeatureRow active={property.has_elevator} label="Лифт" />
                </div>
              </section>

              {/* Местоположение */}
              <section>
                <SectionTitle eyebrow="Местоположение" title="На карте" />
                <div className="mt-2 mb-4">
                  <p className="text-sm font-medium text-foreground inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" strokeWidth={1.75} />
                    {[property.city, property.district, property.address].filter(Boolean).join(', ')}
                  </p>
                </div>
                <PropertyMap
                  latitude={property.latitude}
                  longitude={property.longitude}
                  address={[property.city, property.district, property.address].filter(Boolean).join(', ')}
                />
              </section>

              {/* Похожие */}
              {similar && similar.length > 0 && (
                <section>
                  <div className="flex items-end justify-between gap-4 flex-wrap">
                    <SectionTitle eyebrow="Похожие" title="Возможно, вам понравится" />
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/properties?property_type=${property.property_type?.id ?? ''}`}>
                        Все похожие <ArrowRight className="h-4 w-4" strokeWidth={2} />
                      </Link>
                    </Button>
                  </div>
                  <div className="mt-5 -mx-4 sm:mx-0 overflow-x-auto pb-2 [scrollbar-width:thin]">
                    <div className="flex gap-3 px-4 sm:px-0">
                      {similar.map((p) => (
                        <PropertyCard key={p.id} property={p} variant="mini" />
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT — sticky aside */}
            <aside className="lg:sticky lg:top-20 self-start space-y-4">
              {/* Price + actions */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-md">
                <PriceTag price={property.price} serviceSlug={property.service_type?.slug} size="xl" />
                <div className="mt-5 grid grid-cols-1 gap-2">
                  {property.owner.phone && (
                    <Button asChild size="lg">
                      <a href={`tel:${property.owner.phone}`}>
                        <Phone className="h-4 w-4" strokeWidth={1.75} /> Позвонить
                      </a>
                    </Button>
                  )}
                  <Button size="lg" variant="outline">
                    <MessageCircle className="h-4 w-4" strokeWidth={1.75} /> Написать
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="ghost" onClick={onFavorite} disabled={favorite.isPending}>
                      <Heart
                        className={cn('h-4 w-4', property.is_favorited && 'fill-destructive text-destructive')}
                        strokeWidth={1.75}
                      />
                      {property.is_favorited ? 'В избранном' : 'В избранное'}
                    </Button>
                    <Button variant="ghost" onClick={onShare}>
                      <Share2 className="h-4 w-4" strokeWidth={1.75} />
                      Поделиться
                    </Button>
                  </div>
                </div>
              </div>

              {/* Owner */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">
                  {property.owner.role === 'realtor' ? 'Риелтор' : 'Собственник'}
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-border">
                    <AvatarImage src={property.owner.avatar} />
                    <AvatarFallback className="bg-terra-100 text-terra-700 dark:bg-sand-850 dark:text-terra-300">
                      {(property.owner.first_name?.[0] || property.owner.username[0] || '?').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold leading-tight truncate">
                      {property.owner.first_name && property.owner.last_name
                        ? `${property.owner.first_name} ${property.owner.last_name}`
                        : property.owner.username}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      {property.owner.is_verified && (
                        <span className="inline-flex items-center gap-1 text-success font-medium">
                          <ShieldCheck className="h-3 w-3" strokeWidth={2} /> Подтверждён
                        </span>
                      )}
                      <span>На сайте с {new Date(property.owner.created_at ?? property.created_at).getFullYear()}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
                  {property.owner.phone && (
                    <a href={`tel:${property.owner.phone}`} className="inline-flex items-center gap-2 text-foreground hover:text-primary">
                      <Phone className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                      <span className="font-medium tabular-nums">{property.owner.phone}</span>
                    </a>
                  )}
                  {property.owner.email && (
                    <a href={`mailto:${property.owner.email}`} className="inline-flex items-center gap-2 text-foreground hover:text-primary truncate">
                      <Mail className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                      <span className="font-medium truncate">{property.owner.email}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Quick facts */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">
                  Кратко
                </p>
                <dl className="divide-y divide-border text-sm">
                  <FactRow label="Опубликовано" value={formatDateLong(property.created_at)} />
                  <FactRow label="Обновлено" value={formatDateLong(property.updated_at)} />
                  <FactRow label="ID объекта" value={`#${property.id}`} mono />
                </dl>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Sticky bottom CTA — mobile */}
      <div className="fixed bottom-0 inset-x-0 z-30 lg:hidden border-t border-border bg-card/95 backdrop-blur-md shadow-lg">
        <div className="container flex items-center justify-between gap-3 py-3">
          <PriceTag price={property.price} serviceSlug={property.service_type?.slug} size="lg" />
          {property.owner.phone ? (
            <Button asChild size="lg">
              <a href={`tel:${property.owner.phone}`}>
                <Phone className="h-4 w-4" strokeWidth={1.75} /> Позвонить
              </a>
            </Button>
          ) : (
            <Button size="lg">
              <MessageCircle className="h-4 w-4" strokeWidth={1.75} /> Написать
            </Button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* ---------- Subcomponents ---------- */

function SectionTitle({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div>
      {eyebrow && (
        <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">{eyebrow}</p>
      )}
      <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight">{title}</h2>
    </div>
  );
}

function Tile({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | number }) {
  if (!value) return null;
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="text-muted-foreground">{icon}</div>
      <p className="mt-2 text-xs uppercase tracking-wider font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-base text-foreground tabular-nums">{value}</p>
    </div>
  );
}

function FeatureRow({ active, label }: { active: boolean; label: string }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 rounded-md border px-3.5 py-2.5 text-sm font-medium',
        active
          ? 'border-success/30 bg-success/10 text-foreground'
          : 'border-border bg-card text-muted-foreground line-through decoration-from-font',
      )}
    >
      <span
        className={cn(
          'inline-flex h-5 w-5 items-center justify-center rounded-full',
          active ? 'bg-success text-white' : 'bg-secondary text-muted-foreground',
        )}
      >
        {active ? <Check className="h-3 w-3" strokeWidth={3} /> : <X className="h-3 w-3" strokeWidth={2.25} />}
      </span>
      {label}
    </div>
  );
}

function FactRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn('font-semibold text-foreground', mono && 'tabular-nums')}>{value}</dd>
    </div>
  );
}

/* ---------- States ---------- */

function DetailSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container pt-8 space-y-6">
        <div className="h-6 w-1/3 bg-sand-100 dark:bg-sand-800 rounded animate-pulse" />
        <div className="aspect-[16/9] bg-sand-100 dark:bg-sand-800 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-3">
            <div className="h-10 w-3/4 bg-sand-100 dark:bg-sand-800 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-sand-100 dark:bg-sand-800 rounded animate-pulse" />
            <div className="h-32 bg-sand-100 dark:bg-sand-800 rounded-2xl animate-pulse" />
          </div>
          <div className="h-72 bg-sand-100 dark:bg-sand-800 rounded-2xl animate-pulse" />
        </div>
      </main>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 grid place-items-center container py-20">
        <div className="text-center max-w-md">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-terra-100 text-terra-500 mb-4 dark:bg-sand-850 dark:text-terra-300">
            <HomeIcon className="h-8 w-8" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight mb-2">Объект не найден</h1>
          <p className="text-muted-foreground mb-6">
            Возможно, объявление снято или ссылка устарела.
          </p>
          <Button asChild size="lg">
            <Link href="/properties">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} /> Вернуться к каталогу
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
