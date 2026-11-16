-- =============================================================================
-- 시스템 설정 값 유형 확장
--
-- 유형(prop_type)이 화면의 입력 모양을 정한다. 목록과 추가·수정 창이 같은 모양으로 그린다.
--   STR   문자열       텍스트 입력
--   NUM   숫자         숫자 입력
--   BOOL  불리언       토글 스위치 (true / false, 선택지 없음)
--   RADIO 라디오       선택지 중 하나
--   SEL   선택 상자    선택지 중 하나 (드롭다운)
--   CHECK 체크박스     선택지 중 여러 개 (구분자로 이어서 저장, 예: A,C)
-- 선택지는 prop_spr_val(구분자로 이은 전체 값), 구분자는 prop_spr_type(쉼표)에 저장한다.
-- 선택형(RADIO/SEL/CHECK)만 선택지를 갖고, 그 외 유형은 선택지가 없어야 한다.
-- =============================================================================

alter table public.system_settings
  drop constraint system_settings_prop_type_check,
  drop constraint system_settings_option_val;

-- 메일 배치 주기는 선택지(DAILY/WEEKLY/MONTHLY) 중 하나를 고르는 라디오로 바꾼다. (값은 그대로라 이력 없음)
update public.system_settings
set prop_type = 'RADIO'
where prop_key = 'WM.MAIL_BATCH.CYCLE';

alter table public.system_settings
  add constraint system_settings_prop_type_check
    check (prop_type in ('STR', 'NUM', 'BOOL', 'RADIO', 'SEL', 'CHECK')),
  -- 선택형만 선택지(구분자 + 전체 값)를 갖는다.
  add constraint system_settings_options_by_type check (
    case
      when prop_type in ('RADIO', 'SEL', 'CHECK')
        then prop_spr_type is not null and coalesce(prop_spr_val, '') <> ''
      else prop_spr_type is null and prop_spr_val is null
    end
  ),
  -- 라디오·선택 상자: 선택지 중 하나 (빈 값 허용)
  add constraint system_settings_single_choice_val check (
    prop_type not in ('RADIO', 'SEL') or coalesce(prop_val, '') = ''
    or prop_val = any (string_to_array(prop_spr_val, prop_spr_type))
  ),
  -- 체크박스: 고른 값이 모두 선택지 안에 있어야 한다. (빈 값 허용)
  add constraint system_settings_multi_choice_val check (
    prop_type <> 'CHECK' or coalesce(prop_val, '') = ''
    or string_to_array(prop_val, prop_spr_type) <@ string_to_array(prop_spr_val, prop_spr_type)
  );

comment on column public.system_settings.prop_type is
  '속성 값 유형 (STR 문자열 / NUM 숫자 / BOOL 불리언 / RADIO 라디오 / SEL 선택 상자 / CHECK 체크박스)';
comment on column public.system_settings.prop_spr_type is '선택형(RADIO/SEL/CHECK) 선택지·다중 값 구분자 (쉼표)';
comment on column public.system_settings.prop_spr_val is '선택형 선택지 전체 (구분자로 이음, 예: DAILY,WEEKLY,MONTHLY)';
comment on column public.system_settings.prop_val is '속성 값 (BOOL은 true/false, CHECK는 고른 값을 구분자로 이음)';
