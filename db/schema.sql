-- Novaris AI Training & Publishing — database schema
-- Safe to run repeatedly: every object uses IF NOT EXISTS.

-- ---------------------------------------------------------------- users
CREATE TABLE IF NOT EXISTS users (
  id                   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email                TEXT NOT NULL UNIQUE,
  password_hash        TEXT NOT NULL,
  full_name            TEXT NOT NULL,
  avatar_color         TEXT NOT NULL DEFAULT '#7c3aed',
  country              TEXT NOT NULL DEFAULT 'Uganda',
  preferred_currency   TEXT NOT NULL DEFAULT 'USD' CHECK (preferred_currency IN ('USD','EUR','GBP','AED','INR','NGN','KES','UGX')),
  preferred_language   TEXT NOT NULL DEFAULT 'English',
  timezone             TEXT NOT NULL DEFAULT 'UTC',
  plan                 TEXT NOT NULL DEFAULT 'Free' CHECK (plan IN ('Free','Pro','Teams')),
  weekly_goal_lessons  INT  NOT NULL DEFAULT 5  CHECK (weekly_goal_lessons BETWEEN 1 AND 50),
  weekly_goal_minutes  INT  NOT NULL DEFAULT 120 CHECK (weekly_goal_minutes BETWEEN 10 AND 1500),
  is_demo              BOOLEAN NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS users_country_idx ON users (country);

-- ---------------------------------------------------------------- courses
CREATE TABLE IF NOT EXISTS courses (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug             TEXT NOT NULL UNIQUE,
  title            TEXT NOT NULL,
  subtitle         TEXT NOT NULL,
  category         TEXT NOT NULL CHECK (category IN ('AI Basics','Prompt Engineering','AI for Business','AI Agents','Cloud & AI','AI for Teachers')),
  level            TEXT NOT NULL CHECK (level IN ('Beginner','Intermediate','Advanced')),
  language         TEXT NOT NULL DEFAULT 'English',
  description      TEXT NOT NULL,
  what_you_learn   JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_minutes INT  NOT NULL DEFAULT 0,
  price_usd        NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price_usd >= 0),
  rating           NUMERIC(2,1) NOT NULL DEFAULT 0,
  rating_count     INT  NOT NULL DEFAULT 0,
  instructor_name  TEXT NOT NULL,
  instructor_bio   TEXT NOT NULL DEFAULT '',
  cover_gradient   JSONB NOT NULL DEFAULT '["#7c3aed","#2563eb"]'::jsonb,
  is_featured      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS courses_filter_idx ON courses (category, level, language);

-- ---------------------------------------------------------------- lessons
CREATE TABLE IF NOT EXISTS lessons (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_id        BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  order_index      INT  NOT NULL,
  duration_minutes INT  NOT NULL DEFAULT 10,
  video_url        TEXT NOT NULL DEFAULT '',
  notes            TEXT NOT NULL DEFAULT '',
  is_free_preview  BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (course_id, order_index)
);
CREATE INDEX IF NOT EXISTS lessons_course_idx ON lessons (course_id);

-- ---------------------------------------------------------------- quiz_questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lesson_id     BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question      TEXT NOT NULL,
  options       JSONB NOT NULL,
  correct_index INT  NOT NULL CHECK (correct_index >= 0),
  explanation   TEXT NOT NULL DEFAULT '',
  UNIQUE (lesson_id, question)
);
CREATE INDEX IF NOT EXISTS quiz_questions_lesson_idx ON quiz_questions (lesson_id);

-- ---------------------------------------------------------------- enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id          BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id        BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed')),
  progress_percent INT  NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  enrolled_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at     TIMESTAMPTZ,
  UNIQUE (user_id, course_id)
);
CREATE INDEX IF NOT EXISTS enrollments_user_idx ON enrollments (user_id);
CREATE INDEX IF NOT EXISTS enrollments_course_idx ON enrollments (course_id);

-- ---------------------------------------------------------------- lesson_progress
CREATE TABLE IF NOT EXISTS lesson_progress (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id     BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed     BOOLEAN NOT NULL DEFAULT FALSE,
  minutes_spent INT NOT NULL DEFAULT 0,
  quiz_score    INT CHECK (quiz_score BETWEEN 0 AND 100),
  completed_at  TIMESTAMPTZ,
  UNIQUE (user_id, lesson_id)
);
CREATE INDEX IF NOT EXISTS lesson_progress_user_idx ON lesson_progress (user_id);
CREATE INDEX IF NOT EXISTS lesson_progress_lesson_idx ON lesson_progress (lesson_id);
CREATE INDEX IF NOT EXISTS lesson_progress_completed_idx ON lesson_progress (user_id, completed_at);

