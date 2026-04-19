# CLAUDE.md — Проект «Числитель»

## Обзор проекта
«Числитель» — образовательный веб-сайт для изучения числительных русского языка. Целевая аудитория: школьники и студенты. Основные функции: лекции, тесты с начислением баллов, диагностика уровня, личный кабинет с прогрессом, админ-панель для управления контентом.

---

## Технический стек

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Язык:** TypeScript
- **Стили:** Tailwind CSS
- **UI-компоненты:** shadcn/ui
- **Состояние:** React Context + useReducer (локальное), Zustand (глобальное если потребуется)

### Backend / BaaS
- **Platform:** Supabase
  - **Auth:** Supabase Auth (email + пароль)
  - **Database:** PostgreSQL (через Supabase)
  - **Realtime:** не используется на старте
  - **Storage:** Supabase Storage (для медиафайлов лекций, если появятся)

### Деплой
- **Frontend:** Vercel
- **Backend:** Supabase Cloud (free tier на старте)

---

## Архитектура приложения

```
числитель/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Группа маршрутов — без layout сайта
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/                 # Авторизованная зона
│   │   ├── layout.tsx          # Общий layout с навигацией
│   │   ├── dashboard/page.tsx  # Личный кабинет
│   │   ├── diagnostic/page.tsx # Диагностический тест
│   │   ├── lectures/
│   │   │   ├── page.tsx        # Список лекций
│   │   │   └── [slug]/page.tsx # Конкретная лекция
│   │   └── tasks/
│   │       └── [lectureSlug]/page.tsx  # Задания по лекции
│   ├── admin/                  # Защищённая зона (только role=admin)
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Дашборд админа
│   │   ├── lectures/
│   │   │   ├── page.tsx        # Список + создание лекций
│   │   │   └── [id]/page.tsx   # Редактирование лекции
│   │   └── tasks/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   └── api/                    # Route Handlers (если нужна серверная логика)
├── components/
│   ├── ui/                     # shadcn/ui компоненты
│   ├── auth/                   # LoginForm, RegisterForm
│   ├── lectures/               # LectureCard, LectureContent
│   ├── tasks/                  # QuestionCard, ScoreDisplay
│   ├── dashboard/              # ProgressBar, BadgeCard, StatsPanel
│   └── admin/                  # AdminTable, LectureEditor, TaskEditor
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Supabase browser client
│   │   ├── server.ts           # Supabase server client (для SSR)
│   │   └── middleware.ts       # Auth middleware
│   ├── hooks/                  # useUser, useLectures, useTasks, useScore
│   └── utils/                  # Вспомогательные функции
├── types/
│   └── index.ts                # Типы: User, Lecture, Task, Question, Score
├── middleware.ts               # Защита маршрутов (redirect если не авторизован)
└── supabase/
    └── migrations/             # SQL-миграции схемы БД
```

---

## Схема базы данных (PostgreSQL / Supabase)

### Таблицы

```sql
-- Профили пользователей (расширение auth.users)
profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  username text,
  role text DEFAULT 'student',  -- 'student' | 'admin'
  total_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
)

-- Лекции
lectures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,         -- HTML или Markdown
  order_index integer NOT NULL,  -- порядок отображения
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
)

-- Задания (принадлежат лекции)
tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id uuid REFERENCES lectures(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL,        -- ["вариант1", "вариант2", ...]
  correct_index integer NOT NULL,
  score_value integer DEFAULT 10,
  order_index integer NOT NULL
)

-- Прогресс пользователя
user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  lecture_id uuid REFERENCES lectures(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  score_earned integer DEFAULT 0,
  completed_at timestamptz,
  UNIQUE(user_id, lecture_id)
)

-- Результаты попыток заданий
task_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  selected_index integer,
  is_correct boolean,
  attempted_at timestamptz DEFAULT now()
)
```

### Row Level Security (RLS)
- `profiles`: пользователь видит и редактирует только свою запись; admin видит всех
- `lectures`: все авторизованные читают опубликованные; admin — все
- `tasks`: все авторизованные читают; admin — полный CRUD
- `user_progress`: пользователь видит только свои записи
- `task_attempts`: пользователь видит только свои попытки

---

## Система баллов и номинаций

| Диапазон баллов | Статус        |
|-----------------|---------------|
| 0–99            | Новичок       |
| 100–299         | Ученик        |
| 300–599         | Знаток        |
| 600–999         | Мастер        |
| 1000+           | Числитель ⭐   |

Баллы начисляются за правильные ответы в заданиях. Каждый вопрос = `score_value` баллов (по умолчанию 10). Повторное прохождение не даёт новых баллов.

---

## Аутентификация и маршруты

- Все маршруты `/` требуют авторизации → redirect на `/login`
- Маршруты `/admin/*` требуют `role = 'admin'` → redirect на `/dashboard`
- Middleware Next.js проверяет сессию Supabase при каждом запросе
- После логина → redirect на `/dashboard`

---

## Соглашения и конвенции

### Код
- TypeScript strict mode включён
- Компоненты — функциональные, с именованным экспортом
- Серверные компоненты по умолчанию; `'use client'` только там, где нужны хуки/события
- Файлы: `kebab-case` для файлов, `PascalCase` для компонентов

### Git
- Ветки: `main` (prod), `dev` (разработка), `feature/*` (новые фичи)
- Коммиты: `feat:`, `fix:`, `chore:`, `refactor:`

### Переменные окружения
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # только серверная сторона, никогда не в клиент
```

---

## Внешние интеграции
- **Google Forms** — диагностический тест встраивается через `<iframe>` на странице `/diagnostic`
- **Vercel Analytics** — базовая аналитика посещений (опционально)
