# CLAUDE.md — GROW Platform

## Project Overview

GROW is a SaaS web app for Personal Trainers to manage clients, design periodized training programs (fixed G→R→O→W methodology), track weekly/monthly progress, and deliver daily workout plans to clients via a mobile-first calendar interface.

**Inspired by:** Hevy (workout logging UX, exercise library, RPE tracking, progress charts, rest timers), Ladder (coach-built structured weekly plans, clean onboarding quiz, video demos, progressive overload tracking), Fitplan (dark-mode gym-friendly UI, trainer-client model, calendar/plan sections, phase-based programming).

## Tech Stack

- **Framework:** React 18+ with TypeScript (strict mode)
- **Build:** Vite
- **Styling:** Tailwind CSS v4
- **Backend:** Supabase (Auth, PostgreSQL, RLS, Edge Functions, Realtime)
- **Hosting:** Vercel
- **Forms:** react-hook-form + zod
- **Charts:** recharts
- **Dates:** date-fns
- **Icons:** lucide-react
- **Routing:** react-router-dom v6 (with nested layouts)
- **State:** React Context + Supabase realtime subscriptions (no Redux)
- **PWA:** vite-plugin-pwa

## Design Direction

### Visual Identity

This is a gym/training app used in low-light environments (gyms, early mornings). The design must feel **premium, focused, and functional** — not playful or generic.

