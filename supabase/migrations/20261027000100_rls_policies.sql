-- =============================================================================
-- 접근 제어 (Row Level Security) + 가입 시 프로필 자동 생성
--
-- 원칙 (PRODUCT_PLAN §5): 모든 데이터는 로그인 사용자의 소속 학원(academy_id) 안에서만 보인다.
--   - teacher : 소속 학원의 클래스·학생·시험지·채점 데이터를 조회/관리
--   - student : 자기 채점 작업과 결과만 조회, 시험지 업로드(uploaded 상태)만 가능
--   - 정답(answer_items)은 학생에게 노출하지 않는다.
--   - 채점 결과 기록(processing 이후 상태 변경, grading_items 작성)은
--     서버 함수(Edge Function, service role)가 수행하므로 학생 쓰기 권한이 없다.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 권한 확인 함수 (RLS 정책에서 profiles를 재귀 조회하지 않도록 security definer)
-- ---------------------------------------------------------------------------

create function public.current_academy_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select academy_id from public.profiles where id = (select auth.uid());
$$;

create function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'teacher'
  );
$$;

create function public.current_student_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.students where profile_id = (select auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- 가입 시 프로필 자동 생성
-- 권한(role)은 가입 정보에서 받지 않고 항상 student로 시작한다. (임의로 teacher 가입 방지)
-- ---------------------------------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS 활성화
-- ---------------------------------------------------------------------------

alter table public.academies enable row level security;
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.answer_sheets enable row level security;
alter table public.answer_items enable row level security;
alter table public.grading_jobs enable row level security;
alter table public.grading_items enable row level security;

-- ---------------------------------------------------------------------------
-- academies
-- ---------------------------------------------------------------------------

create policy "소속 학원 조회" on public.academies
  for select to authenticated
  using (id = (select public.current_academy_id()));

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create policy "본인 또는 같은 학원(선생님) 프로필 조회" on public.profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or ((select public.is_teacher()) and academy_id = (select public.current_academy_id()))
  );

create policy "본인 프로필 수정" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- 본인 수정은 이름만 허용 (권한·소속 학원은 관리자만 변경)
revoke update on public.profiles from authenticated;
grant update (name) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- classes
-- ---------------------------------------------------------------------------

create policy "소속 학원 클래스 조회" on public.classes
  for select to authenticated
  using (academy_id = (select public.current_academy_id()));

create policy "선생님 클래스 관리" on public.classes
  for all to authenticated
  using ((select public.is_teacher()) and academy_id = (select public.current_academy_id()))
  with check ((select public.is_teacher()) and academy_id = (select public.current_academy_id()));

-- ---------------------------------------------------------------------------
-- students
-- ---------------------------------------------------------------------------

create policy "본인 학생 정보 조회" on public.students
  for select to authenticated
  using (profile_id = (select auth.uid()));

create policy "선생님 학생 관리" on public.students
  for all to authenticated
  using ((select public.is_teacher()) and academy_id = (select public.current_academy_id()))
  with check ((select public.is_teacher()) and academy_id = (select public.current_academy_id()));

-- ---------------------------------------------------------------------------
-- answer_sheets : 학생도 업로드할 시험지를 고르기 위해 조회 가능
-- ---------------------------------------------------------------------------

create policy "소속 학원 시험지 조회" on public.answer_sheets
  for select to authenticated
  using (academy_id = (select public.current_academy_id()));

create policy "선생님 시험지 관리" on public.answer_sheets
  for all to authenticated
  using ((select public.is_teacher()) and academy_id = (select public.current_academy_id()))
  with check ((select public.is_teacher()) and academy_id = (select public.current_academy_id()));

-- ---------------------------------------------------------------------------
-- answer_items : 정답이 들어 있으므로 선생님만 접근
-- ---------------------------------------------------------------------------

create policy "선생님 문항 관리" on public.answer_items
  for all to authenticated
  using (
    (select public.is_teacher())
    and exists (
      select 1 from public.answer_sheets s
      where s.id = answer_sheet_id and s.academy_id = (select public.current_academy_id())
    )
  )
  with check (
    (select public.is_teacher())
    and exists (
      select 1 from public.answer_sheets s
      where s.id = answer_sheet_id and s.academy_id = (select public.current_academy_id())
    )
  );

-- ---------------------------------------------------------------------------
-- grading_jobs
-- ---------------------------------------------------------------------------

create policy "선생님 채점 작업 관리" on public.grading_jobs
  for all to authenticated
  using ((select public.is_teacher()) and academy_id = (select public.current_academy_id()))
  with check ((select public.is_teacher()) and academy_id = (select public.current_academy_id()));

create policy "학생 본인 채점 작업 조회" on public.grading_jobs
  for select to authenticated
  using (student_id = (select public.current_student_id()));

create policy "학생 시험지 업로드" on public.grading_jobs
  for insert to authenticated
  with check (
    student_id = (select public.current_student_id())
    and academy_id = (select public.current_academy_id())
    and status = 'uploaded'
  );

-- 채점 시작 전(uploaded)에만 삭제 후 재업로드 가능 (PRODUCT_PLAN §3)
create policy "학생 채점 전 업로드 삭제" on public.grading_jobs
  for delete to authenticated
  using (student_id = (select public.current_student_id()) and status = 'uploaded');

-- ---------------------------------------------------------------------------
-- grading_items
-- ---------------------------------------------------------------------------

create policy "선생님 채점 결과 관리" on public.grading_items
  for all to authenticated
  using (
    (select public.is_teacher())
    and exists (
      select 1 from public.grading_jobs j
      where j.id = grading_job_id and j.academy_id = (select public.current_academy_id())
    )
  )
  with check (
    (select public.is_teacher())
    and exists (
      select 1 from public.grading_jobs j
      where j.id = grading_job_id and j.academy_id = (select public.current_academy_id())
    )
  );

create policy "학생 본인 채점 결과 조회" on public.grading_items
  for select to authenticated
  using (
    exists (
      select 1 from public.grading_jobs j
      where j.id = grading_job_id and j.student_id = (select public.current_student_id())
    )
  );
