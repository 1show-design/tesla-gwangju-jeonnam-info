// 방문·클릭 집계 (GoatCounter, 26.11.20)
// 어느 정보가 많이 쓰이는지 보려고 넣었습니다. 쿠키를 쓰지 않고, 누가 눌렀는지는 남기지 않습니다.
// 남는 것: 쪽을 연 횟수, 누른 카드·링크·단추의 이름. 검색어·닉네임·연락처는 보내지 않습니다.
(function () {
  var CODE = "tesla-gj"; // GoatCounter 가입 때 정한 코드 (예: "tesla-gj"). 비어 있으면 아무것도 하지 않습니다.
  if (!CODE) return;

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://gc.zgo.at/count.js";
  s.setAttribute("data-goatcounter", "https://" + CODE + ".goatcounter.com/count");
  document.head.appendChild(s);

  var PAGE = { "links.html": "나눈 정보", "shops.html": "회원 가게", "drivelog.html": "장거리 경로" };
  var page = PAGE[location.pathname.split("/").pop()] || "정보실";
  var SECTION = { top: "첫 화면", apps: "오너 서비스", info: "정보실", quick: "꼭 지킬 규칙", rules: "전체 규칙", process: "처리 절차", contact: "참여 문의" };

  function clean(t, max) {
    t = (t || "").replace(/[↗→]/g, "").replace(/\s+/g, " ").trim();
    return t.length > max ? t.slice(0, max) + "…" : t;
  }
  function textOf(el, sel) {
    var n = el && el.querySelector(sel);
    return n ? clean(n.textContent, 30) : "";
  }
  // 누른 것이 어느 구역에 있는지
  function where(el) {
    var d = el.closest("dialog");
    if (d) return textOf(d, "h2, h3") || "상세 창";
    var card = el.closest("details.info-card");
    if (card) return textOf(card, "summary strong") || card.id;
    var svc = el.closest(".svc");
    if (svc) return "오너 서비스";
    var sec = el.closest("section[id]");
    if (sec) return SECTION[sec.id] || sec.id;
    if (el.closest("header, nav")) return "위 메뉴";
    return "";
  }
  // 누른 것의 이름
  function nameOf(el) {
    if (el.dataset.shop) return clean(el.dataset.shop, 30);
    if (el.hasAttribute("data-copy")) return "닉네임 복사";
    if (el.hasAttribute("data-share")) return "가게 소개 링크 보내기";
    if (el.classList.contains("hw-toggle")) return "할로윈 모드 바꾸기";
    var svc = el.closest(".svc");
    if (svc) return textOf(svc, "h3") || clean(el.textContent, 30);
    if (el.tagName === "BUTTON" && el.firstChild && el.firstChild.nodeType === 3) return clean(el.firstChild.textContent, 30);
    return textOf(el, "strong") || clean(el.textContent, 30) || el.id || "이름 없음";
  }
  function kindOf(el) {
    if (el.tagName !== "A") return "단추";
    var h = el.getAttribute("href") || "";
    if (h.indexOf("tel:") === 0) return "전화";
    if (h.charAt(0) === "#") return "이동";
    if (/^https?:/.test(h) && el.host !== location.host) return "바깥";
    return /\.(jpg|png|pdf)$/i.test(h) ? "자료" : "쪽";
  }
  function send(kind, el, name) {
    var gc = window.goatcounter;
    if (!gc || !gc.count) return;
    var ctx = where(el);
    var path = "[" + kind + "] " + (page === "정보실" ? "" : page + " · ") + (ctx && ctx !== name ? ctx + " · " : "") + name;
    gc.count({ path: path.slice(0, 100), title: path, event: true });
  }

  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("a[href], button");
    if (!el) return;
    if (el.hasAttribute("data-open")) return; // 정보실 아이콘은 아래 '펼침'으로 한 번만 셉니다
    send(kindOf(el), el, nameOf(el));
  }, true);

  // 카드·규칙을 펼쳤을 때 (toggle은 위로 전달되지 않아 capture로 받습니다)
  document.addEventListener("toggle", function (e) {
    var d = e.target;
    if (!d || d.tagName !== "DETAILS" || !d.open) return;
    var name = textOf(d, "summary strong") || textOf(d, "summary") || d.id || "이름 없음";
    send("펼침", d, name);
  }, true);
})();
