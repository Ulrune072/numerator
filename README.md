# Числитель

Educational website for learning Russian numerals.

## Stack
- **Next.js 14** (App Router, TypeScript strict)
- **Supabase** (Auth, PostgreSQL, RLS)
- **Tailwind CSS**
- **Vercel** (deployment)

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env vars
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# 3. Apply DB migration
# In Supabase dashboard → SQL Editor, run:
#   supabase/migrations/001_initial_schema.sql
# Optionally seed dev data:
#   supabase/seed.sql

# 4. Run dev server
npm run dev

# 5. Type-check
npm run typecheck
```

---

## Project structure

```
app/
  (auth)/          login, register, forgot-password
  (student)/       dashboard, lectures, tasks, diagnostic
  (admin)/admin/   admin panel (role=admin only)
  api/             route handlers
  auth/callback/   PKCE exchange

lib/
  supabase/        client.ts · server.ts · admin.ts
  services/        lectures · tasks · progress · users
  utils/           auth · status
  types/           database.ts

components/
  auth/            LoginForm · RegisterForm · ForgotPasswordForm · LogoutButton
  lectures/        LectureCard · LectureContent
  tasks/           QuestionCard · AnswerOption · ResultsScreen · TasksRunner
  dashboard/       StatusBadge · ProgressBar
  admin/           LectureTable · TaskTable · UserTable · LectureEditor · TaskEditor · ConfirmDialog
  ui/              ErrorMessage

supabase/
  migrations/001_initial_schema.sql
  seed.sql
```

---

## Acceptance tests (Phase 10)

Run through all before deploying:

| # | Test | How to verify |
|---|---|---|
| T-01 | Unauthenticated → /login | Open `/dashboard` in incognito → redirected |
| T-02 | Register creates profile row | Register user → check `profiles` table |
| T-03 | Login error message | Wrong password → "Неверный email или пароль." |
| T-04 | Callback redirects to /dashboard | Click confirmation email → lands on `/dashboard` |
| T-05 | Forgot-password always returns success | Unknown email → success message shown |
| T-06 | Logout clears session | Click "Выйти" → `/login`; back button → still `/login` |
| T-07 | Non-admin redirected from /admin | Student visits `/admin` → redirected to `/dashboard` |
| T-08 | Unpublished lecture returns 404 | Visit `/lectures/poryadkovye-chislitelnye` as student → 404 |
| T-09 | Visit gate on tasks | Navigate directly to `/tasks/chto-takoe-chislitelnye` without visiting lecture → redirected |
| T-10 | correct_index absent from student API | `GET /api/tasks?lectureId=X` → no `correct_index` field |
| T-11 | Score awarded once | Answer correctly, retry → score not incremented again |
| T-12 | SERVICE_ROLE_KEY not in client bundle | `grep -r "SUPABASE_SERVICE_ROLE_KEY" .next/static` → no results |
| T-13 | RLS: student cannot read other users' progress | Use anon key, query `user_progress` with different `user_id` → empty result |
| T-14 | tsc passes | `npm run typecheck` → zero errors |

---

## Score tiers

| Score | Status |
|---|---|
| 0–99 | Новичок |
| 100–299 | Ученик |
| 300–599 | Знаток |
| 600–999 | Мастер |
| 1000+ | Числитель ⭐ |
