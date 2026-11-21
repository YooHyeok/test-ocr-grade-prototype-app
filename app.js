const records = [
  { date:"06.01 16:42", student:"유재혁", grade:"고2", academy:"라온 과학학원", className:"고2 화학 I", category:"화학 I · 산화 환원", paper:"산화 환원 미니테스트", score:90, status:"채점 완료" },
  { date:"06.01 16:31", student:"허재녕", grade:"고2", academy:"라온 과학학원", className:"고2 화학 I", category:"화학 I · 산화 환원", paper:"산화 환원 미니테스트", score:70, status:"검토 필요" },
  { date:"06.01 15:58", student:"박지효", grade:"중3", academy:"라온 과학학원", className:"중3 화학 심화", category:"중등 화학 · 이온", paper:"이온과 앙금 생성 반응", score:100, status:"채점 완료" },
  { date:"06.01 15:44", student:"황진미", grade:"중3", academy:"브릿지 사이언스", className:"중3 화학 심화", category:"중등 화학 · 이온", paper:"이온과 앙금 생성 반응", score:75, status:"검토 필요" },
  { date:"05.31 19:20", student:"김의수", grade:"고1", academy:"라온 과학학원", className:"고1 통합과학 A", category:"통합과학 · 물질", paper:"물질의 규칙성 주간 테스트", score:87, status:"채점 완료" }
];
let myPapers = [
  { id:1, title:"산화 환원 미니테스트", category:"화학 I · 산화 환원", uploaded:"06.01 17:20", date:"2026-06-01", status:"업로드 완료" },
  { id:2, title:"주기율표 핵심 개념", category:"통합과학 · 물질", uploaded:"05.30 19:10", date:"2026-05-30", status:"채점 완료", score:80 },
  { id:3, title:"몰과 화학식량", category:"화학 I · 몰", uploaded:"05.24 14:12", date:"2026-05-24", status:"채점 완료", score:90 },
  { id:4, title:"이온과 앙금 생성 반응", category:"중등 화학 · 이온", uploaded:"05.17 16:44", date:"2026-05-17", status:"채점 완료", score:75 },
  { id:5, title:"중화 반응 확인 문제", category:"화학 I · 중화 반응", uploaded:"05.08 20:05", date:"2026-05-08", status:"채점 완료", score:85 },
  { id:6, title:"물질의 규칙성 주간 테스트", category:"통합과학 · 물질", uploaded:"04.27 18:30", date:"2026-04-27", status:"채점 완료", score:95 },
  { id:7, title:"산과 염기 개념 점검", category:"중등 화학 · 산과 염기", uploaded:"04.18 13:22", date:"2026-04-18", status:"채점 완료", score:70 }
];
const pageTitles = { dashboard:"대시보드", records:"채점 관리", templates:"시험지 관리 · 주관식", "templates-mc":"시험지 관리 · 객관식", students:"학생 관리", categories:"그룹 관리", settings:"설정 · 채점 정책", "system-settings":"설정 · 시스템", "my-papers":"내 시험지", "my-info":"내 정보" };
const pageSubtitles = {
  dashboard:"",
  records:"학원, 클래스, 카테고리, 학생별로 시험지 원본과 결과를 관리합니다.",
  templates:"주관식(단답형) 양식을 만들고, 문항별 OCR 인식 영역과 기준 답안을 설정합니다.",
  "templates-mc":"객관식 양식을 만들고, 문항별 보기와 정답을 설정합니다.",
  students:"학원과 클래스별 학생 계정, 최근 성적, 업로드 현황을 관리합니다.",
  categories:"학교급, 과목, 단원을 기준으로 시험지를 체계적으로 분류합니다.",
  settings:"학원 정보와 채점 정책을 관리합니다.",
  "system-settings":"모든 학원에 공통 적용되는 설정을 그룹별로 추가·수정·삭제하고 변경 이력을 봅니다.",
  "my-papers":"올린 시험지를 확인하고, 준비가 끝났을 때 직접 채점을 시작하세요."
};
let role = "admin";
let cameraStream;
let paperPage = 1;
const papersPerPage = 4;
let historyPeriodType = "all";
const studentNameRegion = { x:560, y:42, w:170, h:44 };
let inlineEditing = false;
const templateRegions = {
  1:{ question:"전자를 잃는 반응을 무엇이라고 하는가?", answer:"산화", aliases:"산화 반응", x:72, y:186, w:420, h:54 },
  2:{ question:"전자를 얻는 반응을 무엇이라고 하는가?", answer:"환원", aliases:"환원 반응", x:72, y:275, w:420, h:54 },
  3:{ question:"원소의 산화 상태를 나타내는 값을 쓰시오.", answer:"산화수", aliases:"산화 수", x:72, y:364, w:420, h:54 },
  4:{ question:"산화와 환원이 동시에 일어나는 반응은?", answer:"산화 환원 반응", aliases:"산화환원반응", x:72, y:453, w:420, h:54 },
  5:{ question:"산소를 잃는 반응을 쓰시오.", answer:"환원", aliases:"환원 반응", x:72, y:542, w:420, h:54 }
};
let persistedTemplateRegions = structuredClone(templateRegions);
let templates = [
  { id:1, name:"산화 환원 미니테스트", category:"화학 I · 산화 환원", subject:"화학 I", count:10 },
  { id:2, name:"이온과 앙금 생성 반응", category:"중등 화학 · 이온", subject:"중등 화학", count:12 },
  { id:3, name:"물질의 규칙성 주간 테스트", category:"통합과학 · 물질", subject:"통합과학", count:15 },
  { id:4, name:"몰과 화학식량 확인 문제", category:"화학 I · 몰", subject:"화학 I", count:8 },
  { id:5, name:"중화 반응 단답 점검", category:"화학 I · 중화 반응", subject:"화학 I", count:10 },
  { id:6, name:"산과 염기 개념 테스트", category:"중등 화학 · 산과 염기", subject:"중등 화학", count:11 },
  { id:7, name:"기체의 성질 주간 평가", category:"통합과학 · 물질", subject:"통합과학", count:14 },
  { id:8, name:"원소와 주기율표 미니테스트", category:"통합과학 · 물질", subject:"통합과학", count:9 },
  { id:9, name:"화학 반응식 균형 맞추기", category:"화학 I · 산화 환원", subject:"화학 I", count:13 },
  { id:10, name:"전해질과 이온화 단답", category:"중등 화학 · 이온", subject:"중등 화학", count:12 }
];
const templateQuestions = {
  1: [["전자를 잃는 반응을 무엇이라고 하는가?","산화"],["전자를 얻는 반응을 무엇이라고 하는가?","환원"],["원소의 산화 상태를 나타내는 값을 쓰시오.","산화수"],["산화와 환원이 동시에 일어나는 반응은?","산화 환원 반응"],["산소를 잃는 반응을 쓰시오.","환원"]],
  2: [["+전하를 띤 이온을 무엇이라 하는가?","양이온"],["−전하를 띤 이온을 무엇이라 하는가?","음이온"],["두 용액을 섞을 때 생기는 침전물은?","앙금"],["수용액에서 전류가 흐르는 물질은?","전해질"],["Na⁺ 이온의 이름은?","나트륨 이온"]],
  3: [["우주 초기에 만들어진 원소는?","수소"],["별 내부에서 일어나는 반응은?","핵융합"],["지각에 가장 많은 원소는?","산소"],["주기율표의 세로줄을 무엇이라 하는가?","족"],["주기율표의 가로줄을 무엇이라 하는가?","주기"]],
  4: [["물질 1몰의 입자 수를 무엇이라 하는가?","아보가드로수"],["기체 1몰의 0°C·1기압 부피는?","22.4 L"],["몰 농도의 단위를 쓰시오.","mol/L"],["분자량에 g을 붙인 값은?","몰질량"],["탄소 12g은 몇 몰인가?","1몰"]],
  5: [["산과 염기가 반응하는 것을 무엇이라 하는가?","중화 반응"],["중화 반응에서 생성되는 물질은?","물과 염"],["산성 용액의 pH 범위는?","7 미만"],["염기성 용액의 pH 범위는?","7 초과"],["중화점에서의 액성은?","중성"]],
  6: [["신맛을 내는 물질의 성질은?","산성"],["붉은 리트머스를 푸르게 하는 것은?","염기"],["pH 7은 어떤 액성인가?","중성"],["위산의 주성분을 쓰시오.","염산"],["비누의 액성은?","염기성"]],
  7: [["기체의 압력과 부피의 관계 법칙은?","보일 법칙"],["기체의 온도와 부피의 관계 법칙은?","샤를 법칙"],["기체 분자가 운동하는 원인은?","열에너지"],["기체 압력의 단위 하나를 쓰시오.","기압"],["기체가 골고루 퍼지는 현상은?","확산"]],
  8: [["주기율표를 체계화한 과학자는?","멘델레예프"],["같은 족 원소의 공통점은?","최외각 전자 수"],["1족 원소를 무엇이라 하는가?","알칼리 금속"],["17족 원소를 무엇이라 하는가?","할로젠"],["18족 원소를 무엇이라 하는가?","비활성 기체"]],
  9: [["화학 반응 전후 원자의 수는?","같다"],["반응식의 계수를 맞추는 것을 무엇이라 하는가?","균형 맞추기"],["질량 보존 법칙을 발견한 과학자는?","라부아지에"],["반응물은 화살표의 어느 쪽에 쓰는가?","왼쪽"],["생성물은 화살표의 어느 쪽에 쓰는가?","오른쪽"]],
  10: [["전해질이 물에서 이온으로 나뉘는 현상은?","이온화"],["물에서 이온화하지 않는 물질은?","비전해질"],["소금물은 전해질인가?","맞다"],["설탕물은 전해질인가?","아니다"],["이온이 이동하여 흐르는 것은?","전류"]]
};
/**
 * 문항 배열을 OCR 영역(templateRegions) 형태로 변환한다.
 * @param {Array<Array<string>>} list - [질문, 정답] 배열
 * @returns {object} 번호별 영역 객체
 */
function regionsFromQuestions(list) {
  const regions = {};
  list.forEach(([question,answer],index) => { regions[index + 1] = { question, answer, aliases:"", x:72, y:186 + index * 89, w:420, h:54 }; });
  return regions;
}
let selectedTemplateId = 1;
let draftTemplate = null;
const MAX_REGION_H = 220;

