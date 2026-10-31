(() => {
'use strict';

const VW = 640, VH = 420;          
const WW = 640, WH = 3300;         
const SPEED = 88;                  
const PIX = '"Press Start 2P", monospace';
const TXT = '"VT323", monospace';

const cv = document.getElementById('game'), c = cv.getContext('2d');
const fv = document.getElementById('fx'),   f = fv.getContext('2d');
c.imageSmoothingEnabled = false; f.imageSmoothingEnabled = false;
const stage = document.getElementById('stage');


const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
function rng(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hh(n) { n = Math.imul(n ^ 61, 0x27d4eb2d); n ^= n >>> 15; n = Math.imul(n, 0x85ebca6b); n ^= n >>> 13; return (n >>> 0) / 4294967296; }
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];


function pe(x, y, rx, ry, u, col, ctx = c) {
  ctx.fillStyle = col;
  for (let yy = -ry; yy < ry; yy += u) {
    const k = Math.sqrt(Math.max(0, 1 - ((yy + u / 2) / ry) ** 2));
    const hw = Math.round(rx * k / u) * u;
    if (hw > 0) ctx.fillRect(Math.round(x - hw), Math.round(y + yy), hw * 2, u);
  }
}

function panel(x, y, w, h, border, fill) {
  c.fillStyle = border; c.fillRect(x + 4, y, w - 8, h); c.fillRect(x, y + 4, w, h - 8);
  c.fillStyle = fill;   c.fillRect(x + 8, y + 4, w - 16, h - 8); c.fillRect(x + 4, y + 8, w - 8, h - 16);
}

const mk = (ctx, fx, fy, u) => (x, y, w, h, col) => {
  ctx.fillStyle = col;
  ctx.fillRect(Math.round(fx + (x - 6) * u), Math.round(fy + (y - 16) * u), Math.ceil(w * u), Math.ceil(h * u));
};


let AC;
function blip(freq = 660, dur = .06, type = 'square', vol = .035) {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = vol;
    o.connect(g); g.connect(AC.destination); o.start();
    g.gain.exponentialRampToValueAtTime(.0001, AC.currentTime + dur); o.stop(AC.currentTime + dur);
  } catch (e) { /* audio is optional */ }
}
const chime = () => [523, 659, 784, 1046].forEach((fq, i) => setTimeout(() => blip(fq, .18, 'triangle', .05), i * 90));


const pc = y => 320 + Math.sin(y / 230) * 60 + Math.sin(y / 97) * 12;   
const PW = 58;                                                           

const POND  = { x: pc(2480) - 170, y: 2480, rx: 72, ry: 44 };
const PEA   = { x: pc(1950) + 138, y: 1950 };
const ILA   = { x: pc(1420) + 8,   y: 1420 };
const RAJ   = { x: pc(900) - 8,    y: 900 };
const HOUSE = { x: pc(330),        y: 330 };
const MAIL  = { x: HOUSE.x + 112,  y: 376 };
const TRIG  = { x: pc(2215) + 8,   y: 2215 };   


function excluded(x, y, pad = 0) {
  if (Math.abs(x - pc(y)) < 92 + pad) return true;
  if (((x - POND.x) / (POND.rx + 50)) ** 2 + ((y - POND.y) / (POND.ry + 45)) ** 2 < 1) return true;
  if (Math.hypot(x - PEA.x, y - PEA.y) < 70) return true;
  if (Math.hypot(x - ILA.x, y - ILA.y) < 60 || Math.hypot(x - RAJ.x, y - RAJ.y) < 60 || Math.hypot(x - TRIG.x, y - TRIG.y) < 60) return true;
  if (Math.abs(x - HOUSE.x) < 150 && y < 470) return true;
  return false;
}
const R = rng(11);
const trees = [];
for (let i = 0; i < 900 && trees.length < 150; i++) {
  const x = 14 + R() * (WW - 28), y = 70 + R() * (WH - 130);
  if (excluded(x, y)) continue;
  if (trees.some(t => Math.hypot(t.x - x, t.y - y) < 40)) continue;
  trees.push({ x, y, s: 0.8 + R() * 0.45, tone: R() });
}
const flowers = [];
const FCOL = ['#ff8fb8', '#ffd23f', '#ffffff', '#b48cff', '#ff9d5c'];
for (let i = 0; i < 700; i++) {
  const x = R() * WW, y = 30 + R() * (WH - 60);
  if (Math.abs(x - pc(y)) < PW + 10) continue;
  if (((x - POND.x) / (POND.rx + 14)) ** 2 + ((y - POND.y) / (POND.ry + 12)) ** 2 < 1) continue;
  flowers.push({ x, y, col: FCOL[Math.floor(R() * FCOL.length)] });
}
const rocks = [];
for (let i = 0; i < 70; i++) {
  const x = R() * WW, y = 60 + R() * (WH - 120);
  if (excluded(x, y, -20)) continue;
  rocks.push({ x, y, s: 1 + Math.floor(R() * 2) });
}
const TILE = 16, TCOLS = WW / TILE;
const tiles = []; { const Rt = rng(3); for (let i = 0; i < TCOLS * Math.ceil(WH / TILE); i++) tiles.push(Rt()); }

function blocked(x, y) {
  if (x < 14 || x > WW - 14 || y < 24 || y > WH - 8) return true;
  if (((x - POND.x) / (POND.rx + 6)) ** 2 + ((y - POND.y) / (POND.ry + 6)) ** 2 < 1) return true;
  for (const n of [ILA, RAJ, TRIG]) if (((x - n.x) / 15) ** 2 + ((y - n.y) / 8) ** 2 < 1) return true;
  if (((x - PEA.x) / 17) ** 2 + ((y - PEA.y) / 8) ** 2 < 1) return true;
  if (Math.abs(x - HOUSE.x) < 72 && y < 338) return true;
  if (Math.abs(x - MAIL.x) < 9 && Math.abs(y - MAIL.y) < 5) return true;
  for (const t of trees) if (Math.abs(y - t.y) < 6 && Math.abs(x - t.x) < 8 * t.s) return true;
  return false;
}


function drawBoy(ctx, fx, fy, u, dir, step) {
  const bob = (step === 1 || step === 3) ? Math.round(u / 2) : 0;
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(Math.round(fx - 5 * u), Math.round(fy - u), 10 * u, 2 * u);
  const p = mk(ctx, fx, fy - bob, u);
  const hair = '#3a2618', skin = '#f2c29b', shirt = '#1f7a8c', shirtD = '#17606f', pants = '#2b2d42', shoe = '#f4f4f4';
  const side = dir === 'left' || dir === 'right';
  const lL = step === 1 ? 2 : 3, rL = step === 3 ? 2 : 3;
  const xl = side ? 4 : 3, xr = side ? 6 : 7;
  p(xl, 13, 2, lL - 1, pants); p(xl, 13 + lL - 1, 2, 1, shoe);
  p(xr, 13, 2, rL - 1, pants); p(xr, 13 + rL - 1, 2, 1, shoe);
  if (side) {
    p(3, 8, 6, 5, shirt); p(3, 12, 6, 1, shirtD);
    p(5, 9, 2, 4, shirtD); p(5, 13, 2, 1, skin);
  } else {
    p(2, 8, 8, 5, shirt); p(2, 12, 8, 1, shirtD);
    p(1, 9, 1, 4, shirt); p(10, 9, 1, 4, shirt); p(1, 13, 1, 1, skin); p(10, 13, 1, 1, skin);
  }
  if (dir === 'down') {
    p(2, 3, 8, 5, skin); p(2, 0, 8, 3, hair); p(1, 1, 1, 3, hair); p(10, 1, 1, 3, hair);
    p(4, 5, 1, 2, '#1a1a1a'); p(7, 5, 1, 2, '#1a1a1a'); p(5, 7, 2, 1, '#c0695c');
    p(3, 6, 1, 1, '#f0a58f'); p(8, 6, 1, 1, '#f0a58f');
  } else if (dir === 'up') {
    p(2, 0, 8, 8, hair); p(1, 1, 1, 5, hair); p(10, 1, 1, 5, hair);
  } else if (dir === 'left') {
    p(2, 3, 8, 5, skin); p(2, 0, 8, 3, hair); p(7, 3, 3, 4, hair); p(10, 1, 1, 4, hair);
    p(3, 5, 1, 2, '#1a1a1a'); p(2, 6, 1, 1, '#e8a77c'); p(3, 7, 2, 1, '#c0695c');
  } else {
    p(2, 3, 8, 5, skin); p(2, 0, 8, 3, hair); p(2, 3, 3, 4, hair); p(1, 1, 1, 4, hair);
    p(8, 5, 1, 2, '#1a1a1a'); p(9, 6, 1, 1, '#e8a77c'); p(7, 7, 2, 1, '#c0695c');
  }
}

function drawNote(ctx, x, y, s, col) {
  ctx.fillStyle = col;
  ctx.fillRect(Math.round(x), Math.round(y), 3 * s, 2 * s);
  ctx.fillRect(Math.round(x + 2 * s), Math.round(y - 6 * s), s, 6 * s);
  ctx.fillRect(Math.round(x + 3 * s), Math.round(y - 6 * s), 2 * s, s);
}

function drawIla(ctx, fx, fy, u, t) {
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(Math.round(fx - 5 * u), Math.round(fy - u), 10 * u, 2 * u);
  const sway = Math.round(Math.sin(t * 2) * 0.6);
  const p = mk(ctx, fx, fy, u);
  const skin = '#a9693f';
  p(3, 13, 6, 2, '#fafafa'); p(3, 15, 2, 1, skin); p(7, 15, 2, 1, skin); p(6, 13, 1, 2, '#e4e4e4');   // veshti + feet
  p(2, 9, 8, 4, '#f6f6f6'); p(5, 9, 2, 1, '#d8d8d8'); p(2, 12, 8, 1, '#e0e0e0');                     // shirt
  p(1, 10, 1, 4, '#f6f6f6'); p(10, 10, 1, 4, '#f6f6f6'); p(1, 14, 1, 1, skin); p(10, 14, 1, 1, skin); // arms
  p(2, 4, 8, 5, skin);                                                                                // face
  p(4, 4, 4, 1, '#ffffff'); p(5, 5, 2, 1, '#c0392b');                                                 // vibhuti + kumkum
  p(1, 0, 10, 4, '#f2f2f2'); p(0 + sway, 1, 2, 4, '#d9d9d9'); p(10 - sway, 1, 2, 4, '#d9d9d9');        // white fluffy hair
  p(1, 4, 1, 2, '#e8e8e8'); p(10, 4, 1, 2, '#e8e8e8');
  p(3, 6, 3, 2, '#202020'); p(6, 6, 3, 2, '#202020'); p(4, 6, 1, 1, '#9fd0e8'); p(7, 6, 1, 1, '#9fd0e8'); // glasses
  p(5, 8, 2, 1, '#6e3a26');
  const ny = Math.sin(t * 3) * 3;
  drawNote(ctx, fx + 8 * u, fy - 20 * u + ny, Math.max(1, u / 2.5), '#ffd23f');
  drawNote(ctx, fx - 11 * u, fy - 24 * u - ny, Math.max(1, u / 3), '#ff8fb8');
}

function drawRaj(ctx, fx, fy, u, t) {
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(Math.round(fx - 5 * u), Math.round(fy - u), 10 * u, 2 * u);
  const p = mk(ctx, fx, fy, u);
  const skin = '#a2663c', blk = '#161616';
  const wave = (Math.sin(t * 2.2) > 0.6);
  p(3, 13, 2, 3, '#2a2a46'); p(7, 13, 2, 3, '#2a2a46'); p(3, 15, 2, 1, '#111'); p(7, 15, 2, 1, '#111');
  p(2, 9, 8, 5, blk); p(5, 9, 2, 3, skin); p(5, 11, 2, 1, '#e8b830');                               
  p(1, 10, 1, 4, blk); p(1, 14, 1, 1, skin);
  if (wave) { p(10, 6, 1, 4, blk); p(10, 5, 1, 1, skin); } else { p(10, 10, 1, 4, blk); p(10, 14, 1, 1, skin); }
  p(2, 3, 8, 6, skin);
  p(2, 0, 8, 3, blk); p(1, 1, 2, 3, blk); p(5, 0, 5, 1, '#2b2b2b');                                  
  p(2, 5, 8, 2, '#0a0a0a'); p(3, 5, 1, 1, '#9fe3ff'); p(7, 5, 1, 1, '#9fe3ff');                     
  p(4, 7, 4, 1, blk); p(5, 8, 2, 1, '#6e3a26');                                                     
  if (Math.sin(t * 4) > 0.2) {                                                                        
    const sx = fx + 8 * u, sy = fy - 18 * u;
    ctx.fillStyle = '#fff'; ctx.fillRect(sx - 2, sy - 6, 4, 12); ctx.fillRect(sx - 6, sy - 2, 12, 4);
  }
}


function drawAnanya(ctx, fx, fy, u, dir, step) {
  const bob = (step === 1 || step === 3) ? Math.round(u / 2) : 0;
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(Math.round(fx - 5 * u), Math.round(fy - u), 10 * u, 2 * u);
  const p = mk(ctx, fx, fy - bob, u);
  const hair = '#1d1008', skin = '#f2c29b', top = '#e8679a', topD = '#c24a7c', leg = '#4b3a7a', shoe = '#f4f4f4';
  const side = dir === 'left' || dir === 'right';
  const lL = step === 1 ? 2 : 3, rL = step === 3 ? 2 : 3;
  const xl = side ? 4 : 3, xr = side ? 6 : 7;
  p(xl, 13, 2, lL - 1, leg); p(xl, 13 + lL - 1, 2, 1, shoe);
  p(xr, 13, 2, rL - 1, leg); p(xr, 13 + rL - 1, 2, 1, shoe);
  if (side) {
    p(3, 8, 6, 6, top); p(3, 13, 6, 1, topD); p(5, 9, 2, 4, topD); p(5, 13, 2, 1, skin);
  } else {
    p(2, 8, 8, 6, top); p(2, 13, 8, 1, topD); p(5, 8, 2, 1, '#ffd23f');
    p(1, 9, 1, 4, top); p(10, 9, 1, 4, top); p(1, 13, 1, 1, skin); p(10, 13, 1, 1, skin);
  }
  if (dir === 'down') {
    p(2, 3, 8, 5, skin); p(2, 0, 8, 3, hair); p(1, 1, 1, 9, hair); p(10, 1, 1, 9, hair);
    p(4, 5, 1, 2, '#1a1a1a'); p(7, 5, 1, 2, '#1a1a1a'); p(5, 7, 2, 1, '#c0392b');
    p(3, 6, 1, 1, '#f0a58f'); p(8, 6, 1, 1, '#f0a58f'); p(8, 1, 2, 1, '#ffd23f');
  } else if (dir === 'up') {
    p(2, 0, 8, 8, hair); p(1, 1, 1, 9, hair); p(10, 1, 1, 9, hair); p(2, 8, 8, 3, hair); p(8, 1, 2, 1, '#ffd23f');
  } else if (dir === 'left') {
    p(2, 3, 8, 5, skin); p(2, 0, 8, 3, hair); p(7, 3, 3, 7, hair); p(10, 1, 1, 9, hair);
    p(3, 5, 1, 2, '#1a1a1a'); p(2, 6, 1, 1, '#e8a77c'); p(3, 7, 2, 1, '#c0392b'); p(4, 1, 2, 1, '#ffd23f');
  } else {
    p(2, 3, 8, 5, skin); p(2, 0, 8, 3, hair); p(2, 3, 3, 7, hair); p(1, 1, 1, 9, hair);
    p(8, 5, 1, 2, '#1a1a1a'); p(9, 6, 1, 1, '#e8a77c'); p(7, 7, 2, 1, '#c0392b'); p(6, 1, 2, 1, '#ffd23f');
  }
}


const TRIG_LABELS = ['sin²+cos²=1', 'tan = opp/adj', 'π ≈ 3.14', 'sin 30° = ½', 'SOH-CAH-TOA'];
function drawTrig(ctx, fx, fy, u, t, extras = true) {
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(Math.round(fx - 5 * u), Math.round(fy - u), 10 * u, 2 * u);
  const p = mk(ctx, fx, fy, u);
  const skin = '#d9a077', hair = '#2a1320', top = '#7b4bc2', topD = '#5d33a0', skirt = '#3a2766';
  const tap = Math.sin(t * 5) > 0.7 ? 1 : 0;                                                        
  p(3, 13, 2, 2, '#4a3a68'); p(7, 13, 2, 2, '#4a3a68'); p(3, 15, 2, 1, '#222'); p(7, 15, 2, 1, '#222');
  p(2, 12, 8, 2, skirt);
  p(2, 8, 8, 4, top); p(2, 11, 8, 1, topD); p(5, 8, 2, 1, '#ffffff'); p(5, 9, 2, 1, '#e9defa');       // blouse + collar
  p(1, 9, 1, 4, top); p(1, 13, 1, 1, skin);
  p(10, 9, 1, 4, top); p(10, 13, 1, 1, skin);
  p(11, 3 + tap, 1, 11, '#c9a96e'); p(11, 2 + tap, 1, 1, '#ff6b9a');                                 
  p(2, 3, 8, 5, skin);
  p(2, 0, 8, 3, hair); p(1, 1, 1, 5, hair); p(10, 1, 1, 5, hair);
  p(4, -2, 4, 2, hair); p(5, -3, 2, 1, hair); p(4, 0, 4, 1, '#ff6b9a');                               // bun + band
  p(3, 5, 3, 2, '#2b2b2b'); p(6, 5, 3, 2, '#2b2b2b'); p(4, 5, 1, 1, '#bfe9ff'); p(7, 5, 1, 1, '#bfe9ff'); // glasses
  p(5, 3, 2, 1, '#e63950');                                                                           // bindi
  p(5, 7, 2, 1, '#c0392b'); p(3, 7, 1, 1, '#f0a58f'); p(8, 7, 1, 1, '#f0a58f');
  if (extras) {
    const bx = fx - 18, by = fy - 24 * u;
    ctx.fillStyle = '#7fe3f0';
    for (let i = 0; i < 12; i++) ctx.fillRect(Math.round(bx + i * 3), Math.round(by + Math.sin(t * 3 + i * .7) * 5), 3, 3);
    const L = TRIG_LABELS[Math.floor(t / 2.2) % TRIG_LABELS.length];
    ctx.font = `8px ${PIX}`; ctx.textAlign = 'center';
    ctx.fillStyle = '#1b1033'; ctx.fillText(L, Math.round(fx) + 1, Math.round(by) - 11);
    ctx.fillStyle = '#ffffff'; ctx.fillText(L, Math.round(fx), Math.round(by) - 12);
    ctx.textAlign = 'left';
  }
}

function drawPeacock(ctx, fx, fy, u, t, open, flip) {
  ctx.save();
  if (flip) { ctx.translate(fx, 0); ctx.scale(-1, 1); ctx.translate(-fx, 0); }
  const Q = (x, y, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(Math.round(fx + x * u), Math.round(fy + y * u), Math.ceil(w * u), Math.ceil(h * u)); };
  ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillRect(Math.round(fx - 9 * u), Math.round(fy - u), 18 * u, 2 * u);
  if (open > 0.05) {                                              
    const n = 9, L = 7 + open * 18;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 - 0.25 + (i - (n - 1) / 2) * 0.3 * open;
      for (let r = 5; r <= L; r += 1.4) {
        const col = ((Math.floor(r) + i) % 2) ? '#1e9e86' : (Math.sin(t * 3 + i) > 0 ? '#2b6fc4' : '#2f86d6');
        Q(-3 + Math.cos(a) * r, -8 + Math.sin(a) * r, 1.4, 1.4, col);
      }
      const ex = -3 + Math.cos(a) * L, ey = -8 + Math.sin(a) * L;
      Q(ex - 1.5, ey - 1.5, 3.4, 3.4, '#e8b830'); Q(ex - 1, ey - 1, 2.4, 2.4, '#1a58a8'); Q(ex - .4, ey - .4, 1, 1, '#0b2a55');
    }
  }
  Q(-7, -10, 2, 3, '#17589a'); Q(-6, -12, 12, 7, '#1d6fb8'); Q(-4, -5, 9, 2, '#17589a'); Q(-4, -11, 7, 3, '#2b8fd6');
  Q(4, -19, 3, 9, '#1d6fb8'); Q(4, -22, 5, 4, '#2b8fd6'); Q(9, -21, 2, 1, '#e0a030'); Q(7, -21, 1, 1, '#101010');
  Q(5, -26, 1, 4, '#2b6fc4'); Q(7, -25, 1, 3, '#2b6fc4'); Q(5, -27, 1, 1, '#1e9e86'); Q(7, -26, 1, 1, '#1e9e86');
  Q(-2, -5, 1, 5, '#c9a96e'); Q(2, -5, 1, 5, '#c9a96e');
  ctx.restore();
}

