import * as THREE from 'three';
import type { GameFeature } from '../../core/GameFeature';
import type { GameServices } from '../../core/GameServices';
import type { AircraftEntity } from '../../core/Aircraft';

interface Missile { mesh: THREE.Group; dir: THREE.Vector3; targetId: string; life: number; speed: number }

/**
 * 0005 — Lock-on missiles. Keep an enemy inside the nose cone for
 * `lockTime` seconds to lock; mouse-right / gamepad LB fires a homing
 * missile. Magazine of `maxCount`, regenerating one every `regenTime`.
 */
export class MissileFeature implements GameFeature {
  readonly id = '0005-missiles';
  private s!: GameServices;
  private missilesLeft: number = 0;
  private regenTimer = 0;
  private candidate: AircraftEntity | null = null;
  private lockProgress = 0; // seconds accumulated
  private lockedId: string | null = null;
  private wasFiring = false;
  private missiles: Missile[] = [];
  private emitTimer = 0;
  private tmp = new THREE.Vector3();
  private fwd = new THREE.Vector3();

  init(services: GameServices): void {
    this.s = services;
    this.missilesLeft = services.config.missile.maxCount;
  }

  private planeForward(): THREE.Vector3 {
    const plane = this.s.player.group;
    if (plane) this.fwd.set(0, 0, -1).applyQuaternion(plane.quaternion);
    return this.fwd;
  }

  /** Best lock candidate: alive enemy with the smallest angle to the nose inside range. */
  private pickCandidate(keepAngle: boolean): AircraftEntity | null {
    const plane = this.s.player.group;
    if (!plane) return null;
    const m = this.s.config.missile;
    const maxAngle: number = keepAngle && this.candidate ? m.lockKeepAngle : m.lockAngle;
    let best: AircraftEntity | null = null;
    let bestAngle: number = maxAngle;
    for (const e of this.s.aircraft.enemies()) {
      this.tmp.copy(e.group.position).sub(plane.position);
      const dist = this.tmp.length();
      if (dist > m.lockRange) continue;
      const angle = this.tmp.normalize().angleTo(this.planeForward());
      if (angle < bestAngle) { bestAngle = angle; best = e; }
    }
    return best;
  }

  update(dt: number): void {
    const m = this.s.config.missile;
    const playerAlive = this.s.aircraft.player()?.alive ?? false;

    // --- Lock tracking
    const cand = playerAlive ? this.pickCandidate(true) : null;
    if (cand && cand === this.candidate) {
      this.lockProgress += dt;
    } else {
      this.candidate = cand;
      this.lockProgress = Math.max(0, this.lockProgress - m.lockDecayRate * dt);
      if (!cand) this.lockedId = null;
    }
    if (this.candidate && this.lockProgress >= m.lockTime) this.lockedId = this.candidate.id;
    if (this.lockedId && !this.s.aircraft.get(this.lockedId)?.alive) this.lockedId = null;
    const locked = this.lockedId !== null;

    // --- Fire (edge-triggered)
    const firing = this.s.input.fireMissile;
    if (firing && !this.wasFiring && locked && this.missilesLeft > 0 && playerAlive) {
      this.launch(this.lockedId!);
      this.missilesLeft--;
      this.s.bus.emit('missile:launched', { targetId: this.lockedId! });
    }
    this.wasFiring = firing;

    // --- Regen one at a time
    if (this.missilesLeft < m.maxCount) {
      this.regenTimer += dt;
      if (this.regenTimer >= m.regenTime) { this.regenTimer = 0; this.missilesLeft++; }
    } else this.regenTimer = 0;

    // --- Homing missiles in flight
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const ms = this.missiles[i];
      ms.life -= dt;
      const target = this.s.aircraft.get(ms.targetId);
      let boom = ms.life <= 0;
      if (target && target.alive) {
        this.tmp.copy(target.group.position).sub(ms.mesh.position);
        const dist = this.tmp.length();
        if (dist <= m.proximity) boom = true;
        else {
          const want = this.tmp.normalize();
          const q = new THREE.Quaternion().setFromUnitVectors(ms.dir, want);
          const step = new THREE.Quaternion().identity().slerp(q, Math.min(1, m.turnRate * dt));
          ms.dir.applyQuaternion(step).normalize();
        }
      }
      ms.mesh.position.addScaledVector(ms.dir, ms.speed * dt);
      ms.mesh.lookAt(this.tmp.copy(ms.mesh.position).add(ms.dir));
      if (boom) {
        if (target && target.alive &&
            ms.mesh.position.distanceTo(target.group.position) <= m.proximity + target.radius) {
          this.s.bus.emit('combat:damage', { targetId: target.id, amount: m.damage });
        }
        this.removeMissile(i);
      }
    }

    // --- HUD events at 10 Hz
    this.emitTimer += dt;
    if (this.emitTimer > 0.1) {
      this.emitTimer = 0;
      this.s.bus.emit('missile:lock', {
        targetId: this.lockedId ?? this.candidate?.id ?? null,
        progress: Math.min(1, this.lockProgress / m.lockTime), locked,
      });
      this.s.bus.emit('missile:state', { missiles: this.missilesLeft, maxMissiles: m.maxCount });
    }
  }

  private launch(targetId: string): void {
    const plane = this.s.player.group;
    if (!plane) return;
    const grp = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 1.7, 6),
      new THREE.MeshStandardMaterial({ color: 0xe8e8e8, roughness: 0.4 }));
    body.rotation.x = Math.PI / 2;
    grp.add(body);
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.6, 6),
      new THREE.MeshBasicMaterial({ color: 0xff9a3d }));
    flame.position.z = 1.1;
    flame.rotation.x = Math.PI / 2;
    grp.add(flame);
    grp.position.copy(plane.position).add(new THREE.Vector3(0, -0.7, 0));
    this.s.scene.add(grp);
    this.missiles.push({
      mesh: grp, dir: this.planeForward().clone(),
      targetId, life: this.s.config.missile.life, speed: this.s.config.missile.speed,
    });
  }

  private removeMissile(i: number): void {
    const ms = this.missiles[i];
    this.s.scene.remove(ms.mesh);
    ms.mesh.traverse((o) => { if (o instanceof THREE.Mesh) { o.geometry.dispose(); (o.material as THREE.Material).dispose(); } });
    this.missiles.splice(i, 1);
  }

  dispose(): void { for (let i = this.missiles.length - 1; i >= 0; i--) this.removeMissile(i); }
}
