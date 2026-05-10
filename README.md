# NashDom

Маркетплейс недвижимости для Казахстана. Продажа, аренда, посуточная и коммерческая недвижимость — с упором на тёплый, человечный UX.

> Аналог krisha.kz / etazhi.kz, но визуально и интеракционно с другой философией: меньше «портал-стены данных», больше «дом, который чувствуешь своим».

## Стек

**Backend:** Django 4.2 · DRF · SimpleJWT · django-filter · drf-yasg · Pillow · SQLite (dev) / PostgreSQL (prod)
**Frontend:** Next.js 15 · React 19 · TypeScript · Tailwind v4 · shadcn/ui · TanStack Query · Leaflet · Lucide
**Архитектура:** Feature-Sliced Design (FSD)
**Дизайн:** «Terra» — терракот + охра на песочной нейтральной базе, light + dark, Manrope + Unbounded

## Быстрый старт

### Требования
- Python 3.9+
- Node.js 18+ (рекомендуется 20+)
- Опционально: Docker + docker-compose

### Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp env.example .env
python manage.py migrate
python init_data.py            # seed: типы, услуги, демо-аккаунты
python manage.py runserver     # http://localhost:8000
```

API docs: <http://localhost:8000/swagger/> · Admin: <http://localhost:8000/admin/>

### Frontend

```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm install
npm run dev                    # http://localhost:3000
```

### Docker

```bash
docker-compose up --build
docker-compose exec backend python manage.py migrate
docker-compose exec backend python init_data.py
```

## Демо-аккаунты

После `init_data.py`:

| Email | Пароль | Роль |
|---|---|---|
| `admin@nashdom.kz` | `admin123` | Супер-администратор |
| `realtor@nashdom.kz` | `realtor123` | Риелтор |
| `client@nashdom.kz` | `client123` | Клиент |

## Что внутри

### Для пользователей
- Каталог с фильтрами (цена, площадь, комнаты, удобства, тип, сделка)
- Карточка объекта: галерея с lightbox, описание, удобства, **карта с маркером** + кнопка «Открыть в 2ГИС», похожие
- Избранное · сохранённые поиски (UI готов, бэк в роадмапе) · история просмотров (UI готов)
- Тёмная тема (без FOUC), адаптив, выбор города (cookie)

### Для риелторов и админов
- Кабинет: Bento-метрики, последние объявления, топ-просматриваемые
- Подача и редактирование объявлений: 6-секционная форма с **drag-drop фото** и **picker'ом точки на карте** (поиск адреса через Nominatim, geolocation, drag маркера)
- Админ-панель: модерация объявлений, управление пользователями
- Django admin как fallback

### Дизайн
- 50+ компонентов на основе shadcn/ui под брендовые токены
- Полная light/dark поддержка
- Custom warm shadows + brand pin для карты
- Кириллица в шрифтах (Manrope + Unbounded)

Подробный список — [`.claude/features.md`](./.claude/features.md).

## Структура

```
NashDom/
├── backend/                Django + DRF
│   ├── nashdom_backend/    config (settings, urls, exceptions)
│   ├── users/              User модель, JWT, permissions
│   ├── properties/         Объявления, типы, фото, избранное
│   ├── contacts/           Заявки, newsletter
│   ├── media/              uploaded files (gitignored)
│   └── init_data.py        seed
├── frontend/               Next.js 15
│   ├── src/
│   │   ├── app/            App Router routes + providers
│   │   ├── pages/          FSD pages-layer
│   │   ├── widgets/        Header, Footer, DashboardShell, AuthShell
│   │   ├── features/       SearchBar, Filters, PropertyForm
│   │   ├── entities/       Property (Card, Map, Gallery, Badge, ...)
│   │   ├── shared/         api, ui, lib, types, hooks
│   │   └── components/ui/  shadcn primitives
│   └── design-system/      MASTER.md (контракт)
├── .claude/                Документация для AI / новых разработчиков
│   ├── architecture.md     Схема + потоки данных
│   ├── technologies.md     Стек и обоснование
│   ├── features.md         Что готово / что в роадмапе
│   ├── code-style.md       Конвенции
│   ├── business.md         Доменная модель и роли
│   └── design-system.md    Краткий обзор + ссылки
├── CLAUDE.md               Корневой гид (для Claude Code)
├── backend/CLAUDE.md       Backend-специфичный гид
├── frontend/CLAUDE.md      Frontend-специфичный гид
├── docker-compose.yml
└── README.md               (этот файл)
```

## Документация

- [`CLAUDE.md`](./CLAUDE.md) — точка входа для Claude Code / новых разработчиков
- [`backend/CLAUDE.md`](./backend/CLAUDE.md) — конвенции и URL map бэкенда
- [`frontend/CLAUDE.md`](./frontend/CLAUDE.md) — конвенции и FSD-структура фронта
- [`.claude/architecture.md`](./.claude/architecture.md) — высокоуровневая схема и потоки
- [`.claude/business.md`](./.claude/business.md) — доменная модель и пользовательские флоу
- [`.claude/features.md`](./.claude/features.md) — реестр фич с статусами
- [`.claude/code-style.md`](./.claude/code-style.md) — стандарты кода
- [`.claude/technologies.md`](./.claude/technologies.md) — стек и обоснование
- [`.claude/design-system.md`](./.claude/design-system.md) — краткий обзор дизайн-системы
- [`frontend/design-system/MASTER.md`](./frontend/design-system/MASTER.md) — полный контракт дизайн-системы

## Команды разработчика

| Что | Backend | Frontend |
|---|---|---|
| Запуск dev | `python manage.py runserver` | `npm run dev` |
| Сборка / миграции | `python manage.py migrate` | `npm run build` |
| Lint | — | `npm run lint` |
| Тесты | `python manage.py test` | _(не настроено)_ |
| Создать суперюзера | `python manage.py createsuperuser` | — |
| Подгрузить демо-данные | `python init_data.py` | — |

## Контрибутинг

См. [`.claude/code-style.md`](./.claude/code-style.md). Кратко:

- Один компонент на файл, `kebab-case` имена, `'use client'` только если нужен хук
- Никаких mock-данных, эмоджи как иконок, raw цветов в UI
- Тёмная тема обязательно проверяется
- При смене API — обновить `frontend/src/shared/types/api.ts`
- Все интерактивные ≥ 44×44, контраст ≥ 4.5:1
- Координаты на бэке — `decimal_places=6`, фронт обязан округлять перед отправкой
- Коммиты: `<type>(<scope>): <subject>`

## Лицензия

Внутренний коммерческий проект. Лицензия не открыта.
