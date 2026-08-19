-- ISOL CODING LAB
-- 교직원으로 인증된 선생님을 제작자 목록에 이름으로 넣습니다.
-- SQL Editor에 붙여넣고 Run 하세요.

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
    set name = cleaned_name,
        profile_image = case when cleaned_avatar = '' then profile_image else cleaned_avatar end
    where id = maker_id;
  end if;

  return jsonb_build_object('ok', true, 'id', maker_id);
end;
$$;

grant execute on function public.ensure_staff_maker(text, text) to authenticated;
