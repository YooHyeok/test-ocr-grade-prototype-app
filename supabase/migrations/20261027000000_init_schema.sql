-- =============================================================================
-- 케미체크 초기 스키마 (docs/PRODUCT_PLAN.md §5 최소 데이터 모델 기준)
--
-- 학원 > 클래스 > 학생 계층과 시험지(주관식/객관식)·문항·채점 작업/결과를 정의한다.
-- 모든 업무 데이터는 academy_id로 학원 단위 격리(RLS는 다음 마이그레이션에서 적용).
--
-- 기획 확정 후 추가 예정:
--   - 시험 카테고리 그룹 / 클래스별 담당 선생님 (그룹 관리)
--   - 시험지 원본 사진 저장소 (Supabase Storage 또는 Cloudflare R2)
--   - 선생님 권한 세분화 (원장 / 관리자 / 채점 담당)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 열거형
-- ---------------------------------------------------------------------------

-- 계정 권한. 선생님(관리자) 모드 / 학생 모드를 결정한다.
create type public.app_role as enum ('teacher', 'student');

-- 시험지 유형. 주관식은 OCR, 객관식은 OMR로 채점한다. (PRODUCT_PLAN §9, §10)
create type public.sheet_type as enum ('subjective', 'objective');

-- 채점 작업 상태 (PRODUCT_PLAN §3 학생 계정 흐름)
--   uploaded     : 업로드 완료, 채점 전 (이미지 삭제·재업로드 가능)
--   processing   : 채점 중 (OCR/OMR 진행)
--   needs_review : 자동 채점 완료, 선생님 검토 필요
--   completed    : 채점 확정
--   failed       : 인식 실패 (재촬영 필요)
create type public.grading_status as enum ('uploaded', 'processing', 'needs_review', 'completed', 'failed');

-- ---------------------------------------------------------------------------
-- 학원 / 사용자
-- ---------------------------------------------------------------------------

create table public.academies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

comment on table public.academies is '학원';

-- auth.users와 1:1. 가입 시 트리거로 자동 생성된다. (다음 마이그레이션)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  academy_id uuid references public.academies (id) on delete set null,
  role public.app_role not null default 'student',
  name text not null default '',
  created_at timestamptz not null default now()
);

comment on table public.profiles is '사용자 프로필 (권한, 소속 학원)';
comment on column public.profiles.role is '가입 시 항상 student. teacher 권한은 관리자가 직접 지정한다.';

create index profiles_academy_id_idx on public.profiles (academy_id);

-- ---------------------------------------------------------------------------
-- 클래스 / 학생
-- ---------------------------------------------------------------------------

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies (id) on delete cascade,
  name text not null,
  grade text not null default '',
  created_at timestamptz not null default now()
);

comment on table public.classes is '클래스 (예: 고2 화학 I)';

create index classes_academy_id_idx on public.classes (academy_id);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies (id) on delete cascade,
  class_id uuid references public.classes (id) on delete set null,
  -- 학생이 직접 로그인하는 경우 연결되는 계정 (선생님이 대신 업로드하는 학생은 null)
  profile_id uuid unique references public.profiles (id) on delete set null,
  name text not null,
  grade text not null default '',
  created_at timestamptz not null default now()
);

comment on table public.students is '학생 명부';

create index students_academy_id_idx on public.students (academy_id);
create index students_class_id_idx on public.students (class_id);

-- ---------------------------------------------------------------------------
-- 시험지 / 문항
-- ---------------------------------------------------------------------------

create table public.answer_sheets (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies (id) on delete cascade,
  type public.sheet_type not null,
  title text not null,
  -- TODO: 그룹 관리 기획 확정 후 카테고리 테이블 FK로 교체
  category text not null default '',
  subject text not null default '',
  unit text not null default '',
  -- 학생 이름 OCR 영역 {x, y, w, h} (시험지 원본 이미지 좌표)
  name_region jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.answer_sheets is '시험지 양식 (주관식/객관식)';

create index answer_sheets_academy_id_idx on public.answer_sheets (academy_id);

create table public.answer_items (
  id uuid primary key default gen_random_uuid(),
  answer_sheet_id uuid not null references public.answer_sheets (id) on delete cascade,
  question_no integer not null check (question_no > 0),
  question text not null default '',
  points integer not null default 1 check (points >= 0),
  -- 주관식: 기준 정답과 허용 표기 변형 (예: {NaCl, 염화 나트륨, 염화나트륨})
  accepted_answers text[] not null default '{}',
  -- 객관식: 보기 목록과 정답 보기 index (0부터)
  choices text[] not null default '{}',
  correct_choice smallint check (correct_choice >= 0),
  -- 인식 영역(ROI) 좌표 {x, y, w, h}. 객관식은 보기별 영역 배열을 담는다.
  region jsonb,
  unique (answer_sheet_id, question_no)
);

comment on table public.answer_items is '시험지 문항';

-- ---------------------------------------------------------------------------
-- 채점 작업 / 결과
-- ---------------------------------------------------------------------------

create table public.grading_jobs (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  answer_sheet_id uuid not null references public.answer_sheets (id) on delete restrict,
  -- 원본 사진 경로 (저장소 확정 전까지 경로 문자열만 보관)
  image_path text,
  status public.grading_status not null default 'uploaded',
  score numeric(5, 2),
  ocr_confidence numeric(5, 4),
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  graded_at timestamptz
);

comment on table public.grading_jobs is '채점 작업 (시험지 사진 1장 = 1건)';

create index grading_jobs_academy_created_idx on public.grading_jobs (academy_id, created_at desc);
create index grading_jobs_student_id_idx on public.grading_jobs (student_id);
create index grading_jobs_status_idx on public.grading_jobs (academy_id, status);

create table public.grading_items (
  id uuid primary key default gen_random_uuid(),
  grading_job_id uuid not null references public.grading_jobs (id) on delete cascade,
  question_no integer not null check (question_no > 0),
  -- 주관식: OCR 원문과 정규화 결과 / 객관식: 인식된 보기 index
  ocr_text text,
  normalized_text text,
  selected_choice smallint,
  confidence numeric(5, 4),
  is_correct boolean,
  needs_review boolean not null default false,
  -- 선생님 수동 채점 결과
  reviewed_text text,
  reviewed_is_correct boolean,
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  unique (grading_job_id, question_no)
);

comment on table public.grading_items is '문항별 채점 결과 (자동 판정 + 선생님 검토)';

-- ---------------------------------------------------------------------------
-- updated_at 자동 갱신
-- ---------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger answer_sheets_set_updated_at
  before update on public.answer_sheets
  for each row execute function public.set_updated_at();
