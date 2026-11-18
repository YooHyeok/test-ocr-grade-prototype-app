# 백엔드 추상화

프론트엔드는 특정 백엔드에 묶이지 않는다. `public/config.js`의 `backend` 값에 따라 구현체가 정해진다.

| `backend` | 구현체 | 용도 |
| --- | --- | --- |
| `supabase` (기본) | `src/lib/backend/supabase` | Supabase Auth + Postgres (스키마·RLS: `supabase/migrations`) |
| `spring` | `src/lib/backend/spring` | Spring Boot REST API (아래 계약 구현 필요) |
| `mock` | `src/lib/backend/mock` | 백엔드 없이 데모 계정으로 화면 확인 |

## 계층 구조

```
화면 (pages, components)
  └─ TanStack Query 훅 (hooks/queries, hooks/mutations)   ← 캐싱·로딩·오류 상태
       └─ api/*                                           ← 백엔드 호출 진입점
            └─ backend (src/lib/backend)                  ← Backend 인터페이스 구현체
                 ├─ supabase
                 ├─ spring
                 └─ mock
```

- 화면·훅·스토어는 `src/lib/backend/types.ts`의 도메인 타입(`AuthSession`, `Profile`)과 공통 오류(`BackendError`)만 사용한다.
- 백엔드를 바꿔도 TanStack Query 훅과 캐시 키(`QUERY_KEYS`)는 그대로다.
- 새 기능(예: 시험지, 채점)을 추가할 때는 `types.ts`의 `Backend` 인터페이스에 기능을 추가하고, 모든 구현체에 구현한다.

## 설정 (`public/config.js`)

```js
const config = {
  backend: "supabase", // "supabase" | "spring" | "mock"
  supabase: { url: "", publishableKey: "" },
  spring: { baseUrl: "" },
};
```

- 일반 `<script>`로 앱보다 먼저 로드된다. 최상위 `const` 선언은 전역 바인딩이 되므로 앱에서 `config`로 읽는다. (`src/lib/app-config.ts`)
- 백엔드 선택은 `config.js`의 `backend`에서만 한다. 접속 정보 중 비워 둔 값은 `.env`(`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SPRING_API_URL`)를 사용한다.
- 배포 후 이 파일만 바꾸면 다시 빌드하지 않고 백엔드를 전환할 수 있다. (Vercel은 `no-cache` 헤더 적용)
- 브라우저에 공개되는 파일이므로 **공개 가능한 값만** 넣는다.

## Spring REST API 계약

공통 규칙:

- JSON 본문, 필드명은 camelCase
- 인증이 필요한 요청은 `Authorization: Bearer <accessToken>` 헤더 사용
- 실패 시 HTTP 상태 코드와 함께 `{ "code": "<공통 오류 코드>", "message": "..." }` 본문 권장
  - 공통 오류 코드: `invalid_credentials`, `user_not_found`, `user_banned`, `session_expired`, `email_not_confirmed`, `invalid_email`, `rate_limited`, `not_found`, `forbidden`, `invalid_value`, `conflict`, `in_use`
  - `code`가 없으면 상태 코드로 판단: 401 → `session_expired`(로그인 요청에서는 `invalid_credentials`), 403 → `user_banned`(시스템 설정 요청에서는 `forbidden`), 404 → `not_found`, 409 → `conflict`, 429 → `rate_limited`
- 인증된 요청에서 401을 받으면 프론트는 로그아웃 상태로 전환한다.

| 메서드 | 경로 | 요청 | 성공 응답 |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | `{ "email": "...", "password": "..." }` | `200` `{ "accessToken": "...", "user": { "id": "...", "email": "..." } }` |
| `POST` | `/api/auth/logout` | (헤더에 토큰) | `204` |
| `GET` | `/api/profiles/{userId}` | (헤더에 토큰) | `200` `{ "id", "role": "teacher" \| "student", "name", "academyId", "academyName", "isAdmin" }` |
| `GET` | `/api/system-settings/groups` | (시스템 관리자만) | `200` `[{ "id": "WM.MAIL_BATCH", "name", "description" }]` (코드 순) |
| `POST` | `/api/system-settings/groups` | `{ "id": "WM.OCR", "name", "description" }` | `204` (상위 그룹이 없으면 `409 { "code": "in_use" }`) |
| `PATCH` | `/api/system-settings/groups/{id}` | `{ "name", "description" }` | `204` |
| `DELETE` | `/api/system-settings/groups/{id}` | | `204` (하위 그룹·설정이 남아 있으면 `409 { "code": "in_use" }`) |
| `GET` | `/api/system-settings` | (시스템 관리자만) | `200` `[SystemSetting]` (키 순) |
| `POST` | `/api/system-settings` | `SystemSetting`에서 `id` 제외 | `204` (중복 키면 `409 { "code": "conflict" }`) |
| `PUT` | `/api/system-settings/{key}` | `{ "name", "description", "type", "value", "options", "access" }` | `204` |
| `PATCH` | `/api/system-settings` | `{ "changes": [{ "key": "WM.MAIL_BATCH.ENABLED", "value": "true" }] }` | `204` |
| `DELETE` | `/api/system-settings/{key}` | | `204` |
| `GET` | `/api/system-settings/histories?date=2026-11-14&groupId=WM&key=MAIL&page=1&size=10` | (시스템 관리자만, 조건은 모두 선택) | `200` `{ "items": [SystemSettingHistory], "total": 2 }` (최신순) |

