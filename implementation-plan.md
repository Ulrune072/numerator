# Числитель — Implementation Plan
> Based on spec.md v1.0 · Stack: Next.js 14 (App Router) · Supabase · TypeScript strict

---

## Part 1 — Project Structure & Files

### New files to create

```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── forgot-password/page.tsx
├── (student)/
│   ├── dashboard/page.tsx
│   ├── lectures/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── tasks/
│   │   └── [lectureSlug]/page.tsx
│   └── diagnostic/page.tsx
├── (admin)/
│   └── admin/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── lectures/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/edit/page.tsx
│       ├── tasks/
│       │   ├── page.tsx
│       │   └── [lectureId]/page.tsx
│       └── users/page.tsx
├── api/
│   ├── lectures/route.ts
│   ├── lectures/[id]/route.ts
│   ├── lectures/[id]/publish/route.ts
│   ├── tasks/route.ts
│   ├── tasks/[id]/route.ts
│   ├── attempts/route.ts
│   ├── progress/[lectureSlug]/visit/route.ts
│   ├── admin/users/route.ts
│   ├── admin/users/[id]/route.ts
│   ├── admin/users/[id]/role/route.ts
│   └── admin/users/[id]/reset-progress/route.ts
├── auth/
│   └── callback/route.ts
└── middleware.ts

lib/
├── supabase/
│   ├── server.ts          (createServerClient helper)
│   ├── client.ts          (createBrowserClient helper)
│   └── admin.ts           (service-role client, server-only)
├── types/
│   └── database.ts        (generated or hand-written DB types)
├── services/
│   ├── lectures.ts
│   ├── tasks.ts
│   ├── progress.ts
│   └── users.ts
├── utils/
│   ├── status.ts          (score → status label)
│   └── auth.ts            (getSession, requireAuth, requireAdmin)
└── constants.ts

components/
├── auth/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── ForgotPasswordForm.tsx
├── lectures/
│   ├── LectureCard.tsx
│   └── LectureContent.tsx
├── tasks/
│   ├── QuestionCard.tsx
│   ├── AnswerOption.tsx
│   └── ResultsScreen.tsx
├── dashboard/
│   ├── StatusBadge.tsx
│   └── ProgressBar.tsx
├── admin/
│   ├── LectureTable.tsx
│   ├── TaskTable.tsx
│   ├── UserTable.tsx
│   ├── ConfirmDialog.tsx
│   └── WysiwygEditor.tsx
└── ui/
    ├── Button.tsx
    └── ErrorMessage.tsx

supabase/
├── migrations/
│   └── 001_initial_schema.sql
└── seed.sql
```

### Files to modify (if scaffolded project exists)

| File | Change |
|---|---|
| `middleware.ts` | Add Supabase session refresh + route protection logic |
| `next.config.ts` | CSP headers; restrict SUPABASE_SERVICE_ROLE_KEY to server |
| `tsconfig.json` | Confirm `"strict": true` |
| `.env.local.example` | Document required env vars |

---

## Part 2 — Database Schema

```sql
-- 001_initial_schema.sql

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  total_score INT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lectures
CREATE TABLE lectures (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  content_html TEXT,
  order_index  INT  NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tasks (questions)
CREATE TABLE tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id      UUID NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
  question_text   TEXT NOT NULL,
  options         JSONB NOT NULL,   -- ["A","B","C","D"]
  correct_index   INT  NOT NULL,    -- 0-3
  score_value     INT  NOT NULL DEFAULT 10,
  order_index     INT  NOT NULL DEFAULT 0
);

-- User progress (one row per user per lecture)
CREATE TABLE user_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lecture_id    UUID NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
  visited       BOOLEAN NOT NULL DEFAULT false,
  completed     BOOLEAN NOT NULL DEFAULT false,
  score_earned  INT     NOT NULL DEFAULT 0,
  UNIQUE(user_id, lecture_id)
);

-- Task attempts (every answer recorded)
CREATE TABLE task_attempts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_id        UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  lecture_id     UUID NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
  selected_index INT  NOT NULL,
  is_correct     BOOLEAN NOT NULL,
  attempt_number INT  NOT NULL DEFAULT 1,
  attempted_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS policies (abbreviated — full policies in migration file)
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE lectures       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress  ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attempts  ENABLE ROW LEVEL SECURITY;

-- profiles: users see only own row; admin sees all (via service role)
CREATE POLICY "own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own update"  ON profiles FOR UPDATE USING (auth.uid() = id);

-- lectures: students see only published
CREATE POLICY "published only" ON lectures FOR SELECT
  USING (is_published = true OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- tasks: readable if lecture is visible
CREATE POLICY "tasks via lecture" ON tasks FOR SELECT
  USING (EXISTS (SELECT 1 FROM lectures l WHERE l.id = lecture_id AND (l.is_published = true)));

-- user_progress: own rows only
CREATE POLICY "own progress" ON user_progress FOR ALL USING (auth.uid() = user_id);

-- task_attempts: own rows only
CREATE POLICY "own attempts" ON task_attempts FOR ALL USING (auth.uid() = user_id);
```

