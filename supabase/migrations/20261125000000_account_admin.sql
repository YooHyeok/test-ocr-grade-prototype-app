-- =============================================================================
-- 사용자 관리 · 로그인 잠금 (docs/superpowers/specs/2026-11-24-account-signup-design.md 2·3단계)
--
--   - profiles.email : 사용자 관리 목록 표시, 로그인 잠금 서버 함수(auth-login)의 계정 조회용
--   - 계정 직접 추가·잠금 해제는 서버 함수 account-admin(service role)이 한다. (브라우저 권한으로 불가)
--   - 로그인 실패 기록·잠금은 서버 함수 auth-login(service role)이 아래 함수로 한다.
--   - 임시 비밀번호 계정은 비밀번호를 바꾼 뒤 본인이 complete_password_change()로 변경 필요 표시를 끈다.
-- =============================================================================

alter table public.profiles add column email text;

comment on column public.profiles.email is '로그인 이메일 (auth.users.email 복사, 소문자)';

update public.profiles p
set email = lower(u.email)
from auth.users u
where u.id = p.id;

create index profiles_email_idx on public.profiles (email);

-- 가입 트리거: 이메일도 프로필에 넣는다. (나머지는 …_signup_requests.sql과 같다)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_code text := upper(btrim(coalesce(meta ->> 'join_code', '')));
  v_academy uuid;
  v_type public.app_role;
  v_name text := btrim(coalesce(meta ->> 'name', ''));
  v_phone text := nullif(btrim(coalesce(meta ->> 'phone', '')), '');
  v_email text := lower(coalesce(new.email, ''));
begin
  insert into public.profiles (id, name, phone, email) values (new.id, v_name, v_phone, nullif(v_email, ''));

  if v_code <> '' then
    select id into v_academy from public.academies where join_code = v_code;
    if v_academy is null then
      raise exception 'invalid_join_code: 학원 코드를 찾을 수 없습니다.' using errcode = 'P0001';
    end if;
    v_type := case when meta ->> 'signup_type' = 'teacher' then 'teacher' else 'student' end;
    insert into public.signup_requests (profile_id, academy_id, type, name, grade, email, phone)
    values (
      new.id, v_academy, v_type, v_name,
      case when v_type = 'student' then btrim(coalesce(meta ->> 'grade', '')) else '' end,
      v_email, v_phone
    );
  end if;
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 임시 비밀번호 변경 완료 (본인)
-- -----------------------------------------------------------------------------
create function public.complete_password_change()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles set must_change_password = false where id = (select auth.uid());
$$;

revoke execute on function public.complete_password_change() from public, anon;
grant execute on function public.complete_password_change() to authenticated;

-- -----------------------------------------------------------------------------
-- 로그인 실패 기록 (서버 함수 auth-login 전용, service role만 실행)
--   관리자는 잠그지 않는다. 5회째 실패하면 잠근다. 돌려주는 값: 남은 시도 횟수 (잠기면 0, 관리자·없는 계정은 null)
-- -----------------------------------------------------------------------------
create function public.record_login_failure(p_email text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  update public.profiles
  set failed_login_count = failed_login_count + 1,
      locked_at = case when failed_login_count + 1 >= 5 then now() else locked_at end
  where email = lower(btrim(p_email)) and not is_admin and locked_at is null
  returning failed_login_count into v_count;
  if v_count is null then return null; end if;
  return greatest(5 - v_count, 0);
end;
$$;

-- 로그인 성공: 실패 횟수 초기화
create function public.reset_login_failures(p_email text)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles set failed_login_count = 0
  where email = lower(btrim(p_email)) and failed_login_count > 0;
$$;

-- 로그인 전 잠금 확인 (true면 잠김)
create function public.is_login_locked(p_email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select locked_at is not null and not is_admin from public.profiles where email = lower(btrim(p_email))),
    false
  );
$$;

revoke execute on function public.record_login_failure(text) from public, anon, authenticated;
revoke execute on function public.reset_login_failures(text) from public, anon, authenticated;
revoke execute on function public.is_login_locked(text) from public, anon, authenticated;
grant execute on function public.record_login_failure(text) to service_role;
grant execute on function public.reset_login_failures(text) to service_role;
grant execute on function public.is_login_locked(text) to service_role;
