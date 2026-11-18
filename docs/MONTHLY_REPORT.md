# 채점 결과 메일 배치

학원별 **채점 결과**를 선생님 전원에게 메일로 보내고, 보관 기간이 지난 **원본 사진**을 정리한다.
사용 여부와 발송 주기는 관리자 화면 **설정 · 시스템**(`/settings/system`)에서 바꾸며, 값은 `system_settings` 테이블에 저장된다.

## 시스템 설정

| 키 | 값 | 기본값 | 의미 |
| --- | --- | --- | --- |
| `WM.MAIL_BATCH.ENABLED` | `true` / `false` | `false` | 자동 발송 사용 여부 |
| `WM.MAIL_BATCH.CYCLE` | `DAILY` / `WEEKLY` / `MONTHLY` | `MONTHLY` | 발송 주기 |

| 주기 | 발송일 (오전 9시 5분, 한국 시간) | 보내는 기간 |
| --- | --- | --- |
| `DAILY` | 매일 | 어제 |
| `WEEKLY` | 매주 월요일 | 지난주 월요일 ~ 일요일 |
| `MONTHLY` | 매달 1일 | 지난달 |

- 테이블 구조는 DELMA Factory 시스템 속성 설계를 따른다. (`system_settings`, `system_setting_groups`, `system_setting_histories`)
- 값을 바꾸면 변경 이력(이전 값, 새 값, 변경자, 시각)이 `system_setting_histories`에 자동으로 남는다.
- 시스템 설정 화면은 DELMA 시스템 설정 화면 구성을 따른 범용 화면이다. 메일 배치는 그중 `WM` 탭의 `메일 배치`(`WM.MAIL_BATCH`) 구역 두 항목이다.
- 시스템 관리자(`profiles.is_admin = true`)만 보고 바꿀 수 있다. `WM.MAIL_BATCH.ENABLED`는 Boolean(토글 스위치), `WM.MAIL_BATCH.CYCLE`은 Radio(선택지 `DAILY,WEEKLY,MONTHLY`)이고, DB가 허용 값 밖의 값을 한 번 더 막는다.
- 두 항목을 지우면 서버 함수는 기본값(사용 안 함, 매월)으로 동작한다.
- 메일 서비스 설정(아래 설정 1~4)을 마친 뒤 관리자가 화면에서 켠다.

## 동작

```
pg_cron (매일 00:05 UTC = 09:05 KST)
  └─ POST /functions/v1/monthly-report  { "trigger": "cron" }  (헤더 x-cron-secret)
       └─ system_settings에서 WM.MAIL_BATCH.* 읽기
            - 사용 안 함 → 건너뜀 { "skipped": "disabled" }
            - 주기상 발송일이 아님 → 건너뜀 { "skipped": "not_scheduled" }
            - 발송일 → 주기에 맞는 직전 기간으로 학원마다
                1. 같은 기간 보고서를 이미 보냈으면 건너뜀 (report_logs, 중복 발송 방지)
                2. 선생님 계정이 없으면 건너뜀 (사진 정리도 하지 않음)
                3. 기간 내 채점 작업이 있으면 요약 본문 + CSV 첨부 메일 발송
                4. 발송 성공(또는 보낼 내용 없음) 후, 보관 기간이 지난 원본 사진 삭제
                5. 결과를 report_logs에 기록 (한 학원이 실패해도 다른 학원은 계속)
```

예약 실행은 매일 돌고 실제 발송 여부는 서버 함수가 설정을 읽어 정한다. 그래서 화면에서 주기를 바꿔도 예약 실행을 다시 등록할 필요가 없고, 바꾼 값은 다음 실행부터 적용된다.

| 항목 | 내용 |
| --- | --- |
| 받는 사람 | 학원의 `teacher` 권한 계정 전원 |
| 기간 | 한국 시간 기준 (위 주기 표). 예: 매월이면 지난달 1일 0시 ~ 이번 달 1일 0시 |
| 제목 | `[쪽지시험] 라온 과학학원 2026년 10월 채점 결과` (매주: `2026년 10월 26일 ~ 11월 1일`, 매일: `2026년 11월 13일`) |
| 본문 | 전체·채점 완료·검토 필요 건수, 평균 점수 |
| 첨부 | `grading-report-<기간>.csv` (예: `2026-10`, `2026-10-26_2026-11-01`, `2026-11-13`). UTF-8 BOM으로 엑셀에서 한글 정상 표시 |
| CSV 열 | 업로드 시각, 학생, 클래스, 시험지, 유형, 상태, 점수, 정답 수, 문항 수, 검토 필요 문항, 문항별 결과(`1:O 2:X 3:?`) |
| 사진 보관 | 학원별 `academies.image_retention_months` (기본 3개월). 채점 결과 글자 데이터는 계속 보관 |

