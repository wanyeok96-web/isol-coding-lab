-- ISOL CODING LAB · STEP 19
-- 교직원이 프로그램을 등록·수정하고, 관리자는 삭제할 수 있습니다.
-- SQL Editor에 붙여넣고 Run 하세요.

alter table public.programs
  add column if not exists owner_email text not null default '';

alter table public.makers
  add column if not exists email text not null default '';

create unique index if not exists makers_email_unique
  on public.makers (lower(email))
  where email <> '';

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

create or replace function public.add_program(
  program_title text,
  program_subtitle text,
  program_description text,
  program_background text,
  program_category text,
  program_tags text[],
  program_tools text[],
  program_url text,
  program_github text,
  program_visibility text,
  maker_name text,
  maker_subject text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  user_email text;
  cleaned_title text;
  cleaned_subtitle text;
  cleaned_description text;
  cleaned_background text;
  cleaned_url text;
  cleaned_github text;
  cleaned_maker_name text;
  cleaned_maker_subject text;
  new_id text;
  maker_id text;
begin
  user_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  if user_email = '' then
    return jsonb_build_object('ok', false, 'reason', 'login');
  end if;

  if not public.is_approved_staff() then
    return jsonb_build_object('ok', false, 'reason', 'staff');
  end if;

  cleaned_title := trim(coalesce(program_title, ''));
  cleaned_subtitle := trim(coalesce(program_subtitle, ''));
  cleaned_description := trim(coalesce(program_description, ''));
  cleaned_background := trim(coalesce(program_background, ''));
  cleaned_url := trim(coalesce(program_url, ''));
  cleaned_github := trim(coalesce(program_github, ''));
  cleaned_maker_name := trim(coalesce(maker_name, ''));
  cleaned_maker_subject := trim(coalesce(maker_subject, ''));

  if cleaned_url in ('#', '/') then
    cleaned_url := '';
  end if;
  if cleaned_github in ('#', '/') then
    cleaned_github := '';
  end if;

  if char_length(cleaned_title) < 2 or char_length(cleaned_title) > 80 then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;
  if char_length(cleaned_subtitle) > 80 then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;
  if char_length(cleaned_description) < 10 or char_length(cleaned_description) > 2000 then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;
  if char_length(cleaned_background) > 2000 then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;
  if char_length(cleaned_maker_name) < 2 or char_length(cleaned_maker_name) > 40 then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;
  if program_category not in ('학교업무', '담임업무', '교과업무') then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;
  if coalesce(program_visibility, '') not in ('public', 'school') then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;
  if cleaned_url <> '' and cleaned_url !~* '^https?://' then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;
  if cleaned_github <> '' and cleaned_github !~* '^https?://' then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;
  if coalesce(cardinality(program_tags), 0) > 8 or coalesce(cardinality(program_tools), 0) > 8 then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;

  if cleaned_background = '' then
    cleaned_background := cleaned_description;
  end if;

  select id into maker_id
  from public.makers
  where email <> ''
    and lower(email) = user_email
  limit 1;

  if maker_id is null then
    maker_id := 'maker-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);
    insert into public.makers (id, name, subject, bio, profile_image, email)
    values (maker_id, cleaned_maker_name, cleaned_maker_subject, '', '', user_email);
  else
    update public.makers
    set name = cleaned_maker_name,
        subject = cleaned_maker_subject
    where id = maker_id;
  end if;

  new_id := 'prog-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);

  insert into public.programs (
    id, title, subtitle, description, background, category, tags, tools,
    thumbnail, url, github, visibility, featured, likes, created_at, owner_email
  )
  values (
    new_id,
    cleaned_title,
    cleaned_subtitle,
    cleaned_description,
    cleaned_background,
    program_category,
    coalesce(program_tags, '{}'),
    coalesce(program_tools, '{}'),
    '',
    cleaned_url,
    cleaned_github,
    program_visibility,
    false,
    0,
    current_date,
    user_email
  );

  insert into public.program_makers (program_id, maker_id)
  values (new_id, maker_id)
  on conflict do nothing;

  return jsonb_build_object('ok', true, 'id', new_id);
end;
$$;

create or replace function public.update_program(
  target_program_id text,
  program_title text,
  program_subtitle text,
  program_description text,
  program_background text,
  program_category text,
  program_tags text[],
  program_tools text[],
  program_url text,
  program_github text,
  program_visibility text,
  maker_name text,
  maker_subject text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  user_email text;
  cleaned_title text;
  cleaned_subtitle text;
  cleaned_description text;
  cleaned_background text;
  cleaned_url text;
  cleaned_github text;
  cleaned_maker_name text;
  cleaned_maker_subject text;
  updated_count integer;
begin
  user_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  if user_email = '' then
    return jsonb_build_object('ok', false, 'reason', 'login');
  end if;

  if not public.is_approved_staff() then
    return jsonb_build_object('ok', false, 'reason', 'staff');
  end if;

  cleaned_title := trim(coalesce(program_title, ''));
  cleaned_subtitle := trim(coalesce(program_subtitle, ''));
  cleaned_description := trim(coalesce(program_description, ''));
  cleaned_background := trim(coalesce(program_background, ''));
  cleaned_url := trim(coalesce(program_url, ''));
  cleaned_github := trim(coalesce(program_github, ''));
  cleaned_maker_name := trim(coalesce(maker_name, ''));
  cleaned_maker_subject := trim(coalesce(maker_subject, ''));

  if cleaned_url in ('#', '/') then
    cleaned_url := '';
  end if;
  if cleaned_github in ('#', '/') then
    cleaned_github := '';
  end if;

  if char_length(cleaned_title) < 2 or char_length(cleaned_title) > 80 then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;
  if char_length(cleaned_subtitle) > 80 then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;
  if char_length(cleaned_description) < 10 or char_length(cleaned_description) > 2000 then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;
  if char_length(cleaned_background) > 2000 then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;
  if char_length(cleaned_maker_name) < 2 or char_length(cleaned_maker_name) > 40 then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;
  if program_category not in ('학교업무', '담임업무', '교과업무') then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;
  if coalesce(program_visibility, '') not in ('public', 'school') then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;
  if cleaned_url <> '' and cleaned_url !~* '^https?://' then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;
  if cleaned_github <> '' and cleaned_github !~* '^https?://' then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;
  if coalesce(cardinality(program_tags), 0) > 8 or coalesce(cardinality(program_tools), 0) > 8 then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;

  if cleaned_background = '' then
    cleaned_background := cleaned_description;
  end if;

  update public.programs
  set
    title = cleaned_title,
    subtitle = cleaned_subtitle,
    description = cleaned_description,
    background = cleaned_background,
    category = program_category,
    tags = coalesce(program_tags, '{}'),
    tools = coalesce(program_tools, '{}'),
    url = cleaned_url,
    github = cleaned_github,
    visibility = program_visibility
  where id = target_program_id
    and owner_email <> ''
    and lower(owner_email) = user_email;

  get diagnostics updated_count = row_count;
  if updated_count = 0 then
    return jsonb_build_object('ok', false, 'reason', 'forbidden');
  end if;

  update public.makers
  set name = cleaned_maker_name,
      subject = cleaned_maker_subject
  where email <> ''
    and lower(email) = user_email;

  return jsonb_build_object('ok', true, 'id', target_program_id);
end;
$$;

create or replace function public.delete_program(target_program_id text)
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

  delete from public.programs
  where id = target_program_id
    and (
      (owner_email <> '' and lower(owner_email) = user_email)
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

grant execute on function public.is_approved_staff() to authenticated;
grant execute on function public.add_program(text, text, text, text, text, text[], text[], text, text, text, text, text) to authenticated;
grant execute on function public.update_program(text, text, text, text, text, text, text[], text[], text, text, text, text, text) to authenticated;
grant execute on function public.delete_program(text) to authenticated;