function showPage(name) {
  document.querySelectorAll("[data-page-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.pagePanel === name));
  document.querySelectorAll("[data-page]").forEach((button) => button.classList.toggle("active", button.dataset.page === name));
  document.querySelector("#pageTitle").textContent = pageTitles[name] || "케미체크";
  document.querySelector("#pageSubtitle").textContent = pageSubtitles[name] || "";
  document.querySelector(".header-new-template").classList.toggle("hidden",name !== "templates");
  // 아코디언 메뉴(시험지 관리·설정): 하위 화면에 있으면 펼치고 상위 메뉴를 강조한다.
  document.querySelectorAll("[data-nav-group]").forEach((group) => {
    const inGroup = Boolean(group.querySelector(`[data-page="${name}"]`));
    group.classList.toggle("open", inGroup);
    group.querySelector(".nav-parent").classList.toggle("active", inGroup);
  });
  document.body.dataset.currentPage = name;
  if (name === "my-info") renderMyInfo();
  window.scrollTo({ top:0, behavior:"smooth" });
}
document.addEventListener("click", (event) => {
  const pageButton = event.target.closest("[data-page]");
  if (pageButton) showPage(pageButton.dataset.page);
});
document.querySelectorAll("[data-accordion-toggle]").forEach((button) => button.addEventListener("click", () => {
  const group = button.closest("[data-nav-group]");
  // 아이콘만 보이는 접힌 사이드바에서는 첫 하위 화면으로 바로 이동한다.
  if (document.body.classList.contains("sidebar-collapsed")) { showPage(group.querySelector("[data-page]").dataset.page); return; }
  if (group) group.classList.toggle("open");
}));

const recordBody = document.querySelector("#recordBody");
const filters = ["recordSearch","academyFilter","classFilter","categoryFilter","statusFilter"].map((id) => document.querySelector(`#${id}`));
let currentRecords = [];
/**
 * 채점 기록 날짜("MM.DD HH:MM")를 비교 가능한 ISO("2026-MM-DD")로 바꾼다.
 * @param {object} record - 채점 기록
 * @returns {string} ISO 날짜
 */
function recordDateISO(record) {
  const [month,day] = record.date.split(" ")[0].split(".");
  return `2026-${month}-${day}`;
}
function renderRecords() {
  const [search,academy,className,category,status] = filters.map((filter) => filter.value);
  const query = search.trim().toLowerCase();
  const from = document.querySelector("#recordDateFrom").value;
  const to = document.querySelector("#recordDateTo").value;
  const filtered = records.filter((record) => { const iso = recordDateISO(record); return (!query || `${record.student} ${record.paper}`.toLowerCase().includes(query)) && (academy === "all" || record.academy === academy) && (className === "all" || record.className === className) && (category === "all" || record.category === category) && (status === "all" || record.status === status) && (!from || iso >= from) && (!to || iso <= to); });
  currentRecords = filtered;
  document.querySelector("#recordCount").textContent = filtered.length;
  recordBody.innerHTML = filtered.map((record,index) => `<tr class="record-row" data-record-index="${index}"><td>${record.date}</td><td class="student-cell"><strong>${record.student}</strong><span>${record.grade}</span></td><td>${record.academy}<br>${record.className}</td><td>${record.category}</td><td class="paper-cell"><strong>${record.paper}</strong><span>단답형 시험</span></td><td><span class="status ${record.status === "채점 완료" ? "done" : "review"}">${record.status}</span></td><td class="row-actions"><button class="detail-button" type="button">⋯</button></td></tr>`).join("");
}
filters.forEach((filter) => filter.addEventListener("input", renderRecords));
["recordDateFrom","recordDateTo"].forEach((id) => document.querySelector(`#${id}`).addEventListener("input", renderRecords));
document.querySelector("#recordReset").addEventListener("click", () => {
  document.querySelector("#recordSearch").value = "";
  ["academyFilter","classFilter","categoryFilter","statusFilter"].forEach((id) => { document.querySelector(`#${id}`).value = "all"; });
  document.querySelector("#recordDateFrom").value = "";
  document.querySelector("#recordDateTo").value = "";
  renderRecords();
});
recordBody.addEventListener("click", (event) => {
  const printButton = event.target.closest("[data-print-record]");
  if (printButton) { openPrintPreview(currentRecords[Number(printButton.dataset.printRecord)]); return; }
  const row = event.target.closest("[data-record-index]");
  if (!row) return;
  openExamDetail(currentRecords[Number(row.dataset.recordIndex)]);
});

function renderStaticCards() {
  const seenStudents = new Set();
  const students = records.filter((record) => { if (seenStudents.has(record.student)) return false; seenStudents.add(record.student); return true; });
  // 가입 승인을 마친 학생은 목록 앞에 '신규 가입'으로 보인다.
  const joined = accountStore.signups.filter((item) => item.type === "student" && item.status === "approved").reverse();
  document.querySelector("#studentCards").innerHTML = joined.map((item) => `<article class="manage-card"><span class="avatar">${escapeHtml(item.name[0])}</span><div><h3>${escapeHtml(item.name)} <span class="new-badge">신규 가입</span></h3><p>${escapeHtml(item.className)}</p><small>${escapeHtml(item.decidedAt)} 승인</small></div><button type="button" data-student-detail="${escapeHtml(item.name)}">상세 보기</button></article>`).join("") + students.map((record) => { const note = record.status === "검토 필요" ? "검토 필요 1건" : "최근 채점 완료"; return `<article class="manage-card"><span class="avatar">${record.student[0]}</span><div><h3>${record.student}</h3><p>${record.className}</p><small>${note}</small></div><button type="button" data-student-detail="${record.student}">상세 보기</button></article>`; }).join("");
  document.querySelector("#categoryCards").innerHTML = ["중등 과학|화학 반응 · 이온 · 기체","통합과학|물질의 규칙성 · 화학 변화","화학 I|몰 · 산화 환원 · 중화 반응"].map((item) => { const [title,units]=item.split("|"); return `<article class="category-card"><span>▦</span><h3>${title}</h3><p>${units}</p><button>카테고리 관리</button></article>`; }).join("");
}
function renderAnswerOverview() {
  document.querySelector("#answerOverviewList").innerHTML=Object.entries(templateRegions).map(([number,region]) => `<article class="answer-overview-item"><strong>${number}번</strong><p>${region.question}</p><small>정답: <b>${region.answer || "미입력"}</b>${region.aliases ? ` · 허용: ${region.aliases}` : ""}</small></article>`).join("");
}
function renderTemplateList() {
  document.querySelector(".template-list-title small").textContent=`총 ${templates.length}개`;
  document.querySelector("#templateListItems").innerHTML=templates.map((template) => `<button class="template-item ${template.id === selectedTemplateId ? "active" : ""}" type="button" data-template-id="${template.id}"><span class="template-icon">▧</span><span><strong>${template.name}</strong><small>${template.category} · ${template.count}문항</small></span></button>`).join("");
}
function createQuestionMarkup(number) {
  const region=templateRegions[number] || { question:"문항 질문을 입력하세요.", answer:"" };
  return `<div class="paper-question" data-paper-question="${number}"><label><span>${number}.</span><input class="paper-question-input" value="${region.question}" data-paper-question-input="${number}" /></label><div class="answer-row"><label class="ocr-region ${number === 1 ? "active" : ""}" data-region="${number}" style="width:${region.w}px;height:${region.h}px"><textarea class="paper-answer-input" placeholder="기준 답안 입력" data-paper-answer-input="${number}">${region.answer}</textarea><button class="delete-question" type="button" data-delete-question="${number}" aria-label="${number}번 문항 삭제">×</button><span class="resize-handle" data-resize-region="${number}" title="드래그하여 OCR 영역 크기 조절"></span></label><span class="grade-region" title="채점 기호가 표시되는 영역"></span></div></div>`;
}
/**
 * OCR 영역 옆 채점 기호 영역이 차지하는 폭(영역 폭 + 간격)을 구한다.
 * 답 영역 최대 너비를 제한할 때 빼주어 채점 영역이 종이 밖으로 넘어가지 않게 한다.
 * @param {HTMLElement} box - OCR 영역(.ocr-region) 요소
 * @returns {number} 예약할 폭(px)
 */
function gradeReserve(box) {
  const row=box.parentElement;
  const grade=row && row.querySelector(".grade-region");
  if (!grade) return 0;
  const gap=parseFloat(getComputedStyle(row).columnGap) || 0;
  return grade.offsetWidth + gap;
}
function bindTemplateRegionInputs() {
  document.querySelectorAll("[data-region]").forEach((button) => button.addEventListener("click", () => selectRegion(button)));
  document.querySelectorAll("[data-paper-question-input]").forEach((input) => input.addEventListener("input", () => { const number=input.dataset.paperQuestionInput; templateRegions[number].question=input.value; }));
  document.querySelectorAll("[data-paper-answer-input]").forEach((input) => input.addEventListener("focus", () => input.closest("[data-region]").click()));
  document.querySelectorAll("[data-paper-answer-input]").forEach((input) => input.addEventListener("input", () => { const number=input.dataset.paperAnswerInput; templateRegions[number].answer=input.value; }));
}
function selectRegion(button) {
  const region=templateRegions[button.dataset.region];
  document.querySelectorAll("[data-region]").forEach((item) => item.classList.toggle("active", item === button));
  document.querySelector("#selectedQuestion").textContent=button.dataset.region;
  document.querySelector("#regionAliases").value=region.aliases || "";
  const coordinateInputs=document.querySelectorAll(".region-editor .coordinate-grid input");
  [region.x,region.y,region.w,region.h].forEach((value,index) => coordinateInputs[index].value=value);
}
function selectModalRegion(regionLabel) {
  if (!regionLabel) return;
  const number=regionLabel.dataset.region;
  const region=templateRegions[number];
  document.querySelectorAll("#largeTemplatePreview [data-region]").forEach((item) => item.classList.toggle("active", item === regionLabel));
  document.querySelector("#modalSelectedQuestion").textContent=number;
  document.querySelector("#modalRegionQuestion").value=region.question;
  document.querySelector("#modalRegionAnswer").value=region.answer;
  document.querySelector("#modalRegionAliases").value=region.aliases;
  ["X","Y","W","H"].forEach((key) => document.querySelector(`#modalRegion${key}`).value=region[key.toLowerCase()]);
}
function renderModalQuestions(selectedNumber=1) {
  const preview=document.querySelector("#largeTemplatePreview .template-canvas");
  if (!preview) return;
  preview.querySelectorAll(".paper-question,.add-question").forEach((item) => item.remove());
  preview.insertAdjacentHTML("beforeend",Object.keys(templateRegions).map((number) => createQuestionMarkup(number)).join("") + '<button class="add-question" type="button" data-add-question>＋ 문항 추가</button>');
  bindModalTemplateEditor();
  selectModalRegion(preview.querySelector(`[data-region="${selectedNumber}"]`) || preview.querySelector("[data-region]"));
}
function syncOuterTemplatePreview() {
  const outer=document.querySelector("#printableTemplate");
  outer.querySelectorAll(".paper-question,.add-question").forEach((item) => item.remove());
  outer.insertAdjacentHTML("beforeend",Object.keys(templateRegions).map((number) => createQuestionMarkup(number)).join(""));
  outer.querySelectorAll("input,textarea").forEach((input) => input.setAttribute("readonly",""));
  outer.querySelectorAll("select").forEach((select) => select.setAttribute("disabled",""));
  outer.querySelectorAll("[data-region],input,select,button").forEach((element) => element.setAttribute("tabindex","-1"));
  const template=templates.find((item) => item.id === selectedTemplateId);
  if (template) template.count=Object.keys(templateRegions).length;
  renderTemplateList();
}
function savePersistedTemplate() {
  persistedTemplateRegions=structuredClone(templateRegions);
}
function reloadPersistedTemplate() {
  Object.keys(templateRegions).forEach((key) => delete templateRegions[key]);
  Object.assign(templateRegions,structuredClone(persistedTemplateRegions));
  syncOuterTemplatePreview();
}
function setInlineEditMode(enabled) {
  if (!enabled && inlineEditing) savePersistedTemplate();
  inlineEditing=enabled;
  document.body.classList.toggle("inline-editing",enabled);
  const outer=document.querySelector("#printableTemplate");
  outer.querySelectorAll("input,textarea").forEach((input) => enabled ? input.removeAttribute("readonly") : input.setAttribute("readonly",""));
  outer.querySelectorAll("select").forEach((select) => enabled ? select.removeAttribute("disabled") : select.setAttribute("disabled",""));
  document.querySelectorAll(".region-editor input").forEach((input) => { input.disabled = !enabled; });
  if (enabled) outer.querySelectorAll("[tabindex]").forEach((element) => element.removeAttribute("tabindex"));
  if (enabled) bindInlineTemplateEditor();
  document.querySelectorAll("[data-toggle-inline-edit]").forEach((button) => button.textContent=enabled ? "편집 완료" : button.classList.contains("full-button") ? "미리보기에서 편집" : "편집하기");
  document.querySelector("[data-inline-cancel]").textContent=enabled ? "취소" : "인쇄";
}
function bindInlineTemplateEditor() {
  const outer=document.querySelector("#printableTemplate");
  outer.querySelectorAll("[data-paper-question-input]").forEach((input) => input.addEventListener("input", () => { const number=input.dataset.paperQuestionInput; templateRegions[number].question=input.value; }));
  outer.querySelectorAll("[data-paper-answer-input]").forEach((input) => input.addEventListener("focus", () => selectRegion(input.closest("[data-region]"))));
  outer.querySelectorAll("[data-paper-answer-input]").forEach((input) => input.addEventListener("input", () => { const number=input.dataset.paperAnswerInput; templateRegions[number].answer=input.value; }));
  outer.querySelectorAll("[data-resize-region]").forEach((handle) => handle.addEventListener("pointerdown", (event) => startRegionResize(event,handle,false)));
  outer.querySelectorAll("[data-delete-question]").forEach((button) => button.addEventListener("click", () => {
    if (Object.keys(templateRegions).length === 1) return;
    delete templateRegions[button.dataset.deleteQuestion];
    const normalized={};
    Object.values(templateRegions).forEach((region,index) => normalized[index + 1]={ ...region, y:100 + (index + 1) * 89 });
    Object.keys(templateRegions).forEach((key) => delete templateRegions[key]);
    Object.assign(templateRegions,normalized);
    syncOuterTemplatePreview();
    setInlineEditMode(true);
  }));
}
function startRegionResize(event,handle,isModal=true) {
  event.preventDefault();
  event.stopPropagation();
  const number=handle.dataset.resizeRegion;
  const box=handle.closest("[data-region]");
  const paper=box.closest(".template-canvas");
  if (isModal) selectModalRegion(box); else selectRegion(box);
  const startX=event.clientX, startY=event.clientY, startW=box.offsetWidth, startH=box.offsetHeight;
  const paperRect=paper.getBoundingClientRect();
  const boxRect=box.getBoundingClientRect();
  const paperStyle=getComputedStyle(paper);
  const maxW=Math.max(160,Math.floor(paperRect.right - parseFloat(paperStyle.paddingRight) - boxRect.left - gradeReserve(box)));
  const maxH=MAX_REGION_H;
  const onMove=(moveEvent) => {
    const width=Math.min(maxW,Math.max(160,Math.round(startW + moveEvent.clientX - startX)));
    const height=Math.min(maxH,Math.max(34,Math.round(startH + moveEvent.clientY - startY)));
    box.style.width=`${width}px`; box.style.height=`${height}px`;
    templateRegions[number].w=width; templateRegions[number].h=height;
    if (isModal) { document.querySelector("#modalRegionW").value=width; document.querySelector("#modalRegionH").value=height; }
  };
  const onUp=() => { window.removeEventListener("pointermove",onMove); window.removeEventListener("pointerup",onUp); };
  window.addEventListener("pointermove",onMove); window.addEventListener("pointerup",onUp);
}
function bindModalTemplateEditor() {
  const preview=document.querySelector("#largeTemplatePreview");
  preview.querySelectorAll("[data-region]").forEach((label) => label.addEventListener("click", () => selectModalRegion(label)));
  preview.querySelectorAll("[data-paper-question-input]").forEach((input) => input.addEventListener("input", () => { const number=input.dataset.paperQuestionInput; templateRegions[number].question=input.value; document.querySelector("#modalRegionQuestion").value=input.value; }));
  preview.querySelectorAll("[data-paper-answer-input]").forEach((input) => input.addEventListener("focus", () => selectModalRegion(input.closest("[data-region]"))));
  preview.querySelectorAll("[data-paper-answer-input]").forEach((input) => input.addEventListener("input", () => { const number=input.dataset.paperAnswerInput; templateRegions[number].answer=input.value; document.querySelector("#modalRegionAnswer").value=input.value; }));
  preview.querySelectorAll("[data-delete-question]").forEach((button) => button.addEventListener("click", () => {
    if (Object.keys(templateRegions).length === 1) return;
    delete templateRegions[button.dataset.deleteQuestion];
    const normalized={};
    Object.values(templateRegions).forEach((region,index) => normalized[index + 1]={ ...region, y:100 + (index + 1) * 89 });
    Object.keys(templateRegions).forEach((key) => delete templateRegions[key]);
    Object.assign(templateRegions,normalized);
    renderModalQuestions(1);
  }));
  preview.querySelector("[data-add-question]")?.addEventListener("click", () => {
    const number=Object.keys(templateRegions).length + 1;
    templateRegions[number]={ question:"문항 질문을 입력하세요.", answer:"", aliases:"", x:72, y:100 + number * 89, w:420, h:54 };
    renderModalQuestions(number);
  });
  preview.querySelectorAll("[data-resize-region]").forEach((handle) => handle.addEventListener("pointerdown", (event) => startRegionResize(event,handle,true)));
  const nameRegion=preview.querySelector("[data-name-region]");
  const nameHandle=preview.querySelector("[data-resize-name]");
  if (nameRegion && nameHandle) {
    nameRegion.style.width=`${studentNameRegion.w}px`;
    nameRegion.style.height=`${studentNameRegion.h}px`;
    nameHandle.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      const startX=event.clientX, startW=nameRegion.offsetWidth;
      const heading=nameRegion.closest(".paper-heading");
      const maxW=Math.max(130,heading.clientWidth - 16);
      const onMove=(moveEvent) => {
        studentNameRegion.w=Math.min(maxW,Math.max(130,Math.round(startW + startX - moveEvent.clientX)));
        nameRegion.style.width=`${studentNameRegion.w}px`;
      };
      const onUp=() => { window.removeEventListener("pointermove",onMove); window.removeEventListener("pointerup",onUp); };
      window.addEventListener("pointermove",onMove);
      window.addEventListener("pointerup",onUp);
    });
  }
  preview.querySelector("[data-paper-category]")?.addEventListener("change", (event) => { const template=draftTemplate?.id === selectedTemplateId ? draftTemplate : templates.find((item) => item.id === selectedTemplateId); if (template) template.category=event.target.value; if (!draftTemplate) renderTemplateList(); });
  preview.querySelector("[data-paper-subject]")?.addEventListener("change", (event) => { const template=draftTemplate?.id === selectedTemplateId ? draftTemplate : templates.find((item) => item.id === selectedTemplateId); if (template) template.subject=event.target.value; });
}
function renderMyPapers() {
  const period = document.querySelector("#historyPeriod").value;
  const status = document.querySelector("#historyStatus").value;
  const filtered = myPapers.filter((paper) => {
    const matchesStatus = status === "all" || paper.status === status;
    const matchesPeriod = period === "all" || (historyPeriodType === "month" ? paper.date.startsWith(period) : getWeekKey(paper.date) === period);
    return matchesStatus && matchesPeriod;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / papersPerPage));
  paperPage = Math.min(paperPage, totalPages);
  const visible = filtered.slice((paperPage - 1) * papersPerPage, paperPage * papersPerPage);
  document.querySelector("#myPaperCount").textContent = filtered.length;
  document.querySelector("#myPaperCards").innerHTML = visible.length ? visible.map((paper) => `<article class="paper-card"><div class="paper-thumb"><span>시험지</span>${paper.status === "채점 완료" ? '<b class="thumb-mark">○ ○ ○</b>' : ""}</div><div class="paper-info"><button class="secondary-button paper-original-btn" type="button" data-original-paper="${paper.id}">원본 보기</button><span class="card-tag">${paper.category}</span><h3>${paper.title}</h3><p>${paper.uploaded} · <strong>${paper.status}</strong></p><div class="paper-actions">${paper.status === "업로드 완료" ? `<button class="secondary-button paper-delete-btn" type="button" data-delete-paper="${paper.id}">삭제 후 재업로드</button><button class="primary-button" type="button" data-grade-paper="${paper.id}">채점하기</button>` : `<button class="primary-button" type="button" data-result-paper="${paper.id}">채점 결과</button>`}</div></div></article>`).join("") : '<p class="empty-history">조건에 맞는 시험지 이력이 없습니다.</p>';
  document.querySelector("#paperPagination").innerHTML = Array.from({ length:totalPages }, (_,index) => `<button class="${index + 1 === paperPage ? "active" : ""}" type="button" data-paper-page="${index + 1}">${index + 1}</button>`).join("");
}
function getWeekKey(date) {
  const value = new Date(`${date}T00:00:00`);
  const first = new Date(value.getFullYear(), 0, 1);
  const week = Math.ceil((((value - first) / 86400000) + first.getDay() + 1) / 7);
  return `${value.getFullYear()}-${String(week).padStart(2,"0")}`;
}
function updateHistoryPeriodOptions() {
  const select = document.querySelector("#historyPeriod");
  if (historyPeriodType === "month") {
    const months = [...new Set(myPapers.map((paper) => paper.date.slice(0,7)))];
    select.innerHTML = '<option value="all">전체 월</option>' + months.map((month) => `<option value="${month}">${month.replace("-","년 ")}월</option>`).join("");
  } else if (historyPeriodType === "week") {
    const weeks = [...new Set(myPapers.map((paper) => getWeekKey(paper.date)))];
    select.innerHTML = '<option value="all">전체 주</option>' + weeks.map((week) => `<option value="${week}">${week.slice(0,4)}년 ${Number(week.slice(5))}주차</option>`).join("");
  } else select.innerHTML = '<option value="all">전체 기간</option>';
  paperPage = 1;
  renderMyPapers();
}

let qualityTimers = [];
function clearQualityTimers() { qualityTimers.forEach((id) => clearTimeout(id)); qualityTimers = []; }
/**
 * 촬영 품질 상태를 표시한다(warn=빨강 경고, ok=초록 정상).
 * @param {string} state - "warn" | "ok" | ""
 * @param {string} message - 안내 문구
 * @returns {void}
 */
function setCameraQuality(state, message) {
  const stage = document.querySelector(".camera-stage");
  if (stage) { stage.classList.remove("quality-warn","quality-ok"); if (state) stage.classList.add(`quality-${state}`); }
  const badge = document.querySelector("#recognitionBadge");
  badge.classList.toggle("success", state === "ok");
  badge.classList.toggle("warn", state === "warn");
  document.querySelector("#recognitionBadge strong").textContent = message;
}
function stopCamera() {
  clearQualityTimers();
  if (cameraStream) cameraStream.getTracks().forEach((track) => track.stop());
  cameraStream = undefined;
  document.querySelector("#cameraPreview").srcObject = null;
  const stage = document.querySelector(".camera-stage");
  if (stage) stage.classList.remove("quality-warn","quality-ok");
}
const uploadModal = document.querySelector("#uploadModal");
document.querySelectorAll("[data-open-upload]").forEach((button) => button.addEventListener("click", () => uploadModal.classList.remove("hidden")));
document.querySelectorAll("[data-close-upload]").forEach((button) => button.addEventListener("click", () => { stopCamera(); uploadModal.classList.add("hidden"); }));
/**
 * 시험지 업로드 1건을 생성하고 모달을 닫는다.
 * @returns {void}
 */
function saveUploadedPaper() {
  myPapers.unshift({ id:Date.now(), title:"산화 환원 미니테스트", category:"화학 I · 산화 환원", uploaded:"방금 전", date:"2026-06-01", status:"업로드 완료" });
  updateHistoryPeriodOptions();
  stopCamera();
  uploadModal.classList.add("hidden");
  showPage("my-papers");
}
/**
 * 촬영 품질을 실시간 검사하는 것처럼 상태를 진행하고, 인식 성공이 안정되면 자동 촬영·업로드한다.
 * @returns {void}
 */
function runQualityCheck() {
  clearQualityTimers();
  setCameraQuality("warn", "시험지를 프레임 안에 맞춰주세요");
  qualityTimers.push(setTimeout(() => setCameraQuality("warn", "기울기·흔들림을 확인하는 중…"), 1400));
  qualityTimers.push(setTimeout(() => { setCameraQuality("ok", "인식 성공 · 자동 촬영합니다"); document.querySelector("#capturePaper").disabled = false; }, 2700));
  qualityTimers.push(setTimeout(saveUploadedPaper, 3800));
}
/**
 * 후면 카메라를 연결하고 품질 검사를 시작한다. 이미 연결돼 있으면 아무 작업도 하지 않는다.
 * @returns {Promise<void>}
 */
async function startCamera() {
  if (cameraStream) return;
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:{ ideal:"environment" } }, audio:false });
    const video=document.querySelector("#cameraPreview"); video.srcObject=cameraStream; await video.play();
    document.querySelector("#cameraPlaceholder").classList.add("hidden");
    runQualityCheck();
  } catch { setCameraQuality("warn", "카메라 권한을 확인해주세요"); }
}
document.querySelectorAll("[data-capture-tab]").forEach((tab) => tab.addEventListener("click", () => { document.querySelectorAll("[data-capture-tab]").forEach((item) => item.classList.toggle("active", item === tab)); document.querySelectorAll("[data-capture-panel]").forEach((panel) => panel.classList.toggle("hidden", panel.dataset.capturePanel !== tab.dataset.captureTab)); if (tab.dataset.captureTab === "camera" && mobileQuery.matches) startCamera(); }));
document.querySelector("#startCamera").addEventListener("click", startCamera);
document.querySelector("#capturePaper").addEventListener("click", saveUploadedPaper);
document.querySelector("#saveUpload").addEventListener("click", saveUploadedPaper);
document.querySelector("[data-show-records]").addEventListener("click", () => { document.querySelector("#statusFilter").value="검토 필요"; renderRecords(); showPage("records"); });

