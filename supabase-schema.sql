-- 사용자 프로필
create table profiles (
  id uuid primary key default gen_random_uuid(),
  device_id text unique not null,
  height numeric not null,
  weight numeric not null,
  age integer not null,
  gender text not null check (gender in ('male', 'female')),
  activity text not null check (activity in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  tdee integer not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 음식 기록
create table food_records (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  date text not null,
  food_name text not null,
  calories integer not null,
  tag text not null check (tag in ('good', 'caution', 'normal')),
  source text not null check (source in ('search', 'manual', 'quick')),
  added_at timestamptz default now()
);

-- 하루 요약
create table day_summaries (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  date text not null,
  target_calories integer not null,
  total_calories integer not null,
  food_count integer not null,
  highest_food text not null default '',
  achievement_rate integer not null default 0,
  created_at timestamptz default now()
);

-- 인덱스
create index idx_food_records_device_date on food_records (device_id, date);
create index idx_day_summaries_device_date on day_summaries (device_id, date);
create index idx_profiles_device on profiles (device_id);

-- RLS (Row Level Security) 활성화
alter table profiles enable row level security;
alter table food_records enable row level security;
alter table day_summaries enable row level security;

-- 익명 접근 정책 (anon key로 모든 CRUD 허용 — device_id로 자기 데이터만 접근)
create policy "profiles_all" on profiles for all using (true) with check (true);
create policy "food_records_all" on food_records for all using (true) with check (true);
create policy "day_summaries_all" on day_summaries for all using (true) with check (true);
