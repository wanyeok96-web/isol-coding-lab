-- ISOL CODING LAB · STEP 17
-- 아이디어 목록과 제안을 저장합니다.
-- SQL Editor에 붙여넣고 Run 하세요.

create table if not exists public.ideas (
  id text primary key,
  title text not null,
  description text not null,
  category text not null check (category in ('학교업무', '담임업무', '교과업무')),
  author text not null default '',
  author_email text not null default '',
  likes integer not null default 0,
  status text not null default 'open' check (status in ('open', 'recruiting', 'building', 'completed')),
  program_id text references public.programs (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.idea_developers (
  idea_id text not null references public.ideas (id) on delete cascade,
  maker_id text not null references public.makers (id) on delete cascade,
  primary key (idea_id, maker_id)
);

alter table public.ideas enable row level security;
alter table public.idea_developers enable row level security;

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

create or replace function public.add_idea(idea_title text, idea_description text, idea_category text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  user_email text;
  cleaned_title text;
  cleaned_description text;
  author_name text;
  new_id text;
begin
  user_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  if user_email = '' then
    return jsonb_build_object('ok', false, 'reason', 'login');
  end if;

  if not public.is_approved_staff() then
    return jsonb_build_object('ok', false, 'reason', 'staff');
  end if;

  cleaned_title := trim(coalesce(idea_title, ''));
  cleaned_description := trim(coalesce(idea_description, ''));

  if char_length(cleaned_title) < 2 or char_length(cleaned_title) > 80 then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;

  if char_length(cleaned_description) < 10 or char_length(cleaned_description) > 1000 then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;

  if idea_category not in ('학교업무', '담임업무', '교과업무') then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;

  author_name := split_part(user_email, '@', 1);
  new_id := 'idea-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);

  insert into public.ideas (id, title, description, category, author, author_email, likes, status)
  values (new_id, cleaned_title, cleaned_description, idea_category, author_name, user_email, 0, 'open');

  return jsonb_build_object('ok', true, 'id', new_id);
end;
$$;

create or replace function public.update_idea(
  target_idea_id text,
  idea_title text,
  idea_description text,
  idea_category text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  user_email text;
  cleaned_title text;
  cleaned_description text;
  updated_count integer;
begin
  user_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  if user_email = '' then
    return jsonb_build_object('ok', false, 'reason', 'login');
  end if;

  if not public.is_approved_staff() then
    return jsonb_build_object('ok', false, 'reason', 'staff');
  end if;

  cleaned_title := trim(coalesce(idea_title, ''));
  cleaned_description := trim(coalesce(idea_description, ''));

  if char_length(cleaned_title) < 2 or char_length(cleaned_title) > 80 then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;

  if char_length(cleaned_description) < 10 or char_length(cleaned_description) > 1000 then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;

  if idea_category not in ('학교업무', '담임업무', '교과업무') then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;

  update public.ideas
  set
    title = cleaned_title,
    description = cleaned_description,
    category = idea_category
  where id = target_idea_id
    and author_email <> ''
    and lower(author_email) = user_email;

  get diagnostics updated_count = row_count;
  if updated_count = 0 then
    return jsonb_build_object('ok', false, 'reason', 'forbidden');
  end if;

  return jsonb_build_object('ok', true, 'id', target_idea_id);
end;
$$;

create or replace function public.delete_idea(target_idea_id text)
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

  if not public.is_approved_staff() then
    return jsonb_build_object('ok', false, 'reason', 'staff');
  end if;

  delete from public.ideas
  where id = target_idea_id
    and (
      (author_email <> '' and lower(author_email) = user_email)
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

drop policy if exists "ideas are readable" on public.ideas;
drop policy if exists "idea developers are readable" on public.idea_developers;

create policy "ideas are readable"
on public.ideas
for select
to anon, authenticated
using (true);

create policy "idea developers are readable"
on public.idea_developers
for select
to anon, authenticated
using (true);

grant select on public.ideas, public.idea_developers to anon, authenticated;
grant execute on function public.is_approved_staff() to authenticated;
grant execute on function public.add_idea(text, text, text) to authenticated;
grant execute on function public.update_idea(text, text, text, text) to authenticated;
grant execute on function public.delete_idea(text) to authenticated;
