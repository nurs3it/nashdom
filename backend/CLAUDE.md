# backend/CLAUDE.md

Гид по Django-бэкенду NashDom. Рассчитано на быструю ориентацию: «куда смотреть, чтобы изменить N».

## Стек

Django 4.2 + DRF + SimpleJWT + django-filter + drf-yasg (Swagger) + django-cors-headers + Pillow.
БД: SQLite в dev (`db.sqlite3`), PostgreSQL поддержан через env. Медиа: локально в `media/`.

## Запуск

```bash
cd backend
source venv/bin/activate          # python -m venv venv → pip install -r requirements.txt
cp env.example .env               # одноразово
python manage.py migrate
python init_data.py               # seed: types, services, demo users (idempotent)
python manage.py runserver        # http://localhost:8000
```

Документация API:
- Swagger: http://localhost:8000/swagger/
- ReDoc: http://localhost:8000/redoc/
- Django admin: http://localhost:8000/admin/

Демо-аккаунты (после `init_data.py`):
- `admin@nashdom.kz / admin123` — superadmin
- `realtor@nashdom.kz / realtor123` — realtor
- `client@nashdom.kz / client123` — client

## Структура

```
backend/
├── nashdom_backend/        # config: settings, urls, exceptions, mixins
│   ├── settings.py         # настройки (DB, CORS, JWT, REST_FRAMEWORK)
│   ├── urls.py             # корневой urlconf, монтирует /api/* и /swagger/
│   ├── exceptions.py       # кастомный DRF exception_handler
│   └── mixins.py           # переиспользуемые mixins для views
├── users/                  # User модель, JWT auth, профиль, админ-статистика
│   ├── models.py           # User(AbstractUser) с role и is_verified
│   ├── permissions.py      # IsOwnerOrReadOnly, IsOwnerOrSuperAdmin, IsRealtorOrSuperAdmin
│   ├── serializers.py
│   ├── views.py            # APIViews (не ViewSets)
│   └── urls.py             # /api/auth/*
├── properties/             # Объявления, типы, услуги, изображения, избранное
│   ├── models.py           # Property + PropertyType + ServiceType + PropertyImage + Favorite
│   ├── serializers.py      # List / Detail / CreateUpdate / Image / Favorite
│   ├── filters.py          # django-filter PropertyFilter
│   ├── views.py            # APIViews по одной на endpoint (не Router/ViewSet)
│   └── urls.py             # /api/properties/*
├── contacts/               # Заявки и newsletter
│   ├── models.py           # ContactRequest, NewsletterSubscription
│   └── urls.py             # /api/contacts/*
├── media/                  # uploaded files (НЕ в git)
└── init_data.py            # seed-скрипт; запускать после migrate
```

## Архитектурные решения

### URL-style: explicit paths, не Router/ViewSet
CRUD не через `DefaultRouter`+`ModelViewSet`, а через **отдельные APIView на каждый endpoint** — `properties/create/`, `properties/<id>/update/`, `properties/<id>/delete/`. Так удобнее точечно настраивать permissions и понятно из URL что делает endpoint. Сохраняй стиль при добавлении новых endpoints.

### User модель: AbstractUser + role
`USERNAME_FIELD = 'email'`, дополнительные поля: `phone`, `role` (`client`/`realtor`/`superadmin`), `avatar`, `is_verified`. **Нет отдельной таблицы Realtor/Client** — всё через role + permissions.

### Permissions: централизовано в `users/permissions.py`
- `IsOwnerOrReadOnly` — все читают, владелец редактирует
- `IsOwnerOrAdmin` / `IsOwnerOrSuperAdmin` — владелец или админ
- `IsAdminUser` — только superadmin
- `IsRealtorOrAdmin` / `IsRealtorOrSuperAdmin` — риелторы и админы

**Не реализовывай ролевые проверки в serializers или views** — расширяй классы permissions.

### Сериализаторы: разделение List / Detail / CreateUpdate
- `PropertyListSerializer` — компактный, для каталога (список)
- `PropertyDetailSerializer` — полный с owner, images, is_favorited
- `PropertyCreateUpdateSerializer` — write-only поля (uploaded_images), вложенное создание PropertyImage

