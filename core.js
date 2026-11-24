/* Mapa Shopping Gallo — núcleo compartilhado entre o app (index.html) e o painel (admin.html).
   Dados, planta (esquemática ou desenhada no painel), rotas em grafo, QR Codes e desenho SVG. */
(function (W) {
"use strict";
const MM = W.MM = {};
const CFG = MM.cfg = Object.assign({ url: "", key: "" }, W.MM_CONFIG || {});
const HTTP = /^https?:/.test(location.protocol);
MM.online = () => !!(CFG.url && CFG.key) && HTTP;

/* ---------- constantes ---------- */
MM.BUILD = {
  shopping: { name: "Shopping Gallo", short: "Gallo", addr: "R. 67-A, s/n – Setor Central, Goiânia – GO, 74055-045", lat: -16.6640, lng: -49.2600 }
};
MM.BORDER = ["shopping"];
MM.FLOORS = { SS: "Subsolo", T: "Térreo", P1: "Piso 1", G3: "G3 · Estacionamento" };
MM.FLEVEL = { SS: -1, T: 0, P1: 1, G3: 0 };
MM.SEGS = [
  ["Feminino", "#e0618e"], ["Masculino", "#3b6fd1"], ["Jeans", "#2f3d8f"], ["Infantil", "#f2b632"],
  ["Moda Praia", "#19a7b8"], ["Moda Fitness", "#3aa660"], ["Moda Íntima", "#c2456b"], ["Plus Size", "#9c5ad1"],
  ["Moda Cristã", "#8a6d3b"], ["Social", "#455a64"], ["Modinha", "#ef7d4c"], ["Moda Balada", "#b4237e"],
  ["Acessórios", "#d39a1c"], ["Calçados", "#8d5a3b"], ["Cosméticos", "#a855c7"], ["Alimentação", "#ea6a1f"],
  ["Serviços", "#7d8790"], ["Outlets", "#555555"], ["Entretenimento", "#6c4ad1"], ["Estética", "#d65f9a"]
];
MM.SEGCOLOR = Object.fromEntries(MM.SEGS);
MM.ICON = {
  "Feminino": "👗", "Masculino": "👔", "Jeans": "👖", "Infantil": "🧸", "Moda Praia": "👙", "Moda Fitness": "🏋️",
  "Moda Íntima": "🩲", "Plus Size": "🌸", "Moda Cristã": "🕊️", "Social": "🤵", "Modinha": "✨", "Moda Balada": "🎉",
  "Acessórios": "👜", "Calçados": "👟", "Cosméticos": "💄", "Alimentação": "🍔", "Serviços": "🛎️", "Outlets": "🏷️", "Entretenimento": "🎬", "Estética": "💅"
};
/* marcos de referência (banheiro, escada, elevador…): ficam em layout['marcos'] = { "<piso>": [{id,t,x,y}] } */
MM.MT = { wc: ["🚻", "Banheiro"], escada: ["🪜", "Escada rolante"], elevador: ["🛗", "Elevador"], entrada: ["🚪", "Entrada"], info: ["ℹ️", "Informações"], praca: ["🍴", "Alimentação"], caixa: ["🏧", "Caixa eletrônico"], estac: ["🅿️", "Estacionamento"] };
MM.MARCOS = {};
MM.iconOf = c => MM.ICON[c] || "🛍️";
MM.SVGI = {"Feminino": "M9.5 3l-1.5 5 2.5 2L7 21h10l-3.5-11L16 8l-1.5-5M9.5 3c.8 1.2 4.2 1.2 5 0", "Masculino": "M8 3L3 6l2 4 3-1v12h8V9l3 1 2-4-5-3c-.6 1.6-1.8 2.4-4 2.4S8.6 4.6 8 3z", "Jeans": "M7 3h10l1 18h-4.5L12 11l-1.5 10H6L7 3zM7 7h10", "Infantil": "M12 5.2a5 5 0 100 10 5 5 0 000-10zM7.6 5.2a1.9 1.9 0 100-3.8 1.9 1.9 0 000 3.8zM16.4 5.2a1.9 1.9 0 100-3.8 1.9 1.9 0 000 3.8zM7 21c0-3 2-5 5-5s5 2 5 5M12 12.2v.01", "Moda Praia": "M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2", "Moda Fitness": "M6 7v10M3.5 9v6M18 7v10M20.5 9v6M6 12h12", "Moda Íntima": "M12 20s-7-4.4-7-10a4 4 0 017-2.4A4 4 0 0119 10c0 5.6-7 10-7 10z", "Plus Size": "M12 3a9 9 0 100 18 9 9 0 000-18zM12 8v8M8 12h8", "Moda Cristã": "M12 3v18M7 8h10", "Social": "M10 3h4l-.8 3.2L15.5 18 12 21l-3.5-3 2.3-11.8L10 3z", "Modinha": "M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z", "Moda Balada": "M5 4h14l-7 8-7-8zM12 12v8M8 20h8", "Acessórios": "M5 8h14l-1 12H6L5 8zM9 8V6a3 3 0 016 0v2", "Calçados": "M3 17v-3c2 0 3-1 4-3l2-4 3 3c1 1 3 1.5 6 2.5 2 .6 3 1.5 3 3V17H3zM3 20h18", "Cosméticos": "M9 21v-7h6v7zM10 14V9h4v5M10.5 9l1-5 2.5 2-.5 3", "Alimentação": "M7 3v7a2 2 0 004 0V3M9 3v18M17 3c-2 1-3 4-3 7h3v11", "Serviços": "M6 17v-6a6 6 0 1112 0v6l2 2H4zM10 21h4", "Outlets": "M3 12V4h8l10 10-8 8L3 12zM7.5 7.5v.01", "Entretenimento": "M3 8h18v12H3zM3 8l3-4h4L7 8M10 8l3-4h4l-3 4", "Estética": "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5zM18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z", "_vaga": "M8 11a4 4 0 100 8 4 4 0 000-8zM11 12l8-8M15 8l2 2M17 6l2 2", "_def": "M6 7h12l1 13H5L6 7zM9 10V6.5a3 3 0 016 0V10"};
MM.icoHTML = (k, col) => { const c = col || (k === "_vaga" ? "#c98a00" : MM.SEGCOLOR[k] || "#7d8790"); return `<svg class="gi" viewBox="0 0 24 24" style="color:${c}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${MM.SVGI[k] || MM.SVGI._def}"/></svg>`; };
MM.icoSvg = (k, x, y, size, col) => `<g transform="translate(${(x - size / 2).toFixed(1)} ${(y - size / 2).toFixed(1)}) scale(${(size / 24).toFixed(3)})" fill="none" stroke="${col}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" pointer-events="none"><path d="${MM.SVGI[k] || MM.SVGI._def}"/></g>`;

const SHOP_T_ORDER = ["Via Mega", "Via Central", "Via Fashion", "Via da Moda", "Via Tendência", "Via Look", "Via Paetê", "Via Tulipa", "Via Acácia", "Via Gérbera", "Alameda dos Eventos", "Alameda Elegante", "Alameda do Sabor", "Alameda Lírio", "Externa 69", "Externa Contorno", "Outros"];
MM.SYN = [
  [/biquin|bikini|maio|saida de praia|praia|sunga|beach/, "Moda Praia"],
  [/legging|fitness|academia|esport|activewear|treino/, "Moda Fitness"],
  [/lingerie|calcinha|sutia|pijama|intima|cueca|modelador|cinta/, "Moda Íntima"],
  [/crianc|kids|infantil|bebe|baby|menin/, "Infantil"],
  [/jeans|denim|calca/, "Jeans"],
  [/tenis|sapato|sandalia|chinelo|sapatilha|bota|calcad/, "Calçados"],
  [/joia|semijoia|folhead|bijou|bolsa|oculos|cinto|acessori/, "Acessórios"],
  [/perfum|maquiag|make|cosmet/, "Cosméticos"],
  [/camisa social|terno|social|blazer/, "Social"],
  [/evangel|crista/, "Moda Cristã"],
  [/plus/, "Plus Size"],
  [/comida|lanche|cafe|restaurante|almoco|comer|empada|burguer|burger/, "Alimentação"],
  [/correio|frete|transportad|envio|carga|clinica|estetica|otica/, "Serviços"],
  [/masculin|homem|bermuda/, "Masculino"],
  [/vestido|blusa|feminin|mulher|cropped|body/, "Feminino"]
];

const norm = MM.norm = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const esc = MM.esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const slugify = MM.slugify = s => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const r1 = n => Math.round(n * 10) / 10;

/* ---------- acesso ao Supabase (REST puro, sem biblioteca) ---------- */
MM.headers = function (token) {
  const h = { apikey: CFG.key, "Content-Type": "application/json" };
  const t = token || (CFG.key.startsWith("eyJ") ? CFG.key : null);
  if (t) h.Authorization = "Bearer " + t;
  return h;
};
MM.rest = async function (path, opt) {
  const r = await fetch(CFG.url.replace(/\/$/, "") + "/rest/v1/" + path, Object.assign({ headers: MM.headers() }, opt || {}));
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json().catch(() => null);
};
let SID = "";
try { SID = localStorage.getItem("mm_sid") || ""; if (!SID) { SID = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem("mm_sid", SID); } } catch (e) { SID = "anon"; }
MM.track = function (tipo, d) {
  if (!MM.online()) return;
  d = d || {};
  const body = { tipo, sessao: SID, loja: d.loja || null, termo: d.termo ? String(d.termo).slice(0, 80) : null, n: d.n == null ? null : d.n, ponto: d.ponto || null };
  try {
    fetch(CFG.url.replace(/\/$/, "") + "/rest/v1/eventos", { method: "POST", keepalive: true, headers: Object.assign(MM.headers(), { Prefer: "return=minimal" }), body: JSON.stringify(body) }).catch(() => {});
  } catch (e) {}
};

/* ---------- carga de dados ---------- */
MM.rowToStore = r => ({ n: r.nome, s: r.slug, c: r.categorias || [], l: r.localizacao || "", desc: r.descricao || "", prod: r.produtos || "", whats: r.whatsapp || "", insta: r.instagram || "", promo: r.promo || "", dest: !!r.destaque, vaga: r.status === "vaga", locacao: r.locacao_info || "" });
MM.embedded = () => (W.MM_RAW || []).map(l => { const p = l.split("|"); return { n: p[0], s: p[1], c: p[2] ? p[2].split(",") : [], l: p[3] || "" }; });
MM.load = async function () {
  let stores = MM.embedded(), layouts = {}, src = "embutido", date = W.MM_DATE || "";
  try { const l = JSON.parse(localStorage.getItem("mm_layouts") || "null"); if (l) layouts = l; } catch (e) {}
  if (HTTP) {
    if (MM.online()) {
      try {
        const cols = "slug,nome,categorias,localizacao,descricao,produtos,whatsapp,instagram,promo,destaque";
        const [a, b] = await Promise.all([
          MM.rest("lojas?select=" + cols + ",status,locacao_info").catch(() => MM.rest("lojas?select=" + cols)), /* banco ainda sem a migração de vagas */
          MM.rest("layout?select=chave,dados")
        ]);
        if (a && a.length) { stores = a.map(MM.rowToStore); src = "online"; }
        if (b) { layouts = {}; b.forEach(r => layouts[r.chave] = r.dados); }
        try { localStorage.setItem("mm_cache", JSON.stringify({ stores, layouts })); }
        catch (e) { try { localStorage.setItem("mm_cache", JSON.stringify({ stores, layouts: {} })); } catch (e2) {} }
      } catch (e) {
        try { const c = JSON.parse(localStorage.getItem("mm_cache") || "null"); if (c && c.stores) { stores = c.stores; layouts = c.layouts || {}; src = "offline"; } } catch (e2) {}
      }
    } else {
      try { const r = await fetch("lojas.json", { cache: "no-store" }); if (r.ok) { const j = await r.json(); if (j.lojas && j.lojas.length) { stores = j.lojas.map(x => ({ n: x.n, s: x.s, c: x.c || [], l: x.l })); date = j.data || date; src = "lojas.json"; } } } catch (e) {}
      try { const r = await fetch("layout.json", { cache: "no-store" }); if (r.ok) { const j = await r.json(); if (j && typeof j === "object") layouts = j; } } catch (e) {}
    }
  }
  return { stores, layouts, src, date };
};

/* ---------- loja ---------- */
MM.mk = function (o, i) {
  const l = (o.l || "").trim();
  const cats = (o.c || []).map(x => x.trim()).filter(Boolean);
  let f = "T";
  if (/piso\s*1/i.test(l)) f = "P1"; else if (/^subsolo/i.test(l)) f = "SS"; else if (/^G3/.test(l)) f = "G3";
  let cor;
  const m = l.match(/^(.+?)\s*[–-]\s*(T[ée]rreo|Piso)/i);
  if (m) cor = m[1].trim(); else if (f === "SS") cor = "Subsolo"; else if (f === "G3") cor = "G3"; else cor = "Outros";
  cor = cor.replace(/\bcentral\b/, "Central").replace(/\blook\b/, "Look");
  const rm = cor.match(/^Rua\s*0?(\d+)/i); if (rm) cor = "Rua " + rm[1].padStart(2, "0");
  const pm = l.match(/\(([^)]*)\)/);
  let num = pm ? pm[1] : "";
  for (let k = 0; k < 2; k++) num = num.replace(/^(Loja|LJ|ML|G3)\s*/i, "").trim();
  const om = num.match(/\d+/); const ord = om ? +om[0] : 99999;
  const b = "shopping";
  const prim = cats.find(x => x !== "Feminino") || cats[0] || "Outlets";
  return { id: i, n: o.n, s: o.s, cats, loc: l, f, cor, num, ord, b, g: b + "|" + f, prim, icon: o.vaga ? "🔑" : MM.iconOf(prim), ik: o.vaga ? "_vaga" : prim,
    desc: o.desc || "", prod: o.prod || "", whats: o.whats || "", insta: o.insta || "", promo: o.promo || "", dest: !!o.dest,
    vaga: !!o.vaga, locacao: o.locacao || "",
    key: norm([o.n, cats.join(" "), cor, num, o.prod, o.desc, o.promo, o.vaga ? "vaga vago box disponivel alugar aluguel locacao" : ""].join(" ")) };
};
/* ---------- busca tolerante a erros de digitação (Fuse.js) ---------- */
const VOC = (() => { /* palavras-chave dos sinônimos → segmento (corrige "biquine", "legin", "sandalía"…) */
  const m = new Map();
  MM.SYN.forEach(([re, cat]) => re.source.split("|").forEach(w => { w = w.replace(/[^a-z ]/g, "").trim(); if (w.length >= 3) m.set(w, cat); }));
  return m;
})();
let FZ = { S: null };
function fuzzyIndex(stores) {
  if (FZ.S === stores || !W.Fuse) return FZ;
  const docs = stores.map(s => ({ id: s.id, n: norm(s.n), c: norm(s.cats.join(" ")), p: norm([s.prod, s.promo, s.desc].join(" ")), w: norm(s.cor + " " + s.num) }));
  const opt = { threshold: 0.3, ignoreLocation: true, minMatchCharLength: 3 };
  FZ = { S: stores, main: new W.Fuse(docs, Object.assign({ keys: [{ name: "n", weight: 3 }, { name: "p", weight: 1.5 }, { name: "c", weight: 1 }, { name: "w", weight: 0.4 }] }, opt)),
    voc: new W.Fuse([...VOC.keys()].map(w => ({ w })), Object.assign({ keys: ["w"] }, opt)) };
  return FZ;
}
/* ids das lojas que casam, de forma aproximada, com TODAS as palavras da busca */
function fuzzyIds(stores, toks) {
  const F = fuzzyIndex(stores); if (!F.main) return null;
  let acc = null;
  for (const t of toks) {
    const set = new Set();
    if (t.length < 3) stores.forEach(s => { if (s.key.includes(t)) set.add(s.id); });
    else {
      F.main.search(t).forEach(r => set.add(r.item.id));
      F.voc.search(t).slice(0, 3).forEach(r => { const cat = VOC.get(r.item.w); stores.forEach(s => { if (s.cats.includes(cat)) set.add(s.id); }); });
    }
    acc = acc ? new Set([...acc].filter(x => set.has(x))) : set;
    if (!acc.size) break;
  }
  return acc || new Set();
}
MM.matcher = function (stores, q, seg) {
  q = norm(q).trim().replace(/^(rua|r)\s*0?(\d+)$/, (m, a, n) => "rua " + n.padStart(2, "0"));
  const corMode = q && /^(rua|via|alameda|externa|passarela|subsolo|g3)\b/.test(q) && stores.some(x => norm(x.cor) === q);
  const toks = q ? q.split(/\s+/) : [];
  const syn = q ? MM.SYN.filter(([re]) => re.test(q)).map(x => x[1]) : [];
  const exact = s => toks.every(t => s.key.includes(t)) || syn.some(c => s.cats.includes(c));
  let fz = null;
  if (q && !corMode && !stores.some(exact)) fz = fuzzyIds(stores, toks); /* só entra quando a busca exata não acha nada */
  const f = function (s) {
    if (seg && !s.cats.includes(seg)) return false;
    if (!q) return true;
    if (corMode) return norm(s.cor) === q;
    return fz ? fz.has(s.id) : exact(s);
  };
  f.fuzzy = !!(fz && fz.size);
  return f;
};

/* ---------- planta ---------- */
const CELL = 46, SH = 36, CW = 20, LANE = CW + 2 * SH + 18, U0 = 80, SP = 40;
function schematic(g) {
  const vert = g.b === "park";
  const P = (u, v) => vert ? { x: v, y: u } : { x: u, y: v };
  const cols = Math.max(3, ...g.lanes.map(L => Math.ceil(L.list.length / 2)));
  const sA = SP, sB = U0 + cols * CELL + SP, n = g.lanes.length;
  g.cw = CW; g.depth = SH; g.mpu = 0.09; g.bg = null; g.custom = false; g.segs = [];
  g.lanes.forEach((L, i) => {
    const v = 70 + i * LANE, a = P(sA, v), b = P(sB, v);
    L.seg = { id: "L:" + L.slug, name: L.name, kind: "lane", x1: a.x, y1: a.y, x2: b.x, y2: b.y };
    L.t0 = U0 - sA; L.cell = CELL; g.segs.push(L.seg);
  });
  const v0 = 70, vN = 70 + (n - 1) * LANE, e = P(sA, v0 - 46), a2 = P(sA, vN);
  g.entry = e;
  g.segs.push({ id: "K:a", name: "corredor principal", kind: "link", x1: e.x, y1: e.y, x2: a2.x, y2: a2.y });
  if (n > 1) { const b1 = P(sB, v0), b2 = P(sB, vN); g.segs.push({ id: "K:b", name: "corredor principal", kind: "link", x1: b1.x, y1: b1.y, x2: b2.x, y2: b2.y }); }
}
function custom(g, lay) {
  g.custom = true; g.cw = lay.cw || CW; g.depth = lay.depth || SH; g.mpu = lay.mpu || 0.09; g.bg = lay.bg || null; g.segs = [];
  let maxY = g.bg ? g.bg.h : 0;
  for (const k in lay.lanes) maxY = Math.max(maxY, lay.lanes[k].y1, lay.lanes[k].y2);
  (lay.links || []).forEach(k => { maxY = Math.max(maxY, k.y1, k.y2); });
  let j = 0;
  g.lanes.forEach(L => {
    const q = lay.lanes[L.slug];
    const s = q ? { x1: q.x1, y1: q.y1, x2: q.x2, y2: q.y2 }
      : { x1: 40, y1: maxY + 90 + j * LANE, x2: 40 + 80 + Math.max(3, Math.ceil(L.list.length / 2)) * CELL, y2: maxY + 90 + (j++) * LANE };
    L.seg = Object.assign({ id: "L:" + L.slug, name: L.name, kind: "lane", loose: !q }, s);
    L.t0 = null; g.segs.push(L.seg);
  });
  (lay.links || []).forEach(k => g.segs.push({ id: "K:" + k.id, name: k.name || "corredor principal", kind: "link", x1: k.x1, y1: k.y1, x2: k.x2, y2: k.y2 }));
  g.entry = lay.entry || { x: g.segs[0].x1, y: g.segs[0].y1 };
}
function place(g) {
  for (const L of g.lanes) {
    const s = L.seg, dx = s.x2 - s.x1, dy = s.y2 - s.y1, len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
    const cols = Math.max(1, Math.ceil(L.list.length / 2));
    let t0 = L.t0, cell = L.cell;
    if (t0 == null) { const m = Math.min(8, len * 0.04); t0 = m; cell = (len - 2 * m) / cols; }
    const ang = Math.atan2(dy, dx) * 180 / Math.PI;
    L.list.forEach((st, k) => {
      const col = Math.floor(k / 2), side = k % 2 ? 1 : -1, t = t0 + col * cell + cell / 2;
      st.door = { x: s.x1 + ux * t, y: s.y1 + uy * t };
      st.bw = Math.max(4, Math.min(cell - 6, 46)); st.bh = g.depth; st.ang = ang;
      const off = g.cw / 2 + 2 + g.depth / 2;
      st.cx = st.door.x + nx * side * off; st.cy = st.door.y + ny * side * off;
      st.lane = L;
    });
  }
}
MM.build = function (raw, layouts) {
  MM.MARCOS = (layouts && layouts.marcos) || {};
  const stores = raw.map(MM.mk), G = {};
  for (const s of stores) (G[s.g] || (G[s.g] = { key: s.g, b: s.b, f: s.f, stores: [] })).stores.push(s);
  for (const g of Object.values(G)) {
    const by = {};
    for (const s of g.stores) (by[s.cor] || (by[s.cor] = [])).push(s);
    let names = Object.keys(by);
    if (g.key === "shopping|T") names.sort((a, b) => (SHOP_T_ORDER.indexOf(a) + 1 || 99) - (SHOP_T_ORDER.indexOf(b) + 1 || 99));
    else names.sort((a, b) => a.localeCompare(b, "pt", { numeric: true }));
    g.lanes = names.map(name => ({ name, slug: slugify(name), list: by[name].sort((a, b) => a.ord - b.ord || a.n.localeCompare(b.n)) }));
    const lay = layouts && layouts[g.key];
    if (lay && lay.lanes) custom(g, lay); else schematic(g);
    place(g);
  }
  return { stores, G };
};
MM.groupOrder = function (G) {
  const fo = ["T", "P1", "SS", "G3"];
  return Object.keys(G).sort((a, b) => { const [ba, fa] = a.split("|"), [bb, fb] = b.split("|"); return MM.BORDER.indexOf(ba) - MM.BORDER.indexOf(bb) || fo.indexOf(fa) - fo.indexOf(fb); });
};
MM.layoutOf = function (g) {
  const lay = { v: 1, cw: g.cw, depth: g.depth, mpu: g.mpu, bg: g.bg || null, lanes: {}, links: [], entry: { x: r1(g.entry.x), y: r1(g.entry.y) } };
  for (const s of g.segs) {
    const q = { x1: r1(s.x1), y1: r1(s.y1), x2: r1(s.x2), y2: r1(s.y2) };
    if (s.kind === "lane") lay.lanes[s.id.slice(2)] = q; else lay.links.push(Object.assign({ id: s.id.slice(2), name: s.name }, q));
  }
  return lay;
};
MM.bounds = function (g) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const add = (x, y, p) => { x0 = Math.min(x0, x - p); y0 = Math.min(y0, y - p); x1 = Math.max(x1, x + p); y1 = Math.max(y1, y + p); };
  const pad = g.cw / 2 + g.depth + 14;
  for (const s of g.segs) { add(s.x1, s.y1, pad); add(s.x2, s.y2, pad); }
  add(g.entry.x, g.entry.y, 44);
  if (g.bg) { add(0, 0, 0); add(g.bg.w, g.bg.h, 0); }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
};

