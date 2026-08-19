-- ISOL CODING LAB · STEP 16
-- 프로그램 상세의 활용 후기·질문을 저장합니다.
-- SQL Editor에 붙여넣고 Run 하세요.

create table if not exists public.program_comments (
  id uuid primary key default gen_random_uuid(),
  program_id text not null references public.programs (id) on delete cascade,
  email text not null,
  body text not null check (char_length(trim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists program_comments_program_id_created_at_idx
  on public.program_comments (program_id, created_at);

alter table public.program_comments enable row level security;

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

create or replace function public.add_program_comment(target_program_id text, comment_body text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  user_email text;
  visible boolean;
  cleaned text;
  new_row public.program_comments;
begin
  user_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  if user_email = '' then
    return jsonb_build_object('ok', false, 'reason', 'login');
  end if;

  if not public.is_approved_staff() then
    return jsonb_build_object('ok', false, 'reason', 'staff');
  end if;

  cleaned := trim(coalesce(comment_body, ''));
  if char_length(cleaned) < 1 or char_length(cleaned) > 1000 then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
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

  insert into public.program_comments (program_id, email, body)
  values (target_program_id, user_email, cleaned)
  returning * into new_row;

  return jsonb_build_object(
    'ok', true,
    'comment', jsonb_build_object(
      'id', new_row.id,
      'program_id', new_row.program_id,
      'email', new_row.email,
      'body', new_row.body,
      'created_at', new_row.created_at
    )
  );
end;
$$;

create or replace function public.delete_program_comment(target_comment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  user_email text;
  deleted_count integer;
begin
  user_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  if user_email = '' then
    return jsonb_build_object('ok', false, 'reason', 'login');
  end if;

  delete from public.program_comments
  where id = target_comment_id
    and (
      email = user_email
      or exists (
        select 1
        from public.staff_members
        where lower(email) = user_email
          and role = 'admin'
          and status = 'approved'
      )
    );

  get diagnostics deleted_count = row_count;
  if deleted_count = 0 then
    return jsonb_build_object('ok', false, 'reason', 'forbidden');
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

drop policy if exists "comments readable with program" on public.program_comments;

create policy "comments readable with program"
on public.program_comments
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.programs
    where programs.id = program_comments.program_id
      and (
        programs.visibility = 'public'
        or (
          programs.visibility = 'school'
          and public.is_approved_staff()
        )
      )
  )
);

grant select on public.program_comments to anon, authenticated;
grant execute on function public.is_approved_staff() to authenticated;
grant execute on function public.add_program_comment(text, text) to authenticated;
grant execute on function public.delete_program_comment(uuid) to authenticated;
