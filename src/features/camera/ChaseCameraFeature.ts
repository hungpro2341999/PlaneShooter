import * as THREE from 'three';
import type { GameFeature } from '../../core/GameFeature';
import type { GameServices } from '../../core/GameServices';

/**
 * 0003 — Chase camera: sits behind/above the plane, follows with a slight
 * lag (exponential damping), aims ahead of the plane, and is clamped so it
 * never goes below terrain/sea.
 */
export class ChaseCameraFeature implements GameFeature {
  readonly id = '0003-chase-camera';
  private s!: GameServices;
  private desired = new THREE.Vector3();
  private lookTarget = new THREE.Vector3();
  private offset = new THREE.Vector3();
  private forward = new THREE.Vector3();
  private initialized = false;
  private smoothedLook = new THREE.Vector3();
  private lookInit = false;

  init(services: GameServices): void { this.s = services; }

  update(dt: number): void {
    const plane = this.s.player.group;
    if (!plane) return;
    const c = this.s.config.camera;
    const cam = this.s.camera;

    this.forward.set(0, 0, -1).applyQuaternion(plane.quaternion);
    this.offset.copy(this.forward).multiplyScalar(-c.distance);
    this.offset.y += c.height;
    this.desired.copy(plane.position).add(this.offset);

    // Never clip terrain/sea.
    const ground = this.s.world.heightAt(this.desired.x, this.desired.z) + c.minHeightAboveGround;
    if (this.desired.y < ground) this.desired.y = ground;

    if (!this.initialized) { cam.position.copy(this.desired); this.initialized = true; }
    const posK = 1 - Math.exp(-c.followDamping * dt); // frame-rate independent lag
    cam.position.lerp(this.desired, posK);

    this.lookTarget.copy(plane.position).addScaledVector(this.forward, c.lookAhead);
    if (!this.lookInit) { this.smoothedLook.copy(this.lookTarget); this.lookInit = true; }
    const lookK = 1 - Math.exp(-c.lookDamping * dt);
    this.smoothedLook.lerp(this.lookTarget, lookK);
    cam.lookAt(this.smoothedLook);
  }

  dispose(): void { /* nothing owned */ }
}