/* ---------- geometria e rotas ---------- */
function proj(p, s) {
  const dx = s.x2 - s.x1, dy = s.y2 - s.y1, L2 = dx * dx + dy * dy || 1;
  let t = ((p.x - s.x1) * dx + (p.y - s.y1) * dy) / L2; t = Math.max(0, Math.min(1, t));
  const x = s.x1 + t * dx, y = s.y1 + t * dy;
  return { x, y, t, d: Math.hypot(p.x - x, p.y - y) };
}
function inter(a, b) {
  const d = (a.x2 - a.x1) * (b.y2 - b.y1) - (a.y2 - a.y1) * (b.x2 - b.x1);
  if (Math.abs(d) < 1e-9) return null;
  const t = ((b.x1 - a.x1) * (b.y2 - b.y1) - (b.y1 - a.y1) * (b.x2 - b.x1)) / d;
  const u = ((b.x1 - a.x1) * (a.y2 - a.y1) - (b.y1 - a.y1) * (a.x2 - a.x1)) / d;
  const e = 1e-6;
  if (t < -e || t > 1 + e || u < -e || u > 1 + e) return null;
  return { x: a.x1 + t * (a.x2 - a.x1), y: a.y1 + t * (a.y2 - a.y1) };
}
MM.nearest = function (g, p, exceptId) {
  let best = null;
  g.segs.forEach((s, i) => { if (s.id === exceptId) return; const q = proj(p, s); if (!best || q.d < best.d) best = Object.assign(q, { i, seg: s }); });
  return best;
};
function solve(g, from, tos) {
  const segs = g.segs, TOL = 14, nodes = [], idx = new Map(), adj = [], brk = segs.map(() => []);
  const node = (x, y) => { const k = Math.round(x * 2) + "," + Math.round(y * 2); let id = idx.get(k); if (id == null) { id = nodes.length; idx.set(k, id); nodes.push({ x, y }); adj.push([]); } return id; };
  const edge = (a, b, w, si) => { if (a === b) return; adj[a].push({ to: b, w, si }); adj[b].push({ to: a, w, si }); };
  const add = (i, p) => { const q = proj(p, segs[i]); const id = node(q.x, q.y); brk[i].push({ t: q.t, id }); return id; };
  segs.forEach((s, i) => { add(i, { x: s.x1, y: s.y1 }); add(i, { x: s.x2, y: s.y2 }); });
  for (let i = 0; i < segs.length; i++) for (let j = i + 1; j < segs.length; j++) {
    const p = inter(segs[i], segs[j]);
    if (p) { add(i, p); add(j, p); }
    for (const [a, b] of [[i, j], [j, i]]) for (const e of [{ x: segs[b].x1, y: segs[b].y1 }, { x: segs[b].x2, y: segs[b].y2 }]) {
      const q = proj(e, segs[a]);
      if (q.d < TOL && q.d > 0.01) edge(add(a, q), node(e.x, e.y), q.d, b);
    }
  }
  const nf = MM.nearest(g, from);
  if (!nf) return null;
  const S = add(nf.i, nf);
  const Ds = tos.map(p => { const q = MM.nearest(g, p); return q ? add(q.i, q) : -1; });
  segs.forEach((s, i) => { const L = Math.hypot(s.x2 - s.x1, s.y2 - s.y1); brk[i].sort((a, b) => a.t - b.t); for (let k = 1; k < brk[i].length; k++) edge(brk[i][k - 1].id, brk[i][k].id, (brk[i][k].t - brk[i][k - 1].t) * L, i); });
  const dist = nodes.map(() => Infinity), prev = nodes.map(() => null), done = nodes.map(() => false);
  dist[S] = 0;
  for (;;) {
    let u = -1; for (let i = 0; i < nodes.length; i++) if (!done[i] && (u < 0 || dist[i] < dist[u])) u = i;
    if (u < 0 || dist[u] === Infinity) break; done[u] = true;
    for (const e of adj[u]) if (dist[u] + e.w < dist[e.to]) { dist[e.to] = dist[u] + e.w; prev[e.to] = { u, si: e.si }; }
  }
  return { nodes, dist, prev, S, Ds, segs };
}
MM.route = function (g, from, to) {
  const r = solve(g, from, [to]);
  if (!r || r.Ds[0] < 0 || r.dist[r.Ds[0]] === Infinity) return null;
  const D = r.Ds[0], { nodes, prev, segs } = r, pts = [], es = [];
  for (let v = D; v != null; v = prev[v] ? prev[v].u : null) { pts.unshift(nodes[v]); if (prev[v]) es.unshift({ si: prev[v].si, len: Math.hypot(nodes[v].x - nodes[prev[v].u].x, nodes[v].y - nodes[prev[v].u].y) }); }
  const legs = [];
  for (const e of es) { const l = legs[legs.length - 1]; if (l && l.seg === segs[e.si]) l.len += e.len; else legs.push({ seg: segs[e.si], len: e.len }); }
  return { pts, legs, len: r.dist[D] };
};
/* distâncias (em unidades do mapa) de um ponto até várias portas, com um único cálculo por piso */
MM.routeLens = function (g, from, tos) {
  const r = solve(g, from, tos);
  return tos.map((_, i) => r && r.Ds[i] >= 0 ? r.dist[r.Ds[i]] : Infinity);
};
MM.meters = (u, g) => Math.max(5, Math.round(u * g.mpu / 5) * 5);
/* passo a passo dentro de um piso: de `from` até a porta da loja `s` */
MM.walk = function (g, from, s, label) {
  const r = MM.route(g, from, s.door), steps = [];
  const arrive = side => `Chegou: <b>${esc(s.n)}</b>${s.num ? ` — loja <b>${esc(s.num)}</b>` : ""}${side ? ", " + side : ""}.`;
  if (!r) { steps.push(`${label} vá até a <b>${esc(s.lane.name)}</b>.`); steps.push(arrive("")); return { pts: [from, s.door], steps }; }
  const legs = r.legs.filter(l => l.len * g.mpu >= 1.5);
  const via = l => l.seg.kind === "lane" ? `pela <b>${esc(l.seg.name)}</b>` : (/^corredor|^passarela|^escada|^hall/i.test(l.seg.name) ? "pelo" : "por") + ` <b>${esc(l.seg.name)}</b>`;
  legs.forEach((l, i) => {
    const m = MM.meters(l.len, g);
    if (i === 0) steps.push(`${label} siga ${via(l)} por ~${m} m.`);
    else if (l.seg.kind === "lane") steps.push(`Entre na <b>${esc(l.seg.name)}</b> e ande ~${m} m.`);
    else steps.push(`Continue ${via(l)} por ~${m} m.`);
  });
  if (!legs.length) steps.push(`${label} a loja está a poucos passos, na <b>${esc(s.lane.name)}</b>.`);
  let side = "";
  const n = r.pts.length;
  if (n >= 2) {
    const a = r.pts[n - 2], b = r.pts[n - 1], dx = b.x - a.x, dy = b.y - a.y;
    if (Math.hypot(dx, dy) > 2) side = (dx * (s.cy - s.door.y) - dy * (s.cx - s.door.x)) > 0 ? "à sua direita" : "à sua esquerda";
  }
  steps.push(arrive(side));
  return { pts: [from].concat(r.pts), steps };
};

