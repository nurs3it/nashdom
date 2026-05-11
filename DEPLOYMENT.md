# Deployment

Развёртывание NashDom на бесплатных тарифах: **Supabase** (БД + Storage) → **Render** (backend) → **Vercel** (frontend).

Время: **30–45 минут** при первом проходе. Все три сервиса бесплатны и регистрируются через GitHub.

---

## 0. Чек-лист перед стартом

- [x] Аккаунты: [github.com](https://github.com) (есть), [supabase.com](https://supabase.com), [render.com](https://render.com), [vercel.com](https://vercel.com)
- [x] Репозиторий запушен в GitHub: `git@github.com:nurs3it/nashdom.git`
- [x] Локально работает (`backend/.env` + `frontend/.env.local` уже настроены)
- [ ] Кошелёк для тестов карты (не понадобится — все три без карты)

---

## 1. Supabase — БД и Storage

### 1.1 Создать проект
1. Зайди на [supabase.com](https://supabase.com) → New Project
2. **Name:** `nashdom`
3. **Database password:** уже придумал (`Nurseiit123!`) — сохрани в менеджере паролей
4. **Region:** `ap-northeast-1` (Tokyo) — ближе к KZ
5. Жди 1-2 минуты пока проект развернётся

### 1.2 Получить connection string
1. Project Settings → **Database** → секция **Connection string**
2. Тип подключения — **Transaction Pooler** (для serverless / коротких коннектов)
3. URL вида: `postgresql://postgres.alwwbhigzkzxeyzkpiop:[YOUR-PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres`
4. Подставь реальный пароль на место `[YOUR-PASSWORD]` (если в нём `!` — может потребоваться URL-encode `%21`)

### 1.3 (опционально) Настроить Storage для медиа
Можно отложить — на старте Render отдаёт media с локального диска. Но **диск Render эфемерный** — при каждом редеплое медиа пропадают. Когда соберёшь >5 объявлений — обязательно перейди на Supabase Storage.

1. Storage → **New bucket** → name `media` → **Public** ✓ → Create
2. Project Settings → **Storage** → **S3 Connection** (или API Settings → S3) → Generate new keys
3. Сохрани:
   - **Access Key ID:** `…`
   - **Secret Access Key:** `…`
   - **Region:** `ap-northeast-1`
   - **Endpoint:** `https://alwwbhigzkzxeyzkpiop.supabase.co/storage/v1/s3`

---

## 2. Render — Django backend

### 2.1 Создать Web Service
1. [render.com](https://dashboard.render.com) → **New +** → **Web Service**
2. **Connect a repository** → авторизуй GitHub → выбери `nurs3it/nashdom`
3. Заполни:

| Поле | Значение |
|---|---|
| **Name** | `nashdom-backend` |
| **Region** | `Singapore` (ближе к KZ) или `Frankfurt` |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `./build.sh` |
| **Start Command** | `gunicorn nashdom_backend.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 60` |
| **Instance Type** | `Free` |

4. **Advanced** → Auto-Deploy → `Yes` (auto-deploy при пуше в main)

### 2.2 Environment Variables
Раскрой **Environment** и добавь:

| Key | Value |
|---|---|
| `SECRET_KEY` | сгенерируй: `python -c "import secrets; print(secrets.token_urlsafe(50))"` |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `nashdom-backend.onrender.com` (или твоё имя сервиса) |
| `DATABASE_URL` | строка из Supabase шага 1.2 |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` (Vercel-домены автоматически разрешены regex'ом) |
| `CSRF_TRUSTED_ORIGINS` | оставь пустым (default + wildcard для vercel) |
| `USE_SUPABASE_STORAGE` | `False` пока (или `True` если уже сделал шаг 1.3) |

Если `USE_SUPABASE_STORAGE=True`, добавь:
| `SUPABASE_PROJECT_ID` | `alwwbhigzkzxeyzkpiop` |
| `SUPABASE_BUCKET` | `media` |
| `SUPABASE_S3_REGION` | `ap-northeast-1` |
| `SUPABASE_S3_KEY_ID` | из шага 1.3 |
| `SUPABASE_S3_SECRET` | из шага 1.3 |

### 2.3 Создать сервис → ждать билд
1. Жми **Create Web Service**
2. Render запустит `./build.sh` (pip install + collectstatic + migrate)
3. Логи в реальном времени в табе **Logs**
4. Первый билд ~5-7 минут
5. Когда увидишь `Your service is live` — открой URL: `https://nashdom-backend.onrender.com/swagger/` — должна быть Swagger-страница

### 2.4 Засеять демо-данные (одноразово)
Render → твой сервис → **Shell** (правое меню):
```bash
python init_data.py
python manage.py createsuperuser  # опционально, для /admin/
```

### 2.5 Особенности Render Free
- Сервис **засыпает после 15 мин простоя**. Первый запрос после сна — ~30 секунд (cold start). Потом быстро.
- Ограничение **750 часов/месяц** — сервис проработает весь месяц, если он один.
- Чтобы не засыпал — настрой [UptimeRobot](https://uptimerobot.com) (бесплатно): пинг `https://nashdom-backend.onrender.com/api/properties/` каждые 5-10 минут.

---

## 3. Vercel — Next.js frontend

### 3.1 Импорт проекта
1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → выбери `nurs3it/nashdom`
2. **Configure Project**:

| Поле | Значение |
|---|---|
| **Framework Preset** | Next.js (auto-detected) |
| **Root Directory** | `frontend` (нажми Edit → выбери папку) |
| **Build Command** | `npm run build` (default) |
| **Output Directory** | `.next` (default) |
| **Install Command** | `npm install` (default) |

### 3.2 Environment Variables
Раскрой **Environment Variables**:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://nashdom-backend.onrender.com` (Render URL из шага 2.3) |

### 3.3 Deploy → ждать
1. Жми **Deploy**
2. Билд ~2-3 минуты
3. URL: `https://nashdom-XXXX.vercel.app` (или просто `nashdom.vercel.app` если занят — выбери другое имя в Settings → Domains)

### 3.4 Проверить связку
- Открой свой Vercel-URL
- Главная должна загрузиться
- В DevTools → Network — запросы на `https://nashdom-backend.onrender.com/api/...` идут со статусом 200, без CORS-ошибок
- Если cold-start — первый запрос будет 30 сек, потом всё мгновенно

---

## 4. Custom domain (опционально, позже)

### 4.1 Frontend (Vercel) — `nashdom.kz`
1. Купи домен (`reg.kz`, `ps.kz`, `namecheap.com`)
2. Vercel → Project → **Settings → Domains** → Add `nashdom.kz` и `www.nashdom.kz`
3. Vercel покажет какие DNS-записи добавить (A или CNAME) — пропиши у регистратора
4. SSL автоматически через 5-30 минут

### 4.2 Backend (Render) — `api.nashdom.kz`
1. Render → Service → **Settings → Custom Domain** → Add `api.nashdom.kz`
2. CNAME у регистратора → `nashdom-backend.onrender.com`
3. После активации добавь `api.nashdom.kz` в `ALLOWED_HOSTS` env (Render → Environment → Edit)
4. На фронте поменяй `NEXT_PUBLIC_API_URL` → `https://api.nashdom.kz` (Vercel → Environment Variables → Edit → Redeploy)

---

## 5. Что после первого деплоя

### 5.1 Auto-deploy при пуше
- **Push в `main`** → Vercel и Render обе пересобирают автоматически (если включён auto-deploy в обеих)
- Vercel также делает **Preview Deployments** для каждой PR / ветки — уникальный URL вида `nashdom-git-feature-foo-nurs3it.vercel.app`. CORS на бэке настроен через regex `*.vercel.app`, превью работают сразу.

### 5.2 Мониторинг и логи
- **Render Logs** — Service → Logs (real-time)
- **Vercel Logs** — Project → Deployments → выбери deploy → Logs
- **Supabase** — Project → Logs / Database / API logs

### 5.3 Бэкап БД
- Supabase Free: автоматический daily backup, 7 дней retention
- Дополнительно: `pg_dump` через Render Shell в Supabase Storage раз в неделю (cron-job.org бесплатный)

---

## 6. Troubleshooting

### Backend не стартует на Render
- Проверь логи (Logs табе)
- Самые частые: 
  - `DATABASE_URL` неправильный — проверь пароль (URL-encode `!` если нужно)
  - `SECRET_KEY` забыл задать
  - `ALLOWED_HOSTS` не содержит `*.onrender.com`
- `python manage.py check --deploy` локально с `DEBUG=False` поймает большинство проблем

### CORS ошибки на фронте
- Проверь Render env: `CORS_ALLOWED_ORIGINS` может содержать кастомный домен. Vercel-домены автоматически через regex.
- Если custom domain — добавь его в `CORS_ALLOWED_ORIGINS` И `CSRF_TRUSTED_ORIGINS`.

### Медиа не загружаются
- Если `USE_SUPABASE_STORAGE=False`: после редеплоя Render все файлы пропали (диск эфемерный). Включай Storage.
- Если `True`: проверь bucket `media` существует и **Public**, S3-keys свежие.

### Vercel build fails
- Чаще всего — TS-ошибки. ESLint у нас отключён при build (`next.config.js`), но типы строгие. Локально: `npm run build`.
- Если падает на missing env var — проверь что все `NEXT_PUBLIC_*` есть в Vercel → Environment Variables.

### Supabase pause
- Free-tier пауза при 7 днях бездействия. Открой Dashboard → unpause. Чтобы избежать — UptimeRobot пинг (см. 2.5).

### `aws-1-ap-northeast-1` slow для Render Singapore
- Если БД-запросы тормозят — пересоздай Supabase в `ap-southeast-1` (Singapore) и поменяй `DATABASE_URL`.

---

## 7. Структура prod-окружения (итог)

```
┌──────────────────────────────────────────────────────┐
│ Browser (KZ user)                                    │
└──────────────────┬───────────────────────────────────┘
                   │ HTTPS
                   ▼
┌──────────────────────────────────────────────────────┐
│  Vercel — frontend                                   │
│  https://nashdom.vercel.app                          │
│  Next.js 15 SSR + edge-кэш                           │
└──────────────────┬───────────────────────────────────┘
                   │ HTTPS / JSON / JWT
                   ▼
┌──────────────────────────────────────────────────────┐
│  Render — backend                                    │
│  https://nashdom-backend.onrender.com                │
│  Django + gunicorn (2 workers)                       │
│  Free tier: 512 MB RAM, sleep после 15 мин          │
└──────┬─────────────────────────────┬─────────────────┘
       │ postgres SSL                 │ S3 (boto3)
       ▼                              ▼
┌─────────────────────┐  ┌──────────────────────────┐
│ Supabase Postgres   │  │ Supabase Storage         │
│ Tokyo region        │  │ Public bucket "media"    │
│ Transaction pooler  │  │ ~1 GB free               │
│ 500 MB free         │  │                          │
└─────────────────────┘  └──────────────────────────┘
```

---

## 8. Стоимость

- **Сейчас:** $0/мес (бессрочно, пока проекты активны)
- **Когда упрёмся в лимиты:**
  - Supabase Pro $25/мес — 8 GB БД, 100 GB Storage, no pause
  - Render Standard $7/мес за инстанс — нет cold-start, 512 MB → 2 GB RAM
  - Vercel Pro $20/мес — нужен только для коммерческих проектов с >100k req/мес
- Реалистичный прогноз: **первые 6-12 месяцев — $0**, потом $7-25/мес

---

## Контрольный чек-лист после деплоя

- [ ] `https://nashdom-backend.onrender.com/swagger/` открывается
- [ ] `https://nashdom-backend.onrender.com/admin/` открывается, можно залогиниться superuser-ом
- [ ] `https://nashdom.vercel.app/` открывается, главная рендерится
- [ ] Каталог `/properties` показывает реальные объявления из Supabase
- [ ] Логин под `client@nashdom.kz / client123` работает (после `init_data.py`)
- [ ] Toggle темы переключает свет/тьму
- [ ] Загрузка фото объявления работает (если Supabase Storage включён — фото в bucket'е)
- [ ] DevTools Network: нет CORS-ошибок