- 문항별 결과는 선생님 수동 판정이 있으면 그 값을, 없으면 자동 판정을 쓴다.
- CSV 값이 `=`, `+`, `-`, `@`로 시작하면 엑셀 수식으로 실행되지 않도록 앞에 `'`를 붙인다.
- 주기를 바꾸면 기간이 겹칠 수 있다. (예: 매주로 보내다가 매월로 바꾸면 그 달의 일부 주가 월간 보고에 다시 포함된다) 중복 방지는 같은 시작일·종료일 기간에만 적용된다.

## 코드 위치

| 파일 | 역할 |
| --- | --- |
| `supabase/migrations/20261114000000_monthly_report.sql` | 보관 개월 수, 사진 삭제 시각, 발송 기록 테이블(`report_logs`)과 접근 제어 |
| `supabase/migrations/20261114000100_monthly_report_cron.sql` | 예약 실행 등록 (pg_cron + pg_net, 비밀값은 Vault) |
| `supabase/migrations/20261114000200_system_settings.sql` | 시스템 설정 테이블·변경 이력·관리자 권한, 메일 배치 초기값 |
| `supabase/migrations/20261115000000_system_setting_types.sql` | 값 유형 6가지(String/Number/Boolean/Radio/Select/Checkbox), 메일 배치 주기를 Radio로 |
| `supabase/functions/monthly-report/report.ts` | 주기별 기간 계산, CSV, 메일 본문, 보관 기간 (순수 로직) |
| `supabase/functions/monthly-report/schedule.ts` | 설정 해석, 예약 실행 시 발송 여부 판단 (순수 로직) |
| `supabase/functions/monthly-report/run.ts` | 학원별 처리 흐름 (DB·메일·저장소는 주입) |
| `supabase/functions/monthly-report/supabase-repository.ts` | 설정 읽기, DB 조회·기록 (service role) |
| `supabase/functions/monthly-report/mailer.ts` | Resend 메일 발송 |
| `supabase/functions/monthly-report/index.ts` | 서버 함수 진입점 (인증, 비밀값, 실행) |
| `src/pages/system-settings-page.tsx` | 관리자 화면 "시스템 설정" |

## 설정

### 1. 메일 서비스 (Resend)

1. [Resend](https://resend.com)에 가입하고 API 키를 만든다.
2. 보내는 주소의 도메인을 인증한다. (인증 전에는 테스트 주소만 사용 가능)
3. 무료 플랜의 발송 한도는 Resend 요금제 페이지에서 확인한다. 매일 주기는 발송 건수가 가장 많다.

### 2. 서버 함수 비밀값

```bash
npx supabase secrets set \
  CRON_SECRET=<임의의 긴 문자열> \
  RESEND_API_KEY=<Resend API 키> \
  REPORT_FROM_EMAIL="쪽지시험 <report@your-domain.com>"

# 선택: 원본 사진이 Supabase Storage에 있을 때 버킷 이름 (없으면 사진 정리를 건너뜀)
npx supabase secrets set PAPER_BUCKET=<버킷 이름>
```

`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`는 Supabase가 자동으로 넣어 준다.

### 3. 함수 배포

```bash
npx supabase functions deploy monthly-report
```

`supabase/config.toml`에서 이 함수는 `verify_jwt = false`로 설정되어 있다. 대신 `x-cron-secret` 헤더가 `CRON_SECRET`과 같아야 실행된다.

### 4. 예약 실행용 Vault 비밀값 (SQL Editor에서 한 번)

```sql
select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
select vault.create_secret('<CRON_SECRET과 같은 문자열>', 'cron_secret');
```

그 다음 마이그레이션을 적용하면(`npx supabase db push`) 예약 실행이 등록된다.

```sql
-- 등록 확인 (grading-report-mail-batch, 5 0 * * *)
select jobname, schedule from cron.job;
-- 실행 이력
select * from cron.job_run_details order by start_time desc limit 5;
```

### 5. 시스템 관리자 지정 후 화면에서 켜기

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'admin@example.com');
```

관리자 계정으로 로그인 → 사이드바 **설정 → 시스템** → `WM` 탭 `메일 배치` 구역 → `메일 배치 사용 여부`를 `true`로, `메일 배치 주기`를 고른 뒤 오른쪽 위 **저장**.

```sql
-- 현재 값과 변경 이력 확인
select prop_key, prop_val from public.system_settings where prop_sub_grp = 'WM.MAIL_BATCH';
select prop_key, prev_value, now_value, reg_name, reg_dt
from public.system_setting_histories order by reg_dt desc limit 10;
```

## 수동 실행 (테스트)

수동 실행은 사용 여부 설정과 관계없이 실행된다. `period`를 생략하면 설정된 주기의 직전 기간을 보낸다.

```bash
# 대상만 확인 (메일 발송·사진 정리·기록 없음)
curl -X POST https://<project-ref>.supabase.co/functions/v1/monthly-report \
  -H "x-cron-secret: <CRON_SECRET>" -H "Content-Type: application/json" \
  -d '{"period": "2026-10", "dryRun": true}'