document.querySelector("#myPaperCards").addEventListener("click", (event) => {
  const deleteButton=event.target.closest("[data-delete-paper]"), gradeButton=event.target.closest("[data-grade-paper]"), resultButton=event.target.closest("[data-result-paper]"), originalButton=event.target.closest("[data-original-paper]");
  if (deleteButton) { myPapers=myPapers.filter((paper) => paper.id !== Number(deleteButton.dataset.deletePaper)); renderMyPapers(); }
  if (originalButton) { const paper=myPapers.find((item) => item.id === Number(originalButton.dataset.originalPaper)); if (paper) showOriginalScan(paper); }
  if (gradeButton) { const paper=myPapers.find((item) => item.id === Number(gradeButton.dataset.gradePaper)); paper.status="채점 완료"; paper.score=80; renderMyPapers(); showResultScan(paper); }
  if (resultButton) { const paper=myPapers.find((item) => item.id === Number(resultButton.dataset.resultPaper)); if (paper) showResultScan(paper); }
});
document.querySelector("#paperPagination").addEventListener("click", (event) => { const button=event.target.closest("[data-paper-page]"); if (!button) return; paperPage=Number(button.dataset.paperPage); renderMyPapers(); });
document.querySelectorAll("[data-period]").forEach((button) => button.addEventListener("click", () => { historyPeriodType=button.dataset.period; document.querySelectorAll("[data-period]").forEach((item) => item.classList.toggle("active", item === button)); updateHistoryPeriodOptions(); }));
document.querySelector("#historyPeriod").addEventListener("change", () => { paperPage=1; renderMyPapers(); });
document.querySelector("#historyStatus").addEventListener("change", () => { paperPage=1; renderMyPapers(); });
bindTemplateRegionInputs();
function createBlankTemplate() {
  const id=Date.now();
  const name="새 쪽지시험";
  const category="화학 I · 산화 환원";
  const subject="화학 I";
  draftTemplate={ id,name,category,subject,count:1 };
  selectedTemplateId=id;
  Object.keys(templateRegions).forEach((key) => delete templateRegions[key]);
  templateRegions[1]={ question:"문항 질문을 입력하세요.", answer:"", aliases:"", x:72, y:189, w:420, h:54 };
  document.querySelector(".template-canvas > p").textContent=`${category} 카테고리 시험지입니다. 문항 질문과 답 작성 영역을 조정하세요.`;
  document.querySelector(".template-canvas").querySelectorAll(".paper-question").forEach((item) => item.remove());
  document.querySelector(".template-canvas").insertAdjacentHTML("beforeend",createQuestionMarkup(1));
  bindTemplateRegionInputs();
  selectRegion(document.querySelector('[data-region="1"]'));
  openTemplateEditor(true);
}
document.querySelector("[data-new-template]").addEventListener("click", createBlankTemplate);
document.querySelectorAll("[data-template-tab]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("[data-template-tab]").forEach((item) => item.classList.toggle("active",item === button));
  document.querySelectorAll("[data-template-panel]").forEach((panel) => panel.classList.toggle("hidden",panel.dataset.templatePanel !== button.dataset.templateTab));
  if (button.dataset.templateTab === "answers") renderAnswerOverview();
}));
document.querySelectorAll("[data-toggle-inline-edit]").forEach((button) => button.addEventListener("click", () => setInlineEditMode(!inlineEditing)));
document.querySelector("[data-inline-cancel]").addEventListener("click", () => {
  if (!inlineEditing) { printTemplate(); return; }
  inlineEditing=false;
  document.body.classList.remove("inline-editing");
  reloadPersistedTemplate();
  setInlineEditMode(false);
});
/**
 * 등록된 시험지를 선택해 해당 문항을 미리보기에 로드한다.
 * @param {number} id - 시험지 id
 * @returns {void}
 */
function loadTemplate(id) {
  if (inlineEditing) setInlineEditMode(false);
  selectedTemplateId = id;
  const questions = templateQuestions[id] || templateQuestions[1];
  Object.keys(templateRegions).forEach((key) => delete templateRegions[key]);
  Object.assign(templateRegions, regionsFromQuestions(questions));
  const template = templates.find((item) => item.id === id);
  const categorySelect = document.querySelector("#printableTemplate [data-paper-category]");
  const subjectSelect = document.querySelector("#printableTemplate [data-paper-subject]");
  if (template && categorySelect) categorySelect.value = template.category;
  if (template && subjectSelect) subjectSelect.value = template.subject;
  syncOuterTemplatePreview();
  savePersistedTemplate();
  selectRegion(document.querySelector('#printableTemplate [data-region="1"]'));
  renderAnswerOverview();
}
document.querySelector("#templateListItems").addEventListener("click", (event) => { const button=event.target.closest("[data-template-id]"); if (!button) return; loadTemplate(Number(button.dataset.templateId)); });
document.querySelector("[data-add-inline-question]").addEventListener("click", () => {
  const number=Object.keys(templateRegions).length + 1;
  templateRegions[number]={ question:"문항 질문을 입력하세요.", answer:"", aliases:"", x:72, y:100 + number * 89, w:420, h:54 };
  syncOuterTemplatePreview();
  setInlineEditMode(true);
  selectRegion(document.querySelector(`#printableTemplate [data-region="${number}"]`));
});
const templatePreviewModal=document.querySelector("#templatePreviewModal");
function openTemplateEditor(isNew=false) {
  const preview=document.querySelector("#printableTemplate").cloneNode(true);
  preview.removeAttribute("id");
  preview.querySelectorAll("input").forEach((input) => input.removeAttribute("readonly"));
  preview.querySelectorAll("select").forEach((select) => select.removeAttribute("disabled"));
  preview.querySelectorAll("[tabindex]").forEach((element) => element.removeAttribute("tabindex"));
  preview.querySelectorAll(".paper-question,.add-question").forEach((item) => item.remove());
  preview.insertAdjacentHTML("beforeend",Object.keys(templateRegions).map((number) => createQuestionMarkup(number)).join("") + '<button class="add-question" type="button" data-add-question>＋ 문항 추가</button>');
  document.querySelector("#largeTemplatePreview").replaceChildren(preview);
  const selectedTemplate=isNew ? draftTemplate : templates.find((item) => item.id === selectedTemplateId);
  document.querySelector("#templatePreviewTitle").value=selectedTemplate?.name || "새 쪽지시험";
  preview.querySelector("[data-paper-category]").value=selectedTemplate?.category || "화학 I · 산화 환원";
  preview.querySelector("[data-paper-subject]").value=selectedTemplate?.subject || "화학 I";
  bindModalTemplateEditor();
  selectModalRegion(document.querySelector("#largeTemplatePreview [data-region]"));
  document.querySelector("[data-save-new-template]").classList.toggle("hidden",!isNew);
  templatePreviewModal.classList.remove("hidden");
}
document.querySelectorAll("[data-open-template-preview]").forEach((button) => button.addEventListener("click", openTemplateEditor));
function closeTemplatePreview() {
  if (draftTemplate) {
    draftTemplate=null;
    selectedTemplateId=templates[0].id;
    reloadPersistedTemplate();
  } else {
    savePersistedTemplate();
    syncOuterTemplatePreview();
  }
  setInlineEditMode(false);
  templatePreviewModal.classList.add("hidden");
}
document.querySelector("[data-close-template-preview]").addEventListener("click", closeTemplatePreview);
templatePreviewModal.addEventListener("click", (event) => { if (event.target === templatePreviewModal) closeTemplatePreview(); });
document.querySelectorAll("[data-print-template]").forEach((button) => button.addEventListener("click", () => printTemplate()));
document.querySelector("#templatePreviewTitle").addEventListener("input", (event) => { const template=draftTemplate?.id === selectedTemplateId ? draftTemplate : templates.find((item) => item.id === selectedTemplateId); if (template) { template.name=event.target.value || "새 쪽지시험"; if (!draftTemplate) renderTemplateList(); } });
document.querySelector("[data-save-new-template]").addEventListener("click", () => {
  if (!draftTemplate) return;
  draftTemplate.count=Object.keys(templateRegions).length;
  templates.unshift(draftTemplate);
  selectedTemplateId=draftTemplate.id;
  draftTemplate=null;
  savePersistedTemplate();
  syncOuterTemplatePreview();
  renderTemplateList();
  document.querySelector("[data-save-new-template]").classList.add("hidden");
  templatePreviewModal.classList.add("hidden");
});
document.querySelector("#modalRegionQuestion").addEventListener("input", (event) => { const number=document.querySelector("#modalSelectedQuestion").textContent; templateRegions[number].question=event.target.value; document.querySelector(`#largeTemplatePreview [data-paper-question-input="${number}"]`).value=event.target.value; });
document.querySelector("#modalRegionAnswer").addEventListener("input", (event) => { const number=document.querySelector("#modalSelectedQuestion").textContent; templateRegions[number].answer=event.target.value; document.querySelector(`#largeTemplatePreview [data-paper-answer-input="${number}"]`).value=event.target.value; });
document.querySelector("#modalRegionAliases").addEventListener("input", (event) => { const number=document.querySelector("#modalSelectedQuestion").textContent; templateRegions[number].aliases=event.target.value; });
["X","Y","W","H"].forEach((key) => document.querySelector(`#modalRegion${key}`).addEventListener("input", (event) => {
  const number=document.querySelector("#modalSelectedQuestion").textContent;
  const value=Number(event.target.value) || 0;
  const box=document.querySelector(`#largeTemplatePreview [data-region="${number}"]`);
  const paper=box.closest(".template-canvas");
  const paperRect=paper.getBoundingClientRect();
  const boxRect=box.getBoundingClientRect();
  const paperStyle=getComputedStyle(paper);
  let constrained=value;
  if (key === "W") constrained=Math.min(Math.max(160,value),Math.max(160,Math.floor(paperRect.right - parseFloat(paperStyle.paddingRight) - boxRect.left - gradeReserve(box))));
  if (key === "H") constrained=Math.min(Math.max(34,value),MAX_REGION_H);
  templateRegions[number][key.toLowerCase()]=constrained;
  event.target.value=constrained;
  if (key === "W") box.style.width=`${constrained}px`;
  if (key === "H") box.style.height=`${constrained}px`;
}));
document.querySelectorAll(".region-editor .coordinate-grid input").forEach((input, index) => {
  const key=["X","Y","W","H"][index];
  input.addEventListener("input", (event) => {
    const number=document.querySelector("#selectedQuestion").textContent;
    const box=document.querySelector(`#printableTemplate [data-region="${number}"]`);
    if (!box) return;
    const value=Number(event.target.value) || 0;
    const paper=box.closest(".template-canvas");
    const paperRect=paper.getBoundingClientRect();
    const boxRect=box.getBoundingClientRect();
    const paperStyle=getComputedStyle(paper);
    let constrained=value;
    if (key === "W") constrained=Math.min(Math.max(160,value),Math.max(160,Math.floor(paperRect.right - parseFloat(paperStyle.paddingRight) - boxRect.left - gradeReserve(box))));
    if (key === "H") constrained=Math.min(Math.max(34,value),MAX_REGION_H);
    templateRegions[number][key.toLowerCase()]=constrained;
    event.target.value=constrained;
    if (key === "W") box.style.width=`${constrained}px`;
    if (key === "H") box.style.height=`${constrained}px`;
  });
});
document.querySelector("#regionAliases").addEventListener("input", (event) => { const number=document.querySelector("#selectedQuestion").textContent; if (templateRegions[number]) templateRegions[number].aliases=event.target.value; });
document.querySelector("#printableTemplate").addEventListener("click", (event) => { const region=event.target.closest("[data-region]"); if (region) selectRegion(region); });
document.querySelector("[data-close-result]").addEventListener("click", () => document.querySelector("#resultModal").classList.add("hidden"));
const examAnswerBank = {
  "화학 I · 산화 환원": [["전자를 잃는 반응을 무엇이라고 하는가?","산화"],["전자를 얻는 반응을 무엇이라고 하는가?","환원"],["원소의 산화 상태를 나타내는 값은?","산화수"],["산화와 환원이 동시에 일어나는 반응은?","산화 환원 반응"],["산소를 잃는 반응을 쓰시오.","환원"]],
  "중등 화학 · 이온": [["+전하를 띤 이온을 무엇이라 하는가?","양이온"],["−전하를 띤 이온을 무엇이라 하는가?","음이온"],["두 용액을 섞을 때 생기는 침전물은?","앙금"],["수용액에서 전류가 흐르는 물질은?","전해질"],["Na⁺ 이온의 이름은?","나트륨 이온"]],
  "통합과학 · 물질": [["우주 초기에 만들어진 원소는?","수소"],["별 내부에서 일어나는 반응은?","핵융합"],["지각에 가장 많은 원소는?","산소"],["주기율표의 세로줄을 무엇이라 하는가?","족"],["주기율표의 가로줄을 무엇이라 하는가?","주기"]]
};
/**
 * 채점된 시험지 이미지(목업)를 만든다. photo=true면 학생 업로드 사진처럼 보이게 한다.
 * @param {object} record - 채점 관리 형태의 객체
 * @param {boolean} photo - 학생 업로드 사진 스타일 여부
 * @returns {string} 시험지 이미지 HTML
 */
function buildScanPaper(record, photo) {
  const set = examAnswerBank[record.category] || examAnswerBank["화학 I · 산화 환원"];
  const total = set.length;
  const correct = Math.max(0,Math.min(total,Math.round(record.score / 100 * total)));
  const lines = set.map(([question,answer],index) => { const ok = index < correct; return `<div class="scan-line"><span class="scan-q">${index + 1}. ${question}</span><span class="scan-ans">${answer}</span><b class="scan-mark ${ok ? "ok" : "no"}">${ok ? "○" : "×"}</b></div>`; }).join("");
  return `<div class="scan-sheet ${photo ? "scan-photo" : ""}"><div class="scan-head"><strong>${record.paper}</strong><span>이름: ${record.student}</span></div>${lines}<b class="scan-score">${record.score}</b></div>`;
}
/**
 * 내 시험지(myPapers) 항목을 채점 관리 형태로 변환한다.
 * @param {object} paper - myPapers 항목
 * @returns {object} 채점 관리 형태 객체
 */
function paperToRecord(paper) {
  return { student: document.querySelector("#profileName").textContent || "학생", grade:"-", academy:"라온 과학학원", className:"-", category: paper.category, paper: paper.title, date: paper.uploaded, score: paper.score ?? 0, status: paper.status };
}
/**
 * 학생 업로드 사진(실제 시험지) 기준 채점 결과 모달을 채워 표시한다.
 * @param {object} paper - myPapers 항목
 * @returns {void}
 */
function showResultScan(paper) {
  const record = paperToRecord(paper);
  ensureGrading(record);
  document.querySelector("#resultModal h2").textContent = "채점 결과";
  document.querySelector("#resultScan").innerHTML = buildPrintSheet(record, record.grading.map((item) => item.mark), gradedScore(record), true);
  document.querySelector("#resultModal").classList.remove("hidden");
}
/**
 * 학생이 업로드한 원본 시험지(채점 표시 없음)를 모달에 표시한다.
 * @param {object} paper - myPapers 항목
 * @returns {void}
 */
function showOriginalScan(paper) {
  const record = paperToRecord(paper);
  ensureGrading(record);
  document.querySelector("#resultModal h2").textContent = "원본 시험지";
  document.querySelector("#resultScan").innerHTML = buildPrintSheet(record, record.grading.map(() => null), null, true);
  document.querySelector("#resultModal").classList.remove("hidden");
}
let gradingRecord = null;
const wrongAnswers = ["미정","해당없음","오답 표기","판독 불가"];
/**
 * 채점 관리에 문항별 채점 상태를 1회 생성한다.
 * 완료 상태면 정답/오답을 그대로, 아니면 자동채점(명확 인식 정답만 ○)을 기본 적용한다.
 * @param {object} record - 채점 관리
 * @returns {Array<object>} 문항별 채점 상태 배열
 */
function ensureGrading(record) {
  if (record.grading) return record.grading;
  const set = examAnswerBank[record.category] || examAnswerBank["화학 I · 산화 환원"];
  const correctCount = Math.max(0,Math.min(set.length,Math.round((record.score || 0) / 100 * set.length)));
  const done = record.status === "채점 완료";
  record.grading = set.map(([question,answer],index) => {
    const isCorrect = index < correctCount;
    const recognized = index !== 1;
    let mark = null;
    if (done && isCorrect) mark = "o";
    else if (recognized && isCorrect) mark = "o";
    return { question, answer, recognized, isCorrect, studentAnswer: isCorrect ? answer : wrongAnswers[index % wrongAnswers.length], mark };
  });
  return record.grading;
}
/**
 * 현재 ○ 개수로 점수를 계산한다.
 * @param {object} record - 채점 관리
 * @returns {number} 0~100 점수
 */
function gradedScore(record) {
  const list = ensureGrading(record);
  return Math.round(list.filter((item) => item.mark === "o").length / list.length * 100);
}
/**
 * 채점된 시험지 이미지(원본 + ○/× 마크) HTML을 만든다.
 * @param {object} record - 채점 관리
 * @param {Array<string|null>} marks - 문항별 마크 배열("o"/"x"/null)
 * @param {number} score - 표시할 점수
 * @returns {string} 시험지 이미지 HTML
 */
function scanHTML(record, marks, score) {
  const lines = record.grading.map((item,index) => `<div class="scan-line"><span class="scan-q">${index + 1}. ${item.question}</span><span class="scan-ans">${item.studentAnswer}</span><b class="scan-mark">${marks[index] === "o" ? "○" : marks[index] === "x" ? "×" : ""}</b></div>`).join("");
  const scoreTag = (score === null || score === undefined) ? "" : `<b class="scan-score">${score}</b>`;
  return `<div class="scan-sheet"><div class="scan-head"><strong>${record.paper}</strong><span>이름: ${record.student}</span></div>${lines}${scoreTag}</div>`;
}
/**
 * 채점 모달(자동채점 결과 / 수동채점 / 수동채점 결과)을 다시 그린다.
 * @returns {void}
 */
