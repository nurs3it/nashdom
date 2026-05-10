# frontend/CLAUDE.md

Гид по фронтенду NashDom. Основа: Next.js 15 (App Router) + React 19 + Tailwind v4 + shadcn/ui + Feature-Sliced Design.

## Запуск

```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local   # одноразово
npm install
npm run dev      # http://localhost:3000  (Turbopack)
npm run build    # production
npm run lint
```

Тестов нет, type-check скрипта нет — типы проверяются через `next build` или редактор. Не выдумывай команды.

## FSD-структура

```
src/
├── app/                          # Next.js App Router (роуты + провайдеры)
│   ├── globals.css               # Tailwind v4 @theme, токены, dark mode
│   ├── layout.tsx                # шрифты, Toaster, no-flash theme script
│   ├── page.tsx                  # / → HomePage
│   ├── providers/
│   │   ├── index.tsx             # ThemeProvider → QueryProvider → AuthProvider
│   │   ├── theme-provider.tsx    # custom (без next-themes)
│   │   ├── query-provider.tsx    # TanStack Query
│   │   └── auth-provider.tsx     # JWT в localStorage
│   ├── auth/                     # /auth/login, /auth/register
│   ├── properties/               # /properties, /properties/[id]
│   ├── dashboard/                # /dashboard, /dashboard/properties[/add|/[id]/edit]
│   ├── favorites/, profile/, admin/
│                                 # (отдельного pages/ слоя НЕТ — composition страниц
│                                 # лежит прямо в src/app/<route>/page.tsx как default export)
├── widgets/                      # композитные блоки (header, footer, dashboard-shell, auth-shell, property-card)
├── features/                     # фичи с состоянием (search-bar, filter-sidebar, property-form)
├── entities/                     # доменные модели + UI
│   └── property/                 # PropertyCard, PriceTag, DealBadge, PropertyMap, LocationPicker, lib/format
├── shared/                       # переиспользуемая нейтральная база
│   ├── api/                      # axios клиент + методы (auth, properties, contacts)
│   ├── ui/                       # ThemeToggle и пр.
│   ├── lib/                      # utils, cookies, geocode
│   ├── hooks/                    # useFormErrors и пр.
│   ├── types/                    # api.ts — все типы из бэка
│   └── config/                   # api.ts — BASE_URL, MEDIA_URL
├── components/ui/                # shadcn-примитивы (Button, Input, Card, Sheet, Tabs, Dialog, Select, …)
└── lib/                          # cn() и пр.
```

**Правило слоёв FSD:** нижний слой не импортирует из верхнего. Цепочка вниз: `app → widgets → features → entities → shared`. `components/ui` и `lib` фактически живут на уровне `shared`. Не нарушать.

**Особенность:** в этом проекте нет отдельного FSD-слоя `pages/` — Next 15 даже при использовании App Router конфликтует с `src/pages/` (видит его как Pages Router). Composition страниц лежит прямо в `src/app/<route>/page.tsx` через `export default function Page()`. Если нужно расщепить большую страницу — положи частные подкомпоненты в тот же `app/<route>/_components/` (с подчёркиванием — Next игнорирует такие папки в роутинге).

## Дизайн-система

Контракт — [`design-system/MASTER.md`](./design-system/MASTER.md). Кратко:

- **Палитра «Terra»**: terra (брендовый CTA), ochre (акцент), sand (нейтральная тёплая основа). 4 семантических: success/warning/danger/info.
- **Light + Dark** — тёмная тема не «инверсия», а тёплый ночной режим. **Тестируй обе.**
- **Шрифты:** Manrope (UI/body) + Unbounded (display) — оба с кириллицей через `next/font/google`.
- **Tokens:** только через `bg-primary`, `text-foreground`, `border-border` и т.д. Никаких raw hex в компонентах. Брендовые шкалы доступны как `terra-500`, `ochre-400`, `sand-100` (определены в `globals.css` `@theme`).
- **Тени** — тёплые (`rgba(56,32,16,…)` в light, темнее в dark). Размеры `sm/md/lg/xl`.
- **Радиусы:** `rounded-md` (10) — кнопки/инпуты, `rounded-lg` (16) — карточки, `rounded-xl` (22) — hero, `rounded-2xl` (28) — модалки, `rounded-full` — pills и avatars.
- **Иконки:** Lucide, stroke 1.75. Никаких эмоджи в UI как иконок.

## Ключевые виджеты и компоненты

### Layout-каркасы (widgets)
- `widgets/header/header.tsx` — глобальный header (5 nav + city из cookie + theme toggle + auth menu + mobile sheet)
- `widgets/footer/footer.tsx` — footer
- `widgets/dashboard-shell/dashboard-shell.tsx` — layout кабинета (sidebar/bottom-nav, role-aware nav items)
- `widgets/auth-shell/auth-shell.tsx` — split-layout для auth-страниц

### Property (entities)
- `PropertyCard` — 4 варианта: `standard` (каталог 4:3), `featured` (16:10 для подборок), `compact` (горизонтальная для избранного), `mini` (224px для слайдеров)
- `PriceTag` — sm/md/lg/xl, `tabular-nums`, period-suffix (`/мес`, `/сутки`)
- `DealBadge / NewBadge / FeaturedBadge / StatusBadge` — pill-бейджи в семантических цветах
- `FavoriteButton` — overlay (с backdrop-blur) и plain
- `PropertyImageGallery` — main + 4 thumb + lightbox (клавиатура ←→ESC)
- `PropertyMap` — read-only Leaflet + 2GIS deeplink
- `LocationPicker` — interactive: address-search (Nominatim), click для маркера, drag, geolocation, clear
- `entities/property/lib/format.ts` — `formatPrice`, `getDealKind/Label`, `getPricePeriod`, `formatRelativeDate`, `isNewListing`

