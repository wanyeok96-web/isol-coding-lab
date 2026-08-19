-- ISOL CODING LAB
-- 프로그램에 부서·학년부·교과를 저장합니다.
-- SQL Editor에 붙여넣고 Run 하세요.

alter table public.programs
  add column if not exists unit text not null default '';

create or replace function public.is_valid_program_unit(program_category text, program_unit text)
returns boolean
language sql
immutable
set search_path = public
as $$
  select
    (program_category = '학교업무' and program_unit in (
      '교무기획부', '교육연구부', '학생인권자치부', '예술체육부', '교육과정부',
      '인문사회부', '수리과학부', '교육정보부', '진로진학부', '학년부'
    ))
    or (program_category = '담임업무' and program_unit in ('1학년부', '2학년부', '3학년부'))
    or (program_category = '교과업무' and program_unit in (
      '국어과', '영어과', '수학과', '사회과', '과학과', '예체능과', '제2외국어과', '정보과', '진로과'
    ));
$$;

drop function if exists public.add_program(text, text, text, text, text, text[], text[], text, text, text, text, text);
drop function if exists public.add_program(text, text, text, text, text, text, text[], text[], text, text, text, text, text);
drop function if exists public.update_program(text, text, text, text, text, text, text[], text[], text, text, text, text, text);
drop function if exists public.update_program(text, text, text, text, text, text, text, text[], text[], text, text, text, text, text);

create or replace function public.add_program(
  program_title text,
  program_subtitle text,
  program_description text,
  program_background text,
  program_category text,
  program_unit text,
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
  cleaned_unit text;
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
  cleaned_unit := trim(coalesce(program_unit, ''));
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
  if not public.is_valid_program_unit(program_category, cleaned_unit) then
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
    id, title, subtitle, description, background, category, unit, tags, tools,
    thumbnail, url, github, visibility, featured, likes, created_at, owner_email
  )
  values (
    new_id,
    cleaned_title,
    cleaned_subtitle,
    cleaned_description,
    cleaned_background,
    program_category,
    cleaned_unit,
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
  program_unit text,
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
  cleaned_unit text;
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
  cleaned_unit := trim(coalesce(program_unit, ''));
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
  if not public.is_valid_program_unit(program_category, cleaned_unit) then
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
    unit = cleaned_unit,
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

grant execute on function public.add_program(text, text, text, text, text, text, text[], text[], text, text, text, text, text) to authenticated;
grant execute on function public.update_program(text, text, text, text, text, text, text, text[], text[], text, text, text, text, text) to authenticated;
