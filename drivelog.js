const drivePrompt = `당신은 테슬라 장거리 주행기록 분석 도우미입니다.

아래 기록을 이용해 내 차량의 실제 사용 가능 배터리 용량과 장거리 주행 전비를 계산하고, 목적지까지 필요한 충전 계획을 정리해 주세요.

[개인정보 보호]
- 주소, 출발지·도착지, GPS 좌표, 이동 경로, 차량번호, VIN, API 키를 요구하거나 추정하지 마세요.
- 내가 실수로 개인정보를 넣었다면 분석 전에 삭제하라고 알려 주세요.

[분석 기준]
1. 70km 미만 주행은 제외합니다.
2. 중간에 충전한 기록은 제외합니다.
3. 출발 배터리보다 도착 배터리가 높거나, 사용 전력량이 0 이하인 기록은 제외합니다.
4. 기록별 실제 사용 가능 용량은 다음 식으로 계산합니다.
   사용 전력량(kWh) ÷ ((출발 배터리(%) − 도착 배터리(%)) ÷ 100)
5. 기록별 계산값, 전체 범위, 중앙값을 보여 주세요. 최근 기록과 전체 기록의 차이도 설명해 주세요.
6. 이상값을 제외한다면 어떤 기록을 왜 제외했는지 먼저 밝혀 주세요.
7. 고속도로 주행은 낮은 쪽 전비를 사용해 보수적으로 계산해 주세요.
8. 전비가 Wh/km로 들어오면 km/kWh로 바꿔 함께 표시해 주세요. 변환식은 1000 ÷ Wh/km입니다.
9. 목적지까지 필요한 배터리 비율은 다음 식으로 계산합니다.
   거리(km) ÷ 보수적 전비(km/kWh) ÷ 기준 용량(kWh) × 100
10. 계산한 사용량에 도착할 때 남길 배터리 15%p를 더하세요. 15%를 곱하는 방식으로 계산하지 마세요.
11. 자료가 부족하면 임의로 단정하지 말고 필요한 항목을 알려 주세요.
12. 실제 운행에서는 차량 내비게이션의 트립 플래너와 현재 배터리 상태, 기온, 바람, 고도, 교통상황을 먼저 확인하라고 안내해 주세요.

[내 차량과 예정 경로]
차종·연식:
목적지까지 거리(km):
예상 날씨·기온:
도착할 때 남기고 싶은 배터리(%): 15
고속도로 비율:

[주행기록]
날짜 | 거리(km) | 사용 전력량(kWh) | 출발 배터리(%) | 도착 배터리(%) | 중간 충전 여부
여기에 개인정보를 뺀 기록을 붙여넣으세요.

[결과 형식]
- 분석에 사용한 기록
- 제외한 기록과 이유
- 실제 사용 가능 용량의 범위와 중앙값
- 보수적으로 사용할 기준 용량
- 장거리 고속도로 기준 전비
- 목적지까지 예상 배터리 사용량
- 도착 여유를 반영한 권장 출발 배터리
- 충전이 필요한 구간과 판단 근거
- 반드시 다시 확인할 안전사항`;

const copyButton = document.querySelector("#copyDrivePrompt");
const status = document.querySelector("#drivePromptStatus");

async function copyDrivePrompt() {
  try {
    await navigator.clipboard.writeText(drivePrompt);
  } catch {
    const area = document.createElement("textarea");
    area.value = drivePrompt;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  status.textContent = "분석 프롬프트를 복사했습니다. AI를 열고 붙여넣은 뒤 내 기록을 추가하세요.";
  copyButton.textContent = "복사 완료 ✓";
  window.setTimeout(() => {
    copyButton.textContent = "분석 프롬프트 복사";
  }, 2400);
}

copyButton.addEventListener("click", copyDrivePrompt);
