# GROW

A SaaS web app for personal trainers to manage clients, design periodized training programs, and deliver daily workout plans through a mobile-first calendar interface.

Built around a fixed **G → R → O → W** methodology (Ganancia → Resistencia → Optimización → Definición).

## Features

**For trainers**
- Client management with invite links
- Exercise library CRUD, seeded with 218 pre-classified exercises (video demos + muscle group/zone/movement type)
- Full program builder: G/R/O/W phases with 4 weeks each, session editor with reorderable exercise rows, muscle-group × week progression table
- Per-session weekday scheduling and one-click program activation

**For clients**
- Ladder-style onboarding quiz (health/lifestyle/objectives)
- Today, Calendar (week + month views), and Progress pages
- Hevy-style active workout logging: per-set reps/weight/RPE, ghost values from your last session, rest timer with vibration
- Post-workout summary with total volume and PR detection
- Weekly tracking form (training/nutrition/rest sliders + daily log)

## Tech stack

- **Frontend:** React 19, TypeScript (strict), Vite
- **Styling:** Tailwind CSS v4
- **Backend:** Supabase (Auth, Postgres with full RLS tenant isolation, Realtime-ready)
- **Forms:** react-hook-form + zod
- **Charts:** recharts
- **Routing:** react-router-dom v7
- **PWA:** vite-plugin-pwa
- **Hosting:** Vercel

## Project structure

```
src/
├── components/
│   ├── ui/               # Button, Input, Card, Modal, Badge, Skeleton
│   ├── layout/           # Shells, guards, sidebar, bottom nav
│   ├── onboarding/       # Client onboarding primitives
│   ├── exercises/        # Exercise library UI
│   ├── programs/         # Program builder (phase tabs, week rows, session cards, progression table)
│   ├── session/          # Active workout logging (set rows, rest timer)
│   ├── tracking/         # Weekly tracking form pieces
│   └── client/           # Client-specific shared UI
├── pages/
│   ├── auth/             # Login, Register, Invite
│   ├── onboarding/       # 6-step client onboarding wizard
│   ├── trainer/          # Dashboard, Clients, Program editor, Session editor, Exercise library, Settings
│   └── client/           # Today, Calendar, Session, Progress, Tracking, Profile
├── hooks/                # Data hooks: useAuth, useExercises, useProgramBuilder, useActiveSession, ...
├── lib/                  # supabase client, generated types, constants, zod schemas, scheduling helpers
├── contexts/             # AuthContext, ToastContext
└── utils/                # cn(), formatters
```

## Local development

Requires Node 20+ and npm.

```bash
npm install
cp .env.example .env
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from your Supabase project
npm run dev
```

The app reads Supabase credentials from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Both come from your Supabase project's Settings → API. Never commit the anon key — it goes in `.env` (gitignored) and Vercel's Environment Variables.

## Database setup

The schema lives in [`supabase/migrations/`](supabase/migrations/) as numbered SQL files. Run them in order against your Supabase project (SQL Editor or `supabase db push`):

- `001_enums.sql` through `013_seed_exercises.sql` — base schema, RLS policies, triggers, exercise seed function
- `014_lifestyle_daily_habits.sql` — daily habits columns for the onboarding flow
- `015_fix_sessions_insert_rls.sql` — RLS fix for creating new sessions
- `016_progressions_unique.sql` — unique constraint for progression table upserts
- `017_exercises_catalog.sql` — optional global catalog (`exercises_catalog`) + `import_catalog_exercise` RPC
- `018_exercises_add_media.sql` — adds `image_url`/`gif_url` columns to `exercises` for catalog imports

To seed the optional 1,324-exercise catalog (media + metadata from the
[hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) project), see
[scripts/README.md](scripts/README.md).

After running the migrations, in Supabase Auth **Sign In / Providers**:
- Enable **Email provider**
- Turn off **Confirm email** (or configure a real SMTP provider for production; the shared one has very low rate limits)

Trainers get their exercise library loaded on demand by clicking "Importar biblioteca predeterminada" on the empty state at `/t/exercises` — this calls the `seed_default_exercises` RPC and inserts all 218 exercises.

## Deploying to Vercel

1. Push to GitHub and import the repo on vercel.com
2. Vercel auto-detects Vite — no framework config needed
3. Add environment variables in Project Settings: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
4. The included [`vercel.json`](vercel.json) handles SPA rewrites so client-side routes work on refresh
5. In Supabase Auth → **URL Configuration**, add your Vercel URL as the Site URL and both `https://your-app.vercel.app/**` and `https://*.vercel.app/**` as redirect URLs (the wildcard covers preview deploys)

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run oxlint |