function drawLotus(ctx, x, y, u, t) {
  y += Math.sin(t * 2 + x) * 1.2;
  const r = (a, b, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(Math.round(x + a * u), Math.round(y + b * u), Math.ceil(w * u), Math.ceil(h * u)); };
  r(-5, -1, 10, 1, '#2f9d5a');
  r(-4, -3, 2, 3, '#ff7fae'); r(-3, -5, 2, 4, '#ff7fae'); r(2, -3, 2, 3, '#ff7fae'); r(1, -5, 2, 4, '#ff7fae');
  r(-1, -6, 2, 5, '#ffc2da'); r(-2, -4, 1, 3, '#ffa3c6'); r(1, -4, 1, 3, '#ffa3c6');
  r(-2, -1, 4, 1, '#ffd23f');
}

function drawHeartBmp(ctx, x, y, s, col, hi = true) {
  const H = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
  ctx.fillStyle = col;
  for (let r = 0; r < 6; r++) for (let q = 0; q < 7; q++) if (H[r][q] === 'X') ctx.fillRect(Math.round(x + (q - 3.5) * s), Math.round(y + (r - 3) * s), Math.ceil(s), Math.ceil(s));
  if (hi) { ctx.fillStyle = 'rgba(255,255,255,.65)'; ctx.fillRect(Math.round(x + (1 - 3.5) * s), Math.round(y + (1 - 3) * s), Math.ceil(s), Math.ceil(s)); }
}