---

## Part 3 — REST API Contracts

### Authentication (delegated to Supabase Auth)

All Supabase Auth flows (register, login, forgot-password, callback) use the
Supabase JS SDK directly in server actions or route handlers. No custom REST
endpoint is required. The `auth/callback/route.ts` handles the PKCE exchange.

---

### Lectures API

#### `GET /api/lectures`
Returns published lectures (student) or all (admin).

**Response 200**
```ts
type LectureListItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  order_index: number;
  is_published: boolean;
  // joined from user_progress for the current user:
  visited: boolean;
  completed: boolean;
};
type GetLecturesResponse = LectureListItem[];
```

#### `POST /api/lectures` *(admin only)*
**Request body**
```ts
type CreateLectureDTO = {
  slug: string;           // unique, kebab-case
  title: string;          // required, non-empty
  description?: string;
  content_html?: string;
  order_index: number;
  is_published: boolean;
};
```
**Responses**
- `201 Created` — `{ id: string }`
- `400 Bad Request` — `{ error: "slug_taken" | "validation_error", message: string }`
- `403 Forbidden` — not admin

#### `GET /api/lectures/[id]` *(admin only)*
Returns full lecture including unpublished. `200 Lecture` or `404`.

#### `PATCH /api/lectures/[id]` *(admin only)*
Partial update. Same shape as `CreateLectureDTO` but all fields optional.
- `200 OK`
- `409 Conflict` — slug collision

#### `DELETE /api/lectures/[id]` *(admin only)*
Cascades to tasks + user_progress via DB.
- `204 No Content`

#### `POST /api/lectures/[id]/publish` *(admin only)*
**Request body** `{ is_published: boolean }`
- `200 OK` — `{ is_published: boolean }`

---

### Tasks API

#### `GET /api/tasks?lectureId=[id]`
Returns tasks for a lecture ordered by `order_index`.
For students: `correct_index` is **omitted** from the response.
For admins: full object returned.

**Response 200**
```ts
type TaskDTO = {
  id: string;
  lecture_id: string;
  question_text: string;
  options: [string, string, string, string];
  correct_index?: number;   // admin only
  score_value: number;
  order_index: number;
};
type GetTasksResponse = TaskDTO[];
```

#### `POST /api/tasks` *(admin only)*
```ts
type CreateTaskDTO = {
  lecture_id: string;
  question_text: string;
  options: [string, string, string, string];
  correct_index: number;    // 0–3
  score_value: number;
  order_index: number;
};
```
- `201 Created` — `{ id: string }`
- `400 Bad Request`

#### `PATCH /api/tasks/[id]` *(admin only)*
Partial `CreateTaskDTO`.

#### `DELETE /api/tasks/[id]` *(admin only)*
- `204 No Content`

---

### Progress API

#### `POST /api/progress/[lectureSlug]/visit`
Called when student loads `/lectures/[slug]`. Creates or updates
`user_progress.visited = true`.
- `200 OK` — `{ visited: true }`
- `404` — lecture not found or not published

#### `GET /api/progress/[lectureSlug]/visit`
Returns `{ visited: boolean }` for the current user.
Used by `/tasks/[slug]` middleware to gate access.

---

### Attempts API

#### `POST /api/attempts`
Records a single answer and applies scoring if first attempt on this lecture.

