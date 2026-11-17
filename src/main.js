import * as THREE from 'three';
import { buildWorld, groundAt, ISLANDS, BASE } from './world.js';
import { makeJet, makeBomber, makeMissileMesh, PAL } from './models.js';
import { Particles, Tracers, explosion, splash, sparks, COL } from './effects.js';
import { Sfx } from './audio.js';
import { Hud } from './hud.js';

// ======================= Tuning =======================
const T = {
  minSpeed: 34, maxSpeed: 96, boostMul: 1.55, boostDur: 2.5, boostCd: 5, throttleRate: 0.6,
  maxPitch: 1.1, maxRoll: 1.35, rollRate: 2.6, pitchResp: 2.4, levelResp: 2.8,
  yawFromStick: 0.55, bankTurn: 1.1, minAlt: 4, ceiling: 420,
  gunInterval: 0.07, bulletSpeed: 620, bulletLife: 1.35, gunDmg: 6, heatPerShot: 0.028, cool: 0.42, resumeAt: 0.3, spread: 0.006,
  missiles: 6, regen: 4, lockTime: 1.5, lockAngle: 0.2, keepAngle: 0.28, lockRange: 950, missileDmg: 70,
  timeLimit: 300, playerHp: 100,
  fighterHp: 60, bomberHp: 170, baseHp: 300,
};
const WAVES = [{ f: 3, b: 0 }, { f: 4, b: 1 }, { f: 5, b: 2 }];
const ARENA = { x: 0, z: -150, warn: 1350, hard: 1650 };
const isTouch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;

// ======================= Renderer / scene =======================
const glCanvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: !isTouch, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isTouch ? 1.5 : 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(64, 1, 0.5, 5000);
const world = buildWorld(scene);
const P = new Particles(scene, 2600);
const tracers = new Tracers(scene, 420);
tracers.attachHeadMaterial(P.mat);
const hud = new Hud(document.getElementById('hud'));
const sfx = new Sfx();

let W = 0, H = 0;
function resize() {
  W = window.innerWidth; H = window.innerHeight;
  renderer.setSize(W, H, false);
  camera.aspect = W / H;
  camera.fov = W < H ? 78 : 64;
  camera.updateProjectionMatrix();
  hud.resize(W, H);
}
addEventListener('resize', resize); resize();

// ======================= Helpers =======================
const V = () => new THREE.Vector3();
const _v1 = V(), _v2 = V(), _v3 = V(), _q = new THREE.Quaternion(), _e = new THREE.Euler(0, 0, 0, 'YXZ');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const rand = (a, b) => a + Math.random() * (b - a);
function dirFromYawPitch(yaw, pitch, out) { return out.set(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)); }
function rotateToward(a, b, maxAng) {
  const ang = a.angleTo(b);
  if (ang <= maxAng || ang < 1e-5) { a.copy(b); return; }
  _v3.crossVectors(a, b);
  if (_v3.lengthSq() < 1e-8) _v3.set(0, 1, 0);
  a.applyAxisAngle(_v3.normalize(), maxAng).normalize();
}
function segSphere(p0, p1, c, r) {
  // distance from c to segment p0→p1
  const dx = p1.x - p0.x, dy = p1.y - p0.y, dz = p1.z - p0.z;
  const l2 = dx * dx + dy * dy + dz * dz || 1;
  let t = ((c.x - p0.x) * dx + (c.y - p0.y) * dy + (c.z - p0.z) * dz) / l2;
  t = clamp(t, 0, 1);
  const x = p0.x + dx * t - c.x, y = p0.y + dy * t - c.y, z = p0.z + dz * t - c.z;
  return x * x + y * y + z * z <= r * r;
}
const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// ======================= Entities =======================
const player = {
  mesh: makeJet(PAL.player), pos: V(), vel: V(), fwd: V(), yaw: 0, pitch: 0, roll: 0, speed: 60, throttle: 0.5,
  hp: T.playerHp, heat: 0, overheat: false, gunT: 0, gunSide: 1, missiles: T.missiles, regenT: 0,
  boostT: 0, boostCd: 0, lock: { target: null, p: 0, locked: false }, dead: false, deadT: 0, lastHit: 99, damageFx: 0, lastY: 0, missileSide: 1,
};
scene.add(player.mesh);
const playerFlame = player.mesh.getObjectByName('flame');
const enemyGun = { burst: 0 };
const enemies = [], wrecks = [], bullets = [], missiles = [], bombs = [];
const fighterProto = makeJet(PAL.fighter), bomberProto = makeBomber(), missileProto = makeMissileMesh();
const pBulletCol = new THREE.Color('#fff3a0'), eBulletCol = new THREE.Color('#ff6a4a');

const G = { state: 'menu', time: 0, elapsed: 0, wave: 0, waveDelay: 0, kills: 0, shots: 0, hits: 0, score: 0, base: world.base, hitMarker: 0, baseAlertT: 0, endT: 0, endReason: '', win: false };

function spawnWave(i) {
  const w = WAVES[i];
  const baseAng = Math.atan2(player.pos.z - BASE.z, player.pos.x - BASE.x) + Math.PI + rand(-0.8, 0.8);
  for (let k = 0; k < w.f; k++) {
    const a = baseAng + (k - w.f / 2) * 0.22;
    const d = rand(950, 1150);
    const pos = new THREE.Vector3(BASE.x + Math.cos(a) * d, rand(110, 190), BASE.z + Math.sin(a) * d);
    addEnemy('fighter', pos);
  }
  for (let k = 0; k < w.b; k++) {
    const a = baseAng + (k ? 0.5 : -0.3);
    const pos = new THREE.Vector3(BASE.x + Math.cos(a) * 1350, 150 + k * 18, BASE.z + Math.sin(a) * 1350);
    addEnemy('bomber', pos);
  }
  showBanner(`ĐỢT ${i + 1}`, i === 0 ? 'Bảo vệ căn cứ radar!' : `${w.f} tiêm kích${w.b ? ` + ${w.b} máy bay ném bom` : ''}`);
  sfx.wave();
}
function addEnemy(kind, pos) {
  const mesh = (kind === 'bomber' ? bomberProto : fighterProto).clone();
  const props = mesh.children.filter((c) => c.name === 'prop');
  const flame = mesh.getObjectByName('flame');
  scene.add(mesh);
  const toBase = new THREE.Vector3(BASE.x - pos.x, 0, BASE.z - pos.z).normalize();
  const e = {
    kind, mesh, pos, dir: toBase.clone(), prevDir: toBase.clone(), roll: 0,
    speed: kind === 'bomber' ? 46 : rand(64, 74), hp: kind === 'bomber' ? T.bomberHp : T.fighterHp,
    maxHp: kind === 'bomber' ? T.bomberHp : T.fighterHp, radius: kind === 'bomber' ? 10 : 5.5,
    state: 'patrol', stateT: rand(3, 6), evadeSign: 1, gunT: 0, burstT: 0, pauseT: rand(0.5, 2), trackT: 0,
    missileCd: rand(8, 15), props, flame, lockOn: false, bombT: 0, bombsLeft: 0, passDone: false, smokeT: 0, wp: new THREE.Vector3(BASE.x + rand(-200, 200), 0, BASE.z + rand(-200, 200)),
    alt: pos.y,
  };
  enemies.push(e);
  return e;
}
function clearEntities() {
  for (const e of enemies) scene.remove(e.mesh);
  for (const w of wrecks) scene.remove(w.mesh);
  for (const m of missiles) scene.remove(m.mesh);
  for (const b of bombs) scene.remove(b.mesh);
  enemies.length = wrecks.length = bullets.length = missiles.length = bombs.length = 0;
  P.clear();
}