const parts = [];
const HC = ['#ff3d71', '#ff6b9a', '#ff8fb8', '#ffb3d0', '#e63950', '#ffd23f', '#2fb4d8'];
function burst(x, y, n, world = true, sz = 3) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, sp = 40 + Math.random() * 120;
    const life = .9 + Math.random() * .8;
    parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, g: 170, life, max: life,
                 size: sz - 1 + Math.floor(Math.random() * 2) + (Math.random() < .2 ? 1 : 0), col: pick(HC), world });
  }
  blip(880 + Math.random() * 300, .05, 'triangle', .03);
}
function rocket(x, y, world = true, sz = 4) {
  parts.push({ x, y, vx: (Math.random() - .5) * 18, vy: -70 - Math.random() * 30, g: 0, life: 1.0, max: 1.0, size: sz, col: pick(HC), world, rocket: true });
}
function floaty(x, y) {
  parts.push({ x, y, vx: 8 + Math.random() * 6, vy: -24, g: 0, life: 3, max: 3, size: 3, col: '#ff8fb8', world: true, wob: Math.random() * 6 });
}
function updateParts(dt) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.life -= dt; p.vy += p.g * dt; p.x += (p.vx + (p.wob !== undefined ? Math.sin(p.life * 3 + p.wob) * 10 : 0)) * dt; p.y += p.vy * dt;
    if (p.life <= 0) {
      if (p.rocket) burst(p.x, p.y, 10, p.world, 3);
      parts.splice(i, 1);
    }
  }
}
function drawParts() {
  f.clearRect(0, 0, VW, VH);
  const cam = Math.round(S.camY);
  for (const p of parts) {
    const sx = p.world ? p.x : p.x, sy = p.world ? p.y - cam : p.y;
    if (sy < -20 || sy > VH + 20 || sx < -20 || sx > VW + 20) continue;
    f.globalAlpha = clamp(p.life / (p.max * .5), 0, 1);
    drawHeartBmp(f, sx, sy, p.size, p.col, p.size >= 3);
  }
  f.globalAlpha = 1;
}


