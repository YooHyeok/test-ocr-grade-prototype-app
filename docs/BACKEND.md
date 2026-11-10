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
  - 공통 오류 코드: `invalid_credentials`, `user_not_found`, `user_banned`, `session_expired`, `email_not_confirmed`, `invalid_email`, `rate_limited`, `not_found`
  - `code`가 없으면 상태 코드로 판단: 401 → `session_expired`(로그인 요청에서는 `invalid_credentials`), 403 → `user_banned`, 404 → `not_found`, 429 → `rate_limited`
- 인증된 요청에서 401을 받으면 프론트는 로그아웃 상태로 전환한다.

| 메서드 | 경로 | 요청 | 성공 응답 |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | `{ "email": "...", "password": "..." }` | `200` `{ "accessToken": "...", "user": { "id": "...", "email": "..." } }` |
| `POST` | `/api/auth/logout` | (헤더에 토큰) | `204` |
| `GET` | `/api/profiles/{userId}` | (헤더에 토큰) | `200` `{ "id", "role": "teacher" \| "student", "name", "academyId", "academyName" }` |

- 브라우저에서 다른 도메인의 API를 호출하므로 Spring에 CORS 설정(프론트 도메인 허용, `Authorization` 헤더 허용)이 필요하다.
- 학원 단위 데이터 격리와 권한 검사(학생은 정답 비공개 등)는 Supabase RLS와 같은 규칙을 서버에서 구현한다. (`supabase/migrations/20261027000100_rls_policies.sql` 참고)
- 토큰 갱신(refresh token)은 아직 계약에 없다. 필요하면 `POST /api/auth/refresh`를 추가하고 `spring` 구현체에 반영한다.
