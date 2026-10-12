"use strict";
(() => {
  // src/game/salt.ts
  var CHAPTERS = [
    { at: 0, en: "The heat is still in the road.", ar: "\u0627\u0644\u062D\u0631 \u0628\u0627\u0642\u064A \u0641\u064A \u0627\u0644\u0637\u0631\u064A\u0642" },
    { at: 280, en: "A white light, far off.", ar: "\u0646\u0648\u0631 \u0623\u0628\u064A\u0636\u060C \u0628\u0639\u064A\u062F" },
    { at: 620, en: "The city left its windows on.", ar: "\u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0645\u062E\u0644\u064A\u0629 \u0634\u0628\u0627\u0628\u064A\u0643\u0647\u0627" },
    { at: 980, en: "Let it drive.", ar: "\u062E\u0644\u0651\u0647\u0627 \u062A\u0645\u0634\u064A" }
  ];
  var STATIONS = [
    { freq: "91.4", name: "Gulf", line: "Tide against the wall." },
    { freq: "96.2", name: "Majlis", line: "Someone left the light on." },
    { freq: "101.7", name: "Towers", line: "None of them have names tonight." },
    { freq: "106.1", name: "\u0645\u0644\u062D", line: "Almost nothing. Then the road." }
  ];
  var FALCON = [
    [0.18, -0.42],
    [0.28, -0.36],
    [0.34, -0.28],
    [0.22, -0.22],
    [0.08, -0.16],
    [-0.02, -0.1],
    [-0.14, -0.02],
    [-0.28, 0.02],
    [-0.4, 0],
    [-0.48, 0.08],
    [-0.36, 0.12],
    [-0.22, 0.08],
    [-0.08, 0.1],
    [0.06, 0.16],
    [0.16, 0.28],
    [0.1, 0.4],
    [0, 0.32],
    [-0.06, 0.2],
    [0.04, 0.05],
    [0.14, -0.08],
    [0.02, -0.22],
    [-0.1, -0.36],
    [-0.22, -0.48],
    [-0.08, -0.28]
  ];
  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0;
      a = a + 1831565813 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }
  function mix(a, b, t) {
    const pa = parseInt(a.slice(1), 16);
    const pb = parseInt(b.slice(1), 16);
    const r = (pa >> 16 & 255) + ((pb >> 16 & 255) - (pa >> 16 & 255)) * t;
    const g = (pa >> 8 & 255) + ((pb >> 8 & 255) - (pa >> 8 & 255)) * t;
    const bl = (pa & 255) + ((pb & 255) - (pa & 255)) * t;
    return `rgb(${r | 0},${g | 0},${bl | 0})`;
  }
  function chapterIndex(z) {
    let i = 0;
    for (let c = 0; c < CHAPTERS.length; c++) if (z >= CHAPTERS[c].at) i = c;
    return i;
  }
  function curveAt(z) {
    return Math.sin(z * 0.012) * 1.05 + Math.sin(z * 31e-4) * 2.15 + Math.sin(z * 0.028) * 0.28;
  }
  function mountSalt(root2) {
    root2.innerHTML = "";
    const css = document.createElement("style");
    css.textContent = `
    .salt, .salt * { box-sizing: border-box; }
    .salt {
      position: absolute; inset: 0; overflow: hidden;
      background: #07080b; color: #efe6d4;
      font-family: Fraunces, Georgia, serif;
      touch-action: none; user-select: none;
    }
    .salt canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
    .salt .veil {
      pointer-events: none; position: absolute; inset: 0;
      background:
        radial-gradient(ellipse at center, transparent 40%, rgba(7,8,11,0.55) 100%),
        linear-gradient(to top, rgba(7,8,11,0.45), transparent 28%);
    }
    .salt .grain {
      pointer-events: none; position: absolute; inset: -20%;
      opacity: 0.18; mix-blend-mode: overlay;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.9'/></svg>");
    }
    .salt .corner {
      position: absolute; top: 1.25rem; left: 1.35rem; z-index: 2;
      pointer-events: none;
    }
    .salt .mark {
      margin: 0; font-style: italic; font-weight: 560;
      font-size: 1.7rem; letter-spacing: -0.03em; line-height: 1;
    }
    .salt .chapter {
      margin: 0.35rem 0 0; max-width: 16rem;
      font-family: Amiri, serif; font-size: 1.25rem; line-height: 1.35;
      color: #efe6d4;
    }
    .salt .chapter-en {
      margin: 0.15rem 0 0; max-width: 16rem;
      font-size: 0.78rem; letter-spacing: 0.04em; color: #9a917f;
    }
    .salt .ticks { display: flex; gap: 0.35rem; margin-top: 0.7rem; }
    .salt .ticks i {
      width: 1.4rem; height: 2px; background: #2a271f; display: block;
    }
    .salt .ticks i.on { background: #e4a15a; }
    .salt .radio {
      position: absolute; top: 1.2rem; right: 1.2rem; z-index: 3;
      display: flex; align-items: center; gap: 0.4rem;
    }
    .salt .radio button, .salt .sound, .salt .touch button, .salt .start, .salt .resume {
      font-family: Fraunces, Georgia, serif;
      min-height: 44px; min-width: 44px;
      border-radius: 999px; cursor: pointer;
    }
    .salt .radio button, .salt .sound {
      background: transparent; color: #efe6d4;
      border: 1px solid rgba(239,230,212,0.28);
      padding: 0 0.7rem;
    }
    .salt .freq-block { text-align: right; min-width: 7.5rem; }
    .salt .freq {
      display: block; font-variant-numeric: tabular-nums;
      font-size: 1.35rem; letter-spacing: 0.04em; line-height: 1;
    }
    .salt .freq small { display: block; margin-top: 0.2rem; color: #9a917f; font-size: 0.72rem; letter-spacing: 0.08em; }
    .salt .station-line {
      display: block; margin-top: 0.25rem; color: #9a917f;
      font-size: 0.75rem; max-width: 12rem; margin-left: auto;
    }
    .salt .sound { position: absolute; top: 5.4rem; right: 1.2rem; z-index: 3; }
    .salt .speed {
      position: absolute; left: 1.35rem; bottom: 1.4rem; z-index: 2;
      pointer-events: none; opacity: 0; transition: opacity 600ms ease;
    }
    .salt.is-driving .speed, .salt.is-driving .corner, .salt.is-driving .radio, .salt.is-driving .sound {
      opacity: 1;
    }
    .salt .corner, .salt .radio, .salt .sound { opacity: 0; transition: opacity 700ms ease; }
    .salt .kmh {
      font-variant-numeric: tabular-nums; font-style: italic;
      font-size: clamp(2.4rem, 5vw, 3.4rem); line-height: 0.85; letter-spacing: -0.04em;
    }
    .salt .unit { display: block; margin-top: 0.25rem; color: #9a917f; letter-spacing: 0.16em; font-size: 0.68rem; }
    .salt .gate {
      position: absolute; inset: 0; z-index: 4;
      display: flex; flex-direction: column; justify-content: flex-end;
      padding: 7vh 7vw 8vh;
      background: linear-gradient(to top, rgba(7,8,11,0.82) 0%, rgba(7,8,11,0.28) 46%, transparent 72%);
      transition: opacity 800ms ease;
    }
    .salt .gate.is-gone { opacity: 0; pointer-events: none; }
    .salt .kicker {
      margin: 0 0 0.6rem; letter-spacing: 0.28em; text-transform: uppercase;
      font-size: 0.72rem; color: #e4a15a;
    }
    .salt .gate h1 {
      margin: 0; font-style: italic; font-weight: 560;
      font-size: clamp(5rem, 16vw, 9.5rem); line-height: 0.82; letter-spacing: -0.045em;
    }
    .salt .lede {
      margin: 0.9rem 0 0; max-width: 22rem; font-size: 1.15rem; line-height: 1.45;
    }
    .salt .far {
      margin: 0.45rem 0 0; color: #9a917f; font-size: 0.85rem;
    }
    .salt .start {
      margin-top: 1.4rem; align-self: flex-start;
      background: #e4a15a; color: #1a1208; border: 0;
      padding: 0.85rem 1.7rem; font-size: 1.05rem;
    }
    .salt .hint {
      margin: 0.9rem 0 0; color: #9a917f; font-size: 0.78rem; letter-spacing: 0.04em;
    }
    .salt .touch {
      display: none; position: absolute; left: 0; right: 0; bottom: 1rem; z-index: 3;
      justify-content: space-between; padding: 0 0.9rem; gap: 0.6rem; pointer-events: none;
    }
    .salt.is-driving .touch { pointer-events: none; }
    .salt .touch button {
      pointer-events: auto;
      background: rgba(7,8,11,0.55); color: #efe6d4;
      border: 1px solid rgba(239,230,212,0.3);
      padding: 0.75rem 1rem; min-width: 5.2rem;
      backdrop-filter: blur(8px);
    }
    .salt .touch .gas { background: #e4a15a; color: #1a1208; border-color: transparent; }
    .salt .pulled {
      display: none; position: absolute; inset: 0; z-index: 5;
      background: rgba(7,8,11,0.55);
      align-items: flex-end; padding: 8vh 7vw;
    }
    .salt.is-paused .pulled { display: flex; }
    .salt .resume {
      background: #efe6d4; color: #1a1208; border: 0; padding: 0.85rem 1.5rem; font-size: 1.05rem;
    }
    .salt .pulled p { margin: 0 0 0.8rem; font-style: italic; font-size: 2rem; }
    @media (max-width: 800px), (pointer: coarse) {
      .salt.is-driving .touch { display: flex; }
      .salt .hint { display: none; }
      .salt .speed { bottom: 5.6rem; }
      .salt .gate { padding: 6vh 1.3rem 7vh; }
      .salt .chapter { max-width: 46vw; font-size: 1.05rem; }
      .salt .chapter-en, .salt .ticks, .salt .station-line { display: none; }
      .salt .freq { font-size: 1.05rem; }
      .salt .freq-block { min-width: 0; }
    }
  `;
    root2.appendChild(css);
    const shell = document.createElement("div");
    shell.className = "salt";
    shell.innerHTML = `
    <canvas></canvas>
    <div class="veil"></div>
    <div class="grain"></div>
    <div class="corner">
      <p class="mark">Salt</p>
      <p class="chapter"></p>
      <p class="chapter-en"></p>
      <div class="ticks" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    </div>
    <div class="radio">
      <button type="button" data-tune="-1" aria-label="Previous station">\u2039</button>
      <div class="freq-block">
        <span class="freq">91.4<small>GULF</small></span>
        <span class="station-line"></span>
      </div>
      <button type="button" data-tune="1" aria-label="Next station">\u203A</button>
    </div>
    <button type="button" class="sound" aria-label="Toggle sound">Sound</button>
    <div class="speed"><div class="kmh">000</div><span class="unit">KM/H</span></div>
    <div class="touch">
      <button type="button" data-hold="left">Left</button>
      <button type="button" class="gas" data-hold="gas">Drive</button>
      <button type="button" data-hold="right">Right</button>
    </div>
    <div class="gate">
      <p class="kicker">A night without a map</p>
      <h1>Salt</h1>
      <p class="lede">The coast builds itself. You only steer.</p>
      <p class="far"></p>
      <button type="button" class="start">Start</button>
      <p class="hint">A and D steer \xB7 W drives \xB7 S eases off \xB7 Q and E tune the radio</p>
    </div>
    <div class="pulled">
      <div>
        <p>Pulled over.</p>
        <button type="button" class="resume">Resume</button>
      </div>
    </div>
  `;
    root2.appendChild(shell);
    const canvas = shell.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => {
    };
    const chapterEl = shell.querySelector(".chapter");
    const chapterEnEl = shell.querySelector(".chapter-en");
    const ticks = [...shell.querySelectorAll(".ticks i")];
    const freqEl = shell.querySelector(".freq");
    const stationLineEl = shell.querySelector(".station-line");
    const kmhEl = shell.querySelector(".kmh");
    const farEl = shell.querySelector(".far");
    const soundBtn = shell.querySelector(".sound");
    const gate = shell.querySelector(".gate");
    const rand = mulberry32(23063);
    const stars = Array.from({ length: 72 }, (_, i) => {
      const fp = FALCON[i % FALCON.length];
      return {
        x: rand(),
        y: rand() * 0.92,
        s: rand() > 0.86 ? 2 : 1.2,
        tw: rand() * 6,
        fx: fp[0] + (rand() - 0.5) * 0.03,
        fy: fp[1] + (rand() - 0.5) * 0.03
      };
    });
    const towers = [];
    for (let i = 0; i < 46; i++) {
      const layer = i % 5 === 0 ? 0 : 1;
      towers.push({
        x: rand() * 3400,
        w: 28 + rand() * (layer ? 70 : 40),
        h: (layer ? 70 : 36) + rand() * (layer ? 180 : 70),
        seed: rand() * 1e3,
        layer
      });
    }
    const traffic = Array.from({ length: 8 }, (_, i) => ({
      z: 6 + i * 8,
      side: i % 2 === 0 ? -1 : 1,
      pace: 8 + rand() * 16
    }));
    const keys = /* @__PURE__ */ new Set();
    let holdLeft = false;
    let holdRight = false;
    let holdGas = false;
    let steerOverride = null;
    let yaw = 0;
    let speed = 0;
    let playerX = 0;
    let camZ = 40;
    let running = false;
    let paused = false;
    let salt = 0;
    let saltHold = 0;
    let falcon = 0;
    let falconMode = "idle";
    let station = 0;
    let soundOn = true;
    let time = 0;
    let farthest = 0;
    try {
      farthest = Number(localStorage.getItem("salt.farthest") || 0) || 0;
    } catch {
      farthest = 0;
    }
    if (farthest > 0.3) farEl.textContent = `${farthest.toFixed(1)} km, your farthest night`;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const audio = createNightAudio();
    function steerValue() {
      if (steerOverride != null) return clamp(steerOverride, -1, 1);
      let s = 0;
      if (keys.has("KeyA") || keys.has("ArrowLeft") || holdLeft) s += 1;
      if (keys.has("KeyD") || keys.has("ArrowRight") || holdRight) s -= 1;
      return clamp(s, -1, 1);
    }
    function paintStation() {
      const st = STATIONS[station];
      freqEl.innerHTML = `${st.freq}<small>${st.name.toUpperCase()}</small>`;
      stationLineEl.textContent = st.line;
    }
    paintStation();
    function nudgeStation(dir) {
      station = (station + dir + STATIONS.length) % STATIONS.length;
      paintStation();
      audio.setStation(station);
    }
    function setSoundLabel() {
      soundBtn.textContent = soundOn ? "Sound" : "Muted";
      soundBtn.setAttribute("aria-pressed", soundOn ? "true" : "false");
    }
    setSoundLabel();
    const STRIPS = 150;
    const stripY = new Float32Array(STRIPS);
    const stripC = new Float32Array(STRIPS);
    const stripH = new Float32Array(STRIPS);
    const stripZ = new Float32Array(STRIPS);
    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth || root2.clientWidth;
      const h = canvas.clientHeight || root2.clientHeight;
      if (w < 2 || h < 2) return false;
      const pw = Math.floor(w * dpr);
      const ph = Math.floor(h * dpr);
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    }
    function draw() {
      if (!resize()) return;
      const w = canvas.clientWidth || root2.clientWidth;
      const h = canvas.clientHeight || root2.clientHeight;
      const g = ctx;
      const horizonBase = h * (0.56 - salt * 0.12);
      const bob = reduced ? 0 : Math.sin(time * 0.7) * 2;
      const horizon = horizonBase + bob;
      const chapter = chapterIndex(camZ);
      const heat = chapter === 0 ? 1 : chapter === 1 ? 0.35 : 0;
      const skyTop = mix("#07060f", "#04060c", salt);
      const skyHor = mix(mix("#1c140e", "#121820", 1 - heat), "#241c14", salt * 0.65);
      const sky = g.createLinearGradient(0, 0, 0, horizon);
      sky.addColorStop(0, skyTop);
      sky.addColorStop(1, skyHor);
      g.fillStyle = sky;
      g.fillRect(0, 0, w, h);
      const falconAmt = falcon;
      g.fillStyle = "#efe6d4";
      for (const st of stars) {
        const x = st.x * w * (1 - falconAmt) + (w * 0.62 + st.fx * w * 0.34) * falconAmt;
        const y = st.y * horizon * (1 - falconAmt) + (horizon * 0.46 + st.fy * horizon * 0.5) * falconAmt;
        const twinkle = reduced ? 0.7 : 0.45 + Math.sin(time * 1.7 + st.tw) * 0.35;
        g.globalAlpha = twinkle * (0.35 + falconAmt * 0.65);
        g.fillRect(x, y, st.s, st.s);
      }
      g.globalAlpha = 1;
      const moonX = w * 0.22;
      const moonY = horizon * 0.36;
      const halo = g.createRadialGradient(moonX, moonY, 8, moonX, moonY, 70);
      halo.addColorStop(0, "rgba(239,230,212,0.55)");
      halo.addColorStop(1, "rgba(239,230,212,0)");
      g.fillStyle = halo;
      g.beginPath();
      g.arc(moonX, moonY, 70, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#f4efe4";
      g.beginPath();
      g.arc(moonX, moonY, 11, 0, Math.PI * 2);
      g.fill();
      const scrollFar = camZ * 9 + playerX * 40;
      const scrollNear = camZ * 20 + playerX * 90;
      const domeAlpha = clamp((camZ - 180) / 180, 0, 1) * (1 - salt * 0.35);
      if (domeAlpha > 0.02) {
        const dx = w * 0.7 - scrollFar * 0.15 % 80;
        const dy = horizon - 8;
        g.save();
        g.globalAlpha = domeAlpha;
        g.fillStyle = "#f3ecdf";
        g.beginPath();
        g.arc(dx, dy, 26, Math.PI, 0);
        g.lineTo(dx + 34, dy + 8);
        g.lineTo(dx - 34, dy + 8);
        g.fill();
        g.fillRect(dx - 2, dy - 46, 3, 24);
        const glow = g.createRadialGradient(dx, dy, 4, dx, dy, 90);
        glow.addColorStop(0, "rgba(243,236,223,0.35)");
        glow.addColorStop(1, "rgba(243,236,223,0)");
        g.fillStyle = glow;
        g.fillRect(dx - 90, dy - 90, 180, 120);
        g.restore();
      }
      for (const tower of towers) {
        const scroll = tower.layer ? scrollNear : scrollFar;
        const span = 3400;
        let x = tower.x - scroll;
        x = (x % span + span) % span - 280;
        if (x > w + 40 || x < -80) continue;
        if (!tower.layer && x < w * 0.28) continue;
        const rise = tower.h * (tower.layer ? 1 : 0.72);
        const top = horizon - rise + 6;
        g.fillStyle = tower.layer ? "#0c1016" : "#090c12";
        g.fillRect(x, top, tower.w, rise + 8);
        const rows = Math.floor(rise / 14);
        const cols = Math.max(1, Math.floor(tower.w / 12));
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const n = Math.sin(tower.seed * 12.3 + r * 4.1 + c * 9.2);
            const flicker = reduced ? 1 : 0.65 + Math.sin(time * 1.3 + tower.seed + r) * 0.35;
            if (n > 0.42 && flicker > 0.2) {
              g.fillStyle = n > 0.78 ? "rgba(228,161,90,0.85)" : "rgba(239,230,212,0.55)";
              g.fillRect(x + 4 + c * 12, top + 6 + r * 14, 3, 4);
            }
          }
        }
      }
      if (camZ > 620 && camZ < 900) {
        const u = (camZ - 620) / 280;
        const closeness = Math.sin(Math.min(1, u) * Math.PI);
        const deckY = horizon - 20 - (1 - closeness) * 80;
        g.fillStyle = "rgba(8,10,14,0.92)";
        g.fillRect(0, deckY, w, 10 + closeness * 16);
        g.fillRect(w * 0.2, deckY - 36 * closeness, 8, 36 * closeness);
        g.fillRect(w * 0.78, deckY - 36 * closeness, 8, 36 * closeness);
        g.fillRect(w * 0.2, deckY - 36 * closeness, w * 0.58, 4);
      }
      const roadPlain = mix("#14171e", "#d5ccb8", salt);
      const roadAlt = mix("#10131a", "#c9c0ac", salt);
      const shoulder = mix("#1c140e", "#8d8372", salt);
      const sea = mix("#0c2e36", "#07090c", salt);
      const ground = mix("#100e0c", "#16130f", salt);
      const steer = steerValue();
      for (let i = 0; i < STRIPS; i++) {
        const p = i / (STRIPS - 1);
        const y = horizon + (h - horizon) * Math.pow(p, 0.92);
        const z = 0.4 + (1 - p) * (1 - p) * 48;
        const sample = camZ + z;
        const bend = (curveAt(sample) - curveAt(camZ)) * w * 0.09;
        const center = w * 0.5 + bend - playerX * w * 0.58 * (0.2 + p);
        const half = w * (0.02 + p * p * 0.78) * 0.5;
        stripY[i] = y;
        stripC[i] = center;
        stripH[i] = half;
        stripZ[i] = sample;
      }
      for (let i = 0; i < STRIPS - 1; i++) {
        const y0 = stripY[i];
        const hh = Math.max(1, stripY[i + 1] - y0 + 0.5);
        const center = stripC[i];
        const half = stripH[i];
        const sample = stripZ[i];
        const left = center - half;
        const right = center + half;
        const sh = half * 0.16 + 2;
        g.fillStyle = sea;
        g.fillRect(0, y0, Math.max(0, left - sh), hh);
        g.fillStyle = ground;
        g.fillRect(Math.min(w, right + sh), y0, w, hh);
        const moonPath = Math.exp(-Math.pow((left * 0.5 - moonX) / (w * 0.08), 2));
        if (moonPath > 0.05 && left > 0) {
          g.fillStyle = `rgba(244,239,228,${0.05 * moonPath * (1 - salt)})`;
          g.fillRect(Math.max(0, moonX - 18), y0, 36, hh);
        }
        g.fillStyle = Math.floor(sample * 0.7) % 2 === 0 ? shoulder : mix(shoulder, "#3a3024", 0.35);
        g.fillRect(left - sh, y0, right - left + sh * 2, hh);
        g.fillStyle = Math.floor(sample * 1.1) % 2 === 0 ? roadPlain : roadAlt;
        g.fillRect(left, y0, Math.max(0, right - left), hh);
        if (Math.floor(sample * 1.35) % 3 === 0) {
          const dw = Math.max(1.5, half * 0.035);
          g.fillStyle = salt > 0.5 ? "#6e675c" : "rgba(239,230,212,0.55)";
          g.fillRect(center - dw / 2, y0, dw, hh);
        }
        g.fillStyle = salt > 0.45 ? "rgba(26,18,8,0.35)" : "rgba(228,161,90,0.45)";
        g.fillRect(left, y0, Math.max(1, half * 0.03), hh);
        g.fillRect(right - Math.max(1, half * 0.03), y0, Math.max(1, half * 0.03), hh);
      }
      for (const car of traffic) {
        const idx = stripIndexForZ(car.z);
        if (idx < 0) continue;
        const center = stripC[idx];
        const half = stripH[idx];
        const y = stripY[idx];
        const x = center + car.side * half * 0.42;
        const size = Math.max(1.5, (1 - idx / STRIPS) * -1 + stripH[idx] * 0.05);
        const s = Math.max(2, half * 0.045);
        if (car.side < 0) {
          g.fillStyle = "rgba(239,230,212,0.9)";
          g.fillRect(x - s, y, s * 0.7, Math.max(2, s * 0.45));
          g.fillRect(x + s * 0.5, y, s * 0.7, Math.max(2, s * 0.45));
          g.fillStyle = "rgba(239,230,212,0.18)";
          g.fillRect(x - s * 3, y, s * 6, Math.max(1, size));
        } else {
          g.fillStyle = "#c4492c";
          g.fillRect(x - s, y, s * 0.55, Math.max(2, s * 0.4));
          g.fillRect(x + s * 0.45, y, s * 0.55, Math.max(2, s * 0.4));
        }
      }
      for (let n = 1; n < 14; n++) {
        const z = n * 3.4;
        const idx = stripIndexForZ(z);
        if (idx < 8) continue;
        const x = stripC[idx] + stripH[idx] + 6;
        const y = stripY[idx];
        const scale = clamp(stripH[idx] / (w * 0.2), 0.05, 1);
        g.fillStyle = "#c8b49a";
        g.fillRect(x, y - 70 * scale, Math.max(1, 2 * scale), 70 * scale);
        const glow = g.createRadialGradient(x, y - 70 * scale, 1, x, y - 68 * scale, 26 * scale);
        glow.addColorStop(0, "rgba(228,161,90,0.55)");
        glow.addColorStop(1, "rgba(228,161,90,0)");
        g.fillStyle = glow;
        g.beginPath();
        g.arc(x, y - 70 * scale, 26 * scale, 0, Math.PI * 2);
        g.fill();
      }
      const nose = -steer * 0.18;
      g.save();
      g.translate(w / 2 + nose * 30, h * 0.98);
      g.rotate(nose);
      g.fillStyle = "#090b10";
      g.beginPath();
      g.moveTo(-w * 0.62, h * 0.12);
      g.lineTo(-w * 0.2, -h * 0.16);
      g.lineTo(w * 0.2, -h * 0.16);
      g.lineTo(w * 0.62, h * 0.12);
      g.closePath();
      g.fill();
      g.strokeStyle = "#1c212b";
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(0, -h * 0.15);
      g.lineTo(0, h * 0.02);
      g.stroke();
      g.fillStyle = "rgba(255,220,170,0.85)";
      g.fillRect(-w * 0.16, -h * 0.15, w * 0.035, 5);
      g.fillRect(w * 0.125, -h * 0.15, w * 0.035, 5);
      g.restore();
      const cone = g.createRadialGradient(w / 2 - steer * 50, h * 0.62, 10, w / 2 - steer * 90, h * 0.5, w * 0.48);
      cone.addColorStop(0, `rgba(255,214,160,${0.14 + speed / 400})`);
      cone.addColorStop(1, "rgba(255,214,160,0)");
      g.fillStyle = cone;
      g.fillRect(0, horizon * 0.8, w, h);
      const kmh = Math.round(speed * 3.15);
      const label = String(kmh).padStart(3, "0");
      if (kmhEl.textContent !== label) kmhEl.textContent = label;
      const ch = CHAPTERS[chapter];
      if (chapterEl.textContent !== ch.ar) {
        chapterEl.textContent = ch.ar;
        chapterEnEl.textContent = ch.en;
        ticks.forEach((tick, i) => tick.classList.toggle("on", i <= chapter));
      }
    }
    function stripIndexForZ(zAhead) {
      const u = (zAhead - 0.4) / 48;
      if (u <= 0 || u >= 1) return -1;
      const p = 1 - Math.sqrt(u);
      return clamp(Math.round(p * (STRIPS - 1)), 0, STRIPS - 2);
    }
    function step(dt) {
      time += dt;
      const driving = running && !paused;
      const steer = driving ? steerValue() : 0;
      const gas = keys.has("KeyW") || keys.has("ArrowUp") || holdGas;
      const brake = keys.has("KeyS") || keys.has("ArrowDown");
      if (driving) {
        const target = gas ? 52 : brake ? 0 : 20;
        const rate = brake ? 36 : 24;
        const delta = target - speed;
        speed += Math.sign(delta) * Math.min(Math.abs(delta), rate * dt);
        const speedFactor = clamp(speed / 10, 0.55, 1);
        yaw += steer * 1.85 * speedFactor * dt;
        playerX -= steer * 1.05 * dt;
        playerX = clamp(playerX, -1.05, 1.05);
        if (Math.abs(playerX) > 0.92) speed = Math.max(0, speed - 18 * dt);
        camZ += speed * dt;
      } else if (!running) {
        camZ += dt * 2.4;
      }
      const wantSalt = driving && chapterIndex(camZ) >= 3 && Math.abs(steer) < 0.18 && speed > 12 ? 1 : 0;
      salt += (wantSalt - salt) * Math.min(1, dt * 0.55);
      if (wantSalt) saltHold += dt;
      else saltHold = Math.max(0, saltHold - dt * 0.8);
      if (!reduced) {
        if (falconMode === "idle" && saltHold > 4.5) falconMode = "form";
        if (falconMode === "form") {
          falcon = Math.min(1, falcon + dt * 0.35);
          if (falcon >= 1) falconMode = "hold";
        } else if (falconMode === "hold") {
          saltHold += dt;
          if (saltHold > 9) falconMode = "release";
        } else if (falconMode === "release") {
          falcon = Math.max(0, falcon - dt * 0.4);
          if (falcon <= 0) {
            falconMode = "idle";
            saltHold = 0;
          }
        }
      }
      for (const car of traffic) {
        if (!driving && running) continue;
        const closing = car.side < 0 ? (car.pace + Math.max(speed, 8)) * 0.16 : (Math.max(speed, 8) - car.pace * 0.3) * 0.12;
        car.z -= closing * dt;
        if (car.z < 0.45) car.z = 36 + Math.random() * 18;
      }
      const km = Math.max(0, (camZ - 40) / 70);
      if (driving && km > farthest) {
        farthest = km;
        try {
          localStorage.setItem("salt.farthest", String(farthest));
        } catch {
        }
      }
      audio.update(driving ? speed : 0, soundOn && running && !paused, station, salt);
    }
    let last = performance.now();
    let raf = 0;
    let dead = false;
    function frame(now) {
      if (dead) return;
      const dt = Math.min(0.05, (now - last) / 1e3);
      last = now;
      step(dt);
      draw();
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    function onKeyDown(e) {
      if (e.repeat) return;
      keys.add(e.code);
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
      if (!running) return;
      if (e.code === "KeyQ") nudgeStation(-1);
      if (e.code === "KeyE") nudgeStation(1);
      if (e.code === "Escape") togglePause();
    }
    function onKeyUp(e) {
      keys.delete(e.code);
    }
    function onBlur() {
      keys.clear();
      holdLeft = holdRight = holdGas = false;
    }
    function togglePause() {
      if (!running) return;
      paused = !paused;
      shell.classList.toggle("is-paused", paused);
    }
    function start() {
      if (running) return;
      running = true;
      shell.classList.add("is-driving");
      gate.classList.add("is-gone");
      audio.start();
      audio.setStation(station);
    }
    const probe = {
      getYaw: () => yaw,
      getSpeed: () => speed,
      setKeys: (codes) => {
        keys.clear();
        for (const code of codes) keys.add(code);
      },
      setSteer: (v) => {
        steerOverride = v;
      }
    };
    window.__controlsTest = probe;
    shell.querySelector(".start")?.addEventListener("click", start);
    shell.querySelector(".resume")?.addEventListener("click", () => {
      paused = false;
      shell.classList.remove("is-paused");
    });
    soundBtn.addEventListener("click", () => {
      soundOn = !soundOn;
      setSoundLabel();
      if (soundOn && running) audio.start();
    });
    shell.querySelectorAll("[data-tune]").forEach((btn) => {
      btn.addEventListener("click", () => nudgeStation(Number(btn.dataset.tune)));
    });
    function bindHold(el, which) {
      const set = (v) => {
        if (which === "left") holdLeft = v;
        else if (which === "right") holdRight = v;
        else holdGas = v;
      };
      const down = (e) => {
        e.preventDefault();
        set(true);
      };
      const up = () => set(false);
      el.addEventListener("pointerdown", down);
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", up);
      el.addEventListener("pointerleave", up);
    }
    shell.querySelectorAll("[data-hold]").forEach((el) => {
      bindHold(el, el.dataset.hold);
    });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      audio.stop();
      if (window.__controlsTest === probe) delete window.__controlsTest;
      root2.innerHTML = "";
    };
  }
  function createNightAudio() {
    let ac = null;
    let engine = null;
    let engineGain = null;
    let engineFilter = null;
    let seaGain = null;
    let padA = null;
    let padB = null;
    let padGain = null;
    let started = false;
    const chords = [
      [110, 164.81],
      [98, 146.83],
      [130.81, 196],
      [82.41, 123.47]
    ];
    function start() {
      if (started) {
        void ac?.resume();
        return;
      }
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      ac = new Ctx();
      void ac.resume();
      engine = ac.createOscillator();
      engine.type = "sawtooth";
      engine.frequency.value = 42;
      engineFilter = ac.createBiquadFilter();
      engineFilter.type = "lowpass";
      engineFilter.frequency.value = 220;
      engineGain = ac.createGain();
      engineGain.gain.value = 0;
      engine.connect(engineFilter);
      engineFilter.connect(engineGain);
      engineGain.connect(ac.destination);
      engine.start();
      const length = ac.sampleRate * 2;
      const buffer = ac.createBuffer(1, length, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
      const sea = ac.createBufferSource();
      sea.buffer = buffer;
      sea.loop = true;
      const seaFilter = ac.createBiquadFilter();
      seaFilter.type = "bandpass";
      seaFilter.frequency.value = 420;
      seaFilter.Q.value = 0.6;
      seaGain = ac.createGain();
      seaGain.gain.value = 0;
      sea.connect(seaFilter);
      seaFilter.connect(seaGain);
      seaGain.connect(ac.destination);
      sea.start();
      padA = ac.createOscillator();
      padB = ac.createOscillator();
      padA.type = "sine";
      padB.type = "sine";
      padA.frequency.value = 110;
      padB.frequency.value = 164.81;
      padGain = ac.createGain();
      padGain.gain.value = 0;
      padA.connect(padGain);
      padB.connect(padGain);
      padGain.connect(ac.destination);
      padA.start();
      padB.start();
      started = true;
    }
    function setStation(index) {
      if (!ac || !padA || !padB) return;
      const pair = chords[index] ?? chords[0];
      const t = ac.currentTime;
      padA.frequency.setTargetAtTime(pair[0], t, 0.08);
      padB.frequency.setTargetAtTime(pair[1], t, 0.08);
    }
    function update(speed, audible, station, salt) {
      if (!started || !ac || !engine || !engineGain || !engineFilter || !seaGain || !padGain) return;
      const t = ac.currentTime;
      const hear = audible ? 1 : 0;
      engine.frequency.setTargetAtTime(36 + speed * 1.15, t, 0.05);
      engineFilter.frequency.setTargetAtTime(160 + speed * 7, t, 0.08);
      engineGain.gain.setTargetAtTime(hear * (0.012 + speed * 9e-4), t, 0.08);
      const seaLevel = hear * (station === 0 ? 0.05 : 0.02) * (1 - salt * 0.4);
      seaGain.gain.setTargetAtTime(seaLevel, t, 0.2);
      const padLevel = hear * (station === 3 ? 0.018 : 0.011) * (0.6 + salt * 0.8);
      padGain.gain.setTargetAtTime(padLevel, t, 0.2);
      if (padA && padB) {
        const pair = chords[station] ?? chords[0];
        if (Math.abs(padA.frequency.value - pair[0]) > 1) setStation(station);
      }
    }
    function stop() {
      try {
        void ac?.close();
      } catch {
      }
      ac = null;
      started = false;
    }
    return { start, update, setStation, stop };
  }

  // src/game/standalone.ts
  var root = document.getElementById("app");
  if (root) mountSalt(root);
})();
