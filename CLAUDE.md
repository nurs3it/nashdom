# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

NashDom — real-estate listing web app. Django REST API backend + Next.js (App Router) frontend. Two top-level workspaces: `backend/` and `frontend/`.

## Commands

### Backend (Django, Python 3.9+)
Run from `backend/` with `venv` activated (`source venv/bin/activate`):
```bash
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python init_data.py            # seeds demo users + base data; idempotent-ish entry point
python manage.py runserver     # http://localhost:8000
python manage.py test          # runs Django tests; single app: python manage.py test properties
python manage.py test properties.tests.SomeTest.test_method   # single test
python manage.py createsuperuser
```
- Swagger: `http://localhost:8000/swagger/`, ReDoc: `/redoc/`.
- `.env` is copied from `backend/env.example`. SQLite (`db.sqlite3`) is the default dev DB; PostgreSQL is supported via env vars.

### Frontend (Next.js 15, React 19, Turbopack)
Run from `frontend/`:
```bash
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev          # http://localhost:3000 (Turbopack)
npm run build        # production build (Turbopack)
npm run lint         # ESLint (eslint-config-next)
```
There is no `type-check` script and no test runner configured on the frontend — do not invent one. Type errors surface via `next build` / editor.

### Docker
`docker-compose up --build` from the repo root brings up backend + frontend together; run migrations / seed inside the container with `docker-compose exec backend python manage.py migrate` and `... init_data.py`.

## Architecture

### Backend layout (`backend/`)
Three Django apps mounted under `/api/`:
- `users/` — custom `User` model with role field (`client` / `realtor` / `admin`), JWT auth (SimpleJWT). Permissions live in `users/permissions.py` (`IsOwnerOrReadOnly`, `IsOwnerOrAdmin`, `IsAdminUser`, `IsRealtorOrAdmin`) and are reused across apps.
- `properties/` — listings + favorites. `filters.py` defines the django-filter set used by the list endpoint; `serializers.py` splits into list/detail/create variants. URLs split CRUD across distinct paths (e.g. `properties/create/`, `properties/{id}/update/`, `properties/{id}/delete/`, `properties/my/`, `properties/my/stats/`, `properties/stats/`, `properties/{id}/favorite/`, `properties/favorites/`, `properties/featured/`) — when adding endpoints, follow this explicit-path style rather than introducing a `ViewSet`/`DefaultRouter`.
- `contacts/` — feedback / contact requests.

Project config in `nashdom_backend/`: `settings.py`, plus shared `mixins.py` and `exceptions.py` (custom DRF exception handler — extend it instead of writing per-view try/except).

Media uploads land in `backend/media/` and are served in `DEBUG` mode only.

### Frontend layout (`frontend/src/`)
Feature-Sliced Design layered structure. **Respect the import direction**: lower layers must not import from higher layers.
```
app/        Next.js App Router routes (admin, auth, dashboard, favorites, profile, properties, …)
            + providers/  global providers (React Query, Redux, theme)
            + styles/     globals
pages/      page-level compositions (FSD "pages" layer — distinct from app/ routes)
widgets/    composite UI blocks
features/   user-facing interactions (forms, dialogs, mutations)
entities/   domain models (property, user, contact) — types, API hooks, presentational components
shared/     api client, config, hooks, lib, types, ui (shadcn/ui primitives)
components/ legacy / app-shell components (check before adding here; prefer FSD layers)
lib/        legacy utility location (same — prefer shared/lib)
```
Stack notes:
- shadcn/ui primitives live in `shared/ui` (config in `components.json`). When adding shadcn components, place them there rather than in `components/`.
- TanStack Query is the source of truth for server state; Redux Toolkit is used for client/UI state only — don't duplicate server state into Redux.
- Tailwind v4 with `@tailwindcss/postcss`; no `tailwind.config.*` — theme tokens are in `app/globals.css` / `app/styles/`.
- Two Next config files exist (`next.config.js` and `next.config.ts`). Confirm which one Next is loading before editing — Next prefers `.ts` when both are present in v15, but verify before assuming.
- Auth tokens (JWT) are stored in `localStorage`; the API client in `shared/api` attaches them. Protected routes redirect to `/auth/login` on missing/invalid token.
- API base URL comes from `NEXT_PUBLIC_API_URL`.

### API surface (mounted under `/api/`)
- `auth/` — login/register/refresh, profile.
- `properties/` — CRUD + `my/`, `my/stats/`, `stats/` (admin), `featured/`, `favorites/`, `{id}/favorite/`.
- `contacts/` — contact-request submission and admin listing.

### Demo accounts (seeded by `init_data.py`)
- `admin@nashdom.kz / admin123` (admin)
- `realtor@nashdom.kz / realtor123` (realtor)
- `client@nashdom.kz / client123` (client)

## Conventions

- Project documentation, commit messages, UI copy, and code comments are in **Russian**. Match that when editing user-facing strings or docs.
- When adding a property field: model → migration → serializer (list/detail/create as relevant) → `filters.py` if filterable → frontend `entities/property` types → form in `features/`.
- Permission checks belong in `users/permissions.py` and are applied at the view level — don't reimplement role checks in serializers or business logic.
