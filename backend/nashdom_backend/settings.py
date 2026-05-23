"""
Django settings for nashdom_backend project.

Production-ready: env-driven (через python-decouple).
В dev работает по дефолтным значениям без .env.
"""

from pathlib import Path
from datetime import timedelta

import dj_database_url
from decouple import Csv, config

BASE_DIR = Path(__file__).resolve().parent.parent

# --- Core ---
SECRET_KEY = config(
    'SECRET_KEY',
    default='django-insecure-o_420r#m7a=#(k=w553mx+0y983^z6zeqs6ui$m-)9^h*5l134',
)
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config(
    'ALLOWED_HOSTS',
    default='localhost,127.0.0.1,0.0.0.0',
    cast=Csv(),
)

# Render и подобные платформы добавляют Host автоматически
RENDER_EXTERNAL_HOSTNAME = config('RENDER_EXTERNAL_HOSTNAME', default='')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)


# --- Apps ---
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'drf_yasg',
    'storages',

    # Local
    'properties',
    'users',
    'contacts',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # отдача staticfiles
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'nashdom_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'nashdom_backend.wsgi.application'


# --- Database ---
# В prod ставим DATABASE_URL (Supabase / любой postgres).
# В dev без .env — fallback на SQLite.
DATABASE_URL = config('DATABASE_URL', default='')
if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
            ssl_require=True,
        ),
    }
    # Supabase Transaction Pooler не поддерживает server-side cursors.
    # Безопаснее всегда выключить — нативные курсоры использует мало кто.
    DATABASES['default']['DISABLE_SERVER_SIDE_CURSORS'] = True
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# --- Auth ---
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

AUTH_USER_MODEL = 'users.User'


# --- I18n ---
LANGUAGE_CODE = 'ru-ru'
TIME_ZONE = 'Asia/Almaty'
USE_I18N = True
USE_TZ = True


# --- Static & Media ---
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Storage backends (Django 4.2 STORAGES dict).
# По умолчанию — локальный диск + WhiteNoise для staticfiles.
# Если включён USE_SUPABASE_STORAGE — медиа уходят в S3-совместимое Supabase Storage.
USE_SUPABASE_STORAGE = config('USE_SUPABASE_STORAGE', default=False, cast=bool)

STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

if USE_SUPABASE_STORAGE:
    SUPABASE_PROJECT_ID = config('SUPABASE_PROJECT_ID')
    SUPABASE_S3_REGION = config('SUPABASE_S3_REGION', default='ap-northeast-1')
    SUPABASE_BUCKET = config('SUPABASE_BUCKET', default='media')

    AWS_ACCESS_KEY_ID = config('SUPABASE_S3_KEY_ID')
    AWS_SECRET_ACCESS_KEY = config('SUPABASE_S3_SECRET')
    AWS_STORAGE_BUCKET_NAME = SUPABASE_BUCKET
    # NB: S3 API живёт на поддомене *.storage.supabase.co (не *.supabase.co).
    # Публичные object-URL — наоборот, на *.supabase.co (см. MEDIA_URL ниже).
    AWS_S3_ENDPOINT_URL = f'https://{SUPABASE_PROJECT_ID}.storage.supabase.co/storage/v1/s3'
    AWS_S3_REGION_NAME = SUPABASE_S3_REGION
    AWS_S3_ADDRESSING_STYLE = 'path'
    AWS_S3_SIGNATURE_VERSION = 's3v4'
    AWS_S3_FILE_OVERWRITE = False
    AWS_DEFAULT_ACL = None
    AWS_QUERYSTRING_AUTH = False  # публичные ссылки

    STORAGES['default'] = {
        'BACKEND': 'storages.backends.s3boto3.S3Boto3Storage',
    }
    # MEDIA_URL — для красивых публичных ссылок
    MEDIA_URL = (
        f'https://{SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/{SUPABASE_BUCKET}/'
    )


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# --- DRF ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'EXCEPTION_HANDLER': 'nashdom_backend.exceptions.custom_exception_handler',
}


# --- JWT ---
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}


# --- CORS / CSRF ---
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000',
    cast=Csv(),
)
# Любые превью-деплои Vercel (и vercel.com на всякий)
CORS_ALLOWED_ORIGIN_REGEXES = [
    r'^https://([a-z0-9-]+\.)*vercel\.app$',
    r'^https://([a-z0-9-]+\.)*vercel\.com$',
]
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000',
    cast=Csv(),
)
# Wildcard-ы для CSRF (Django 4.0+ поддерживает * в hostname)
CSRF_TRUSTED_ORIGINS = list(CSRF_TRUSTED_ORIGINS) + [
    'https://*.vercel.app',
    'https://*.vercel.com',
]


# --- Security (только в prod) ---
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 60 * 60 * 24 * 30  # 30 дней
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_CONTENT_TYPE_NOSNIFF = True


# --- Swagger ---
SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header',
        }
    }
}


# --- Logging (в prod в stdout — Render / любые PaaS читают оттуда) ---
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'simple': {'format': '%(levelname)s %(asctime)s %(name)s: %(message)s'},
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}
