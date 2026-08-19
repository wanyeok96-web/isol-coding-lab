-- 이 파일은 더 이상 사용하지 않습니다.
-- 새 방식(가입 코드 + 관리자 승인): supabase/staff-access.sql
--
-- ISOL CODING LAB · STEP 13 (이전 방식)
-- 로그인해도 되는 교직원 이메일 명단입니다.

create table if not exists public.staff_emails (
  email text primary key
);

alter table public.staff_emails enable row level security;

create policy "user can check own staff email"
on public.staff_emails
for select
to authenticated
using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

create policy "staff can read school programs"
on public.programs
for select
to authenticated
using (
  visibility = 'school'
  and exists (
    select 1
    from public.staff_emails
    where lower(staff_emails.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
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
        from public.staff_emails
        where lower(staff_emails.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);

grant select on public.staff_emails to authenticated;