function renderGrading() {
  const record = gradingRecord;
  const list = ensureGrading(record);
  const manualScore = gradedScore(record);
  const autoMarks = list.map((item) => (item.recognized && item.isCorrect) ? "o" : null);
  const autoCount = autoMarks.filter((mark) => mark === "o").length;
  const autoScore = Math.round(autoCount / list.length * 100);
  const notDone = list.filter((item) => !item.mark).length;
  document.querySelector("#detailTitle").textContent = record.paper;
  document.querySelector("#detailMeta").innerHTML = `<span>${record.student} · ${record.grade}</span><span>${record.academy} · ${record.className}</span><span>${record.category}</span><span class="status-chip ${record.status === "채점 완료" ? "done" : "review"}">${record.status}</span>`;
  const autoSummary = notDone > 0
    ? `명확히 인식된 정답 <b>${autoCount}</b>문항을 자동으로 ○ 처리했어요.<br>채점이 완료되지 않은 <b>${notDone}</b>문항은 가운데에서 수동으로 채점해 주세요.`
    : `명확히 인식된 정답 <b>${autoCount}</b>문항을 자동으로 ○ 처리했어요.<br>모든 문항 채점이 완료되었어요.`;
  document.querySelector("#autoResult").innerHTML = `${buildPrintSheet(record, autoMarks, autoScore)}<p class="auto-summary">${autoSummary}</p>`;
  const rows = list.map((item,index) => `<div class="grade-row"><div class="grade-q"><span class="qn">${index + 1}</span><div><p>${item.question}</p><small>인식 답안: <b>${item.studentAnswer}</b> <em class="rec ${item.recognized ? "ok" : "warn"}">${item.recognized ? "명확 인식" : "확인 필요"}</em></small></div></div><div class="grade-actions"><button type="button" class="mark-btn o ${item.mark === "o" ? "active" : ""}" data-mark="o" data-q="${index}" aria-label="${index + 1}번 정답">○</button><button type="button" class="mark-btn x ${item.mark === "x" ? "active" : ""}" data-mark="x" data-q="${index}" aria-label="${index + 1}번 오답">×</button></div></div>`).join("");
  document.querySelector("#manualControl").innerHTML = `<div class="manual-box"><div class="grade-list">${rows}</div></div>`;
  document.querySelector("#manualResult").innerHTML = buildPrintSheet(record, list.map((item) => item.mark), manualScore);
  const done = record.status === "채점 완료";
  document.querySelector("#gradeFooter").innerHTML = `<span class="grade-note">${done ? "채점 완료됨 · 언제든 수정 가능" : "평가자가 완료를 눌러야 채점 완료됩니다"}</span><div class="grade-actions-end"><button type="button" class="secondary-button" data-open-print>🖨 인쇄</button><button type="button" class="primary-button" data-complete>${done ? "다시 완료" : "채점 완료"}</button></div>`;
}
/**
 * 채점 모달을 연다.
 * @param {object} record - 채점 관리 한 건
 * @returns {void}
 */
function openExamDetail(record) {
  if (!record) return;
  gradingRecord = record;
  ensureGrading(record);
  renderGrading();
  document.querySelector("#examDetailModal").classList.remove("hidden");
}
/**
 * 완료된 기록은 채점 수정이 즉시 표/이미지에 반영되도록 점수를 동기화한다.
 * @returns {void}
 */
function syncGradedRecord() {
  if (gradingRecord && gradingRecord.status === "채점 완료") { gradingRecord.score = gradedScore(gradingRecord); renderRecords(); }
}
const examDetailModal = document.querySelector("#examDetailModal");
document.querySelectorAll("[data-close-detail]").forEach((button) => button.addEventListener("click", () => examDetailModal.classList.add("hidden")));
examDetailModal.addEventListener("click", (event) => {
  if (event.target === examDetailModal) { examDetailModal.classList.add("hidden"); return; }
  if (!gradingRecord) return;
  const markButton = event.target.closest("[data-mark]");
  if (markButton) { const item = gradingRecord.grading[Number(markButton.dataset.q)]; const value = markButton.dataset.mark; item.mark = item.mark === value ? null : value; syncGradedRecord(); renderGrading(); return; }
  if (event.target.closest("[data-open-print]")) { openPrintPreview(gradingRecord); return; }
  if (event.target.closest("[data-complete]")) { gradingRecord.status = "채점 완료"; gradingRecord.score = gradedScore(gradingRecord); renderRecords(); renderGrading(); return; }
});
/**
 * 인쇄/미리보기용 3종(원본·자동채점·수동채점) 변형 데이터를 만든다.
 * @param {object} record - 채점 관리
 * @returns {Array<{key:string,label:string,marks:Array,score:(number|null)}>}
 */
function gradeVariants(record) {
  const list = ensureGrading(record);
  const autoMarks = list.map((item) => (item.recognized && item.isCorrect) ? "o" : null);
  const autoScore = Math.round(autoMarks.filter((mark) => mark === "o").length / list.length * 100);
  return [
    { key:"original", label:"채점되지 않은 원본 시험지", marks: list.map(() => null), score: null },
    { key:"auto", label:"자동채점된 시험지", marks: autoMarks, score: autoScore },
    { key:"manual", label:"수동채점까지 완료된 시험지", marks: list.map((item) => item.mark), score: gradedScore(record) }
  ];
}
/**
 * 원본 시험지에 채점 표시(○/×)를 얹은 인쇄용 시트 HTML을 만든다.
 * @param {object} record - 채점 관리
 * @param {Array<string|null>} marks - 문항별 마크 배열
 * @param {(number|null)} score - 표시할 점수(null이면 미표시)
 * @returns {string} 인쇄 시트 HTML
 */
function buildPrintSheet(record, marks, score, photo) {
  const lines = record.grading.map((item,index) => `<div class="print-line"><div class="print-q">${index + 1}. ${item.question}</div><div class="print-answer-row"><span class="print-ans">${item.studentAnswer}</span><b class="print-mark">${marks[index] === "o" ? "○" : marks[index] === "x" ? "×" : ""}</b></div></div>`).join("");
  return `<div class="print-sheet ${photo ? "print-photo" : ""}"><div class="fiducials"><i></i><i></i><i></i><i></i></div><div class="print-head"><div><strong>${record.paper}</strong><span>${record.category}</span></div><span>${record.student}</span></div><p class="print-sub">다음 문항의 답을 빈칸에 작성하세요.</p>${lines}</div>`;
}
/**
 * 선택한 변형을 인쇄한다.
 * @param {object} record - 채점 관리
 * @param {Array<string|null>} marks - 문항별 마크 배열
 * @param {(number|null)} score - 점수
 * @returns {void}
 */
function printVariant(record, marks, score) {
  document.querySelector("#printArea").innerHTML = buildPrintSheet(record, marks, score);
  document.body.classList.add("print-record");
  window.print();
}
window.addEventListener("afterprint", () => document.body.classList.remove("print-record"));
/**
 * 현재 시험지 양식(문항 + 빈 답란 + 채점 영역)을 원본 시험지로 인쇄한다.
 * @returns {void}
 */
function printTemplate() {
  const modalOpen = !document.querySelector("#templatePreviewModal").classList.contains("hidden");
  const scope = modalOpen ? "#largeTemplatePreview" : "#printableTemplate";
  const title = modalOpen ? document.querySelector("#templatePreviewTitle").value : (templates.find((item) => item.id === selectedTemplateId)?.name || draftTemplate?.name || "시험지");
  const category = document.querySelector(`${scope} [data-paper-category]`)?.value || "";
  const subject = document.querySelector(`${scope} [data-paper-subject]`)?.value || "";
  const lines = Object.entries(templateRegions).map(([number,region]) => `<div class="print-line"><div class="print-q">${number}. ${region.question}</div><div class="print-answer-row"><span class="print-ans print-blank" style="width:${region.w}px;height:${region.h}px"></span><b class="print-mark"></b></div></div>`).join("");
  document.querySelector("#printArea").innerHTML = `<div class="print-sheet"><div class="fiducials"><i></i><i></i><i></i><i></i></div><div class="print-head"><div><strong>${title}</strong><span>시험 카테고리: ${category}${subject ? ` · 과목: ${subject}` : ""}</span></div><span>이름 ____________</span></div><p class="print-sub">다음 문항의 답을 빈칸에 작성하세요.</p>${lines}</div>`;
  document.body.classList.add("print-record");
  window.print();
}
let printRecordRef = null;
let printSelectedIndex = 2;
/**
 * 인쇄 미리보기 모달을 연다.
 * @param {object} record - 채점 관리
 * @returns {void}
 */
function openPrintPreview(record) {
  if (!record) return;
  printRecordRef = record;
  printSelectedIndex = 2;
  renderPrintPreview();
  document.querySelector("#printPreviewModal").classList.remove("hidden");
}
/**
 * 인쇄 미리보기 3종 카드를 다시 그린다.
 * @returns {void}
 */
function renderPrintPreview() {
  const record = printRecordRef;
  document.querySelector("#printOptions").innerHTML = gradeVariants(record).map((variant,index) => `<button type="button" class="print-option ${index === printSelectedIndex ? "selected" : ""}" data-print-option="${index}"><span class="po-label"><b>${index + 1}</b> ${variant.label}</span><div class="po-preview">${buildPrintSheet(record, variant.marks, variant.score)}</div></button>`).join("");
}
const printPreviewModal = document.querySelector("#printPreviewModal");
document.querySelectorAll("[data-close-print]").forEach((button) => button.addEventListener("click", () => printPreviewModal.classList.add("hidden")));
printPreviewModal.addEventListener("click", (event) => {
  if (event.target === printPreviewModal) { printPreviewModal.classList.add("hidden"); return; }
  const option = event.target.closest("[data-print-option]");
  if (option) { printSelectedIndex = Number(option.dataset.printOption); renderPrintPreview(); return; }
  if (event.target.closest("[data-do-print]")) { const variant = gradeVariants(printRecordRef)[printSelectedIndex]; printPreviewModal.classList.add("hidden"); printVariant(printRecordRef, variant.marks, variant.score); return; }
});
document.querySelector("#studentCards").addEventListener("click", (event) => {
  const button = event.target.closest("[data-student-detail]");
  if (!button) return;
  const name = button.dataset.studentDetail;
  openExamDetail(records.find((record) => record.student === name) || { student:name, grade:"-", academy:"라온 과학학원", className:"-", category:"화학 I · 산화 환원", paper:"최근 시험지", date:"-", score:0, status:"검토 필요" });
});
const mobileQuery = globalThis.matchMedia("(max-width: 600px)");
let desktopRole = "admin";
/**
 * 화면 모드(선생님/학생)를 적용한다. 모바일 폭에서는 항상 학생 모드로 고정한다.
 * @param {string} nextRole - 적용할 역할("admin" 또는 "student")
 * @returns {void}
 */
function applyRole(nextRole) {
  if (!mobileQuery.matches) desktopRole=nextRole;
  role=mobileQuery.matches ? "student" : nextRole; const student=role === "student";
  document.body.classList.toggle("student-mode", student);
  document.querySelectorAll("[data-role]").forEach((item) => item.classList.toggle("active", item.dataset.role === role));
  document.querySelector("#profileName").textContent=student ? "유재혁" : "전선생";
  document.querySelector(".profile-button .avatar").textContent=student ? "유" : "전";
  document.querySelector("#profileRole").textContent=student ? "student account" : "academy admin";
  const collapsedToggle=document.querySelector("[data-collapsed-role-toggle]");
  const tooltip=student ? "선생님 모드로 전환" : "학생 모드로 전환";
  collapsedToggle.dataset.tooltip=tooltip;
  collapsedToggle.setAttribute("aria-label",tooltip);
  showPage(student ? "my-papers" : "dashboard");
}
document.querySelectorAll("[data-role]").forEach((button) => button.addEventListener("click", () => applyRole(button.dataset.role)));
document.querySelector("[data-collapsed-role-toggle]").addEventListener("click", () => applyRole(role === "student" ? "admin" : "student"));
/**
 * 뷰포트가 모바일/데스크톱 사이로 바뀔 때 역할을 다시 적용한다.
 * 모바일이면 학생 모드로, 데스크톱이면 마지막으로 선택한 데스크톱 역할로 복귀한다.
 * @returns {void}
 */
function syncRoleToViewport() {
  applyRole(mobileQuery.matches ? "student" : desktopRole);
}
if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", syncRoleToViewport);
else mobileQuery.addListener(syncRoleToViewport);
document.querySelector("[data-sidebar-toggle]").addEventListener("click", (event) => {
  const collapsed=document.body.classList.toggle("sidebar-collapsed");
  event.currentTarget.setAttribute("aria-expanded",String(!collapsed));
  event.currentTarget.setAttribute("aria-label",collapsed ? "사이드바 펼치기" : "사이드바 접기");
});
const mcTemplates = [
  { id:1, name:"산화 환원 객관식 미니테스트", category:"화학 I · 산화 환원", subject:"화학 I", count:5 },
  { id:2, name:"이온과 앙금 객관식", category:"중등 화학 · 이온", subject:"중등 화학", count:5 },
  { id:3, name:"물질의 규칙성 객관식", category:"통합과학 · 물질", subject:"통합과학", count:5 }
];
const mcQuestions = {
  1: [
    { q:"전자를 잃는 반응을 무엇이라 하는가?", choices:["환원","산화","중화","연소"], answer:1 },
    { q:"전자를 얻는 반응을 무엇이라 하는가?", choices:["산화","환원","분해","치환"], answer:1 },
    { q:"원소의 산화 상태를 나타내는 값은?", choices:["원자량","산화수","몰수","질량수"], answer:1 },
    { q:"산화와 환원이 동시에 일어나는 반응은?", choices:["중화 반응","산화 환원 반응","분해 반응","앙금 생성"], answer:1 },
    { q:"산소를 잃는 반응은?", choices:["산화","환원","연소","부식"], answer:1 }
  ],
  2: [
    { q:"+전하를 띤 이온을 무엇이라 하는가?", choices:["음이온","양이온","중성자","분자"], answer:1 },
    { q:"−전하를 띤 이온을 무엇이라 하는가?", choices:["양이온","음이온","원자핵","전자쌍"], answer:1 },
    { q:"두 용액을 섞을 때 생기는 침전물은?", choices:["기체","앙금","용매","결정"], answer:1 },
    { q:"수용액에서 전류가 흐르는 물질은?", choices:["비전해질","전해질","절연체","촉매"], answer:1 },
    { q:"Na⁺의 이름은?", choices:["칼륨 이온","나트륨 이온","칼슘 이온","수소 이온"], answer:1 }
  ],
  3: [
    { q:"우주 초기에 만들어진 원소는?", choices:["산소","수소","철","규소"], answer:1 },
    { q:"별 내부에서 일어나는 반응은?", choices:["핵분열","핵융합","연소","산화"], answer:1 },
    { q:"지각에 가장 많은 원소는?", choices:["규소","산소","알루미늄","철"], answer:1 },
    { q:"주기율표의 세로줄을 무엇이라 하는가?", choices:["주기","족","계열","군"], answer:1 },
    { q:"주기율표의 가로줄을 무엇이라 하는가?", choices:["족","주기","구역","블록"], answer:1 }
  ]
};
const mcChoiceMarks = ["①","②","③","④","⑤"];
let mcSelectedId = 1;
let mcSelectedQ = 0;
/**
 * 객관식 등록 시험지 목록을 렌더링한다.
 * @returns {void}
 */
function renderMcList() {
  document.querySelector('[data-page-panel="templates-mc"] .template-list-title small').textContent = `총 ${mcTemplates.length}개`;
  document.querySelector("#mcListItems").innerHTML = mcTemplates.map((template) => `<button class="template-item ${template.id === mcSelectedId ? "active" : ""}" type="button" data-mc-id="${template.id}"><span class="template-icon">▤</span><span><strong>${template.name}</strong><small>${template.category} · ${template.count}문항</small></span></button>`).join("");
}
/**
 * 선택된 객관식 시험지 미리보기(문항 + 보기 + 정답)를 렌더링한다.
 * @returns {void}
 */
function renderMcPreview() {
  const template = mcTemplates.find((item) => item.id === mcSelectedId);
  const questions = mcQuestions[mcSelectedId] || [];
  const body = questions.map((item,index) => `<div class="mc-question ${index === mcSelectedQ ? "active" : ""}" data-mc-q="${index}"><div class="mc-q-text">${index + 1}. ${item.q}</div><div class="mc-choices">${item.choices.map((choice,ci) => `<div class="mc-choice ${ci === item.answer ? "correct" : ""}"><span class="mc-num">${mcChoiceMarks[ci]}</span><span>${choice}</span></div>`).join("")}</div></div>`).join("");
  document.querySelector("#mcPreview").innerHTML = `<div class="fiducials"><i></i><i></i><i></i><i></i></div><div class="mc-head"><div><strong>${template?.name || "객관식 시험지"}</strong><span>${template?.category || ""} · ${template?.subject || ""}</span></div><span>이름 ____________</span></div><p class="mc-paper-sub">다음 문항에서 알맞은 답을 하나 고르세요.</p>${body}`;
}
/**
 * 선택된 문항의 보기/정답 요약을 좌측 패널에 표시한다.
 * @returns {void}
 */
function renderMcSummary() {
  const item = (mcQuestions[mcSelectedId] || [])[mcSelectedQ];
  document.querySelector("#mcSelectedQuestion").textContent = mcSelectedQ + 1;
  document.querySelector("#mcSummaryBody").innerHTML = item ? `<p class="mc-summary-q">${item.q}</p><ul class="mc-summary-choices">${item.choices.map((choice,ci) => `<li class="${ci === item.answer ? "correct" : ""}"><span>${mcChoiceMarks[ci]}</span><span>${choice}</span>${ci === item.answer ? '<em>정답</em>' : ""}</li>`).join("")}</ul>` : "";
}
/**
 * 객관식 시험지를 선택한다.
 * @param {number} id - 시험지 id
 * @returns {void}
 */
function selectMcTemplate(id) {
  mcSelectedId = id; mcSelectedQ = 0;
  renderMcList(); renderMcPreview(); renderMcSummary();
}
/**
 * 객관식 시험지를 인쇄한다(보기 포함, 정답 미표시).
 * @returns {void}
 */
