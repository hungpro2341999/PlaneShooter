import * as THREE from 'three';
import type { AircraftRegistry } from './Aircraft';
import type { EventBus, GameEvents } from './EventBus';

interface Projectile {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  life: number;
  damage: number;
  faction: 'player' | 'enemy';
}

/**
 * Shared tracer-projectile system (used by the player's gun 0004 and enemy
 * AI 0007). Projectiles are bright stretched boxes; a hit is a proximity
 * check against the aircraft registry and is reported as 'combat:damage' —
 * the health feature (0006) is the only place damage is applied.
 */
export class ProjectileSystem {
  private items: Projectile[] = [];
  private geo = new THREE.BoxGeometry(0.14, 0.14, 2.4);

  constructor(
    private scene: THREE.Scene,
    private registry: AircraftRegistry,
    private bus: EventBus<GameEvents>,
  ) {}

  fire(from: THREE.Vector3, dir: THREE.Vector3, opts: {
    speed: number; life: number; damage: number; faction: 'player' | 'enemy'; color: number;
  }): void {
    const mesh = new THREE.Mesh(this.geo, new THREE.MeshBasicMaterial({ color: opts.color }));
    mesh.position.copy(from);
    mesh.lookAt(from.clone().add(dir));
    this.scene.add(mesh);
    this.items.push({
      mesh, vel: dir.clone().normalize().multiplyScalar(opts.speed),
      life: opts.life, damage: opts.damage, faction: opts.faction,
    });
  }

  update(dt: number): void {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const p = this.items[i];
      p.life -= dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      let dead = p.life <= 0;
      if (!dead) {
        const targets = p.faction === 'player'
          ? this.registry.enemies()
          : [this.registry.player()].filter((t) => t && t.alive) as NonNullable<ReturnType<AircraftRegistry['player']>>[];
        for (const t of targets) {
          if (p.mesh.position.distanceTo(t.group.position) <= t.radius + 1) {
            this.bus.emit('combat:damage', { targetId: t.id, amount: p.damage });
            dead = true;
            break;
          }
        }
      }
      if (dead) {
        this.scene.remove(p.mesh);
        (p.mesh.material as THREE.Material).dispose();
        this.items.splice(i, 1);
      }
    }
  }

  dispose(): void {
    for (const p of this.items) { this.scene.remove(p.mesh); (p.mesh.material as THREE.Material).dispose(); }
    this.items = [];
    this.geo.dispose();
  }
}