/* ---------- trajeto completo (entre pisos e prédios), distâncias e ordem por proximidade ---------- */
const plen = pts => { let d = 0; for (let i = 1; i < pts.length; i++) d += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); return d; };
MM.PEN = { floor: 25, building: 90 };   // metros "equivalentes" para trocar de andar ou de prédio
MM.VN = { escada: { a: "a escada rolante", d: "da escada" }, elevador: { a: "o elevador", d: "do elevador" } };
/* ponto de passagem entre pisos: escada/elevador marcado no piso (o mais perto de `from`); sem marcos, a entrada/escadas do piso */
MM.vert = function (fg, from) {
  const ms = (MM.MARCOS[fg.key] || []).filter(m => MM.VN[m.t]);
  if (!ms.length) return { x: fg.entry.x, y: fg.entry.y, t: null };
  const d = MM.routeLens(fg, from, ms.map(m => ({ x: m.x, y: m.y })));
  let bi = 0; d.forEach((v, i) => { if (v < d[bi]) bi = i; });
  return { x: ms[bi].x, y: ms[bi].y, t: ms[bi].t };
};
/* onde a pessoa chega no piso de destino: escada/elevador do mesmo tipo mais próximo da posição de origem (as escadas se alinham entre pisos) */
MM.arrival = function (g, ex) {
  const ms = (MM.MARCOS[g.key] || []).filter(m => MM.VN[m.t]);
  if (!ms.length || !ex.t) return { x: g.entry.x, y: g.entry.y };
  const same = ms.filter(m => m.t === ex.t), pool = same.length ? same : ms;
  let b = pool[0]; pool.forEach(m => { if (Math.hypot(m.x - ex.x, m.y - ex.y) < Math.hypot(b.x - ex.x, b.y - ex.y)) b = m; });
  return { x: b.x, y: b.y };
};
MM.leg = function (G, from, s, label) {
  const g = G[s.g], B = MM.BUILD[s.b], steps = [], parts = [], vert = []; let m = 0, warn = "";
  const floorMove = (f0, how) => {
    if (s.f === f0) return;
    if (s.f === "G3" || f0 === "G3") steps.push(`Vá até a área <b>${MM.FLOORS[s.f]}</b> (siga as placas “G3”).`);
    else steps.push(`Pegue ${how || "a escada rolante/elevador"} e ${MM.FLEVEL[s.f] > MM.FLEVEL[f0] ? "suba" : "desça"} para o <b>${MM.FLOORS[s.f]}</b>.`);
  };
  const walkIn = (start, lab) => { const w = MM.walk(g, start, s, lab); steps.push(...w.steps); parts.push({ g: g.key, pts: w.pts }); m += plen(w.pts) * g.mpu; };
  const exitTo = (fg, to) => { to = to || fg.entry; const r = MM.route(fg, from, to); if (r) { parts.push({ g: fg.key, pts: [from].concat(r.pts) }); m += r.len * fg.mpu; } };
  const fg = from && G[from.g];
  if (!fg) {
    steps.push(`Vá até o <b>${B.name}</b> (${esc(B.addr)}).`); floorMove("T"); walkIn(g.entry, "Da entrada,");
    warn = "Marque sua posição (📍, QR Code do corredor ou “Estou nesta loja”) para a rota sair de onde você está.";
  } else if (fg.b !== s.b) {
    steps.push(`Saia do <b>${MM.BUILD[fg.b].name}</b> e vá ao <b>${B.name}</b> — os prédios do complexo ficam lado a lado.`);
    exitTo(fg); m += MM.PEN.building; floorMove("T"); if (s.f !== "T") m += MM.PEN.floor; walkIn(g.entry, "Da entrada,");
  } else if (from.g !== s.g) {
    const ex = MM.vert(fg, from), ar = MM.arrival(g, ex), nm = ex.t ? MM.VN[ex.t] : null;
    steps.push(nm ? `Vá até ${nm.a} mais perto de você (marcado no mapa com ${MM.MT[ex.t][0]}).` : "Vá até a escada/elevador mais próximo.");
    exitTo(fg, ex); m += MM.PEN.floor; floorMove(fg.f, nm && nm.a); walkIn(ar, ex.t ? "Saindo " + nm.d + "," : "Saindo da escada,");
    const up = MM.FLEVEL[s.f] > MM.FLEVEL[fg.f], fl = MM.FLOORS[s.f].split(" ·")[0];
    vert.push({ g: fg.key, x: ex.x, y: ex.y, text: (up ? "↑ Suba" : "↓ Desça") + " para o " + fl }, { g: g.key, x: ar.x, y: ar.y, text: "Você chega aqui" });
  } else walkIn(from, label || "De onde você está,");
  return { steps, warn, m, parts, vert };
};
/* metros (aprox.) de `from` até a porta de cada loja — usado para ordenar listas "do mais perto ao mais longe" */
MM.distMany = function (G, from, stores) {
  const out = new Map(), by = {}; stores.forEach(s => (by[s.g] || (by[s.g] = [])).push(s));
  const fg = G[from.g]; let toEntry = null;
  const fin = d => isFinite(d) ? d : 9999;
  for (const k in by) {
    const g = G[k], list = by[k];
    if (k === from.g) { const d = MM.routeLens(g, from, list.map(s => s.door)); list.forEach((s, i) => out.set(s.id, fin(d[i] * g.mpu))); continue; }
    if (toEntry == null) toEntry = fin(MM.routeLens(fg, from, [fg.entry])[0] * fg.mpu);
    const pen = g.b === fg.b ? MM.PEN.floor : MM.PEN.building + (g.f === "T" ? 0 : MM.PEN.floor);
    const d = MM.routeLens(g, g.entry, list.map(s => s.door));
    list.forEach((s, i) => out.set(s.id, toEntry + pen + fin(d[i] * g.mpu)));
  }
  return out;
};
/* ordem de visita "vizinho mais próximo": a cada parada, vai para a loja restante mais perto da anterior */
MM.orderNearest = function (G, ref, stores) {
  const left = stores.slice(), out = []; let cur = ref;
  while (left.length) {
    const d = MM.distMany(G, cur, left); let bi = 0;
    left.forEach((s, i) => { if (d.get(s.id) < d.get(left[bi].id)) bi = i; });
    const s = left.splice(bi, 1)[0]; out.push(s); cur = { g: s.g, x: s.door.x, y: s.door.y };
  }
  return out;
};