function printMc() {
  const template = mcTemplates.find((item) => item.id === mcSelectedId);
  const questions = mcQuestions[mcSelectedId] || [];
  const lines = questions.map((item,index) => `<div class="mc-print-q"><div class="mc-print-text">${index + 1}. ${item.q}</div><div class="mc-print-choices">${item.choices.map((choice,ci) => `<span class="mc-print-choice">${mcChoiceMarks[ci]} ${choice}</span>`).join("")}</div></div>`).join("");
  document.querySelector("#printArea").innerHTML = `<div class="print-sheet"><div class="fiducials"><i></i><i></i><i></i><i></i></div><div class="print-head"><div><strong>${template?.name || "객관식 시험지"}</strong><span>시험 카테고리: ${template?.category || ""}${template?.subject ? ` · 과목: ${template.subject}` : ""}</span></div><span>이름 ____________</span></div><p class="print-sub">다음 문항에서 알맞은 답을 하나 고르세요.</p>${lines}</div>`;
  document.body.classList.add("print-record");
  window.print();
}
document.querySelector("#mcListItems").addEventListener("click", (event) => { const button = event.target.closest("[data-mc-id]"); if (button) selectMcTemplate(Number(button.dataset.mcId)); });
document.querySelector("#mcPreview").addEventListener("click", (event) => { const question = event.target.closest("[data-mc-q]"); if (!question) return; mcSelectedQ = Number(question.dataset.mcQ); renderMcPreview(); renderMcSummary(); });
document.querySelector("#mcPrint").addEventListener("click", printMc);
/* ── 대시보드: 이번 주 현황·검토 대기·최근 기록·클래스별 평균 ── */
const weeklyGrading = [["월",18,2],["화",22,4],["수",15,1],["목",27,3],["금",21,2],["토",9,1],["일",24,3]];
const classAverages = [["고2 화학 I",84,46],["중3 화학 심화",79,38],["고1 통합과학 A",88,41],["고1 통합과학 B",72,29]];
/** 대시보드 하단 카드들을 그린다. @returns {void} */
function renderDashboard() {
  const max = Math.max(...weeklyGrading.map(([, done, review]) => done + review));
  document.querySelector("#weeklyTotal").textContent = weeklyGrading.reduce((sum, [, done, review]) => sum + done + review, 0);
  document.querySelector("#weeklyChart").innerHTML = weeklyGrading.map(([day, done, review]) => `<div class="week-col"><b>${done + review}</b><div class="week-bar" style="height:${(done + review) / max * 100}%" title="${day}: 완료 ${done}장, 검토 필요 ${review}장"><i class="review" style="flex-grow:${review}"></i><i class="done" style="flex-grow:${done}"></i></div><span>${day}</span></div>`).join("");
  const reviews = records.filter((record) => record.status === "검토 필요");
  document.querySelector("#reviewCount").textContent = `${reviews.length}장`;
  document.querySelector("#reviewQueue").innerHTML = reviews.map((record) => `<button class="review-item" type="button" data-page="records"><span class="review-avatar">${record.student[0]}</span><span class="review-text"><strong>${record.student}<em>${record.className}</em></strong><small>${record.paper} · ${record.date}</small></span><span class="review-arrow">›</span></button>`).join("") || '<p class="empty-state">검토할 시험지가 없습니다.</p>';
  document.querySelector("#recentRecords").innerHTML = records.slice(0, 5).map((record) => `<tr><td>${record.date}</td><td><strong>${record.student}</strong><em>${record.className}</em></td><td>${record.paper}</td><td class="num"><strong>${record.score}</strong>점</td><td class="num"><span class="status ${record.status === "채점 완료" ? "done" : "review"}">${record.status}</span></td></tr>`).join("");
  document.querySelector("#classScores").innerHTML = classAverages.map(([name, average, papers]) => `<li><div><b>${name}</b><span><strong>${average}</strong>점 · ${papers}장</span></div><p><i class="${average < 75 ? "low" : ""}" style="width:${average}%"></i></p></li>`).join("");
}
renderDashboard();

/* ── 시스템 설정 (DELMA 시스템 설정 화면 구성)
   최상위 그룹 = 탭, 하위 그룹 = 접는 구역. 키 = 소속 그룹 코드 + "." + 이름(영문 대문자).
   실제 앱은 system_settings / system_setting_groups / system_setting_histories 테이블, 프로토타입은 브라우저 저장소에 저장한다. ── */
const SYS_STORAGE_KEY = "prototype-system-settings-v3";
const SYS_CHOICE_TYPES = ["RADIO","SEL","CHECK"];
const SYS_CODE_PATTERN = /^[A-Z][A-Z0-9_]*$/;
const SYS_ACTION = { I:{ label:"추가", tone:"add" }, U:{ label:"수정", tone:"edit" }, D:{ label:"삭제", tone:"del" } };
const SYS_HISTORY_TAB = "history";
const SYS_PAGE_SIZE = 10;
const SYS_ICON_EDIT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5zM15 5l4 4"/></svg>';
const SYS_ICON_REVERT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>';
const SYS_ICON_DELETE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>';
const SYS_INITIAL = {
  groups:[
    { id:"WM", name:"쪽지시험", description:"쪽지시험 관리도구 설정" },
    { id:"WM.MAIL_BATCH", name:"메일 배치", description:"채점 결과 메일 자동 발송 설정" }
  ],
  settings:[
    { key:"WM.MAIL_BATCH.CYCLE", groupId:"WM", subGroupId:"WM.MAIL_BATCH", name:"메일 배치 주기", description:"DAILY: 매일 전날분 / WEEKLY: 매주 월요일 지난주분 / MONTHLY: 매달 1일 지난달분. 오전 9시 5분(한국 시간) 실행.", type:"RADIO", value:"MONTHLY", options:["DAILY","WEEKLY","MONTHLY"], access:"W" },
    { key:"WM.MAIL_BATCH.ENABLED", groupId:"WM", subGroupId:"WM.MAIL_BATCH", name:"메일 배치 사용 여부", description:"채점 결과 메일 자동 발송 여부. true면 발송 주기에 맞춰 학원 선생님 전원에게 요약과 CSV를 보낸다.", type:"BOOL", value:"false", options:null, access:"W" }
  ],
  histories:[]
};
/**
 * 저장된 시스템 설정 데이터를 읽는다. 없거나 읽을 수 없으면 초기값.
 * @returns {{groups: Array, settings: Array, histories: Array}} 시스템 설정 데이터
 */
function readSysStore() {
  try { const saved = JSON.parse(localStorage.getItem(SYS_STORAGE_KEY)); if (saved?.groups && saved?.settings) return saved; } catch { /* 저장소를 쓸 수 없으면 초기값 */ }
  return structuredClone(SYS_INITIAL);
}
let sysStore = readSysStore();
/**
 * 한국 시간 오늘 날짜(YYYY-MM-DD)
 * @returns {string}
 */
function kstToday() { return new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10); }
const sysView = { tab:null, query:"", drafts:{}, collapsed:new Set(), hist:{ date:kstToday(), groupId:"", key:"", page:1 }, modal:null, confirm:null };
/** 시스템 설정 데이터를 저장한다. @returns {void} */
function writeSysStore() { try { localStorage.setItem(SYS_STORAGE_KEY, JSON.stringify(sysStore)); } catch { /* 새로고침 시 초기화 */ } }
/**
 * HTML 특수문자를 바꾼다. (사용자가 입력한 값을 화면에 넣을 때)
 * @param {*} value - 표시할 값
 * @returns {string} 안전한 문자열
 */
function esc(value) { return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[ch]); }
/** 상위 그룹 코드 (최상위면 null) @param {string} code @returns {string|null} */
function sysParent(code) { const index = code.lastIndexOf("."); return index < 0 ? null : code.slice(0, index); }
/**
 * 값이 유형·선택지에 맞는지 검사한다. 빈 값은 허용한다. (DB check 제약과 같은 규칙)
 * @param {{type: string, options: (string[]|null)}} setting - 유형과 선택지
 * @param {string} value - 검사할 값
 * @returns {string|null} 오류 문구
 */
function sysValidate(setting, value) {
  const options = setting.options ?? [];
  if (SYS_CHOICE_TYPES.includes(setting.type) && !options.length) return "선택지를 하나 이상 추가하세요.";
  if (value === "") return null;
  if (setting.type === "BOOL" && value !== "true" && value !== "false") return "true 또는 false만 쓸 수 있습니다.";
  if (setting.type === "NUM" && !/^-?\d+(\.\d+)?$/.test(value)) return "숫자만 입력할 수 있습니다. (예: 10, 0.85)";
  if ((setting.type === "RADIO" || setting.type === "SEL") && !options.includes(value)) return `${options.join(", ")} 중 하나여야 합니다.`;
  if (setting.type === "CHECK" && !value.split(",").every((item) => options.includes(item))) return `${options.join(", ")} 안에서만 고를 수 있습니다.`;
  return null;
}
/**
 * 변경 이력을 남긴다. (DB 트리거와 같은 규칙, 그룹은 최상위 그룹)
 * @param {string} action - I/U/D
 * @param {object} setting - 대상 설정
 * @param {(string|null)} prevValue - 이전 값
 * @returns {void}
 */
function sysLog(action, setting, prevValue) {
  sysStore.histories.unshift({ id:Date.now() + Math.random(), key:setting.key, name:setting.name, groupId:setting.groupId, groupName:sysStore.groups.find((group) => group.id === setting.groupId)?.name ?? null, action, prevValue, nowValue:action === "D" ? null : setting.value, changedAt:new Date().toISOString(), changedBy:document.querySelector("#profileName").textContent });
}
/** 화면에서 고친 값 중 저장된 값과 다른 것 @returns {Array<{key: string, value: string}>} */
function sysChanges() { return sysStore.settings.filter((setting) => setting.key in sysView.drafts && sysView.drafts[setting.key] !== (setting.value ?? "")).map((setting) => ({ key:setting.key, value:sysView.drafts[setting.key] })); }
let sysToastTimer;
/** 잠깐 안내 문구를 띄운다. @param {string} message - 문구 @param {boolean} [error] - 오류 여부 @returns {void} */
function sysToast(message, error = false) {
  const toast = document.querySelector("#sysToast");
  toast.textContent = message; toast.classList.toggle("error", error); toast.classList.remove("hidden");
  clearTimeout(sysToastTimer); sysToastTimer = setTimeout(() => toast.classList.add("hidden"), 2200);
}
/**
 * 유형에 맞는 입력 요소 HTML. 목록과 추가·수정 창이 같은 모양으로 쓴다.
 * String 텍스트 / Number 숫자 / Boolean 토글 / Radio 라디오 / Select 선택 상자 / Checkbox 체크박스(여러 개)
 * @param {object} setting - 유형·선택지
 * @param {string} value - 현재 값
 * @param {{key: string, label: string, disabled?: boolean, id?: string, placeholder?: string}} opts - 대상 키·이름 등
 * @returns {string} HTML
 */
function sysValueInput(setting, value, opts) {
  const error = sysValidate(setting, value);
  const message = error ? `<small class="sys-invalid">${esc(error)}</small>` : "";
  const key = esc(opts.key);
  const disabled = opts.disabled ? " disabled" : "";
  const id = opts.id ? ` id="${opts.id}"` : "";
  const label = esc(opts.label);
  const options = setting.options ?? [];
  if (setting.type === "BOOL") return `<span class="sys-bool"><button class="switch" type="button" role="switch" aria-checked="${value === "true"}" aria-label="${label}" data-sys-bool="${key}"${id}${disabled}><i></i></button><code>${value === "true" ? "true" : "false"}</code></span>${message}`;
  if (setting.type === "RADIO" || setting.type === "CHECK") {
    const radio = setting.type === "RADIO";
    const selected = value ? value.split(",") : [];
    return `<div class="sys-choices" role="${radio ? "radiogroup" : "group"}" aria-label="${label}"${id}>${options.map((option) => `<label><input type="${radio ? "radio" : "checkbox"}" name="sysv-${key}" value="${esc(option)}" ${radio ? `data-sys-value="${key}"` : `data-sys-check="${key}"`}${(radio ? value === option : selected.includes(option)) ? " checked" : ""}${disabled} />${esc(option)}</label>`).join("") || '<span class="sys-muted">선택지가 없습니다.</span>'}</div>${message}`;
  }
  if (setting.type === "SEL") return `<select class="sys-input${error ? " invalid" : ""}" data-sys-value="${key}" aria-label="${label}"${id}${disabled}><option value="">선택</option>${options.map((option) => `<option${option === value ? " selected" : ""}>${esc(option)}</option>`).join("")}</select>${message}`;
  return `<input class="sys-input${error ? " invalid" : ""}" type="${setting.type === "NUM" ? "number" : "text"}"${setting.type === "NUM" ? ' step="any"' : ""} value="${esc(value)}" data-sys-value="${key}" aria-label="${label}"${id}${opts.placeholder ? ` placeholder="${esc(opts.placeholder)}"` : ""}${disabled} />${message}`;
}
/**
 * 체크박스 묶음에서 체크된 값을 선택지 순서대로 쉼표로 잇는다.
 * @param {Element} root - 체크박스를 담은 요소
 * @param {string} key - 대상 키
 * @returns {string} 저장 값
 */
function sysCheckedValue(root, key) {
  return [...root.querySelectorAll("input[data-sys-check]")].filter((input) => input.dataset.sysCheck === key && input.checked).map((input) => input.value).join(",");
}
/** 최상위 그룹 목록 (코드 순) @returns {Array} */
function sysRoots() { return sysStore.groups.filter((group) => !sysParent(group.id)).sort((a, b) => a.id.localeCompare(b.id)); }
/** 현재 탭 (삭제된 탭이면 첫 탭) @returns {string} */
function sysTab() { return sysView.tab === SYS_HISTORY_TAB || sysRoots().some((group) => group.id === sysView.tab) ? sysView.tab : (sysRoots()[0]?.id ?? SYS_HISTORY_TAB); }
/** 탭을 그린다. @returns {void} */
function renderSysTabs() {
  const tab = sysTab();
  document.querySelector("#sysTabs").innerHTML = [...sysRoots().map((group) => [group.id, group.id, group.name]), [SYS_HISTORY_TAB, "변경 이력", "변경 이력"]].map(([value, label, title]) => `<button type="button" role="tab" data-sys-tab="${esc(value)}" title="${esc(title)}" aria-selected="${value === tab}">${esc(label)}</button>`).join("");
  document.querySelector('[data-sys-panel="settings"]').classList.toggle("hidden", tab === SYS_HISTORY_TAB);
  document.querySelector('[data-sys-panel="history"]').classList.toggle("hidden", tab !== SYS_HISTORY_TAB);
}
/** 설정 구역(하위 그룹별)을 그린다. 항목 숨김(H)은 빼고 검색어로 거른다. @returns {void} */
function renderSysSections() {
  const tab = sysTab();
  const query = sysView.query.trim().toLowerCase();
  const sections = new Map();
  [...sysStore.settings].sort((a, b) => a.key.localeCompare(b.key)).forEach((setting) => {
    if (setting.groupId !== tab || setting.access === "H") return;
    if (query && ![setting.name, setting.key, setting.description, setting.value].some((text) => text && text.toLowerCase().includes(query))) return;
    const id = setting.subGroupId ?? setting.groupId;
    sections.set(id, [...(sections.get(id) ?? []), setting]);
  });
  const ordered = [...sections.entries()].sort(([a], [b]) => a.localeCompare(b));
  document.querySelector("#sysCount").textContent = ordered.reduce((sum, [, items]) => sum + items.length, 0);
  document.querySelector("#sysSections").innerHTML = ordered.map(([id, items]) => {
    const open = !sysView.collapsed.has(id);
    const name = sysStore.groups.find((group) => group.id === id)?.name ?? id;
    const rows = open ? items.map((setting) => {
      const value = sysView.drafts[setting.key] ?? setting.value ?? "";
      const dirty = setting.key in sysView.drafts && value !== (setting.value ?? "");
      return `<div class="sys-row${dirty ? " dirty" : ""}"><div class="sys-name"><span title="${esc(setting.key)}">${esc(setting.name)}</span>${dirty ? sysDirtyBadge(setting) : ""}</div><div class="sys-value">${sysValueInput(setting, value, { key:setting.key, label:`${setting.name} 값`, disabled:setting.access === "R" })}</div><p class="sys-desc">${esc(setting.description)}</p><div class="sys-row-actions">${dirty ? sysRevertButton(setting) : ""}<button type="button" data-sys-edit="${esc(setting.key)}" aria-label="${esc(setting.name)} 수정">${SYS_ICON_EDIT}</button><button type="button" data-sys-delete="${esc(setting.key)}" aria-label="${esc(setting.name)} 삭제">${SYS_ICON_DELETE}</button></div></div>`;
    }).join("") : "";
    return `<section class="sys-section"><button class="sys-section-head" type="button" data-sys-toggle="${esc(id)}" aria-expanded="${open}"><i>${open ? "⌄" : "›"}</i>${esc(name)}<span>(${items.length})</span></button>${rows}</section>`;
  }).join("") || `<p class="sys-empty">${query ? "검색 결과가 없습니다." : "설정이 없습니다. 설정 추가로 만들어 보세요."}</p>`;
  renderSysSaveButton();
}
/** 고친 행의 "변경됨" 배지 (저장된 값은 툴팁) @param {object} setting @returns {string} HTML */
function sysDirtyBadge(setting) { return `<span class="sys-dirty-badge" title="저장된 값: ${esc(setting.value || "(없음)")}"><i></i>변경됨</span>`; }
/** 고친 행의 되돌리기 버튼 @param {object} setting @returns {string} HTML */
function sysRevertButton(setting) { return `<button type="button" class="sys-revert" data-sys-revert="${esc(setting.key)}" aria-label="${esc(setting.name)} 되돌리기" title="저장된 값으로 되돌리기">${SYS_ICON_REVERT}</button>`; }
/**
 * 입력 중인 행의 변경 표시(강조선·배지·되돌리기)만 맞춘다. (다시 그리면 입력 포커스가 사라지므로)
 * @param {Element} row - 행 요소
 * @param {object} setting - 설정
 * @param {boolean} dirty - 저장된 값과 다른지
 * @returns {void}
 */
