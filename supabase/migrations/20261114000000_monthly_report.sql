-- =============================================================================
-- 채점 결과 메일 발송 + 원본 사진 보관 정책
--
-- 서버 함수(supabase/functions/monthly-report)가 학원별로
--   1) 지난 기간(일·주·월) 채점 결과 CSV를 선생님 전원에게 메일로 보내고
--   2) 발송에 성공한 학원의, 보관 기간이 지난 원본 사진을 정리한다.
-- 발송 여부·주기는 시스템 설정(system_settings, mail.batch.*)에서 읽는다.
-- 예약 실행(pg_cron) 등록은 …_monthly_report_cron.sql에서 한다.
-- =============================================================================

-- 학원별 원본 사진 보관 개월 수 (채점 결과 글자 데이터는 계속 보관)
alter table public.academies
  add column image_retention_months integer not null default 3
  check (image_retention_months between 1 and 120);

comment on column public.academies.image_retention_months is
  '원본 사진 보관 개월 수. 기간이 지난 사진은 월간 보고서 발송 후 삭제된다.';

-- 원본 사진을 보관 정책에 따라 삭제한 시각 (삭제 후 image_path는 null)
alter table public.grading_jobs
  add column image_purged_at timestamptz;

-- 보관 기간 정리 대상 조회용
create index grading_jobs_image_retention_idx
  on public.grading_jobs (academy_id, created_at)
  where image_path is not null;

-- -----------------------------------------------------------------------------
-- 월간 보고서 발송 기록 (같은 학원·같은 달 중복 발송 방지)
-- -----------------------------------------------------------------------------
create type public.report_status as enum ('sent', 'skipped', 'failed');

create table public.report_logs (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies (id) on delete cascade,
  -- 보고 대상 기간 [period_start, period_end)
  period_start date not null,
  period_end date not null,
  status public.report_status not null,
  recipient_count integer not null default 0,
  job_count integer not null default 0,
  purged_image_count integer not null default 0,
  error text,
  created_at timestamptz not null default now(),
  check (period_start < period_end)
);

comment on table public.report_logs is '월간 채점 결과 메일 발송 기록';

-- 한 학원·한 기간에는 'sent' 기록이 하나만 존재 (주기가 바뀌어도 기간이 다르면 별개)
create unique index report_logs_sent_once_idx
  on public.report_logs (academy_id, period_start, period_end)
  where status = 'sent';

create index report_logs_academy_idx on public.report_logs (academy_id, period_start desc);

-- 기록은 서버 함수(service role)만 쓴다. 선생님은 소속 학원 기록 조회만 가능.
alter table public.report_logs enable row level security;

create policy "선생님 소속 학원 발송 기록 조회" on public.report_logs
  for select to authenticated
  using ((select public.is_teacher()) and academy_id = (select public.current_academy_id()));
