-- =============================================================================
-- 회원가입 신청 · 가입 승인 · 알림 받는 방법 (docs/superpowers/specs/2026-11-24-account-signup-design.md)
--
-- 흐름
--   회원가입(학원 코드 입력) → Supabase Auth 계정 생성 → 가입 트리거가 프로필(학원 없음, 학생 권한)과
--   가입 신청(대기)을 만든다. 학원이 없으므로 승인 전에는 학원 데이터가 하나도 보이지 않는다.
--   학생 신청은 같은 학원 선생님·관리자가, 선생님 신청은 같은 학원 관리자(is_admin)가 승인·거절한다.
--   승인하면 프로필에 학원·권한을 넣고, 학생이면 학생 명부에 배정한 클래스와 함께 추가한다.
--
-- 가입 화면의 '선생님'은 신청 내용일 뿐이고, 권한은 승인 함수에서만 바뀐다.
-- 학원 코드는 관리자가 지정한다: update public.academies set join_code = 'RAON' where id = '<학원 id>';
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 학원 코드
-- -----------------------------------------------------------------------------
alter table public.academies
  add column join_code text
    constraint academies_join_code_format check (join_code ~ '^[A-Z0-9]{3,20}$');

create unique index academies_join_code_key on public.academies (join_code);

comment on column public.academies.join_code is '가입할 때 입력하는 학원 코드 (영문 대문자·숫자 3~20자, 대소문자 무시 비교)';

-- -----------------------------------------------------------------------------
-- 프로필 확장
--   phone                : 휴대폰 번호 (본인인증 없음, 입력값 그대로)
--   must_change_password : 관리자가 임시 비밀번호로 만든 계정 (첫 로그인 때 변경)
--   failed_login_count, locked_at : 로그인 잠금 (5회 실패, 관리자 제외). 본인이 바꿀 수 없다.
-- 본인 수정 권한은 기존대로 이름만 허용한다. (…_rls_policies.sql)
-- -----------------------------------------------------------------------------
alter table public.profiles
  add column phone text,
  add column must_change_password boolean not null default false,
  add column failed_login_count integer not null default 0
    constraint profiles_failed_login_count_check check (failed_login_count >= 0),
  add column locked_at timestamptz;

comment on column public.profiles.phone is '휴대폰 번호 (본인인증 없음)';
comment on column public.profiles.must_change_password is '임시 비밀번호 계정: 첫 로그인 때 비밀번호 변경 필요';
comment on column public.profiles.locked_at is '로그인 잠금 시각 (null이면 잠기지 않음)';

-- 잠긴 계정은 학원 데이터가 보이지 않도록 소속 학원을 null로 본다.
create or replace function public.current_academy_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select academy_id from public.profiles
  where id = (select auth.uid()) and locked_at is null;
$$;

-- -----------------------------------------------------------------------------
-- 가입 신청
-- -----------------------------------------------------------------------------
create type public.signup_status as enum ('pending', 'approved', 'rejected');

create table public.signup_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  academy_id uuid not null references public.academies (id) on delete cascade,
  type public.app_role not null default 'student',
  name text not null,
  grade text not null default '',
  email text not null default '',
  phone text,
  status public.signup_status not null default 'pending',
  reject_reason text,
  class_id uuid references public.classes (id) on delete set null,
  decided_by uuid references public.profiles (id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  constraint signup_requests_reject_reason_check
    check (status <> 'rejected' or nullif(btrim(reject_reason), '') is not null)
);

comment on table public.signup_requests is '가입 신청 (대기 → 승인/거절)';
comment on column public.signup_requests.type is '신청한 가입 유형. 승인할 때 이 권한이 부여된다.';

create index signup_requests_academy_status_idx
  on public.signup_requests (academy_id, status, created_at);

-- -----------------------------------------------------------------------------
-- 알림 받는 방법 (학생, 여러 개 선택)
--   sms_phone, kakao_phone이 null이면 프로필 휴대폰 번호로 받는다.
-- -----------------------------------------------------------------------------
create table public.notification_preferences (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  methods text[] not null default '{email}'
    constraint notification_preferences_methods_check
      check (methods <@ array['email', 'push', 'sms', 'kakao']::text[]),
  email text,
  push_enabled boolean not null default false,
  sms_phone text,
  kakao_phone text,
  updated_at timestamptz not null default now()
);

comment on table public.notification_preferences is '알림 받는 방법 (이메일·앱 푸시·문자·카카오톡)';

