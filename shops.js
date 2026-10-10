// 회원 가게 목록 — 구글 '회원 가게 공개 목록' 시트를 읽어 자동으로 보여 줍니다.
// 공개 시트에는 운영진이 게시를 승인한 가게의 공개 항목만 들어 있습니다.
// 26.10.10 모바일 화면 재구성: 업종 탭 + 지역(광주/전남) + 업종별 묶음 목록 + 상세 시트
const SHOP_CONFIG = {
  sheetId: "1B9ASx0aTmzVSY-I7s64RTz_SXaj1jrg0vama54HPl5c",
  sheetName: "공개목록",
};

const DEFAULT_SAY = "테슬라 광주·전남 정보방 회원이에요";

// 설문지 업종 → 탭 이름·아이콘·순서
const ICON = {
  food: '<path d="M5 3v8a3 3 0 0 0 6 0V3M8 3v18M17 3c-2 2-2.5 5-2.5 8h3V21"/>',
  car: '<path d="M4 16v-4l2-5h12l2 5v4M4 16h16M4 16v2M20 16v2"/><circle cx="7.5" cy="16" r="1.4"/><circle cx="16.5" cy="16" r="1.4"/>',
  life: '<path d="M3 11l9-7 9 7M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
  shop: '<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  med: '<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 8v8M8 12h8"/>',
  edu: '<path d="M3 8l9-4 9 4-9 4-9-4z"/><path d="M7 10v5c3 2 7 2 10 0v-5"/>',
  pro: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 12h18"/>',
  farm: '<path d="M12 21c0-6 0-9 6-14-6 0-10 3-10 8M12 21c-1-4-3-6-7-7"/>',
  etc: '<circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/>',
};
const CATS = [
  { key: "음식점·카페", label: "음식·카페", icon: "food" },
  { key: "생활 서비스", label: "생활 서비스", icon: "life" },
  { key: "쇼핑·판매", label: "쇼핑", icon: "shop" },
  { key: "병원·의원·약국", label: "병원", icon: "med", alias: ["뷰티·건강"] },
  { key: "교육·강의", label: "교육", icon: "edu" },
  { key: "전문 서비스(세무·법률·디자인 등)", label: "전문 서비스", icon: "pro" },
  { key: "농수산물·특산품", label: "특산품·먹거리", icon: "farm" },
  { key: "자동차 정비·세차·용품", label: "자동차", icon: "car" },
  { key: "기타", label: "기타", icon: "etc" },
];
const catOf = (s) => CATS.find((c) => c.key === s.업종 || (c.alias || []).includes(s.업종)) || CATS[CATS.length - 1];
const kindOf = (s) => s.종류 || catOf(s).label;
const areaOf = (s) => (/^광주/.test(s.지역 || "") ? "광주" : s.지역 ? "전남" : "");
const areaRank = (s) => ({ 광주: 0, 전남: 1 }[areaOf(s)] ?? 2);
const svg = (name, cls = "") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[name]}</svg>`;

const $ = (sel) => document.querySelector(sel);
const els = {
  list: $("#list"), status: $("#status"), tabs: $("#tabs"), seg: $("#seg"), q: $("#q"),
  sheet: $("#sheet"), sheetBody: $("#sheet-body"), toast: $("#toast"),
};

let shops = [];
let activeCat = "전체";
let activeArea = "전체";

/* ---------- 데이터 ---------- */

function parseCSV(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (c !== "\r") cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function safeUrl(u) {
  let v = String(u || "").trim();
  if (!v) return "";
  if (!/^https?:\/\//i.test(v)) v = "https://" + v;
  try {
    const url = new URL(v);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch { return ""; }
}

function mapUrl(s) {
  const m = String(s.지도 || "").match(/https?:\/\/\S+/);
  const v = safeUrl(m ? m[0] : "");
  if (v && /(^|\.)naver\.(me|com)$/i.test(new URL(v).hostname)) return v;
  return s.가게명 ? "https://map.naver.com/p/search/" + encodeURIComponent(`${s.지역 || ""} ${s.가게명}`.trim()) : "";
}

function photoIds(s) {
  return String(s.사진 || "").split(/[\s,]+/).filter((id) => /^[\w-]{20,}$/.test(id)).slice(0, 3);
}
const thumb = (id, w) => `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w${w}`;
const slug = (s) => encodeURIComponent(s.가게명);

/* ---------- 목록 ---------- */

function matches(s) {
  const q = els.q.value.trim().toLowerCase();
  return (activeCat === "전체" || catOf(s).key === activeCat) &&
    (activeArea === "전체" || areaOf(s) === activeArea) &&
    (!q || [s.가게명, s.지역, s.소개, s.혜택, s.업종, s.종류, s.닉네임, catOf(s).label].join(" ").toLowerCase().includes(q));
}

function row(s) {
  const photos = photoIds(s);
  const cat = catOf(s);
  const avatar = photos.length
    ? `<img src="${thumb(photos[0], 200)}" alt="" loading="lazy">`
    : svg(cat.icon);
  return `<li><button type="button" class="row" data-shop="${esc(s.가게명)}">
    <span class="avatar avatar-${cat.icon}">${avatar}</span>
    <span class="row-text">
      <span class="row-name">${esc(s.가게명)}</span>
      <span class="row-sub">${esc(kindOf(s))}${s.지역 ? ` · ${esc(s.지역)}` : ""}</span>
      ${s.혜택 ? `<span class="row-benefit">혜택 ${esc(s.혜택)}</span>` : ""}
    </span>
    <svg class="row-go" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>
  </button></li>`;
}

function render() {
  const list = shops.filter(matches);
  if (activeCat === "전체" && !els.q.value.trim()) {
    els.list.innerHTML = CATS.map((c) => {
      const group = list.filter((s) => catOf(s).key === c.key);
      if (!group.length) return "";
      return `<section class="group"><h3>${svg(c.icon, "group-icon")}${esc(c.label)}<span>${group.length}곳</span></h3><ul>${group.map(row).join("")}</ul></section>`;
    }).join("");
  } else {
    els.list.innerHTML = list.length ? `<section class="group"><ul>${list.map(row).join("")}</ul></section>` : "";
  }
  els.status.textContent = list.length
    ? ""
    : shops.length ? "찾는 조건에 맞는 가게가 없습니다. 다른 말로 찾아보세요." : "아직 등록된 가게가 없습니다. 첫 번째로 등록해 주세요.";
  els.status.hidden = !!list.length;
}

function buildTabs() {
  const base = shops.filter((s) => activeArea === "전체" || areaOf(s) === activeArea);
  const used = CATS.filter((c) => base.some((s) => catOf(s).key === c.key));
  const tabs = [{ key: "전체", label: "전체", n: base.length }, ...used.map((c) => ({ ...c, n: base.filter((s) => catOf(s).key === c.key).length }))];
  if (activeCat !== "전체" && !used.some((c) => c.key === activeCat)) activeCat = "전체";
  els.tabs.innerHTML = tabs.map((t) =>
    `<button type="button" role="tab" aria-selected="${t.key === activeCat}" data-cat="${esc(t.key)}">${t.icon ? svg(t.icon) : ""}${esc(t.label)}<span>${t.n}</span></button>`).join("");
  const on = els.tabs.querySelector('[aria-selected="true"]');
  if (on) on.scrollIntoView({ block: "nearest", inline: "center" });
}

els.tabs.addEventListener("click", (e) => {
  const b = e.target.closest("button[data-cat]");
  if (!b) return;
  activeCat = b.dataset.cat;
  buildTabs();
  render();
});

els.seg.addEventListener("click", (e) => {
  const b = e.target.closest("button[data-area]");
  if (!b) return;
  activeArea = b.dataset.area;
  els.seg.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  buildTabs();
  render();
});

els.q.addEventListener("input", render);

els.list.addEventListener("click", (e) => {
  const b = e.target.closest("button[data-shop]");
  if (b) openShop(b.dataset.shop, true);
});

/* ---------- 상세 시트 ---------- */

function openShop(name, push) {
  const s = shops.find((x) => x.가게명 === name);
  if (!s) return;
  const photos = photoIds(s);
  const map = mapUrl(s);
  const tel = String(s.전화 || "").replace(/[^0-9+]/g, "");
  const link = safeUrl(s.링크);
  const say = s.한마디 || DEFAULT_SAY;
  els.sheetBody.innerHTML = `
    ${photos.length ? `<div class="photos">${photos.map((id, n) =>
      `<a href="https://drive.google.com/file/d/${esc(id)}/view" target="_blank" rel="noopener noreferrer"><img src="${thumb(id, 900)}" alt="${esc(s.가게명)} 사진 ${n + 1}" loading="lazy"></a>`).join("")}</div>` : ""}
    <p class="sheet-meta">${esc(kindOf(s))}${s.지역 ? ` · ${esc(s.지역)}` : ""}</p>
    <h2 id="sheet-name">${esc(s.가게명)}</h2>
    ${s.소개 ? `<p class="sheet-intro">${esc(s.소개)}</p>` : ""}
    ${s.혜택 ? `<div class="box box-red"><b>회원 혜택</b>${esc(s.혜택)}</div>` : ""}
    <div class="box"><b>방문하시면 이렇게 말씀해 주세요</b>“${esc(say)}”</div>
    <div class="actions">
      ${map ? `<a class="btn btn-primary" href="${esc(map)}" target="_blank" rel="noopener noreferrer">네이버 지도·예약</a>` : ""}
      ${tel ? `<a class="btn" href="tel:${esc(tel)}">전화하기</a>` : ""}
      ${link ? `<a class="btn" href="${esc(link)}" target="_blank" rel="noopener noreferrer">홈페이지</a>` : ""}
    </div>
    ${s.닉네임 ? `<div class="ask">
      <div><b>사장님께 1:1로 물어보기</b><span>단톡방 대화상대에서 <b>@${esc(s.닉네임)}</b>을 찾아 1:1 채팅을 눌러 주세요.</span></div>
      <button type="button" class="btn btn-small" data-copy="${esc(s.닉네임)}" data-msg="닉네임을 복사했습니다">닉네임 복사</button>
    </div>` : ""}
    <button type="button" class="share" data-share="${esc(s.가게명)}">이 가게 소개 링크 보내기</button>`;
  if (!els.sheet.open) els.sheet.showModal();
  els.sheet.scrollTop = 0;
  if (push) history.pushState({ shop: name }, "", "#shop=" + slug(s));
}

function closeShop() {
  if (els.sheet.open) els.sheet.close();
}

els.sheet.addEventListener("close", () => {
  if (location.hash.startsWith("#shop=")) history.replaceState(null, "", location.pathname + location.search);
});
$("#sheet-close").addEventListener("click", closeShop);
els.sheet.addEventListener("click", (e) => { if (e.target === els.sheet) closeShop(); });
window.addEventListener("popstate", () => {
  const name = shopFromHash();
  if (name) openShop(name, false); else closeShop();
});

function shopFromHash() {
  const m = location.hash.match(/^#shop=(.+)$/);
  return m ? decodeURIComponent(m[1]) : "";
}

els.sheetBody.addEventListener("click", async (e) => {
  const c = e.target.closest("[data-copy]");
  if (c) { await copy(c.dataset.copy); toast(c.dataset.msg); return; }
  const sh = e.target.closest("[data-share]");
  if (sh) {
    const url = location.origin + location.pathname + "#shop=" + encodeURIComponent(sh.dataset.share);
    const text = `[테슬라 광주·전남 회원 가게] ${sh.dataset.share}`;
    if (navigator.share) { try { await navigator.share({ title: text, text, url }); } catch {} }
    else { await copy(`${text}\n${url}`); toast("링크를 복사했습니다. 카톡에 붙여 넣어 주세요"); }
  }
});

async function copy(text) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const t = document.createElement("textarea");
    t.value = text; document.body.appendChild(t); t.select();
    try { document.execCommand("copy"); } catch {}
    t.remove();
  }
}

let toastTimer;
function toast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove("on"), 2200);
}

/* ---------- 불러오기 ---------- */

async function load() {
  const url = `https://docs.google.com/spreadsheets/d/${SHOP_CONFIG.sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHOP_CONFIG.sheetName)}&t=${Date.now()}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const [header, ...rows] = parseCSV(await res.text());
    shops = rows
      .map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] || "").trim()])))
      .filter((s) => s.가게명)
      .sort((a, b) => areaRank(a) - areaRank(b) || (a.지역 || "").localeCompare(b.지역 || "", "ko") || a.가게명.localeCompare(b.가게명, "ko"));
    $("#stat-count").textContent = shops.length;
    $("#stat-gj").textContent = shops.filter((s) => areaOf(s) === "광주").length;
    $("#stat-jn").textContent = shops.filter((s) => areaOf(s) === "전남").length;
    buildTabs();
    render();
    const name = shopFromHash();
    if (name) openShop(name, false);
  } catch (e) {
    els.status.textContent = "가게 목록을 불러오지 못했습니다. 잠시 뒤 다시 열어 주세요.";
  }
}

load();

// 등록 안내가 화면에 보이면 아래 고정 버튼을 숨깁니다.
const cta = document.querySelector(".cta");
if ("IntersectionObserver" in window && cta) {
  new IntersectionObserver(([e]) => cta.classList.toggle("off", e.isIntersecting), { threshold: 0.15 })
    .observe(document.querySelector("#join"));
}
