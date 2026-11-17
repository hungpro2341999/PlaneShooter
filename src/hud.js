// Military-style HUD drawn on a 2D canvas overlay. Thin green/cyan lines, red only for warnings.
const G = '#8dffb8', C = '#62e6ff', R = '#ff4b4b', DIM = 'rgba(141,255,184,.35)';
const FONT = (s, w = 600) => `${w} ${s}px ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace`;

export class Hud {
  constructor(canvas) { this.cv = canvas; this.ctx = canvas.getContext('2d'); this.dpr = 1; this.W = 0; this.H = 0; }
  resize(W, H) {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = W; this.H = H;
    this.cv.width = W * this.dpr; this.cv.height = H * this.dpr;
    this.cv.style.width = W + 'px'; this.cv.style.height = H + 'px';
  }
  clear() { this.ctx.setTransform(1, 0, 0, 1, 0, 0); this.ctx.clearRect(0, 0, this.cv.width, this.cv.height); }
  draw(d) {
    const x = this.ctx, W = this.W, H = this.H, t = d.time;
    this.clear();
    x.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    x.lineCap = 'round'; x.lineJoin = 'round';
    const s = Math.max(0.72, Math.min(1.15, Math.min(W, H) / 760)); // ui scale
    this.s = s;

    // damage vignette
    if (d.damage > 0) {
      const g = x.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
      g.addColorStop(0, 'rgba(255,0,0,0)'); g.addColorStop(1, `rgba(200,10,10,${Math.min(0.55, d.damage)})`);
      x.fillStyle = g; x.fillRect(0, 0, W, H);
    }
    if (d.lowHp) {
      const a = 0.12 + 0.1 * Math.sin(t * 6);
      x.strokeStyle = `rgba(255,60,60,${a})`; x.lineWidth = 10; x.strokeRect(5, 5, W - 10, H - 10);
    }

    // enemy markers + offscreen arrows
    for (const m of d.markers) this.marker(m, s, t);
    // base marker
    if (d.baseMarker) this.baseMarker(d.baseMarker, s);

    // lead pip
    if (d.pip) {
      x.strokeStyle = C; x.lineWidth = 1.5;
      x.beginPath(); x.arc(d.pip.x, d.pip.y, 6 * s, 0, 6.283); x.stroke();
      x.beginPath(); x.moveTo(d.pip.x - 10 * s, d.pip.y); x.lineTo(d.pip.x - 7 * s, d.pip.y); x.moveTo(d.pip.x + 7 * s, d.pip.y); x.lineTo(d.pip.x + 10 * s, d.pip.y); x.stroke();
    }

    // crosshair + lock ring
    if (d.cross) this.crosshair(d, s, t);
    // desktop virtual aim cursor
    if (d.aim) {
      x.strokeStyle = 'rgba(98,230,255,.55)'; x.lineWidth = 1.2;
      x.beginPath(); x.arc(d.aim.x, d.aim.y, 5, 0, 6.283); x.stroke();
      if (d.cross) { x.setLineDash([3, 5]); x.beginPath(); x.moveTo(d.cross.x, d.cross.y); x.lineTo(d.aim.x, d.aim.y); x.stroke(); x.setLineDash([]); }
    }

    this.topInfo(d, s, t);
    this.flightBoxes(d, s);
    this.radar(d, s);
    this.weapons(d, s, t);
    this.warnings(d, s, t);
  }