function syncSysRowDirty(row, setting, dirty) {
  row.classList.toggle("dirty", dirty);
  row.querySelector(".sys-dirty-badge")?.remove();
  row.querySelector(".sys-revert")?.remove();
  if (!dirty) return;
  row.querySelector(".sys-name").insertAdjacentHTML("beforeend", sysDirtyBadge(setting));
  row.querySelector(".sys-row-actions").insertAdjacentHTML("afterbegin", sysRevertButton(setting));
}
/** 저장 버튼 (바뀐 값이 있고 모두 올바를 때만 활성, 바뀐 개수 표시) @returns {void} */
function renderSysSaveButton() {
  const changes = sysChanges();
  const invalid = changes.some((change) => sysValidate(sysStore.settings.find((setting) => setting.key === change.key), change.value));
  const button = document.querySelector("#sysSave");
  button.textContent = changes.length ? `저장 (${changes.length})` : "저장";
  button.classList.toggle("primary-button", changes.length > 0);
  button.classList.toggle("secondary-button", changes.length === 0);
  button.disabled = changes.length === 0 || invalid;
  button.title = invalid ? "잘못된 값을 고쳐야 저장할 수 있습니다." : "";
}
/** 변경 이력(검색 조건·페이지)을 그린다. @returns {void} */
function renderSysHistory() {
  const { date, groupId, key, page } = sysView.hist;
  const from = date ? new Date(`${date}T00:00:00+09:00`).toISOString() : null;
  const to = date ? new Date(new Date(`${date}T00:00:00+09:00`).getTime() + 86400000).toISOString() : null;
  const keyword = key.trim().toLowerCase();
  const matched = sysStore.histories.filter((history) => (!date || (history.changedAt >= from && history.changedAt < to)) && (!groupId || history.groupId === groupId) && (!keyword || (history.key ?? "").toLowerCase().includes(keyword)));
  const pages = Math.max(1, Math.ceil(matched.length / SYS_PAGE_SIZE));
  const current = Math.min(page, pages);
  const format = new Intl.DateTimeFormat("sv-SE", { timeZone:"Asia/Seoul", year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false });
  document.querySelector("#sysHistDate").value = date ?? "";
  document.querySelector("#sysHistDateClear").classList.toggle("hidden", !date);
  document.querySelector("#sysHistGroup").innerHTML = '<option value="">전체</option>' + sysRoots().map((group) => `<option value="${esc(group.id)}"${group.id === groupId ? " selected" : ""}>${esc(group.id)}</option>`).join("");
  document.querySelector("#sysHistKey").value = key;
  document.querySelector("#sysHistCount").textContent = matched.length;
  document.querySelector("#sysHistBody").innerHTML = matched.slice((current - 1) * SYS_PAGE_SIZE, current * SYS_PAGE_SIZE).map((history) => `<tr><td>${esc(history.groupId)}</td><td>${esc(history.groupName)}</td><td class="mono">${esc(history.key)}</td><td>${esc(history.name)}</td><td>${esc(history.nowValue ?? "")}</td><td><span class="sys-action ${SYS_ACTION[history.action].tone}">${SYS_ACTION[history.action].label}</span></td><td>${esc(history.prevValue ?? "")}</td><td class="nowrap">${format.format(new Date(history.changedAt)).replace(/-/g, ".")}</td><td>${esc(history.changedBy)}</td></tr>`).join("");
  document.querySelector("#sysHistEmpty").classList.toggle("hidden", matched.length > 0);
  const nav = (target, label, text) => `<button type="button" data-sys-page="${target}" aria-label="${label}"${target < 1 || target > pages || target === current ? " disabled" : ""}>${text}</button>`;
  document.querySelector("#sysHistPages").innerHTML = matched.length ? nav(1, "처음 페이지", "«") + nav(current - 1, "이전 페이지", "‹") + Array.from({ length:pages }, (_, index) => `<button type="button" class="page${index + 1 === current ? " active" : ""}" data-sys-page="${index + 1}">${index + 1}</button>`).join("") + nav(current + 1, "다음 페이지", "›") + nav(pages, "마지막 페이지", "»") : "";
}
/** 시스템 설정 화면 전체를 다시 그린다. @returns {void} */
function renderSys() {
  renderSysTabs();
  if (sysTab() === SYS_HISTORY_TAB) renderSysHistory(); else renderSysSections();
  if (!document.querySelector("#sysGroupModal").classList.contains("hidden")) renderSysGroupTable();
}
/** 모달을 연다/닫는다. @param {string|null} id - 열 모달 id (null이면 설정·그룹 창 모두 닫기) @returns {void} */
function sysModal(id) {
  ["#sysSettingModal","#sysGroupModal"].forEach((selector) => document.querySelector(selector).classList.toggle("hidden", selector !== id));
}
/** 삭제 확인 창 닫기 @returns {void} */
function sysCloseConfirm() { document.querySelector("#sysConfirmModal").classList.add("hidden"); sysView.confirm = null; }
/**
 * 삭제 확인 창을 연다. (그룹 관리 창 위에 겹쳐 열릴 수 있다)
 * @param {string} kind - "setting" | "group"
 * @param {object} target - 삭제할 설정 또는 그룹
 * @returns {void}
 */
function openSysConfirm(kind, target) {
  sysView.confirm = { kind, target };
  document.querySelector("#sysConfirmTitle").textContent = kind === "setting" ? "설정을 삭제할까요?" : "그룹을 삭제할까요?";
  document.querySelector("#sysConfirmText").textContent = kind === "setting" ? `${target.name} (${target.key}) 설정을 삭제합니다. 삭제 기록은 변경 이력에 남습니다.` : `${target.name} (${target.id}) 그룹을 삭제합니다. 하위 그룹이나 설정이 남아 있으면 삭제되지 않습니다.`;
  document.querySelector("#sysConfirmError").textContent = "";
  document.querySelector("#sysConfirmModal").classList.remove("hidden");
}

/* 설정 추가·수정 창 */
/** 설정 창의 입력 상태로 키 안내·값 입력·확인 버튼을 다시 그린다. @returns {void} */
function renderSysSettingForm() {
  const form = sysView.modal.form;
  document.querySelector("#sysFormKeyHint").innerHTML = form.ownerId && form.keyName ? `저장될 키: <code>${esc(form.ownerId)}.${esc(form.keyName)}</code>` : "";
  const choice = SYS_CHOICE_TYPES.includes(form.type);
  document.querySelectorAll(".sys-option-field").forEach((element) => element.classList.toggle("hidden", !choice));
  document.querySelector("#sysFormOptionList").innerHTML = (form.options ?? []).map((option) => `<li>${esc(option)}<button type="button" data-sys-option-remove="${esc(option)}" aria-label="${esc(option)} 선택지 삭제">×</button></li>`).join("");
  document.querySelector("#sysFormValue").innerHTML = sysValueInput({ type:form.type || "STR", options:choice ? form.options : null }, form.value, { key:"__form__", label:"설정 값", id:"sysFormValueInput", placeholder:"값 입력" });
  document.querySelector("#sysSettingSubmit").disabled = !(form.ownerId && form.keyName && form.name.trim() && form.type && form.access && (!choice || form.options?.length));
}
/**
 * 설정 추가(setting 없음)·수정 창을 연다.
 * @param {object} [setting] - 수정할 설정
 * @returns {void}
 */
function openSysSettingModal(setting) {
  const ownerId = setting ? (setting.subGroupId ?? setting.groupId) : "";
  sysView.modal = { mode:setting ? "update" : "create", form:{ ownerId, keyName:setting ? setting.key.slice(ownerId.length + 1) : "", name:setting?.name ?? "", type:setting?.type ?? "", value:setting?.value ?? "", description:setting?.description ?? "", access:setting?.access ?? "", options:setting?.options ?? [] } };
  const form = sysView.modal.form;
  document.querySelector("#sysSettingTitle").textContent = setting ? "설정 수정" : "설정 추가";
  const owner = document.querySelector("#sysFormOwner");
  owner.innerHTML = '<option value="">상위그룹 선택</option>' + [...sysStore.groups].sort((a, b) => a.id.localeCompare(b.id)).map((group) => `<option value="${esc(group.id)}"${group.id === ownerId ? " selected" : ""}>${esc(group.id)} (${esc(group.name)})</option>`).join("");
  owner.disabled = Boolean(setting);
  const key = document.querySelector("#sysFormKey");
  key.value = form.keyName; key.disabled = Boolean(setting);
  document.querySelector("#sysFormName").value = form.name;
  document.querySelector("#sysFormType").value = form.type;
  document.querySelector("#sysFormDesc").value = form.description;
  document.querySelectorAll('[name="sysAccess"]').forEach((radio) => { radio.checked = radio.value === form.access; });
  document.querySelector("#sysSettingError").textContent = "";
  document.querySelector("#sysFormOptionInput").value = "";
  document.querySelector("#sysFormOptionError").textContent = "";
  renderSysSettingForm();
  sysModal("#sysSettingModal");
}
document.querySelector("#sysFormOwner").addEventListener("change", (event) => { sysView.modal.form.ownerId = event.target.value; renderSysSettingForm(); });
document.querySelector("#sysFormKey").addEventListener("input", (event) => { event.target.value = event.target.value.toUpperCase(); sysView.modal.form.keyName = event.target.value; renderSysSettingForm(); });
document.querySelector("#sysFormName").addEventListener("input", (event) => { sysView.modal.form.name = event.target.value; renderSysSettingForm(); });
document.querySelector("#sysFormDesc").addEventListener("input", (event) => { sysView.modal.form.description = event.target.value; });
document.querySelector("#sysFormType").addEventListener("change", (event) => {
  const form = sysView.modal.form;
  form.type = event.target.value;
  // 유형을 바꾸면 값을 비우고(Boolean은 false), 선택형끼리는 선택지를 그대로 둔다.
  form.value = form.type === "BOOL" ? "false" : "";
  if (!SYS_CHOICE_TYPES.includes(form.type)) form.options = [];
  renderSysSettingForm();
});
document.querySelectorAll('[name="sysAccess"]').forEach((radio) => radio.addEventListener("change", () => { sysView.modal.form.access = radio.value; renderSysSettingForm(); }));
const sysFormValue = document.querySelector("#sysFormValue");
sysFormValue.addEventListener("click", (event) => { if (!event.target.closest("[data-sys-bool]")) return; const form = sysView.modal.form; form.value = form.value === "true" ? "false" : "true"; renderSysSettingForm(); });
sysFormValue.addEventListener("change", (event) => {
  const form = sysView.modal.form;
  if (event.target.matches("[data-sys-check]")) form.value = sysCheckedValue(sysFormValue, "__form__");
  else if (event.target.matches("select, input[type=radio]")) form.value = event.target.value;
  else return;
  renderSysSettingForm();
});
sysFormValue.addEventListener("input", (event) => { if (event.target.matches("input[type=text], input[type=number]")) sysView.modal.form.value = event.target.value; });
/** 입력한 선택지를 추가한다. (비거나 쉼표·중복이면 안내) @returns {void} */
function addSysOption() {
  const input = document.querySelector("#sysFormOptionInput");
  const option = input.value.trim();
  const form = sysView.modal.form;
  const error = !option ? "선택지를 입력하세요." : option.includes(",") ? "선택지에는 쉼표(,)를 쓸 수 없습니다." : form.options.includes(option) ? "이미 있는 선택지입니다." : "";
  document.querySelector("#sysFormOptionError").textContent = error;
  if (error) return;
  form.options = [...form.options, option];
  input.value = "";
  renderSysSettingForm();
}
document.querySelector("#sysFormOptionAdd").addEventListener("click", addSysOption);
document.querySelector("#sysFormOptionInput").addEventListener("keydown", (event) => { if (event.key !== "Enter") return; event.preventDefault(); addSysOption(); });
document.querySelector("#sysFormOptionList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-sys-option-remove]");
  if (!button) return;
  const form = sysView.modal.form;
  form.options = form.options.filter((option) => option !== button.dataset.sysOptionRemove);
  // 지운 선택지는 고른 값에서도 뺀다.
  form.value = form.type === "CHECK" ? form.value.split(",").filter((item) => form.options.includes(item)).join(",") : (form.options.includes(form.value) ? form.value : "");
  renderSysSettingForm();
});
document.querySelector("#sysSettingForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const { mode, form } = sysView.modal;
  const key = `${form.ownerId}.${form.keyName}`;
  const rootId = form.ownerId.split(".")[0];
  const error = !form.ownerId ? "상위그룹을 선택하세요."
    : !SYS_CODE_PATTERN.test(form.keyName) ? "키는 영문 대문자로 시작하고 대문자·숫자·밑줄(_)만 쓸 수 있습니다."
    : !form.name.trim() ? "속성명을 입력하세요."
    : mode === "create" && sysStore.settings.some((setting) => setting.key === key) ? "이미 같은 키가 있습니다. 다른 키로 입력하세요."
    : sysValidate({ type:form.type, options:SYS_CHOICE_TYPES.includes(form.type) ? form.options : null }, form.value);
  if (error) { document.querySelector("#sysSettingError").textContent = error; return; }
  const next = { key, groupId:rootId, subGroupId:form.ownerId === rootId ? null : form.ownerId, name:form.name.trim(), description:form.description.trim() || null, type:form.type, value:form.value || null, options:SYS_CHOICE_TYPES.includes(form.type) ? form.options : null, access:form.access };
  if (mode === "create") { sysStore.settings.push(next); sysLog("I", next, null); }
  else {
    const setting = sysStore.settings.find((item) => item.key === key);
    const prev = setting.value;
    Object.assign(setting, next);
    if (prev !== setting.value) sysLog("U", setting, prev);
    delete sysView.drafts[key];
  }
  writeSysStore(); sysModal(null); renderSys(); sysToast("설정을 저장했습니다.");
});

/* 그룹 관리 창 */
/** 그룹 관리 창의 추가 줄 안내·버튼과 표를 그린다. @returns {void} */
function renderSysGroupTable() {
  const groups = [...sysStore.groups].sort((a, b) => a.id.localeCompare(b.id));
  const parent = document.querySelector("#sysGroupParent");
  const selected = parent.value;
  parent.innerHTML = '<option value="">상위 그룹 선택</option>' + groups.map((group) => `<option value="${esc(group.id)}"${group.id === selected ? " selected" : ""}>${esc(group.id)}</option>`).join("");
  document.querySelector("#sysGroupBody").innerHTML = groups.map((group) => `<tr><td>${esc(sysParent(group.id) ?? "최상위")}</td><td class="mono">${esc(group.id)}</td><td>${esc(group.name)}</td><td><input class="sys-input" value="${esc(group.description ?? "")}" data-sys-group-desc="${esc(group.id)}" aria-label="${esc(group.name)} 그룹 설명" maxlength="200" placeholder="그룹 설명 입력" /></td><td><button type="button" class="sys-icon-button" data-sys-group-delete="${esc(group.id)}" aria-label="${esc(group.name)} 그룹 삭제">${SYS_ICON_DELETE}</button></td></tr>`).join("");
  renderSysGroupHint();
}
/** 추가될 그룹코드 안내와 그룹 추가 버튼 상태 @returns {void} */
function renderSysGroupHint() {
  const parent = document.querySelector("#sysGroupParent").value;
  const code = document.querySelector("#sysGroupCode").value;
  const name = document.querySelector("#sysGroupName").value.trim();
  const invalid = code && !SYS_CODE_PATTERN.test(code);
  document.querySelector("#sysGroupHint").innerHTML = invalid ? '<span class="sys-invalid">영문 대문자로 시작하고 대문자·숫자·밑줄(_)만 쓸 수 있습니다.</span>' : `추가될 그룹코드: <code>${code ? esc(parent ? `${parent}.${code}` : code) : "-"}</code>${parent ? "" : " (상위 그룹을 고르지 않으면 최상위 그룹 = 화면 탭)"}`;
  document.querySelector("#sysGroupAdd").disabled = !code || invalid || !name;
}
document.querySelector("#sysGroupParent").addEventListener("change", renderSysGroupHint);
document.querySelector("#sysGroupCode").addEventListener("input", (event) => { event.target.value = event.target.value.toUpperCase(); renderSysGroupHint(); });
document.querySelector("#sysGroupName").addEventListener("input", renderSysGroupHint);
document.querySelector("#sysGroupForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const parent = document.querySelector("#sysGroupParent").value;
  const code = document.querySelector("#sysGroupCode").value;
  const id = parent ? `${parent}.${code}` : code;
  if (!SYS_CODE_PATTERN.test(code) || !document.querySelector("#sysGroupName").value.trim()) return;
  if (sysStore.groups.some((group) => group.id === id)) { sysToast("이미 같은 코드의 그룹이 있습니다.", true); return; }
  sysStore.groups.push({ id, name:document.querySelector("#sysGroupName").value.trim(), description:document.querySelector("#sysGroupDesc").value.trim() || null });
  ["#sysGroupCode","#sysGroupName","#sysGroupDesc"].forEach((selector) => { document.querySelector(selector).value = ""; });
  writeSysStore(); renderSys(); sysToast("그룹을 추가했습니다.");
});
document.querySelector("#sysGroupBody").addEventListener("change", (event) => {
  const input = event.target.closest("[data-sys-group-desc]");
  if (!input) return;
  const group = sysStore.groups.find((item) => item.id === input.dataset.sysGroupDesc);
  if ((group.description ?? "") === input.value.trim()) return;
  group.description = input.value.trim() || null;
  writeSysStore(); sysToast("그룹 설명을 저장했습니다.");
});
document.querySelector("#sysGroupBody").addEventListener("click", (event) => {
  const button = event.target.closest("[data-sys-group-delete]");
  if (button) openSysConfirm("group", sysStore.groups.find((group) => group.id === button.dataset.sysGroupDelete));
});

