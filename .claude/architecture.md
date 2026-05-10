# Architecture

Высокоуровневая архитектура NashDom. Этот документ — для понимания «как куски соединяются». Реализационные детали — в [`backend/CLAUDE.md`](../backend/CLAUDE.md) и [`frontend/CLAUDE.md`](../frontend/CLAUDE.md).

## Топология

```
┌─────────────────────────────────────────────────────────────┐
│                          Browser                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Next.js 15 (App Router, Turbopack, React 19)        │   │
│  │  ─ FSD: app / pages / widgets / features / entities  │   │
│  │  ─ TanStack Query (server state) + Redux (UI state)  │   │
│  │  ─ Tailwind v4 + shadcn/ui + Leaflet + Lucide        │   │
│  │  ─ JWT в localStorage                                │   │
│  └──────────────────────┬───────────────────────────────┘   │
└────────────────────────┼─────────────────────────────────────┘
                          │ HTTPS / JSON
                          │ Authorization: Bearer <jwt>
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                Django 4.2 + DRF (port 8000)                 │
│  /api/auth/*       — SimpleJWT, регистрация, профиль        │
│  /api/properties/* — CRUD, фильтры, избранное, статистика   │
│  /api/contacts/*   — заявки, newsletter                     │
│  /admin/           — Django admin (для superadmin)          │
│  /swagger/  /redoc/                                         │
└──────────┬──────────────────────────┬───────────────────────┘
           │                          │
           ▼                          ▼
   ┌───────────────┐        ┌──────────────────┐
   │  PostgreSQL   │        │  Local FS        │
   │  (или SQLite  │        │  backend/media/  │
   │   в dev)      │        │  (uploaded imgs) │
   └───────────────┘        └──────────────────┘

   Внешние сервисы:
   ─ OpenStreetMap tile server (Leaflet)
   ─ Nominatim (geocoding)
   ─ 2GIS (только deeplink-кнопка, не API)
```

## Модель данных (упрощённая)

```
User                                 Property
─ id, email (USERNAME_FIELD)         ─ id, title, description, price
─ first/last/username, phone         ─ property_type → PropertyType
─ role: client|realtor|superadmin    ─ service_type → ServiceType
─ avatar, is_verified                ─ city, district, address
─ created_at                         ─ latitude, longitude (Decimal 9,6)
                                     ─ area, rooms, floor, total_floors
PropertyType (Квартира/Дом/...)      ─ has_parking, has_balcony, has_elevator
ServiceType  (Продажа/Аренда/...)    ─ status: active|sold|rented|inactive
                                     ─ is_featured
PropertyImage                        ─ owner → User
─ property → Property                ─ main_image (FileField)
─ image, alt_text, is_main, order    ─ views_count
                                     ─ created_at, updated_at
Favorite (M2M через таблицу)
─ user → User, property → Property   ContactRequest
                                     ─ name, email, phone, message
                                     ─ request_type, status
                                     ─ user → User?, property → Property?

                                     NewsletterSubscription
                                     ─ email, is_active, created_at
```

## Поток данных: пример (открытие карточки объекта)

```
1. Browser → GET /properties/5
   Next 15 server-renders shell (Header/Footer SSR)

2. PropertyDetailPage ('use client') монтируется
   ↓
3. useQuery(['property', '5']) → propertiesApi.getProperty('5')
   ↓
4. axios → GET http://localhost:8000/api/properties/5/
   с Authorization header (если залогинен)
   ↓
5. Django PropertyDetailView
   ├─ permissions: AllowAny
   ├─ get_object() → Property.objects.get(pk=5)
   ├─ Property.increment_views()  ← side-effect
   └─ PropertyDetailSerializer.to_representation()
        с context={request} для абсолютных URL и is_favorited
   ↓
6. JSON ответ. TanStack Query кэширует.
   PropertyDetailPage рендерит:
   ├─ <PropertyImageGallery images=[...]>
   │  └─ Click → Lightbox (Dialog)
   ├─ Левая колонка: Bento Tiles, описание, удобства, PropertyMap
   │  └─ PropertyMap = dynamic(MapImpl, ssr:false) → Leaflet → OSM
   └─ Правая sticky aside: PriceTag, кнопки, Owner card

7. На мобайле sticky bottom bar остаётся со звонком
```

## Поток данных: пример (создание объявления)

