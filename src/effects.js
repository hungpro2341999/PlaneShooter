import * as THREE from 'three';

// Capped GPU particle pool (smoke, fire, sparks). One draw call for everything.
export class Particles {
  constructor(scene, max = 2600) {
    this.max = max; this.n = 0; this.cursor = 0;
    this.pos = new Float32Array(max * 3); this.col = new Float32Array(max * 4); this.size = new Float32Array(max);
    this.vel = new Float32Array(max * 3); this.life = new Float32Array(max); this.age = new Float32Array(max);
    this.s0 = new Float32Array(max); this.s1 = new Float32Array(max); this.c0 = new Float32Array(max * 3); this.c1 = new Float32Array(max * 3);
    this.a0 = new Float32Array(max); this.drag = new Float32Array(max); this.rise = new Float32Array(max);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('size', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    this.geo = g;
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { scale: { value: 600 } },
      vertexShader: `attribute float size; attribute vec4 color; varying vec4 vC; uniform float scale;
        void main(){ vC = color; vec4 mv = modelViewMatrix*vec4(position,1.0); gl_PointSize = size*scale/max(1.0,-mv.z); gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `varying vec4 vC; void main(){ vec2 d = gl_PointCoord-0.5; float r = dot(d,d); if(r>0.25) discard;
        // faceted look: soft disc with hard-ish edge
        float a = vC.a * smoothstep(0.25, 0.12, r); gl_FragColor = vec4(vC.rgb, a); }`,
    });
    this.mat = mat;
    this.points = new THREE.Points(g, mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 5;
    scene.add(this.points);
  }
  spawn(x, y, z, vx, vy, vz, life, s0, s1, c0, c1, a0 = 1, drag = 1, rise = 0) {
    let i;
    if (this.n < this.max) i = this.n++;
    else { i = this.cursor; this.cursor = (this.cursor + 1) % this.max; }
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
    this.vel[i * 3] = vx; this.vel[i * 3 + 1] = vy; this.vel[i * 3 + 2] = vz;
    this.life[i] = life; this.age[i] = 0; this.s0[i] = s0; this.s1[i] = s1;
    this.c0[i * 3] = c0.r; this.c0[i * 3 + 1] = c0.g; this.c0[i * 3 + 2] = c0.b;
    this.c1[i * 3] = c1.r; this.c1[i * 3 + 1] = c1.g; this.c1[i * 3 + 2] = c1.b;
    this.a0[i] = a0; this.drag[i] = drag; this.rise[i] = rise;
  }
  update(dt, viewH) {
    this.mat.uniforms.scale.value = viewH * 0.9;
    let n = this.n;
    for (let i = 0; i < n; i++) {
      this.age[i] += dt;
      if (this.age[i] >= this.life[i]) {
        // swap-remove
        n--; this.copy(n, i); i--; continue;
      }
      const t = this.age[i] / this.life[i], k = Math.exp(-this.drag[i] * dt);
      this.vel[i * 3] *= k; this.vel[i * 3 + 1] = this.vel[i * 3 + 1] * k + this.rise[i] * dt; this.vel[i * 3 + 2] *= k;
      this.pos[i * 3] += this.vel[i * 3] * dt; this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt; this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      const tc = Math.min(1, t * 2.2);
      this.col[i * 4] = this.c0[i * 3] + (this.c1[i * 3] - this.c0[i * 3]) * tc;
      this.col[i * 4 + 1] = this.c0[i * 3 + 1] + (this.c1[i * 3 + 1] - this.c0[i * 3 + 1]) * tc;
      this.col[i * 4 + 2] = this.c0[i * 3 + 2] + (this.c1[i * 3 + 2] - this.c0[i * 3 + 2]) * tc;
      this.col[i * 4 + 3] = this.a0[i] * (1 - t) * Math.min(1, t * 12 + 0.3);
      this.size[i] = this.s0[i] + (this.s1[i] - this.s0[i]) * Math.sqrt(t);
    }
    this.n = n;
    if (this.cursor >= n) this.cursor = 0;
    this.geo.setDrawRange(0, n);
    this.geo.attributes.position.needsUpdate = true; this.geo.attributes.color.needsUpdate = true; this.geo.attributes.size.needsUpdate = true;
  }
  copy(from, to) {
    for (let k = 0; k < 3; k++) {
      this.pos[to * 3 + k] = this.pos[from * 3 + k]; this.vel[to * 3 + k] = this.vel[from * 3 + k];
      this.c0[to * 3 + k] = this.c0[from * 3 + k]; this.c1[to * 3 + k] = this.c1[from * 3 + k];
    }
    for (let k = 0; k < 4; k++) this.col[to * 4 + k] = this.col[from * 4 + k];
    this.life[to] = this.life[from]; this.age[to] = this.age[from]; this.s0[to] = this.s0[from]; this.s1[to] = this.s1[from];
    this.a0[to] = this.a0[from]; this.drag[to] = this.drag[from]; this.rise[to] = this.rise[from]; this.size[to] = this.size[from];
  }
  clear() { this.n = 0; this.cursor = 0; this.geo.setDrawRange(0, 0); }
}

const col = (h) => new THREE.Color(h);
export const COL = {
  fireA: col('#fff2b0'), fireB: col('#ff6a1a'), smokeD: col('#3a3633'), smokeL: col('#9a948c'), white: col('#ffffff'),
  grey: col('#c9c9c9'), spark: col('#ffd36b'), sparkB: col('#ff7b2a'), water: col('#e9f7ff'), waterB: col('#8fd0ee'), blue: col('#9ee8ff'),
};

export function explosion(P, p, scale = 1, v = null) {
  const vx = v ? v.x * 0.3 : 0, vy = v ? v.y * 0.3 : 0, vz = v ? v.z * 0.3 : 0;
  for (let i = 0; i < 26 * scale; i++) {
    const d = randDir(); const s = (8 + Math.random() * 22) * scale;
    P.spawn(p.x, p.y, p.z, vx + d.x * s, vy + d.y * s, vz + d.z * s, 0.5 + Math.random() * 0.6, 3 * scale, 7 * scale, COL.fireA, COL.fireB, 1, 2.5, 4);
  }
  for (let i = 0; i < 20 * scale; i++) {
    const d = randDir(); const s = (4 + Math.random() * 10) * scale;
    P.spawn(p.x, p.y, p.z, vx + d.x * s, vy + d.y * s, vz + d.z * s, 1.6 + Math.random() * 1.6, 4 * scale, 13 * scale, COL.smokeD, COL.smokeL, 0.85, 1.6, 3);
  }
  for (let i = 0; i < 18 * scale; i++) {
    const d = randDir(); const s = 30 + Math.random() * 40;
    P.spawn(p.x, p.y, p.z, vx + d.x * s, vy + d.y * s, vz + d.z * s, 0.4 + Math.random() * 0.5, 0.7, 0.2, COL.spark, COL.sparkB, 1, 1.2, -18);
  }
}
export function splash(P, x, z, scale = 1) {
  for (let i = 0; i < 30 * scale; i++) {
    const a = Math.random() * 6.28, r = Math.random() * 6;
    P.spawn(x, 0.5, z, Math.cos(a) * r, 10 + Math.random() * 22 * scale, Math.sin(a) * r, 1 + Math.random() * 0.8, 2, 5 * scale, COL.water, COL.waterB, 0.9, 0.6, -30);
  }
}
export function sparks(P, p, n = 5) {
  for (let i = 0; i < n; i++) {
    const d = randDir(); const s = 10 + Math.random() * 20;
    P.spawn(p.x, p.y, p.z, d.x * s, d.y * s, d.z * s, 0.25 + Math.random() * 0.2, 0.9, 0.3, COL.spark, COL.sparkB, 1, 1, 0);
  }
}
const _d = new THREE.Vector3();
function randDir() { do { _d.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1); } while (_d.lengthSq() > 1 || _d.lengthSq() < 0.01); return _d.normalize(); }

// Tracer line pool — every bullet is a short bright streak.
export class Tracers {
  constructor(scene, max = 400) {
    this.max = max;
    this.pos = new Float32Array(max * 6); this.col = new Float32Array(max * 6);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    this.geo = g;
    this.lines = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.lines.frustumCulled = false;
    this.lines.renderOrder = 6;
    scene.add(this.lines);
    // glow heads
    this.headPos = new Float32Array(max * 3); this.headCol = new Float32Array(max * 4); this.headSize = new Float32Array(max);
    const hg = new THREE.BufferGeometry();
    hg.setAttribute('position', new THREE.BufferAttribute(this.headPos, 3).setUsage(THREE.DynamicDrawUsage));
    hg.setAttribute('color', new THREE.BufferAttribute(this.headCol, 4).setUsage(THREE.DynamicDrawUsage));
    hg.setAttribute('size', new THREE.BufferAttribute(this.headSize, 1).setUsage(THREE.DynamicDrawUsage));
    this.hg = hg;
  }
  attachHeadMaterial(mat) { this.heads = new THREE.Points(this.hg, mat); this.heads.frustumCulled = false; this.heads.renderOrder = 6; this.lines.parent.add(this.heads); }
  write(list) {
    const n = Math.min(list.length, this.max);
    for (let i = 0; i < n; i++) {
      const b = list[i], len = b.len;
      const sp = Math.hypot(b.vx, b.vy, b.vz) || 1;
      this.pos[i * 6] = b.x; this.pos[i * 6 + 1] = b.y; this.pos[i * 6 + 2] = b.z;
      this.pos[i * 6 + 3] = b.x - b.vx / sp * len; this.pos[i * 6 + 4] = b.y - b.vy / sp * len; this.pos[i * 6 + 5] = b.z - b.vz / sp * len;
      const c = b.color;
      this.col[i * 6] = c.r; this.col[i * 6 + 1] = c.g; this.col[i * 6 + 2] = c.b;
      this.col[i * 6 + 3] = c.r * 0.15; this.col[i * 6 + 4] = c.g * 0.15; this.col[i * 6 + 5] = c.b * 0.15;
      this.headPos[i * 3] = b.x; this.headPos[i * 3 + 1] = b.y; this.headPos[i * 3 + 2] = b.z;
      this.headCol[i * 4] = c.r; this.headCol[i * 4 + 1] = c.g; this.headCol[i * 4 + 2] = c.b; this.headCol[i * 4 + 3] = 0.9;
      this.headSize[i] = 1.1;
    }
    this.geo.setDrawRange(0, n * 2); this.hg.setDrawRange(0, n);
    this.geo.attributes.position.needsUpdate = true; this.geo.attributes.color.needsUpdate = true;
    this.hg.attributes.position.needsUpdate = true; this.hg.attributes.color.needsUpdate = true; this.hg.attributes.size.needsUpdate = true;
  }
}
