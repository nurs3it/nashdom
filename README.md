# NashDom - Веб-приложение витрина недвижимости

## Описание проекта

Современное веб-приложение для риелторской компании с функционалом просмотра, поиска и управления объектами недвижимости.

## Технологический стек

### Frontend
- React + TypeScript
- Next.js 14 (App Router)
- Tailwind CSS
- shadcn/ui
- TanStack Query
- TanStack Table
- Redux Toolkit

### Backend
- Python 3.11+
- Django 4.2+
- Django Rest Framework
- PostgreSQL
- JWT Authentication
- Swagger/OpenAPI

## Структура проекта

```
NashDom/
├── backend/          # Django backend
├── frontend/         # Next.js frontend
├── docker-compose.yml
└── README.md
```

## Запуск проекта

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Функционал

### Пользовательская часть
- Просмотр объектов недвижимости
- Поиск и фильтрация
- Сохранение в избранное
- Авторизация/регистрация
- Заявки на обратную связь

### Админская часть
- Управление объектами
- Управление пользователями
- Статистика и аналитика
- CRUD операции

## API Endpoints

- `/api/auth/` - Авторизация
- `/api/properties/` - Объекты недвижимости
- `/api/favorites/` - Избранное
- `/api/contacts/` - Заявки
- `/api/stats/` - Статистика
