// 회원 가게 목록 — 구글 '회원 가게 공개 목록' 시트를 읽어 자동으로 보여 줍니다.
// 공개 시트에는 운영진이 게시를 승인한 가게의 공개 항목만 들어 있습니다.
const SHOP_CONFIG = {
  sheetId: "1B9ASx0aTmzVSY-I7s64RTz_SXaj1jrg0vama54HPl5c",   // 공개 시트 ID
  sheetName: "공개목록",
  formUrl: "https://forms.gle/d4kMLaZQqdS3tRbRA",   // 회원 가게 등록 설문지 주소
};

const els = {
  grid: document.querySelector("#shop-grid"),
  status: document.querySelector("#shop-status"),
  filters: document.querySelector("#shop-filters"),
  search: document.querySelector("#shop-search"),
  form: document.querySelector("#shop-form-link"),
  count: document.querySelector("#shop-count"),
  cats: document.querySelector("#shop-cats"),
  regions: document.querySelector("#shop-regions"),
};

let shops = [];
let activeCat = "전체";
const DEFAULT_SAY = "테슬라 광주·전남 정보방 회원이에요";
const kindOf = (s) => s.종류 || s.업종 || "기타";

function photoIds(s) {
  return String(s.사진 || "").split(/[\s,]+/).filter((id) => /^[\w-]{20,}$/.test(id)).slice(0, 3);
}

if (SHOP_CONFIG.formUrl) {
  els.form.href = SHOP_CONFIG.formUrl;
} else {
  els.form.textContent = "등록 설문지는 곧 열립니다";
  els.form.removeAttribute("href");
  els.form.classList.add("is-disabled");
}

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

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function safeUrl(u) {
  let v = String(u || "").trim();
  if (!v) return "";
  if (!/^https?:\/\//i.test(v)) v = "https://" + v;
  try {
    const url = new URL(v);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch { return ""; }
}

function naverMapUrl(u) {
  const m = String(u || "").match(/https?:\/\/\S+/);
  const v = safeUrl(m ? m[0] : u);
  if (!v) return "";
  return /(^|\.)naver\.(me|com)$/i.test(new URL(v).hostname) ? v : "";
}

function render() {
  const q = els.search.value.trim().toLowerCase();
  const list = shops.filter((s) =>
    (activeCat === "전체" || kindOf(s) === activeCat) &&
    (!q || [s.가게명, s.지역, s.소개, s.혜택, s.업종, s.종류].join(" ").toLowerCase().includes(q))
  );
  els.grid.innerHTML = list.map((s) => {
    const map = naverMapUrl(s.지도);
    const link = safeUrl(s.링크);
    const tel = String(s.전화 || "").replace(/[^0-9+]/g, "");
    const photos = photoIds(s);
    return `<article class="shop-card">
      ${photos.length ? `<div class="shop-photos">${photos.map((id, n) =>
        `<a href="https://drive.google.com/file/d/${esc(id)}/view" target="_blank" rel="noopener noreferrer"><img src="https://drive.google.com/thumbnail?id=${esc(id)}&sz=w800" alt="${esc(s.가게명)} 사진 ${n + 1}" loading="lazy"></a>`).join("")}</div>` : ""}
      <p class="shop-meta"><span>${esc(kindOf(s))}</span>${esc(s.지역)}</p>
      <h3>${esc(s.가게명)}</h3>
      <p>${esc(s.소개)}</p>
      ${s.혜택 ? `<p class="shop-benefit"><b>회원 혜택</b>${esc(s.혜택)}</p>` : ""}
      <p class="shop-say"><b>방문하시면 이렇게 말씀해 주세요</b>“${esc(s.한마디 || DEFAULT_SAY)}”</p>
      <div class="shop-actions">
        ${map ? `<a href="${esc(map)}" target="_blank" rel="noopener noreferrer">네이버 지도 ↗</a>` : ""}
        ${tel ? `<a href="tel:${esc(tel)}">전화 ${esc(s.전화)}</a>` : ""}
        ${link ? `<a href="${esc(link)}" target="_blank" rel="noopener noreferrer">홈페이지 ↗</a>` : ""}
      </div>
    </article>`;
  }).join("");
  els.status.textContent = list.length
    ? `${list.length}곳을 보여 드립니다.`
    : shops.length ? "찾는 조건에 맞는 가게가 없습니다." : "아직 등록된 가게가 없습니다. 첫 번째로 등록해 주세요.";
}

function buildFilters() {
  const cats = ["전체", ...new Set(shops.map(kindOf))];
  els.filters.innerHTML = cats.map((c) =>
    `<button type="button" aria-pressed="${c === activeCat}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
  els.filters.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
    activeCat = b.dataset.cat;
    buildFilters();
    render();
  }));
}

async function load() {
  if (!SHOP_CONFIG.sheetId) {
    els.status.textContent = "회원 가게 등록을 준비하고 있습니다. 설문지가 열리면 이곳에 가게가 올라옵니다.";
    return;
  }
  const url = `https://docs.google.com/spreadsheets/d/${SHOP_CONFIG.sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHOP_CONFIG.sheetName)}&t=${Date.now()}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const [header, ...rows] = parseCSV(await res.text());
    shops = rows
      .map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] || "").trim()])))
      .filter((s) => s.가게명)
      .sort((a, b) => kindOf(a).localeCompare(kindOf(b), "ko") || a.가게명.localeCompare(b.가게명, "ko"));
    els.count.textContent = shops.length;
    els.cats.textContent = new Set(shops.map(kindOf)).size;
    els.regions.textContent = new Set(shops.map((s) => s.지역)).size;
    buildFilters();
    render();
  } catch (e) {
    els.status.textContent = "가게 목록을 불러오지 못했습니다. 잠시 뒤 다시 열어 주세요.";
  }
}

els.search.addEventListener("input", render);
load();
