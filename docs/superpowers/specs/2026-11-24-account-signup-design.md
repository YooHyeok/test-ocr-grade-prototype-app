# 계정: 회원가입·가입 승인·사용자 관리·로그인 잠금 설계

작성일: 2026-11-24 · 상태: 검토 대기

## 1. 목표

지금 화면만 있는(목업) 회원가입·가입 승인·내 정보를 Supabase에 실제로 연결하고, 관리자 계정 관리와 로그인 잠금을 더한다.

## 2. 결정 사항 (2026-11-24 확정)

| 항목 | 결정 |
| --- | --- |
| 회원가입 | 학생·선생님 모두 가입 **신청** 가능. 본인인증 단계는 없앤다 (기본 정보 → 승인 대기 2단계). |
| 연락처 안내 | 이메일·휴대폰 번호(카카오톡 포함)를 정확히 넣지 않으면 고른 방법으로 알림이 가지 않는다는 경고 문구를 가입·내 정보 화면에 넣는다. |
| 이메일 확인 메일 | 끈다 (Supabase Auth 설정 `Confirm email` 해제). 선생님 승인으로 대신한다. |
| 승인 | 학생 가입은 같은 학원 선생님·관리자가, 선생님 가입은 관리자만 승인한다. 승인한 학생은 학생 명부에 새로 추가되어 목록에 뜬다. |
| 관리자(admin) | 학원 하나를 관리한다. 지금의 `profiles.is_admin`(시스템 설정 접근)과 같은 계정이다. |
| 사용자 관리 메뉴 | 학생 관리를 합쳐 `사용자 관리`로 바꾸고 `학생 \| 선생님` 탭으로 나눈다. 선생님 탭은 관리자만 보인다. |
| 계정 직접 추가 | 관리자는 선생님·학생, 선생님은 학생 계정을 직접 추가할 수 있다. 처음 비밀번호는 임시 비밀번호(추가할 때 한 번만 보여줌)이고, 첫 로그인 때 반드시 바꾼다. |
| 로그인 잠금 | 비밀번호를 5회 연속 틀리면 잠긴다. 관리자 계정은 잠그지 않는다. 학생은 같은 학원 선생님·관리자가, 선생님은 관리자가 사용자 관리에서 푼다. |

## 3. 데이터 모델 (새 마이그레이션)

- `academies.join_code text unique` — 가입할 때 입력하는 학원 코드 (대문자 저장, 대소문자 무시 비교).
- `profiles`에 추가
  - `phone text` — 휴대폰 번호 (본인인증 없음, 입력값 그대로)
  - `must_change_password boolean default false` — 임시 비밀번호로 만든 계정
  - `failed_login_count int default 0`, `locked_at timestamptz` — 로그인 잠금 (본인이 수정할 수 없는 컬럼)
- `signup_requests` (가입 신청)
  - `id`, `profile_id`(unique), `academy_id`, `type app_role`, `name`, `grade`, `phone`
  - `status signup_status`(`pending` / `approved` / `rejected`), `reject_reason`, `class_id`, `decided_by`, `decided_at`, `created_at`
- `notification_preferences` (알림 받는 방법)
  - `profile_id`(pk), `methods text[]`(`email`·`push`·`sms`·`kakao`만), `email`, `push_enabled`, `sms_phone`, `kakao_phone`(null이면 프로필 휴대폰), `updated_at`

가입 처리 흐름: 회원가입 → Supabase Auth 계정 생성 → 기존 가입 트리거(`handle_new_user`)가 프로필(학원 없음, 학생 권한)과 가입 신청(대기)을 만든다. 학원 코드가 틀리면 가입 자체가 실패한다. 가입 유형(선생님)은 **신청 내용**일 뿐이고, 권한은 승인할 때만 바뀐다.

## 4. 권한 (RLS · DB 함수)

- 승인 전 계정은 프로필에 학원이 없으므로 기존 규칙상 학원 데이터가 하나도 보이지 않는다. 잠긴 계정도 학원 데이터가 보이지 않도록 `current_academy_id()`가 잠긴 계정이면 null을 돌려준다.
- `signup_requests` 조회: 본인 신청 / 같은 학원 선생님(학생 신청) / 같은 학원 관리자(전체). 직접 수정은 막고 아래 함수로만 바꾼다.
- `find_academy_by_code(code)` — 비로그인도 호출 가능, 학원명만 돌려준다.
- `approve_signup(request_id, class_id)` — 학생 신청: 같은 학원 선생님·관리자, 선생님 신청: 같은 학원 관리자. 프로필에 학원·권한을 넣고, 학생이면 학생 명부에 클래스와 함께 추가한다.
- `reject_signup(request_id, reason)` — 권한은 승인과 같다. 사유 필수.
- `notification_preferences`: 본인만 읽고 쓴다.
- 비밀번호 변경 후 `must_change_password` 해제는 본인용 함수로만 한다.