const S = {
  mode: 'title', t: 0, camY: 0,
  boy: { x: pc(3200), y: 3200, dir: 'up', step: 0, anim: 0, moving: false },
  gf: { x: pc(3200) - 26, y: 3203, dir: 'up', step: 0, anim: 0, moving: false },   
  dlg: null, done: {}, mailReady: false, opened: false, letterOpen: false,
  peaOpen: 0, hover: false, hearts: 0, rk: 0, rk2: 0, rk3: 0,
};
S.camY = clamp(S.boy.y - VH * .62, 0, WH - VH);

const SPEAK = {
  boy:      { name: CONFIG.friend, col: '#1f7a8c', bg: '#dff3f7' },
  narrator: { name: '',            col: '#b02a52', bg: '#ffe3ee' },
  lotus:    { name: 'Lotus',       col: '#d94f86', bg: '#dff1ff' },
  peacock:  { name: 'Peacock',     col: '#1d6fb8', bg: '#e1f5ef' },
  ila:      { name: 'Ilaiyaraaja', col: '#7a4a2b', bg: '#fff0d6' },
  raj:      { name: 'Rajinikanth', col: '#222222', bg: '#ffe9c9' },
  ananya:   { name: CONFIG.me,     col: '#c24a7c', bg: '#ffe3f0' },
  trig:     { name: 'Miss Sine',   col: '#7a35b0', bg: '#efe1ff' },
};
function portrait(who, px, py, t) {
  const fx = px + 42, fy = py + 82;
  if (who === 'boy') drawBoy(c, fx, fy, 4, 'down', 0);
  else if (who === 'ila') drawIla(c, fx, fy, 4, t);
  else if (who === 'raj') drawRaj(c, fx, fy, 4, t);
  else if (who === 'ananya') drawAnanya(c, fx, fy, 4, 'down', 0);
  else if (who === 'trig') drawTrig(c, fx, fy, 4, t, false);
  else if (who === 'peacock') drawPeacock(c, fx - 6, fy, 2.3, t, 0, false);
  else if (who === 'lotus') drawLotus(c, fx, fy - 12, 7, t);
  else drawHeartBmp(c, fx, py + 44 + Math.sin(t * 4) * 3, 7, '#ff3d71');
}


