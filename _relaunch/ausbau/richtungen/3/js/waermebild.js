// Wärmebild – der eine WebGL-Moment der Startseite (Variante 3 „Grenze“).
// Eigener Shader (WebGL 1), keine Bibliothek. Nach load im Leerlauf nachgeladen (index.html), immer:
// Läuft der Auftakt noch nicht über den Ersatz, übernimmt der Shader den kalten Startzustand deckungsgleich und
// wärmt das Haus auf – in höchstens --d-5, und nie über --d-grenze nach Navigationsbeginn hinaus. Hat der Ersatz
// schon übernommen (Sicherheitsnetz), startet das Modul ohne Auftakt und dient nur dem Zeigen.
// Regeln: Pixeldichte ≤ 2, höchstens ein Kontext, Pause außerhalb des Bildes und bei verborgenem Tab,
// bei webglcontextlost sofort der Ersatz, beim Verlassen Texturen, Puffer und Kontext freigeben.

const d = document.documentElement;
const SCHWELLEN = [0.07, 0.19, 0.36, 0.62]; // = bau/feld.mjs
const FARBEN = ['--wb-c0', '--wb-c1', '--wb-c2', '--wb-c3', '--wb-c4'];
const RAMPE = 0.16; // Breite der Erwärmungsfront in tau

const status = (window.__waermebild = { bilder: 0, zustand: 'aus', kontexte: 0, freigaben: 0, verlust: 0 });

let lage, rahmen, fenster, canvas, gl, prog, tex, buf, ext, loc, bild;
let laeuft = false, raf = 0, imBild = true, absichtlich = false;
let auftakt = null; // { t0, pausiertBei }
const zone = [1, 1, 1];
const ziel = [1, 1, 1];
const VERSTAERKUNG = 1.55; // Wärmezone der gewählten Marke

// Dauern einmal aus den Tokens lesen (kein getComputedStyle je Bild)
const ms = (name) => parseFloat(getComputedStyle(d).getPropertyValue(name));
let D1, D3, D5, STAFFEL, GRENZE, TAU;
let D = 0; // Dauer der Front in diesem Auftakt (an den Start angepasst)
let laeuftSeit = 0; // Zeitpunkt von .wb-laeuft (Start der CSS-Leitungen)
const dauer = () => D;
// Bildbereich der Szene, in dem es je warm werden kann (oberhalb immer kalt = Navy wie das SVG): spart Füllrate
const WARM_AB = 400;
// Auflösung: in Bewegung 1 Bildpunkt je CSS-Pixel, in Ruhe bis 2 (deckungsgleich mit dem scharfen SVG)
let ruheDpr = 1, dprJetzt = 1;

function farbe(name) {
  const hex = getComputedStyle(d).getPropertyValue(name).trim().replace('#', '');
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
}

// Die Leinwand deckt nur den sichtbaren Teil der Szene ab (Schnitt aus Lage und Rahmen); uOff/uSpan bilden ihn auf die Szene ab.
const VS = 'attribute vec2 p;uniform vec2 uOff,uSpan;varying vec2 v;void main(){v=uOff+vec2(p.x*.5+.5,.5-p.y*.5)*uSpan;gl_Position=vec4(p,0.,1.);}';
const FS = `#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;
varying vec2 v;
uniform sampler2D uFeld;
uniform float uF;
uniform vec3 uZone;
uniform vec4 uS;
uniform vec3 uC0, uC1, uC2, uC3, uC4;
uniform float uAA;
float kante(float s, float x, float e){ return smoothstep(s - e, s + e, x); }
void main(){
  vec2 uv = clamp(v, vec2(.5 / 200.), vec2(199.5 / 200.));
  vec3 a = texture2D(uFeld, vec2(uv.x * .5, uv.y)).rgb;
  float tau = texture2D(uFeld, vec2(.5 + uv.x * .5, uv.y)).r;
  float w = max(0., 1. - a.g - a.b) * uZone.x + a.g * uZone.y + a.b * uZone.z;
  float rampe = smoothstep(0., 1., (uF - tau) / ${RAMPE.toFixed(3)});
  float r = a.r * sqrt(max(w * rampe, 0.));
#ifdef GL_OES_standard_derivatives
  float e = max(fwidth(r) * .6, 1e-4);
#else
  float e = uAA;
#endif
  vec3 c = uC0;
  c = mix(c, uC1, kante(uS.x, r, e));
  c = mix(c, uC2, kante(uS.y, r, e));
  c = mix(c, uC3, kante(uS.z, r, e));
  c = mix(c, uC4, kante(uS.w, r, e));
  gl_FragColor = vec4(c, 1.);
}`;

