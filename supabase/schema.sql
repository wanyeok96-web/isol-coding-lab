-- ISOL CODING LAB · STEP 9
-- makers → programs → program_makers
-- 이 파일은 표를 만들기만 합니다. 프로그램 데이터는 아직 넣지 않습니다.

-- 1. 제작자
create table if not exists public.makers (
  id text primary key,
  name text not null,
  subject text not null default '',
  bio text not null default '',
  profile_image text not null default ''
);

-- 2. 프로그램
create table if not exists public.programs (
  id text primary key,
  title text not null,
  subtitle text not null default '',
  description text not null default '',
  background text not null default '',
  category text not null check (category in ('학교업무', '담임업무', '교과업무')),
  tags text[] not null default '{}',
  tools text[] not null default '{}',
  thumbnail text not null default '',
  url text not null default '',
  github text not null default '',
  visibility text not null default 'public' check (visibility in ('public', 'school', 'private')),
  featured boolean not null default false,
  likes integer not null default 0,
  created_at date
);

-- 3. 프로그램 ↔ 제작자 연결 명단
create table if not exists public.program_makers (
  program_id text not null references public.programs (id) on delete cascade,
  maker_id text not null references public.makers (id) on delete cascade,
  primary key (program_id, maker_id)
);

alter table public.makers enable row level security;
alter table public.programs enable row level security;
alter table public.program_makers enable row level security;

create policy "makers are readable"
on public.makers
for select
to anon, authenticated
using (true);

create policy "public programs are readable"
on public.programs
for select
to anon, authenticated
using (visibility = 'public');

create policy "public program makers are readable"
on public.program_makers
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.programs
    where programs.id = program_makers.program_id
      and programs.visibility = 'public'
  )
);

grant select on public.makers, public.programs, public.program_makers to anon, authenticated;
