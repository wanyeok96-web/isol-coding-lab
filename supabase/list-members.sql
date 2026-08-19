-- ISOL CODING LAB
-- 가입자 목록: 승인된 교직원 이름을 보여 줍니다. 이메일은 화면에 쓰지 않습니다.
-- SQL Editor에 붙여넣고 Run 하세요.

create or replace function public.list_approved_members()
returns table (
  maker_id text,
  name text,
  profile_image text,
  member_role text,
  program_count integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    m.id as maker_id,
    coalesce(
      nullif(trim(m.name), ''),
      split_part(s.email, '@', 1),
      '이솔고 교직원'
    ) as name,
    coalesce(m.profile_image, '') as profile_image,
    s.role as member_role,
    coalesce((
      select count(*)::integer
      from public.program_makers pm
      join public.programs p on p.id = pm.program_id
      where m.id is not null
        and pm.maker_id = m.id
        and p.visibility in ('public', 'school')
    ), 0) as program_count
  from public.staff_members s
  left join public.makers m
    on m.email <> ''
   and lower(m.email) = lower(s.email)
  where s.status = 'approved'
  order by 2;
$$;

grant execute on function public.list_approved_members() to anon, authenticated;
