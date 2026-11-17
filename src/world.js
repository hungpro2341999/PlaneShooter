import * as THREE from 'three';

// ---------- Terrain (analytic height field shared by visuals, flight clamp, camera, AI) ----------
export const ISLANDS = [
  { x: 170, z: -420, r: 155, h: 50, s: 1.3 }, // big island — radar base
  { x: -10, z: -140, r: 90, h: 26, s: 4.1 },
  { x: -270, z: -40, r: 72, h: 20, s: 2.2 },
  { x: 310, z: 90, r: 66, h: 18, s: 5.7 },
  { x: -330, z: -430, r: 98, h: 36, s: 0.6 },
  { x: 70, z: 230, r: 55, h: 13, s: 3.3 },
  { x: -150, z: 340, r: 46, h: 11, s: 6.2 },
  { x: 500, z: -170, r: 52, h: 17, s: 2.9 },
  { x: -560, z: 150, r: 60, h: 22, s: 1.9 },
];

export const BASE = { x: 110, z: -360, y: 0, r: 26 };

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function islandHeight(isl, x, z) {
  const dx = x - isl.x, dz = z - isl.z;
  const d = Math.hypot(dx, dz);
  if (d > isl.r * 1.45) return -12;
  const a = Math.atan2(dz, dx);
  const rr = isl.r * (1 + 0.13 * Math.sin(3 * a + isl.s) + 0.07 * Math.sin(7 * a + isl.s * 2.3));
  const t = 1 - d / rr;
  if (t < 0) return Math.max(-12, -1.6 + t * 40);
  const ridge = Math.sin(x * 0.071 + isl.s) * Math.cos(z * 0.063 - isl.s) * 0.5 + Math.sin(x * 0.17 - z * 0.13 + isl.s * 3) * 0.25;
  const m = Math.pow(Math.max(0, (t - 0.12) / 0.88), 1.45);
  return -1.6 + 3.6 * smooth(0, 0.14, t) + isl.h * m * (1 + 0.35 * ridge);
}

function rawHeight(x, z) {
  let h = -12;
  for (const isl of ISLANDS) h = Math.max(h, islandHeight(isl, x, z));
  return h;
}
BASE.y = rawHeight(BASE.x, BASE.z) + 0.3;

export function terrainHeight(x, z) {
  let h = rawHeight(x, z);
  const d = Math.hypot(x - BASE.x, z - BASE.z);
  if (d < 46) h = h + (BASE.y - h) * smooth(46, 27, d);
  return h;
}
export const groundAt = (x, z) => Math.max(0, terrainHeight(x, z));

// deterministic random
let seed = 1337;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// ---------- Builders ----------
function buildSky(scene) {
  const geo = new THREE.SphereGeometry(4000, 24, 12);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color('#2f7fd6') }, mid: { value: new THREE.Color('#7fbfee') }, hor: { value: new THREE.Color('#d4ecf7') } },
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 hor; varying vec3 vP;
      void main(){ float h = normalize(vP).y; vec3 c = mix(hor, mid, smoothstep(0.0,0.18,h)); c = mix(c, top, smoothstep(0.18,0.75,h));
      if(h<0.0) c = hor; gl_FragColor = vec4(c,1.0);}`,
  });
  const sky = new THREE.Mesh(geo, mat);
  sky.renderOrder = -10;
  scene.add(sky);
  // sun disc
  const sun = new THREE.Mesh(new THREE.CircleGeometry(90, 24), new THREE.MeshBasicMaterial({ color: '#fff6d8', fog: false }));
  sun.position.set(1400, 1500, -2600); sun.lookAt(0, 0, 0);
  sky.add(sun);
  return sky;
}

function buildSea(scene) {
  const geo = new THREE.PlaneGeometry(6000, 6000, 120, 120);
  const mat = new THREE.MeshPhongMaterial({ color: '#1d86bd', specular: '#4f7f95', shininess: 40, flatShading: true, transparent: true, opacity: 0.86 });
  const uniforms = { uTime: { value: 0 } };
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = uniforms.uTime;
    sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      transformed.z += 0.8*sin(position.x*0.021 + uTime*0.9) + 0.55*sin(position.y*0.027 + uTime*1.25) + 0.3*sin((position.x-position.y)*0.05 + uTime*1.9);`);
  };
  const sea = new THREE.Mesh(geo, mat);
  sea.rotation.x = -Math.PI / 2;
  sea.renderOrder = 1;
  scene.add(sea);
  // deep floor so the transparent sea reads blue/teal
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), new THREE.MeshBasicMaterial({ color: '#0d4d78' }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -11.5;
  scene.add(floor);
  return uniforms;
}