function ladeBild() {
  if (bild) return Promise.resolve(bild);
  return new Promise((ok, fehler) => {
    const i = new Image();
    i.decoding = 'async';
    i.onload = () => { bild = i; ok(i); };
    i.onerror = fehler;
    i.src = new URL('./feld.png', import.meta.url).href;
  });
}

// Ein Bild abwarten (eigene Aufgabe, damit keine lange Aufgabe den Hauptfaden blockiert)
const bildpause = () => new Promise((ok) => requestAnimationFrame(() => ok()));
let erzeugung = null;

/** Kontext in kleinen Schritten anlegen: Kontext, Übersetzung (parallel, falls möglich), Textur, Uniformen. */
function erzeugen() {
  if (gl) return Promise.resolve(true);
  if (erzeugung) return erzeugung;
  erzeugung = (async () => {
    canvas = document.createElement('canvas');
    canvas.className = 'wb__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.setAttribute('data-motion', 'waermebild');
    const ctx = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'low-power' });
    if (!ctx) { canvas = null; return false; }
    gl = ctx;
    status.kontexte++;
    canvas.addEventListener('webglcontextlost', beiVerlust);
    ext = gl.getExtension('OES_standard_derivatives');
    const parallel = gl.getExtension('KHR_parallel_shader_compile');
    const sh = (typ, src) => { const s = gl.createShader(typ); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    // Übersetzung abwarten, ohne den Hauptfaden zu blockieren
    if (parallel) { while (gl && !gl.isContextLost() && !gl.getProgramParameter(prog, parallel.COMPLETION_STATUS_KHR)) await bildpause(); }
    else await bildpause();
    if (!gl || gl.isContextLost() || !gl.getProgramParameter(prog, gl.LINK_STATUS)) { freigeben(); return false; }
    gl.useProgram(prog);
    buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const p = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(p);
    gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);
    await bildpause();
    if (!gl) return false;
    tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, bild);
    for (const [k, w] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, w);
    loc = {};
    for (const n of ['uFeld', 'uF', 'uZone', 'uS', 'uC0', 'uC1', 'uC2', 'uC3', 'uC4', 'uAA', 'uOff', 'uSpan']) loc[n] = gl.getUniformLocation(prog, n);
    gl.uniform1i(loc.uFeld, 0);
    gl.uniform4f(loc.uS, ...SCHWELLEN.map(Math.sqrt));
    FARBEN.forEach((f, k) => gl.uniform3f(loc['uC' + k], ...farbe(f)));
    groesse(1);
    fenster.appendChild(canvas);
    return true;
  })().finally(() => { erzeugung = null; });
  return erzeugung;
}

function groesse(dpr = dprJetzt) {
  if (!canvas) return;
  dprJetzt = dpr;
  const l = lage.getBoundingClientRect(), f = fenster.getBoundingClientRect();
  const x0 = Math.max(l.left, f.left), y0 = Math.max(l.top, f.top, l.top + (WARM_AB / 800) * l.height);
  const x1 = Math.min(l.right, f.right), y1 = Math.min(l.bottom, f.bottom);
  const cw = Math.max(1, x1 - x0), ch = Math.max(1, y1 - y0);
  Object.assign(canvas.style, { left: `${x0 - f.left}px`, top: `${y0 - f.top}px`, width: `${cw}px`, height: `${ch}px` });
  const b = Math.max(1, Math.round(cw * dpr)), h = Math.max(1, Math.round(ch * dpr));
  if (canvas.width !== b || canvas.height !== h) { canvas.width = b; canvas.height = h; }
  if (gl && loc) {
    gl.viewport(0, 0, b, h);
    gl.uniform2f(loc.uOff, (x0 - l.left) / l.width, (y0 - l.top) / l.height);
    gl.uniform2f(loc.uSpan, cw / l.width, ch / l.height);
    gl.uniform1f(loc.uAA, 1.2 / Math.max(1, (l.width * dpr) / 200));
  }
}

function zeichnen(F) {
  if (!gl || !loc || gl.isContextLost()) return;
  gl.uniform1f(loc.uF, F);
  gl.uniform3f(loc.uZone, zone[0], zone[1], zone[2]);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  status.bilder++;
}

// Front: von „noch nichts“ (−Rampe) bis „alles“ (1 + Rampe), zügig in die Leitungen, langsamer in die Räume
const front = (x) => -RAMPE + (1 + 2 * RAMPE) * (1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 1.25));