create trigger notification_preferences_set_updated_at
  before update on public.notification_preferences
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 가입 트리거: 학원 코드가 있으면 가입 신청을 만든다. (관리자가 직접 만든 계정은 코드 없음)
-- 학원 코드가 틀리면 가입 자체를 실패시킨다.
-- -----------------------------------------------------------------------------
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
begin
  insert into public.profiles (id, name, phone) values (new.id, v_name, v_phone);

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
      coalesce(new.email, ''), v_phone
    );
  end if;
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 학원 코드 확인 (로그인 전 가입 화면에서 호출, 학원명만 돌려준다)
-- -----------------------------------------------------------------------------
create function public.find_academy_by_code(p_code text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select name from public.academies where join_code = upper(btrim(p_code));
$$;

grant execute on function public.find_academy_by_code(text) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 승인 · 거절 (권한: 학생 신청 = 같은 학원 선생님·관리자, 선생님 신청 = 같은 학원 관리자)
-- 오류 코드: P0002 없음 / 42501 권한 없음 / 55000 이미 처리됨 / 23514 값 오류
-- -----------------------------------------------------------------------------
create function public.lock_signup_request(p_request_id uuid)
returns public.signup_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.signup_requests;
begin
  select * into r from public.signup_requests where id = p_request_id for update;
  if not found or r.academy_id is distinct from (select public.current_academy_id()) then
    raise exception '가입 신청을 찾을 수 없습니다.' using errcode = 'P0002';
  end if;
  if r.type = 'teacher' and not (select public.is_admin()) then
    raise exception '선생님 가입은 관리자만 처리할 수 있습니다.' using errcode = '42501';
  end if;
  if r.type = 'student' and not (select public.is_teacher()) then
    raise exception '학생 가입은 선생님만 처리할 수 있습니다.' using errcode = '42501';
  end if;
  if r.status <> 'pending' then
    raise exception '이미 처리된 가입 신청입니다.' using errcode = '55000';
  end if;
  return r;
end;
$$;

-- 내부용: 승인·거절 함수에서만 쓴다.
revoke execute on function public.lock_signup_request(uuid) from public, anon, authenticated;

create function public.approve_signup(p_request_id uuid, p_class_id uuid default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.signup_requests := public.lock_signup_request(p_request_id);
begin
  if r.type = 'student' then
    if p_class_id is null then
      raise exception '클래스를 배정해주세요.' using errcode = '23514';
    end if;
    if not exists (select 1 from public.classes where id = p_class_id and academy_id = r.academy_id) then
      raise exception '배정할 수 없는 클래스입니다.' using errcode = '23514';
    end if;
  end if;

  update public.profiles set academy_id = r.academy_id, role = r.type where id = r.profile_id;
  if r.type = 'student' then
    insert into public.students (academy_id, class_id, profile_id, name, grade)
    values (r.academy_id, p_class_id, r.profile_id, r.name, r.grade);
  end if;
  update public.signup_requests
  set status = 'approved',
      class_id = case when r.type = 'student' then p_class_id end,
      decided_by = (select auth.uid()),
      decided_at = now()
  where id = r.id;
end;
$$;

create function public.reject_signup(p_request_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.signup_requests := public.lock_signup_request(p_request_id);
begin
  if nullif(btrim(coalesce(p_reason, '')), '') is null then
    raise exception '거절 사유를 입력해주세요.' using errcode = '23514';
  end if;
  update public.signup_requests
  set status = 'rejected',
      reject_reason = btrim(p_reason),
      decided_by = (select auth.uid()),
      decided_at = now()
  where id = r.id;
end;
$$;

revoke execute on function public.approve_signup(uuid, uuid) from public, anon;
revoke execute on function public.reject_signup(uuid, text) from public, anon;
grant execute on function public.approve_signup(uuid, uuid) to authenticated;
grant execute on function public.reject_signup(uuid, text) to authenticated;

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.signup_requests enable row level security;
alter table public.notification_preferences enable row level security;

-- 본인 신청(승인 대기·거절 안내) / 같은 학원 선생님은 학생 신청 / 같은 학원 관리자는 전체
create policy "가입 신청 조회" on public.signup_requests
  for select to authenticated
  using (
    profile_id = (select auth.uid())
    or (
      academy_id = (select public.current_academy_id())
      and ((type = 'student' and (select public.is_teacher())) or (select public.is_admin()))
    )
  );

-- 신청 생성은 가입 트리거, 상태 변경은 승인·거절 함수만 한다.
revoke insert, update, delete on public.signup_requests from anon, authenticated;

create policy "본인 알림 설정" on public.notification_preferences
  for all to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

revoke all on public.notification_preferences from anon;