// ======================= Input =======================
const keys = new Set();
const mouse = { x: 0, y: 0, left: false, right: false, rightEdge: false, moved: false };
const touch = { sx: 0, sy: 0, active: false, id: null, fire: false, missileEdge: false, boostEdge: false, thrUp: false, thrDn: false };
let boostEdge = false, missileEdge = false;

addEventListener('keydown', (e) => {
  if (e.code === 'Escape' || e.code === 'KeyP') { if (G.state === 'play') pause(); else if (G.state === 'pause') resume(); return; }
  if (e.code === 'KeyM') { toggleSound(); return; }
  if (G.state !== 'play') return;
  if (!keys.has(e.code)) {
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') boostEdge = true;
    if (e.code === 'KeyE' || e.code === 'KeyF') missileEdge = true;
  }
  keys.add(e.code);
  if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
});
addEventListener('keyup', (e) => keys.delete(e.code));
glCanvas.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.moved = true; });
glCanvas.addEventListener('mousedown', (e) => {
  sfx.init();
  if (G.state !== 'play') return;
  if (e.button === 0) mouse.left = true;
  if (e.button === 2) missileEdge = true;
});
addEventListener('mouseup', (e) => { if (e.button === 0) mouse.left = false; });
glCanvas.addEventListener('contextmenu', (e) => e.preventDefault());
document.getElementById('hud').addEventListener('contextmenu', (e) => e.preventDefault());
function releaseAll() { keys.clear(); mouse.left = false; touch.fire = touch.thrUp = touch.thrDn = false; touch.active = false; touch.sx = touch.sy = 0; setKnob(0, 0); document.querySelectorAll('.tb.on').forEach((b) => b.classList.remove('on')); }
addEventListener('blur', () => { releaseAll(); if (G.state === 'play') pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { releaseAll(); if (G.state === 'play') pause(); } });

// touch joystick
const stickZone = document.getElementById('stickZone'), stickBase = document.getElementById('stickBase'), knob = document.getElementById('stickKnob');
let stickCenter = { x: 0, y: 0 };
const STICK_R = 56;
function setKnob(x, y) { knob.style.transform = `translate(${x * STICK_R}px,${y * STICK_R}px)`; }
function homeStick() { stickBase.style.left = ''; stickBase.style.top = ''; stickBase.style.bottom = ''; }
stickZone.addEventListener('pointerdown', (e) => {
  sfx.init();
  if (touch.id !== null) return;
  touch.id = e.pointerId; try { stickZone.setPointerCapture(e.pointerId); } catch (_) {}
  const r = stickZone.getBoundingClientRect();
  stickCenter = { x: e.clientX, y: e.clientY };
  stickBase.style.left = e.clientX - r.left + 'px'; stickBase.style.top = e.clientY - r.top + 'px'; stickBase.style.bottom = 'auto';
  touch.active = true; touch.sx = touch.sy = 0; setKnob(0, 0);
});
stickZone.addEventListener('pointermove', (e) => {
  if (e.pointerId !== touch.id) return;
  let dx = (e.clientX - stickCenter.x) / STICK_R, dy = (e.clientY - stickCenter.y) / STICK_R;
  const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; }
  touch.sx = dx; touch.sy = dy; setKnob(dx, dy);
});
const stickUp = (e) => { if (e.pointerId !== touch.id) return; touch.id = null; touch.active = false; touch.sx = touch.sy = 0; setKnob(0, 0); homeStick(); };
stickZone.addEventListener('pointerup', stickUp); stickZone.addEventListener('pointercancel', stickUp);
function holdBtn(id, on, off) {
  const b = document.getElementById(id);
  b.addEventListener('pointerdown', (e) => { e.preventDefault(); sfx.init(); try { b.setPointerCapture(e.pointerId); } catch (_) {} b.classList.add('on'); on(); });
  const up = () => { b.classList.remove('on'); off && off(); };
  b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
  b.addEventListener('contextmenu', (e) => e.preventDefault());
}
holdBtn('tFire', () => (touch.fire = true), () => (touch.fire = false));
holdBtn('tMissile', () => (missileEdge = true));
holdBtn('tBoost', () => (boostEdge = true));
holdBtn('tThrUp', () => (touch.thrUp = true), () => (touch.thrUp = false));
holdBtn('tThrDn', () => (touch.thrDn = true), () => (touch.thrDn = false));

// ======================= UI screens =======================
const $ = (id) => document.getElementById(id);
const screens = ['menu', 'guide', 'pause', 'result'];
function show(id) { for (const s of screens) $(s).classList.toggle('show', s === id); }
let bannerT = 0;
function showBanner(t, sub) { const b = $('banner'); b.innerHTML = `${t}${sub ? `<small>${sub}</small>` : ''}`; b.classList.add('show'); bannerT = 2.6; }
function setPlayingUi(on) {
  document.body.classList.toggle('playing', on);
  $('touch').hidden = !(on && isTouch);
  $('pauseBtn').hidden = !(on && isTouch);
}
function toggleSound() {
  sfx.init(); sfx.setEnabled(!sfx.enabled);
  const t = `Âm thanh: ${sfx.enabled ? 'BẬT' : 'TẮT'}`; $('soundBtn').textContent = t; $('soundBtn2').textContent = t;
}
const click = (id, fn) => $(id).addEventListener('click', () => { sfx.init(); sfx.ui(); fn(); });
click('startBtn', startGame);
click('guideBtn', () => show('guide'));
click('guideBack', () => show(G.state === 'pause' ? 'pause' : 'menu'));
click('resumeBtn', resume);
click('restartBtn', startGame);
click('replayBtn', startGame);
click('menuBtn', toMenu);
click('resMenuBtn', toMenu);
click('soundBtn', toggleSound);
click('soundBtn2', toggleSound);
$('pauseBtn').addEventListener('click', () => { if (G.state === 'play') pause(); });

