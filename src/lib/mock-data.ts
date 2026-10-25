/**
 * Supabase 연동 전까지 화면에서 사용하는 임시 데이터.
 * 기획 프로토타입(public/prototype/app.js)의 예시 데이터를 그대로 옮겼다.
 */
import type {
  CategoryGroup,
  ExamSheet,
  GradingRecord,
  MyPaper,
  ObjectiveQuestion,
  Student,
  SubjectiveQuestion,
  TeacherAssignment,
} from "@/type";

export const DASHBOARD_SUMMARY = {
  completedToday: 24,
  needsReview: 3,
  trend: "+18%",
};

export const GRADING_RECORDS: GradingRecord[] = [
  {
    date: "06.01 16:42",
    student: "유재혁",
    grade: "고2",
    academy: "라온 과학학원",
    className: "고2 화학 I",
    category: "화학 I · 산화 환원",
    paper: "산화 환원 미니테스트",
    score: 90,
    status: "채점 완료",
  },
  {
    date: "06.01 16:31",
    student: "허재녕",
    grade: "고2",
    academy: "라온 과학학원",
    className: "고2 화학 I",
    category: "화학 I · 산화 환원",
    paper: "산화 환원 미니테스트",
    score: 70,
    status: "검토 필요",
  },
  {
    date: "06.01 15:58",
    student: "박지효",
    grade: "중3",
    academy: "라온 과학학원",
    className: "중3 화학 심화",
    category: "중등 화학 · 이온",
    paper: "이온과 앙금 생성 반응",
    score: 100,
    status: "채점 완료",
  },
  {
    date: "06.01 15:44",
    student: "황진미",
    grade: "중3",
    academy: "브릿지 사이언스",
    className: "중3 화학 심화",
    category: "중등 화학 · 이온",
    paper: "이온과 앙금 생성 반응",
    score: 75,
    status: "검토 필요",
  },
  {
    date: "05.31 19:20",
    student: "김의수",
    grade: "고1",
    academy: "라온 과학학원",
    className: "고1 통합과학 A",
    category: "통합과학 · 물질",
    paper: "물질의 규칙성 주간 테스트",
    score: 87,
    status: "채점 완료",
  },
];

/** 채점 기록에서 학생을 중복 없이 추린다. */
export const STUDENTS: Student[] = GRADING_RECORDS.filter(
  (record, index, list) =>
    list.findIndex((item) => item.student === record.student) === index,
).map((record) => ({
  name: record.student,
  className: record.className,
  needsReview: record.status === "검토 필요",
}));

export const SUBJECTIVE_SHEETS: ExamSheet[] = [
  {
    id: 1,
    name: "산화 환원 미니테스트",
    category: "화학 I · 산화 환원",
    subject: "화학 I",
    count: 10,
  },
  {
    id: 2,
    name: "이온과 앙금 생성 반응",
    category: "중등 화학 · 이온",
    subject: "중등 화학",
    count: 12,
  },
  {
    id: 3,
    name: "물질의 규칙성 주간 테스트",
    category: "통합과학 · 물질",
    subject: "통합과학",
    count: 15,
  },
  {
    id: 4,
    name: "몰과 화학식량 확인 문제",
    category: "화학 I · 몰",
    subject: "화학 I",
    count: 8,
  },
  {
    id: 5,
    name: "중화 반응 단답 점검",
    category: "화학 I · 중화 반응",
    subject: "화학 I",
    count: 10,
  },
  {
    id: 6,
    name: "산과 염기 개념 테스트",
    category: "중등 화학 · 산과 염기",
    subject: "중등 화학",
    count: 11,
  },
  {
    id: 7,
    name: "기체의 성질 주간 평가",
    category: "통합과학 · 물질",
    subject: "통합과학",
    count: 14,
  },
  {
    id: 8,
    name: "원소와 주기율표 미니테스트",
    category: "통합과학 · 물질",
    subject: "통합과학",
    count: 9,
  },
  {
    id: 9,
    name: "화학 반응식 균형 맞추기",
    category: "화학 I · 산화 환원",
    subject: "화학 I",
    count: 13,
  },
  {
    id: 10,
    name: "전해질과 이온화 단답",
    category: "중등 화학 · 이온",
    subject: "중등 화학",
    count: 12,
  },
];