- `SystemSetting` = `{ "id", "key": "WM.MAIL_BATCH.ENABLED", "groupId": "WM", "subGroupId": "WM.MAIL_BATCH" | null, "name", "description", "type": "STR" | "NUM" | "BOOL" | "RADIO" | "SEL" | "CHECK", "value", "options": ["DAILY", "WEEKLY"] | null, "access": "R" | "W" | "H" }`
- `SystemSettingHistory` = `{ "id", "key", "name", "groupId", "groupName", "action": "I" | "U" | "D", "prevValue", "nowValue", "changedAt": ISO, "changedBy" }`
- `isAdmin`: 시스템 관리자 여부(모든 학원 공통 설정 관리). 학원 권한 `role`과 별개다.
- 시스템 설정 규칙 (DELMA 시스템 설정 화면·`supabase/migrations/20261114000200_system_settings.sql`과 같다)
  - 그룹 코드는 영문 대문자 점 표기 계층 (`WM` → `WM.MAIL_BATCH`). 최상위 그룹은 화면 탭, 하위 그룹은 구역이다. 하위 그룹은 상위 그룹이 있어야 만들 수 있다.
  - 키 = 소속 그룹 코드 + `.` + 이름(영문 대문자). `groupId`는 최상위 그룹, `subGroupId`는 소속 하위 그룹(최상위 바로 아래면 null). 키·그룹은 만든 뒤 바꿀 수 없다.
  - 값 유형이 입력 모양을 정한다. 목록과 추가·수정 창이 같은 모양으로 그린다. 빈 값은 허용한다.

    | `type` | 화면 표시명 | 입력 모양 | `options` | `value` |
    | --- | --- | --- | --- | --- |
    | `STR` | String | 텍스트 입력 | null | 입력 그대로 |
    | `NUM` | Number | 숫자 입력 | null | 숫자 (`0.85`) |
    | `BOOL` | Boolean | 토글 스위치 | null (선택지 없음) | `true` / `false` |
    | `RADIO` | Radio | 라디오 묶음 | 1개 이상 필수 | 선택지 중 하나 |
    | `SEL` | Select | 선택 상자 | 1개 이상 필수 | 선택지 중 하나 |
    | `CHECK` | Checkbox | 체크박스 묶음 | 1개 이상 필수 | 고른 값을 쉼표로 이음 (`A,C`) |

  - 선택지에는 쉼표를 쓸 수 없고 중복될 수 없다.
  - `access`: `R` 열람만 가능(값 수정 불가) / `W` 수정 가능 / `H` 항목 숨김(목록에 안 보임)
  - 관리자가 아니면 `403 { "code": "forbidden" }`, 규칙 위반은 `400 { "code": "invalid_value" }`. `PATCH /api/system-settings`는 한꺼번에 반영하거나 모두 거부한다.
  - 값이 바뀌거나 설정이 추가·삭제되면 변경 이력을 남긴다. 이력의 `groupId`는 최상위 그룹이고, `date`는 한국 시간 날짜로 검색한다.
  - 테이블은 DELMA Factory 시스템 속성 설계(`delma_sys_prop`, `_grp`, `_hist`)를 따른다. `options`는 `prop_spr_type`(구분자 `,`) + `prop_spr_val`(선택지 전체), `access`는 `prop_usr_rgh`에 저장한다. (`supabase/migrations/20261115000000_system_setting_types.sql`)
- 브라우저에서 다른 도메인의 API를 호출하므로 Spring에 CORS 설정(프론트 도메인 허용, `Authorization` 헤더 허용)이 필요하다.
- 학원 단위 데이터 격리와 권한 검사(학생은 정답 비공개 등)는 Supabase RLS와 같은 규칙을 서버에서 구현한다. (`supabase/migrations/20261027000100_rls_policies.sql` 참고)
- 토큰 갱신(refresh token)은 아직 계약에 없다. 필요하면 `POST /api/auth/refresh`를 추가하고 `spring` 구현체에 반영한다.
- 채점 결과 메일 발송은 서버 예약 작업이라 이 계약 밖이다. Spring으로 운영하면 스케줄러가 시스템 설정(`WM.MAIL_BATCH.*`)을 읽어 같은 규칙으로 구현한다. (docs/MONTHLY_REPORT.md)