# 특정 달 / 특정 날 실제 발송
curl -X POST https://<project-ref>.supabase.co/functions/v1/monthly-report \
  -H "x-cron-secret: <CRON_SECRET>" -H "Content-Type: application/json" \
  -d '{"period": "2026-10"}'
curl -X POST https://<project-ref>.supabase.co/functions/v1/monthly-report \
  -H "x-cron-secret: <CRON_SECRET>" -H "Content-Type: application/json" \
  -d '{"period": "2026-11-13"}'

# 예약 실행과 같은 판단으로 실행 (설정이 꺼져 있거나 발송일이 아니면 건너뜀)
curl -X POST https://<project-ref>.supabase.co/functions/v1/monthly-report \
  -H "x-cron-secret: <CRON_SECRET>" -H "Content-Type: application/json" \
  -d '{"trigger": "cron", "dryRun": true}'
```

응답 예:

```json
{
  "trigger": "manual",
  "settings": { "enabled": true, "cycle": "MONTHLY" },
  "period": { "start": "2026-10-01", "end": "2026-11-01", "label": "2026-10", "title": "2026년 10월" },
  "dryRun": false,
  "storageConfigured": false,
  "results": [
    { "academyName": "라온 과학학원", "status": "sent", "recipientCount": 2, "jobCount": 40, "purgedImageCount": 0 }
  ]
}
```

- 예약 실행에서 건너뛰면 `{ "skipped": "disabled" | "not_scheduled", "settings": {...} }`로 응답한다.
- 이미 보낸 기간을 다시 실행하면 `status: "skipped", reason: "already_sent"`로 건너뛴다. 다시 보내려면 `report_logs`에서 해당 `sent` 기록을 지운다.
- 한 학원이라도 실패하면 HTTP 207로 응답하고, 실패 사유는 `results[].error`와 `report_logs.error`에 남는다.

## 사진 저장소

- 사진 저장소(Supabase Storage / Cloudflare R2)는 아직 정해지지 않았다.
- `PAPER_BUCKET`이 없으면 사진 정리를 건너뛰고 `image_path`도 그대로 둔다. 실제 파일이 남은 채 경로만 지워지는 일은 없다.
- R2로 결정하면 `index.ts`의 `storage` 구현만 R2 삭제 API로 바꾸면 된다. (`ImageStorage` 인터페이스)

## Spring 백엔드로 운영할 때

이 기능은 서버에서 동작하므로 프론트엔드 백엔드 추상화(`public/config.js`)와 무관하다. Spring으로 운영하면 같은 규칙을 Spring 스케줄러로 구현한다.

- 스케줄러는 매일 실행하고, 시스템 설정(`WM.MAIL_BATCH.ENABLED`, `WM.MAIL_BATCH.CYCLE`)을 읽어 발송 여부·기간을 정한다.
- 시스템 설정 화면은 `/api/system-settings` 계약으로 동작한다. (docs/BACKEND.md)
- 기준 코드: `schedule.ts`(발송 여부 판단), `report.ts`(기간·CSV·본문 규칙), `run.ts`(처리 순서·중복 방지·실패 격리), `*.test.ts`(기대 동작)
