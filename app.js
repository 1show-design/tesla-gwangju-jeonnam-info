const notice = `[테슬라 전라남도 단톡방 운영원칙 안내]

안녕하세요. 모두가 편안하고 안전하게 정보를 나눌 수 있도록 운영원칙을 새로 정비했습니다.

1. 방 안에서는 서로 존댓말을 사용해 주세요.
2. 욕설, 비방, 혐오, 성희롱, 공개 저격과 분란 조장은 금지합니다.
3. 영업, 광고, 리퍼럴, 고객 모집, 대출·보험·투자 권유는 사전 승인 없이는 금지합니다.
4. 자극적인 SNS 영상이나 링크만 올리지 말고, 원출처·날짜·공유 이유와 직접 경험 여부를 함께 적어 주세요.
5. 동의 없는 캡처, 실명·연락처·차량번호 공개 및 외부 공유를 금지합니다.
6. 모임은 자율 참여이며 음주운전, 위험운전, 강압적 행동은 즉시 제재합니다.
7. 문제 발생 시 공개 논쟁 대신 운영진에게 개인 메시지로 신고해 주세요.

특히 오토파일럿·FSD 등 운전자 보조기능은 공식 안내와 법규를 우선하고, 운전자가 항상 주행을 감독해야 합니다. 졸음운전, 전방주시 태만, 안전장치 무력화를 권하는 내용은 금지합니다.

대화명은 입장 후 24시간 이내에
지역 / 닉네임 / 차종 / 차량번호 끝 4자리 또는 출고예정
형식으로 변경해 주세요.

경미한 위반은 안내 → 경고 → 참여 제한·퇴장 순으로 처리하며, 사기·협박·스토킹·성희롱·개인정보 유포·악의적 영업은 즉시 퇴장할 수 있습니다.

전체 기준과 이전 공지는 아래 링크에서 언제든 확인해 주세요.`;

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