/* otimizar rota: agrupa por piso e corredor/ala, visita um corredor inteiro antes de passar ao próximo */
MM.orderRoute = function (G, ref, stores) {
  const left = stores.slice(), out = []; let cur = ref;
  const ck = s => s.g + "|" + s.cor;
  while (left.length) {
    const d = MM.distMany(G, cur, left); let bi = 0;
    left.forEach((s, i) => { if (d.get(s.id) < d.get(left[bi].id)) bi = i; });
    const first = left[bi], key = ck(first);
    const grp = left.filter(s => ck(s) === key), rest = left.filter(s => ck(s) !== key);
    left.length = 0; left.push(...rest);
    let c2 = cur;
    /* dentro do corredor: do mais perto para o mais longe a partir de onde entra */
    const todo = grp.slice();
    while (todo.length) {
      const dd = MM.distMany(G, c2, todo); let k = 0;
      todo.forEach((s, i) => { if (dd.get(s.id) < dd.get(todo[k].id)) k = i; });
      const s = todo.splice(k, 1)[0]; out.push(s); c2 = { g: s.g, x: s.door.x, y: s.door.y };
    }
    cur = c2;
  }
  return out;
};
/* nome do corredor mais próximo de um ponto do piso */
MM.laneAt = function (g, p) {
  let best = null, bd = Infinity;
  for (const L of g.lanes || []) {
    const sg = L.seg, dx = sg.x2 - sg.x1, dy = sg.y2 - sg.y1, l2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((p.x - sg.x1) * dx + (p.y - sg.y1) * dy) / l2));
    const d = Math.hypot(p.x - (sg.x1 + t * dx), p.y - (sg.y1 + t * dy));
    if (d < bd) { bd = d; best = L; }
  }
  return best && bd < (g.cw || 30) * 2.2 ? best.name : null;
};
/* horário de funcionamento: MM_CONFIG.horario = { "0":null, "2":"08:00-18:00", ... } (0 = domingo); sem config, devolve null */
MM.openState = function (now, hor) {
  hor = hor || (window.MM_CONFIG && MM_CONFIG.horario); if (!hor) return null;
  now = now || new Date();
  const tm = v => { const m = /^(\d{1,2}):(\d{2})$/.exec(v); return m ? +m[1] * 60 + +m[2] : null; };
  const slot = d => { const v = hor[d]; if (!v) return null; const [a, b] = String(v).split("-"); const x = tm(a), y = tm(b); return x == null || y == null ? null : [x, y]; };
  const dn = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"], cur = now.getHours() * 60 + now.getMinutes(), t = slot(now.getDay());
  if (t && cur >= t[0] && cur < t[1]) { const left = t[1] - cur; return left <= 60 ? { open: true, soon: true, txt: `Fecha em ${left} min` } : { open: true, txt: "Aberto agora" }; }
  if (t && cur < t[0]) return { open: false, txt: `Abre hoje às ${String(Math.floor(t[0] / 60)).padStart(2, "0")}:${String(t[0] % 60).padStart(2, "0")}` };
  for (let k = 1; k <= 7; k++) { const d = (now.getDay() + k) % 7, n = slot(d); if (n) return { open: false, txt: `Fechado · abre ${k === 1 ? "amanhã" : dn[d]} ${String(Math.floor(n[0] / 60)).padStart(2, "0")}:${String(n[0] % 60).padStart(2, "0")}` }; }
  return { open: false, txt: "Fechado" };
};

