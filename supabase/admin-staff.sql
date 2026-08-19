-- ISOL CODING LAB
-- 관리자가 가입자를 삭제할 수 있습니다.
-- SQL Editor에 붙여넣고 Run 하세요.

create or replace function public.remove_staff(target_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  user_email text;
  target text;
  target_role text;
  admin_count integer;
  deleted_count integer;
begin
  user_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  target := lower(trim(coalesce(target_email, '')));

  if user_email = '' then
    return jsonb_build_object('ok', false, 'reason', 'login');
  end if;

  if not public.is_approved_admin() then
    return jsonb_build_object('ok', false, 'reason', 'forbidden');
  end if;

  if target = '' then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;

  if target = user_email then
    return jsonb_build_object('ok', false, 'reason', 'self');
  end if;

  select role into target_role
  from public.staff_members
  where lower(email) = target;

  if target_role is null then
    return jsonb_build_object('ok', false, 'reason', 'missing');
  end if;

  if target_role = 'admin' then
    select count(*) into admin_count
    from public.staff_members
    where role = 'admin'
      and status = 'approved';

    if admin_count <= 1 then
      return jsonb_build_object('ok', false, 'reason', 'last-admin');
    end if;
  end if;

  delete from public.staff_members
  where lower(email) = target;

  get diagnostics deleted_count = row_count;
  if deleted_count = 0 then
    return jsonb_build_object('ok', false, 'reason', 'missing');
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.remove_staff(text) to authenticated;
