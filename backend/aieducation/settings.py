import os
from pathlib import Path
from dotenv import load_dotenv

# Base dir and dotenv
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / '.env')

# SECURITY: secret from env, fallback for local dev
SECRET_KEY = os.getenv('SECRET_KEY', 'unsafe-secret-for-dev')
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

# ALLOWED_HOSTS: env-driven plus safe defaults; strip ports and ignore numeric entries
_raw_hosts = os.getenv('ALLOWED_HOSTS', '').strip()

def _normalize_host(h: str) -> str | None:
    h = h.strip()
    if not h:
        return None
    # Split out accidental port entries like "example.com:8000" or bare "8000"
    if ':' in h:
        h = h.split(':', 1)[0].strip()
    # Ignore pure numeric leftovers
    if h.isdigit():
        return None
    return h

env_hosts = []
if _raw_hosts:
    env_hosts = [x for x in (_normalize_host(h) for h in _raw_hosts.split(',')) if x]

base_hosts = ['.up.railway.app', 'localhost', '127.0.0.1', '0.0.0.0']

# Merge env + base (preserve order, remove duplicates)
ALLOWED_HOSTS = list(dict.fromkeys([*env_hosts, *base_hosts])) or ['localhost', '127.0.0.1']

# Consolidated CORS/CSRF configuration (env-driven)
# CORS_ALLOW_ALL_ORIGINS can be enabled in development via env
CORS_ALLOW_ALL_ORIGINS = os.getenv('CORS_ALLOW_ALL_ORIGINS', 'False').lower() == 'true'
CORS_ALLOW_CREDENTIALS = os.getenv('CORS_ALLOW_CREDENTIALS', 'True').lower() == 'true'

# Build CORS_ALLOWED_ORIGINS from env or FRONTEND_URL; allow common local dev origins when DEBUG
_raw_cors = os.getenv('CORS_ALLOWED_ORIGINS', '').strip()
if _raw_cors:
    CORS_ALLOWED_ORIGINS = [x.strip().rstrip('/') for x in _raw_cors.split(',') if x.strip()]
else:
    _frontend = os.getenv('FRONTEND_URL', '').strip().rstrip('/')
    local_origins = [
        'http://localhost:3000', 'http://127.0.0.1:3000',
        'http://localhost:5173', 'http://127.0.0.1:5173',
    ]
    CORS_ALLOWED_ORIGINS = [*(local_origins if DEBUG and not _frontend else []), *([_frontend] if _frontend else [])]

# Allowed methods & headers
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# CSRF trusted origins should mirror allowed CORS origins when using separate frontend host
CSRF_TRUSTED_ORIGINS = [u.rstrip('/') for u in CORS_ALLOWED_ORIGINS if u]

# If no explicit CORS_ALLOWED_ORIGINS are configured, allow common Railway subdomains
# and local dev hosts via regex. This helps when env vars are not set in the deployment.
_raw_cors_regex = os.getenv('CORS_ALLOWED_ORIGIN_REGEXES', '').strip()
if _raw_cors_regex:
    # support comma-separated regex list from env
    CORS_ALLOWED_ORIGIN_REGEXES = [r.strip() for r in _raw_cors_regex.split(',') if r.strip()]
else:
    # Default regexes for common dev and deployment hosts, including local LAN ranges
    CORS_ALLOWED_ORIGIN_REGEXES = [
        r"^https?://.*\.up\.railway\.app(:\d+)?$",
        r"^https?://localhost(:\d+)?$",
        r"^https?://127\.0\.0\.1(:\d+)?$",
        # Private LAN ranges to support dev from another device on the network
        r"^https?://10(?:\.\d+){3}(:\d+)?$",
        r"^https?://192\.168(?:\.\d+){2}(:\d+)?$",
        r"^https?://172\.(1[6-9]|2\d|3[0-1])(?:\.\d+){2}(:\d+)?$",
    ]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'django_extensions',
    'accounts',
    'education',
    'payments',
    'notifications',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    # Static files via WhiteNoise in production
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'aieducation.urls'

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

WSGI_APPLICATION = 'aieducation.wsgi.application'

# Database configuration
# - USE_SQLITE=True in .env to force local SQLite for development
# - Otherwise, use Postgres from env (Railway PG* or Supabase-style env names)
def _env(name: str, default: str | None = None) -> str | None:
    # support both UPPER and lower case keys present in some env templates
    return os.getenv(name) or os.getenv(name.lower(), default)

USE_SQLITE = (_env('USE_SQLITE', 'False').lower() == 'true') or False

pg_name = _env('PGDATABASE', _env('dbname'))
pg_user = _env('PGUSER', _env('user'))
pg_password = _env('PGPASSWORD', _env('password'))
pg_host = _env('PGHOST', _env('host'))
pg_port = _env('PGPORT', _env('port', '5432'))

DATABASES = {}

if USE_SQLITE or not (pg_name and pg_user and pg_host):
    # Local development default when env is incomplete or forced
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
else:
    # Remote/local Postgres with optional SSL
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': pg_name or 'postgres',
        'USER': pg_user or 'postgres',
        'PASSWORD': pg_password or '',
        'HOST': pg_host or 'localhost',
        'PORT': pg_port or '5432',
        'OPTIONS': {},
    }

    # Enable SSL by default for non-local hosts (e.g., Supabase pooler)
    host_norm = (pg_host or '').strip().lower()
    is_local_host = host_norm in ('localhost', '127.0.0.1', '') or host_norm.endswith('.local')
    sslmode = _env('DB_SSLMODE') or (_env('PGSSLMODE')) or (None if is_local_host else 'require')
    if sslmode:
        DATABASES['default']['OPTIONS']['sslmode'] = sslmode

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'ru-ru'
TIME_ZONE = 'Europe/Moscow'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# File Upload Settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10MB
FILE_UPLOAD_PERMISSIONS = 0o644
FILE_UPLOAD_DIRECTORY_PERMISSIONS = 0o755

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom user model
AUTH_USER_MODEL = 'accounts.User'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# JWT Settings
from datetime import timedelta

# Celery Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'JWK_URL': None,
    'LEEWAY': 0,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',
    'JTI_CLAIM': 'jti',
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}

# Celery Configuration
# Celery Configuration
CELERY_BROKER_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

# Email settings
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() == 'true'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')

# Frontend URL
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

# OpenAI
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')

# Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY', '')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'django.log',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