### Search & filters (features)
- `SearchBar` (variant: `hero` | `compact`) — segmented deal tabs + 3 selects + CTA + chip suggestions
- `FilterSidebar` / `FilterSheet` — chip-фильтры + range inputs + checkboxes + sticky footer «Показать N»
- `SortMenu` — DropdownMenu с группами по смыслу
- `ActiveFilters` — chips активных фильтров с (×)
- `ViewToggle` — Сетка / Список / Карта

## Auth flow

- Хранение токена: **localStorage** (key `accessToken`/`refreshToken`)
- `AuthProvider` (в `app/providers/auth-provider.tsx`) даёт `useAuth()` с `user`, `isAuthenticated`, `login`, `logout`, `isLoading`
- API клиент в `shared/api` автоматически прикрепляет `Authorization: Bearer <accessToken>`
- На protected-страницах паттерн:
  ```ts
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/auth/login');
  }, [isLoading, isAuthenticated, router]);
  ```
- Роли: `user.role` ∈ `client | realtor | superadmin`. Для admin-only страниц проверяй `role === 'superadmin'`.

## Карта

Leaflet + react-leaflet + OpenStreetMap (бесплатно, без ключа). 2GIS — только как deeplink-кнопка (`https://2gis.kz/geo/{lng},{lat}`).

- **Все карто-компоненты загружаются через `dynamic()` с `ssr: false`** — иначе SSR крашится на `window`
- Поиск адреса через **Nominatim** (`shared/lib/geocode.ts`) — debounced 400ms, AbortController, `countrycodes=kz`, `accept-language=ru`
- При сабмите формы координаты **обязательно округляй до 6 знаков** (`(Math.round(v * 1e6) / 1e6).toFixed(6)`) — иначе бэкенд отвергнет (max_digits=9, decimal_places=6)

## Тёмная тема

`ThemeProvider` в `app/providers/theme-provider.tsx` — кастомный (без `next-themes`):
- Состояния: `system | light | dark`, persisted в `localStorage` (`nashdom-theme`)
- Класс `dark` ставится на `<html>` синхронно через inline `<script>` в `<head>` (см. `layout.tsx` `themeInitScript`) — нет FOUC
- `useTheme()` даёт `theme`, `resolvedTheme`, `setTheme`, `toggleTheme`
- Toggle: `shared/ui/theme-toggle.tsx`

## Конвенции

### Создание новой страницы
1. Создай файл `src/app/<route>/page.tsx` с `export default function Page()`. Если нужны хуки — добавь `'use client'`
2. Если страница принадлежит кабинету — оборачивай в `<DashboardShell title=... subtitle=...>`
3. Если auth — в `<AuthShell title=...>`
4. Иначе — компонуй сам с `<Header />` + `<Footer />`
5. Если используешь `useSearchParams()` — оберни содержимое страницы в `<Suspense fallback={null}>` (требование Next 15 prerender). Пример: `app/properties/page.tsx`
6. Для динамических роутов (`[id]`) — `const { id } = useParams() as { id: string }` для client component, либо `async function Page({ params }: { params: Promise<{ id: string }> })` + `await params` для server

### Новый shadcn компонент
- Кладите в `components/ui/` (не в `shared/ui`!) — это контракт shadcn по `components.json`
- Конфигурируй через `cva` для вариантов
- Используй токены, не raw цвета
- Размер h-10 (touch target ≥ 44 на мобайле)

### Контейнеры
- `.container` — max-width 1280, responsive paddings (используй везде)
- `.container-wide` — full-width + paddings (только для каталога с map-split)

### Server vs Client components
Большинство страниц — `'use client'` (форм, мутаций, состояния много). Если страница чисто статичная и без хуков — server-component (без 'use client'). Не оборачивай server-component в client-провайдер случайно.

### Ничего из этого
- Никаких mock-данных в production UI (числа, имена, цитаты). Только реальные через API. Если фича не готова — empty-state с CTA.
- Никаких эмоджи как иконок (👥 🏠 ⚙️) — только Lucide.
- Никаких `bg-blue-500`, `text-red-600` — только токены или брендовые шкалы (`bg-terra-500`, `text-success`).
- Никакого `next-themes` — у нас свой ThemeProvider.
- Никакого `<img>` для property-фото в список/карточку — только `next/image` (исключения — формы редактирования, где blob-URL).

## Известные особенности / ловушки

- **`next.config.js` и `next.config.ts` оба существуют.** Next 15 предпочитает `.ts`, но проверь какой используется перед правкой.
- **Старая папка `widgets/property-card/`** — re-export нового entity (`entities/property`). Можно удалить со временем, но пока многие страницы импортируют через `@/widgets/property-card/property-card`.
- **Sidebar в `/properties` имеет ширину 320px** — текст в селектах не должен клипиться. Если добавляешь длинные опции — учитывай.
- **Координаты на бэке** — `max_digits=9, decimal_places=6`. Округляй на frontend.
- **City picker в header** — `cookie 'nashdom-city'`, default «Алматы». Клиент может сменить, но автоматический фильтр каталога по этому городу пока не подключён (это запланированная фича).
- **next/image с media-сервера** — `next.config.js` уже разрешает `localhost:8000/media/**`. Для prod — добавь хост.