function say(lines, onEnd) { S.dlg = { lines, i: 0, nf: 0, last: 0, onEnd }; }
function advance() {
  const d = S.dlg; if (!d) return;
  const ln = d.lines[d.i];
  if (d.nf < ln.text.length) { d.nf = ln.text.length; return; }
  blip(520, .05, 'square', .04);
  d.i++;
  if (d.i >= d.lines.length) { const cb = d.onEnd; S.dlg = null; cb && cb(); }
  else { d.nf = 0; d.last = 0; }
}
function wrap(text, maxW) {
  c.font = `22px ${TXT}`;
  const out = []; let cur = '';
  for (const w of text.split(' ')) {
    const t = cur ? cur + ' ' + w : w;
    if (c.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t;
  }
  out.push(cur); return out;
}

const EVENTS = [
  { id: 'pond',    y: POND.y + 70,  face: 'left',  scene: 'pond',    after: () => burst(POND.x, POND.y - 10, 26, true, 3) },
  { id: 'trig',    y: TRIG.y + 90,  face: 'up',    scene: 'trig',    after: () => burst(TRIG.x, TRIG.y - 40, 26, true, 3) },
  { id: 'peacock', y: PEA.y + 45,   face: 'right', scene: 'peacock', after: () => burst(PEA.x, PEA.y - 40, 26, true, 3) },
  { id: 'ila',     y: ILA.y + 90,   face: 'up',    scene: 'ila',     after: () => burst(ILA.x, ILA.y - 40, 26, true, 3) },
  { id: 'raj',     y: RAJ.y + 90,   face: 'up',    scene: 'raj',     after: () => burst(RAJ.x, RAJ.y - 40, 26, true, 3) },
  { id: 'house',   y: HOUSE.y + 135, face: 'up',   scene: 'house',   after: () => { S.mailReady = true; burst(MAIL.x, MAIL.y - 40, 30, true, 4); chime(); } },
];

const keys = {};
const isDown = (...codes) => codes.some(k => keys[k]);
addEventListener('keydown', e => {
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  if (e.repeat && (e.code === 'Space' || e.code === 'Enter')) return;
  keys[e.code] = true;
  if (e.code === 'Escape' && S.letterOpen) closeLetter();
  if (e.code === 'Space' || e.code === 'Enter') {
    if (S.mode === 'title') startGame();
    else if (S.dlg) advance();
    else if (S.mailReady && !S.letterOpen && Math.hypot(S.boy.x - MAIL.x, S.boy.y - MAIL.y) < 120) openLetter();
  }
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

function toLogical(e) {
  const r = cv.getBoundingClientRect();
  return { x: (e.clientX - r.left) * VW / r.width, y: (e.clientY - r.top) * VH / r.height };
}
function overMailbox(p) {
  const wx = p.x, wy = p.y + Math.round(S.camY);
  return Math.abs(wx - MAIL.x) < 32 && wy > MAIL.y - 92 && wy < MAIL.y + 16;
}
stage.addEventListener('mousemove', e => {
  const p = toLogical(e); S.hover = S.mode === 'play' && !S.letterOpen && !S.dlg && S.mailReady && overMailbox(p);
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});
stage.addEventListener('click', e => {
  if (S.letterOpen) return;
  const p = toLogical(e);
  if (S.mode === 'title') { startGame(); return; }
  if (S.dlg) { advance(); return; }
  if (S.mailReady && overMailbox(p)) { openLetter(); return; }
  burst(p.x, p.y, 8, false, 3);                   
});

function startGame() {
  S.mode = 'play'; blip(660, .1, 'triangle', .05);
  burst(VW / 2, VH / 2, 30, false, 4);
  say(CONTENT_SCENES().intro);
}
const CONTENT_SCENES = () => SCENES;


const letterEl = document.getElementById('letter');
const envEl = document.getElementById('envelope');
const paperEl = document.getElementById('paper');
const bodyEl = document.getElementById('letterBody');
let letterTimers = [], letterIv = null;

function buildLetter() {
  let i = 0;
  const parts = [`<h2 class="rise" style="--i:${i++}">${LETTER.title}</h2>`];
  LETTER.paras.forEach(t => parts.push(`<p class="rise" style="--i:${i++}">${t}</p>`));
  parts.push(`<p class="rise sign" style="--i:${i++}">${LETTER.sign}</p>`);
  parts.push(`<p class="rise" style="--i:${i++}">${LETTER.ps}</p>`);
  bodyEl.innerHTML = parts.join('');
}
function openLetter() {
  try { openLetterInner(); }
  catch (err) {
    console.error('openLetter failed:', err);
    S.letterOpen = true; S.opened = true;
    letterEl.classList.remove('hidden'); envEl.classList.add('hide'); paperEl.classList.add('show');
  }
}
function openLetterInner() {
  S.letterOpen = true; S.opened = true; S.hover = false; cv.style.cursor = 'default';
  buildLetter();
  paperEl.scrollTop = 0;
  letterEl.classList.remove('hidden'); envEl.classList.remove('open', 'hide'); paperEl.classList.remove('show');
  chime();
  burst(MAIL.x, MAIL.y - 40 - Math.round(S.camY) + 2 * Math.round(S.camY), 0, true);  
  letterTimers.push(setTimeout(() => envEl.classList.add('open'), 200));
  letterTimers.push(setTimeout(() => {
    envEl.classList.add('hide'); paperEl.classList.add('show');
    for (let k = 0; k < 7; k++) setTimeout(() => burst(60 + Math.random() * (VW - 120), 60 + Math.random() * (VH - 160), 18, false, 4), k * 140);
  }, 1300));
  letterIv = setInterval(() => {
    
    const side = Math.random() < .5 ? 50 + Math.random() * 60 : VW - 50 - Math.random() * 60;
    rocket(side, VH - 30, false, 4);
    if (Math.random() < .5) burst(60 + Math.random() * (VW - 120), 40 + Math.random() * 120, 10, false, 3);
  }, 450);
}
function closeLetter() {
  S.letterOpen = false;
  letterEl.classList.add('hidden');
  letterTimers.forEach(clearTimeout); letterTimers = [];
  clearInterval(letterIv);
}
document.getElementById('closeLetter').addEventListener('click', e => { e.stopPropagation(); closeLetter(); });


function update(dt) {
  S.t += dt;
  const b = S.boy;

  if (S.mode === 'title') {
    S.rk += dt; if (S.rk > .35) { S.rk = 0; rocket(40 + Math.random() * (VW - 80), VH - 40, false, 4 + Math.floor(Math.random() * 2)); }
    b.anim += dt; if (b.anim > .18) { b.anim = 0; b.step = (b.step + 1) % 4; }
    updateParts(dt); return;
  }

 
  b.moving = false;
  if (!S.dlg && !S.letterOpen) {
    let dx = 0, dy = 0;
    if (isDown('KeyA', 'ArrowLeft')) dx -= 1;
    if (isDown('KeyD', 'ArrowRight')) dx += 1;
    if (isDown('KeyW', 'ArrowUp')) dy -= 1;
    if (isDown('KeyS', 'ArrowDown')) dy += 1;
    if (dx && dy) { dx *= .7071; dy *= .7071; }
    if (dx || dy) {
      b.moving = true;
      if (dx) b.dir = dx < 0 ? 'left' : 'right'; else b.dir = dy < 0 ? 'up' : 'down';
      const nx = b.x + dx * SPEED * dt, ny = b.y + dy * SPEED * dt;
      if (!blocked(nx, b.y)) b.x = nx;
      if (!blocked(b.x, ny)) b.y = ny;
    }
  }
  if (b.moving) { b.anim += dt; if (b.anim > .14) { b.anim = 0; b.step = (b.step + 1) % 4; } } else b.step = 0;

  
  {
    const g = S.gf;
    let tx = b.x - 26, ty = b.y + 3;                                
    if (blocked(tx, ty)) { tx = b.x + 26; if (blocked(tx, ty)) { tx = b.x; ty = b.y + 16; } }
    const ex = tx - g.x, ey = ty - g.y, dist = Math.hypot(ex, ey);
    g.moving = dist > 2.5;
    if (g.moving) {
      const sp = Math.min(dist * 6, SPEED * 1.2), k = Math.min(1, sp * dt / dist);
      g.x += ex * k; g.y += ey * k;
      g.dir = b.moving ? b.dir : (Math.abs(ex) > Math.abs(ey) ? (ex < 0 ? 'left' : 'right') : (ey < 0 ? 'up' : 'down'));
      g.anim += dt; if (g.anim > .14) { g.anim = 0; g.step = (g.step + 1) % 4; }
    } else { g.step = 0; g.dir = b.dir; }
  }

  
  if (!S.dlg && !S.letterOpen) {
    for (const ev of EVENTS) {
      if (!S.done[ev.id] && b.y < ev.y) { S.done[ev.id] = true; if (!SCENES[ev.scene]) { console.warn('Missing scene in content.js:', ev.scene); continue; } b.dir = ev.face; b.moving = false; b.step = 0; say(SCENES[ev.scene], ev.after); break; }
    }
  }


  if (S.dlg) {
    const d = S.dlg, ln = d.lines[d.i];
    if (d.nf < ln.text.length) {
      d.nf = Math.min(ln.text.length, d.nf + dt * 52);
      const k = Math.floor(d.nf / 3);
      if (k !== d.last) { d.last = k; blip(260 + Math.random() * 120, .03, 'square', .012); }
    }
  }


  const target = clamp(b.y - VH * .62, 0, WH - VH);
  S.camY = lerp(S.camY, target, Math.min(1, dt * 6));


  const near = Math.hypot(b.x - PEA.x, b.y - PEA.y) < 240;
  const popen = S.done.peacock ? 1 : (near ? .45 : 0);
  S.peaOpen = lerp(S.peaOpen, popen, Math.min(1, dt * 3));


  S.rk += dt; if (S.rk > 2.6) { S.rk = 0; rocket(b.x + (Math.random() - .5) * 120, b.y - 30, true, 3); }
  const houseVisible = S.camY < HOUSE.y + 60;
  if (houseVisible) {
    S.rk2 += dt; if (S.rk2 > (S.mailReady ? .65 : 1.8)) { S.rk2 = 0; rocket(MAIL.x + (Math.random() - .5) * 10, MAIL.y - 64, true, S.mailReady ? 4 : 3); }
    S.rk3 += dt; if (S.rk3 > 1.1) { S.rk3 = 0; floaty(HOUSE.x + 46, HOUSE.y - 148); }
  }
  updateParts(dt);
}


function drawGround(cam) {
  const t0 = Math.floor(cam / TILE), t1 = Math.ceil((cam + VH) / TILE);
  for (let ty = t0; ty <= t1; ty++) for (let tx = 0; tx < TCOLS; tx++) {
    const v = tiles[ty * TCOLS + tx]; if (v === undefined) continue;
    c.fillStyle = v < .5 ? '#7ccf5a' : v < .82 ? '#72c451' : '#86d663';
    c.fillRect(tx * TILE, ty * TILE - cam, TILE, TILE);
    if (v > .93) { c.fillStyle = '#4fa83e'; c.fillRect(tx * TILE + 4, ty * TILE - cam + 8, 2, 4); c.fillRect(tx * TILE + 8, ty * TILE - cam + 6, 2, 6); }
  }

  for (let y = Math.floor(cam / 8) * 8 - 8; y < cam + VH + 8; y += 8) {
    const x = Math.round(pc(y + 4));
    c.fillStyle = '#b98e55'; c.fillRect(x - PW - 4, y - cam, PW * 2 + 8, 8);
    c.fillStyle = '#e2c48a'; c.fillRect(x - PW, y - cam, PW * 2, 8);
    const h = hh(y);
    if (h > .8) { c.fillStyle = '#cfae74'; c.fillRect(x - PW + Math.floor(h * 100) % (PW * 2 - 6), y - cam + 2, 4, 3); }
    if (h < .1) { c.fillStyle = '#f0d9a8'; c.fillRect(x - PW + Math.floor(h * 1000) % (PW * 2 - 6), y - cam + 3, 3, 2); }
  }
  for (const fl of flowers) {
    const y = fl.y - cam; if (y < -6 || y > VH + 6) continue;
    c.fillStyle = fl.col; c.fillRect(fl.x - 2, y, 5, 1); c.fillRect(fl.x, y - 2, 1, 5);
    c.fillStyle = '#ffe36b'; c.fillRect(fl.x, y, 1, 1);
  }
  for (const r of rocks) {
    const y = r.y - cam; if (y < -10 || y > VH + 10) continue;
    c.fillStyle = '#8d9aa5'; c.fillRect(r.x - 4 * r.s, y - 4 * r.s, 8 * r.s, 5 * r.s);
    c.fillStyle = '#aab6bf'; c.fillRect(r.x - 4 * r.s, y - 4 * r.s, 5 * r.s, 2 * r.s);
  }
}

function drawPond(cam, t) {
  const sx = POND.x, sy = POND.y - cam;
  if (sy < -80 || sy > VH + 80) return;
  pe(sx, sy + 3, POND.rx + 12, POND.ry + 9, 4, '#7a5c34');
  pe(sx, sy, POND.rx + 5, POND.ry + 4, 4, '#a3d680');
  pe(sx, sy, POND.rx, POND.ry, 4, '#3c8fc2');
  pe(sx - 8, sy - 6, POND.rx * .72, POND.ry * .66, 4, '#58b0dc');
  c.globalAlpha = .55; c.fillStyle = '#ffffff';
  for (let k = 0; k < 3; k++) {
    const r = (t * .22 + k / 3) % 1; c.globalAlpha = .6 * (1 - r);
    for (let a = 0; a < Math.PI * 2; a += .18) c.fillRect(Math.round((sx + Math.cos(a) * POND.rx * .85 * r) / 3) * 3, Math.round((sy + Math.sin(a) * POND.ry * .85 * r) / 3) * 3, 3, 3);
  }
  c.globalAlpha = 1;
  for (const [dx, dy] of [[-44, 10], [8, 20], [38, -8], [-12, -16], [-52, -12], [50, 14]]) {
    pe(sx + dx, sy + dy, 12, 6, 2, '#2f9d5a'); c.fillStyle = '#3c8fc2'; c.fillRect(sx + dx + 2, sy + dy - 1, 8, 2);
  }
  for (const [dx, dy] of [[-30, -4], [22, 8], [44, -14], [-2, 16], [-50, 2]]) drawLotus(c, sx + dx, sy + dy, 3, t);
}

function drawTree(x, y, s, tone) {
  c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(Math.round(x - 14 * s), Math.round(y - 2), Math.round(28 * s), 5);
  c.fillStyle = '#6b4423'; c.fillRect(Math.round(x - 4 * s), Math.round(y - 20 * s), Math.round(8 * s), Math.round(20 * s));
  c.fillStyle = '#54351a'; c.fillRect(Math.round(x + 1 * s), Math.round(y - 20 * s), Math.round(3 * s), Math.round(20 * s));
  const dark = tone < .5 ? '#2b8a43' : '#2f8f46';
  pe(x, y - 36 * s, 22 * s, 18 * s, 4, dark);
  pe(x - 8 * s, y - 31 * s, 15 * s, 13 * s, 4, '#3aa655');
  pe(x + 9 * s, y - 42 * s, 12 * s, 9 * s, 4, '#58c46a');
}

function drawHouse(cam, t) {
  const hx = HOUSE.x, hy = HOUSE.y - cam;
  c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(hx - 80, hy - 3, 160, 8);
  c.fillStyle = '#f6e6c6'; c.fillRect(hx - 70, hy - 80, 140, 80);
  c.fillStyle = '#e8d3a8'; for (let r = 0; r < 8; r++) c.fillRect(hx - 70, hy - 76 + r * 10, 140, 2);
  c.fillStyle = '#d9c39a'; c.fillRect(hx - 70, hy - 10, 140, 10);
  c.fillStyle = '#8b4a3b'; c.fillRect(hx + 38, hy - 152, 16, 44); c.fillStyle = '#6e3a2d'; c.fillRect(hx + 36, hy - 156, 20, 6);
  for (let k = 0; k < 10; k++) {                                                   
    const w = 184 - k * 17; c.fillStyle = k % 2 ? '#2a82b5' : '#1f6f9c'; c.fillRect(Math.round(hx - w / 2), hy - 87 - k * 7, w, 7);
  }
  drawHeartBmp(c, hx, hy - 106, 4, '#ff6b9a');                                     
  c.fillStyle = '#7a4a2b'; c.fillRect(hx - 14, hy - 50, 28, 50); c.fillRect(hx - 10, hy - 56, 20, 8);
  c.fillStyle = '#5d3720'; c.fillRect(hx - 10, hy - 44, 8, 18); c.fillRect(hx + 2, hy - 44, 8, 18);
  c.fillStyle = '#ffd23f'; c.fillRect(hx + 7, hy - 24, 3, 3);
  c.fillStyle = '#b9a279'; c.fillRect(hx - 22, hy - 4, 44, 5);
  const glow = .75 + Math.sin(t * 2) * .12;
  for (const wx of [hx - 56, hx + 34]) {
    c.fillStyle = '#6b4423'; c.fillRect(wx - 2, hy - 66, 28, 28);
    c.globalAlpha = glow; c.fillStyle = '#ffe9a0'; c.fillRect(wx + 1, hy - 63, 22, 22); c.globalAlpha = 1;
    c.fillStyle = '#6b4423'; c.fillRect(wx + 11, hy - 63, 2, 22); c.fillRect(wx + 1, hy - 53, 22, 2);
    c.fillStyle = '#8b5e3c'; c.fillRect(wx - 4, hy - 38, 32, 6);
    for (let q = 0; q < 5; q++) { c.fillStyle = ['#ff8fb8', '#ffd23f', '#fff', '#ff8fb8', '#b48cff'][q]; c.fillRect(wx - 2 + q * 6, hy - 42, 4, 4); }
  }
}

function drawMailbox(cam, t) {
  const mx = MAIL.x, my = MAIL.y - cam;
  c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(mx - 10, my - 2, 20, 5);
  if (S.mailReady && !S.opened) {                                                 
    c.globalAlpha = .22 + .12 * Math.sin(t * 4); pe(mx, my - 42, 28, 28, 4, '#fff1a8'); c.globalAlpha = 1;
  }
  c.fillStyle = '#6b4423'; c.fillRect(mx - 2, my - 34, 4, 34);
  c.fillStyle = '#1f7a8c'; c.fillRect(mx - 14, my - 52, 28, 20); c.fillRect(mx - 11, my - 56, 22, 4);
  c.fillStyle = '#17606f'; c.fillRect(mx - 14, my - 36, 28, 4); c.fillStyle = '#0f4a57'; c.fillRect(mx - 10, my - 50, 20, 2);
  c.fillStyle = '#ffd23f'; c.fillRect(mx + 8, my - 44, 3, 3);
  if (S.mailReady && !S.opened) {
    c.fillStyle = '#fff'; c.fillRect(mx - 9, my - 61, 18, 9); c.fillStyle = '#d9d2c3'; c.fillRect(mx - 9, my - 61, 18, 2);
    drawHeartBmp(c, mx, my - 56, 2, '#e63950', false);
    c.fillStyle = '#555'; c.fillRect(mx + 14, my - 60, 2, 20); c.fillStyle = '#e63950'; c.fillRect(mx + 16, my - 60, 11, 7);
    const bob = Math.round(Math.sin(t * 5) * 3);
    c.font = `8px ${PIX}`; c.textAlign = 'center'; c.fillStyle = '#1b1033'; c.fillText('CLICK ME', mx + 1, my - 82 + bob + 1);
    c.fillStyle = '#fff'; c.fillText('CLICK ME', mx, my - 83 + bob);
    c.fillStyle = '#ff3d71'; c.fillRect(mx - 3, my - 77 + bob, 6, 3); c.fillRect(mx - 1, my - 74 + bob, 2, 2);
    c.textAlign = 'left';
  } else {
    c.fillStyle = '#555'; c.fillRect(mx + 14, my - 46, 2, 10); c.fillStyle = '#e63950'; c.fillRect(mx + 16, my - 38, 10, 5);
  }
}

function drawDialog(t) {
  const d = S.dlg; if (!d) return;
  const ln = d.lines[d.i], sp = SPEAK[ln.who] || SPEAK.narrator;
  const x = 12, y = VH - 126, w = VW - 24, h = 114;
  panel(x - 4, y - 4 + 4, w + 8, h + 8, 'rgba(0,0,0,.25)', 'rgba(0,0,0,.25)');
  panel(x, y, w, h, '#2a1646', '#fff6ea');
  panel(x + 10, y + 12, 84, 90, '#2a1646', sp.bg);
  c.save(); c.beginPath(); c.rect(x + 14, y + 16, 76, 82); c.clip(); portrait(ln.who, x + 10, y + 12, t); c.restore();
  const tx = x + 110, maxW = w - 110 - 20;
  c.textBaseline = 'alphabetic';
  if (sp.name) { c.font = `10px ${PIX}`; c.fillStyle = sp.col; c.fillText(sp.name.toUpperCase(), tx, y + 28); }
  const lines = wrap(ln.text, maxW);
  c.font = `22px ${TXT}`; c.fillStyle = '#2b1b3a';
  let left = Math.floor(d.nf);
  lines.forEach((l, i) => { if (left <= 0) return; c.fillText(l.slice(0, left), tx, y + 54 + i * 22); left -= l.length + 1; });
  if (d.nf >= ln.text.length && Math.floor(t * 2.5) % 2 === 0) {
    c.font = `8px ${PIX}`; c.fillStyle = '#b02a52'; c.textAlign = 'right';
    c.fillText(d.i === d.lines.length - 1 ? 'SPACE  ♥' : 'SPACE  ▼', x + w - 16, y + h - 12); c.textAlign = 'left';
  }
}

function drawTitle(t) {
  const g = c.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#1a1245'); g.addColorStop(.7, '#4a2a7a'); g.addColorStop(1, '#ff8fb8');
  c.fillStyle = g; c.fillRect(0, 0, VW, VH);
  for (let i = 0; i < 70; i++) { const tw = (Math.sin(t * 2 + i) + 1) / 2; c.globalAlpha = .3 + .7 * tw; c.fillStyle = '#fff'; c.fillRect(Math.floor(hh(i) * VW), Math.floor(hh(i + 99) * VH * .6), 2, 2); }
  c.globalAlpha = 1;
  pe(520, 80, 30, 30, 4, '#fff6cf'); pe(530, 74, 26, 26, 4, '#1a1245');                    
  c.fillStyle = '#2d7a4a'; c.fillRect(0, VH - 70, VW, 70); c.fillStyle = '#3c9a5e'; c.fillRect(0, VH - 70, VW, 6);
  c.fillStyle = '#e2c48a'; c.fillRect(0, VH - 40, VW, 22);
  const bx = ((t * 40) % (VW + 110)) - 40; drawAnanya(c, bx - 34, VH - 22, 3, 'right', S.boy.step); drawBoy(c, bx, VH - 22, 3, 'right', S.boy.step);
  c.textAlign = 'center';
  c.font = `30px ${PIX}`; c.fillStyle = '#3b0d24'; c.fillText('A LITTLE WALK', VW / 2 + 3, 133); c.fillStyle = '#ffd3e4'; c.fillText('A LITTLE WALK', VW / 2, 130);
  c.font = `14px ${PIX}`; c.fillStyle = '#1b1033'; c.fillText(`for ${CONFIG.friend}`, VW / 2 + 2, 175); c.fillStyle = '#7fe3f0'; c.fillText(`for ${CONFIG.friend}`, VW / 2, 173);
  drawHeartBmp(c, VW / 2, 215 + Math.sin(t * 4) * 4, 7, '#ff3d71');
  if (Math.floor(t * 2) % 2 === 0) { c.font = `11px ${PIX}`; c.fillStyle = '#fff'; c.fillText('PRESS SPACE TO BEGIN', VW / 2, 300); }
  c.textAlign = 'left';
}

function drawHud(t) {
  if (S.dlg || S.letterOpen) return;
  c.font = `18px ${TXT}`; c.fillStyle = 'rgba(27,16,51,.55)'; c.fillRect(8, 8, 232, 22);
  c.fillStyle = '#fff'; c.fillText('WASD / ARROWS walk · SPACE talk', 14, 24);
  if (S.mailReady && !S.opened) { c.font = `9px ${PIX}`; c.textAlign = 'center'; c.fillStyle = '#1b1033'; c.fillText('♥ click the mailbox, or press SPACE near it ♥', VW / 2 + 1, 25); c.fillStyle = '#ffe3ee'; c.fillText('♥ click the mailbox, or press SPACE near it ♥', VW / 2, 24); c.textAlign = 'left'; }
}

function draw() {
  const t = S.t;
  if (S.mode === 'title') { drawTitle(t); drawParts(); return; }
  const cam = Math.round(S.camY);
  c.fillStyle = '#7ccf5a'; c.fillRect(0, 0, VW, VH);
  drawGround(cam); drawPond(cam, t);

  const items = [];
  for (const tr of trees) if (tr.y > cam - 20 && tr.y < cam + VH + 90) items.push({ y: tr.y, fn: () => drawTree(tr.x, tr.y - cam, tr.s, tr.tone) });
  items.push({ y: HOUSE.y, fn: () => drawHouse(cam, t) });
  items.push({ y: MAIL.y, fn: () => drawMailbox(cam, t) });
  items.push({ y: PEA.y, fn: () => drawPeacock(c, PEA.x, PEA.y - cam + Math.round(Math.sin(t * 3) * 0.7), 3, t, S.peaOpen, true) });
  items.push({ y: TRIG.y, fn: () => drawTrig(c, TRIG.x, TRIG.y - cam, 3, t) });
  items.push({ y: ILA.y, fn: () => drawIla(c, ILA.x, ILA.y - cam, 3, t) });
  items.push({ y: RAJ.y, fn: () => drawRaj(c, RAJ.x, RAJ.y - cam, 3, t) });
  items.push({ y: S.boy.y, fn: () => drawBoy(c, Math.round(S.boy.x), Math.round(S.boy.y - cam), 3, S.boy.dir, S.boy.step) });
  items.push({ y: S.gf.y, fn: () => drawAnanya(c, Math.round(S.gf.x), Math.round(S.gf.y - cam), 3, S.gf.dir, S.gf.step) });
  items.sort((a, b) => a.y - b.y).forEach(i => i.fn());

  drawHud(t);
  drawDialog(t);
  drawParts();
}


let last = performance.now();
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  update(dt); draw();
  requestAnimationFrame(frame);
}
(document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve())
  .then(() => requestAnimationFrame(t => { last = t; frame(t); }));
})();
