-- =============================================================================
-- 시스템 설정 (관리자 화면 "시스템 설정")
--
-- 테이블 구조는 DELMA Factory 테이블 명세서(v1.0)의 시스템 속성 설계를 따른다. 테이블명만 다르다.
--   delma_sys_prop       → system_settings          (시스템 속성)
--   delma_sys_prop_grp   → system_setting_groups    (시스템 속성 그룹)
--   delma_sys_prop_hist  → system_setting_histories (시스템 속성 변경 이력)
--
-- 그룹은 점 표기 계층이다. 최상위 그룹이 화면 탭, 하위 그룹이 탭 안의 접는 구역이 된다.
--   WM                 (최상위: 탭)
--   WM.MAIL_BATCH      (하위: 구역)
--   WM.MAIL_BATCH.CYCLE (속성 키 = 소속 그룹 코드 + '.' + 이름)
-- 속성의 prop_grp는 최상위 그룹, prop_sub_grp는 소속 하위 그룹(최상위 바로 아래에 둘 때는 null)이다.
-- 변경 이력의 sys_group_id도 최상위 그룹이다.
--
-- 명세와 다른 점:
--   - system_setting_histories.reg_id: varchar(20) → varchar(100) (사용자 id가 UUID 36자)
--   - prop_usr_rgh: Y/N → R(열람만 가능) / W(수정 가능) / H(항목 숨김) (DELMA 화면의 열람 권한 3가지)
--   - BOOL 값은 true / false
--   - prop_spr_type(구분자) + prop_spr_val(구분자로 이은 값 목록)이 있으면 prop_val은 그중 하나 (화면은 선택 상자)
--   - 형식·계층 check 제약, prop_sub_grp FK, 변경 이력 자동 기록 트리거, 접근 제어(RLS) 추가
--
-- 첫 설정값: 채점 결과 메일 배치 (WM.MAIL_BATCH.ENABLED / WM.MAIL_BATCH.CYCLE)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 시스템 관리자 권한 (학원 단위 teacher 권한과 별개, 모든 학원에 적용되는 설정을 관리)
-- 지정: update public.profiles set is_admin = true where id = '<사용자 id>';
-- 본인 수정은 name 컬럼만 허용되어 있으므로 스스로 관리자가 될 수 없다. (rls_policies 참고)
-- -----------------------------------------------------------------------------
alter table public.profiles
  add column is_admin boolean not null default false;

comment on column public.profiles.is_admin is '시스템 관리자 여부 (시스템 설정 화면 접근)';

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and is_admin
  );
$$;

-- -----------------------------------------------------------------------------
-- 시스템 속성 그룹 (delma_sys_prop_grp)
-- -----------------------------------------------------------------------------
create table public.system_setting_groups (
  prop_grp_id varchar(100) primary key
    check (prop_grp_id ~ '^[A-Z][A-Z0-9_]*(\.[A-Z][A-Z0-9_]*)*$'),
  prop_grp_nm varchar(100) not null check (btrim(prop_grp_nm) <> ''),
  prop_grp_desc varchar(200)
);

comment on table public.system_setting_groups is '시스템 속성 그룹';
comment on column public.system_setting_groups.prop_grp_id is '속성 그룹 코드 (PK, 영문 대문자, 점 표기법으로 계층 표현: WM / WM.MAIL_BATCH)';
comment on column public.system_setting_groups.prop_grp_nm is '속성 그룹명';
comment on column public.system_setting_groups.prop_grp_desc is '속성 그룹 설명';

-- 하위 그룹은 상위 그룹이 있어야 만들 수 있고, 하위 그룹이 남은 그룹은 지울 수 없다. (FK 위반과 같은 23503 오류)
create function public.check_system_setting_group_tree()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if position('.' in new.prop_grp_id) > 0 and not exists (
      select 1 from public.system_setting_groups
      where prop_grp_id = regexp_replace(new.prop_grp_id, '\.[^.]+$', '')
    ) then
      raise foreign_key_violation using message = format('상위 그룹이 없습니다: %s', new.prop_grp_id);
    end if;
    return new;
  end if;

  if exists (
    select 1 from public.system_setting_groups
    where prop_grp_id like old.prop_grp_id || '.%'
  ) then
    raise foreign_key_violation using message = format('하위 그룹이 남아 있습니다: %s', old.prop_grp_id);
  end if;
  return old;