- **Color mode:** Dark mode primary (like Hevy and Fitplan — dark backgrounds reduce glare in gym lighting). Light mode as secondary option.
- **Palette:** Near-black base (`#0D0D0F`), zinc/slate card surfaces (`#18181B`), a single accent color (electric green `#22C55E` or teal `#14B8A6` — to be decided), muted text on `zinc-400`, bright text on `zinc-50`.
- **Typography:** Inter for body (clean, readable at small sizes on mobile). Geist or Space Grotesk for display headings (distinctive but not decorative). Monospace for numbers/weights/reps (JetBrains Mono or similar — numbers need to feel precise).
- **Border radius:** Rounded-lg (8px) for cards, rounded-xl for modals, rounded-full for avatars and pills. No sharp corners.
- **Spacing:** Generous touch targets (min 44px tap areas). Cards with 16-20px internal padding. 12-16px gaps between list items.
- **Signature element:** Muscle group heatmap visualization on progress screens (inspired by Hevy's muscle distribution chart).

### Mobile-First Layout

- **Client app:** Bottom tab navigation (4 tabs: Today, Calendar, Progress, Profile). Inspired by Hevy's tab bar.
- **Trainer app:** Bottom tab on mobile (Dashboard, Clients, Exercises, Settings), collapsible sidebar on tablet/desktop.
- **No hamburger menus.** Primary navigation always visible.
- **Pull-to-refresh** on list screens.
- **Skeleton loaders** (not spinners) during data fetch.
- **Haptic-style feedback:** Brief scale animation (0.97) on button press via CSS transitions.

### Key UX Patterns (from Hevy / Ladder / Fitplan)

1. **Onboarding quiz flow** (Ladder-style): Full-screen steps, one question per screen, progress bar at top, large tap targets, back navigation. Not a traditional form.
2. **Workout logging** (Hevy-style): Each exercise shows previous session values auto-populated as ghost text. Client taps to confirm or overrides. Sets displayed as editable rows (set # | reps | weight | RPE). Swipe to delete set. Rest timer auto-starts between sets.
3. **Exercise cards** (Hevy-style): Thumbnail from YouTube video, exercise name, muscle group pill, tap to expand with video embed + instructions.
4. **Weekly plan view** (Ladder-style): Horizontal day selector at top (Mon-Sun), current day highlighted. Below: today's session card with exercise count, estimated duration, and "Start Workout" CTA. Swipe between days.
5. **Progress charts** (Hevy-style): Line charts for weight/body metrics over time. Bar charts for weekly volume per muscle group. Personal records highlighted with badge icon.
6. **Session detail** (Fitplan-style): Vertical scrolling list of exercises. Each exercise: name, video thumbnail (tap to play), sets × reps × weight grid, rest time, notes field. "Complete Workout" sticky button at bottom.
7. **Client list** (Trainer view): Cards with avatar, name, current phase indicator (G/R/O/W pill), last activity timestamp, adherence percentage ring chart. Tap for full client profile.

## Architecture

### Project Structure

```
src/
├── components/
│   ├── ui/              # Button, Input, Card, Modal, Badge, Skeleton, Tabs
│   ├── forms/           # OnboardingForm, WeeklyTrackingForm, MeasurementForm
│   ├── workout/         # ExerciseCard, SetRow, RestTimer, SessionDetail
│   ├── charts/          # WeightChart, VolumeChart, MuscleHeatmap, AdherenceRing
│   └── layout/          # AppShell, BottomNav, Sidebar, PageHeader
├── pages/
│   ├── auth/            # LoginPage, RegisterPage, InvitePage
│   ├── onboarding/      # OnboardingFlow (multi-step)
│   ├── trainer/         # Dashboard, ClientList, ClientDetail, ExerciseLibrary, ProgramBuilder
│   └── client/          # TodayPage, CalendarPage, SessionPage, ProgressPage, ProfilePage
├── hooks/               # useAuth, useProfile, useProgram, useExercises, useTracking
├── lib/
│   ├── supabase.ts      # Supabase client init
│   ├── database.types.ts # Generated types from Supabase
│   ├── calculations.ts  # Body fat %, BMI, HR zones, volume calculations
│   └── constants.ts     # GROW phases, muscle groups, enums
├── contexts/
│   └── AuthContext.tsx   # Auth state provider
├── utils/
│   ├── cn.ts            # clsx + twMerge utility
│   └── format.ts        # Date, weight, rep formatters
└── App.tsx              # Router + providers
```

### Routing Structure

```
/login
/register
/invite/:token
/onboarding                    # Client onboarding flow (guarded)

# Trainer routes (role='trainer')
/t/dashboard                   # Client overview
/t/clients                     # Client list
/t/clients/:id                 # Client detail (tabs: program, measurements, tracking, zones)
/t/clients/:id/program/new     # Create program for client
/t/clients/:id/program/:pid    # View/edit program
/t/exercises                   # Exercise library CRUD
/t/settings                    # Account settings

# Client routes (role='client')
/c/today                       # Today's session (Ladder-style)
/c/calendar                    # Week/month calendar view
/c/session/:id                 # Active workout session (Hevy-style logging)
/c/progress                    # Charts and measurements
/c/tracking                    # Weekly tracking form
/c/profile                     # Profile and settings
```

## Database Schema

Reference the full schema in `GROW_Platform_Requirements_and_Plan.md`. Key points:

- All tables use UUID primary keys via `gen_random_uuid()`
- `profiles.trainer_id` is the tenant isolation key
- `phases.type` is `enum('G','R','O','W')` — always exactly 4 per program, auto-created
- `phases.order` is immutable: G=1, R=2, O=3, W=4
- Program creation trigger auto-inserts 4 phases + default 4 weeks per phase
- RLS policies filter all queries by authenticated user's role and trainer_id
- `exercises` table has a `trainer_id` — each trainer has their own exercise library
- Exercise seed data (~218 exercises from Harold's spreadsheet) loaded per trainer on first program creation

### Enums

```sql
CREATE TYPE user_role AS ENUM ('trainer', 'client');
CREATE TYPE program_status AS ENUM ('draft', 'active', 'completed');
CREATE TYPE phase_type AS ENUM ('G', 'R', 'O', 'W');
CREATE TYPE exercise_zone AS ENUM ('upper_body', 'lower_body', 'core');
CREATE TYPE movement_type AS ENUM ('push', 'pull', 'legs', 'core', 'cardio');
CREATE TYPE frequency_scale AS ENUM ('never', 'sometimes', 'often', 'always');
CREATE TYPE daily_status AS ENUM ('achieved', 'in_progress', 'missed');
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'premium');
```

### Muscle Group Classification

| Zone | Muscle Group | Movement Type |
|------|-------------|---------------|
| upper_body | Pecho (Chest) | push |
| upper_body | Hombros (Shoulders/Deltoids) | push |
| upper_body | Tríceps | push |
| upper_body | Espalda (Back/Lats) | pull |
| upper_body | Bíceps | pull |
| lower_body | Cuádriceps | legs |
| lower_body | Isquiotibiales y Glúteos (Hamstrings & Glutes) | legs |
| lower_body | Pantorrillas (Calves) | legs |
| core | Abdomen | core |

## Implementation Steps

Execute these in order. Each step should be a working, testable increment.

### Step 1 — Project Init & Supabase Setup

1. `npm create vite@latest grow-platform -- --template react-ts`
2. Install dependencies:
   ```
   npm i @supabase/supabase-js react-router-dom react-hook-form @hookform/resolvers zod
   npm i recharts date-fns lucide-react clsx tailwind-merge
   npm i -D tailwindcss @tailwindcss/vite
   ```
3. Configure Tailwind with dark mode `class` strategy and custom color tokens.
4. Create `src/lib/supabase.ts` with env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
5. Create `src/utils/cn.ts`:
   ```ts
   import { clsx, type ClassValue } from 'clsx';
   import { twMerge } from 'tailwind-merge';
   export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
   ```
6. Set up basic React Router with layout wrappers for trainer/client routes.
7. Create a `src/components/ui/` base library: Button, Input, Card, Badge, Skeleton, Modal.

### Step 2 — Database Migrations

Create SQL migrations in `supabase/migrations/` in this order:

1. **001_enums.sql** — All enum types
2. **002_profiles.sql** — profiles table extending auth.users, with trigger to create profile on signup
3. **003_health_lifestyle.sql** — health_evaluation, lifestyle_evaluation tables
4. **004_cardiovascular_measurements.sql** — cardiovascular_evaluation, body_measurements
5. **005_exercises.sql** — exercises table with zone, movement_type, video_url
6. **006_programs.sql** — programs, phases, weeks, sessions, session_exercises tables
7. **007_progressions.sql** — progressions table
8. **008_tracking.sql** — weekly_tracking, daily_log tables
9. **009_hr_zones.sql** — hr_zones table
10. **010_subscriptions.sql** — subscriptions table (prepared for future)
11. **011_rls_policies.sql** — All RLS policies:
    - Trainers: full CRUD on their own data and their clients' data
    - Clients: read-only on exercises, programs, sessions; write on their own tracking, session completion, profile
    - Tenant isolation: trainer A never sees trainer B's anything
12. **012_triggers.sql** — 
    - `on_auth_user_created` → insert into profiles
    - `on_program_created` → auto-insert 4 phases (G,R,O,W) + 4 weeks per phase
13. **013_seed_exercises.sql** — Seed ~218 exercises from Harold's spreadsheet with proper zone/movement_type classification and YouTube URLs

### Step 3 — Auth & Role Detection

1. Create `AuthContext.tsx` with Supabase auth state listener.
2. `useAuth()` hook exposing: user, profile (with role), loading, signIn, signUp, signOut.
3. Login page: email + password, dark-themed, centered card layout.
4. Register page: separate flows for trainer (public signup) and client (invite link with token).
5. Route guards:
   - `<TrainerGuard>` — redirects to `/login` if not trainer
   - `<ClientGuard>` — redirects to `/login` if not client
   - `<OnboardingGuard>` — redirects to `/onboarding` if `onboarding_completed === false`
6. Post-login redirect logic: trainer → `/t/dashboard`, client → `/c/today`

### Step 4 — Client Onboarding Flow

Build as a Ladder-style quiz: full-screen steps, progress bar, one topic per screen.

1. **Step 1 — Personal Info:** Name, nationality, sex (large pill selectors), birth date, phone. Pre-fill email from auth.
2. **Step 2 — Health Evaluation:** Yes/No toggles for each condition (cardiac, pathology, bone, medication). If yes → expand text detail input. Final question as text area.
3. **Step 3 — Lifestyle:** 4-option horizontal selector (Never / Sometimes / Often / Always) for smoking, alcohol, nutrition, activity. Toggle for other activities + text field.
4. **Step 4 — Daily Habits:** Numeric inputs with stepper (+/-) for steps, hours. Slider inputs (0-10) for sleep quality, stress.
5. **Step 5 — Objectives:** Large text area with placeholder prompts. "What do you want to achieve?"
6. **Step 6 — Confirmation:** Summary card of all entered data. "Submit" button.
7. On submit → insert into health_evaluation, lifestyle_evaluation, update profiles (onboarding_completed = true, objectives).
8. Redirect to `/c/today`.

### Step 5 — Exercise Library (Trainer)

1. **List view:** Searchable, filterable grid of exercise cards. Filters: zone (pills), muscle group (dropdown), movement type (pills). Search bar at top.
2. **Exercise card:** YouTube thumbnail (extracted from URL), exercise name, muscle group badge, zone badge. Tap → detail view.
3. **Detail view:** Embedded YouTube player (iframe), full name, classification, notes field, edit/delete actions.
4. **Create/Edit form:** Name, muscle group (dropdown with predefined groups), zone (auto-set from muscle group), movement type (auto-set from muscle group), video URL (with YouTube thumbnail preview on paste), notes.
5. **Seed data:** On first load for a new trainer, offer to import the default exercise library (218 exercises). Store as trainer's own copy so they can customize.

### Step 6 — Program Builder (Trainer)

This is the most complex module. Build incrementally.

#### 6a — Program Creation
1. Trainer selects a client → "Create Program" button.
2. Form: Program name, start date. On save → DB trigger creates 4 phases (G,R,O,W) + 4 weeks per phase + configurable deload weeks.
3. Redirect to program editor.

#### 6b — Program Editor (bird's-eye view)
1. Horizontal phase tabs: G | R | O | W (styled as pills with phase color coding).
2. Within each phase: vertical list of weeks (Week 1, Week 2, Week 3, Week 4, Deload). Deload weeks have a distinct muted style.
3. Within each week: horizontal session cards (Session 1, Session 2, ... Session 6). Tap to edit session.
4. Quick actions: "Duplicate Week", "Duplicate Session" (time-savers for trainers).

#### 6c — Session Editor
1. Session header: Phase, week, session number, scheduled date picker.
2. "Add Exercise" button → opens exercise picker (filtered library with search).
3. Exercise list: drag-to-reorder. Each exercise row shows: name, sets × reps, weight, rest. Tap to expand inline editor.
4. Inline exercise config: sets (number stepper), reps (text: "10-12"), weight/intensity (number + "kg"), RIR/RPE (text or dropdown), rest (text: "90s"), notes.
5. "Save Session" button.

#### 6d — Progression Table
1. Tab or section within program editor.
2. Grid: rows = muscle groups, columns = weeks (1-4 per phase).
3. Cells: target sets, reps, intensity. Editable inline.
4. Visual: progression arrows showing volume increase across weeks.

#### 6e — Program Activation
1. "Activate Program" button → sets status to 'active', previous active program goes to 'completed'.
2. Generates scheduled_date for each session based on start_date and session distribution.

### Step 7 — Client Calendar & Today View

#### 7a — Today Page (Ladder-style)
1. Hero card: "Today's Workout" with session name, exercise count, estimated duration.
2. Exercise preview list (collapsed): just names and sets × reps.
3. "Start Workout" large CTA button → navigates to active session.
4. If rest day: motivational message + next session preview.
5. Below: weekly adherence bar (Mon-Sun dots, filled = completed).

#### 7b — Calendar Page
1. Week view (default): horizontal day selector, session card below for selected day.
2. Month view (toggle): calendar grid with dots on session days. Filled dot = completed, outlined = planned, no dot = rest.
3. Tapping a day → session detail or "Rest day" state.

#### 7c — Active Session Page (Hevy-style workout logging)
1. Header: session name, elapsed timer, "Finish Workout" button.
2. Exercise list (vertical scroll). Each exercise:
   - Name + video thumbnail (tap to play in modal)
   - Set rows: `[Set #] [Reps input] [Weight input] [RPE dropdown] [✓ checkbox]`
   - Ghost text showing previous session's values (auto-populated from last identical session)
   - "Add Set" button below rows
   - Swipe left on set row to delete
3. Between exercises: rest timer (auto-starts on set completion, configurable duration, with sound/vibration alert).
4. "Complete Workout" sticky footer → marks session as completed, saves all set data, triggers celebration animation (confetti or checkmark).
5. Post-workout summary: total volume, duration, exercises completed, PRs hit.

### Step 8 — Weekly Tracking (Client)

1. Available at end of each week (or anytime, backdated).
2. Three-section form matching the spreadsheet:
   - **Training:** sessions completed (auto-calculated from marked sessions), fatigue slider (1-10), recovery slider (1-10)
   - **Nutrition:** weight input (kg, with decimal), 4 sliders (1-10): adherence, satiety, hydration, plan following
   - **Rest:** sleep hours (numeric), 3 sliders: sleep quality, stress, motivation
3. Daily log section: 7 day rows, each with status selector (Achieved/In Progress/Missed) + observation text.
4. "Proudest moment this week" — text area.
5. Submit → save to weekly_tracking + daily_log.

### Step 9 — Measurements & Progress (Trainer inputs, Client views)

#### 9a — Measurement Form (Trainer)
1. Accessed from client detail → "New Measurement" button.
2. Fields: date, weight, height, 4 skin folds (bicipital, tricipital, subscapular, suprailiac).
3. Auto-calculated on input: body fat % (Durnin-Womersley 4-fold formula), fat mass, lean mass, BMI.
4. Save → body_measurements table.

#### 9b — Progress Page (Client)
1. **Weight chart:** Line chart over time (from weekly tracking fasting weight + measurements).
2. **Body composition chart:** Stacked area or dual-line (fat mass vs lean mass over time).
3. **Volume chart:** Bar chart — sets per muscle group per week (calculated from completed sessions).
4. **Muscle heatmap** (Hevy-style signature element): Front/back body silhouette with heat colors indicating training volume by muscle group for current week.
5. **Measurement history:** Expandable table with all measurements, comparison vs first measurement.

### Step 10 — Trainer Dashboard

1. **Client list:** Cards with avatar, name, active phase pill (G/R/O/W with color), last activity ("2h ago"), adherence ring (% sessions completed this week). Sort by: name, last activity, adherence.
2. **Client detail:** Tab layout:
   - **Overview:** Personal info summary, objectives, current program status, quick stats.
   - **Program:** Current program bird's-eye view (read-only or edit).
   - **Measurements:** Chart + table of body measurements over time.
   - **Tracking:** Weekly tracking history with trend charts (weight, fatigue, motivation).
   - **HR Zones:** Calculated cardio zones (auto from CV evaluation data).
3. **Alerts panel:** Clients who haven't logged a session in 3+ days, clients missing weekly tracking, clients approaching deload week.
4. **Quick actions:** "Invite Client" (generates invite link), "Create Program", "Log Measurement".

### Step 11 — PWA & Polish

1. Configure `vite-plugin-pwa` with manifest (app name, icons, theme color, display: standalone).
2. Service worker: cache app shell + current week's session data for offline viewing.
3. Install prompt: show custom "Add to Home Screen" banner on first few visits.
4. Touch optimizations: ensure all interactive elements ≥44px, add overscroll-behavior-y: contain.
5. Loading states: skeleton screens for every data-fetching view.
6. Error states: friendly illustrations + retry buttons (not raw error messages).
7. Empty states: contextual guidance ("No exercises yet. Start building your library →").
8. Transitions: page transitions via React Router with subtle fade/slide.

## Code Conventions

- **File naming:** PascalCase for components (`ExerciseCard.tsx`), camelCase for hooks (`useExercises.ts`), kebab-case for utils (`format-date.ts`).
- **Component pattern:** Named exports. Props interfaces defined above component. No default exports except pages.
- **Supabase queries:** All in custom hooks (`useExercises`, `useProgram`, etc.), never directly in components.
- **Error handling:** All Supabase calls wrapped in try/catch, errors surfaced via toast notifications.
- **TypeScript:** Strict mode. No `any`. Use Supabase generated types for all DB interactions.
- **Tailwind:** Use `cn()` utility for conditional classes. Dark mode classes with `dark:` prefix. No inline styles.
- **Forms:** Always react-hook-form + zod schema. Never uncontrolled inputs.
- **i18n ready:** All user-facing strings in Spanish by default. Structure allows future extraction to translation files.
- **Accessibility:** Semantic HTML, aria-labels on icon buttons, keyboard navigation on all interactive elements.

## Environment Variables

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Testing Strategy

- Unit tests: zod schemas, calculation functions (body fat, BMI, HR zones), utility functions.
- Component tests: form submissions, conditional rendering by role.
- E2E (future): Playwright for critical flows (onboarding, workout logging, program creation).

## Deployment

- Vercel with GitHub integration (auto-deploy on push to `main`).
- Preview deployments on PRs.
- Supabase project with separate staging/production instances.
