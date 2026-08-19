-- ISOL CODING LAB · STEP 15
-- 교직원이 누른 좋아요를 저장합니다.
-- SQL Editor에 붙여넣고 Run 하세요.

create table if not exists public.program_likes (
  program_id text not null references public.programs (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  primary key (program_id, email)
);

alter table public.program_likes enable row level security;

create or replace function public.is_approved_staff()
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
      and status = 'approved'
  );
$$;

create or replace function public.toggle_program_like(target_program_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  user_email text;
  already boolean;
  like_count integer;
  visible boolean;
begin
  user_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  if user_email = '' then
    return jsonb_build_object('ok', false, 'reason', 'login');
  end if;

  if not public.is_approved_staff() then
    return jsonb_build_object('ok', false, 'reason', 'staff');
  end if;

  select exists (
    select 1
    from public.programs
    where id = target_program_id
      and (
        visibility = 'public'
        or (visibility = 'school' and public.is_approved_staff())
      )
  ) into visible;

  if not visible then
    return jsonb_build_object('ok', false, 'reason', 'missing');
  end if;

  select exists (
    select 1
    from public.program_likes
    where program_id = target_program_id
      and email = user_email
  ) into already;

  if already then
    delete from public.program_likes
    where program_id = target_program_id
      and email = user_email;

    update public.programs
    set likes = greatest(likes - 1, 0)
    where id = target_program_id;
  else
    insert into public.program_likes (program_id, email)
    values (target_program_id, user_email);

    update public.programs
    set likes = likes + 1
    where id = target_program_id;
  end if;

  select likes into like_count
  from public.programs
  where id = target_program_id;

  return jsonb_build_object('ok', true, 'liked', not already, 'likes', like_count);
end;
$$;

drop policy if exists "staff can read own likes" on public.program_likes;

create policy "staff can read own likes"
on public.program_likes
for select
to authenticated
using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

grant select on public.program_likes to authenticated;
grant execute on function public.is_approved_staff() to authenticated;
grant execute on function public.toggle_program_like(text) to authenticated;