end;
$$;

create trigger system_setting_groups_tree
  before insert or delete on public.system_setting_groups
  for each row execute function public.check_system_setting_group_tree();

-- -----------------------------------------------------------------------------
-- 시스템 속성 (delma_sys_prop)
-- -----------------------------------------------------------------------------
create table public.system_settings (
  prop_id varchar(100) primary key default replace(gen_random_uuid()::text, '-', ''),
  prop_key varchar(100) not null unique
    check (prop_key ~ '^[A-Z][A-Z0-9_]*(\.[A-Z][A-Z0-9_]*)+$'),
  prop_grp varchar(100) not null references public.system_setting_groups (prop_grp_id)
    check (position('.' in prop_grp) = 0),
  prop_sub_grp varchar(100) references public.system_setting_groups (prop_grp_id),
  prop_type varchar(5) not null check (prop_type in ('STR', 'NUM', 'BOOL')),
  prop_spr_type varchar(1),
  prop_val text,
  prop_spr_val varchar(200),
  prop_desc varchar(200),
  prop_usr_rgh varchar(1) not null default 'W' check (prop_usr_rgh in ('R', 'W', 'H')),
  eg_rst_flag varchar(1) default 'N' check (eg_rst_flag in ('Y', 'N')),
  wm_rst_flag varchar(1) default 'N' check (wm_rst_flag in ('Y', 'N')),
  prop_name varchar(100) not null check (btrim(prop_name) <> ''),
  -- 계층: 하위 그룹은 최상위 그룹 아래, 키는 소속 그룹 코드로 시작
  constraint system_settings_sub_grp_tree check (
    prop_sub_grp is null or prop_sub_grp like prop_grp || '.%'
  ),
  constraint system_settings_key_in_group check (
    prop_key like coalesce(prop_sub_grp, prop_grp) || '.%'
  ),
  -- 값 검증 (빈 값은 허용)
  constraint system_settings_bool_val check (
    prop_type <> 'BOOL' or prop_val is null or prop_val in ('true', 'false')
  ),
  constraint system_settings_num_val check (
    prop_type <> 'NUM' or prop_val is null or prop_val = '' or prop_val ~ '^-?[0-9]+(\.[0-9]+)?$'
  ),
  constraint system_settings_option_val check (
    prop_spr_type is null or prop_spr_val is null
    or prop_val = any (string_to_array(prop_spr_val, prop_spr_type))
  ),
  -- 서버 함수가 읽는 값은 목록을 바꿔도 허용 범위를 벗어나지 않게 한 번 더 막는다.
  constraint system_settings_mail_cycle_val check (
    prop_key <> 'WM.MAIL_BATCH.CYCLE' or prop_val in ('DAILY', 'WEEKLY', 'MONTHLY')
  ),
  constraint system_settings_mail_enabled_type check (
    prop_key <> 'WM.MAIL_BATCH.ENABLED' or prop_type = 'BOOL'
  )
);

create index idx_system_settings_sub_grp on public.system_settings (prop_sub_grp);

comment on table public.system_settings is '시스템 속성';
comment on column public.system_settings.prop_id is '속성 아이디 (UUID hex, PK)';
comment on column public.system_settings.prop_key is '속성 키 (UNIQUE, 소속 그룹 코드.이름, 영문 대문자)';
comment on column public.system_settings.prop_grp is '최상위 속성 그룹 코드 (화면 탭)';
comment on column public.system_settings.prop_sub_grp is '소속 하위 그룹 코드 (화면 구역, 최상위 바로 아래면 null)';
comment on column public.system_settings.prop_type is '속성 데이터 타입 (STR/NUM/BOOL)';
comment on column public.system_settings.prop_spr_type is '구분자 타입 (다중값 분리자 종류, 예: ,)';
comment on column public.system_settings.prop_val is '속성 값 (실제 설정 값, BOOL은 true/false)';
comment on column public.system_settings.prop_spr_val is '구분자 기반 전체 속성 값 (선택 가능한 값 목록, 예: DAILY,WEEKLY,MONTHLY)';
comment on column public.system_settings.prop_desc is '속성 설명';
comment on column public.system_settings.prop_usr_rgh is '열람 권한 (R: 열람만 가능 / W: 수정 가능 / H: 항목 숨김)';
comment on column public.system_settings.eg_rst_flag is '엔진 서버 재시작/재적용 필요 여부 (Y/N)';
comment on column public.system_settings.wm_rst_flag is '관리도구 재시작 필요 여부 (Y/N)';
comment on column public.system_settings.prop_name is '속성 표시명';

