# Technologies

Что используем и **почему**. Если хочешь добавить новую зависимость — сначала посмотри есть ли она тут.

## Backend

| Пакет | Назначение | Заметки |
|---|---|---|
| **Django 4.2** | веб-фреймворк | LTS, стабильно. Не обновлять до 5.x без необходимости. |
| **djangorestframework** | REST API | Все views — DRF (`APIView`, `GenericAPIView`). Не используем `viewsets`/`Router`. |
| **djangorestframework-simplejwt** | JWT auth | Access + refresh токены. Никаких сессий-cookie для API. |
| **django-filter** | querystring → filterset | Один FilterSet в `properties/filters.py`. |
| **drf-yasg** | Swagger UI | `/swagger/`, `/redoc/`. |
| **django-cors-headers** | CORS для фронта | dev: localhost:3000 разрешён. |
| **Pillow** | image processing | Для `ImageField` (avatar, property_image). |
| **psycopg2-binary** | PostgreSQL driver | Опционально; в dev используется встроенный SQLite. |

### Чего НЕТ и почему
- **Celery / Redis** — нет фоновых задач сейчас (newsletter отправляется синхронно). Появится — добавим.
- **Channels / WebSocket** — реал-тайм пока не нужен.
- **GraphQL** — REST хватает, фронт под него заточен.
- **django-rest-framework-jwt** (старый) — используем SimpleJWT.
- **Custom auth backend** — нет, AbstractUser достаточно.

## Frontend

### Core
| Пакет | Версия | Назначение |
|---|---|---|
| **next** | 15.5 | App Router, Turbopack-сборка |
| **react** | 19 | Server + client components |
| **typescript** | 5 | Строгие типы |

### UI
| Пакет | Назначение | Заметки |
|---|---|---|
| **tailwindcss** | 4.x | `@theme` через CSS, нет `tailwind.config.*` |
| **@tailwindcss/postcss** | postcss-плагин | Tailwind v4 не использует `init` команду |
| **tw-animate-css** | анимации Radix-стейтов | Используется внутри shadcn |
| **@radix-ui/react-*** | accessibility primitives | `dialog`, `dropdown-menu`, `select`, `tabs`, `checkbox`, `avatar`, `slot`, `label`, `navigation-menu`, `separator`, `alert-dialog` |
| **shadcn/ui** | компоненты на Radix + Tailwind | конфиг в `components.json`, файлы в `components/ui/` |
| **class-variance-authority** | variant API для компонентов | Используется во всех `cva()` определениях |
| **clsx + tailwind-merge** | условные классы | Хелпер `cn()` в `@/lib/utils` |
| **lucide-react** | иконки SVG | stroke 1.75, размеры 16/20/24/32 |
| **sonner** | toast-уведомления | Подключён в `app/layout.tsx`, position top-right |

### State / data
| Пакет | Назначение |
|---|---|
| **@tanstack/react-query** | server state, кэш, инвалидация |
| **@tanstack/react-table** | таблицы (для admin/dashboard) |
| **@reduxjs/toolkit + react-redux** | UI state (минимально, фактически задел) |
| **axios** (через `shared/api`) | HTTP клиент с JWT interceptor |

### Maps
| Пакет | Назначение |
|---|---|
| **leaflet** | картографический движок |
| **react-leaflet** | React-обёртка |
| **@types/leaflet** | типы |

Тайлы — OpenStreetMap (`https://{s}.tile.openstreetmap.org/...`).
Геокодинг — Nominatim (`https://nominatim.openstreetmap.org/search`).

### Шрифты
- **Manrope** (variable, latin+cyrillic) — UI/body
- **Unbounded** (variable, latin+cyrillic) — display
- Загружаются через `next/font/google` с `display: 'swap'` в `app/layout.tsx`

### Чего НЕТ и почему
- **next-themes** — у нас свой `ThemeProvider` (см. `app/providers/theme-provider.tsx`). Не добавляй.
- **mapbox-gl / @mapbox/maki / yandex-maps** — Leaflet+OSM достаточно, без ключей и платежей.
- **react-hook-form / zod / yup** — формы написаны на нативных useState + ручной validate. Если форм станет 10+ — рассмотри `react-hook-form + zod`.
- **next-intl / react-i18next** — UI на русском. Локализация на казахский — задел в дизайне (city-picker, language toggle), но i18n пока не настроен.
- **storybook** — не нужно для проекта такого размера.
- **jest / vitest / playwright** — тестов нет (см. `frontend/CLAUDE.md`).
- **swr** — TanStack Query покрывает.
- **framer-motion** — Tailwind transitions + tw-animate-css хватает.

## Инфраструктура

| Что | Где |
|---|---|
| Docker | `Dockerfile` в `backend/` и `frontend/`, корневой `docker-compose.yml` (поднимает оба + postgres) |
| Production | не настроено (пока dev-only). Будет — Vercel для фронта, Render/Fly.io/собственный VPS для бэка. |
| CI/CD | не настроено |
| Monitoring | не настроено |

## Минимальные системные требования (dev)

- Python 3.9+ (тестировано на 3.11/3.12)
- Node.js 18+ (рекомендуется 20+)
- 4 GB RAM на разработчика
- macOS/Linux/Windows — все три работают; Docker не обязателен в dev

## Миграция версий

- **Django 4.2 → 5.x** — менять только если нужны новые фичи. ORM-API почти совместим, но проверь `STORAGES` setting и async-ORM.
- **Next 15 → 16** — будет — проверь App Router breaking changes и Turbopack stability.
- **React 19** — не использовать experimental hooks без необходимости.
- **Tailwind v4 → v5** — пока стабилен, но v4 свежая, могут быть ломающие изменения в `@theme`.
