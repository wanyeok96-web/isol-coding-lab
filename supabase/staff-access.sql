-- ISOL CODING LAB · 가입 코드 + 관리자 승인
-- 교직원 이메일을 미리 모으지 않습니다.
-- 이 SQL을 실행한 뒤, Table Editor에서 아래 두 가지만 직접 넣으세요.
-- 이메일과 가입 코드는 채팅에 붙여넣지 마세요.
--
-- 1) app_settings → invite_code : 선생님들끼리 공유할 가입 코드
-- 2) staff_members → Insert
--      email  : 본인 구글 이메일 (소문자)
--      role   : admin
--      status : approved

create table if not exists public.app_settings (
  id integer primary key default 1 check (id = 1),
  invite_code text not null default ''
);

insert into public.app_settings (id, invite_code)
values (1, '')
on conflict (id) do nothing;

create table if not exists public.staff_members (
  email text primary key,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  status text not null default 'pending' check (status in ('pending', 'approved')),
  created_at timestamptz not null default now()
);

do $$
begin
  if to_regclass('public.staff_emails') is not null then
    insert into public.staff_members (email, role, status)
    select lower(trim(email)), 'staff', 'approved'
    from public.staff_emails
    on conflict (email) do nothing;
  end if;
end $$;

alter table public.app_settings enable row level security;
alter table public.staff_members enable row level security;

create or replace function public.is_approved_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_members
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and role = 'admin'
      and status = 'approved'
  );
$$;

create or replace function public.redeem_invite_code(code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  expected text;
  user_email text;
begin
  user_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  if user_email = '' then
    return false;
  end if;

  select trim(invite_code) into expected
  from public.app_settings
  where id = 1;

  if expected is null or expected = '' then
    return false;
  end if;

  if lower(trim(coalesce(code, ''))) is distinct from lower(expected) then
    return false;
  end if;

  insert into public.staff_members (email, role, status)
  values (user_email, 'staff', 'approved')
  on conflict (email) do update
    set status = 'approved';

  return true;
end;
$$;

create or replace function public.request_staff_access()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  user_email text;
  current_status text;
begin
  user_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  if user_email = '' then
    return 'error';
  end if;

  insert into public.staff_members (email, role, status)
  values (user_email, 'staff', 'pending')
  on conflict (email) do nothing;

  select status into current_status
  from public.staff_members
  where email = user_email;

  return coalesce(current_status, 'pending');
end;
$$;

create or replace function public.approve_staff(target_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_approved_admin() then
    return false;
  end if;

  update public.staff_members
  set status = 'approved'
  where lower(email) = lower(trim(coalesce(target_email, '')));

  return found;
end;
$$;

drop policy if exists "staff can read school programs" on public.programs;
drop policy if exists "staff can read school program makers" on public.program_makers;
drop policy if exists "staff members readable" on public.staff_members;

create policy "staff members readable"
on public.staff_members
for select
to authenticated
using (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or public.is_approved_admin()
);

create policy "staff can read school programs"
on public.programs
for select
to authenticated
using (
  visibility = 'school'
  and exists (
    select 1
    from public.staff_members
    where lower(staff_members.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and staff_members.status = 'approved'
  )
);

create policy "staff can read school program makers"
on public.program_makers
for select
to authenticated
using (
  exists (
    select 1
    from public.programs
    where programs.id = program_makers.program_id
      and programs.visibility = 'school'
      and exists (
        select 1
        from public.staff_members
        where lower(staff_members.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
          and staff_members.status = 'approved'
      )
  )
);

revoke all on public.app_settings from anon, authenticated;
grant select on public.staff_members to authenticated;
grant execute on function public.is_approved_admin() to authenticated;
grant execute on function public.redeem_invite_code(text) to authenticated;
grant execute on function public.request_staff_access() to authenticated;
grant execute on function public.approve_staff(text) to authenticated;

drop table if exists public.staff_emails;
