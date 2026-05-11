# CLAUDE.md

Гид для Claude Code при работе в этом репозитории. Если ты редактируешь код — **сначала открой соответствующий под-гид**, не читай весь репозиторий.

## Где что

- **Backend (Django + DRF)** → [`backend/CLAUDE.md`](./backend/CLAUDE.md)
- **Frontend (Next.js 15 + FSD)** → [`frontend/CLAUDE.md`](./frontend/CLAUDE.md)
- **Деплой (Vercel + Render + Supabase)** → [`DEPLOYMENT.md`](./DEPLOYMENT.md)
- **Дизайн-система (контракт)** → [`frontend/design-system/MASTER.md`](./frontend/design-system/MASTER.md)
- **Архитектура / стек / фичи / стиль** → [`.claude/`](./.claude/)
  - [`architecture.md`](./.claude/architecture.md) — слои, поток данных, граница backend↔frontend
  - [`technologies.md`](./.claude/technologies.md) — стек и обоснование выбора
  - [`features.md`](./.claude/features.md) — инвентарь функционала
  - [`code-style.md`](./.claude/code-style.md) — конвенции и анти-паттерны
  - [`business.md`](./.claude/business.md) — доменная модель и роли
  - [`design-system.md`](./.claude/design-system.md) — краткий обзор + ссылки

## TL;DR

NashDom — маркетплейс недвижимости (продажа / аренда / посуточно / коммерция) для Казахстана. Аналог krisha.kz / etazhi.kz, но с упором на тёплый, человечный UX.

- **Backend:** Django 4.2 + DRF, JWT (SimpleJWT), Swagger, SQLite в dev / PostgreSQL в prod, медиа-файлы локально.
- **Frontend:** Next.js 15 (App Router, Turbopack), React 19, Tailwind v4, shadcn/ui, TanStack Query, Redux Toolkit, Leaflet (карты).
- **Архитектура frontend:** Feature-Sliced Design (`app / pages / widgets / features / entities / shared`).
- **Дизайн-система:** «Terra» — терракот + охра на песочной нейтральной базе, Manrope (UI) + Unbounded (display), light + dark.
- **Роли:** `client` (поиск + избранное), `realtor` (+ свои объявления), `superadmin` (+ модерация).

## Common commands (быстро)

```bash
# Backend
cd backend && source venv/bin/activate
python manage.py runserver         # http://localhost:8000  (Swagger /swagger/)
python manage.py makemigrations && python manage.py migrate
python init_data.py                # seed demo accounts (admin@/realtor@/client@nashdom.kz : *123)
python manage.py test              # tests

# Frontend
cd frontend
npm run dev                        # http://localhost:3000  (Turbopack)
npm run build
npm run lint
```

Подробности и ловушки — в под-CLAUDE.md. **Не дублируй здесь** то что есть там.

## Жёсткие правила

- **Язык UI и комментариев — русский.** Технические идентификаторы — английские.
- **Никаких mock-данных в продуктовом UI.** Только real-time через API. Если фича ещё не на бэке — empty-state с пояснением, а не выдуманные числа.
- **Цвета через токены.** Никаких raw hex в компонентах — только `bg-primary`, `text-foreground`, `border-border` и т.д. Tokens живут в `frontend/src/app/globals.css`.
- **Темы синхронны.** Если меняешь стиль для light — проверь dark.
- **Touch target ≥ 44×44**, focus ring видимый, контраст ≥ 4.5:1.
- **Tabular-nums для цен и статистики** — выравнивание чисел в колонках.
- **Координаты округляй до 6 знаков** перед отправкой на бэк (`max_digits=9, decimal_places=6`).
- Не комитить `backend/.env`, `backend/db.sqlite3`, `backend/media/`, `frontend/node_modules/`, `frontend/.next/` — всё в `.gitignore`.