function startGame() {
  clearEntities();
  Object.assign(player, { yaw: 0.35, pitch: 0, roll: 0, speed: 62, throttle: 0.5, hp: T.playerHp, heat: 0, overheat: false, gunT: 0, missiles: T.missiles, regenT: 0, boostT: 0, boostCd: 0, dead: false, deadT: 0, lastHit: 99, damageFx: 0 });
  player.lock = { target: null, p: 0, locked: false };
  player.pos.set(BASE.x + 140, 120, BASE.z + 520);
  player.lastY = player.pos.y;
  player.mesh.visible = true;
  dirFromYawPitch(player.yaw, 0, player.fwd);
  Object.assign(G, { state: 'play', elapsed: 0, wave: 0, waveDelay: 2.2, kills: 0, shots: 0, hits: 0, score: 0, hitMarker: 0, endT: 0, win: false });
  G.base.hp = G.base.maxHp; G.base.alive = true; G.base.group.visible = true; G.base.group.rotation.z = 0; G.base.group.position.y = BASE.y;
  mouse.x = W / 2; mouse.y = H / 2; releaseAll();
  camInit = true;
  show(null); setPlayingUi(true);
  showBanner('CẤT CÁNH', 'Đợt 1 đang tới…');
}
function pause() { G.state = 'pause'; releaseAll(); show('pause'); setPlayingUi(false); sfx.engine(0, false, false); sfx.warning(0, 0); }
function resume() { G.state = 'play'; show(null); setPlayingUi(true); }
function toMenu() { clearEntities(); G.state = 'menu'; show('menu'); setPlayingUi(false); player.mesh.visible = true; sfx.warning(0, 0); }
function endGame(win, reason) {
  if (G.endT > 0 || G.state !== 'play') return;
  G.win = win; G.endReason = reason; G.endT = win ? 1.6 : 2.4;
}
function showResult() {
  G.state = 'result'; setPlayingUi(false); sfx.warning(0, 0);
  const acc = G.shots ? G.hits / G.shots : 0;
  let score = G.score;
  if (G.win) score += Math.round((T.timeLimit - G.elapsed) * 10 + G.base.hp * 2 + player.hp * 5);
  score += Math.round(acc * 1000);
  $('result').className = 'screen show ' + (G.win ? 'win' : 'lose');
  show('result'); $('result').classList.add(G.win ? 'win' : 'lose');
  $('resTitle').textContent = G.win ? 'CHIẾN THẮNG' : 'THẤT BẠI';
  $('resReason').textContent = G.endReason;
  $('rKills').textContent = G.kills;
  $('rTime').textContent = fmtTime(G.elapsed);
  $('rAcc').textContent = Math.round(acc * 100) + '%';
  $('rScore').textContent = score.toLocaleString('vi-VN');
}

// ======================= Player flight =======================
function steerInput() {
  let dx = 0, dy = 0, roll = 0;
  if (isTouch && touch.active) { dx = touch.sx; dy = touch.sy; }
  else if (!isTouch || mouse.moved) {
    const R = Math.min(W, H) * 0.42;
    dx = clamp((mouse.x - W / 2) / R, -1, 1); dy = clamp((mouse.y - H / 2) / R, -1, 1);
  }
  const dz = 0.05;
  const dzf = (v) => (Math.abs(v) < dz ? 0 : Math.sign(v) * (Math.abs(v) - dz) / (1 - dz));
  dx = dzf(dx); dy = dzf(dy);
  if (keys.has('ArrowLeft')) dx = -1; if (keys.has('ArrowRight')) dx = 1;
  if (keys.has('ArrowUp')) dy = -1; if (keys.has('ArrowDown')) dy = 1;
  if (keys.has('KeyA')) roll -= 1; if (keys.has('KeyD')) roll += 1;
  return { dx, dy, roll };
}