/* 목록·탭·이력 이벤트 */
document.querySelector("#sysTabs").addEventListener("click", (event) => { const tab = event.target.closest("[data-sys-tab]"); if (!tab) return; sysView.tab = tab.dataset.sysTab; renderSys(); });
document.querySelector("#sysSearch").addEventListener("input", (event) => { sysView.query = event.target.value; renderSysSections(); });
const sysSections = document.querySelector("#sysSections");
sysSections.addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-sys-toggle]");
  if (toggle) { const id = toggle.dataset.sysToggle; if (sysView.collapsed.has(id)) sysView.collapsed.delete(id); else sysView.collapsed.add(id); renderSysSections(); return; }
  const edit = event.target.closest("[data-sys-edit]");
  if (edit) { openSysSettingModal(sysStore.settings.find((setting) => setting.key === edit.dataset.sysEdit)); return; }
  const remove = event.target.closest("[data-sys-delete]");
  if (remove) { openSysConfirm("setting", sysStore.settings.find((setting) => setting.key === remove.dataset.sysDelete)); return; }
  const revert = event.target.closest("[data-sys-revert]");
  if (revert) { delete sysView.drafts[revert.dataset.sysRevert]; renderSysSections(); return; }
  const toggleValue = event.target.closest("[data-sys-bool]");
  if (toggleValue) { const key = toggleValue.dataset.sysBool; const current = sysView.drafts[key] ?? sysStore.settings.find((setting) => setting.key === key).value ?? "false"; sysView.drafts[key] = current === "true" ? "false" : "true"; renderSysSections(); }
});
sysSections.addEventListener("change", (event) => {
  const check = event.target.closest("input[data-sys-check]");
  if (check) { sysView.drafts[check.dataset.sysCheck] = sysCheckedValue(sysSections, check.dataset.sysCheck); renderSysSections(); return; }
  const input = event.target.closest("select[data-sys-value], input[type=radio][data-sys-value]");
  if (!input) return;
  sysView.drafts[input.dataset.sysValue] = input.value;
  renderSysSections();
});
sysSections.addEventListener("input", (event) => {
  const input = event.target.closest("input[type=text][data-sys-value], input[type=number][data-sys-value]");
  if (!input) return;
  sysView.drafts[input.dataset.sysValue] = input.value;
  // 입력 중 포커스를 잃지 않도록 해당 행 표시만 갱신한다.
  const setting = sysStore.settings.find((item) => item.key === input.dataset.sysValue);
  const error = sysValidate(setting, input.value);
  input.classList.toggle("invalid", Boolean(error));
  if (input.nextElementSibling?.classList.contains("sys-invalid")) input.nextElementSibling.remove();
  if (error) input.insertAdjacentHTML("afterend", `<small class="sys-invalid">${esc(error)}</small>`);
  syncSysRowDirty(input.closest(".sys-row"), setting, input.value !== (setting.value ?? ""));
  renderSysSaveButton();
});
document.querySelector("#sysSave").addEventListener("click", () => {
  const changes = sysChanges();
  if (changes.some((change) => sysValidate(sysStore.settings.find((setting) => setting.key === change.key), change.value))) return;
  changes.forEach((change) => { const setting = sysStore.settings.find((item) => item.key === change.key); const prev = setting.value; setting.value = change.value || null; if (prev !== setting.value) sysLog("U", setting, prev); });
  sysView.drafts = {}; writeSysStore(); renderSys(); sysToast("저장했습니다.");
});
document.querySelector("#sysAddSetting").addEventListener("click", () => openSysSettingModal());
document.querySelector("#sysOpenGroups").addEventListener("click", () => { ["#sysGroupCode","#sysGroupName","#sysGroupDesc"].forEach((selector) => { document.querySelector(selector).value = ""; }); document.querySelector("#sysGroupParent").value = ""; sysModal("#sysGroupModal"); renderSysGroupTable(); });
document.querySelectorAll("[data-sys-close]").forEach((button) => button.addEventListener("click", () => sysModal(null)));
["#sysSettingModal","#sysGroupModal"].forEach((selector) => document.querySelector(selector).addEventListener("click", (event) => { if (event.target.id === selector.slice(1)) sysModal(null); }));
document.querySelector("[data-sys-confirm-cancel]").addEventListener("click", sysCloseConfirm);
document.querySelector("#sysConfirmModal").addEventListener("click", (event) => { if (event.target.id === "sysConfirmModal") sysCloseConfirm(); });
document.querySelector("#sysConfirmOk").addEventListener("click", () => {
  const { kind, target } = sysView.confirm;
  if (kind === "group") {
    if (sysStore.groups.some((group) => group.id.startsWith(`${target.id}.`)) || sysStore.settings.some((setting) => setting.groupId === target.id || setting.subGroupId === target.id)) { document.querySelector("#sysConfirmError").textContent = "사용 중이라 삭제할 수 없습니다. 하위 그룹이나 설정을 먼저 삭제하세요."; return; }
    sysStore.groups = sysStore.groups.filter((group) => group.id !== target.id);
  } else {
    sysStore.settings = sysStore.settings.filter((setting) => setting.key !== target.key);
    delete sysView.drafts[target.key];
    sysLog("D", target, target.value);
  }
  writeSysStore(); sysCloseConfirm(); renderSys(); sysToast(kind === "group" ? "그룹을 삭제했습니다." : "설정을 삭제했습니다.");
});
document.querySelector("#sysHistDate").addEventListener("change", (event) => { sysView.hist = { ...sysView.hist, date:event.target.value || null, page:1 }; renderSysHistory(); });
document.querySelector("#sysHistDateClear").addEventListener("click", () => { sysView.hist = { ...sysView.hist, date:null, page:1 }; renderSysHistory(); });
document.querySelector("#sysHistGroup").addEventListener("change", (event) => { sysView.hist = { ...sysView.hist, groupId:event.target.value, page:1 }; renderSysHistory(); });
document.querySelector("#sysHistKey").addEventListener("input", (event) => { sysView.hist = { ...sysView.hist, key:event.target.value, page:1 }; renderSysHistory(); });
document.querySelector("#sysHistReset").addEventListener("click", () => { sysView.hist = { date:kstToday(), groupId:"", key:"", page:1 }; renderSysHistory(); });
document.querySelector("#sysHistPages").addEventListener("click", (event) => { const button = event.target.closest("[data-sys-page]"); if (!button || button.disabled) return; sysView.hist = { ...sysView.hist, page:Number(button.dataset.sysPage) }; renderSysHistory(); });
renderSys();

/* ───────── 회원가입 · 가입 승인 · 내 정보 (화면 기획용 목업: 실제 인증·발송·저장 없음) ───────── */
const ACCOUNT_STORE_KEY = "prototype-account-v1";
/** 데모 학원 코드 → 학원명 */
const ACADEMY_CODES = { RAON:"라온 과학학원", BRIDGE:"브릿지 사이언스" };
const CLASS_OPTIONS = ["중3 화학 심화","고1 통합과학 A","고2 화학 I"];
/** 알림 받는 방법. paid: 학원이 유료 발송을 연결해야 실제로 받을 수 있음 */
const NOTIFY_METHODS = [
  { id:"email", icon:"✉", name:"이메일", desc:"채점 결과·공지를 메일로 받아요", chip:"무료" },
  { id:"push", icon:"◉", name:"앱 푸시", desc:"이 기기 브라우저 알림으로 바로 받아요", chip:"무료" },
  { id:"sms", icon:"✆", name:"문자 메시지", desc:"휴대폰 문자로 받아요", chip:"준비 중", paid:true },
  { id:"kakao", icon:"TALK", name:"카카오톡", desc:"카카오톡 알림톡으로 받아요", chip:"준비 중", paid:true }
];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^01[016789]-?\d{3,4}-?\d{4}$/;
/** 역할별 내 정보 데모 계정 */
const ACCOUNT_PROFILES = {
  student:{ name:"유재혁", role:"학생", academy:"라온 과학학원", email:"jaehyuk@student.kr", phone:"01012345678", classLabel:"클래스", className:"고2 화학 I", joined:"2026-03-02" },
  admin:{ name:"전선생", role:"선생님 · 학원 관리자", academy:"라온 과학학원", email:"jeon@raon.kr", phone:"01098765432", classLabel:"담당 클래스", className:"고2 화학 I 외 2개", joined:"2025-12-15" }
};

/**
 * 기본 알림 설정(아무것도 고르지 않은 상태).
 * @returns {{methods: string[], email: string, pushAllowed: boolean, sms: {useVerified: boolean, phone: string}, kakao: {useVerified: boolean, phone: string}}}
 */
function defaultNotify() {
  return { methods:["email"], email:ACCOUNT_PROFILES.student.email, pushAllowed:false, sms:{ useVerified:true, phone:"" }, kakao:{ useVerified:true, phone:"" } };
}
/**
 * 저장된 목업 상태(가입 신청 목록·알림 설정)를 읽는다. 없거나 읽지 못하면 기본값.
 * @returns {{signups: object[], notify: object}}
 */
function readAccountStore() {
  const seed = {
    signups:[
      { id:1, type:"student", name:"이서연", grade:"중3", academy:"라온 과학학원", email:"seoyeon@student.kr", phone:"01023456789", requestedAt:"2026-11-20 18:42", status:"pending" },
      { id:2, type:"student", name:"최민준", grade:"고1", academy:"라온 과학학원", email:"minjun@student.kr", phone:"01034567890", requestedAt:"2026-11-21 09:15", status:"pending" },
      { id:3, type:"student", name:"정하은", grade:"고2", academy:"라온 과학학원", email:"haeun@student.kr", phone:"01045678901", requestedAt:"2026-11-21 10:03", status:"pending" }
    ],
    notify:defaultNotify()
  };
  try {
    const saved = JSON.parse(localStorage.getItem(ACCOUNT_STORE_KEY));
    return saved && Array.isArray(saved.signups) ? { signups:saved.signups, notify:{ ...seed.notify, ...saved.notify } } : seed;
  } catch { return seed; }
}
const accountStore = readAccountStore();
/** @returns {void} */
function writeAccountStore() {
  try { localStorage.setItem(ACCOUNT_STORE_KEY, JSON.stringify(accountStore)); } catch { /* 저장소를 쓸 수 없으면 새로고침 시 초기화된다 */ }
}
/**
 * 휴대폰 번호를 010-1234-5678 형태로 바꾼다.
 * @param {string} phone - 숫자만 또는 하이픈 포함 번호
 * @returns {string}
 */
function formatPhone(phone) {
  const digits = String(phone).replaceAll(/\D/g, "");
  return digits.length === 11 ? `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7)}` : digits.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1-$2-$3");
}
/**
 * 휴대폰 번호 가운데를 가린다. (010-****-5678)
 * @param {string} phone - 휴대폰 번호
 * @returns {string}
 */
function maskPhone(phone) {
  const [head,,tail] = formatPhone(phone).split("-");
  return tail ? `${head}-****-${tail}` : formatPhone(phone);
}
/**
 * HTML에 넣을 문자열의 특수 문자를 바꾼다.
 * @param {string} text - 원본 문자열
 * @returns {string}
 */
function escapeHtml(text) {
  return String(text ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}
/** @returns {string} 지금 시각 "YYYY-MM-DD HH:MM" */
function nowStamp() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/* ── 로그인 · 회원가입 화면 ── */
const authScreen = document.querySelector("#authScreen");
const signupDraft = { type:"student", academy:null, name:"", grade:"", email:"", phone:"", verified:false };
let verifyTimer;
/**
 * 로그인/회원가입 화면을 연다.
 * @param {"login"|"signup"} view - 보여줄 화면
 * @returns {void}
 */
function openAuth(view) {
  authScreen.hidden = false;
  document.body.classList.add("auth-open");
  authScreen.querySelectorAll("[data-auth-view]").forEach((card) => { card.hidden = card.dataset.authView !== view; });
  if (view === "signup") showSignupStep(1);
  authScreen.querySelector(".auth-main").scrollTo?.({ top:0 });
}
/** @returns {void} 로그인 화면을 닫고 둘러보던 화면으로 돌아간다. */
function closeAuth() {
  authScreen.hidden = true;
  document.body.classList.remove("auth-open");
  clearInterval(verifyTimer);
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
}
/**
 * 회원가입 단계를 바꾼다.
 * @param {number} step - 1 기본 정보, 2 본인인증, 3 승인 대기
 * @returns {void}
 */
function showSignupStep(step) {
  authScreen.querySelectorAll("[data-signup-step]").forEach((panel) => { panel.hidden = Number(panel.dataset.signupStep) !== step; });
  document.querySelectorAll("#signupSteps [data-step]").forEach((item) => {
    const index = Number(item.dataset.step);
    item.classList.toggle("active", index === step);
    item.classList.toggle("done", index < step);
  });
}
/** @returns {void} 학생만 입력하는 항목(학년·보호자 안내)을 가입 유형에 맞게 보인다. */
function syncSignupType() {
  signupDraft.type = authScreen.querySelector('[name="signupType"]:checked').value;
  authScreen.querySelectorAll("[data-student-field]").forEach((field) => { field.hidden = signupDraft.type !== "student"; });
}
/** @returns {void} 학원 코드를 확인해 학원명을 보여준다. */
function checkAcademyCode() {
  const code = document.querySelector("#signupAcademyCode").value.trim().toUpperCase();
  const result = document.querySelector("#signupAcademyResult");
  signupDraft.academy = ACADEMY_CODES[code] ?? null;
  result.classList.toggle("ok", Boolean(signupDraft.academy));
  result.classList.toggle("bad", Boolean(code) && !signupDraft.academy);
  if (signupDraft.academy) result.textContent = `✓ ${signupDraft.academy}`;
  else result.textContent = code ? "학원 코드를 찾을 수 없습니다. (데모: RAON, BRIDGE)" : "학원에서 받은 코드를 입력하세요.";
}
document.querySelectorAll("[data-auth-go]").forEach((button) => button.addEventListener("click", () => openAuth(button.dataset.authGo)));
document.querySelectorAll("[data-auth-close]").forEach((button) => button.addEventListener("click", closeAuth));
/* 계정 메뉴(사이드바 ⋯): 내 정보 · 로그아웃. 사이드바 밖으로 띄우려고 fixed로 위치를 잡는다. */
const profileMenu = document.querySelector("#profileMenu");
const profileMenuToggle = document.querySelector("#profileMenuToggle");
/**
 * 계정 메뉴를 열거나 닫는다.
 * @param {boolean} open - 열지 여부
 * @returns {void}
 */
function setProfileMenu(open) {
  profileMenu.hidden = !open;
  profileMenuToggle.setAttribute("aria-expanded", String(open));
  if (!open) return;
  const rect = profileMenuToggle.getBoundingClientRect();
  // 펼친 사이드바(238px): 버튼 위쪽 / 접힌 사이드바(68px): 사이드바 오른쪽. 접히는 애니메이션 중에도 맞도록 폭은 상수로 둔다.
  const collapsed = document.body.classList.contains("sidebar-collapsed") || globalThis.matchMedia("(max-width: 820px)").matches;
  profileMenu.style.left = `${collapsed ? 76 : 12}px`;
  profileMenu.style.bottom = `${window.innerHeight - (collapsed ? rect.bottom : rect.top - 6)}px`;
  profileMenu.style.width = collapsed ? "180px" : "214px";
}
profileMenuToggle.addEventListener("click", (event) => { event.stopPropagation(); setProfileMenu(profileMenu.hidden); });
profileMenu.addEventListener("click", (event) => { if (event.target.closest("button")) setProfileMenu(false); });
document.addEventListener("click", (event) => { if (!profileMenu.hidden && !profileMenu.contains(event.target)) setProfileMenu(false); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !profileMenu.hidden) { setProfileMenu(false); profileMenuToggle.focus(); } });
window.addEventListener("resize", () => setProfileMenu(false));
// 로그아웃은 어느 화면에서든: 사이드바 계정 메뉴, 모바일 상단 버튼
document.querySelectorAll("[data-logout]").forEach((button) => button.addEventListener("click", () => openAuth("login")));
authScreen.querySelectorAll('[name="signupType"]').forEach((radio) => radio.addEventListener("change", syncSignupType));
document.querySelector("#signupAcademyCheck").addEventListener("click", checkAcademyCode);
document.querySelector("#signupAcademyCode").addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); checkAcademyCode(); } });
document.querySelector("#signupAcademyCode").addEventListener("input", () => { signupDraft.academy = null; document.querySelector("#signupAcademyResult").classList.remove("ok","bad"); });
document.querySelector("#signupAgreeAll").addEventListener("change", (event) => { authScreen.querySelectorAll("[data-agree]").forEach((box) => { box.checked = event.target.checked; }); });
authScreen.querySelectorAll("[data-agree]").forEach((box) => box.addEventListener("change", () => { document.querySelector("#signupAgreeAll").checked = [...authScreen.querySelectorAll("[data-agree]")].every((item) => item.checked); }));

document.querySelector("#loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.querySelector("#loginEmail").value.trim().toLowerCase();
  const error = document.querySelector("#loginError");
  if (!EMAIL_PATTERN.test(email) || !document.querySelector("#loginPassword").value) { error.textContent = "이메일과 비밀번호를 입력해주세요."; return; }
  const signup = accountStore.signups.find((item) => item.email === email);
  if (signup?.status === "pending") { error.textContent = `${signup.academy} 선생님의 가입 승인을 기다리고 있습니다. 승인되면 이메일로 알려드려요.`; return; }
  if (signup?.status === "rejected") { error.textContent = `가입이 거절되었습니다. (${signup.rejectReason}) 학원에 문의해주세요.`; return; }
  error.textContent = "";
  closeAuth();
  let nextRole = role;
  if (signup?.status === "approved") nextRole = signup.type === "teacher" ? "admin" : "student";
  applyRole(nextRole);
  sysToast("로그인했습니다. (데모)");
});

document.querySelector("#signupInfoForm").addEventListener("submit", (event) => {
  event.preventDefault();
  syncSignupType();
  const value = (id) => document.querySelector(`#${id}`).value.trim();
  const password = document.querySelector("#signupPassword").value;
  const email = value("signupEmail").toLowerCase();
  let message = "";
  if (!signupDraft.academy) message = "학원 코드를 입력하고 확인을 눌러주세요.";
  else if (!value("signupName")) message = "이름을 입력해주세요.";
  else if (signupDraft.type === "student" && !value("signupGrade")) message = "학년을 선택해주세요.";
  else if (!EMAIL_PATTERN.test(email)) message = "이메일 형식을 확인해주세요.";
  else if (accountStore.signups.some((item) => item.email === email && item.status !== "rejected")) message = "이미 가입 신청한 이메일입니다.";
  else if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password)) message = "비밀번호는 8자 이상, 영문과 숫자를 섞어주세요.";
  else if (password !== document.querySelector("#signupPasswordConfirm").value) message = "비밀번호 확인이 일치하지 않습니다.";
  else if (![...authScreen.querySelectorAll("[data-agree]")].every((box) => box.checked)) message = "필수 약관에 동의해주세요.";
  document.querySelector("#signupInfoError").textContent = message;
  if (message) return;
  Object.assign(signupDraft, { name:value("signupName"), grade:signupDraft.type === "student" ? value("signupGrade") : "", email });
  showSignupStep(2);
});
document.querySelector("[data-signup-back]").addEventListener("click", () => showSignupStep(1));

