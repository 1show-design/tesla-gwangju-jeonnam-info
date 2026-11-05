// 할로윈 모드 켜기·끄기 (26.11.05). 기본은 켜짐이고, 끄면 이 휴대폰에서는 원래 화면으로 보입니다.
(function () {
  var KEY = "hwMode";
  var on = localStorage.getItem(KEY) !== "off";
  var link = document.getElementById("theme-css");
  var base = link ? link.getAttribute("data-base") : null;
  var dark = link ? link.getAttribute("data-hw") : null;
  function apply(state) {
    on = state;
    document.documentElement.classList.toggle("hw", on);
    if (link && base && dark) link.setAttribute("href", on ? dark : base);
    document.querySelectorAll(".hw-toggle").forEach(function (b) {
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.querySelector(".hw-label").textContent = on ? "할로윈 모드" : "기본 화면";
    });
    var bats = document.querySelector(".hw-bats");
    if (bats) bats.hidden = !on;
  }
  apply(on);
  var PUMP = '<svg class="hw-pump" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6c-1-2 0-3 1.5-3.5" fill="none" stroke="#7dff5a" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="12" cy="14" rx="9" ry="7.5" fill="#ff7a1a"/><path d="M8 12.5l1.5-1.5 1.5 1.5zM13 12.5l1.5-1.5 1.5 1.5zM8 16c1.3 1.3 6.7 1.3 8 0l-1.3.4-1-.9-1.2.9-1.3-.9-1.2.9z" fill="#12100c"/></svg>';
  var BAT = '<svg class="hw-bat" viewBox="0 0 64 30" aria-hidden="true"><path d="M32 10c2-4 4-5 4-5l1 4c6-6 16-7 27-2-6 1-9 5-9 10-4-3-8-3-11 1-3-2-6-1-8 4-2-5-5-6-8-4-3-4-7-4-11-1 0-5-3-9-9-10 11-5 21-4 27 2l1-4s2 1 4 5z"/></svg>';
  document.addEventListener("DOMContentLoaded", function () {
    // 켜기·끄기 단추
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "hw-toggle hw-fab";
    btn.innerHTML = PUMP + '<span class="hw-label"></span>';
    btn.addEventListener("click", function () { localStorage.setItem(KEY, on ? "off" : "on"); apply(!on); });
    document.body.appendChild(btn);
    // 박쥐
    var bats = document.createElement("div"); bats.className = "hw-bats"; bats.setAttribute("aria-hidden", "true");
    bats.innerHTML = BAT.replace("<svg", '<svg style="top:12%"') + BAT + BAT; document.body.appendChild(bats);
    apply(on);
    // 처음 한 번 인사
    if (on && !localStorage.getItem("hwIntro") && document.querySelector(".hero2")) {
      var d = document.createElement("div"); d.className = "hw-intro"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "할로윈 모드 안내");
      d.innerHTML = '<div class="hw-intro-card"><div class="moon"></div><h2>Happy Halloween</h2><p>정보방도 이번 할로윈 업데이트처럼 꾸며 봤습니다. 오른쪽 아래 호박 단추로 언제든 원래 화면으로 바꿀 수 있습니다.</p><button type="button" data-k="on">할로윈 모드로 보기</button><button type="button" data-k="off">기본 화면으로 보기</button></div>';
      d.addEventListener("click", function (e) {
        var k = e.target && e.target.getAttribute && e.target.getAttribute("data-k");
        if (!k && e.target !== d) return;
        localStorage.setItem("hwIntro", "1");
        if (k === "off") { localStorage.setItem(KEY, "off"); apply(false); }
        d.remove();
      });
      document.body.appendChild(d);
    }
    // 움직임 줄이기 설정이면 영상은 멈춘 첫 장면으로
    var v = document.querySelector(".hw-hero-media");
    if (v && matchMedia("(prefers-reduced-motion: reduce)").matches) { v.removeAttribute("autoplay"); v.pause(); }
    // 카드가 화면에 들어오면 두 번 깜빡
    if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting && on) { e.target.classList.add("hw-flicker"); io.unobserve(e.target); } });
      }, { threshold: .6 });
      document.querySelectorAll(".info-card, .svc, .food-lists a, .h2row").forEach(function (el) { io.observe(el); });
    }
  });
})();