function updatePlayer(dt) {
  const p = player;
  const inp = steerInput();
  // throttle
  const thr = (keys.has('KeyW') || touch.thrUp ? 1 : 0) - (keys.has('KeyS') || touch.thrDn ? 1 : 0);
  p.throttle = clamp(p.throttle + thr * T.throttleRate * dt, 0, 1);
  // boost
  if (boostEdge && p.boostT <= 0 && p.boostCd <= 0) { p.boostT = T.boostDur; sfx.boost(); }
  boostEdge = false;
  if (p.boostT > 0) { p.boostT -= dt; if (p.boostT <= 0) p.boostCd = T.boostCd; }
  else if (p.boostCd > 0) p.boostCd = Math.max(0, p.boostCd - dt);
  const boosting = p.boostT > 0;

  // attitude: pitch follows stick position (self-levels at centre), roll from A/D or stick
  const targetPitch = -inp.dy * T.maxPitch;
  p.pitch = damp(p.pitch, targetPitch, inp.dy ? T.pitchResp : T.levelResp, dt);
  if (inp.roll) p.roll = clamp(p.roll + inp.roll * T.rollRate * dt, -T.maxRoll, T.maxRoll);
  else p.roll = damp(p.roll, inp.dx * 0.95, inp.dx ? 3 : T.levelResp, dt);
  const yawRate = -(inp.dx * T.yawFromStick + Math.sin(p.roll) * T.bankTurn);
  p.yaw += yawRate * dt;

  // arena: steer back when far out
  const ox = p.pos.x - ARENA.x, oz = p.pos.z - ARENA.z, od = Math.hypot(ox, oz);
  p.outOfBounds = od > ARENA.warn;
  if (od > ARENA.hard) {
    const want = Math.atan2(ox, oz); // yaw that points toward centre: fwd=(-sin,-cos)
    let diff = ((want - p.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    p.yaw += clamp(diff, -1, 1) * 1.4 * dt;
    p.roll = damp(p.roll, -Math.sign(diff) * 0.8, 3, dt);
  }

  // terrain / sea floor: never crash — nose is pushed up near ground
  const gh = groundAt(p.pos.x, p.pos.z);
  const ahead = groundAt(p.pos.x + p.fwd.x * 60, p.pos.z + p.fwd.z * 60);
  const clearance = p.pos.y - Math.max(gh, ahead);
  if (clearance < 22 && p.pitch < 0.25) p.pitch = damp(p.pitch, 0.3, 4 * (1 - clearance / 22), dt);
  if (p.pos.y > T.ceiling - 20 && p.pitch > 0) p.pitch = damp(p.pitch, -0.05, 3, dt);

  dirFromYawPitch(p.yaw, p.pitch, p.fwd);
  // speed
  const target = (T.minSpeed + p.throttle * (T.maxSpeed - T.minSpeed)) * (boosting ? T.boostMul : 1);
  p.speed = damp(p.speed, target, boosting ? 2.6 : 0.9, dt);
  p.speed -= Math.sin(p.pitch) * 9 * dt;
  p.speed = Math.max(T.minSpeed, p.speed);
  p.vel.copy(p.fwd).multiplyScalar(p.speed);
  p.lastY = p.pos.y;
  p.pos.addScaledVector(p.vel, dt);
  const floor = groundAt(p.pos.x, p.pos.z) + T.minAlt;
  if (p.pos.y < floor) p.pos.y = floor;
  if (p.pos.y > T.ceiling) p.pos.y = T.ceiling;
  p.vs = (p.pos.y - p.lastY) / Math.max(dt, 1e-4);

  // mesh
  p.mesh.position.copy(p.pos);
  _e.set(p.pitch, p.yaw, -p.roll, 'YXZ'); p.mesh.quaternion.setFromEuler(_e);
  const fl = playerFlame;
  const fs = 0.35 + p.throttle * 0.6 + (boosting ? 1.1 : 0);
  fl.scale.set(boosting ? 1.35 : 1, boosting ? 1.35 : 1, fs * (0.9 + Math.random() * 0.2));
  fl.children[0].material.color.set(boosting ? '#5fd8ff' : '#ff9a3c');
  if (boosting) {
    _v1.set(0, 0, 7.5).applyQuaternion(p.mesh.quaternion).add(p.pos);
    for (let i = 0; i < 2; i++) P.spawn(_v1.x, _v1.y, _v1.z, -p.vel.x * 0.25 + rand(-2, 2), -p.vel.y * 0.25 + rand(-2, 2), -p.vel.z * 0.25 + rand(-2, 2), 0.35, 1.6, 0.4, COL.blue, COL.white, 0.8, 2, 0);
  }
  // damage smoke
  if (p.hp < 50 && Math.random() < (p.hp < 25 ? 0.9 : 0.4)) {
    _v1.set(rand(-1, 1), 0.5, 5).applyQuaternion(p.mesh.quaternion).add(p.pos);
    P.spawn(_v1.x, _v1.y, _v1.z, rand(-2, 2), rand(0, 3), rand(-2, 2), 1.4, 1.5, 5, p.hp < 25 ? COL.smokeD : COL.grey, COL.smokeL, 0.6, 1, 2);
  }

  // regen when out of combat
  p.lastHit += dt;
  if (p.lastHit > 6 && p.hp < T.playerHp) p.hp = Math.min(T.playerHp, p.hp + 2 * dt);
  p.damageFx = Math.max(0, p.damageFx - dt * 1.4);

  updatePlayerWeapons(dt);
}

function aimAssistTarget(maxAng) {
  let best = null, bestA = maxAng;
  for (const e of enemies) {
    _v1.subVectors(e.pos, player.pos); const d = _v1.length(); if (d > 900) continue;
    const t = d / (T.bulletSpeed + player.speed);
    _v2.copy(e.dir).multiplyScalar(e.speed * t).add(e.pos).sub(player.pos);
    const a = _v2.angleTo(player.fwd);
    if (a < bestA) { bestA = a; best = { e, lead: _v2.clone().add(player.pos) }; }
  }
  return best;
}

function updatePlayerWeapons(dt) {
  const p = player;
  // gun heat
  const firing = mouse.left || touch.fire || keys.has('Space');
  p.gunT -= dt;
  if (p.overheat) { if (p.heat <= T.resumeAt) p.overheat = false; }
  if (firing && !p.overheat) {
    while (p.gunT <= 0) {
      p.gunT += T.gunInterval;
      fireGun();
      p.heat += T.heatPerShot;
      if (p.heat >= 1) { p.heat = 1; p.overheat = true; sfx.overheat(); break; }
    }
    p.heat = Math.max(0, p.heat - 0.05 * dt);
  } else {
    p.gunT = Math.max(p.gunT, 0);
    p.heat = Math.max(0, p.heat - T.cool * dt);
  }
  // missile regen
  if (p.missiles < T.missiles) { p.regenT += dt; if (p.regenT >= T.regen) { p.regenT = 0; p.missiles++; } }
  else p.regenT = 0;
  // locking
  const L = p.lock;
  let cand = null, candA = T.lockAngle;
  if (L.target && enemies.includes(L.target)) {
    _v1.subVectors(L.target.pos, p.pos);
    const a = _v1.angleTo(p.fwd);
    if (a < T.keepAngle && _v1.length() < T.lockRange) { cand = L.target; candA = a; }
  }
  if (!cand) {
    for (const e of enemies) {
      _v1.subVectors(e.pos, p.pos); if (_v1.length() > T.lockRange) continue;
      const a = _v1.angleTo(p.fwd); if (a < candA) { candA = a; cand = e; }
    }
  }
  if (cand) {
    if (cand !== L.target) { L.target = cand; L.p = 0; L.locked = false; }
    const before = L.p;
    L.p = Math.min(1, L.p + dt / T.lockTime);
    if (Math.floor(before * 5) !== Math.floor(L.p * 5) && L.p < 1) sfx.lockTick();
    if (L.p >= 1 && !L.locked) { L.locked = true; sfx.locked(); }
  } else {
    L.p = Math.max(0, L.p - dt * 1.4);
    if (L.p < 1) L.locked = false;
    if (L.p <= 0) L.target = null;
  }
  if (L.target && !enemies.includes(L.target)) { L.target = null; L.p = 0; L.locked = false; }
  // fire missile
  if (missileEdge && p.missiles > 0) {
    p.missiles--; p.missileSide *= -1; G.shots++;
    _v1.set(p.missileSide * 2.2, -1.1, 0).applyQuaternion(p.mesh.quaternion).add(p.pos);
    spawnMissile(_v1, p.vel, p.fwd, L.locked ? L.target : null, false);
    sfx.missile();
  }
  missileEdge = false;
}

const _muz = V(), _aim = V();
function fireGun() {
  const p = player;
  p.gunSide *= -1; G.shots++;
  const muzzle = _muz.set(p.gunSide * 1.6, -0.2, -4).applyQuaternion(p.mesh.quaternion).add(p.pos);
  const assist = aimAssistTarget(isTouch ? 0.07 : 0.035);
  const aimPoint = assist ? assist.lead : _aim.copy(p.fwd).multiplyScalar(320).add(p.pos);
  const d = _v3.subVectors(aimPoint, muzzle).normalize();
  d.x += rand(-T.spread, T.spread); d.y += rand(-T.spread, T.spread); d.z += rand(-T.spread, T.spread); d.normalize();
  const sp = T.bulletSpeed + p.speed;
  bullets.push({ x: muzzle.x, y: muzzle.y, z: muzzle.z, vx: d.x * sp, vy: d.y * sp, vz: d.z * sp, life: T.bulletLife, enemy: false, dmg: T.gunDmg, len: 14, color: pBulletCol });
  if (bullets.length > 400) bullets.shift();
  sfx.gun();
  // muzzle flash
  P.spawn(muzzle.x, muzzle.y, muzzle.z, p.vel.x, p.vel.y, p.vel.z, 0.05, 2.2, 1, COL.fireA, COL.spark, 1, 0, 0);
}

function spawnMissile(pos, vel, dir, target, enemy) {
  const mesh = missileProto.clone(); mesh.position.copy(pos); scene.add(mesh);
  if (enemy) mesh.scale.setScalar(1.1);
  missiles.push({ mesh, pos: pos.clone(), dir: dir.clone(), speed: vel.length() + 10, target, enemy, life: enemy ? 6 : 7, age: 0, smokeT: 0, maxSpeed: enemy ? 150 : 200, turn: enemy ? 1.55 : 2.6 });
}

// ======================= Enemies =======================
const _emz = V(), _edir = V();
function enemyFire(e, aimPos, spread, dmg, speed) {
  const muzzle = _emz.copy(e.dir).multiplyScalar(e.kind === 'bomber' ? -13 : 6).add(e.pos);
  if (e.kind === 'bomber') muzzle.y += 0.5;
  const d = _edir.subVectors(aimPos, muzzle).normalize();
  d.x += rand(-spread, spread); d.y += rand(-spread, spread); d.z += rand(-spread, spread); d.normalize();
  bullets.push({ x: muzzle.x, y: muzzle.y, z: muzzle.z, vx: d.x * speed, vy: d.y * speed, vz: d.z * speed, life: 1.3, enemy: true, dmg, len: 10, color: eBulletCol });
  const dist = e.pos.distanceTo(player.pos);
  if (dist < 700) sfx.enemyGun(1 - dist / 700);
}

const _toP = V(), _desired = V();
function updateEnemies(dt) {
  const p = player;
  let anyLock = false;
  for (const e of enemies) {
    e.prevDir.copy(e.dir);
    const toP = _toP.subVectors(p.pos, e.pos); const dist = toP.length();
    const desired = _desired.set(0, 0, 0);
    let turn = e.kind === 'bomber' ? 0.35 : 1.05;
    if (e.kind === 'fighter') {
      e.stateT -= dt;
      // threatened? → evade
      const threatened = (p.lock.target === e && p.lock.p > 0.55) || missiles.some((m) => !m.enemy && m.target === e && m.pos.distanceTo(e.pos) < 420);
      if (threatened && e.state !== 'evade' && Math.random() < dt * 2.5) { e.state = 'evade'; e.stateT = rand(1.4, 2.4); e.evadeSign = Math.random() < 0.5 ? 1 : -1; e.evadeUp = rand(-0.5, 0.5); }
      if (e.state === 'patrol') {
        _v2.set(e.wp.x - e.pos.x, 0, e.wp.z - e.pos.z);
        if (_v2.length() < 120) e.wp.set(BASE.x + rand(-400, 400), 0, BASE.z + rand(-300, 500));
        desired.copy(_v2.normalize()); desired.y = clamp((e.alt - e.pos.y) / 100, -0.3, 0.3);
        if (dist < 900 || e.stateT <= 0) { e.state = 'chase'; e.stateT = rand(8, 14); }
      } else if (e.state === 'chase') {
        const t = dist / 460;
        desired.copy(p.vel).multiplyScalar(t).add(p.pos).sub(e.pos).normalize();
        if (dist < 70) { e.state = 'extend'; e.stateT = rand(1.8, 2.8); }
      } else if (e.state === 'extend') {
        desired.copy(e.dir); desired.y = clamp(desired.y + 0.1, -0.3, 0.4);
        if (e.stateT <= 0) e.state = 'chase';
      } else if (e.state === 'evade') {
        _v2.set(0, 1, 0); desired.crossVectors(e.dir, _v2).multiplyScalar(e.evadeSign).normalize();
        desired.y += e.evadeUp; desired.normalize();
        turn = 1.7;
        if (e.stateT <= 0) { e.state = 'chase'; }
      }
      // guns
      const ang = e.dir.angleTo(toP);
      e.burstT -= dt; e.pauseT -= dt; e.gunT -= dt;
      if (ang < 0.13 && dist < 520 && !p.dead && e.state === 'chase') {
        if (e.pauseT <= 0 && e.burstT <= 0) { e.burstT = rand(0.6, 1.0); e.pauseT = e.burstT + rand(0.8, 1.6); }
        if (e.burstT > 0 && e.gunT <= 0) {
          e.gunT = 0.1;
          const t = dist / 470;
          _v2.copy(p.vel).multiplyScalar(t).add(p.pos);
          enemyFire(e, _v2, 0.022, 3, 470);
        }
      }
      // missile lock on player
      e.missileCd -= dt;
      if (ang < 0.45 && dist < 800 && dist > 120 && !p.dead && e.state !== 'evade') e.trackT += dt; else e.trackT = Math.max(0, e.trackT - dt * 2);
      e.lockOn = e.trackT > 1.6 && e.missileCd < 3;
      if (e.lockOn) anyLock = true;
      if (e.lockOn && e.trackT > 2.8 && e.missileCd <= 0 && !missiles.some((m) => m.enemy && m.owner === e)) {
        spawnMissile(_v2.copy(e.dir).multiplyScalar(4).add(e.pos).add(_v3.set(0, -1.2, 0)), _v3.copy(e.dir).multiplyScalar(e.speed), e.dir, p, true);
        missiles[missiles.length - 1].owner = e;
        e.missileCd = rand(12, 18); e.trackT = 0;
        sfx.missile();
      }
    } else {
      // ---- bomber: fly to base at altitude, drop bombs, loop round for another pass
      const hx = BASE.x - e.pos.x, hz = BASE.z - e.pos.z, hd = Math.hypot(hx, hz);
      if (e.state === 'patrol') {
        desired.set(hx / hd, 0, hz / hd);
        desired.y = clamp((Math.max(110, groundAt(e.pos.x, e.pos.z) + 60) - e.pos.y) / 80, -0.2, 0.2);
        if (hd < 70 && G.base.alive) { e.state = 'bombing'; e.bombsLeft = 5; e.bombT = 0; }
      } else if (e.state === 'bombing') {
        desired.copy(e.dir); desired.y = 0;
        e.bombT -= dt;
        if (e.bombT <= 0 && e.bombsLeft > 0) { e.bombT = 0.28; e.bombsLeft--; dropBomb(e); }
        if (e.bombsLeft <= 0) { e.state = 'egress'; e.stateT = rand(9, 12); }
      } else if (e.state === 'egress') {
        desired.copy(e.dir); desired.y = 0;
        e.stateT -= dt;
        if (e.stateT < 6) { _v2.set(hx, 0, hz).normalize(); desired.lerp(_v2, 0.5).normalize(); turn = 0.3; }
        if (e.stateT <= 0) e.state = 'patrol';
      }
      // tail gunner
      e.gunT -= dt; e.burstT -= dt; e.pauseT -= dt;
      _v2.copy(e.dir).negate();
      if (dist < 420 && _v2.angleTo(toP) < 1.0 && !p.dead) {
        if (e.pauseT <= 0 && e.burstT <= 0) { e.burstT = 0.9; e.pauseT = 2.2; }
        if (e.burstT > 0 && e.gunT <= 0) { e.gunT = 0.13; _v3.copy(p.vel).multiplyScalar(dist / 420).add(p.pos); enemyFire(e, _v3, 0.04, 2.5, 420); }
      }
      for (const pr of e.props) pr.rotation.z += dt * 40;
    }
    // terrain avoidance (look ahead)
    for (const look of [1.2, 2.6]) {
      const ax = e.pos.x + e.dir.x * e.speed * look, az = e.pos.z + e.dir.z * e.speed * look;
      const ay = e.pos.y + e.dir.y * e.speed * look;
      if (ay - groundAt(ax, az) < 35) { desired.y = Math.max(desired.y, 0.55); turn = Math.max(turn, 1.2); }
    }
    if (e.pos.y - groundAt(e.pos.x, e.pos.z) < 28) desired.y = Math.max(desired.y, 0.4);
    if (e.pos.y > 360) desired.y = Math.min(desired.y, -0.2);
    // keep within arena
    const ox = e.pos.x - ARENA.x, oz = e.pos.z - ARENA.z;
    if (Math.hypot(ox, oz) > ARENA.hard) { desired.x -= ox * 0.002; desired.z -= oz * 0.002; }
    if (desired.lengthSq() < 1e-6) desired.copy(e.dir);
    desired.normalize(); desired.y = clamp(desired.y, -0.65, 0.7); desired.normalize();
    rotateToward(e.dir, desired, turn * dt);
    e.pos.addScaledVector(e.dir, e.speed * dt);
    const fl = groundAt(e.pos.x, e.pos.z) + 15; if (e.pos.y < fl) e.pos.y = fl;
    // orientation + bank into turns
    const lat = (e.prevDir.z * e.dir.x - e.prevDir.x * e.dir.z) / Math.max(dt, 1e-4);
    e.roll = damp(e.roll, clamp(-lat * (e.kind === 'bomber' ? 2.2 : 1.1), -1.2, 1.2), 3, dt);
    _e.set(Math.asin(clamp(e.dir.y, -1, 1)), Math.atan2(-e.dir.x, -e.dir.z), -e.roll, 'YXZ');
    e.mesh.quaternion.setFromEuler(_e); e.mesh.position.copy(e.pos);
    if (e.flame) e.flame.scale.z = 0.7 + Math.random() * 0.3;
    // damage smoke
    if (e.hp < e.maxHp * 0.5) {
      e.smokeT -= dt;
      if (e.smokeT <= 0) { e.smokeT = 0.04; _v2.copy(e.dir).multiplyScalar(-e.radius * 0.8).add(e.pos); P.spawn(_v2.x, _v2.y, _v2.z, rand(-1, 1), rand(0, 2), rand(-1, 1), 1.5, 2, 6, COL.smokeD, COL.smokeL, 0.6, 1, 2); }
    }
  }
  p.warnLock = anyLock;
}

function dropBomb(e) {
  const mesh = new THREE.Mesh(bombGeo, bombMat);
  mesh.position.copy(e.pos).y -= 2; scene.add(mesh);
  bombs.push({ mesh, pos: mesh.position, vel: e.dir.clone().multiplyScalar(e.speed * 0.9) });
  G.baseAlertT = 3;
}
const bombGeo = new THREE.CapsuleGeometry(0.5, 1.6, 2, 6); bombGeo.rotateX(Math.PI / 2);
const bombMat = new THREE.MeshLambertMaterial({ color: '#3d3f35', flatShading: true });

function damageEnemy(e, dmg, at) {
  e.hp -= dmg;
  G.hitMarker = 0.18;
  sparks(P, at, 4);
  if (Math.random() < 0.4) sfx.hit();
  if (e.hp <= 0) killEnemy(e);
}
function killEnemy(e) {
  const i = enemies.indexOf(e); if (i < 0) return;
  enemies.splice(i, 1);
  G.kills++; G.score += e.kind === 'bomber' ? 250 : 100;
  explosion(P, e.pos, e.kind === 'bomber' ? 1.6 : 1.1, _v1.copy(e.dir).multiplyScalar(e.speed));
  const vol = clamp(1 - e.pos.distanceTo(player.pos) / 1500, 0.15, 1); sfx.explosion(vol);
  wrecks.push({ mesh: e.mesh, pos: e.pos, vel: e.dir.clone().multiplyScalar(e.speed * 0.7), spin: rand(-3, 3), pitchSpin: rand(0.4, 1.0), smokeT: 0, scale: e.kind === 'bomber' ? 1.5 : 1, life: 12 });
  if (player.lock.target === e) { player.lock.target = null; player.lock.p = 0; player.lock.locked = false; }
}
function hurtPlayer(dmg) {
  const p = player; if (p.dead || G.endT > 0) return;
  p.hp -= dmg; p.lastHit = 0; p.damageFx = Math.min(0.7, p.damageFx + dmg * 0.03);
  sfx.hurt();
  if (p.hp <= 0) {
    p.hp = 0; p.dead = true; p.mesh.visible = false;
    explosion(P, p.pos, 1.5, p.vel); sfx.explosion(1);
    endGame(false, 'Bạn đã bị bắn hạ.');
  }
}
function damageBase(dmg, at) {
  const b = G.base; if (!b.alive) return;
  b.hp = Math.max(0, b.hp - dmg);
  explosion(P, at, 1.3); sfx.explosion(clamp(1 - at.distanceTo(player.pos) / 1400, 0.2, 1));
  if (b.hp <= 0) {
    b.alive = false;
    for (let i = 0; i < 5; i++) explosion(P, _v1.set(BASE.x + rand(-20, 20), BASE.y + rand(2, 12), BASE.z + rand(-20, 20)), 2);
    b.group.rotation.z = 0.12; b.group.position.y = BASE.y - 3;
    endGame(false, 'Căn cứ radar đã bị phá hủy.');
  }
}

// ======================= Projectiles =======================
const _p0 = V(), _p1 = V();
function updateProjectiles(dt) {
  // bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    _p0.set(b.x, b.y, b.z);
    b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt; b.life -= dt;
    _p1.set(b.x, b.y, b.z);
    let dead = b.life <= 0;
    if (!dead && b.y < groundAt(b.x, b.z)) {
      dead = true;
      if (b.y < 0.5 && Math.random() < 0.5) P.spawn(b.x, 0.3, b.z, 0, rand(6, 12), 0, 0.6, 1, 2.5, COL.water, COL.waterB, 0.8, 1, -20);
      else sparks(P, _p1, 2);
    }
    if (!dead) {
      if (b.enemy) {
        if (!player.dead && segSphere(_p0, _p1, player.pos, 4.2)) { dead = true; hurtPlayer(b.dmg); sparks(P, _p1, 3); }
      } else {
        for (const e of enemies) {
          if (segSphere(_p0, _p1, e.pos, e.radius)) { dead = true; G.hits++; damageEnemy(e, b.dmg, _p1); break; }
        }
      }
    }
    if (dead) bullets.splice(i, 1);
  }
  // missiles
  for (let i = missiles.length - 1; i >= 0; i--) {
    const m = missiles[i];
    m.age += dt; m.life -= dt;
    if (m.age > 0.15) m.speed = Math.min(m.maxSpeed, m.speed + 140 * dt);
    const tgtAlive = m.target && (m.target === player ? !player.dead : enemies.includes(m.target));
    if (!tgtAlive) m.target = null;
    if (m.target && m.age > 0.2) {
      const tp = m.target.pos, tv = m.target === player ? player.vel : _v2.copy(m.target.dir).multiplyScalar(m.target.speed);
      const d = m.pos.distanceTo(tp);
      _v1.copy(tv).multiplyScalar(Math.min(1.5, d / m.speed)).add(tp).sub(m.pos).normalize();
      // seeker gimbal limit: lose track if the target gets behind the missile
      if (m.dir.angleTo(_v1) > 1.25) m.target = null;
      else rotateToward(m.dir, _v1, m.turn * dt);
    }
    _p0.copy(m.pos);
    m.pos.addScaledVector(m.dir, m.speed * dt);
    m.mesh.position.copy(m.pos);
    m.mesh.quaternion.setFromUnitVectors(_v3.set(0, 0, -1), m.dir);
    // smoke trail
    m.smokeT -= dt;
    while (m.smokeT <= 0) {
      m.smokeT += 0.014;
      _v1.copy(m.dir).multiplyScalar(-1.6).add(m.pos);
      P.spawn(_v1.x, _v1.y, _v1.z, rand(-0.6, 0.6), rand(-0.2, 0.8), rand(-0.6, 0.6), 1.6, 0.9, 3.2, m.enemy ? COL.grey : COL.white, COL.smokeL, 0.55, 0.6, 0.8);
    }
    P.spawn(_v1.x, _v1.y, _v1.z, 0, 0, 0, 0.06, 1.6, 0.6, COL.fireA, COL.fireB, 1, 0, 0);
    let boom = m.life <= 0;
    const g = groundAt(m.pos.x, m.pos.z);
    if (m.pos.y <= g) { boom = true; if (g <= 0) splash(P, m.pos.x, m.pos.z, 0.6); }
    if (!boom) {
      if (m.enemy) {
        if (!player.dead && segSphere(_p0, m.pos, player.pos, 5.5)) { boom = true; hurtPlayer(30); }
      } else {
        for (const e of enemies) if (segSphere(_p0, m.pos, e.pos, e.radius + 2.5)) { boom = true; G.hits++; damageEnemy(e, T.missileDmg, m.pos); break; }
      }
    }
    if (boom) {
      explosion(P, m.pos, 0.7); sfx.explosion(clamp(1 - m.pos.distanceTo(player.pos) / 1200, 0.1, 0.8));
      scene.remove(m.mesh); missiles.splice(i, 1);
    }
  }
  // bombs
  for (let i = bombs.length - 1; i >= 0; i--) {
    const b = bombs[i];
    b.vel.y -= 22 * dt; b.vel.multiplyScalar(Math.exp(-0.15 * dt));
    b.pos.addScaledVector(b.vel, dt);
    b.mesh.quaternion.setFromUnitVectors(_v3.set(0, 0, -1), _v1.copy(b.vel).normalize());
    const g = groundAt(b.pos.x, b.pos.z);
    if (b.pos.y <= g) {
      const d = Math.hypot(b.pos.x - BASE.x, b.pos.z - BASE.z);
      if (d < 70) damageBase(d < 35 ? 18 : 9, b.pos);
      else if (g <= 0) { splash(P, b.pos.x, b.pos.z, 1.3); explosion(P, b.pos, 0.6); }
      else explosion(P, b.pos, 1);
      scene.remove(b.mesh); bombs.splice(i, 1);
    }
  }
  // wrecks: spiral down burning, then crash
  for (let i = wrecks.length - 1; i >= 0; i--) {
    const w = wrecks[i];
    w.vel.y -= 18 * dt; w.life -= dt;
    w.pos.addScaledVector(w.vel, dt);
    w.mesh.position.copy(w.pos);
    w.mesh.rotateZ(w.spin * dt); w.mesh.rotateX(-w.pitchSpin * dt);
    w.smokeT -= dt;
    while (w.smokeT <= 0) {
      w.smokeT += 0.03;
      P.spawn(w.pos.x, w.pos.y, w.pos.z, rand(-2, 2), rand(0, 3), rand(-2, 2), 0.5, 3 * w.scale, 5 * w.scale, COL.fireA, COL.fireB, 1, 2, 3);
      P.spawn(w.pos.x, w.pos.y, w.pos.z, rand(-1, 1), rand(1, 4), rand(-1, 1), 2.4, 3 * w.scale, 10 * w.scale, COL.smokeD, COL.smokeL, 0.7, 0.8, 2);
    }
    const g = groundAt(w.pos.x, w.pos.z);
    if (w.pos.y <= g + 1 || w.life <= 0) {
      if (g <= 0) splash(P, w.pos.x, w.pos.z, 1.6 * w.scale);
      explosion(P, w.pos, 1.2 * w.scale);
      sfx.explosion(clamp(1 - w.pos.distanceTo(player.pos) / 1500, 0.1, 0.8));
      scene.remove(w.mesh); wrecks.splice(i, 1);
    }
  }
}

// ======================= Waves / rules =======================
function updateRules(dt) {
  G.elapsed += dt;
  if (G.endT > 0) { G.endT -= dt; if (G.endT <= 0) showResult(); return; }
  if (enemies.length === 0 && G.wave <= WAVES.length) {
    if (G.waveDelay > 0) { G.waveDelay -= dt; if (G.waveDelay <= 0) { spawnWave(G.wave); G.wave++; } }
    else if (G.wave >= WAVES.length) { endGame(true, 'Toàn bộ phi đội địch đã bị tiêu diệt!'); }
    else { G.waveDelay = 4; showBanner(`ĐỢT ${G.wave} HOÀN THÀNH`, 'Chuẩn bị đợt tiếp theo…'); }
  }
  if (G.elapsed >= T.timeLimit) endGame(false, 'Hết thời gian 5 phút.');
  G.baseAlertT = Math.max(0, G.baseAlertT - dt);
}

// ======================= Camera =======================
let camInit = true;
const camPos = V(), camLook = V();
function updateCamera(dt) {
  const p = player;
  const boost = p.boostT > 0;
  const dist = 15 + (boost ? 4 : 0) + p.speed * 0.02;
  _v1.set(-Math.sin(p.yaw), 0, -Math.cos(p.yaw));
  const want = _v2.copy(p.pos).addScaledVector(p.fwd, -dist).addScaledVector(_v3.set(0, 1, 0), 4.6 - p.pitch * 1.5);
  const lookAt = _v3.copy(p.pos).addScaledVector(p.fwd, 26);
  if (camInit) { camPos.copy(want); camLook.copy(lookAt); camInit = false; }
  camPos.lerp(want, 1 - Math.exp(-5.5 * dt));
  camLook.lerp(lookAt, 1 - Math.exp(-9 * dt));
  // never clip terrain: check camera point and midpoint to plane
  const gc = groundAt(camPos.x, camPos.z) + 2.5;
  if (camPos.y < gc) camPos.y = gc;
  const mx = (camPos.x + p.pos.x) / 2, mz = (camPos.z + p.pos.z) / 2, my = (camPos.y + p.pos.y) / 2;
  const gm = groundAt(mx, mz) + 2;
  if (my < gm) camPos.y += (gm - my) * 2;
  camera.position.copy(camPos);
  if (G.endT > 0 && p.dead) camera.position.addScaledVector(_v1.set(0, 1, 0), (2.4 - G.endT) * 6);
  camera.lookAt(camLook);
  camera.rotateZ(-p.roll * 0.22);
  const sh = p.damageFx * 0.6 + (boost ? 0.08 : 0);
  if (sh > 0.01) camera.position.add(_v1.set(rand(-sh, sh), rand(-sh, sh), rand(-sh, sh)));
  const fovBase = W < H ? 78 : 64;
  camera.fov = damp(camera.fov, fovBase + (boost ? 8 : 0), 4, dt); camera.updateProjectionMatrix();
}

// ======================= HUD data =======================
const _s = V();
function toScreen(pos) {
  _s.copy(pos).project(camera);
  return { x: (_s.x * 0.5 + 0.5) * W, y: (-_s.y * 0.5 + 0.5) * H, z: _s.z, behind: _s.z > 1 };
}
function edgeMarker(pos) {
  _s.copy(pos).applyMatrix4(camera.matrixWorldInverse);
  let ax = _s.x, ay = -_s.y; if (_s.z > 0) { ax = -ax; ay = -ay; if (Math.hypot(ax, ay) < 0.01) ay = 1; }
  const ang = Math.atan2(ay, ax);
  const mx = W / 2 - 40, my = H / 2 - 40;
  const c = Math.cos(ang), s = Math.sin(ang);
  const k = Math.min(mx / Math.abs(c || 1e-6), my / Math.abs(s || 1e-6));
  return { x: W / 2 + c * k, y: H / 2 + s * k, ang };
}
function buildHud() {
  const p = player, L = p.lock;
  const markers = [];
  for (const e of enemies) {
    const sc = toScreen(e.pos), dist = e.pos.distanceTo(p.pos);
    const on = !sc.behind && sc.x > 20 && sc.x < W - 20 && sc.y > 20 && sc.y < H - 20;
    if (on) markers.push({ on: true, x: sc.x, y: sc.y, kind: e.kind, dist, hp: e.hp / e.maxHp, locked: L.target === e && L.locked });
    else { const m = edgeMarker(e.pos); markers.push({ on: false, ...m, kind: e.kind, dist, locked: L.target === e && L.locked }); }
  }
  for (const m of missiles) if (m.enemy && m.target === player) {
    const sc = toScreen(m.pos);
    if (sc.behind || sc.x < 0 || sc.x > W || sc.y < 0 || sc.y > H) { const em = edgeMarker(m.pos); markers.push({ on: false, ...em, kind: 'missile', dist: m.pos.distanceTo(p.pos), locked: true }); }
  }
  const bsc = toScreen(G.base.pos);
  const crossW = _v1.copy(p.fwd).multiplyScalar(320).add(p.pos);
  const cross = p.dead ? null : toScreen(crossW);
  const lockR = Math.tan(T.lockAngle) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (H / 2);
  let pip = null;
  const at = (L.target && enemies.includes(L.target)) ? { e: L.target } : aimAssistTarget(0.5);
  if (at && at.e && !p.dead) {
    const e = at.e, d = e.pos.distanceTo(p.pos);
    if (d < 1000) { const t = d / (T.bulletSpeed + p.speed); const sc = toScreen(_v2.copy(e.dir).multiplyScalar(e.speed * t).add(e.pos)); if (!sc.behind) pip = sc; }
  }
  let lockScreen = null;
  if (L.target && L.p > 0) { const sc = toScreen(L.target.pos); if (!sc.behind) lockScreen = sc; }
  // radar (heading-up)
  const cy = Math.cos(p.yaw), sy = Math.sin(p.yaw);
  const rel = (x, z) => { const rx = x - p.pos.x, rz = z - p.pos.z; return { x: rx * cy - rz * sy, y: rx * sy + rz * cy }; };
  const items = [];
  items.push({ t: 'base', ...rel(BASE.x, BASE.z) });
  for (const b of world.boats) items.push({ t: 'boat', ...rel(b.g.position.x, b.g.position.z) });
  for (const e of enemies) items.push({ t: e.kind, ...rel(e.pos.x, e.pos.z), locked: L.target === e && L.locked });
  for (const m of missiles) items.push({ t: 'missile', enemy: m.enemy, ...rel(m.pos.x, m.pos.z) });
  const isl = ISLANDS.map((i) => ({ ...rel(i.x, i.z), r: i.r }));
  const heading = ((-p.yaw * 180 / Math.PI) % 360 + 360) % 360;
  return {
    time: G.time, damage: p.damageFx, lowHp: p.hp < 30 && !p.dead, markers, baseMarker: { on: !bsc.behind, x: bsc.x, y: bsc.y }, pip,
    cross, aim: !isTouch && !p.dead ? { x: mouse.x, y: mouse.y } : null, lock: L.target ? { p: L.p, screen: lockScreen } : null, lockR,
    boost: { active: p.boostT > 0, left: p.boostT / T.boostDur, cd: p.boostCd / T.boostCd },
    wave: Math.max(1, G.wave), waves: WAVES.length, timeLeft: T.timeLimit - G.elapsed, enemiesLeft: enemies.length, baseHp: G.base.hp / G.base.maxHp,
    speed: p.speed * 3.6, alt: p.pos.y, throttle: p.throttle, vs: p.vs || 0, heading,
    radar: { range: 1400, islands: isl, items, yaw: p.yaw, north: { x: sy, y: -cy } },
    hp: p.hp / T.playerHp, heat: p.heat, overheat: p.overheat, missiles: p.missiles, regen: p.regenT / T.regen,
    warn: { lock: p.warnLock && !p.dead, incoming: missiles.some((m) => m.enemy && m.target === player) },
    outOfBounds: p.outOfBounds && !p.dead, baseUnderAttack: G.baseAlertT > 0 && G.base.alive, touch: isTouch, hitMarker: G.hitMarker,
  };
}

// ======================= Menu scene =======================
let menuAng = 0;
function updateMenu(dt) {
  menuAng += dt * 0.25;
  const c = _v1.set(-60, 75, 160);
  player.pos.copy(c);
  player.mesh.position.copy(c);
  player.mesh.position.y += Math.sin(G.time * 0.8) * 0.6;
  _e.set(0.05, menuAng, Math.sin(G.time * 0.6) * 0.25, 'YXZ'); player.mesh.quaternion.setFromEuler(_e);
  playerFlame.scale.set(1, 1, 0.8 + Math.random() * 0.2);
  // behind-the-shoulder hero framing, scene slowly rotates around
  const r = 26;
  camera.position.set(c.x + Math.sin(menuAng * 0.35 + 2.2) * r, c.y + 6, c.z + Math.cos(menuAng * 0.35 + 2.2) * r);
  camera.lookAt(c.x, c.y + 4, c.z);
  if (camera.fov !== (W < H ? 78 : 64)) { camera.fov = W < H ? 78 : 64; camera.updateProjectionMatrix(); }
  // a few contrails in background
  if (Math.random() < 0.5) {
    _v2.set(0, 0, 7).applyQuaternion(player.mesh.quaternion).add(player.mesh.position);
    _v3.set(0, 0, 30).applyQuaternion(player.mesh.quaternion);
    P.spawn(_v2.x, _v2.y, _v2.z, _v3.x, _v3.y, _v3.z, 0.8, 0.8, 2.2, COL.white, COL.smokeL, 0.4, 1, 0);
  }
}

// ======================= Main loop =======================
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  let dt = Math.min(0.05, (now - last) / 1000); last = now;
  G.time += dt;
  if (bannerT > 0) { bannerT -= dt; if (bannerT <= 0) $('banner').classList.remove('show'); }
  if (G.state === 'menu' || G.state === 'guide') {
    updateMenu(dt);
    hud.clear();
    sfx.engine(0, false, false);
  } else if (G.state === 'play') {
    if (!player.dead) updatePlayer(dt);
    else { player.speed = 0; }
    updateEnemies(dt);
    updateProjectiles(dt);
    updateRules(dt);
    updateCamera(dt);
    G.hitMarker = Math.max(0, G.hitMarker - dt);
    sfx.engine(player.throttle, player.boostT > 0, !player.dead);
    const inc = missiles.some((m) => m.enemy && m.target === player);
    sfx.warning(player.dead ? 0 : inc ? 2 : player.warnLock ? 1 : 0, G.time);
  } else if (G.state === 'result') {
    // gentle orbit over the battlefield while results show
    updateProjectiles(dt);
    menuAng += dt * 0.1;
    camera.position.set(player.pos.x + Math.sin(menuAng) * 60, player.pos.y + 25, player.pos.z + Math.cos(menuAng) * 60);
    camera.lookAt(player.pos);
    sfx.engine(0, false, false);
  }
  if (G.state !== 'pause') {
    world.update(dt, G.time, camera.position);
    P.update(dt, H * renderer.getPixelRatio());
  }
  tracers.write(bullets);
  renderer.render(scene, camera);
  if (G.state === 'play') hud.draw(buildHud());
  else if (G.state !== 'pause') hud.clear();
}
requestAnimationFrame(frame);

// debug/test hook
window.__ps = { G, player, enemies, missiles, bullets, P, T, startGame, killAll: () => [...enemies].forEach(killEnemy) };