const C = {
  deepSand: new THREE.Color('#b9a271'), sand: new THREE.Color('#ead7a0'), grass: new THREE.Color('#5aa040'),
  forest: new THREE.Color('#2f7634'), rock: new THREE.Color('#8b837a'), darkRock: new THREE.Color('#6a635c'), pad: new THREE.Color('#9a9a92'),
};

function buildIslands(scene) {
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const tmp = new THREE.Color();
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3();
  for (const isl of ISLANDS) {
    const size = isl.r * 2.8;
    const seg = Math.round(size / 9);
    let geo = new THREE.PlaneGeometry(size, size, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + isl.x, z = pos.getZ(i) + isl.z;
      // jitter for low-poly look (not on edges)
      pos.setY(i, terrainHeight(x, z));
    }
    geo = geo.toNonIndexed();
    const p = geo.attributes.position;
    const colors = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i += 3) {
      a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2);
      n.crossVectors(b.clone().sub(a), c.clone().sub(a)).normalize();
      const h = (a.y + b.y + c.y) / 3;
      const slope = 1 - Math.abs(n.y);
      const cx = (a.x + b.x + c.x) / 3 + isl.x, cz = (a.z + b.z + c.z) / 3 + isl.z;
      const onPad = Math.hypot(cx - BASE.x, cz - BASE.z) < 27;
      if (onPad) tmp.copy(C.pad);
      else if (h < -0.6) tmp.copy(C.deepSand);
      else if (h < 2.4) tmp.copy(C.sand);
      else if (slope > 0.42 || h > isl.h * 0.6 + 6) tmp.copy(h > isl.h * 0.8 ? C.darkRock : C.rock);
      else tmp.copy(C.grass).lerp(C.forest, Math.min(1, (h - 2.4) / (isl.h * 0.4 + 4)));
      const j = 0.93 + rnd() * 0.12;
      for (let k = 0; k < 3; k++) { colors[(i + k) * 3] = tmp.r * j; colors[(i + k) * 3 + 1] = tmp.g * j; colors[(i + k) * 3 + 2] = tmp.b * j; }
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(isl.x, 0, isl.z);
    scene.add(mesh);
  }
}

function buildTrees(scene) {
  const spots = [];
  for (const isl of ISLANDS) {
    const count = Math.round(isl.r * isl.r * 0.018);
    for (let i = 0; i < count; i++) {
      const ang = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * isl.r;
      const x = isl.x + Math.cos(ang) * d, z = isl.z + Math.sin(ang) * d;
      const h = terrainHeight(x, z);
      if (h < 2.8 || h > isl.h * 0.6 + 5) continue;
      const sl = Math.abs(terrainHeight(x + 3, z) - h) + Math.abs(terrainHeight(x, z + 3) - h);
      if (sl > 3.2) continue;
      if (Math.hypot(x - BASE.x, z - BASE.z) < 40) continue;
      spots.push([x, h, z, 0.7 + rnd() * 0.7, rnd()]);
    }
  }
  const trunkG = new THREE.CylinderGeometry(0.35, 0.5, 2.4, 5); trunkG.translate(0, 1.2, 0);
  const leafG = new THREE.ConeGeometry(2.2, 6, 6); leafG.translate(0, 5, 0);
  const trunks = new THREE.InstancedMesh(trunkG, new THREE.MeshLambertMaterial({ color: '#6b4a2b', flatShading: true }), spots.length);
  const leaves = new THREE.InstancedMesh(leafG, new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true }), spots.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), col = new THREE.Color();
  const greens = ['#2e7d32', '#3b8f3a', '#246b2c', '#4f9a3a'];
  spots.forEach(([x, y, z, sc, r], i) => {
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r * 6.28);
    s.set(sc, sc * (0.9 + r * 0.4), sc); p.set(x, y - 0.3, z);
    m.compose(p, q, s);
    trunks.setMatrixAt(i, m); leaves.setMatrixAt(i, m);
    leaves.setColorAt(i, col.set(greens[i % greens.length]));
  });
  scene.add(trunks, leaves);
  // beach rocks
  const rockG = new THREE.DodecahedronGeometry(1.4, 0);
  const rocks = [];
  for (const isl of ISLANDS) for (let i = 0; i < isl.r * 0.25; i++) {
    const ang = rnd() * 6.28, d = isl.r * (0.75 + rnd() * 0.35);
    const x = isl.x + Math.cos(ang) * d, z = isl.z + Math.sin(ang) * d, h = terrainHeight(x, z);
    if (h > -1 && h < 6) rocks.push([x, h, z, 0.6 + rnd() * 1.6]);
  }
  const rm = new THREE.InstancedMesh(rockG, new THREE.MeshLambertMaterial({ color: '#7d766e', flatShading: true }), rocks.length);
  rocks.forEach(([x, y, z, sc], i) => { m.compose(p.set(x, y, z), q.setFromEuler(new THREE.Euler(rnd() * 3, rnd() * 3, 0)), s.set(sc, sc * 0.7, sc)); rm.setMatrixAt(i, m); });
  scene.add(rm);
}