/* ---------- QR Codes de posição ---------- */
MM.qrPoints = function (g) {
  const base = "qr-" + g.b + "-" + g.f.toLowerCase() + "-", out = [{ code: base + "entrada", label: "Entrada", x: g.entry.x, y: g.entry.y }];
  for (const L of g.lanes) [[0.03, "início"], [0.5, "meio"], [0.97, "fim"]].forEach(([t, nm], k) => {
    const s = L.seg; out.push({ code: base + L.slug + "-" + (k + 1), label: L.name + " · " + nm, x: s.x1 + (s.x2 - s.x1) * t, y: s.y1 + (s.y2 - s.y1) * t });
  });
  return out;
};
MM.resolveQR = function (hash, G) {
  const m = /^qr-(shopping|park|mini)-(t|p1|ss|g3)-(.+)$/.exec(hash || "");
  if (!m) return null;
  const g = G[m[1] + "|" + m[2].toUpperCase()]; if (!g) return null;
  const p = MM.qrPoints(g).find(q => q.code === hash);
  return p ? { g: g.key, x: p.x, y: p.y, label: p.label } : null;
};

/* ---------- desenho ---------- */
function lines(name) {
  const out = [""];
  for (const w of name.split(/\s+/)) {
    const cur = out[out.length - 1];
    if ((cur + " " + w).trim().length <= 10) out[out.length - 1] = (cur + " " + w).trim();
    else if (out.length < 2) out.push(w.slice(0, 10));
    else { out[1] = out[1].slice(0, 9) + "…"; break; }
  }
  return out;
}
function routeSvg(paths) {
  let h = "";
  paths.forEach((path, k) => {
    if (!path || path.length < 2) return;
    const pts = path.map(p => r1(p.x) + "," + r1(p.y)).join(" ");
    h += `<polyline points="${pts}" fill="none" stroke="var(--halo,#fff)" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" pointer-events="none"/>` +
      `<polyline class="route" points="${pts}" fill="none" stroke="var(--me)" stroke-width="4" stroke-dasharray="8 4" stroke-linejoin="round" stroke-linecap="round" pointer-events="none"/>`;
  });
  return h;
}
MM.draw = function (g, o) {
  o = o || {}; let h = "";
  const paths = o.paths || (o.path ? [o.path] : []);
  if (g.bg) h += `<image href="${g.bg.src}" x="0" y="0" width="${g.bg.w}" height="${g.bg.h}" opacity="${o.edit ? 0.75 : 0.45}" preserveAspectRatio="none"/>`;
  for (const s of g.segs) {
    const col = o.selSeg === s.id ? "#f0b65c" : s.loose ? "#f3c1b8" : s.kind === "link" && o.edit ? "#d9cdbd" : "var(--corr)";
    h += `<line ${o.edit ? `data-h="${s.id}|m"` : ""} x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}" stroke="${col}" stroke-width="${g.cw}" stroke-linecap="round" ${g.bg ? 'opacity=".85"' : ""}/>`;
  }
  { const e = g.entry; h += `<g ${o.edit ? 'data-h="entry" style="cursor:move"' : ""}><rect x="${e.x - 44}" y="${e.y - 11}" width="88" height="22" rx="6" fill="var(--acc2)"/><text x="${e.x}" y="${e.y + 3.5}" font-size="9" font-weight="800" fill="#fff" text-anchor="middle">Entrada/Escadas</text></g>`; }
  for (const s of g.stores) {
    const on = !o.filter || o.filter(s), sel = o.sel === s.id, col = MM.SEGCOLOR[s.prim] || "#999";
    const k = Math.min(1, s.bw / 40, s.bh / 30), ls = lines(s.n);
    h += `<g data-id="${s.id}" class="${s.dest || s.prim === "Alimentação" ? "anc" : ""}" opacity="${on ? 1 : 0.2}" style="cursor:pointer" transform="translate(${r1(s.cx)} ${r1(s.cy)}) rotate(${r1(s.ang)})">` +
      `<rect x="${-s.bw / 2}" y="${-s.bh / 2}" width="${s.bw}" height="${s.bh}" rx="6" fill="${sel ? "var(--sel,#fff4d6)" : s.vaga ? "var(--vaga,#fff1c2)" : s.dest ? "var(--dest,#fffaf0)" : "var(--store)"}" stroke="${sel ? "var(--acc)" : s.vaga ? "#c98a00" : s.dest ? "#e2a400" : col}" stroke-width="${sel ? 2.4 : s.dest || s.vaga ? 1.8 : 1}"${s.vaga ? ' stroke-dasharray="4 2"' : ""}/>` +
      `<rect class="tint" x="${-s.bw / 2}" y="${-s.bh / 2}" width="${s.bw}" height="${s.bh}" rx="6" fill="${col}" pointer-events="none"/>` +
      `<rect x="${-s.bw / 2}" y="${-s.bh / 2}" width="${s.bw}" height="4" rx="2" fill="${col}"/>`;
    if (k > 0.45) {
      h += `<g transform="rotate(${r1(-s.ang)})"><g class="zi">${MM.icoSvg(s.ik, 0, -10.5 * k, 11 * k, s.vaga ? "#c98a00" : col)}</g>` +
        `<text class="zl" y="${ls.length > 1 ? r1(1.5 * k) : r1(3.5 * k)}" font-size="${r1(6.2 * k)}" font-weight="700" text-anchor="middle" fill="var(--ink,#2a2420)">${ls.map((t, i) => `<tspan x="0" dy="${i ? r1(7 * k) : 0}">${esc(t)}</tspan>`).join("")}</text>` +
        `<text class="zn" y="${r1(15 * k)}" font-size="${r1(5.4 * k)}" text-anchor="middle" fill="var(--mut,#8a7d72)">${s.dest ? "★ " : ""}${esc(s.num.slice(0, 12))}</text></g>`;
    } else if (s.bw >= 9) h += `<g class="zi" transform="rotate(${r1(-s.ang)})">${MM.icoSvg(s.ik, 0, 0, 9, s.vaga ? "#c98a00" : col)}</g>`;
    h += `</g>`;
  }
  for (const L of g.lanes) {
    const s = L.seg, len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1) || 1, ux = (s.x2 - s.x1) / len, uy = (s.y2 - s.y1) / len;
    let a = Math.atan2(uy, ux) * 180 / Math.PI; const flip = a > 90.01 || a < -90.01; if (flip) a += 180;
    const lab = (t, anchor) => { const x = r1(s.x1 + ux * t), y = r1(s.y1 + uy * t); return `<text class="zc" x="${x}" y="${y}" dy="3" font-size="8.5" font-weight="800" fill="var(--acc2)" text-anchor="${anchor}" transform="rotate(${r1(a)} ${x} ${y})" pointer-events="none">${esc(L.name)}</text>`; };
    h += lab(6, flip ? "end" : "start");
    if (len > 260) h += lab(len - 6, flip ? "start" : "end");
  }
  h += routeSvg(paths);
  (o.badges || []).forEach(bd => { h += MM.badgeSvg(bd.x, bd.y, bd.text, !!MM.dark); });
  if (paths.length && (!o.stops || o.fac)) { const l = paths[paths.length - 1], e = l[l.length - 1]; if (e) h += `<circle cx="${r1(e.x)}" cy="${r1(e.y)}" r="6" fill="var(--acc)" stroke="#fff" stroke-width="2" pointer-events="none"/>`; }
  if (o.stops) for (const s of g.stores) { const n = o.stops[s.id]; if (n) h += `<g transform="translate(${r1(s.door.x)} ${r1(s.door.y)})" pointer-events="none"><g class="pin"><path d="M0 0C-3-8-11-12-11-20a11 11 0 0122 0C11-12 3-8 0 0z" fill="var(--lst)" stroke="#fff" stroke-width="2.4"/><text y="-16.5" font-size="11" font-weight="900" fill="#fff" text-anchor="middle">${n}</text></g></g>`; }
  if (o.me) h += `<g transform="translate(${o.me.x} ${o.me.y})" pointer-events="none"><g class="pin"><circle class="pulse" r="8" fill="var(--me)"/><circle r="9" fill="var(--me)" stroke="#fff" stroke-width="3"/><circle r="3" fill="#fff"/></g></g>`;
  for (const m of (MM.MARCOS[g.key] || [])) { const t = MM.MT[m.t]; if (t) h += `<g pointer-events="none"><circle cx="${r1(m.x)}" cy="${r1(m.y)}" r="9.5" fill="var(--panel,#fff)" stroke="var(--acc2,#2b2860)" stroke-width="1.8"/><text x="${r1(m.x)}" y="${r1(m.y + 4)}" font-size="11" text-anchor="middle">${t[0]}</text></g>`; }
  if (o.qr) for (const p of o.qr) h += `<g pointer-events="none"><rect x="${p.x - 5}" y="${p.y - 5}" width="10" height="10" rx="2" fill="#111"/><rect x="${p.x - 2.5}" y="${p.y - 2.5}" width="5" height="5" fill="#fff"/></g>`;
  if (o.edit) for (const s of g.segs.filter(x => x.kind === "link").concat(g.segs.filter(x => x.kind === "lane"))) for (const k of [1, 2]) {
    h += `<circle data-h="${s.id}|${k}" cx="${s["x" + k]}" cy="${s["y" + k]}" r="8" fill="${s.kind === "lane" ? "var(--acc2)" : "var(--acc)"}" stroke="#fff" stroke-width="2.5" style="cursor:move"/>`;
  }
  return h;
};

