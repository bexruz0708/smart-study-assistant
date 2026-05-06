"""
Production sozlamalari (Render, Heroku va h.k. uchun).
"""
from decouple import config
import dj_database_url

from .base import *

DEBUG = False

# ALLOWED_HOSTS - environment'dan
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='*').split(',')

# Database - PostgreSQL (Render automatic)
DATABASES = {
    'default': dj_database_url.config(
        default=config('DATABASE_URL', default=''),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Static files - WhiteNoise
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# WhiteNoise middleware
if 'whitenoise.middleware.WhiteNoiseMiddleware' not in MIDDLEWARE:
    MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')

# Security
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=False, cast=bool)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# CORS - frontend domain
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='https://smart-study.vercel.app',
).split(',')
CORS_ALLOW_CREDENTIALS = True

# Frontend URL (email'larda ishlatish uchun)
FRONTEND_URL = config('FRONTEND_URL', default='https://smart-study.vercel.app')

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}