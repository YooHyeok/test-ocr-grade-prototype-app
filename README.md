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
- Supabase (Auth / Storage / Postgres / Edge Functions)

## 시작하기

```bash
npm install
cp .env.example .env   # VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY 입력
npm run dev
```

| 스크립트 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 타입 체크 + 프로덕션 빌드 |
| `npm run lint` | ESLint |
| `npm run type-gen` | Supabase 스키마 타입 생성 (`package.json`의 project-id 설정 필요) |

## 화면 구성

| 경로 | 화면 |
| --- | --- |
| `/` | 대시보드 |
| `/grading` | 채점 관리 |
| `/exam-sheets/subjective` | 시험지 관리 · 주관식 |
| `/exam-sheets/objective` | 시험지 관리 · 객관식 |
| `/upload` | 시험지 업로드 / 촬영 (학생, 모바일) |