```
1. /dashboard/properties/add → AddPropertyPage → DashboardShell + PropertyForm

2. Пользователь заполняет 6 секций. На карте:
   ├─ Печатает «Бостандыкский район» → debounced 400ms
   │  → Nominatim API (countrycodes=kz, accept-language=ru)
   │  → Dropdown с результатами → выбор → setLat/setLng
   ├─ Кликает по карте (Leaflet useMapEvents) → setLat/setLng
   ├─ Перетаскивает маркер → dragend → setLat/setLng
   └─ "Моя геопозиция" → navigator.geolocation → setLat/setLng

3. Submit → mutation:
   ├─ Округляет lat/lng до 6 знаков
   ├─ Собирает FormData (multipart, для файлов)
   └─ POST /api/properties/create/

4. Django PropertyCreateView
   ├─ permissions: IsAuthenticated, IsRealtorOrSuperAdmin
   ├─ PropertyCreateUpdateSerializer.create():
   │  ├─ создаёт Property с owner=request.user
   │  └─ для каждого uploaded_images создаёт PropertyImage
   └─ 201 Created → новая Property

5. mutation.onSuccess:
   ├─ invalidateQueries(['properties', 'user-properties', 'user-property-stats'])
   ├─ toast «Объявление опубликовано»
   └─ router.push('/dashboard/properties')
```

## Граница frontend ↔ backend

- **Транспорт:** REST/JSON, multipart для файлов. Никаких WebSocket / GraphQL / SSE сейчас.
- **Контракт типов:** одностороннее ручное зеркалирование в `frontend/src/shared/types/api.ts`. Если меняешь serializer на бэке — обнови этот файл. Codegen не настроен.
- **Auth:** JWT в localStorage. Токен в `Authorization: Bearer <jwt>` через axios interceptor (`shared/api/index.ts`). Refresh — `/api/auth/token/refresh/`.
- **Файлы:** аплоад через FormData. Получение — абсолютные URL из бэка (DRF context.request.build_absolute_uri).
- **Ошибки:** custom DRF exception_handler возвращает `{success: false, error: {code, message, field_errors}}`. Frontend `useFormErrors` это парсит.

## Состояние на frontend

| Тип | Где | Почему |
|---|---|---|
| Server state (запросы) | TanStack Query | Кэш, рефетч, инвалидация. **Источник истины для серверных данных.** |
| UI state (открыто/выбрано) | `useState` локально | Не выноси в Redux то что нужно одному компоненту |
| Auth state (current user) | `AuthProvider` (Context) | Один пользователь на сессию, простая инвалидация |
| Theme | `ThemeProvider` (Context, кастомный) | Persist в localStorage + класс на `<html>` |
| City | Cookie `nashdom-city` | Чтобы серверу был доступен (для SSR-фильтрации в будущем) |
| Глобальный UI (Redux) | `@reduxjs/toolkit` | Установлен, но фактически почти не используется — задел |

**Не дублируй server state в Redux.** Если данные приходят с API — TanStack Query.

## Маршруты frontend

```
/                              Главная (Hero, категории, подборки, partner CTA)
/properties                    Каталог (sidebar + grid/list/map toggle)
/properties/[id]               Карточка объекта
/auth/login                    AuthShell + login form
/auth/register                 AuthShell + register form (client/realtor tabs)
/dashboard                     Кабинет: метрики + последние/топ объявлений (realtor+admin)
/dashboard/properties          Список своих объявлений
/dashboard/properties/add      Форма создания
/dashboard/properties/[id]/edit  Форма редактирования
/favorites                     Избранное (tabs: saved / recent / saved-searches)
/profile                       Профиль (для client)
/admin                         Админ: метрики + ссылки на разделы (только superadmin)
/admin/users                   Список пользователей
/admin/properties              Модерация объявлений
```

## Внешние зависимости

| Сервис | Назначение | Замена / альтернатива |
|---|---|---|
| OpenStreetMap | tile server для Leaflet | Cloud провайдеры тайлов (Mapbox, MapTiler) если упрётся в нагрузку |
| Nominatim | геокодинг адреса | Mapbox Geocoding, Google Places — если нужна точность |
| 2GIS | deeplink-кнопка только | Yandex Maps deeplink — заменить URL |
| Google Fonts (Manrope, Unbounded) | шрифты через `next/font` | Self-host если нужно офлайн |

## Расширение / куда что добавлять

| Хочу | Куда смотреть |
|---|---|
| Новый endpoint | `backend/<app>/views.py` + `urls.py`, типы в `frontend/src/shared/types/api.ts`, методы в `shared/api/<app>.ts` |
| Новая страница в кабинете | `pages/dashboard/<feature>-page.tsx` + `app/dashboard/<route>/page.tsx` |
| Новая фильтрация в каталоге | `backend/properties/filters.py` (django-filter) + `frontend/src/features/property-search/filter-sidebar.tsx` + парсинг URL в `properties-page.tsx` |
| Новое поле объявления | См. backend/CLAUDE.md «Добавление поля в Property» — там полный чек-лист |
| Своё уведомление пользователю | Toast через `sonner` (уже подключён в `app/layout.tsx`) |
| Новая роль | Расширить `User.ROLE_CHOICES` + permission в `users/permissions.py` + nav-фильтрация в `widgets/dashboard-shell` |
