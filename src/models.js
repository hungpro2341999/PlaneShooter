import * as THREE from 'three';

// All aircraft: nose points to local -Z, up = +Y, right wing = +X.
const lam = (c, extra = {}) => new THREE.MeshLambertMaterial({ color: c, flatShading: true, ...extra });

function wing(span, root, tip, sweep, thick = 0.25) {
  // right-hand trapezoid wing in XZ, then mirrored by caller
  const s = new THREE.Shape();
  s.moveTo(0, -root / 2);
  s.lineTo(span, -root / 2 + sweep);
  s.lineTo(span, -root / 2 + sweep + tip);
  s.lineTo(0, root / 2);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: false });
  g.rotateX(Math.PI / 2);
  g.translate(0, thick / 2, 0);
  return g;
}
function mirrored(geo, mat, x, y, z, group, rz = 0) {
  const r = new THREE.Mesh(geo, mat); r.position.set(x, y, z); r.rotation.z = rz; group.add(r);
  const l = new THREE.Mesh(geo, mat); l.position.set(-x, y, z); l.scale.x = -1; l.rotation.z = -rz; group.add(l);
  return [r, l];
}

function flame(len = 3, rad = 0.45) {
  const g = new THREE.ConeGeometry(rad, len, 7, 1, true); g.rotateX(Math.PI / 2); g.translate(0, 0, len / 2);
  const outer = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#ff9a3c', transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
  const ig = new THREE.ConeGeometry(rad * 0.55, len * 0.6, 7, 1, true); ig.rotateX(Math.PI / 2); ig.translate(0, 0, len * 0.3);
  const inner = new THREE.Mesh(ig, new THREE.MeshBasicMaterial({ color: '#bff4ff', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
  const f = new THREE.Group(); f.add(outer, inner);
  return f;
}

export function makeJet(palette) {
  const { body, accent, dark, canopy } = palette;
  const g = new THREE.Group();
  const bm = lam(body), am = lam(accent), dm = lam(dark);
  const cm = new THREE.MeshPhongMaterial({ color: canopy, shininess: 90, specular: '#ffffff', flatShading: true });
  // fuselage
  const fus = new THREE.CylinderGeometry(0.75, 0.95, 8, 8); fus.rotateX(Math.PI / 2);
  g.add(new THREE.Mesh(fus, bm));
  const nose = new THREE.ConeGeometry(0.75, 3.6, 8); nose.rotateX(-Math.PI / 2); nose.translate(0, 0, -5.8);
  g.add(new THREE.Mesh(nose, bm));
  const tipG = new THREE.ConeGeometry(0.3, 1, 8); tipG.rotateX(-Math.PI / 2); tipG.translate(0, 0, -7.4);
  g.add(new THREE.Mesh(tipG, dm));
  const tail = new THREE.CylinderGeometry(0.95, 0.7, 1.6, 8); tail.rotateX(Math.PI / 2); tail.translate(0, 0, 4.7);
  g.add(new THREE.Mesh(tail, dm));
  // canopy
  const can = new THREE.SphereGeometry(0.7, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2); can.scale(0.9, 0.9, 2.6); can.translate(0, 0.55, -3.1);
  g.add(new THREE.Mesh(can, cm));
  // accent stripe
  const stripe = new THREE.BoxGeometry(1.62, 0.28, 5); stripe.translate(0, 0.2, -0.5);
  g.add(new THREE.Mesh(stripe, am));
  // intakes
  const intake = new THREE.BoxGeometry(0.6, 0.9, 2.6);
  mirrored(intake, dm, 0.95, -0.15, -0.8, g);
  // wings
  mirrored(wing(4.6, 4.6, 1.1, 3.2), bm, 0.6, -0.1, 0.8, g);
  mirrored(new THREE.BoxGeometry(1.4, 0.3, 1.0), am, 4.6, -0.05, 2.8, g); // wingtip accents
  // tailplanes
  mirrored(wing(2.2, 1.8, 0.7, 1.2, 0.18), bm, 0.6, 0, 4.2, g);
  // twin fins
  const finS = new THREE.Shape(); finS.moveTo(0, 0); finS.lineTo(1.9, 0); finS.lineTo(2.4, 2.3); finS.lineTo(1.6, 2.3); finS.closePath();
  const finG = new THREE.ExtrudeGeometry(finS, { depth: 0.16, bevelEnabled: false }); finG.rotateY(-Math.PI / 2); finG.translate(0.08, 0.3, 3.2);
  mirrored(finG, am, 0.55, 0, 0, g, -0.22);
  // engine nozzle
  const noz = new THREE.CylinderGeometry(0.6, 0.55, 0.6, 8, 1, true); noz.rotateX(Math.PI / 2); noz.translate(0, 0, 5.8);
  g.add(new THREE.Mesh(noz, lam('#3b3f44', { side: THREE.DoubleSide })));
  const fl = flame(3.2, 0.5); fl.position.z = 6.1; g.add(fl);
  fl.name = 'flame';
  return g;
}

export function makeBomber() {
  const g = new THREE.Group();
  const bm = lam('#8b9097'), am = lam('#8a3b2a'), dm = lam('#4b4f55');
  const cm = new THREE.MeshPhongMaterial({ color: '#2b3a45', shininess: 80, flatShading: true });
  const fus = new THREE.CylinderGeometry(1.5, 1.3, 16, 8); fus.rotateX(Math.PI / 2);
  g.add(new THREE.Mesh(fus, bm));
  const nose = new THREE.SphereGeometry(1.5, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2); nose.rotateX(-Math.PI / 2); nose.scale(1, 1, 1.6); nose.translate(0, 0, -8);
  g.add(new THREE.Mesh(nose, bm));
  const ck = new THREE.BoxGeometry(1.8, 0.7, 1.6); ck.translate(0, 1.1, -7.6); g.add(new THREE.Mesh(ck, cm));
  const tailC = new THREE.ConeGeometry(1.3, 5, 8); tailC.rotateX(Math.PI / 2); tailC.translate(0, 0.3, 10.5);
  g.add(new THREE.Mesh(tailC, bm));
  const band = new THREE.CylinderGeometry(1.55, 1.55, 1.2, 8); band.rotateX(Math.PI / 2); band.translate(0, 0, -4.5);
  g.add(new THREE.Mesh(band, am));
  mirrored(wing(13, 5.5, 2.2, 2.8, 0.45), bm, 1.2, 0.2, -1, g);
  mirrored(new THREE.BoxGeometry(2.4, 0.5, 1.6), am, 13.2, 0.25, 1.7, g);
  // engines
  const eng = new THREE.CylinderGeometry(0.75, 0.6, 3.6, 7); eng.rotateX(Math.PI / 2);
  for (const x of [4.2, 8]) mirrored(eng, dm, x, -0.5, -2.2, g);
  const prop = new THREE.BoxGeometry(3.2, 0.25, 0.1);
  const props = [];
  for (const x of [4.2, 8]) for (const s of [1, -1]) { const p = new THREE.Mesh(prop, dm); p.name = 'prop'; p.position.set(x * s, -0.5, -4.1); g.add(p); props.push(p); }
  mirrored(wing(4.8, 2.6, 1.2, 1.6, 0.25), bm, 0.5, 0.6, 10.2, g);
  const finS = new THREE.Shape(); finS.moveTo(0, 0); finS.lineTo(3.4, 0); finS.lineTo(4.0, 4.6); finS.lineTo(2.4, 4.6); finS.closePath();
  const finG = new THREE.ExtrudeGeometry(finS, { depth: 0.3, bevelEnabled: false }); finG.rotateY(-Math.PI / 2); finG.translate(0.15, 0.8, 8.8);
  g.add(new THREE.Mesh(finG, am));
  // tail gun turret
  const tur = new THREE.SphereGeometry(0.7, 6, 5); tur.translate(0, 0.4, 13); g.add(new THREE.Mesh(tur, cm));
  return g;
}

export function makeMissileMesh() {
  const g = new THREE.Group();
  const body = new THREE.CylinderGeometry(0.16, 0.16, 2.4, 6); body.rotateX(Math.PI / 2);
  g.add(new THREE.Mesh(body, lam('#e8e8e8')));
  const tip = new THREE.ConeGeometry(0.16, 0.5, 6); tip.rotateX(-Math.PI / 2); tip.translate(0, 0, -1.45);
  g.add(new THREE.Mesh(tip, lam('#c0392b')));
  const fin = new THREE.BoxGeometry(0.8, 0.05, 0.4); fin.translate(0, 0, 1);
  g.add(new THREE.Mesh(fin, lam('#777')));
  const fin2 = fin.clone(); fin2.rotateZ(Math.PI / 2); g.add(new THREE.Mesh(fin2, lam('#777')));
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 4), new THREE.MeshBasicMaterial({ color: '#ffd27a', blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
  glow.position.z = 1.35; g.add(glow);
  return g;
}

export const PAL = {
  player: { body: '#f1f4f6', accent: '#19c3e6', dark: '#5f6b73', canopy: '#1c6f8f' },
  fighter: { body: '#7c8188', accent: '#c7372f', dark: '#3f4348', canopy: '#2a2a2a' },
};
