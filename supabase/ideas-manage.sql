-- ISOL CODING LAB · 아이디어 수정·삭제
-- 이미 ideas.sql을 실행한 뒤에 이 파일만 Run 하세요.

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

grant execute on function public.update_idea(text, text, text, text) to authenticated;
grant execute on function public.delete_idea(text) to authenticated;
