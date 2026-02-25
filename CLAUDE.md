# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DropDL is a full-stack web app for downloading videos/audio from 1000+ sites using yt-dlp. Django REST backend with React TypeScript frontend, Google OAuth authentication, and user download history.

## Common Commands

### Backend (from `backend/`)
```bash
uv sync                          # Install dependencies
python manage.py migrate         # Run migrations
python manage.py runserver       # Start dev server (port 8000)
uv run pytest                    # Run all tests
uv run pytest path/to/test.py::TestClass::test_method  # Run single test
uv run ruff check .              # Lint
uv run ruff format .             # Format
```

### Frontend (from `frontend/`)
```bash
npm install                      # Install dependencies
npm run dev                      # Start dev server (port 3000)
npm run build                    # TypeScript check + Vite build
npx vitest run                   # Run tests
npm run lint                     # ESLint
```

### Docker
```bash
docker compose up                # Dev environment
docker compose -f docker-compose.prod.yml up  # Production
```

## Architecture

### Backend (`backend/`)
- **Django project**: `dropdl/` (settings, root URLs)
- **Apps**: `core/` (custom User model with `avatar_url`, auth views, CSRF), `downloads/` (extract-info, streaming download, history)
- **Custom User model**: `core.User` extending `AbstractUser` — set via `AUTH_USER_MODEL`
- **Services layer**: `downloads/services.py` contains all yt-dlp logic — `extract_video_info()`, `stream_download()` with intelligent fallback between direct proxy streaming (`_stream_direct`) and server-side ffmpeg processing (`_stream_processed`)
- **Auth**: Session-based authentication via django-allauth with Google OAuth. Public endpoints use `AllowAny`, protected endpoints use `IsAuthenticated`
- **Download model**: UUID primary key, status tracking (pending/extracting/downloading/processing/completed/failed), JSON options field, indexed by `(user, -created_at)`
- **PO token**: Optional `POT_SERVER_URL` env var for YouTube age-gated content via bgutil-ytdlp-pot-provider

### Frontend (`frontend/src/`)
- **Pages**: `DownloadPage` (main UI at `/app`), `LoginPage` (OAuth callback), `HistoryPage` (protected)
- **State management**: React Context only — `AuthContext`, `ThemeContext`, `ToastContext`
- **Custom hooks**: `useVideoInfo`, `useDownload`, `useHistory` — these abstract all API logic away from components
- **Types**: All shared types in `types.ts`
- **Styling**: Tailwind CSS v4 with `@tailwindcss/vite` plugin (no tailwind.config, uses CSS-based config)
- **API client**: Axios with credentials and CSRF token handling

### API Endpoints
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/csrf-token/` | Public | Get CSRF cookie |
| POST | `/api/extract-info/` | Public | Extract video metadata |
| POST | `/api/download/` | Public | Stream file download |
| GET | `/api/profile/` | Required | User profile |
| GET | `/api/history/` | Required | Download history |
| DELETE | `/api/history/<uuid>/` | Required | Delete history entry |

## Code Style

- **Backend**: Ruff with 100-char line length, double quotes, `E/F/I/W` rules (E501 ignored)
- **Frontend**: ESLint with typescript-eslint, react-hooks, and react-refresh plugins
- **Python**: >=3.13, dependencies managed with `uv`
- **Node**: 22, dependencies managed with `npm`

## Testing

- **Backend**: pytest + pytest-django + factory-boy. Fixtures (`user`, `authenticated_client`) in `conftest.py`. Test discovery: `test_*.py` files, `Test*` classes, `test_*` functions
- **Frontend**: Vitest + Testing Library with jsdom environment. Setup in `setupTests.ts`

## Environment

Key env vars: `SECRET_KEY`, `DEBUG`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `VITE_BACKEND_URL`, `VITE_API_URL`. Copy `.env.example` to `.env`. Production uses `DATABASE_URL` for PostgreSQL.