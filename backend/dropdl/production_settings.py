"""
Production settings for dropdl project.
Extends base settings with production-specific overrides.
"""

import dj_database_url
from decouple import Csv, config

from .settings import *  # noqa: F401, F403

DEBUG = False

ALLOWED_HOSTS = config("ALLOWED_HOSTS", cast=Csv())

# Database - PostgreSQL
DATABASES = {"default": dj_database_url.parse(config("DATABASE_URL"))}

# Cache - Redis
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": config("REDIS_URL", default="redis://127.0.0.1:6379/1"),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        },
    }
}

# Security
# SECURE_SSL_REDIRECT not needed — Railway enforces HTTPS at the edge
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# PO Token server for yt-dlp YouTube bot bypass
POT_SERVER_URL = config("POT_SERVER_URL", default=None)

# Django-Q2 (Redis broker for production)
Q_CLUSTER = {
    "name": "dropdl_production",
    "workers": config("DJANGO_Q_WORKERS", default=8, cast=int),
    "timeout": config("DJANGO_Q_TIMEOUT", default=900, cast=int),
    "retry": config("DJANGO_Q_RETRY", default=960, cast=int),
    "django_redis": "default",
    "max_attempts": 2,
    "ack_failures": True,
    "save_limit": 1000,
}