-- -----------------------------------------------------------------------------
-- 시스템 속성 변경 이력 (delma_sys_prop_hist)
-- 속성이 삭제돼도 이력은 남도록 prop_id에 FK를 걸지 않는다.
-- -----------------------------------------------------------------------------
create table public.system_setting_histories (
  hist_id varchar(100) not null default replace(gen_random_uuid()::text, '-', ''),
  prop_id varchar(100) not null,
  prop_name varchar(100),
  sys_group_id varchar(100) not null,
  sys_group_name varchar(100),
  now_value varchar(1024),
  prev_value varchar(1024),
  prop_action varchar(3) check (prop_action in ('I', 'U', 'D')),
  reg_dt timestamp,
  reg_id varchar(100),
  reg_name varchar(20),
  prop_key varchar(100),
  primary key (hist_id, prop_id, sys_group_id)
);

create index idx_system_setting_histories_group on public.system_setting_histories (sys_group_id);
create index idx_system_setting_histories_prop on public.system_setting_histories (prop_id);
create index idx_system_setting_histories_reg_dt on public.system_setting_histories (reg_dt desc);

comment on table public.system_setting_histories is '시스템 속성 변경 이력';
comment on column public.system_setting_histories.hist_id is '이력 아이디 (UUID hex, PK 1)';
comment on column public.system_setting_histories.prop_id is '변경 대상 속성 아이디 (PK 2, system_settings.prop_id)';
comment on column public.system_setting_histories.prop_name is '변경 대상 속성명 스냅샷';
comment on column public.system_setting_histories.sys_group_id is '최상위 속성 그룹 코드 (PK 3)';
comment on column public.system_setting_histories.sys_group_name is '최상위 속성 그룹명 스냅샷';
comment on column public.system_setting_histories.now_value is '변경 후 값 (현재 값)';
comment on column public.system_setting_histories.prev_value is '변경 전 값';
comment on column public.system_setting_histories.prop_action is '변경 유형 (I: 추가, U: 수정, D: 삭제)';
comment on column public.system_setting_histories.reg_dt is '변경 일시 (UTC)';
comment on column public.system_setting_histories.reg_id is '변경자 아이디 (auth.users id, 시스템 변경은 null)';
comment on column public.system_setting_histories.reg_name is '변경자 이름';
comment on column public.system_setting_histories.prop_key is '변경된 속성 키 스냅샷';

-- 속성이 추가·수정·삭제되면 이력을 자동으로 남긴다. (값이 그대로인 수정은 기록하지 않음)
create function public.log_system_setting_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.system_settings;
  group_name varchar(100);
  actor_name text;
begin
  if tg_op = 'DELETE' then
    target := old;
  else
    target := new;
  end if;

  if tg_op = 'UPDATE' and old.prop_val is not distinct from new.prop_val then
    return new;
  end if;

  select prop_grp_nm into group_name from public.system_setting_groups where prop_grp_id = target.prop_grp;
  select name into actor_name from public.profiles where id = (select auth.uid());

  insert into public.system_setting_histories (
    prop_id, prop_name, sys_group_id, sys_group_name, now_value, prev_value,
    prop_action, reg_dt, reg_id, reg_name, prop_key
  ) values (
    target.prop_id,
    target.prop_name,
    target.prop_grp,
    group_name,
    case when tg_op = 'DELETE' then null else left(new.prop_val, 1024) end,
    case when tg_op = 'INSERT' then null else left(old.prop_val, 1024) end,
    case tg_op when 'INSERT' then 'I' when 'UPDATE' then 'U' else 'D' end,
    now() at time zone 'utc',
    (select auth.uid())::text,
    left(coalesce(nullif(actor_name, ''), 'system'), 20),
    target.prop_key
  );
  return null;
