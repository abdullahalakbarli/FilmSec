# FilmMood

FilmMood is a mood-based movie and TV show recommendation platform. Browse content by how you feel, save favorites, join community discussions, and get personalized suggestions from the built-in AI assistant.

**Author:** Abdullah Alakberli

## Features

- Mood-based discovery (happy, sad, excited, relaxed, thoughtful, romantic, and more)
- User accounts with JWT authentication
- Favorites and watch-later lists
- Comments, ratings, and community discussions
- AI chat assistant with English and Azerbaijani support
- Admin dashboard for platform statistics and moderation overview
- Responsive UI with dark mode

## Tech stack

| Layer    | Technologies                                      |
|----------|---------------------------------------------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend  | Node.js, Express, TypeScript, JWT, bcrypt         |
| Database | Supabase (PostgreSQL)                             |

## Project structure

```
FilmMood/
├── frontend/                 # React SPA (Vite)
│   ├── public/               # Static assets
│   └── src/
│       ├── components/       # UI components (Header, MovieCard, …)
│       ├── components/ui/    # shadcn/ui primitives
│       ├── contexts/         # React context (auth)
│       ├── hooks/            # Custom hooks (favorites, comments, …)
│       ├── lib/              # API client and utilities
│       ├── pages/            # Route pages (Index, Auth, Admin, …)
│       ├── data/             # Static mood metadata
│       └── types/            # Shared TypeScript types
├── backend/                  # REST API
│   └── src/
│       ├── config/           # JWT and Supabase clients
│       ├── data/             # Seed data (movies, moods)
│       ├── database/         # Schema SQL, seed script, migrations
│       ├── middleware/       # Auth and admin guards
│       ├── routes/           # API route handlers
│       └── types/            # Shared TypeScript types
├── movies.csv                # Optional bulk movie import source
└── README.md                 # This file
```

## Getting started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Database setup

1. Create a Supabase project.
2. In the SQL Editor, run `backend/src/database/schema.sql`.
3. If upgrading from an older deployment, also run `backend/src/database/remove-vulnerable-auth.sql` to drop any legacy login functions.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase URL, anon key, and a strong JWT_SECRET
npm install
npm run seed    # optional: loads moods/movies; set ADMIN_PASSWORD to create admin
npm run dev
```

API default: `http://localhost:4243`

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Point VITE_API_URL at your backend (default http://localhost:4243/api)
npm install
npm run dev
```

App default: `http://localhost:4242`

### Admin access

1. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and run `npm run seed` in `backend/`, **or** promote a user to `role = 'admin'` in Supabase.
2. Sign in with that account and open `/admin`.

## Environment variables

| Variable | Where | Description |
|----------|-------|-------------|
| `JWT_SECRET` | backend | Secret for signing JWTs (required in production) |
| `SUPABASE_URL` | backend | Supabase project URL |
| `SUPABASE_ANON_KEY` | backend | Supabase anon key (safe for server; never ship service key to frontend) |
| `SUPABASE_SERVICE_KEY` | backend | Optional; seed scripts only |
| `CORS_ORIGINS` | backend | Comma-separated frontend URLs |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | backend | Optional seed admin account |
| `VITE_API_URL` | frontend | Backend API base URL |

See `backend/.env.example` and `frontend/.env.example` for full lists.

## API overview

| Area | Base path |
|------|-----------|
| Auth | `/api/auth` |
| Movies & moods | `/api/movies`, `/api/moods` |
| Social | `/api/comments`, `/api/reviews`, `/api/discussions` |
| User lists | `/api/favorites`, `/api/watch-later` |
| AI assistant | `/api/ai` |
| Admin | `/api/admin` (admin role required) |

Health check: `GET /health`

## Security notes for public deployment

- Never commit `.env` files or Supabase **service role** keys.
- Use a strong, unique `JWT_SECRET` in production.
- Set `CORS_ORIGINS` to your real frontend domain only.
- If credentials were ever committed to git, **rotate** Supabase keys and `JWT_SECRET` before going public.
- Run `remove-vulnerable-auth.sql` on databases that may have legacy RPC functions.

## Scripts

**Backend:** `npm run dev` · `npm run build` · `npm start` · `npm run seed`

**Frontend:** `npm run dev` · `npm run build` · `npm run preview` · `npm run lint`

## License

MIT — see repository license file if present.
