# 쪽지시험

한국 중고등학생 화학 쪽지시험지를 OCR(주관식) / OMR(객관식)로 인식하여 채점하고 기록하는 웹앱입니다.

- 제품 기획: [docs/PRODUCT_PLAN.md](docs/PRODUCT_PLAN.md)
- 정적 UI 기획 프로토타입: [`public/prototype/`](public/prototype/index.html) — 개발 서버에서 `/prototype/index.html`로 확인
  - 배포본: https://yoohyeok.github.io/test-ocr-grade-prototype-app/ (`main` 브랜치)
  - 프로토타입 원본 브랜치: `feature/init-mockup-plan`

## 기술 스택

- Vite + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- React Router v7
- Zustand (+ immer)
- TanStack Query v5
- 백엔드: Supabase(기본) / Spring REST API / mock 중 선택 — [docs/BACKEND.md](docs/BACKEND.md)

## 시작하기

```bash
npm install
npm run dev
```

백엔드는 [`public/config.js`](public/config.js)에서 고릅니다. 빌드 없이 배포 후에도 바꿀 수 있습니다.

```js
const config = {
  backend: "supabase", // "supabase" | "spring" | "mock"
  supabase: { url: "", publishableKey: "" },
  spring: { baseUrl: "" },
};
```

- 비워 둔 값은 `.env`를 사용합니다. (`cp .env.example .env`)
- 백엔드 없이 화면만 보려면 `backend: "mock"`으로 바꾸고 데모 계정(`teacher@demo.com` / `student@demo.com`, 비밀번호 `demo1234`)으로 로그인합니다.

| 스크립트 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 타입 체크 + 프로덕션 빌드 |
| `npm run lint` | ESLint |
| `npm test` | 단위 테스트 (Vitest) |
| `npm run type-gen` | Supabase 스키마 타입 생성 (`package.json`의 project-id 설정 필요) |

## Supabase 설정

DB 스키마와 접근 제어(RLS)는 [`supabase/migrations`](supabase/migrations)에 있습니다.

```bash
npx supabase login
npx supabase link --project-ref <프로젝트 ref>
npx supabase db push        # 마이그레이션 적용
npm run type-gen            # src/database.types.ts 재생성 (package.json의 project-id 수정 필요)
```

- 로컬 Supabase(`npx supabase start`)를 쓰려면 Docker가 필요합니다.
- 회원가입 화면은 아직 없습니다. Supabase 대시보드 **Authentication > Users**에서 계정을 만듭니다.
- 가입한 계정은 항상 `student` 권한으로 시작합니다. 선생님 지정과 학원 배정은 SQL Editor에서 직접 합니다.

```sql
insert into public.academies (name) values ('라온 과학학원') returning id;

update public.profiles
set role = 'teacher', academy_id = '<학원 id>'
where id = (select id from auth.users where email = 'teacher@example.com');
```

### 시스템 관리자

모든 학원에 공통으로 적용되는 **설정 · 시스템** 화면(`/settings/system`)은 시스템 관리자만 볼 수 있습니다. DELMA 시스템 설정 화면과 같은 구성으로 최상위 그룹(탭)·하위 그룹(구역)별 설정을 추가·수정·삭제하고, 그룹 관리와 변경 이력 검색을 합니다. (DELMA Factory 시스템 속성 테이블 구조) 학원 권한(`role`)과 별개로 SQL Editor에서 지정합니다.

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'admin@example.com');
```

mock 백엔드에서는 선생님 데모 계정(`teacher@demo.com`)이 시스템 관리자입니다.

### 채점 결과 메일 배치

학원별 채점 결과(요약 + CSV)를 선생님 전원에게 메일로 보내고, 보관 기간이 지난 원본 사진을 정리합니다. (Supabase Edge Function + pg_cron)
사용 여부와 주기(매일 / 매주 월요일 / 매달 1일)는 **설정 · 시스템** 화면에서 바꿉니다. (기본값: 사용 안 함, 매월)
설정·배포·수동 실행 방법: [docs/MONTHLY_REPORT.md](docs/MONTHLY_REPORT.md)

## 화면 구성

로그인한 계정의 권한(`profiles.role`)에 따라 접근할 수 있는 화면이 나뉩니다.

| 경로 | 화면 | 권한 |
| --- | --- | --- |
| `/sign-in` | 로그인 | 비로그인 |
| `/` | 대시보드 | 선생님 |
| `/grading` | 채점 관리 | 선생님 |
| `/exam-sheets/subjective` | 시험지 관리 · 주관식 | 선생님 |
| `/exam-sheets/objective` | 시험지 관리 · 객관식 | 선생님 |
| `/students` | 학생 관리 | 선생님 |
| `/groups` | 그룹 관리 | 선생님 |
| `/settings/grading` | 설정 · 채점 정책 | 선생님 |
| `/settings/system` | 설정 · 시스템 (그룹 관리, 설정 추가·수정·삭제, 변경 이력) | 선생님 중 시스템 관리자(`profiles.is_admin`) |
| `/my-papers` | 내 시험지 | 학생 |
| `/upload` | 시험지 첨부 | 학생 |
