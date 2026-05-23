FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Системные пакеты для Pillow / psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
        libjpeg62-turbo \
        zlib1g \
        libpq5 \
        curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

# Сборка статики на этапе билда (если на этом этапе DATABASE_URL недоступен,
# collectstatic всё равно соберёт файлы — он не требует БД).
RUN python manage.py collectstatic --no-input || true

EXPOSE 8000

# Render передаёт $PORT, локально по умолчанию 8000.
# При старте: миграции → gunicorn.
CMD sh -c "python manage.py migrate --no-input && \
    gunicorn nashdom_backend.wsgi:application \
      --bind 0.0.0.0:${PORT:-8000} \
      --workers 2 \
      --timeout 120 \
      --access-logfile - \
      --error-logfile -"