  crosshair(d, s, t) {
    const x = this.ctx, { x: cx, y: cy } = d.cross;
    const locked = d.lock && d.lock.p >= 1;
    x.lineWidth = 1.6; x.strokeStyle = G;
    // gun cross
    const a = 10 * s, b = 22 * s;
    x.beginPath();
    x.moveTo(cx - b, cy); x.lineTo(cx - a, cy); x.moveTo(cx + a, cy); x.lineTo(cx + b, cy);
    x.moveTo(cx, cy + a); x.lineTo(cx, cy + b);
    x.stroke();
    x.fillStyle = G; x.fillRect(cx - 1.5, cy - 1.5, 3, 3);
    // hit marker
    if (d.hitMarker > 0) {
      x.strokeStyle = `rgba(255,255,255,${Math.min(1, d.hitMarker * 6)})`; x.lineWidth = 2;
      const h1 = 7 * s, h2 = 14 * s; x.beginPath();
      for (const [sx, sy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { x.moveTo(cx + sx * h1, cy + sy * h1); x.lineTo(cx + sx * h2, cy + sy * h2); }
      x.stroke();
    }
    // lock ring (missile seeker cone)
    const r = d.lockR;
    x.strokeStyle = locked ? R : (d.lock && d.lock.p > 0 ? C : DIM); x.lineWidth = locked ? 2.2 : 1.3;
    x.beginPath();
    for (let i = 0; i < 4; i++) { const a0 = i * Math.PI / 2 + 0.22, a1 = (i + 1) * Math.PI / 2 - 0.22; x.moveTo(cx + Math.cos(a0) * r, cy + Math.sin(a0) * r); x.arc(cx, cy, r, a0, a1); }
    x.stroke();
    // lock progress arc
    if (d.lock && d.lock.p > 0 && !locked) {
      x.strokeStyle = C; x.lineWidth = 3;
      x.beginPath(); x.arc(cx, cy, r + 6 * s, -Math.PI / 2, -Math.PI / 2 + d.lock.p * 6.283); x.stroke();
    }
    // lock box on target
    if (d.lock && d.lock.screen) {
      const { x: tx, y: ty } = d.lock.screen;
      const sz = locked ? 16 * s : (48 - 30 * d.lock.p) * s;
      x.strokeStyle = locked ? R : C; x.lineWidth = locked ? 2.4 : 1.6;
      x.save(); x.translate(tx, ty); x.rotate(locked ? 0 : (1 - d.lock.p) * 0.8);
      const k = sz * 0.45; x.beginPath();
      for (const [sx, sy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { x.moveTo(sx * sz, sy * (sz - k)); x.lineTo(sx * sz, sy * sz); x.lineTo(sx * (sz - k), sy * sz); }
      x.stroke(); x.restore();
      if (locked) { x.fillStyle = R; x.font = FONT(11 * s, 700); x.textAlign = 'center'; x.fillText('LOCK', tx, ty - sz - 6); }
    }
    // throttle tick under crosshair
    x.fillStyle = G; x.font = FONT(10 * s); x.textAlign = 'center';
    if (d.boost.active) { x.fillStyle = C; x.fillText('▲ BOOST ▲', cx, cy + r + 22 * s); }
  }

  marker(m, s, t) {
    const x = this.ctx;
    const col = m.locked ? R : (m.kind === 'bomber' ? '#ffb36b' : '#ff8a7a');
    if (m.on) {
      const sz = Math.max(9, Math.min(26, 1600 / Math.max(m.dist, 1))) * s;
      x.strokeStyle = col; x.lineWidth = 1.5;
      if (m.kind === 'bomber') { x.strokeRect(m.x - sz, m.y - sz * 0.7, sz * 2, sz * 1.4); }
      else { x.beginPath(); x.moveTo(m.x, m.y - sz); x.lineTo(m.x + sz, m.y); x.lineTo(m.x, m.y + sz); x.lineTo(m.x - sz, m.y); x.closePath(); x.stroke(); }
      // hp tick
      x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(m.x - 14 * s, m.y + sz + 4, 28 * s, 3);
      x.fillStyle = col; x.fillRect(m.x - 14 * s, m.y + sz + 4, 28 * s * m.hp, 3);
      x.font = FONT(10 * s); x.textAlign = 'center'; x.fillStyle = col;
      x.fillText(m.dist > 999 ? (m.dist / 1000).toFixed(1) + 'km' : Math.round(m.dist) + 'm', m.x, m.y - sz - 5);
    } else {
      // arrow at the edge pointing to the enemy
      x.save(); x.translate(m.x, m.y); x.rotate(m.ang);
      x.fillStyle = col; x.globalAlpha = 0.9;
      x.beginPath(); x.moveTo(14 * s, 0); x.lineTo(-6 * s, -8 * s); x.lineTo(-2 * s, 0); x.lineTo(-6 * s, 8 * s); x.closePath(); x.fill();
      x.restore();
      x.font = FONT(9 * s); x.fillStyle = col; x.textAlign = 'center';
      x.fillText(Math.round(m.dist) + 'm', m.x - Math.cos(m.ang) * 20 * s, m.y - Math.sin(m.ang) * 20 * s + 3);
    }
  }
  baseMarker(b, s) {
    const x = this.ctx; x.strokeStyle = C; x.lineWidth = 1.3; x.globalAlpha = 0.8;
    if (b.on) { x.beginPath(); x.moveTo(b.x, b.y - 8 * s); x.lineTo(b.x + 8 * s, b.y); x.lineTo(b.x, b.y + 8 * s); x.lineTo(b.x - 8 * s, b.y); x.closePath(); x.stroke(); x.font = FONT(9 * s); x.textAlign = 'center'; x.fillStyle = C; x.fillText('RADAR', b.x, b.y - 12 * s); }
    x.globalAlpha = 1;
  }

  topInfo(d, s, t) {
    const x = this.ctx, W = this.W;
    const cy = (d.touch ? 16 : 20) * s;
    x.textAlign = 'center'; x.font = FONT(13 * s, 700);
    const tl = Math.max(0, d.timeLeft), mm = Math.floor(tl / 60), ss = Math.floor(tl % 60);
    const warnT = tl < 30;
    x.fillStyle = G;
    x.fillText(`ĐỢT ${d.wave}/${d.waves}`, W / 2 - 78 * s, cy + 12 * s);
    x.fillStyle = warnT && Math.sin(t * 8) > 0 ? R : G;
    x.font = FONT(18 * s, 700);
    x.fillText(`${mm}:${String(ss).padStart(2, '0')}`, W / 2, cy + 14 * s);
    x.font = FONT(13 * s, 700); x.fillStyle = G;
    x.fillText(`ĐỊCH ${d.enemiesLeft}`, W / 2 + 78 * s, cy + 12 * s);
    // base hp bar
    const bw = 190 * s, bx = W / 2 - bw / 2, by = cy + 24 * s;
    x.strokeStyle = DIM; x.lineWidth = 1; x.strokeRect(bx, by, bw, 5);
    x.fillStyle = d.baseHp < 0.35 ? R : C; x.fillRect(bx + 1, by + 1, (bw - 2) * d.baseHp, 3);
    x.font = FONT(9 * s); x.fillStyle = C; x.fillText('CĂN CỨ RADAR', W / 2, by + 16 * s);
    if (d.score != null) { x.textAlign = 'left'; x.fillStyle = G; x.font = FONT(11 * s); }
  }

  flightBoxes(d, s) {
    const x = this.ctx, W = this.W, H = this.H;
    const cy = H * 0.5, off = Math.min(W * 0.3, 230 * s);
    const box = (bx, label, val, unit, align) => {
      const w = 74 * s, h = 26 * s;
      x.strokeStyle = G; x.lineWidth = 1.2;
      x.strokeRect(bx - w / 2, cy - h / 2, w, h);
      x.fillStyle = G; x.font = FONT(15 * s, 700); x.textAlign = 'center';
      x.fillText(val, bx, cy + 5.5 * s);
      x.font = FONT(9 * s); x.fillStyle = DIM.replace('.35', '.8');
      x.fillText(label + ' ' + unit, bx, cy - h / 2 - 5 * s);
      void align;
    };
    box(W / 2 - off, 'TỐC ĐỘ', String(Math.round(d.speed)), 'km/h');
    box(W / 2 + off, 'ĐỘ CAO', String(Math.round(d.alt)), 'm');
    // throttle bar next to speed box
    const tx = W / 2 - off - 50 * s, th = 60 * s;
    x.strokeStyle = DIM; x.lineWidth = 1; x.strokeRect(tx - 3, cy - th / 2, 6, th);
    x.fillStyle = G; x.fillRect(tx - 2, cy + th / 2 - th * d.throttle, 4, th * d.throttle);
    x.font = FONT(8 * s); x.fillStyle = G; x.textAlign = 'center'; x.fillText('THR', tx, cy + th / 2 + 11 * s);
    // climb indicator next to altitude
    const vx = W / 2 + off + 50 * s;
    x.strokeStyle = DIM; x.beginPath(); x.moveTo(vx, cy - th / 2); x.lineTo(vx, cy + th / 2); x.stroke();
    const vy = Math.max(-1, Math.min(1, d.vs / 40));
    x.fillStyle = G; x.beginPath(); x.moveTo(vx + 1, cy - vy * th / 2); x.lineTo(vx + 8, cy - vy * th / 2 - 4); x.lineTo(vx + 8, cy - vy * th / 2 + 4); x.fill();
    // heading
    x.font = FONT(11 * s, 700); x.fillStyle = G; x.textAlign = 'center';
    x.fillText(String(Math.round(d.heading)).padStart(3, '0') + '°', W / 2, H * 0.5 + (d.touch ? -0.31 : -0.34) * H + 0 * s + 60 * s);
  }

  radar(d, s) {
    const x = this.ctx, H = this.H;
    const R0 = (d.touch ? 52 : 74) * s;
    const cx = (d.touch ? 14 : 22) * s + R0, cy = d.touch ? (14 * s + R0) : H - 22 * s - R0;
    x.save();
    x.fillStyle = 'rgba(4,22,18,.55)'; x.beginPath(); x.arc(cx, cy, R0, 0, 6.283); x.fill();
    x.strokeStyle = G; x.lineWidth = 1.3; x.stroke();
    x.strokeStyle = 'rgba(141,255,184,.22)'; x.lineWidth = 1;
    x.beginPath(); x.arc(cx, cy, R0 * 0.5, 0, 6.283); x.moveTo(cx - R0, cy); x.lineTo(cx + R0, cy); x.moveTo(cx, cy - R0); x.lineTo(cx, cy + R0); x.stroke();
    // sweep
    const sw = d.time * 2.2;
    const gr = x.createConicGradient ? x.createConicGradient(sw - 0.9, cx, cy) : null;
    if (gr) { gr.addColorStop(0, 'rgba(141,255,184,0)'); gr.addColorStop(0.14, 'rgba(141,255,184,.22)'); gr.addColorStop(0.1401, 'rgba(141,255,184,0)'); x.fillStyle = gr; x.beginPath(); x.arc(cx, cy, R0, 0, 6.283); x.fill(); }
    x.beginPath(); x.arc(cx, cy, R0 - 1, 0, 6.283); x.clip();
    const k = R0 / d.radar.range;
    // islands
    x.fillStyle = 'rgba(141,255,184,.13)';
    for (const i of d.radar.islands) { x.beginPath(); x.arc(cx + i.x * k, cy + i.y * k, Math.max(2, i.r * k), 0, 6.283); x.fill(); }
    for (const it of d.radar.items) {
      const px = cx + it.x * k, py = cy + it.y * k;
      const out = Math.hypot(it.x, it.y) * k > R0 - 4;
      const ang = Math.atan2(it.y, it.x);
      const qx = out ? cx + Math.cos(ang) * (R0 - 4) : px, qy = out ? cy + Math.sin(ang) * (R0 - 4) : py;
      if (it.t === 'base') { x.fillStyle = C; x.fillRect(qx - 3.5, qy - 3.5, 7, 7); }
      else if (it.t === 'bomber') { x.fillStyle = '#ffb36b'; x.fillRect(qx - 3.5, qy - 2.5, 7, 5); }
      else if (it.t === 'fighter') { x.fillStyle = it.locked ? R : '#ff7a6a'; x.beginPath(); x.arc(qx, qy, 3, 0, 6.283); x.fill(); }
      else if (it.t === 'missile') { x.fillStyle = it.enemy ? R : '#ffffff'; x.fillRect(qx - 1.5, qy - 1.5, 3, 3); }
      else if (it.t === 'boat') { x.fillStyle = 'rgba(98,230,255,.5)'; x.fillRect(qx - 1.5, qy - 1.5, 3, 3); }
    }
    x.restore();
    // player chevron (always pointing up: heading-up radar)
    x.fillStyle = C; x.beginPath(); x.moveTo(cx, cy - 6); x.lineTo(cx + 4.5, cy + 5); x.lineTo(cx, cy + 2.5); x.lineTo(cx - 4.5, cy + 5); x.closePath(); x.fill();
    x.font = FONT(9 * s); x.fillStyle = G; x.textAlign = 'center';
    x.fillText('N', cx + d.radar.north.x * (R0 - 9), cy + d.radar.north.y * (R0 - 9) + 3);
    x.textAlign = 'left'; x.fillStyle = DIM.replace('.35', '.75'); x.fillText((d.radar.range / 1000).toFixed(1) + 'km', cx + R0 * 0.72, cy + R0 + (d.touch ? 10 : -2));
  }

  weapons(d, s, t) {
    const x = this.ctx, W = this.W, H = this.H;
    const w = 172 * s;
    const left = W - w - (d.touch ? 62 : 24) * s;
    let y = d.touch ? 58 * s : H - 136 * s;
    x.textAlign = 'left';
    const bar = (label, frac, col, extra, warn) => {
      x.font = FONT(10 * s, 700); x.fillStyle = warn ? R : col;
      x.fillText(label, left, y);
      if (extra) { x.textAlign = 'right'; x.fillText(extra, left + w, y); x.textAlign = 'left'; }
      y += 5 * s;
      x.strokeStyle = 'rgba(141,255,184,.4)'; x.lineWidth = 1; x.strokeRect(left, y, w, 7 * s);
      x.fillStyle = warn ? R : col; x.fillRect(left + 1.5, y + 1.5, Math.max(0, (w - 3) * frac), 7 * s - 3);
      y += 21 * s;
    };
    bar('THÂN MÁY', d.hp, d.hp < 0.3 ? R : G, Math.round(d.hp * 100) + '%', d.hp < 0.3);
    const heatWarn = d.overheat;
    bar(d.overheat ? 'SÚNG QUÁ NHIỆT' : 'NHIỆT SÚNG', d.heat, d.heat > 0.75 ? '#ffd166' : G, null, heatWarn && Math.sin(t * 12) > -0.3);
    const bf = d.boost.active ? d.boost.left : (d.boost.cd > 0 ? 1 - d.boost.cd : 1);
    bar('BOOST', bf, C, d.boost.active ? 'ĐANG BẬT' : d.boost.cd > 0 ? 'NẠP...' : 'SẴN SÀNG', false);
    // missiles
    x.font = FONT(10 * s, 700); x.fillStyle = G; x.fillText('TÊN LỬA', left, y);
    x.textAlign = 'right'; x.fillText(`${d.missiles}/6`, left + w, y); x.textAlign = 'left';
    y += 6 * s;
    const mw = (w - 5 * 5 * s) / 6;
    for (let i = 0; i < 6; i++) {
      const mx = left + i * (mw + 5 * s);
      x.strokeStyle = 'rgba(141,255,184,.5)'; x.strokeRect(mx, y, mw, 10 * s);
      if (i < d.missiles) { x.fillStyle = C; x.fillRect(mx + 1.5, y + 1.5, mw - 3, 10 * s - 3); }
      else if (i === d.missiles) { x.fillStyle = 'rgba(98,230,255,.35)'; x.fillRect(mx + 1.5, y + 1.5, (mw - 3) * d.regen, 10 * s - 3); }
    }
  }

  warnings(d, s, t) {
    const x = this.ctx, W = this.W, H = this.H;
    let y = H * 0.27;
    x.textAlign = 'center';
    const flash = (txt, fast) => {
      if (Math.sin(t * (fast ? 16 : 8)) < -0.2) { y += 30 * s; return; }
      x.font = FONT(17 * s, 800);
      const tw = x.measureText(txt).width + 26 * s;
      x.strokeStyle = R; x.lineWidth = 2; x.strokeRect(W / 2 - tw / 2, y - 18 * s, tw, 26 * s);
      x.fillStyle = R; x.fillText(txt, W / 2, y);
      y += 34 * s;
    };
    if (d.warn.incoming) flash('⚠ TÊN LỬA ĐANG ĐẾN', true);
    else if (d.warn.lock) flash('MISSILE LOCK', false);
    if (d.outOfBounds) flash('RỜI KHU VỰC — QUAY LẠI', false);
    if (d.baseUnderAttack) flash('CĂN CỨ BỊ OANH TẠC', false);
    if (d.overheat) { x.font = FONT(12 * s, 700); x.fillStyle = R; x.fillText('QUÁ NHIỆT', d.cross ? d.cross.x : W / 2, (d.cross ? d.cross.y : H / 2) + 46 * s); }
  }
}