/** [질문, 정답, 허용 표기] */
const SUBJECTIVE_SOURCE: Record<number, [string, string, string?][]> = {
  1: [
    ["전자를 잃는 반응을 무엇이라고 하는가?", "산화", "산화 반응"],
    ["전자를 얻는 반응을 무엇이라고 하는가?", "환원", "환원 반응"],
    ["원소의 산화 상태를 나타내는 값을 쓰시오.", "산화수", "산화 수"],
    ["산화와 환원이 동시에 일어나는 반응은?", "산화 환원 반응", "산화환원반응"],
    ["산소를 잃는 반응을 쓰시오.", "환원", "환원 반응"],
  ],
  2: [
    ["+전하를 띤 이온을 무엇이라 하는가?", "양이온"],
    ["−전하를 띤 이온을 무엇이라 하는가?", "음이온"],
    ["두 용액을 섞을 때 생기는 침전물은?", "앙금"],
    ["수용액에서 전류가 흐르는 물질은?", "전해질"],
    ["Na⁺ 이온의 이름은?", "나트륨 이온"],
  ],
  3: [
    ["우주 초기에 만들어진 원소는?", "수소"],
    ["별 내부에서 일어나는 반응은?", "핵융합"],
    ["지각에 가장 많은 원소는?", "산소"],
    ["주기율표의 세로줄을 무엇이라 하는가?", "족"],
    ["주기율표의 가로줄을 무엇이라 하는가?", "주기"],
  ],
  4: [
    ["물질 1몰의 입자 수를 무엇이라 하는가?", "아보가드로수"],
    ["기체 1몰의 0°C·1기압 부피는?", "22.4 L"],
    ["몰 농도의 단위를 쓰시오.", "mol/L"],
    ["분자량에 g을 붙인 값은?", "몰질량"],
    ["탄소 12g은 몇 몰인가?", "1몰"],
  ],
  5: [
    ["산과 염기가 반응하는 것을 무엇이라 하는가?", "중화 반응"],
    ["중화 반응에서 생성되는 물질은?", "물과 염"],
    ["산성 용액의 pH 범위는?", "7 미만"],
    ["염기성 용액의 pH 범위는?", "7 초과"],
    ["중화점에서의 액성은?", "중성"],
  ],
  6: [
    ["신맛을 내는 물질의 성질은?", "산성"],
    ["붉은 리트머스를 푸르게 하는 것은?", "염기"],
    ["pH 7은 어떤 액성인가?", "중성"],
    ["위산의 주성분을 쓰시오.", "염산"],
    ["비누의 액성은?", "염기성"],
  ],
  7: [
    ["기체의 압력과 부피의 관계 법칙은?", "보일 법칙"],
    ["기체의 온도와 부피의 관계 법칙은?", "샤를 법칙"],
    ["기체 분자가 운동하는 원인은?", "열에너지"],
    ["기체 압력의 단위 하나를 쓰시오.", "기압"],
    ["기체가 골고루 퍼지는 현상은?", "확산"],
  ],
  8: [
    ["주기율표를 체계화한 과학자는?", "멘델레예프"],
    ["같은 족 원소의 공통점은?", "최외각 전자 수"],
    ["1족 원소를 무엇이라 하는가?", "알칼리 금속"],
    ["17족 원소를 무엇이라 하는가?", "할로젠"],
    ["18족 원소를 무엇이라 하는가?", "비활성 기체"],
  ],
  9: [
    ["화학 반응 전후 원자의 수는?", "같다"],
    ["반응식의 계수를 맞추는 것을 무엇이라 하는가?", "균형 맞추기"],
    ["질량 보존 법칙을 발견한 과학자는?", "라부아지에"],
    ["반응물은 화살표의 어느 쪽에 쓰는가?", "왼쪽"],
    ["생성물은 화살표의 어느 쪽에 쓰는가?", "오른쪽"],
  ],
  10: [
    ["전해질이 물에서 이온으로 나뉘는 현상은?", "이온화"],
    ["물에서 이온화하지 않는 물질은?", "비전해질"],
    ["소금물은 전해질인가?", "맞다"],
    ["설탕물은 전해질인가?", "아니다"],
    ["이온이 이동하여 흐르는 것은?", "전류"],
  ],
};

