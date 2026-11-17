import * as THREE from 'three';
import type { AircraftKind } from '../../core/Aircraft';

/**
 * Enemy aircraft models, currently built from primitives (greybox phase).
 *
 * SWAP POINT for the ASSET phase: replace the body of this function with a
 * GLTFLoader load of `public/assets/models/fighter.glb` /
 * `public/assets/models/bomber.glb`. Contract (docs/conventions.md):
 * the model's nose MUST face local -Z, origin at the aircraft centre,
 * and the returned Group is used for position/rotation only — all combat
 * data lives in the AircraftEntity, not in the model.
 */
export function createEnemyModel(kind: 'fighter' | 'bomber'): THREE.Group {
  const g = new THREE.Group();
  const isBomber = kind === 'bomber';
  const bodyMat = new THREE.MeshStandardMaterial({ color: isBomber ? 0x5a6068 : 0x707880, roughness: 0.6 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xb03a2e, roughness: 0.55 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x22262b, roughness: 0.6 });
  const s = isBomber ? 1.7 : 1; // bomber is bigger
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x * s, y * s, z * s);
    mesh.scale.setScalar(s);
    g.add(mesh);
    return mesh;
  };
  add(new THREE.CylinderGeometry(0.5, 0.8, 5.4, 8), bodyMat, 0, 0, 0).rotation.x = Math.PI / 2; // fuselage
  add(new THREE.ConeGeometry(0.5, 1, 8), bodyMat, 0, 0, -3.2).rotation.x = -Math.PI / 2;          // nose (-Z)
  add(new THREE.BoxGeometry(isBomber ? 9.5 : 6, 0.13, 1.1), accentMat, 0, -0.05, -0.3);           // wing
  add(new THREE.BoxGeometry(2.2, 0.11, 0.75), bodyMat, 0, 0.12, 2.55);                           // tail wing
  add(new THREE.BoxGeometry(0.11, 1, 0.75), bodyMat, 0, 0.5, 2.55);                              // fin
  add(new THREE.SphereGeometry(0.45, 8, 6), dark, 0, 0.5, 0.4);                                  // canopy
  if (isBomber) {
    add(new THREE.SphereGeometry(0.5, 8, 6), dark, 0, 0.35, 2.2);                                // tail gun turret
    add(new THREE.BoxGeometry(0.5, 0.5, 2.2), dark, -2.2, -0.3, -0.3);                           // engine pods
    add(new THREE.BoxGeometry(0.5, 0.5, 2.2), dark, 2.2, -0.3, -0.3);
  } else {
    const prop = add(new THREE.BoxGeometry(0.16, 2.8, 0.07), dark, 0, 0, -3.8);
    prop.name = 'propeller';
  }
  void (kind as AircraftKind);
  return g;
}