**Request body**
```ts
type SubmitAttemptDTO = {
  task_id: string;
  lecture_id: string;
  selected_index: number;   // 0–3
  attempt_number: number;   // 1 = first, 2+ = retry
};
```

**Response 200**
```ts
type AttemptResultDTO = {
  is_correct: boolean;
  score_awarded: number;    // 0 if not first attempt or wrong
  total_score: number;      // updated profile total_score
};
```

**Server-side logic:**
1. Fetch `tasks.correct_index` (never exposed to client).
2. Compute `is_correct`.
3. If `attempt_number === 1` AND `is_correct`:
   - Insert `task_attempts` row.
   - Increment `user_progress.score_earned`.
   - Increment `profiles.total_score`.
4. Else insert `task_attempts` row with `score_awarded = 0`.
5. Return result.

- `400 Bad Request` — invalid task_id or lecture_id
- `403 Forbidden` — user not authenticated

#### `GET /api/attempts?lectureId=[id]`
Returns all attempts by current user for the lecture (for results screen and
best-score calculation).

```ts
type AttemptSummary = {
  task_id: string;
  selected_index: number;
  is_correct: boolean;
  attempt_number: number;
  attempted_at: string;
};
type GetAttemptsResponse = AttemptSummary[];
```

---

### Admin Users API

#### `GET /api/admin/users` *(admin only)*
```ts
type AdminUserDTO = {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'admin';
  total_score: number;
  completed_lectures_count: number;
};
type GetUsersResponse = AdminUserDTO[];
```

#### `PATCH /api/admin/users/[id]/role` *(admin only)*
**Request** `{ role: 'student' | 'admin' }`
- `200 OK`
- `400 Bad Request`

#### `POST /api/admin/users/[id]/reset-progress` *(admin only)*
Deletes all `user_progress` and `task_attempts` rows for the user.
Sets `profiles.total_score = 0`.
- `200 OK`

#### `DELETE /api/admin/users/[id]` *(admin only)*
Calls Supabase Admin API (`supabase.auth.admin.deleteUser(id)`) which cascades
via `profiles → user_progress → task_attempts`.
- `204 No Content`

---

## Part 4 — Internal Service Interfaces

```ts
// lib/services/lectures.ts

interface LectureService {
  // Student
  getPublishedLectures(userId: string): Promise<LectureListItem[]>;
  getLectureBySlug(slug: string): Promise<Lecture | null>;

  // Admin
  getAllLectures(): Promise<Lecture[]>;
  createLecture(dto: CreateLectureDTO): Promise<{ id: string }>;
  updateLecture(id: string, dto: Partial<CreateLectureDTO>): Promise<void>;
  deleteLecture(id: string): Promise<void>;
  setPublished(id: string, value: boolean): Promise<void>;
}
```

```ts
// lib/services/tasks.ts

interface TaskService {
  getTasksForStudent(lectureId: string): Promise<StudentTaskDTO[]>;    // correct_index stripped
  getTasksForAdmin(lectureId: string): Promise<TaskDTO[]>;
  createTask(dto: CreateTaskDTO): Promise<{ id: string }>;
  updateTask(id: string, dto: Partial<CreateTaskDTO>): Promise<void>;
  deleteTask(id: string): Promise<void>;
}
```

```ts
// lib/services/progress.ts

interface ProgressService {
  recordVisit(userId: string, lectureSlug: string): Promise<void>;
  hasVisited(userId: string, lectureSlug: string): Promise<boolean>;
  submitAnswer(userId: string, dto: SubmitAttemptDTO): Promise<AttemptResultDTO>;
  getAttemptsByLecture(userId: string, lectureId: string): Promise<AttemptSummary[]>;
  getBestResult(userId: string, lectureId: string): Promise<{ correct: number; total: number }>;
  markCompleted(userId: string, lectureId: string, scoreEarned: number): Promise<void>;
}
```

```ts
// lib/services/users.ts  (admin-only, uses service-role client)

interface UserService {
  listAll(): Promise<AdminUserDTO[]>;
  changeRole(userId: string, role: 'student' | 'admin'): Promise<void>;
  resetProgress(userId: string): Promise<void>;
  deleteUser(userId: string): Promise<void>;
}
```

