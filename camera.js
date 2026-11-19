/* Modo câmera: vídeo ao vivo + seta no chão apontando o próximo trecho da rota.
   Direção: bússola do celular (precisa alinhar uma vez por piso). Avanço: contador de passos, botão "Próximo"
   ou leitura do QR Code do corredor pela própria câmera. */
(function (W) {
"use strict";
const MM = W.MM, esc = MM.esc;
const diff = (a, b) => ((a - b + 540) % 360) - 180;
const STEP_M = 0.7;
let S = null, el = null;

const CSS = `
#cam{position:fixed;inset:0;z-index:50;background:#111;color:#fff;display:none;font-family:inherit}
#cam video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
#cam .ctop{position:absolute;left:10px;right:10px;top:10px;background:rgba(20,16,14,.78);border-radius:14px;padding:10px 12px;backdrop-filter:blur(6px)}
#cins{font-size:17px;font-weight:800;line-height:1.25}#csub{font-size:13px;opacity:.9;margin-top:3px;line-height:1.35}
#cbar{height:5px;border-radius:5px;background:rgba(255,255,255,.25);margin-top:8px;overflow:hidden}#cbar i{display:block;height:100%;width:0;background:#4da3ff}
#carrow{position:absolute;left:50%;top:56%;width:210px;height:210px;margin:-105px 0 0 -105px;filter:drop-shadow(0 6px 10px rgba(0,0,0,.5));transition:transform .12s linear}
#carrow path{fill:#1a73e8;stroke:#fff;stroke-width:5;stroke-linejoin:round}
#cmini{position:absolute;left:10px;bottom:74px;width:128px;height:128px;border-radius:14px;background:#f6f1ea;border:2px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.4)}
#cmsg{position:absolute;right:10px;left:150px;bottom:78px;font-size:12px;font-weight:700;background:rgba(20,16,14,.78);border-radius:10px;padding:8px 10px;line-height:1.35;display:none}
#cam .cbot{position:absolute;left:10px;right:10px;bottom:12px;display:flex;gap:6px}
#cam .cbot button{flex:1;font:inherit;font-size:13px;font-weight:800;padding:13px 6px;border-radius:12px;border:0;background:rgba(255,255,255,.94);color:#1f1a17;cursor:pointer}
#cam .cbot #cnext{flex:1.6;background:#1a73e8;color:#fff}#cam .cbot #cclose{flex:.6}
#cam.done #carrow{display:none}`;

function ui() {
  if (el) return el;
  const st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
  el = document.createElement("div"); el.id = "cam";
  el.innerHTML = `<video playsinline autoplay muted></video>
    <div class="ctop"><div id="cins"></div><div id="csub"></div><div id="cbar"><i></i></div></div>
    <svg id="carrow" viewBox="-50 -50 100 100"><path d="M0 -44 L28 0 H11 V42 H-11 V0 H-28 Z"/></svg>
    <svg id="cmini" xmlns="http://www.w3.org/2000/svg"></svg><div id="cmsg"></div>
    <div class="cbot"><button id="cprev">◀ Voltar</button><button id="calign">🧭 Alinhar</button><button id="cnext">Próximo ▶</button><button id="cclose">✕</button></div>`;
  document.body.appendChild(el);
  const $ = id => document.getElementById(id);
  $("cclose").onclick = close;
  $("cnext").onclick = () => step(1);
  $("cprev").onclick = () => step(-1);
  $("calign").onclick = align;
  return el;
}
const $ = id => document.getElementById(id);

/* trechos retos da rota: direção (graus no mapa, horário a partir de "cima"), comprimento e nome do corredor */
function legsOf(g, pts) {
  const out = [];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x, dy = pts[i].y - pts[i - 1].y, len = Math.hypot(dx, dy);
    if (len < 1) continue;
    const b = Math.atan2(dx, -dy) * 180 / Math.PI, l = out[out.length - 1];
    if (l && Math.abs(diff(b, l.b)) < 10) { l.len += len; l.end = pts[i]; }
    else out.push({ b, len, start: pts[i - 1], end: pts[i] });
  }
  for (const l of out) {
    // corredor deste trecho: o segmento mais próximo que corre na mesma direção
    const mid = { x: (l.start.x + l.end.x) / 2, y: (l.start.y + l.end.y) / 2 }, ux = (l.end.x - l.start.x) / l.len, uy = (l.end.y - l.start.y) / l.len;
    let best = null;
    for (const sg of g.segs) {
      const dx = sg.x2 - sg.x1, dy = sg.y2 - sg.y1, L = Math.hypot(dx, dy) || 1; if (Math.abs(ux * dy / L - uy * dx / L) > 0.26) continue;
      const t = Math.max(0, Math.min(1, ((mid.x - sg.x1) * dx + (mid.y - sg.y1) * dy) / (L * L))), d = Math.hypot(mid.x - sg.x1 - t * dx, mid.y - sg.y1 - t * dy);
      if (!best || d < best.d) best = { d, seg: sg };
    }
    const n = best && best.d < 20 ? best : MM.nearest(g, mid);
    l.name = n ? n.seg.name : ""; l.lane = !!n && n.seg.kind === "lane"; l.m = Math.max(1, l.len * g.mpu);
  }
  return out.filter(l => l.m >= 1.5 || l === out[out.length - 1]);
}
function plan(from) {
  const w = MM.walk(S.g, from, S.store, "");
  S.pts = w.pts; S.legs = legsOf(S.g, w.pts); S.arrive = w.steps[w.steps.length - 1]; S.i = 0; S.walked = 0;
  if (!S.legs.length) S.i = 0;
}

/* bússola: direção para onde a câmera traseira aponta (0 = norte, horário) */
function headingOf(e) {
  if (typeof e.webkitCompassHeading === "number") return e.webkitCompassHeading;
  if (e.alpha == null || !(e.absolute || e.type === "deviceorientationabsolute")) return null;
  const r = Math.PI / 180, a = e.alpha * r, b = (e.beta || 0) * r, c = (e.gamma || 0) * r;
  const x = Math.cos(a) * Math.sin(c) + Math.sin(a) * Math.sin(b) * Math.cos(c), y = Math.sin(a) * Math.sin(c) - Math.cos(a) * Math.sin(b) * Math.cos(c);
  if (Math.hypot(x, y) > 0.35) return (Math.atan2(-x, -y) * 180 / Math.PI + 360) % 360;   // celular em pé
  return (360 - e.alpha) % 360;                                                            // celular deitado
}
function onOrient(e) {
  const h = headingOf(e); if (h == null) return;
  S.heading = S.heading == null ? h : (S.heading + diff(h, S.heading) * 0.25 + 360) % 360; S.compass = true; paintArrow();
}
/* contador de passos simples (pico de aceleração) */
function onMotion(e) {
  const a = e.accelerationIncludingGravity; if (!a || a.x == null) return;
  const m = Math.hypot(a.x, a.y, a.z); S.avg = S.avg == null ? m : S.avg * 0.9 + m * 0.1;
  const t = Date.now();
  if (m - S.avg > 1.3 && t - (S.lastStep || 0) > 320) { S.lastStep = t; walked(STEP_M); }
}
function walked(m) {
  if (!S || S.done) return; const l = S.legs[S.i]; if (!l) return;
  S.walked += m; paintProgress();
  if (S.walked >= l.m - 1) { try { navigator.vibrate && navigator.vibrate(120); } catch (e) {} step(1); }
}
function pos() {
  const l = S.legs[S.i]; if (!l) return S.store.door;
  const t = Math.min(1, S.walked / l.m); return { x: l.start.x + (l.end.x - l.start.x) * t, y: l.start.y + (l.end.y - l.start.y) * t };
}
function step(d) {
  if (!S) return;
  if (d > 0 && S.done) {
    const n = S.cb.next && S.cb.next();
    if (!n) return close();
    S.g = n.g; S.store = n.store; S.done = false; S.lastQR = null; plan(n.from);
    S.cb.move && S.cb.move(n.from, S.g.key); paint(); if (n.note) note(n.note, 7000); return;
  }
  if (d > 0) { if (S.i >= S.legs.length - 1) { S.done = true; S.cb.move && S.cb.move(S.store.door, S.g.key); return paint(); } S.i++; }
  else { if (S.done) S.done = false; else if (S.i > 0) S.i--; }
  S.walked = 0; S.cb.move && S.cb.move(S.legs[S.i].start, S.g.key); paint();
}
function align() {
  if (S.heading == null) return note("Este aparelho não informou a bússola. Siga as instruções do texto e use “Próximo” a cada esquina.");
  const l = S.legs[S.i]; if (!l) return;
  S.north = (S.heading - l.b + 360) % 360;
  try { const n = JSON.parse(localStorage.getItem("mm_north") || "{}"); n[S.g.key] = S.north; localStorage.setItem("mm_north", JSON.stringify(n)); } catch (e) {}
  note("Alinhado. A seta agora acompanha o celular.", 2500); paint();
}
function note(t, ms) { const m = $("cmsg"); m.textContent = t; m.style.display = "block"; clearTimeout(note.t); if (ms) note.t = setTimeout(() => m.style.display = "none", ms); }

function paintArrow() {
  if (!S || S.done) return; const l = S.legs[S.i]; if (!l) return;
  const rel = S.north != null && S.heading != null ? diff(l.b + S.north, S.heading) : 0;
  $("carrow").style.transform = `perspective(420px) rotateX(58deg) rotateZ(${rel.toFixed(1)}deg)`;
}
function paintProgress() {
  const l = S.legs[S.i]; if (!l) return;
  $("cbar").firstChild.style.width = Math.min(100, S.walked / l.m * 100) + "%";
  const left = Math.max(0, Math.round((l.m - S.walked) / 5) * 5);
  const nx = S.legs[S.i + 1];
  let then;
  if (nx) { const d = diff(nx.b, l.b); then = `depois ${Math.abs(d) < 25 ? "siga em frente" : d > 0 ? "vire à <b>direita</b>" : "vire à <b>esquerda</b>"}${nx.name ? ` ${nx.lane ? "na" : /^corredor|^passarela|^hall/i.test(nx.name) ? "no" : "em"} ${esc(nx.name)}` : ""}`; }
  else then = "a loja fica no fim deste trecho";
  $("csub").innerHTML = `${left > 0 ? `~${left} m` : "poucos passos"} · ${then}`;
  mini();
}
function mini() {
  const p = S.done ? S.store.door : pos(), m = $("cmini"), w = 230;
  m.setAttribute("viewBox", `${p.x - w / 2} ${p.y - w / 2} ${w} ${w}`);
  m.innerHTML = MM.draw(S.g, { sel: S.store.id, path: S.pts, me: p });
}
function paint() {
  el.classList.toggle("done", !!S.done);
  const tag = S.cb.tag ? S.cb.tag() : "", more = !!(S.cb.hasNext && S.cb.hasNext());
  $("cnext").textContent = S.done ? (more ? "Próxima parada ▶" : "Concluir ✓") : S.i >= S.legs.length - 1 ? "Cheguei ✓" : "Próximo ▶";
  if (S.done) { $("cins").innerHTML = "🎉 " + (tag ? tag + " · " : "") + S.arrive; $("csub").textContent = more ? "Toque em “Próxima parada” para seguir sua lista." : "Procure a fachada da loja."; $("cbar").firstChild.style.width = "100%"; return mini(); }
  const l = S.legs[S.i];
  if (!l) { S.done = true; return paint(); }
  $("cins").innerHTML = `${tag ? tag + " · " : ""}${S.i + 1}/${S.legs.length} · Siga ${l.lane ? "pela" : "por"} <b>${esc(l.name || "este corredor")}</b>`;
  paintArrow(); paintProgress();
  if (S.north == null) note(S.compass === false ? "Sem bússola: use o texto e o botão “Próximo” a cada esquina." : "Aponte a câmera ao longo do corredor, no sentido da linha azul do mapinha, e toque em 🧭 Alinhar.");
}

async function scanLoop() {
  if (!("BarcodeDetector" in W)) return;
  let det; try { det = new BarcodeDetector({ formats: ["qr_code"] }); } catch (e) { return; }
  const v = el.querySelector("video");
  S.scan = setInterval(async () => {
    if (!S || v.readyState < 2) return;
    try {
      const r = await det.detect(v); if (!r.length) return;
      const m = /#(qr-[a-z0-9-]+)/.exec(r[0].rawValue || ""); if (!m || m[1] === S.lastQR) return;
      const p = S.cb.qr && S.cb.qr(m[1], S.g); if (!p) return;
      S.lastQR = m[1]; S.done = false; plan(p); S.cb.move && S.cb.move(p, S.g.key); note("📍 Posição atualizada pelo QR Code do corredor.", 3000); paint();
      try { navigator.vibrate && navigator.vibrate(60); } catch (e) {}
    } catch (e) {}
  }, 700);
}

async function open(o) {
  ui(); if (S) close();
  S = { g: o.g, store: o.store, cb: o, heading: null, compass: null, north: null, done: false };
  try { const n = JSON.parse(localStorage.getItem("mm_north") || "{}"); if (typeof n[o.g.key] === "number") S.north = n[o.g.key]; } catch (e) {}
  if (S.north == null && typeof o.g.north === "number") S.north = o.g.north;
  plan(o.from); el.style.display = "block"; $("cmsg").style.display = "none";
  // permissões de sensores no iOS precisam vir direto do toque
  try { if (W.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === "function") await DeviceOrientationEvent.requestPermission(); } catch (e) {}
  try { if (W.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === "function") await DeviceMotionEvent.requestPermission(); } catch (e) {}
  if (!S) return;
  S.oev = "ondeviceorientationabsolute" in W ? "deviceorientationabsolute" : "deviceorientation";
  W.addEventListener(S.oev, onOrient); W.addEventListener("devicemotion", onMotion);
  setTimeout(() => { if (S && S.compass == null) { S.compass = false; if (!S.done) paint(); } }, 2500);
  paint();
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error("sem câmera");
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
    if (!S) { stream.getTracks().forEach(t => t.stop()); return; }
    S.stream = stream; const v = el.querySelector("video"); v.srcObject = stream; v.play().catch(() => {}); scanLoop();
  } catch (e) {
    if (S) note("Câmera indisponível ou bloqueada aqui (no site publicado em HTTPS ela funciona). A seta e os passos continuam valendo.", 6000);
  }
}
function close() {
  if (!S) return;
  if (S.stream) S.stream.getTracks().forEach(t => t.stop());
  clearInterval(S.scan); W.removeEventListener(S.oev, onOrient); W.removeEventListener("devicemotion", onMotion);
  const v = el.querySelector("video"); v.srcObject = null; el.style.display = "none";
  const cb = S.cb; S = null; cb.close && cb.close();
}
MM.cam = { open, close, _state: () => S, _walked: walked };
})(window);