/* ---------- visão 3D (projeção ortográfica inclinada, girável) ---------- */
MM.proj3 = function (g, rot) {
  const b = MM.bounds(g), cx = b.x + b.w / 2, cy = b.y + b.h / 2, th = (rot || 0) * Math.PI / 180, c = Math.cos(th), s = Math.sin(th), K = 0.62, Z = 0.79;
  const P = (x, y, z) => { const dx = x - cx, dy = y - cy; return { x: dx * c - dy * s, y: (dx * s + dy * c) * K - (z || 0) * Z }; };
  const inv = (sx, sy) => { const xr = sx, yr = sy / K; return { x: cx + c * xr + s * yr, y: cy - s * xr + c * yr }; };
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of [[b.x, b.y], [b.x + b.w, b.y], [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]]) for (const z of [-9, 28]) { const p = P(x, y, z); x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
  return { P, inv, c, s, K, Z, cx, cy, rot: rot || 0, b, bounds: { x: x0 - 6, y: y0 - 6, w: x1 - x0 + 12, h: y1 - y0 + 12 } };
};
function hexMix(h, to, t) {
  if (!/^#[0-9a-f]{6}$/i.test(h)) return h;
  const n = parseInt(h.slice(1), 16), f = v => Math.round(v + (to - v) * t);
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
MM.badgeSvg = (x, y, text, D) => { const w = text.length * 5.4 + 16; return `<g pointer-events="none"><rect x="${r1(x - w / 2)}" y="${r1(y - 22)}" width="${r1(w)}" height="16" rx="8" fill="${D ? "#ffc933" : "#2b2860"}" stroke="${D ? "#14132e" : "#fff"}" stroke-width="1.5"/><text x="${r1(x)}" y="${r1(y - 10.5)}" font-size="9" font-weight="800" fill="${D ? "#16163f" : "#fff"}" text-anchor="middle">${esc(text)}</text><circle cx="${r1(x)}" cy="${r1(y)}" r="3" fill="${D ? "#ffc933" : "#2b2860"}"/></g>`; };
MM.draw3d = function (g, o) {
  o = o || {}; const V = o.V, P = V.P, pt = p => r1(p.x) + "," + r1(p.y);
  const paths = o.paths || (o.path ? [o.path] : []);
  const poly = (ps, fill, stroke, sw, ex) => `<polygon points="${ps.map(pt).join(" ")}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw || 1}" stroke-linejoin="round"` : ""}${ex || ""}/>`;
  const vis = (nx, ny) => (nx * V.s + ny * V.c) * V.K > 0.001;
  const D = !!MM.dark, INK = D ? "#f2f1fb" : "#2a2420";
  const halo = ` paint-order="stroke" stroke="${D ? "#14132e" : "#fff"}" stroke-width="1.6" stroke-linejoin="round"`;
  const box = (cx, cy, ang, bw, bh, H, topFill, sideCol, stroke, sw) => {
    const a = ang * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
    const loc = [[-bw / 2, -bh / 2], [bw / 2, -bh / 2], [bw / 2, bh / 2], [-bw / 2, bh / 2]].map(([x, y]) => ({ x: cx + x * ca - y * sa, y: cy + x * sa + y * ca }));
    let h = "";
    [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([x, y], i) => {
      const nx = x * ca - y * sa, ny = x * sa + y * ca; if (!vis(nx, ny)) return;
      const A = loc[i], B = loc[(i + 1) % 4], lx = nx * V.c - ny * V.s;
      h += poly([P(A.x, A.y, 0), P(B.x, B.y, 0), P(B.x, B.y, H), P(A.x, A.y, H)], hexMix(sideCol, 0, 0.1 + 0.22 * (lx + 1) / 2), "rgba(0,0,0,.18)", 0.5);
    });
    h += poly(loc.map(p => P(p.x, p.y, H)), topFill, stroke, sw);
    return { h, top: P(cx, cy, H) };
  };
  let h = "";
  const b = V.b, corners = [[b.x, b.y], [b.x + b.w, b.y], [b.x + b.w, b.y + b.h], [b.x, b.y + b.h]];
  [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([nx, ny], i) => {
    if (!vis(nx, ny)) return; const A = corners[i], B = corners[(i + 1) % 4];
    h += poly([P(A[0], A[1], 0), P(B[0], B[1], 0), P(B[0], B[1], -9), P(A[0], A[1], -9)], D ? "#0c0b22" : "#cdbfab", D ? "#05051a" : "#bba98f", 0.8);
  });
  h += poly(corners.map(([x, y]) => P(x, y, 0)), D ? "#1b1a3b" : "#f4ede2", D ? "#2e2d5c" : "#dccfbb", 1);
  [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([nx, ny], i) => {
    if (vis(nx, ny)) return; const A = corners[i], B = corners[(i + 1) % 4];
    h += poly([P(A[0], A[1], 0), P(B[0], B[1], 0), P(B[0], B[1], 16), P(A[0], A[1], 16)], D ? "#26254f" : "#e8e0d2", D ? "#3d3c72" : "#b9ad99", 0.9);
  });
  if (g.bg) h += `<image href="${g.bg.src}" x="0" y="0" width="${g.bg.w}" height="${g.bg.h}" opacity="0.45" preserveAspectRatio="none" transform="matrix(${V.c} ${V.K * V.s} ${-V.s} ${V.K * V.c} ${-V.c * V.cx + V.s * V.cy} ${V.K * (-V.s * V.cx - V.c * V.cy)})"/>`;
  for (const s of g.segs) {
    const dx = s.x2 - s.x1, dy = s.y2 - s.y1, len = Math.hypot(dx, dy) || 1, nx = -dy / len * g.cw / 2, ny = dx / len * g.cw / 2;
    h += poly([P(s.x1 + nx, s.y1 + ny, 0.2), P(s.x2 + nx, s.y2 + ny, 0.2), P(s.x2 - nx, s.y2 - ny, 0.2), P(s.x1 - nx, s.y1 - ny, 0.2)], s.kind === "link" ? (D ? "#2a2953" : "#e6d9c6") : (D ? "#302f5c" : "#ece1d0"), D ? "#3b3a6b" : "#d9cbb6", 0.6);
  }
  for (const L of g.lanes) {
    const s = L.seg, len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1) || 1, ux = (s.x2 - s.x1) / len, uy = (s.y2 - s.y1) / len;
    const lab = (t, anchor) => { const p = P(s.x1 + ux * t, s.y1 + uy * t, 0.4); return `<text x="${r1(p.x)}" y="${r1(p.y + 2.5)}" font-size="7.5" font-weight="800" fill="${D ? "#c9c6ff" : "#2b2860"}" text-anchor="${anchor}" pointer-events="none"${halo}>${esc(L.name)}</text>`; };
    h += lab(10, "start"); if (len > 260) h += lab(len - 10, "end");
  }
  for (const s of g.segs) {
    if (s.kind === "link") continue;
    const dx = s.x2 - s.x1, dy = s.y2 - s.y1, len = Math.hypot(dx, dy) || 1, nx = -dy / len * g.cw / 2, ny = dx / len * g.cw / 2, ec = D ? "#4b4a86" : "#b7a78d";
    [1, -1].forEach(k => { const a = P(s.x1 + nx * k, s.y1 + ny * k, 0.3), c = P(s.x2 + nx * k, s.y2 + ny * k, 0.3); h += `<line x1="${r1(a.x)}" y1="${r1(a.y)}" x2="${r1(c.x)}" y2="${r1(c.y)}" stroke="${ec}" stroke-width="1" pointer-events="none"/>`; });
  }
  for (const s of g.stores) { if (!s.door) continue; const a = P(s.door.x, s.door.y, 0.5); h += `<ellipse cx="${r1(a.x)}" cy="${r1(a.y)}" rx="3.2" ry="${r1(3.2 * V.K)}" fill="${s.vaga ? "#e2a400" : (D ? "#8f89ff" : "#2b2860")}" opacity=".85" pointer-events="none"/>`; }
  { const e = g.entry, bx = box(e.x, e.y, 0, 88, 22, 7, "#2b2860", "#2b2860", "#16163f", 0.8); h += bx.h + `<text x="${r1(bx.top.x)}" y="${r1(bx.top.y + 3)}" font-size="8" font-weight="800" fill="#fff" text-anchor="middle" pointer-events="none">Entrada/Escadas</text>`; }
  const depth = s => { const dx = s.cx - V.cx, dy = s.cy - V.cy; return dx * V.s + dy * V.c; };
  const stores = g.stores.slice().sort((a, b) => depth(a) - depth(b)), tops = {};
  for (const s of stores) {
    const on = !o.filter || o.filter(s), sel = o.sel === s.id, col = MM.SEGCOLOR[s.prim] || "#999";
    const H = !on ? 3 : sel ? 26 : s.dest ? 18 : 14, k = Math.min(1, s.bw / 40), wall = D ? "#4a4880" : "#d8d0c2";
    const bx = box(s.cx, s.cy, s.ang, s.bw, s.bh, H, sel ? (D ? "#5a2a55" : "#ffe4ee") : s.vaga ? (D ? "#5a4a12" : "#ffe69a") : s.dest ? (D ? "#34304f" : "#fffaf0") : (D ? hexMix(col, 22, 0.7) : hexMix(col, 255, 0.78)), sel ? col : wall, sel ? "#cc3366" : s.vaga ? "#c98a00" : s.dest ? "#e2a400" : "rgba(0,0,0,.25)", sel ? 2 : s.dest ? 1.6 : 0.6);
    tops[s.id] = bx.top;
    h += `<g data-id="${s.id}" opacity="${on ? 1 : 0.35}" style="cursor:pointer">${bx.h}`;
    if (on) {
      h += MM.icoSvg(s.ik, bx.top.x, bx.top.y - 2, Math.max(8, 11 * k), s.vaga ? "#c98a00" : (D ? hexMix(col, 255, 0.35) : col));
      if (k > 0.5) h += `<text x="${r1(bx.top.x)}" y="${r1(bx.top.y + 8)}" font-size="${r1(5.8 * k)}" font-weight="700" fill="${INK}" text-anchor="middle" pointer-events="none"${halo}>${esc(lines(s.n)[0])}</text>`;
    }
    h += `</g>`;
  }
  for (const m of (MM.MARCOS[g.key] || [])) { const t = MM.MT[m.t]; if (!t) continue; const p = P(m.x, m.y, 3); h += `<g pointer-events="none"><circle cx="${r1(p.x)}" cy="${r1(p.y)}" r="9.5" fill="${D ? "#232250" : "#fff"}" stroke="${D ? "#8f89ff" : "#2b2860"}" stroke-width="1.8"/><text x="${r1(p.x)}" y="${r1(p.y + 4)}" font-size="11" text-anchor="middle">${t[0]}</text></g>`; }
  const lift = paths.map(pa => (pa || []).map(p => P(p.x, p.y, 1.5)));
  lift.forEach(pa => { if (pa.length < 2) return; const pts = pa.map(pt).join(" "); h += `<polyline points="${pts}" fill="none" stroke="${D ? "#14132e" : "#fff"}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" pointer-events="none"/><polyline class="route" points="${pts}" fill="none" stroke="var(--me)" stroke-width="4" stroke-dasharray="8 4" stroke-linejoin="round" stroke-linecap="round" pointer-events="none"/>`; });
  const pin = (p, fill, label) => `<g pointer-events="none"><line x1="${r1(p.x)}" y1="${r1(p.y)}" x2="${r1(p.x)}" y2="${r1(p.y - 15)}" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/><circle cx="${r1(p.x)}" cy="${r1(p.y - 20)}" r="8.5" fill="${fill}" stroke="#fff" stroke-width="2.2"/>${label != null ? `<text x="${r1(p.x)}" y="${r1(p.y - 16.8)}" font-size="9.5" font-weight="800" fill="#fff" text-anchor="middle">${label}</text>` : ""}</g>`;
  (o.badges || []).forEach(bd => { const p = P(bd.x, bd.y, 0); h += MM.badgeSvg(p.x, p.y, bd.text, D); });
  if (o.stops) { for (const s of g.stores) { const n = o.stops[s.id]; if (n) h += pin(P(s.door.x, s.door.y, 0), "var(--lst)", n); } }
  if (paths.length && (!o.stops || o.fac)) { const l = paths[paths.length - 1], e = l[l.length - 1]; if (e) h += pin(P(e.x, e.y, 0), "var(--acc)", null); }
  if (o.me) { const p = P(o.me.x, o.me.y, 0); h += `<ellipse class="pulse3" cx="${r1(p.x)}" cy="${r1(p.y)}" rx="13" ry="${r1(13 * V.K)}" fill="var(--me)" opacity=".28" pointer-events="none"/>` + pin(p, "var(--me)", null); }
  return h;
};