```ts
// lib/utils/status.ts

type Status = 'Новичок' | 'Ученик' | 'Знаток' | 'Мастер' | 'Числитель ⭐';

function getStatus(totalScore: number): Status;
function getNextThreshold(totalScore: number): number | null;
function getProgressPercent(totalScore: number): number;
```

---

## Part 5 — Middleware & Auth Guard

```ts
// middleware.ts  — runs on every request

export async function middleware(request: NextRequest) {
  // 1. Refresh Supabase session (standard pattern)
  const { supabase, response } = createMiddlewareClient(request);
  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // 2. Public routes: allow through
  if (['/login', '/register', '/forgot-password', '/auth/callback'].includes(pathname)) {
    return response;
  }

  // 3. No session → redirect to /login  (AUTH-01)
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. Admin-only routes  (AUTH-07)
  if (pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', session.user.id).single();
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}
```

**Task page access guard** (TASK-01) is an additional check inside
`app/(student)/tasks/[lectureSlug]/page.tsx`:
```ts
const visited = await progressService.hasVisited(userId, lectureSlug);
if (!visited) redirect(`/lectures/${lectureSlug}`);
```

---

## Part 6 — Step-by-Step Implementation Phases

### Phase 1 — Foundation
1. Scaffold Next.js 14 project with TypeScript strict mode.
2. Install and configure Supabase JS client (`@supabase/ssr`).
3. Write and apply `001_initial_schema.sql` migration.
4. Implement `lib/supabase/server.ts`, `client.ts`, and `admin.ts` helpers.
5. Set up `middleware.ts` with session refresh and route protection.
6. Add env var documentation and ensure `SERVICE_ROLE_KEY` is server-only.

### Phase 2 — Auth flows
7. `/register` page + server action → `supabase.auth.signUp` + auto-create `profiles` row.
8. `/login` page + server action → `supabase.auth.signInWithPassword`.
9. `/forgot-password` page → `supabase.auth.resetPasswordForEmail`.
10. `auth/callback/route.ts` → PKCE exchange + redirect to `/dashboard`.
11. Logout button → `supabase.auth.signOut` + redirect to `/login`.

### Phase 3 — Student: lectures
12. `GET /api/lectures` — join with `user_progress` for current user.
13. `/lectures` page — LectureCard grid.
14. `/lectures/[slug]` page — render `content_html`, call `POST /api/progress/[slug]/visit` on load.
15. "Перейти к заданиям" button — active only if `visited = true` (LEC-04).
16. Gate unpublished lectures — return 404 for students (LEC-05, T-08).

### Phase 4 — Student: tasks
17. `GET /api/tasks?lectureId=` — strip `correct_index` for students.
18. `/tasks/[lectureSlug]` page — visit guard, one-question-at-a-time flow.
19. `POST /api/attempts` — server-side correctness check, scoring logic (TASK-07–09).
20. Results screen — correct/total, score earned, total score (TASK-06).
21. Best-score display in dashboard (TASK-11).

### Phase 5 — Dashboard
22. `/dashboard` page — username, status badge, progress bar, lecture list, total score.
23. `lib/utils/status.ts` — score-to-status mapping and progress-to-next-threshold.

### Phase 6 — Diagnostic
24. `/diagnostic` page — intro text + `<iframe>` Google Form (DIAG-01–03).

### Phase 7 — Admin: lectures
25. `GET /api/lectures` (admin variant — all lectures).
26. `POST /api/lectures`, `PATCH /api/lectures/[id]`, `DELETE /api/lectures/[id]`.
27. `POST /api/lectures/[id]/publish` — one-click toggle (ADM-LEC-05).
28. Admin lecture list page with inline publish toggle.
29. Create/edit lecture form with WYSIWYG editor (e.g. TipTap or Quill).

### Phase 8 — Admin: tasks
30. `GET /api/tasks?lectureId=`, `POST /api/tasks`, `PATCH`, `DELETE`.
31. Admin tasks page with lecture selector.
32. Task create/edit form.

### Phase 9 — Admin: users
33. `GET /api/admin/users` — join profiles + auth.users (via service role).
34. `PATCH /api/admin/users/[id]/role`.
35. `POST /api/admin/users/[id]/reset-progress`.
36. `DELETE /api/admin/users/[id]`.
37. Admin users page — table with confirmation dialogs (ADM-USR-05).