/** 시험지별 주관식 문항. OCR 영역은 문항 순서대로 세로로 배치한다. */
export const SUBJECTIVE_QUESTIONS: Record<number, SubjectiveQuestion[]> =
  Object.fromEntries(
    Object.entries(SUBJECTIVE_SOURCE).map(([id, list]) => [
      id,
      list.map(([question, answer, aliases = ""], index) => ({
        id: Number(id) * 100 + index + 1,
        question,
        answer,
        aliases,
        region: { x: 72, y: 186 + index * 89, w: 420, h: 54 },
      })),
    ]),
  );

export const OBJECTIVE_SHEETS: ExamSheet[] = [
  {
    id: 1,
    name: "산화 환원 객관식 미니테스트",
    category: "화학 I · 산화 환원",
    subject: "화학 I",
    count: 5,
  },
  {
    id: 2,
    name: "이온과 앙금 객관식",
    category: "중등 화학 · 이온",
    subject: "중등 화학",
    count: 5,
  },
  {
    id: 3,
    name: "물질의 규칙성 객관식",
    category: "통합과학 · 물질",
    subject: "통합과학",
    count: 5,
  },
];

const OBJECTIVE_SOURCE: Record<number, Omit<ObjectiveQuestion, "id">[]> = {
  1: [
    {
      question: "전자를 잃는 반응을 무엇이라 하는가?",
      choices: ["환원", "산화", "중화", "연소"],
      answer: 1,
    },
    {
      question: "전자를 얻는 반응을 무엇이라 하는가?",
      choices: ["산화", "환원", "분해", "치환"],
      answer: 1,
    },
    {
      question: "원소의 산화 상태를 나타내는 값은?",
      choices: ["원자량", "산화수", "몰수", "질량수"],
      answer: 1,
    },
    {
      question: "산화와 환원이 동시에 일어나는 반응은?",
      choices: ["중화 반응", "산화 환원 반응", "분해 반응", "앙금 생성"],
      answer: 1,
    },
    {
      question: "산소를 잃는 반응은?",
      choices: ["산화", "환원", "연소", "부식"],
      answer: 1,
    },
  ],
  2: [
    {
      question: "+전하를 띤 이온을 무엇이라 하는가?",
      choices: ["음이온", "양이온", "중성자", "분자"],
      answer: 1,
    },
    {
      question: "−전하를 띤 이온을 무엇이라 하는가?",
      choices: ["양이온", "음이온", "원자핵", "전자쌍"],
      answer: 1,
    },
    {
      question: "두 용액을 섞을 때 생기는 침전물은?",
      choices: ["기체", "앙금", "용매", "결정"],
      answer: 1,
    },
    {
      question: "수용액에서 전류가 흐르는 물질은?",
      choices: ["비전해질", "전해질", "절연체", "촉매"],
      answer: 1,
    },
    {
      question: "Na⁺의 이름은?",
      choices: ["칼륨 이온", "나트륨 이온", "칼슘 이온", "수소 이온"],
      answer: 1,
    },
  ],
  3: [
    {
      question: "우주 초기에 만들어진 원소는?",
      choices: ["산소", "수소", "철", "규소"],
      answer: 1,
    },
    {
      question: "별 내부에서 일어나는 반응은?",
      choices: ["핵분열", "핵융합", "연소", "산화"],
      answer: 1,
    },
    {
      question: "지각에 가장 많은 원소는?",
      choices: ["규소", "산소", "알루미늄", "철"],
      answer: 1,
    },
    {
      question: "주기율표의 세로줄을 무엇이라 하는가?",
      choices: ["주기", "족", "계열", "군"],
      answer: 1,
    },
    {
      question: "주기율표의 가로줄을 무엇이라 하는가?",
      choices: ["족", "주기", "구역", "블록"],
      answer: 1,
    },
  ],
};