end;
$$;

create trigger system_settings_history
  after insert or update or delete on public.system_settings
  for each row execute function public.log_system_setting_change();

-- -----------------------------------------------------------------------------
-- 접근 제어: 시스템 관리자만 그룹·속성을 조회·추가·수정·삭제한다.
--   - 그룹 코드·속성 키·소속 그룹은 코드가 참조하므로 만든 뒤 바꿀 수 없다. (삭제 후 다시 추가)
--   - 속성·하위 그룹이 남아 있는 그룹은 삭제되지 않는다. (23503)
--   - 변경 이력은 트리거만 기록하고, 관리자는 조회만 한다.
-- 서버 함수(service role)는 RLS를 우회해 설정값을 읽는다.
-- -----------------------------------------------------------------------------
alter table public.system_setting_groups enable row level security;
alter table public.system_settings enable row level security;
alter table public.system_setting_histories enable row level security;

create policy "관리자 속성 그룹 조회" on public.system_setting_groups
  for select to authenticated
  using ((select public.is_admin()));

create policy "관리자 속성 그룹 추가" on public.system_setting_groups
  for insert to authenticated
  with check ((select public.is_admin()));

create policy "관리자 속성 그룹 수정" on public.system_setting_groups
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "관리자 속성 그룹 삭제" on public.system_setting_groups
  for delete to authenticated
  using ((select public.is_admin()));

revoke update on public.system_setting_groups from authenticated;
grant update (prop_grp_nm, prop_grp_desc) on public.system_setting_groups to authenticated;

create policy "관리자 속성 조회" on public.system_settings
  for select to authenticated
  using ((select public.is_admin()));

create policy "관리자 속성 추가" on public.system_settings
  for insert to authenticated
  with check ((select public.is_admin()));

create policy "관리자 속성 수정" on public.system_settings
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "관리자 속성 삭제" on public.system_settings
  for delete to authenticated
  using ((select public.is_admin()));

revoke update on public.system_settings from authenticated;
grant update (
  prop_type, prop_spr_type, prop_val, prop_spr_val, prop_desc,
  prop_usr_rgh, eg_rst_flag, wm_rst_flag, prop_name
) on public.system_settings to authenticated;

create policy "관리자 변경 이력 조회" on public.system_setting_histories
  for select to authenticated
  using ((select public.is_admin()));

revoke insert, update, delete on public.system_setting_histories from authenticated;

-- -----------------------------------------------------------------------------
-- 초기 설정값: 채점 결과 메일 배치 (기본 off — 메일 서비스 설정 후 관리자가 켠다)
-- -----------------------------------------------------------------------------
insert into public.system_setting_groups (prop_grp_id, prop_grp_nm, prop_grp_desc) values
  ('WM', '쪽지시험', '쪽지시험 관리도구 설정'),
  ('WM.MAIL_BATCH', '메일 배치', '채점 결과 메일 자동 발송 설정');

insert into public.system_settings (
  prop_key, prop_grp, prop_sub_grp, prop_type, prop_spr_type, prop_val, prop_spr_val, prop_desc,
  prop_usr_rgh, prop_name
) values
  ('WM.MAIL_BATCH.ENABLED', 'WM', 'WM.MAIL_BATCH', 'BOOL', null, 'false', null,
   '채점 결과 메일 자동 발송 여부. true면 발송 주기에 맞춰 학원 선생님 전원에게 요약과 CSV를 보낸다.',
   'W', '메일 배치 사용 여부'),
  ('WM.MAIL_BATCH.CYCLE', 'WM', 'WM.MAIL_BATCH', 'STR', ',', 'MONTHLY', 'DAILY,WEEKLY,MONTHLY',
   'DAILY: 매일 전날분 / WEEKLY: 매주 월요일 지난주분 / MONTHLY: 매달 1일 지난달분. 오전 9시 5분(한국 시간) 실행.',
   'W', '메일 배치 주기');