### Phase 10 — QA & hardening
38. Run through all 14 acceptance tests (T-01 – T-14).
39. Verify `SUPABASE_SERVICE_ROLE_KEY` absent from client bundle (T-12).
40. Test RLS — student cannot read other users' `user_progress` (T-13).
41. Responsive layout pass (NFR-06).
42. TypeScript strict-mode check — `tsc --noEmit`.

---

## Part 7 — Self-Review: Requirements Coverage

| Requirement ID | Covered by | Status |
|---|---|---|
| AUTH-01 | `middleware.ts` → redirect to `/login` | ✅ |
| AUTH-02 | `/register` + `supabase.auth.signUp` + profiles insert | ✅ |
| AUTH-03 | Login form error handling | ✅ |
| AUTH-04 | Callback route redirects to `/dashboard` | ✅ |
| AUTH-05 | `forgot-password` page + Supabase email link | ✅ |
| AUTH-06 | Logout server action | ✅ |
| AUTH-07 | Middleware admin guard | ✅ |
| LEC-01 | `/lectures` page, `order_index` sort | ✅ |
| LEC-02 | `LectureCard` shows title, description, completed status | ✅ |
| LEC-03 | `/lectures/[slug]` renders `content_html` | ✅ |
| LEC-04 | Visit recorded; button gated on `visited` flag | ✅ |
| LEC-05 | RLS + API 404 for unpublished | ✅ |
| TASK-01 | Visit guard in `/tasks/[slug]` page | ✅ |
| TASK-02 | One question rendered at a time by index | ✅ |
| TASK-03 | 4 options, one correct (stored server-side) | ✅ |
| TASK-04 | `is_correct` returned from `POST /api/attempts` | ✅ |
| TASK-05 | "Далее" button appears after answer | ✅ |
| TASK-06 | ResultsScreen component | ✅ |
| TASK-07 | Every attempt inserted into `task_attempts` | ✅ |
| TASK-08 | Score only on `attempt_number === 1` + correct | ✅ |
| TASK-09 | `user_progress.completed` + `profiles.total_score` updated | ✅ |
| TASK-10 | Retries allowed; no extra scoring | ✅ |
| TASK-11 | `getBestResult()` service method; displayed on dashboard | ✅ |
| DASH-01–05 | Dashboard page + status utils | ✅ |
| DIAG-01–03 | Static page with iframe | ✅ |
| ADM-LEC-01–05 | Admin lectures CRUD + publish toggle | ✅ |
| ADM-TASK-01–04 | Admin tasks CRUD | ✅ |
| ADM-USR-01–05 | Admin users page + confirmation dialogs | ✅ |
| NFR-01 | Middleware on all routes | ✅ |
| NFR-02 | `admin.ts` client server-only; env var never in `NEXT_PUBLIC_` | ✅ |
| NFR-03 | RLS policies on all tables | ✅ |
| NFR-04 | `tsconfig.json` strict: true | ✅ |
| NFR-05 | Server components default; `'use client'` only for forms/events | ✅ |
| NFR-06 | Responsive layout (TailwindCSS breakpoints) | ✅ |

**All 40 requirement IDs are covered. No gaps identified.**

---

## Key implementation notes

**Scoring atomicity.** The `POST /api/attempts` endpoint must run the
correctness check, score update, and `task_attempts` insert in a single
Supabase RPC call (or a Postgres function) to avoid race conditions on
`profiles.total_score`.

**`correct_index` security.** This column must never appear in any API
response for student-facing routes. Strip it explicitly in `TaskService.getTasksForStudent()`.
The server-side check in `POST /api/attempts` fetches it fresh from the DB
using the service-role client.

**WYSIWYG editor.** TipTap (MIT license) is recommended for the admin lecture
editor. Output is sanitized HTML stored in `content_html`. On the student
side, render with `dangerouslySetInnerHTML` inside a sandboxed prose container
with a strict Content-Security-Policy.

**Visit tracking.** `POST /api/progress/[lectureSlug]/visit` is called as a
fire-and-forget `fetch` in a `useEffect` on the lecture page (client component
wrapping the content). The tasks page does a server-side check via
`progressService.hasVisited()` before rendering.
