# Инструкция по запуску NashDom

## Требования

- Python 3.9+
- Node.js 18+
- PostgreSQL 12+ (опционально, можно использовать SQLite для разработки)

## Быстрый старт

### 1. Клонирование и подготовка

```bash
# Переходим в директорию проекта
cd NashDom
```

### 2. Настройка Backend (Django)

```bash
# Переходим в директорию backend
cd backend

# Создаем виртуальное окружение
python3 -m venv venv

# Активируем виртуальное окружение
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate     # Windows

# Устанавливаем зависимости
pip install -r requirements.txt

# Создаем файл с переменными окружения
cp env.example .env

# Выполняем миграции
python manage.py makemigrations
python manage.py migrate

# Инициализируем базовые данные
python init_data.py

# Запускаем сервер разработки
python manage.py runserver
```

Backend будет доступен по адресу: http://localhost:8000

### 3. Настройка Frontend (Next.js)

Откройте новый терминал:

```bash
# Переходим в директорию frontend
cd frontend

# Устанавливаем зависимости
npm install

# Создаем файл с переменными окружения
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Запускаем сервер разработки
npm run dev
```

Frontend будет доступен по адресу: http://localhost:3000

## Доступы для тестирования

После инициализации данных будут созданы следующие аккаунты:

- **Администратор**: admin@nashdom.kz / admin123
- **Риелтор**: realtor@nashdom.kz / realtor123
- **Клиент**: client@nashdom.kz / client123

## Документация API

После запуска backend, API документация будет доступна по адресам:
- Swagger UI: http://localhost:8000/swagger/
- ReDoc: http://localhost:8000/redoc/

## Структура проекта

```
NashDom/
├── backend/                 # Django backend
│   ├── nashdom_backend/    # Основные настройки Django
│   ├── users/              # Приложение пользователей
│   ├── properties/         # Приложение недвижимости
│   ├── contacts/           # Приложение контактов
│   ├── requirements.txt    # Python зависимости
│   └── init_data.py       # Скрипт инициализации данных
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # App Router страницы
│   │   ├── shared/        # Общие компоненты и утилиты
│   │   ├── entities/      # Бизнес-сущности
│   │   ├── features/      # Функциональные компоненты
│   │   ├── widgets/       # Композитные компоненты
│   │   └── pages/         # Страницы приложения
│   └── package.json       # Node.js зависимости
└── docker-compose.yml     # Docker конфигурация
```

## Запуск через Docker (опционально)

```bash
# Запуск всех сервисов
docker-compose up --build

# Выполнение миграций в контейнере
docker-compose exec backend python manage.py migrate

# Инициализация данных в контейнере
docker-compose exec backend python init_data.py
```

## Основные функции

### Пользовательская часть:
- ✅ Просмотр списка объектов недвижимости
- ✅ Поиск и фильтрация по параметрам
- ✅ Просмотр деталей объекта
- ✅ Авторизация и регистрация
- ✅ Добавление в избранное (для авторизованных)
- ✅ Подписка на рассылку
- ✅ Отправка заявок на обратную связь

### Админская часть:
- ✅ Панель администратора с статистикой
- ✅ Управление объектами через Django Admin
- ✅ Управление пользователями
- ✅ Просмотр и обработка заявок
- ✅ REST API для всех операций

### Технические особенности:
- ✅ Современный UI с shadcn/ui компонентами
- ✅ Адаптивный дизайн
- ✅ JWT авторизация
- ✅ Swagger документация API
- ✅ Feature-Sliced Design архитектура
- ✅ TypeScript для типобезопасности
- ✅ TanStack Query для работы с API

## Разработка

### Backend:
```bash
# Создание новых миграций
python manage.py makemigrations

# Создание суперпользователя
python manage.py createsuperuser

# Сбор статических файлов
python manage.py collectstatic
```

### Frontend:
```bash
# Проверка типов
npm run type-check

# Линтинг
npm run lint

# Сборка для продакшена
npm run build
```

## Решение проблем

### Backend не запускается:
1. Проверьте, что виртуальное окружение активировано
2. Убедитесь, что все зависимости установлены: `pip install -r requirements.txt`
3. Проверьте настройки базы данных в `.env`

### Frontend не запускается:
1. Убедитесь, что Node.js версии 18+ установлен
2. Очистите кэш: `npm cache clean --force`
3. Переустановите зависимости: `rm -rf node_modules package-lock.json && npm install`

### Ошибки CORS:
1. Убедитесь, что в настройках Django добавлен правильный URL фронтенда
2. Проверьте настройки `CORS_ALLOWED_ORIGINS` в `settings.py`

## Контакты

При возникновении вопросов или проблем, создайте issue в репозитории проекта.