При добавлении поля в Property — обнови **все три** сериализатора.

### Custom exception handler
`nashdom_backend/exceptions.py` оборачивает все DRF-ошибки в формат:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "...",
    "field_errors": { "field_name": "..." }
  }
}
```
Frontend хук `useFormErrors` рассчитан на этот формат. **Не выбрасывай голые exception в views** — они автоматически попадут в правильную форму.

## API map

### `/api/auth/`
| Метод | Path | Назначение |
|---|---|---|
| POST | `register/` | Регистрация (client/realtor) |
| POST | `login/` | JWT pair |
| POST | `token/refresh/` | Refresh токена |
| GET, PATCH | `profile/` | Свой профиль |
| POST | `change-password/` | Смена пароля |
| GET | `stats/` | UserStats (для админа) |

### `/api/properties/`
| Метод | Path | Permissions |
|---|---|---|
| GET | `types/` | Типы недвижимости (Квартира/Дом/…) |
| GET | `services/` | Виды услуг (Продажа/Аренда/…) |
| GET | `` | Список (фильтры через querystring) |
| GET | `featured/` | Рекомендуемые |
| POST | `create/` | Создание (auth) |
| GET | `<id>/` | Детали (увеличивает views_count) |
| PUT/PATCH | `<id>/update/` | Обновление (owner или admin) |
| DELETE | `<id>/delete/` | Удаление (owner или admin) |
| POST | `<id>/favorite/` | Toggle избранное |
| GET | `favorites/` | Свои избранные |
| GET | `my/` | Свои объявления |
| GET | `my/stats/` | PropertyStats для текущего user |
| GET | `stats/` | Общая статистика (admin only) |

Фильтры (django-filter, см. `filters.py`): `property_type`, `service_type`, `city`, `price_min/max`, `area_min/max`, `rooms_min/max`, `has_parking`, `has_balcony`, `has_elevator`, `is_featured`, `status`, `search`, `ordering`.

### `/api/contacts/`
| Метод | Path | Назначение |
|---|---|---|
| POST | `requests/` | Создать заявку |
| GET | `requests/list/` | Все заявки (admin) |
| PATCH | `requests/<id>/update/` | Обновить статус (admin) |
| GET | `requests/my/` | Свои заявки |
| POST | `newsletter/subscribe/` | Подписка |
| GET | `newsletter/unsubscribe/<email>/` | Отписка |
| GET | `stats/` | ContactStats (admin) |

## Конвенции

### Добавление поля в Property
1. `models.py` — поле + verbose_name (русский)
2. `python manage.py makemigrations properties && migrate`
3. `serializers.py` — добавь в `fields` всех трёх сериализаторов
4. `filters.py` — если нужно фильтровать
5. `admin.py` — в нужный fieldset
6. **Frontend:** `frontend/src/shared/types/api.ts` (тип) → форма → карточка → каталог

### Имена
- Поля БД: `snake_case`, по-английски
- `verbose_name` — на русском (для admin и Swagger)
- Permissions классы: `Is...` (`IsOwnerOrAdmin`)
- Views: `<Resource><Action>View` (`PropertyCreateView`)

### Что НЕ делать
- Не переноси логику в `models.py` (кроме helper-методов типа `increment_views()`). Бизнес — в serializers/views.
- Не используй `ModelViewSet`/`DefaultRouter` — стиль проекта явный.
- Не пиши собственный try/except для DRF-ошибок — пользуйся exception_handler.
- Не храни роли как `is_realtor=True` — только через `User.role`.
- Не редактируй migrations вручную — `makemigrations` после изменений в моделях.

## Координаты на карте

`Property.latitude` / `Property.longitude` — `DecimalField(max_digits=9, decimal_places=6)`. Это даёт **3 знака до точки + 6 после** (диапазон ±999.999999) — хватает для KZ. Frontend обязан **округлять до 6 знаков** перед отправкой, иначе валидация упадёт. Если нужно больше точности — миграция с `max_digits=10, decimal_places=7`.
