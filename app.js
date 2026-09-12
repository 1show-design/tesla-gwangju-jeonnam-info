const notice = `[테슬라 광주·전남 오너 정보방 운영원칙 안내]

안녕하세요. 모두가 편안하고 안전하게 정보를 나눌 수 있도록 운영원칙을 새로 정비했습니다.

1. 방 안에서는 서로 존댓말을 사용해 주세요.
2. 욕설, 비방, 혐오, 성희롱, 공개 저격과 분란 조장은 금지합니다.
3. 영업, 광고, 리퍼럴, 고객 모집, 대출·보험·투자 권유는 사전 승인 없이는 금지합니다.
4. 개인의 불안을 객관적 위험이나 전체의 불안처럼 확대·전파하거나, 근거 없이 FSD 불안을 조장하는 행위는 금지합니다. 인스타그램·유튜브 등 외부 콘텐츠에는 원출처·게시 시점·전체 맥락·직접 경험 여부와 공유 목적을 함께 적어 주세요. 구체적인 근거가 있는 실제 안전 제보는 환영합니다.
5. 동의 없는 캡처, 실명·연락처·차량번호 공개 및 외부 공유를 금지합니다.
6. 모임은 자율 참여이며 음주운전, 위험운전, 강압적 행동은 즉시 제재합니다.
7. 문제 발생 시 공개 논쟁 대신 운영진에게 개인 메시지로 신고해 주세요.

특히 오토파일럿·FSD 등 운전자 보조기능은 공식 안내와 법규를 우선하고, 운전자가 항상 주행을 감독해야 합니다. 졸음운전, 전방주시 태만, 안전장치 무력화를 권하는 내용은 금지합니다.

대화명은 입장 후 24시간 이내에
지역 / 닉네임 / 차종 / 차량번호 끝 4자리 또는 출고예정
형식으로 변경해 주세요.

경미한 위반은 안내 → 경고 → 참여 제한·퇴장 순으로 처리하며, 사기·협박·스토킹·성희롱·개인정보 유포·악의적 영업은 즉시 퇴장할 수 있습니다.

반복적인 관심 끌기, 도배, 자극적 게시물, 고의적인 논쟁·분란 유도로 방의 목적을 훼손한다고 운영진이 판단한 경우에도 사전 경고 없이 즉시 퇴장할 수 있습니다. 단순한 의견 차이나 근거 있는 비판에는 적용하지 않습니다.

새 정보: TePilot 주행기록과 구글 시트를 활용한 장거리 수퍼차저 경로 설계 안내를 정보실에 추가했습니다. 개인 주소·좌표·API 키는 공개하지 않습니다.

전체 운영원칙과 회원 정보
https://1show-design.github.io/tesla-gwangju-jeonnam-info/`;

const toast = document.querySelector("#toast");
let toastTimer;

async function copyNotice() {
  try {
    await navigator.clipboard.writeText(notice);
    toast.textContent = "카톡 공지문을 복사했습니다.";
  } catch {
    const area = document.createElement("textarea");
    area.value = notice;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    toast.textContent = "카톡 공지문을 복사했습니다.";
  }
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

document.querySelector("#copyNotice").addEventListener("click", copyNotice);
document.querySelector("#copyNoticeMobile").addEventListener("click", copyNotice);

document.querySelectorAll("[data-accordion] details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    document.querySelectorAll("[data-accordion] details").forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});