## 5. 서버 함수 (Supabase Edge Function)

다른 사람의 계정을 만들거나, 로그인 실패를 세고 잠그는 일은 브라우저 권한으로 할 수 없어 서버 함수가 맡는다.

- `account-admin` (2단계)
  - `create_user`: 임시 비밀번호(12자)로 계정 생성 → 프로필(학원·권한·첫 로그인 변경 필요) → 학생이면 학생 명부 추가. 임시 비밀번호를 응답으로 한 번만 돌려준다.
  - `unlock`: 잠금 해제·실패 횟수 초기화.
  - 권한: 관리자는 선생님·학생, 선생님은 학생만.
- `auth-login` (3단계) — 로그인을 이 함수로 거친다.
  - 잠긴 계정이면 거부(`account_locked`). 비밀번호가 틀리면 횟수를 올리고 5회째 잠근다(관리자 제외). 성공하면 횟수를 0으로 되돌리고 세션을 돌려준다.
  - 한계: Supabase 인증 주소를 직접 호출하면 이 함수를 건너뛸 수 있다. 그래도 잠긴 계정은 학원 데이터가 보이지 않는다(4절). 인증 단계에서 완전히 막으려면 유료 요금제의 Auth Hook이나 Spring 서버가 필요하다.

## 6. 백엔드 계약 (`src/lib/backend/types.ts`)

| 영역 | 추가 |
| --- | --- |
| 인증 | `signUp(input)`, `changePassword(current, next)` (현재 비밀번호를 다시 확인한 뒤 변경) |
| 프로필 | `Profile`에 `phone`, `joinedAt`, `className`, `status`(`active`·`pending`·`rejected`·`locked`), `rejectReason`, `requestedAcademyName`, `mustChangePassword` |
| 학원 | `findAcademyByCode(code)`, `listClasses()` |
| 가입 신청 | `listSignupRequests(type)`, `approveSignup(id, classId)`, `rejectSignup(id, reason)` |
| 알림 설정 | `getNotifyPrefs()`, `saveNotifyPrefs(prefs)` |
| 사용자 관리 (2단계) | `listUsers(role)`, `createUser(input)` → 임시 비밀번호, `unlockUser(profileId)` |
| 오류 코드 | `account_locked`, `invalid_join_code` |

- 구현: supabase(실제), mock(브라우저 저장소로 같은 규칙), spring(HTTP 호출 규격만, `docs/BACKEND.md`에 API 추가).

## 7. 화면

- 회원가입: 2단계(기본 정보 → 승인 대기). 휴대폰 번호 칸과 연락처 경고 문구를 추가한다. 학원 코드 확인은 DB에서 한다.
- 로그인: 승인 대기·거절 계정은 앱 대신 안내 화면(거절 사유 포함). 잠긴 계정은 "관리자에게 문의" 안내와 남은 시도 횟수. 임시 비밀번호 계정은 비밀번호 변경 화면을 먼저 보여준다.
- 사용자 관리(`/users`, 기존 `/students` 대체)
  - 학생 탭: 학생 목록 / 가입 승인(n), `＋ 학생 추가`, 잠긴 계정 배지와 잠금 해제
  - 선생님 탭(관리자만): 선생님 목록 / 가입 승인(n), `＋ 선생님 추가`, 잠금 해제
- 내 정보: DB 값으로 표시, 알림 설정을 DB에 저장, 연락처 경고 문구, 비밀번호 변경 실제 동작.
- 프로토타입(기획 화면)도 같은 흐름으로 맞춘다.

## 8. 단계와 검증

1. **가입·승인 연결**: 3·4절, 6절(사용자 관리 제외), 7절(사용자 관리 제외).
2. **사용자 관리**: 메뉴 통합·탭, `account-admin`, 계정 직접 추가, 첫 로그인 비밀번호 변경.
3. **로그인 잠금**: `auth-login`, 잠금 안내, 잠금 해제.

검증: SQL은 PGlite로 RLS·함수(다른 학원·학생의 승인 시도 거부, 대기·잠긴 계정의 데이터 차단), 서버 함수 판단 로직은 Deno 테스트, 화면은 Vitest와 mock 백엔드 e2e. 단계마다 커밋 단위로 나눠 두고, 커밋·푸시는 확인 후 한다.

## 9. 범위 밖

본인인증(PASS)과 알림 실제 발송(문자·카카오 유료), 비밀번호 찾기, 학원 추가·관리 화면(관리자는 학원 하나만), 선생님별 담당 클래스.
