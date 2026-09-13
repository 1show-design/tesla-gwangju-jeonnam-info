const notice = `[테슬라 광주·전남 오너 정보방 규칙 안내]

안녕하세요. 모두가 편안하고 안전하게 정보를 나눌 수 있도록 방 규칙을 새로 정리했습니다.

1. 방에서는 서로 존댓말을 써 주세요.
2. 욕설과 비방, 혐오 표현, 성희롱, 공개 저격, 싸움을 키우는 글은 올리지 말아 주세요.
3. 업체 홍보와 광고, 추천 코드(리퍼럴), 고객 모으기, 대출·보험·투자 권유는 운영진 승인 없이 올리지 말아 주세요.
4. 한 사람의 불안을 모두의 위험처럼 키워서 퍼뜨리거나, 근거 없이 FSD가 위험하다고 겁주는 글은 올리지 말아 주세요. 인스타그램·유튜브 같은 외부 내용을 옮길 때는 원래 출처와 올라온 날짜, 앞뒤 맥락, 직접 겪은 일인지, 왜 공유하시는지를 함께 적어 주세요. 실제로 겪으신 안전 문제는 언제든 환영합니다.
5. 동의 없는 대화 캡처, 실명·연락처·차량번호 공개와 외부 공유는 하지 말아 주세요.
6. 모임 참석은 자유입니다. 음주운전과 위험한 운전, 강압적인 행동은 바로 조치합니다.
7. 문제가 생기면 방에서 공개로 다투지 마시고 운영진에게 개인 메시지로 알려 주세요.

오토파일럿과 FSD 같은 운전자 보조기능은 공식 안내와 도로교통법을 먼저 따르고, 운전자가 늘 주행을 지켜봐야 합니다. 졸음운전, 앞을 보지 않는 운전, 안전장치를 풀어 두는 방법을 권하는 글은 금지합니다.

대화명은 들어오신 뒤 24시간 안에
지역 / 닉네임 / 차종 / 차량번호 끝 4자리 (아직 차를 받지 않으셨다면 출고예정)
형식으로 바꿔 주세요.

가벼운 위반은 안내 → 경고 → 참여 제한·퇴장 순서로 처리합니다. 사기, 협박, 스토킹, 성희롱, 개인정보 유포, 악의적인 영업은 바로 퇴장 처리할 수 있습니다.

관심 끌기를 반복하거나 도배, 자극적인 글, 일부러 싸움을 만드는 행동으로 방의 목적을 해친다고 운영진이 판단한 경우에도 사전 경고 없이 바로 내보낼 수 있습니다. 의견이 다르다는 것만으로, 근거 있는 비판을 하셨다는 것만으로는 적용하지 않습니다.

새 정보: TePilot 주행기록과 구글 시트로 장거리 수퍼차저 경로를 짜는 안내서를 정보실에 올렸습니다. 집 주소와 좌표, API 키는 공개하지 않았습니다.

전체 규칙과 회원 정보
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