function buildClouds(scene) {
  const g = new THREE.IcosahedronGeometry(1, 0);
  const n = 46, per = 6;
  const mesh = new THREE.InstancedMesh(g, new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true, emissive: '#9aa9b8' }), n * per);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
  let k = 0;
  for (let i = 0; i < n; i++) {
    const ang = rnd() * 6.28, d = 150 + rnd() * 1500;
    const cx = Math.cos(ang) * d, cz = Math.sin(ang) * d - 150, cy = 150 + rnd() * 90;
    const big = 10 + rnd() * 14;
    for (let j = 0; j < per; j++) {
      const sc = big * (0.55 + rnd() * 0.6);
      p.set(cx + (j - per / 2) * big * 0.9 + rnd() * 6, cy + rnd() * big * 0.4, cz + (rnd() - 0.5) * big * 1.4);
      q.setFromEuler(new THREE.Euler(rnd() * 3, rnd() * 3, rnd() * 3));
      s.set(sc * 1.3, sc * 0.75, sc);
      m.compose(p, q, s); mesh.setMatrixAt(k++, m);
    }
  }
  scene.add(mesh);
}

function buildBase(scene) {
  const g = new THREE.Group();
  g.position.set(BASE.x, BASE.y, BASE.z);
  const lam = (c) => new THREE.MeshLambertMaterial({ color: c, flatShading: true });
  const concrete = lam('#b3b1a8'), wall = lam('#d9d4c4'), roof = lam('#5d6b5a'), metal = lam('#9aa3a8'), red = lam('#c0392b'), white = lam('#f2f2f2');
  const add = (geo, mat, x, y, z, ry = 0) => { const me = new THREE.Mesh(geo, mat); me.position.set(x, y, z); me.rotation.y = ry; g.add(me); return me; };
  add(new THREE.CylinderGeometry(25, 26, 1, 10), concrete, 0, -0.2, 0);
  add(new THREE.BoxGeometry(12, 5, 7), wall, -11, 2.5, 6, 0.3);
  add(new THREE.BoxGeometry(12.6, 0.8, 7.6), roof, -11, 5.3, 6, 0.3);
  add(new THREE.BoxGeometry(7, 4, 6), wall, 10, 2, 10, -0.4);
  add(new THREE.BoxGeometry(7.4, 0.7, 6.4), roof, 10, 4.3, 10, -0.4);
  for (let i = 0; i < 3; i++) add(new THREE.CylinderGeometry(2.2, 2.2, 4, 8), white, 12 + i * 4.8, 2, -9);
  // radar tower
  add(new THREE.CylinderGeometry(1.6, 3, 12, 6), metal, 0, 6, -3);
  add(new THREE.BoxGeometry(6, 2.5, 6), wall, 0, 13, -3);
  const pivot = new THREE.Group(); pivot.position.set(0, 15, -3); g.add(pivot);
  const dishG = new THREE.SphereGeometry(6, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.32);
  const dish = new THREE.Mesh(dishG, new THREE.MeshLambertMaterial({ color: '#eeeeee', flatShading: true, side: THREE.DoubleSide }));
  dish.rotation.x = -Math.PI / 2 - 0.35; dish.position.set(0, 3, 0.5);
  pivot.add(dish);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.6, 4, 0.6), metal); arm.position.y = 1.6; pivot.add(arm);
  const feed = new THREE.Mesh(new THREE.ConeGeometry(0.5, 3, 5), red); feed.position.set(0, 3.4, -2.3); feed.rotation.x = -Math.PI / 2 + 0.35; pivot.add(feed);
  // antenna mast
  const mast = add(new THREE.CylinderGeometry(0.25, 0.4, 16, 4), red, -18, 8, -10);
  add(new THREE.SphereGeometry(0.7, 6, 4), new THREE.MeshBasicMaterial({ color: '#ff3b3b' }), -18, 16.3, -10);
  // AA sandbags ring
  for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28; add(new THREE.BoxGeometry(2.6, 1.2, 1.4), lam('#a08a5c'), Math.cos(a) * 22, 0.7, Math.sin(a) * 22, -a); }
  scene.add(g);
  void mast;
  return { group: g, pivot, hp: 300, maxHp: 300, alive: true, pos: new THREE.Vector3(BASE.x, BASE.y + 8, BASE.z) };
}

