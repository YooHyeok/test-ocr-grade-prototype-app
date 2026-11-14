-- =============================================================================
-- 채점 결과 메일 배치 예약 실행 (pg_cron + pg_net)
--
-- 매일 00:05 UTC (한국 시간 09:05)에 서버 함수 monthly-report를 호출한다.
-- 실제 발송 여부·주기는 서버 함수가 시스템 설정을 읽어 결정한다.
--   mail.batch.enabled = 'N'           → 발송하지 않음
--   mail.batch.cycle   = DAILY          → 매일, 전날분
--                        WEEKLY         → 매주 월요일, 지난주(월~일)분
--                        MONTHLY        → 매달 1일, 지난달분
-- 그래서 주기를 바꿔도 이 예약은 다시 등록할 필요가 없다.
--
-- 사전 준비 (Supabase SQL Editor에서 한 번만 실행, 값은 저장소에 커밋하지 않는다):
--   select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
--   select vault.create_secret('<CRON_SECRET 과 같은 임의의 긴 문자열>', 'cron_secret');
-- 서버 함수 쪽에도 같은 값을 등록한다:
--   npx supabase secrets set CRON_SECRET=<같은 문자열>
-- 자세한 절차: docs/MONTHLY_REPORT.md
-- =============================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 같은 이름의 작업이 있으면 교체 (마이그레이션 재적용 대비)
select cron.unschedule(jobid) from cron.job where jobname = 'grading-report-mail-batch';

select cron.schedule(
  'grading-report-mail-batch',
  '5 0 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
           || '/functions/v1/monthly-report',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body := jsonb_build_object('trigger', 'cron'),
    timeout_milliseconds := 60000
  );
  $$
);