/* ---------- arrastar / zoom ---------- */
MM.panZoom = function (svg, wrap, cb) {
  cb = cb || {}; let vb = { x: 0, y: 0, w: 400, h: 400 };
  const set = () => { svg.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.w} ${vb.h}`); if (cb.view) cb.view(vb); };
  const world = (cx, cy) => { const pt = svg.createSVGPoint(); pt.x = cx; pt.y = cy; const m = svg.getScreenCTM(); return m ? pt.matrixTransform(m.inverse()) : { x: 0, y: 0 }; };
  const zoom = (k, px, py) => {
    const r = svg.getBoundingClientRect(), p = world(px == null ? r.left + r.width / 2 : px, py == null ? r.top + r.height / 2 : py);
    const nw = Math.min(8000, Math.max(70, vb.w / k)); k = vb.w / nw;
    vb.x = p.x - (p.x - vb.x) / k; vb.y = p.y - (p.y - vb.y) / k; vb.w /= k; vb.h /= k; set();
  };
  const ptrs = new Map(); let ge = null;
  svg.addEventListener("pointerdown", e => {
    try { svg.setPointerCapture(e.pointerId); } catch (x) {}
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 1) {
      const hd = cb.handle && e.target.closest("[data-h]");
      ge = { mode: hd ? "hold" : "tap", h: hd ? hd.getAttribute("data-h") : null, sx: e.clientX, sy: e.clientY, vb: Object.assign({}, vb), target: e.target };
      if (hd) cb.handle(ge.h, world(e.clientX, e.clientY), "start");
    } else if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()];
      ge = { mode: "pinch", d: Math.hypot(a.x - b.x, a.y - b.y), vb: Object.assign({}, vb), mid: world((a.x + b.x) / 2, (a.y + b.y) / 2) };
    }
  });
  svg.addEventListener("pointermove", e => {
    if (!ptrs.has(e.pointerId) || !ge) return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const r = svg.getBoundingClientRect(), sc = Math.max(ge.vb ? ge.vb.w / r.width : 1, ge.vb ? ge.vb.h / r.height : 1);
    if (ge.mode === "pinch" && ptrs.size === 2) {
      const [a, b] = [...ptrs.values()], k = Math.hypot(a.x - b.x, a.y - b.y) / ge.d;
      const nw = Math.min(8000, Math.max(70, ge.vb.w / k)), kk = ge.vb.w / nw;
      vb.w = ge.vb.w / kk; vb.h = ge.vb.h / kk; vb.x = ge.mid.x - (ge.mid.x - ge.vb.x) / kk; vb.y = ge.mid.y - (ge.mid.y - ge.vb.y) / kk; set();
    } else if (ptrs.size === 1) {
      const dx = e.clientX - ge.sx, dy = e.clientY - ge.sy, far = Math.hypot(dx, dy) > 6;
      if (ge.mode === "tap" && far) ge.mode = "pan";
      if (ge.mode === "hold" && far) ge.mode = "drag";
      if (ge.mode === "pan") { vb.x = ge.vb.x - dx * sc; vb.y = ge.vb.y - dy * sc; set(); }
      if (ge.mode === "drag") cb.handle(ge.h, world(e.clientX, e.clientY), "move");
    }
  });
  const end = e => {
    if (!ptrs.has(e.pointerId)) return; ptrs.delete(e.pointerId);
    if (ge && ptrs.size === 0) {
      if (ge.mode === "drag") cb.handle(ge.h, world(e.clientX, e.clientY), "end");
      else if ((ge.mode === "tap" || ge.mode === "hold") && cb.tap) cb.tap(ge.target, world(e.clientX, e.clientY), ge.h);
    }
    if (ptrs.size === 0) ge = null;
    else if (ptrs.size === 1) { const [a] = [...ptrs.values()]; ge = { mode: "pan", sx: a.x, sy: a.y, vb: Object.assign({}, vb) }; }
  };
  svg.addEventListener("pointerup", end); svg.addEventListener("pointercancel", end);
  svg.addEventListener("wheel", e => { e.preventDefault(); zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY); }, { passive: false });
  return {
    zoom, world, vb: () => vb,
    fit(b, maxW) {
      maxW = maxW || 900; const ar = (wrap.clientWidth || 1) / (wrap.clientHeight || 1);
      let w = Math.min(b.w, maxW), h = w / ar;
      if (maxW === Infinity && h < b.h) { h = b.h; w = h * ar; }
      vb = { x: w >= b.w ? b.x + (b.w - w) / 2 : b.x, y: h >= b.h ? b.y + (b.h - h) / 2 : b.y, w, h }; set();
    },
    center(x, y, w) { const ar = (wrap.clientWidth || 1) / (wrap.clientHeight || 1); w = w || vb.w; vb = { w, h: w / ar, x: x - w / 2, y: y - w / ar / 2 }; set(); }
  };
};
MM.hav = function (a, b, c, d) { const R = 6371e3, r = x => x * Math.PI / 180, dl = r(c - a), dn = r(d - b), h = Math.sin(dl / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
})(window);
