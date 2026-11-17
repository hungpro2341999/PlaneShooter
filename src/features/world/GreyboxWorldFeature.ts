import * as THREE from 'three';
import type { GameFeature } from '../../core/GameFeature';
import type { GameServices } from '../../core/GameServices';
import { createHeightAt } from './heightField';

/**
 * 0001 — Greybox world: sea, block islands, simple sky, lights,
 * and the placeholder player aircraft built from primitives.
 * Also owns the analytic height field used for ground queries.
 * Real art assets are owned by the ASSET chat (public/assets/, docs/art/) —
 * nothing here loads them.
 */
export class GreyboxWorldFeature implements GameFeature {
  readonly id = '0001-world-greybox';
  private disposers: Array<() => void> = [];

  init(services: GameServices): void {
    const { scene, config } = services;
    const w = config.world;

    // Analytic height field: smooth bump per island, 0 at sea (pure fn, unit-tested).
    services.world.heightAt = createHeightAt(w.islands);

    // Sky: plain colour + fog (no skybox asset in greybox phase).
    scene.background = new THREE.Color(0x87b5d6);
    scene.fog = new THREE.Fog(0x87b5d6, w.fogNear, w.fogFar);
    scene.add(new THREE.HemisphereLight(0xcfe8ff, 0x3a5f4a, 1.1));
    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(120, 220, 60);
    scene.add(sun);

    const add = (obj: THREE.Object3D) => {
      scene.add(obj);
      this.disposers.push(() => {
        scene.remove(obj);
        obj.traverse((o) => {
          if (o instanceof THREE.Mesh) { o.geometry.dispose(); (o.material as THREE.Material).dispose(); }
        });
      });
    };

    // Sea
    const sea = new THREE.Mesh(
      new THREE.PlaneGeometry(w.seaSize, w.seaSize),
      new THREE.MeshStandardMaterial({ color: 0x1d6f9f, roughness: 0.85, metalness: 0 }));
    sea.rotation.x = -Math.PI / 2;
    add(sea);

    // Islands: cylinder base + block "mountains", flat colours only.
    const sandMat = new THREE.MeshStandardMaterial({ color: 0xd8c58f, roughness: 1 });
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x7d8a74, roughness: 1 });
    for (const isl of w.islands) {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(isl.radius, isl.radius * 1.15, 3, 24), sandMat);
      base.position.set(isl.x, 0.5, isl.z);
      add(base);
      const peak = new THREE.Mesh(
        new THREE.CylinderGeometry(isl.radius * 0.25, isl.radius * 0.7, isl.height, 6), rockMat);
      peak.position.set(isl.x, isl.height / 2 + 1, isl.z);
      add(peak);
      const block = new THREE.Mesh(new THREE.BoxGeometry(isl.radius * 0.5, isl.height * 0.45, isl.radius * 0.4), rockMat);
      block.position.set(isl.x + isl.radius * 0.3, isl.height * 0.22 + 1, isl.z + isl.radius * 0.25);
      block.rotation.y = 0.6;
      add(block);
    }

    // A few block clouds for depth reference.
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
    for (let i = 0; i < 10; i++) {
      const cloud = new THREE.Mesh(new THREE.BoxGeometry(30 + i * 3, 5, 14), cloudMat);
      cloud.position.set(-500 + i * 110, 130 + (i % 3) * 22, -350 + (i % 4) * 130);
      add(cloud);
    }

    services.player.group = this.buildPlayerPlane();
    scene.add(services.player.group);
  }

  /** Placeholder aircraft from primitives. Nose points along local -Z (game forward). */
  private buildPlayerPlane(): THREE.Group {
    const plane = new THREE.Group();
    const body = new THREE.MeshStandardMaterial({ color: 0xd84f35, roughness: 0.55 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x2b2f36, roughness: 0.6 });
    const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      plane.add(m);
      return m;
    };
    add(new THREE.CylinderGeometry(0.55, 0.85, 5.6, 10), body, 0, 0, 0).rotation.x = Math.PI / 2; // fuselage
    add(new THREE.ConeGeometry(0.55, 1.1, 10), body, 0, 0, -3.3).rotation.x = -Math.PI / 2;          // nose
    add(new THREE.BoxGeometry(6.4, 0.14, 1.15), body, 0, -0.05, -0.4);                               // main wing
    add(new THREE.BoxGeometry(2.3, 0.12, 0.8), body, 0, 0.15, 2.6);                                 // tail wing
    add(new THREE.BoxGeometry(0.12, 1.05, 0.8), body, 0, 0.55, 2.6);                                // fin
    add(new THREE.SphereGeometry(0.5, 10, 8), dark, 0, 0.55, 0.5);                                  // canopy
    const prop = add(new THREE.BoxGeometry(0.18, 3.1, 0.08), dark, 0, 0, -3.95);                    // propeller
    prop.name = 'propeller';
    return plane;
  }

  update(): void { /* static greybox world */ }
  dispose(): void { this.disposers.forEach((d) => d()); }
}
