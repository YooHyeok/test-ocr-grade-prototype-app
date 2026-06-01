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
const pageTitles = { dashboard:"대시보드", records:"채점 관리", templates:"시험지 관리", students:"학생 관리", categories:"그룹 관리", settings:"설정", "my-papers":"내 시험지" };
const pageSubtitles = {
  dashboard:"",
  records:"학원, 클래스, 카테고리, 학생별로 시험지 원본과 결과를 관리합니다.",
  templates:"시험지 양식을 만들고, 문항별 OCR 인식 영역과 기준 답안을 함께 설정합니다.",
  students:"학원과 클래스별 학생 계정, 최근 성적, 업로드 현황을 관리합니다.",
  categories:"학교급, 과목, 단원을 기준으로 시험지를 체계적으로 분류합니다.",
  settings:"학원 정보와 채점 정책을 관리합니다.",
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
  window.scrollTo({ top:0, behavior:"smooth" });
}
document.addEventListener("click", (event) => {
  const pageButton = event.target.closest("[data-page]");
  if (pageButton) showPage(pageButton.dataset.page);
});

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
  document.querySelector("#studentCards").innerHTML = students.map((record) => { const note = record.status === "검토 필요" ? "검토 필요 1건" : "최근 채점 완료"; return `<article class="manage-card"><span class="avatar">${record.student[0]}</span><div><h3>${record.student}</h3><p>${record.className}</p><small>${note}</small></div><button type="button" data-student-detail="${record.student}">상세 보기</button></article>`; }).join("");
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

function stopCamera() { if (cameraStream) cameraStream.getTracks().forEach((track) => track.stop()); cameraStream = undefined; document.querySelector("#cameraPreview").srcObject = null; }
const uploadModal = document.querySelector("#uploadModal");
document.querySelectorAll("[data-open-upload]").forEach((button) => button.addEventListener("click", () => uploadModal.classList.remove("hidden")));
document.querySelectorAll("[data-close-upload]").forEach((button) => button.addEventListener("click", () => { stopCamera(); uploadModal.classList.add("hidden"); }));
/**
 * 후면 카메라를 연결하고 미리보기를 시작한다. 이미 연결돼 있으면 아무 작업도 하지 않는다.
 * @returns {Promise<void>}
 */
async function startCamera() {
  if (cameraStream) return;
  const badge = document.querySelector("#recognitionBadge strong");
  try { cameraStream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:{ ideal:"environment" } }, audio:false }); const video=document.querySelector("#cameraPreview"); video.srcObject=cameraStream; await video.play(); document.querySelector("#cameraPlaceholder").classList.add("hidden"); badge.textContent="시험지 테두리를 프레임에 맞춰주세요"; document.querySelector("#capturePaper").disabled=false; } catch { badge.textContent="카메라 권한을 확인해주세요"; }
}
document.querySelectorAll("[data-capture-tab]").forEach((tab) => tab.addEventListener("click", () => { document.querySelectorAll("[data-capture-tab]").forEach((item) => item.classList.toggle("active", item === tab)); document.querySelectorAll("[data-capture-panel]").forEach((panel) => panel.classList.toggle("hidden", panel.dataset.capturePanel !== tab.dataset.captureTab)); if (tab.dataset.captureTab === "camera" && mobileQuery.matches) startCamera(); }));
document.querySelector("#startCamera").addEventListener("click", startCamera);
document.querySelector("#capturePaper").addEventListener("click", () => { document.querySelector("#recognitionBadge").classList.add("success"); document.querySelector("#recognitionBadge strong").textContent="인식 성공 · 촬영 준비 완료"; });
document.querySelector("#saveUpload").addEventListener("click", () => { myPapers.unshift({ id:Date.now(), title:"산화 환원 미니테스트", category:"화학 I · 산화 환원", uploaded:"방금 전", date:"2026-06-01", status:"업로드 완료" }); updateHistoryPeriodOptions(); stopCamera(); uploadModal.classList.add("hidden"); showPage("my-papers"); });
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
  return `<div class="print-sheet ${photo ? "print-photo" : ""}"><div class="print-head"><div><strong>${record.paper}</strong><span>${record.category}</span></div><span>${record.student}</span></div><p class="print-sub">다음 문항의 답을 빈칸에 작성하세요.</p>${lines}</div>`;
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
  document.querySelector("#printArea").innerHTML = `<div class="print-sheet"><div class="print-head"><div><strong>${title}</strong><span>시험 카테고리: ${category}${subject ? ` · 과목: ${subject}` : ""}</span></div><span>이름 ____________</span></div><p class="print-sub">다음 문항의 답을 빈칸에 작성하세요.</p>${lines}</div>`;
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
renderRecords(); renderStaticCards(); renderTemplateList(); renderAnswerOverview(); updateHistoryPeriodOptions(); syncOuterTemplatePreview(); setInlineEditMode(false); selectRegion(document.querySelector('#printableTemplate [data-region="1"]'));
syncRoleToViewport();