let zuletzt = 0;
function schritt(jetzt) {
  raf = 0;
  if (!laeuft || !imBild || document.hidden) { zuletzt = 0; return; }
  // Feder je Zeit, nicht je Bild: gleich schnell auf 60 und 120 Hz (Zeitkonstante aus --d-3)
  const dt = zuletzt ? Math.min(jetzt - zuletzt, 4 * D1) : 1000 / 60;
  zuletzt = jetzt;
  const k_ = 1 - Math.exp(-dt / TAU);
  let weiter = false;
  let F = 1 + RAMPE;
  if (auftakt) {
    const t = jetzt - auftakt.t0;
    F = front(t / dauer());
    if (t >= dauer()) { auftakt = null; fertig(); } else weiter = true;
  }
  // Zonen federn zum Ziel (nur bei Zeigen/Tippen)
  for (let k = 0; k < 3; k++) {
    const diff = ziel[k] - zone[k];
    if (Math.abs(diff) > 0.002) { zone[k] += diff * k_; weiter = true; } else zone[k] = ziel[k];
  }
  zeichnen(F);
  if (weiter) raf = requestAnimationFrame(schritt);
  else { laeuft = false; zuletzt = 0; status.zustand = 'ruhe'; scharfStellen(); }
}

// Ruhebild scharf (Pixeldichte bis 2): erst im Leerlauf nach der Bewegung, Größe und Bild in einer Aufgabe
// (kein Aufblitzen, kein Bildverlust im letzten Bild des Auftakts)
let scharfId = 0;
function scharfStellen() {
  if (dprJetzt === ruheDpr || scharfId) return;
  const los = () => { scharfId = 0; if (laeuft || !gl || dprJetzt === ruheDpr) return; groesse(ruheDpr); zeichnen(1 + RAMPE); };
  scharfId = 'requestIdleCallback' in window ? requestIdleCallback(los, { timeout: D3 }) : setTimeout(los, D1);
}

function anstossen() {
  if (laeuft) return;
  laeuft = true;
  if (dprJetzt !== 1) { groesse(1); zeichnen(auftakt ? front(0) : 1 + RAMPE); }
  status.zustand = auftakt ? 'auftakt' : 'zeigen';
  if (!raf) raf = requestAnimationFrame(schritt);
}

function fertig() {
  // Endbild: SVG darunter ist identisch, also Startzustände lösen – erst wenn auch die Leitungen (CSS, 3 Staffeln
  // + --d-3 ab .wb-laeuft) gezogen sind, damit keine Linie springt
  const offen = laeuftSeit + 3 * STAFFEL + D3 - performance.now();
  if (offen > 0) setTimeout(() => d.classList.remove('wb-auftakt'), offen);
  else d.classList.remove('wb-auftakt');
  status.zustand = 'fertig';
  status.ende = Math.round(performance.now());
}

/** Zurück an den statischen Ersatz (deckungsgleich) und Kontext freigeben. */
function abgeben() {
  if (!gl) return;
  d.classList.remove('wb-gl');
  const c = canvas;
  setTimeout(() => { if (c === canvas && !d.classList.contains('wb-gl')) freigeben(); }, D1 + STAFFEL);
}

function freigeben() {
  cancelAnimationFrame(raf); raf = 0; laeuft = false;
  if (gl) {
    absichtlich = true;
    try {
      gl.deleteTexture(tex); gl.deleteBuffer(buf); gl.deleteProgram(prog);
      const lc = gl.getExtension('WEBGL_lose_context');
      if (lc) lc.loseContext();
    } catch (e) { /* bereits verloren */ }
    status.freigaben++;
  }
  if (canvas) { canvas.removeEventListener('webglcontextlost', beiVerlust); canvas.remove(); }
  gl = canvas = prog = tex = buf = loc = null;
  absichtlich = false;
  status.zustand = 'aus';
}

function beiVerlust(e) {
  if (absichtlich) return;
  status.verlust++;
  // Sofort der Ersatz: Endzustand ohne Auftakt, Canvas weg
  auftakt = null;
  d.classList.remove('wb-gl', 'wb-auftakt', 'wb-laeuft');
  cancelAnimationFrame(raf); raf = 0; laeuft = false;
  const c = canvas;
  gl = null;
  if (c) c.remove();
  canvas = prog = tex = buf = loc = null;
  status.zustand = 'ersatz';
  d.classList.add('wb-ohne-gl'); // keine neuen Kontexte mehr in dieser Sitzung
}

/** Zone k verstärken (k = −1: alle zurück). Kommt vom Ereignis wb-zone der Knöpfe im Bild (index.html). */
async function zeigen(k) {
  for (let z = 0; z < 3; z++) ziel[z] = z === k ? VERSTAERKUNG : 1;
  if (d.classList.contains('wb-ohne-gl') || auftakt) return; // im Auftakt übernimmt die Feder danach
  if (!gl) {
    if (k < 0 || !bild || !(await erzeugen()) || !gl) return;
    zeichnen(1 + RAMPE);
    d.classList.add('wb-gl');
  }
  anstossen();
}

