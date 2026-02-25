FROM python:3.13-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies (ffmpeg for audio extraction/format merging, curl for deno install)
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg curl unzip && rm -rf /var/lib/apt/lists/*

# Install deno (required by yt-dlp to solve YouTube JS challenges)
RUN curl -fsSL https://deno.land/install.sh | DENO_INSTALL=/usr/local sh

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Install dependencies
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

# Copy application code
COPY backend .

# Create temp directory for downloads
RUN mkdir -p /app/media/tmp

# Collect static files
RUN uv run python manage.py collectstatic --noinput 2>/dev/null || true

EXPOSE 8000

CMD ["sh", "-c", "uv run python manage.py migrate --noinput; uv run python manage.py setup_superuser; uv run gunicorn dropdl.wsgi:application --bind 0.0.0.0:8000 --workers 4 --timeout 600"]