/** @returns {void} 인증번호 입력 제한 시간(3분)을 센다. */
function startVerifyTimer() {
  clearInterval(verifyTimer);
  let left = 180;
  const timer = document.querySelector("#verifyTimer");
  const tick = () => {
    timer.textContent = `${String(Math.floor(left / 60)).padStart(2,"0")}:${String(left % 60).padStart(2,"0")}`;
    timer.classList.toggle("expired", left === 0);
    if (left === 0) clearInterval(verifyTimer);
    left -= 1;
  };
  tick();
  verifyTimer = setInterval(tick, 1000);
}
document.querySelector("#verifySend").addEventListener("click", (event) => {
  const phone = document.querySelector("#verifyPhone").value.trim();
  const error = document.querySelector("#signupVerifyError");
  if (!PHONE_PATTERN.test(phone)) { error.textContent = "휴대폰 번호를 확인해주세요."; return; }
  error.textContent = "";
  signupDraft.phone = formatPhone(phone);
  signupDraft.verified = false;
  document.querySelector("#verifyPhone").value = signupDraft.phone;
  document.querySelector("#verifyCodeField").hidden = false;
  document.querySelector("#verifyDone").hidden = true;
  document.querySelector("#signupSubmit").disabled = true;
  document.querySelector("#verifyCode").value = "";
  event.currentTarget.textContent = "다시 받기";
  startVerifyTimer();
  sysToast("인증번호를 보냈습니다. (데모)");
});
document.querySelector("#verifyConfirm").addEventListener("click", () => {
  const error = document.querySelector("#signupVerifyError");
  if (document.querySelector("#verifyTimer").classList.contains("expired")) { error.textContent = "입력 시간이 지났습니다. 인증번호를 다시 받아주세요."; return; }
  if (!/^\d{6}$/.test(document.querySelector("#verifyCode").value)) { error.textContent = "인증번호 6자리를 입력해주세요."; return; }
  clearInterval(verifyTimer);
  error.textContent = "";
  signupDraft.verified = true;
  document.querySelector("#verifyCodeField").hidden = true;
  document.querySelector("#verifyDone").hidden = false;
  document.querySelector("#verifyDoneText").textContent = `${signupDraft.name} · ${signupDraft.phone}`;
  document.querySelector("#signupSubmit").disabled = false;
});
document.querySelector("#verifyPhone").addEventListener("input", () => {
  if (!signupDraft.verified) return;
  signupDraft.verified = false;
  document.querySelector("#verifyDone").hidden = true;
  document.querySelector("#signupSubmit").disabled = true;
});
document.querySelector("#signupVerifyForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!signupDraft.verified) return;
  const signup = { id:Date.now(), type:signupDraft.type, name:signupDraft.name, grade:signupDraft.grade, academy:signupDraft.academy, email:signupDraft.email, phone:signupDraft.phone, requestedAt:nowStamp(), status:"pending" };
  accountStore.signups.push(signup);
  writeAccountStore();
  renderApprovals();
  const teacher = signup.type === "teacher";
  document.querySelector("#signupDoneText").textContent = teacher
    ? `${signup.academy} 관리자가 승인하면 가입이 완료됩니다. 승인되면 이메일로 알려드려요.`
    : `${signup.academy} 선생님이 승인하면 가입이 완료됩니다. 승인되면 이메일로 알려드려요.`;
  document.querySelector("#signupWaitLabel").textContent = teacher ? "학원 관리자 승인 대기" : "선생님 승인 대기";
  document.querySelector("#signupSummary").innerHTML = [["이름",signup.name],["학원",signup.academy],["가입 유형",teacher ? "선생님" : `학생 · ${signup.grade}`],["이메일",signup.email],["휴대폰",`${maskPhone(signup.phone)} (인증 완료)`]].map(([term,detail]) => `<div><dt>${term}</dt><dd>${escapeHtml(detail)}</dd></div>`).join("");
  document.querySelector("#signupInfoForm").reset();
  document.querySelector("#signupVerifyForm").reset();
  document.querySelector("#verifyCodeField").hidden = true;
  document.querySelector("#verifyDone").hidden = true;
  document.querySelector("#verifySend").textContent = "인증번호 받기";
  document.querySelector("#signupSubmit").disabled = true;
  Object.assign(signupDraft, { type:"student", academy:null, phone:"", verified:false });
  checkAcademyCode(); syncSignupType();
  showSignupStep(3);
});

/* ── 학생 관리 › 가입 승인 ── */
let rejectTargetId = null;
/** @returns {object[]} 승인을 기다리는 학생 가입 신청 */
function pendingStudentSignups() { return accountStore.signups.filter((item) => item.type === "student" && item.status === "pending"); }
/** @returns {void} 가입 승인 표와 탭의 대기 건수를 그린다. */
function renderApprovals() {
  const pending = pendingStudentSignups();
  const count = document.querySelector("#approvalCount");
  count.textContent = pending.length;
  count.hidden = pending.length === 0;
  document.querySelector("#approvalEmpty").hidden = pending.length > 0;
  document.querySelector("#approvalBody").innerHTML = pending.map((item) => `<tr data-signup-id="${item.id}"><td class="nowrap">${escapeHtml(item.requestedAt)}</td><td><strong>${escapeHtml(item.name)}</strong></td><td>${escapeHtml(item.grade)}</td><td>${escapeHtml(item.email)}</td><td class="nowrap">${maskPhone(item.phone)}</td><td><span class="verify-badge">✓ 완료</span></td><td><select data-approval-class aria-label="${escapeHtml(item.name)} 클래스 배정"><option value="">클래스 선택</option>${CLASS_OPTIONS.map((name) => `<option${name.startsWith(item.grade) ? " selected" : ""}>${name}</option>`).join("")}</select></td><td class="nowrap"><button class="primary-button small" type="button" data-approve>승인</button> <button class="outline-button small" type="button" data-reject>거절</button></td></tr>`).join("");
}
/**
 * 학생 관리 탭(학생 목록/가입 승인)을 바꾼다.
 * @param {"list"|"approvals"} tab - 보여줄 탭
 * @returns {void}
 */
function showStudentTab(tab) {
  document.querySelectorAll("[data-student-tab]").forEach((button) => button.setAttribute("aria-selected", String(button.dataset.studentTab === tab)));
  document.querySelectorAll("[data-student-panel]").forEach((panel) => { panel.hidden = panel.dataset.studentPanel !== tab; });
}
document.querySelectorAll("[data-student-tab]").forEach((button) => button.addEventListener("click", () => showStudentTab(button.dataset.studentTab)));
document.querySelector("#approvalBody").addEventListener("click", (event) => {
  const row = event.target.closest("[data-signup-id]");
  if (!row) return;
  const signup = accountStore.signups.find((item) => item.id === Number(row.dataset.signupId));
  if (event.target.closest("[data-approve]")) {
    const className = row.querySelector("[data-approval-class]").value;
    if (!className) { sysToast("클래스를 먼저 배정해주세요.", true); return; }
    Object.assign(signup, { status:"approved", className, decidedAt:nowStamp() });
    writeAccountStore(); renderApprovals(); renderStaticCards();
    sysToast(`${signup.name} 학생의 가입을 승인했습니다. (${className})`);
  } else if (event.target.closest("[data-reject]")) {
    rejectTargetId = signup.id;
    document.querySelector("#rejectText").textContent = `${signup.name} (${signup.grade} · ${signup.email}) 학생의 가입 신청을 거절합니다.`;
    document.querySelector("#rejectForm").reset();
    document.querySelector("#rejectEtcLabel").hidden = true;
    document.querySelector("#rejectModal").classList.remove("hidden");
  }
});
/** @returns {void} */
function closeRejectModal() { document.querySelector("#rejectModal").classList.add("hidden"); rejectTargetId = null; }
document.querySelectorAll("[data-reject-close]").forEach((button) => button.addEventListener("click", closeRejectModal));
document.querySelector("#rejectReason").addEventListener("change", (event) => { document.querySelector("#rejectEtcLabel").hidden = event.target.value !== "etc"; });
document.querySelector("#rejectForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const signup = accountStore.signups.find((item) => item.id === rejectTargetId);
  if (!signup) return;
  const select = document.querySelector("#rejectReason");
  const reason = select.value === "etc" ? document.querySelector("#rejectEtc").value.trim() : select.value;
  if (!reason) { sysToast("거절 사유를 입력해주세요.", true); return; }
  Object.assign(signup, { status:"rejected", rejectReason:reason, decidedAt:nowStamp() });
  writeAccountStore(); renderApprovals(); closeRejectModal();
  sysToast(`${signup.name} 학생의 가입을 거절했습니다.`);
});

/* ── 내 정보 ── */
let notifyDraft = structuredClone(accountStore.notify);
/** @returns {boolean} 알림 설정을 고친 뒤 저장하지 않았는지 */
function notifyDirty() { return JSON.stringify(notifyDraft) !== JSON.stringify(accountStore.notify); }
/** @returns {void} 저장·되돌리기 버튼과 안내 문구를 지금 상태에 맞춘다. */
function syncNotifyFooter() {
  const dirty = notifyDirty();
  document.querySelector("#notifySave").disabled = !dirty;
  document.querySelector("#notifyReset").disabled = !dirty;
  const hint = document.querySelector("#notifyHint");
  if (notifyDraft.methods.length === 0) hint.textContent = "고른 방법이 없으면 채점 결과와 학원 공지를 알림으로 받을 수 없어요.";
  else hint.textContent = dirty ? "바꾼 내용을 저장해주세요." : "";
  hint.classList.toggle("warn", notifyDraft.methods.length === 0);
}
/**
 * 문자·카카오톡 받을 번호 입력 (본인인증한 번호 / 다른 번호).
 * @param {"sms"|"kakao"} id - 알림 방법
 * @param {string} verifiedPhone - 본인인증한 번호
 * @returns {string} HTML
 */
function notifyPhoneFields(id, verifiedPhone) {
  const target = notifyDraft[id];
  return `<div class="notify-radios"><label><input type="radio" name="${id}Phone" value="verified" data-notify-phone-mode="${id}"${target.useVerified ? " checked" : ""} /> 본인인증한 번호 <b>${maskPhone(verifiedPhone)}</b></label><label><input type="radio" name="${id}Phone" value="other" data-notify-phone-mode="${id}"${target.useVerified ? "" : " checked"} /> 다른 번호</label></div>${target.useVerified ? "" : `<input type="tel" inputmode="numeric" class="notify-input" data-notify-phone="${id}" value="${escapeHtml(target.phone)}" placeholder="010-0000-0000" aria-label="받을 휴대폰 번호" />`}`;
}
/**
 * 고른 알림 방법 하나의 입력 영역.
 * @param {object} method - NOTIFY_METHODS 항목
 * @returns {string} HTML
 */
function notifyDetail(method) {
  const profile = ACCOUNT_PROFILES.student;
  let body = "";
  if (method.id === "email") {
    body = `<label class="notify-field">받을 이메일<input type="email" class="notify-input" data-notify-email value="${escapeHtml(notifyDraft.email)}" placeholder="example@email.com" /></label><small>계정 이메일(${profile.email})과 다른 주소로도 받을 수 있어요.</small>`;
  } else if (method.id === "push") {
    body = notifyDraft.pushAllowed
      ? `<div class="push-state on"><span><strong>이 기기에서 받는 중</strong><small>Chrome · Windows</small></span><button class="text-button" type="button" data-push-toggle>끄기</button></div>`
      : `<div class="push-state"><span><strong>이 기기는 아직 알림이 꺼져 있어요</strong><small>버튼을 누르면 브라우저가 알림 허용을 물어봐요.</small></span><button class="secondary-button" type="button" data-push-toggle>이 기기에서 알림 허용</button></div>`;
    body += "<small>아이폰은 Safari에서 ‘홈 화면에 추가’한 뒤 알림을 허용할 수 있어요.</small>";
  } else {
    body = `<div class="notify-field">받을 휴대폰 번호${notifyPhoneFields(method.id, profile.phone)}</div><small>${method.id === "sms" ? "학원에서 문자 발송을 연결하면 받을 수 있어요." : "학원에서 카카오 알림톡을 연결하면 받을 수 있어요."} (유료 서비스 · 준비 중)</small>`;
  }
  return `<section class="notify-detail" data-notify-detail="${method.id}"><h4><span class="notify-icon ${method.id}">${method.icon}</span>${method.name}</h4>${body}</section>`;
}
/** @returns {void} 알림 방법 선택 칸과 고른 방법별 입력 영역을 그린다. */
function renderNotify() {
  document.querySelector("#notifyOptions").innerHTML = NOTIFY_METHODS.map((method) => `<label class="notify-option${notifyDraft.methods.includes(method.id) ? " checked" : ""}"><input type="checkbox" value="${method.id}" data-notify-method${notifyDraft.methods.includes(method.id) ? " checked" : ""} /><span class="notify-icon ${method.id}">${method.icon}</span><span class="notify-text"><strong>${method.name}</strong><small>${method.desc}</small></span><em class="notify-chip${method.paid ? " paid" : ""}">${method.chip}</em><i class="notify-check" aria-hidden="true"></i></label>`).join("");
  const selected = NOTIFY_METHODS.filter((method) => notifyDraft.methods.includes(method.id));
  document.querySelector("#notifyDetails").innerHTML = selected.length ? selected.map(notifyDetail).join("") : `<p class="notify-empty">위에서 알림 받을 방법을 골라주세요.</p>`;
  syncNotifyFooter();
}
/** @returns {void} 지금 역할(학생/선생님)의 내 정보를 그린다. */
function renderMyInfo() {
  const student = role === "student";
  const profile = ACCOUNT_PROFILES[student ? "student" : "admin"];
  document.querySelector("#myInfoAvatar").textContent = profile.name[0];
  document.querySelector("#myInfoName").textContent = profile.name;
  document.querySelector("#myInfoRole").textContent = profile.role;
  document.querySelector("#myInfoAcademy").textContent = profile.academy;
  document.querySelector("#myInfoEmail").textContent = profile.email;
  document.querySelector("#myInfoPhone").textContent = maskPhone(profile.phone);
  document.querySelector("#myInfoClassLabel").textContent = profile.classLabel;
  document.querySelector("#myInfoClass").textContent = profile.className;
  document.querySelector("#myInfoJoined").textContent = profile.joined;
  document.querySelector("#pageSubtitle").textContent = student ? "계정 정보와 알림 받는 방법을 관리합니다." : "계정 정보와 비밀번호를 관리합니다.";
  if (student) renderNotify();
}
document.querySelector("#notifyOptions").addEventListener("change", (event) => {
  const box = event.target.closest("[data-notify-method]");
  if (!box) return;
  const methods = new Set(notifyDraft.methods);
  if (box.checked) methods.add(box.value); else methods.delete(box.value);
  notifyDraft.methods = NOTIFY_METHODS.map((method) => method.id).filter((id) => methods.has(id));
  renderNotify();
});
document.querySelector("#notifyDetails").addEventListener("input", (event) => {
  if (event.target.matches("[data-notify-email]")) notifyDraft.email = event.target.value.trim();
  else if (event.target.matches("[data-notify-phone]")) notifyDraft[event.target.dataset.notifyPhone].phone = event.target.value.trim();
  else return;
  syncNotifyFooter();
});
document.querySelector("#notifyDetails").addEventListener("change", (event) => {
  const radio = event.target.closest("[data-notify-phone-mode]");
  if (!radio) return;
  notifyDraft[radio.dataset.notifyPhoneMode].useVerified = radio.value === "verified";
  renderNotify();
});
document.querySelector("#notifyDetails").addEventListener("click", (event) => {
  if (!event.target.closest("[data-push-toggle]")) return;
  notifyDraft.pushAllowed = !notifyDraft.pushAllowed;
  if (notifyDraft.pushAllowed) sysToast("이 기기에서 알림을 허용했습니다. (데모)");
  renderNotify();
});
document.querySelector("#notifyReset").addEventListener("click", () => { notifyDraft = structuredClone(accountStore.notify); renderNotify(); });
document.querySelector("#notifySave").addEventListener("click", () => {
  const methods = new Set(notifyDraft.methods);
  let message = "";
  if (methods.has("email") && !EMAIL_PATTERN.test(notifyDraft.email)) message = "받을 이메일 주소를 확인해주세요.";
  else if (methods.has("push") && !notifyDraft.pushAllowed) message = "앱 푸시를 받으려면 이 기기에서 알림을 허용해주세요.";
  else if (["sms","kakao"].some((id) => methods.has(id) && !notifyDraft[id].useVerified && !PHONE_PATTERN.test(notifyDraft[id].phone))) message = "받을 휴대폰 번호를 확인해주세요.";
  if (message) { sysToast(message, true); return; }
  ["sms","kakao"].forEach((id) => { if (!notifyDraft[id].useVerified) notifyDraft[id].phone = formatPhone(notifyDraft[id].phone); });
  accountStore.notify = structuredClone(notifyDraft);
  writeAccountStore(); renderNotify();
  sysToast("알림 받는 방법을 저장했습니다.");
});
document.querySelector("#myInfoPhoneChange").addEventListener("click", () => sysToast("번호를 바꾸려면 새 번호로 본인인증을 다시 합니다. (준비 중)"));
document.querySelector("#passwordForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const next = document.querySelector("#pwNext").value;
  let message = "";
  if (!document.querySelector("#pwCurrent").value) message = "현재 비밀번호를 입력해주세요.";
  else if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(next)) message = "새 비밀번호는 8자 이상, 영문과 숫자를 섞어주세요.";
  else if (next !== document.querySelector("#pwConfirm").value) message = "새 비밀번호 확인이 일치하지 않습니다.";
  document.querySelector("#pwError").textContent = message;
  if (message) return;
  event.target.reset();
  sysToast("비밀번호를 변경했습니다. (데모)");
});
syncSignupType();
renderApprovals();

renderRecords(); renderStaticCards(); renderTemplateList(); renderAnswerOverview(); updateHistoryPeriodOptions(); syncOuterTemplatePreview(); setInlineEditMode(false); selectRegion(document.querySelector('#printableTemplate [data-region="1"]'));
renderMcList(); renderMcPreview(); renderMcSummary();
syncRoleToViewport();
// 기획 확인용: 주소 끝에 #login, #signup을 붙이면 해당 화면이 바로 열린다.
if (["#login","#signup"].includes(location.hash)) openAuth(location.hash.slice(1));