-- ---------------------------------------------------------------- certificates
CREATE TABLE IF NOT EXISTS certificates (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id          BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id        BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  certificate_code TEXT NOT NULL UNIQUE,
  issued_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
CREATE INDEX IF NOT EXISTS certificates_user_idx ON certificates (user_id);
CREATE INDEX IF NOT EXISTS certificates_course_idx ON certificates (course_id);

-- ---------------------------------------------------------------- ebooks
CREATE TABLE IF NOT EXISTS ebooks (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug           TEXT NOT NULL UNIQUE,
  title          TEXT NOT NULL,
  subtitle       TEXT NOT NULL,
  author_name    TEXT NOT NULL,
  author_country TEXT NOT NULL,
  category       TEXT NOT NULL,
  page_count     INT  NOT NULL,
  price_usd      NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price_usd >= 0),
  description    TEXT NOT NULL,
  sample_text    TEXT NOT NULL,
  cover_gradient JSONB NOT NULL DEFAULT '["#7c3aed","#2563eb"]'::jsonb,
  is_bestseller  BOOLEAN NOT NULL DEFAULT FALSE,
  published_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ebooks_category_idx ON ebooks (category);

CREATE TABLE IF NOT EXISTS ebook_purchases (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id        BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ebook_id       BIGINT NOT NULL REFERENCES ebooks(id) ON DELETE CASCADE,
  price_paid_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency_shown TEXT NOT NULL DEFAULT 'USD',
  purchased_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, ebook_id)
);
CREATE INDEX IF NOT EXISTS ebook_purchases_user_idx ON ebook_purchases (user_id);
CREATE INDEX IF NOT EXISTS ebook_purchases_ebook_idx ON ebook_purchases (ebook_id);

-- ---------------------------------------------------------------- live classes
CREATE TABLE IF NOT EXISTS live_classes (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title            TEXT NOT NULL UNIQUE,
  instructor_name  TEXT NOT NULL,
  topic            TEXT NOT NULL,
  language         TEXT NOT NULL,
  level            TEXT NOT NULL CHECK (level IN ('Beginner','Intermediate','Advanced')),
  start_time       TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  capacity         INT NOT NULL CHECK (capacity > 0)
);
CREATE INDEX IF NOT EXISTS live_classes_start_idx ON live_classes (start_time);

CREATE TABLE IF NOT EXISTS class_bookings (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id  BIGINT NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
  booked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, class_id)
);
CREATE INDEX IF NOT EXISTS class_bookings_user_idx ON class_bookings (user_id);
CREATE INDEX IF NOT EXISTS class_bookings_class_idx ON class_bookings (class_id);

-- ---------------------------------------------------------------- forms
CREATE TABLE IF NOT EXISTS manuscript_submissions (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id      BIGINT REFERENCES users(id) ON DELETE SET NULL,
  author_name  TEXT NOT NULL,
  email        TEXT NOT NULL,
  country      TEXT NOT NULL,
  book_title   TEXT NOT NULL,
  genre        TEXT NOT NULL,
  summary      TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received','under_review','accepted','declined')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS manuscript_submissions_user_idx ON manuscript_submissions (user_id);

CREATE TABLE IF NOT EXISTS contact_messages (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  country    TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------- digital products
CREATE TABLE IF NOT EXISTS digital_products (
  id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug               TEXT NOT NULL UNIQUE,
  title              TEXT NOT NULL,
  subtitle           TEXT NOT NULL,
  category           TEXT NOT NULL CHECK (category IN ('AI Basics','Prompt Engineering','AI for Business','AI Agents','Cloud & AI','AI for Teachers')),
  product_type       TEXT NOT NULL CHECK (product_type IN ('Prompt Pack','Template','Toolkit','Workbook','Cheat Sheet','Bundle')),
  level              TEXT NOT NULL CHECK (level IN ('Beginner','Intermediate','Advanced')),
  format             TEXT NOT NULL CHECK (format IN ('PDF','DOCX','XLSX','Notion','ZIP')),
  file_size          TEXT NOT NULL,
  page_or_item_count TEXT NOT NULL,
  price_usd          NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price_usd >= 0),
  rating             NUMERIC(2,1) NOT NULL DEFAULT 0,
  download_count     INT NOT NULL DEFAULT 0,
  description        TEXT NOT NULL,
  whats_included     JSONB NOT NULL DEFAULT '[]'::jsonb,
  preview_items      JSONB NOT NULL DEFAULT '[]'::jsonb,
  cover_gradient     JSONB NOT NULL DEFAULT '["#7c3aed","#2563eb"]'::jsonb,
  is_featured        BOOLEAN NOT NULL DEFAULT FALSE,
  is_bestseller      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS digital_products_filter_idx ON digital_products (category, product_type, level);

CREATE TABLE IF NOT EXISTS product_bundles (
  id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id          BIGINT NOT NULL REFERENCES digital_products(id) ON DELETE CASCADE,
  included_product_id BIGINT NOT NULL REFERENCES digital_products(id) ON DELETE CASCADE,
  UNIQUE (product_id, included_product_id)
);
CREATE INDEX IF NOT EXISTS product_bundles_product_idx ON product_bundles (product_id);
CREATE INDEX IF NOT EXISTS product_bundles_included_idx ON product_bundles (included_product_id);

CREATE TABLE IF NOT EXISTS product_purchases (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id        BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id     BIGINT NOT NULL REFERENCES digital_products(id) ON DELETE CASCADE,
  price_paid_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency_shown TEXT NOT NULL DEFAULT 'USD',
  purchased_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
CREATE INDEX IF NOT EXISTS product_purchases_user_idx ON product_purchases (user_id);
CREATE INDEX IF NOT EXISTS product_purchases_product_idx ON product_purchases (product_id);

-- ---------------------------------------------------------------- rate limiting
-- Shared across serverless instances (in-memory counters would not be).
CREATE TABLE IF NOT EXISTS rate_limits (
  key          TEXT PRIMARY KEY,
  hits         INT NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now()
);
