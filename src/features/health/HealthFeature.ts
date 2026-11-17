import * as THREE from 'three';
import type { GameFeature } from '../../core/GameFeature';
import type { GameServices } from '../../core/GameServices';

interface Explosion { points: THREE.Points; vel: Float32Array; life: number; maxLife: number }

/**
 * 0006 — Health & damage. Registers the player aircraft, applies all
 * 'combat:damage' events (the single place health ever changes), and on
 * death spawns a simple particle explosion and emits 'aircraft:destroyed'.
 */
export class HealthFeature implements GameFeature {
  readonly id = '0006-health';
  private s!: GameServices;
  private unsubs: Array<() => void> = [];
  private explosions: Explosion[] = [];

  init(services: GameServices): void {
    this.s = services;
    const h = services.config.health;
    const group = services.player.group;
    if (group) {
      services.aircraft.register({
        id: 'player', kind: 'player', faction: 'player', group,
        maxHealth: h.player, health: h.player, alive: true, radius: h.hitRadius.player,
      });
    }
    this.unsubs.push(services.bus.on('combat:damage', ({ targetId, amount }) => this.applyDamage(targetId, amount)));
  }

  private applyDamage(targetId: string, amount: number): void {
    const e = this.s.aircraft.get(targetId);
    if (!e || !e.alive) return;
    e.health -= amount;
    if (e.id === 'player') {
      this.s.bus.emit('player:health', { health: Math.max(0, e.health), maxHealth: e.maxHealth });
    }
    if (e.health > 0) return;
    e.alive = false;
    e.health = 0;
    this.spawnExplosion(e.group.position);
    e.group.visible = false;
    this.s.bus.emit('aircraft:destroyed', { id: e.id, kind: e.kind, faction: e.faction });
  }

  /** Placeholder explosion: one burst of orange points with gravity-less drift and fade. Real VFX comes from the ASSET phase. */
  private spawnExplosion(at: THREE.Vector3): void {
    const count = 90;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos.set([at.x, at.y, at.z], i * 3);
      const v = new THREE.Vector3().randomDirection().multiplyScalar(6 + Math.random() * 16);
      vel.set([v.x, v.y, v.z], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffa63d, size: 1.6, transparent: true, opacity: 1 });
    const points = new THREE.Points(geo, mat);
    this.s.scene.add(points);
    this.explosions.push({ points, vel, life: 1.1, maxLife: 1.1 });
  }

  update(dt: number): void {
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const ex = this.explosions[i];
      ex.life -= dt;
      const attr = ex.points.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let j = 0; j < attr.count; j++) {
        attr.setXYZ(j,
          attr.getX(j) + ex.vel[j * 3] * dt,
          attr.getY(j) + ex.vel[j * 3 + 1] * dt,
          attr.getZ(j) + ex.vel[j * 3 + 2] * dt);
      }
      attr.needsUpdate = true;
      (ex.points.material as THREE.PointsMaterial).opacity = Math.max(0, ex.life / ex.maxLife);
      if (ex.life <= 0) {
        this.s.scene.remove(ex.points);
        ex.points.geometry.dispose();
        (ex.points.material as THREE.Material).dispose();
        this.explosions.splice(i, 1);
      }
    }
  }

  dispose(): void { this.unsubs.forEach((u) => u()); }
}
