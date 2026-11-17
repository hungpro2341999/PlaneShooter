import * as THREE from 'three';
import type { GameFeature } from '../../core/GameFeature';
import type { GameServices } from '../../core/GameServices';
import { ProjectileSystem } from '../../core/Projectiles';

/**
 * 0004 — Machine gun. Mouse-left / gamepad RT fires bright tracer rounds,
 * infinite ammo, but sustained fire overheats the gun: at heat 1 it locks
 * out until heat falls to `overheatResumeAt`. All numbers in balance.gun.
 */
export class GunFeature implements GameFeature {
  readonly id = '0004-machine-gun';
  private s!: GameServices;
  private projectiles!: ProjectileSystem;
  private heat = 0;
  private overheated = false;
  private fireTimer = 0;
  private emitTimer = 0;
  private muzzle = new THREE.Vector3();
  private dir = new THREE.Vector3();

  init(services: GameServices): void {
    this.s = services;
    this.projectiles = new ProjectileSystem(services.scene, services.aircraft, services.bus);
  }

  update(dt: number): void {
    const g = this.s.config.gun;
    const plane = this.s.player.group;
    const playerAlive = this.s.aircraft.player()?.alive ?? false;
    const wantFire = this.s.input.fireGun && playerAlive && !!plane;

    this.fireTimer -= dt;
    if (wantFire && !this.overheated && this.fireTimer <= 0 && plane) {
      this.fireTimer = g.fireInterval;
      this.heat = Math.min(1, this.heat + g.heatPerShot);
      if (this.heat >= 1) this.overheated = true;
      // Muzzle at the nose, direction = plane forward with a small random spread.
      this.dir.set(0, 0, -1).applyQuaternion(plane.quaternion);
      this.dir.x += (Math.random() - 0.5) * 2 * g.spread;
      this.dir.y += (Math.random() - 0.5) * 2 * g.spread;
      this.dir.z += (Math.random() - 0.5) * 2 * g.spread;
      this.dir.normalize();
      this.muzzle.copy(plane.position).addScaledVector(this.dir, 4);
      this.projectiles.fire(this.muzzle, this.dir, {
        speed: g.projectileSpeed + this.s.player.speed, life: g.projectileLife,
        damage: g.damage, faction: 'player', color: 0xffe27a,
      });
    }
    // Cooling: slow while firing, fast while idle.
    const cooling = wantFire && !this.overheated ? g.coolRateFiring : g.coolRate;
    this.heat = Math.max(0, this.heat - cooling * dt);
    if (this.overheated && this.heat <= g.overheatResumeAt) this.overheated = false;

    this.projectiles.update(dt);

    this.emitTimer += dt;
    if (this.emitTimer > 0.1) {
      this.emitTimer = 0;
      this.s.bus.emit('gun:state', { heat: this.heat, overheated: this.overheated });
    }
  }

  dispose(): void { this.projectiles.dispose(); }
}