function buildBoats(scene) {
  const lam = (c) => new THREE.MeshLambertMaterial({ color: c, flatShading: true });
  const hullG = new THREE.BoxGeometry(3.2, 1.6, 12); // nose built separately
  const noseG = new THREE.ConeGeometry(1.6, 4, 4); noseG.rotateX(-Math.PI / 2); noseG.rotateZ(Math.PI / 4); noseG.scale(1.4, 0.7, 1);
  const wakeG = new THREE.PlaneGeometry(4, 18); wakeG.rotateX(-Math.PI / 2); wakeG.translate(0, 0, 14);
  const wakeM = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.45, depthWrite: false });
  const boats = [];
  const routes = [[-120, 60, 170, 0.05], [300, -250, 120, -0.07], [-430, -200, 150, 0.04], [420, 260, 140, 0.06], [-60, 470, 200, -0.035]];
  for (const [cx, cz, r, sp] of routes) {
    const g = new THREE.Group();
    const hull = new THREE.Mesh(hullG, lam('#5d6770')); hull.position.y = 0.4; g.add(hull);
    const nose = new THREE.Mesh(noseG, lam('#5d6770')); nose.position.set(0, 0.6, -7.9); g.add(nose);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2, 3.6), lam('#e4e4e0')); cab.position.set(0, 2, 1); g.add(cab);
    const gun = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 3), lam('#3a3f44')); gun.position.set(0, 1.7, -4); g.add(gun);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.5, 4), lam('#3a3f44')); mast.position.set(0, 4.5, 1.5); g.add(mast);
    const wake = new THREE.Mesh(wakeG, wakeM); wake.position.y = 0.3; g.add(wake);
    scene.add(g);
    boats.push({ g, cx, cz, r, sp, a: rnd() * 6.28 });
  }
  return boats;
}

export function buildWorld(scene) {
  scene.fog = new THREE.Fog('#cfe7f3', 380, 2200);
  scene.add(new THREE.HemisphereLight('#dff1ff', '#47603f', 1.25));
  const sunL = new THREE.DirectionalLight('#fff1d6', 2.1);
  sunL.position.set(0.5, 0.8, -0.6);
  scene.add(sunL);
  const sky = buildSky(scene);
  const sea = buildSea(scene);
  buildIslands(scene);
  buildTrees(scene);
  buildClouds(scene);
  const base = buildBase(scene);
  const boats = buildBoats(scene);
  return {
    sky, base, boats,
    update(dt, t, camPos) {
      sea.uTime.value = t;
      sky.position.copy(camPos);
      if (base.alive) base.pivot.rotation.y += dt * 1.1;
      for (const b of boats) {
        b.a += b.sp * dt;
        const x = b.cx + Math.cos(b.a) * b.r, z = b.cz + Math.sin(b.a) * b.r;
        b.g.position.set(x, 0.2 + Math.sin(t * 1.3 + b.r) * 0.25, z);
        // tangent direction
        const tx = -Math.sin(b.a) * Math.sign(b.sp), tz = Math.cos(b.a) * Math.sign(b.sp);
        b.g.rotation.y = Math.atan2(-tx, -tz);
        b.g.rotation.z = Math.sin(t * 1.1 + b.r) * 0.04;
      }
    },
  };
}