/** 시험지별 객관식 문항 */
export const OBJECTIVE_QUESTIONS: Record<number, ObjectiveQuestion[]> =
  Object.fromEntries(
    Object.entries(OBJECTIVE_SOURCE).map(([id, list]) => [
      id,
      list.map((item, index) => ({
        id: Number(id) * 100 + index + 1,
        ...item,
      })),
    ]),
  );

export const MY_PAPERS: MyPaper[] = [
  {
    id: 1,
    title: "산화 환원 미니테스트",
    category: "화학 I · 산화 환원",
    uploaded: "06.01 17:20",
    date: "2026-06-01",
    status: "업로드 완료",
  },
  {
    id: 2,
    title: "주기율표 핵심 개념",
    category: "통합과학 · 물질",
    uploaded: "05.30 19:10",
    date: "2026-05-30",
    status: "채점 완료",
    score: 80,
  },
  {
    id: 3,
    title: "몰과 화학식량",
    category: "화학 I · 몰",
    uploaded: "05.24 14:12",
    date: "2026-05-24",
    status: "채점 완료",
    score: 90,
  },
  {
    id: 4,
    title: "이온과 앙금 생성 반응",
    category: "중등 화학 · 이온",
    uploaded: "05.17 16:44",
    date: "2026-05-17",
    status: "채점 완료",
    score: 75,
  },
  {
    id: 5,
    title: "중화 반응 확인 문제",
    category: "화학 I · 중화 반응",
    uploaded: "05.08 20:05",
    date: "2026-05-08",
    status: "채점 완료",
    score: 85,
  },
  {
    id: 6,
    title: "물질의 규칙성 주간 테스트",
    category: "통합과학 · 물질",
    uploaded: "04.27 18:30",
    date: "2026-04-27",
    status: "채점 완료",
    score: 95,
  },
  {
    id: 7,
    title: "산과 염기 개념 점검",
    category: "중등 화학 · 산과 염기",
    uploaded: "04.18 13:22",
    date: "2026-04-18",
    status: "채점 완료",
    score: 70,
  },
];

export const CATEGORY_GROUPS: CategoryGroup[] = [
  { title: "중등 과학", units: "화학 반응 · 이온 · 기체" },
  { title: "통합과학", units: "물질의 규칙성 · 화학 변화" },
  { title: "화학 I", units: "몰 · 산화 환원 · 중화 반응" },
];

export const TEACHERS = ["전선생", "이선생", "박선생"];

export const TEACHER_ASSIGNMENTS: TeacherAssignment[] = [
  {
    category: "화학 I · 산화 환원",
    className: "고2 화학 I",
    teacher: "전선생",
    role: "주 담당",
  },
  {
    category: "중등 화학 · 이온",
    className: "중3 화학 심화",
    teacher: "이선생",
    role: "주 담당",
  },
  {
    category: "통합과학 · 물질",
    className: "고1 통합과학 A",
    teacher: "박선생",
    role: "보조",
  },
];

export const GRADING_POLICIES = [
  "OCR 결과는 학생이 `채점하기` 버튼을 누른 뒤에만 처리",
  "채점 완료된 시험지는 이미지 교체 금지",
  "낮은 신뢰도의 화학식은 선생님 검토 대상으로 이동",
];
