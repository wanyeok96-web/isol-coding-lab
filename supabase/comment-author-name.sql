-- ISOL CODING LAB
-- 활용 후기에 구글 아이디 대신 교사 이름을 저장하고 보여 줍니다.
-- SQL Editor에 붙여넣고 Run 하세요.

alter table public.program_comments
  add column if not exists author_name text not null default '';

create or replace function public.staff_display_name(target_email text)
returns text
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  normalized text;
  login_id text;
  maker_name text;
  google_name text;
begin
  normalized := lower(trim(coalesce(target_email, '')));
  if normalized = '' then
    return '';
  end if;

  login_id := split_part(normalized, '@', 1);

  select nullif(trim(m.name), '')
    into maker_name
  from public.makers m
  where m.email <> ''
    and lower(m.email) = normalized
  limit 1;

  select coalesce(
    nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(u.raw_user_meta_data->>'name'), ''),
    nullif(trim(concat(coalesce(u.raw_user_meta_data->>'family_name', ''), coalesce(u.raw_user_meta_data->>'given_name', ''))), ''),
    nullif(trim(u.raw_user_meta_data->>'given_name'), '')
  )
    into google_name
  from auth.users u
  where lower(u.email) = normalized
  limit 1;

  if maker_name is not null and maker_name ~ '[가-힣]' then
    return maker_name;
  end if;
  if google_name is not null and google_name ~ '[가-힣]' then
    return google_name;
  end if;
  if maker_name is not null and lower(maker_name) is distinct from login_id then
    return maker_name;
  end if;
  if google_name is not null and lower(google_name) is distinct from login_id then
    return google_name;
  end if;

  return '';
end;
$$;

create or replace function public.list_program_comments(target_program_id text)
returns table (
  id uuid,
  program_id text,
  email text,
  author_name text,
  body text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    c.id,
    c.program_id,
    c.email,
    coalesce(nullif(trim(c.author_name), ''), public.staff_display_name(c.email), '') as author_name,
    c.body,
    c.created_at
  from public.program_comments c
  join public.programs p on p.id = c.program_id
  where c.program_id = target_program_id
    and (
      p.visibility = 'public'
      or (p.visibility = 'school' and public.is_approved_staff())
    )
  order by c.created_at asc;
$$;

create or replace function public.add_program_comment(target_program_id text, comment_body text)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  user_email text;
  visible boolean;
  cleaned text;
  resolved_name text;
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

  resolved_name := public.staff_display_name(user_email);

  insert into public.program_comments (program_id, email, body, author_name)
  values (target_program_id, user_email, cleaned, resolved_name)
  returning * into new_row;

  return jsonb_build_object(
    'ok', true,
    'comment', jsonb_build_object(
      'id', new_row.id,
      'program_id', new_row.program_id,
      'email', new_row.email,
      'author_name', new_row.author_name,
      'body', new_row.body,
      'created_at', new_row.created_at
    )
  );
end;
$$;

create or replace function public.ensure_staff_maker(
  display_name text default '',
  avatar_url text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  user_email text;
  cleaned_name text;
  cleaned_avatar text;
  maker_id text;
begin
  user_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  if user_email = '' then
    return jsonb_build_object('ok', false, 'reason', 'login');
  end if;

  if not public.is_approved_staff() then
    return jsonb_build_object('ok', false, 'reason', 'staff');
  end if;

  cleaned_name := trim(coalesce(display_name, ''));
  if cleaned_name = '' or lower(cleaned_name) = split_part(user_email, '@', 1) then
    cleaned_name := public.staff_display_name(user_email);
  end if;
  if cleaned_name = '' then
    cleaned_name := split_part(user_email, '@', 1);
  end if;
  if char_length(cleaned_name) > 40 then
    cleaned_name := left(cleaned_name, 40);
  end if;

  cleaned_avatar := trim(coalesce(avatar_url, ''));
  if cleaned_avatar <> '' and cleaned_avatar !~* '^https?://' then
    cleaned_avatar := '';
  end if;

  select id into maker_id
  from public.makers
  where email <> ''
    and lower(email) = user_email
  limit 1;

  if maker_id is null then
    maker_id := 'maker-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);
    insert into public.makers (id, name, subject, bio, profile_image, email)
    values (
      maker_id,
      cleaned_name,
      '',
      '이솔고등학교에서 수업과 업무 도구를 만들고 있습니다.',
      cleaned_avatar,
      user_email
    );
  else
    update public.makers
    set name = case
      when trim(coalesce(name, '')) = '' then cleaned_name
      when lower(trim(name)) = split_part(user_email, '@', 1)
        and cleaned_name <> ''
        and lower(cleaned_name) is distinct from split_part(user_email, '@', 1)
        then cleaned_name
      when name !~ '[가-힣]' and cleaned_name ~ '[가-힣]' then cleaned_name
      else name
    end,
        profile_image = case when cleaned_avatar = '' then profile_image else cleaned_avatar end
    where id = maker_id;
  end if;

  return jsonb_build_object('ok', true, 'id', maker_id);
end;
$$;

update public.program_comments
set author_name = public.staff_display_name(email)
where coalesce(trim(author_name), '') = '';

grant execute on function public.list_program_comments(text) to anon, authenticated;
grant execute on function public.add_program_comment(text, text) to authenticated;
grant execute on function public.ensure_staff_maker(text, text) to authenticated;