export async function start() {
  lage = document.querySelector('[data-wb-lage]');
  rahmen = lage && lage.closest('.wb');
  fenster = lage && lage.closest('.wb__rahmen');
  if (!lage || !rahmen || !fenster) return;
  D1 = ms('--d-1'); D3 = ms('--d-3'); D5 = ms('--d-5'); STAFFEL = ms('--staffel'); GRENZE = ms('--d-grenze');
  TAU = D3 / 3; // nach --d-3 ist die Feder zu 95 % am Ziel
  ruheDpr = Math.min(window.devicePixelRatio || 1, 2);
  try { await ladeBild(); } catch (e) { d.classList.add('wb-ersatz'); return; }

  // Sichtbarkeit: außerhalb des Bildes und bei verborgenem Tab pausieren; Auftakt geht beim Zurückkommen weiter
  new IntersectionObserver((es) => {
    const war = imBild;
    imBild = es[0].isIntersecting;
    if (!imBild && auftakt) auftakt.pausiertBei = performance.now();
    if (imBild && !war) {
      if (auftakt && auftakt.pausiertBei) { auftakt.t0 += performance.now() - auftakt.pausiertBei; auftakt.pausiertBei = 0; }
      if (laeuft && !raf) raf = requestAnimationFrame(schritt);
    }
    if (!imBild && !auftakt && gl) abgeben(); // außerhalb des Bildes: zurück an das SVG, Kontext frei
    if (imBild && !war && !gl && !auftakt) { const k = ziel.indexOf(VERSTAERKUNG); if (k >= 0) zeigen(k); } // gewählte Zone wieder zeigen
  }).observe(rahmen);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (auftakt) auftakt.pausiertBei = performance.now(); cancelAnimationFrame(raf); raf = 0; }
    else {
      if (auftakt && auftakt.pausiertBei) { auftakt.t0 += performance.now() - auftakt.pausiertBei; auftakt.pausiertBei = 0; }
      if (laeuft && !raf) raf = requestAnimationFrame(schritt);
    }
  });
  addEventListener('pagehide', freigeben);
  if ('ResizeObserver' in window) { const ro = new ResizeObserver(() => { if (gl && loc) { groesse(); if (!laeuft) zeichnen(1 + RAMPE); } }); ro.observe(lage); ro.observe(fenster); }

  // Zeigen: Knöpfe im Bild (Luft, Flamme, Tropfen) melden die Zone; eine schon gewählte Zone gilt sofort
  document.addEventListener('wb-zone', (e) => zeigen(e.detail));
  const vorher = lage.dataset.zone;
  if (vorher !== undefined) for (let z = 0; z < 3; z++) ziel[z] = z === Number(vorher) ? VERSTAERKUNG : 1;

  // Auftakt nur, wenn der Ersatz noch nicht übernommen hat
  if (d.classList.contains('wb-ersatz') || !d.classList.contains('wb-auftakt')) { if (vorher !== undefined) zeigen(Number(vorher)); return; }
  if (!(await erzeugen()) || !gl) { d.classList.add('wb-ersatz'); return; }
  if (d.classList.contains('wb-ersatz')) { freigeben(); return; }
  zeichnen(-RAMPE); // erstes Bild = kalter Startzustand des SVG, deckungsgleich: darf sofort sichtbar werden
  // Leinwand zeigen und die Leitungen (CSS) starten; der Shader folgt zwei Bilder später, damit
  // Übersetzung, Ebenenaufbau und Stilberechnung nicht in den Auftakt fallen (Versatz ≈ 33 ms)
  // Dauer der Front an den Start anpassen: Der Auftakt endet spätestens --d-grenze nach Navigationsbeginn.
  // Reserve = 3 Staffeln (zwei Bilder Vorlauf, Einblenden der Leinwand). Bleibt weniger als --d-3, gilt sofort das Endbild.
  const rest = GRENZE - performance.now() - 3 * STAFFEL;
  if (rest < D3) { freigeben(); d.classList.remove('wb-auftakt'); status.zustand = 'endbild'; return; }
  D = Math.min(D5, rest);
  d.style.setProperty('--wb-dauer', `${Math.round(D)}ms`);
  d.classList.add('wb-gl', 'wb-laeuft');
  laeuftSeit = performance.now();
  await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
  if (d.classList.contains('wb-ersatz') || !gl) { d.classList.remove('wb-gl'); freigeben(); return; }
  zeichnen(-RAMPE);
  // nach dem Vorlauf nachrechnen: Die Front endet spätestens --d-grenze − 2 Staffeln nach Navigationsbeginn
  D = Math.max(D3, Math.min(D, GRENZE - performance.now() - 2 * STAFFEL));
  auftakt = { t0: performance.now(), pausiertBei: 0 };
  status.dauer = Math.round(D);
  status.start = Math.round(laeuftSeit);
  if (document.hidden) auftakt.pausiertBei = auftakt.t0;
  anstossen();
}
