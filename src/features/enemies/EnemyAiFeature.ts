import * as THREE from 'three';
import type { GameFeature } from '../../core/GameFeature';
import type { GameServices } from '../../core/GameServices';
import type { AircraftEntity } from '../../core/Aircraft';
import { ProjectileSystem } from '../../core/Projectiles';
import { createEnemyModel } from './modelFactory';

interface AiState {
  mode: 'patrol' | 'chase' | 'evade' | 'toBase' | 'orbit';
  patrolCentre: THREE.Vector3;
  phase: number;
  fireTimer: number;
  evadeUntil: number;
  jinkSeed: number;
}

/**
 * 0007 — Enemy AI. Fighters patrol in circles, chase and shoot the player,
 * and jink (evade) while being locked or when a missile is inbound; terrain
 * avoidance keeps them off the islands. Bombers fly straight to the radar
 * base on the largest island, orbit it, and fire back with a tail gun.
 * Spawning is driven by the waves feature (0008) via 'enemy:spawn' events.
 */
export class EnemyAiFeature implements GameFeature {
  readonly id = '0007-enemy-ai';
  private s!: GameServices;
  private projectiles!: ProjectileSystem;
  private ai = new Map<string, AiState>();
  private unsubs: Array<() => void> = [];
  private counter = 0;
  private elapsed = 0;
  private tmp = new THREE.Vector3();
  private tmp2 = new THREE.Vector3();
  private desired = new THREE.Vector3();
  private fwd = new THREE.Vector3();

  init(services: GameServices): void {
    this.s = services;
    this.projectiles = new ProjectileSystem(services.scene, services.aircraft, services.bus);
    this.unsubs.push(services.bus.on('enemy:spawn', ({ kind }) => this.spawn(kind)));
    // Being locked or targeted by a missile triggers evasion.
    this.unsubs.push(services.bus.on('missile:lock', ({ targetId, locked }) => {
      if (targetId && locked) this.triggerEvade(targetId); // evade once fully locked (spec 0007)
    }));
    this.unsubs.push(services.bus.on('missile:launched', ({ targetId }) => this.triggerEvade(targetId)));
  }

  private triggerEvade(id: string): void {
    const st = this.ai.get(id);
    if (st) st.evadeUntil = Math.max(st.evadeUntil, this.elapsed + this.s.config.enemy.fighter.evadeDuration);
  }

  private spawn(kind: 'fighter' | 'bomber'): void {
    const cfg = this.s.config;
    const group = createEnemyModel(kind);
    const angle = (this.counter * 2.399) % (Math.PI * 2); // golden-angle spread of spawn points
    this.counter++;
    group.position.set(
      Math.cos(angle) * cfg.enemy.spawnDistance * 0.6,
      cfg.enemy.spawnAltitude + (this.counter % 3) * 8,
      Math.sin(angle) * cfg.enemy.spawnDistance * 0.6 - 150);
    group.lookAt(0, group.position.y, 0);
    this.s.scene.add(group);
    const id = `enemy-${this.counter}`;
    const health = kind === 'fighter' ? cfg.health.fighter : cfg.health.bomber;
    const entity: AircraftEntity = {
      id, kind, faction: 'enemy', group,
      maxHealth: health, health, alive: true, radius: cfg.health.hitRadius[kind],
    };
    this.s.aircraft.register(entity);
    this.ai.set(id, {
      mode: kind === 'bomber' ? 'toBase' : 'patrol',
      patrolCentre: group.position.clone(),
      phase: Math.random() * Math.PI * 2,
      fireTimer: 1 + Math.random(),
      evadeUntil: 0,
      jinkSeed: Math.random() * 10,
    });
  }

  /** Radar base = summit area of the largest island. */
  private basePoint(out: THREE.Vector3): THREE.Vector3 {
    const islands = this.s.config.world.islands;
    const big = islands.reduce((a, b) => (b.radius > a.radius ? b : a), islands[0]);
    return out.set(big.x, this.s.config.enemy.bomber.orbitAltitude, big.z);
  }

  update(dt: number): void {
    this.elapsed += dt;
    const player = this.s.aircraft.player();
    for (const e of this.s.aircraft.enemies(false)) {
      const st = this.ai.get(e.id);
      if (!st) continue;
      if (!e.alive) continue;
      if (e.kind === 'fighter') this.updateFighter(e, st, dt, player?.group ?? null, player?.alive ?? false);
      else this.updateBomber(e, st, dt, player?.group ?? null, player?.alive ?? false);
    }
    this.projectiles.update(dt);
  }

  /** Steer the group toward `dir` with a turn-rate limit, then move forward. */
  private steer(e: AircraftEntity, dir: THREE.Vector3, turnRate: number, speed: number, dt: number): void {
    this.fwd.set(0, 0, -1).applyQuaternion(e.group.quaternion);
    const q = new THREE.Quaternion().setFromUnitVectors(this.fwd, dir.clone().normalize());
    const step = new THREE.Quaternion().identity().slerp(q, Math.min(1, turnRate * dt));
    e.group.quaternion.premultiply(step);
    this.fwd.set(0, 0, -1).applyQuaternion(e.group.quaternion);
    e.group.position.addScaledVector(this.fwd, speed * dt);
    // Ground avoidance: never below terrain + margin (also never into an island slope).
    const ground = this.s.world.heightAt(e.group.position.x, e.group.position.z)
      + this.s.config.enemy.minAltitudeAboveGround;
    if (e.group.position.y < ground) e.group.position.y = ground;
    if (e.group.position.y > this.s.config.flight.ceiling) e.group.position.y = this.s.config.flight.ceiling;
    const prop = e.group.getObjectByName('propeller');
    if (prop) prop.rotation.z += dt * 30;
  }

  /** Climb bias when terrain ahead is close below us. */
  private avoidTerrain(e: AircraftEntity, dir: THREE.Vector3): THREE.Vector3 {
    this.fwd.set(0, 0, -1).applyQuaternion(e.group.quaternion);
    this.tmp.copy(e.group.position).addScaledVector(this.fwd, 40);
    const ahead = this.s.world.heightAt(this.tmp.x, this.tmp.z) + this.s.config.enemy.minAltitudeAboveGround + 6;
    if (e.group.position.y < ahead) dir.y += 0.6;
    return dir;
  }

  private updateFighter(e: AircraftEntity, st: AiState, dt: number, playerGroup: THREE.Group | null, playerAlive: boolean): void {
    const f = this.s.config.enemy.fighter;
    const pos = e.group.position;
    // Mode selection
    if (this.elapsed < st.evadeUntil) st.mode = 'evade';
    else if (playerGroup && playerAlive && pos.distanceTo(playerGroup.position) < f.aggroRange) st.mode = 'chase';
    else st.mode = 'patrol';

    if (st.mode === 'evade') {
      // Hard jink: perpendicular snap turns + climb/dive oscillation.
      this.fwd.set(0, 0, -1).applyQuaternion(e.group.quaternion);
      this.tmp.set(0, 1, 0).cross(this.fwd);
      const s = Math.sin(this.elapsed * 5 + st.jinkSeed) > 0 ? 1 : -1;
      this.desired.copy(this.fwd).addScaledVector(this.tmp, 1.4 * s);
      this.desired.y += Math.sin(this.elapsed * 3.7 + st.jinkSeed) * 0.5;
    } else if (st.mode === 'chase' && playerGroup) {
      // Aim slightly ahead of the player.
      this.tmp.copy(playerGroup.position);
      this.fwd.set(0, 0, -1).applyQuaternion(playerGroup.quaternion);
      this.tmp.addScaledVector(this.fwd, this.s.player.speed * 0.55);
      this.desired.copy(this.tmp).sub(pos);
      // Fire when the player is inside the front cone and in range.
      st.fireTimer -= dt;
      const dist = pos.distanceTo(playerGroup.position);
      const angle = this.tmp2.copy(playerGroup.position).sub(pos).normalize()
        .angleTo(this.fwd.set(0, 0, -1).applyQuaternion(e.group.quaternion));
      if (dist < f.fireRange && angle < f.fireAngle && st.fireTimer <= 0) {
        st.fireTimer = f.fireInterval;
        this.fireAt(e, playerGroup.position, f.projectileSpeed, f.damage);
      }
    } else {
      // Patrol: circle around the spawn centre.
      st.phase += dt * (f.speed / f.patrolRadius);
      this.tmp.set(
        st.patrolCentre.x + Math.cos(st.phase) * f.patrolRadius,
        st.patrolCentre.y,
        st.patrolCentre.z + Math.sin(st.phase) * f.patrolRadius);
      this.desired.copy(this.tmp).sub(pos);
    }
    this.avoidTerrain(e, this.desired);
    this.steer(e, this.desired, f.turnRate * (st.mode === 'evade' ? 1.7 : 1), f.speed, dt);
  }

  private updateBomber(e: AircraftEntity, st: AiState, dt: number, playerGroup: THREE.Group | null, playerAlive: boolean): void {
    const b = this.s.config.enemy.bomber;
    const pos = e.group.position;
    this.basePoint(this.tmp);
    if (st.mode === 'toBase') {
      this.desired.copy(this.tmp).sub(pos);
      if (pos.distanceTo(this.tmp) < b.orbitRadius * 1.15) st.mode = 'orbit';
    } else {
      // Orbit the base.
      st.phase += dt * (b.speed / b.orbitRadius);
      this.tmp2.set(
        this.tmp.x + Math.cos(st.phase) * b.orbitRadius,
        this.tmp.y,
        this.tmp.z + Math.sin(st.phase) * b.orbitRadius);
      this.desired.copy(this.tmp2).sub(pos);
    }
    this.avoidTerrain(e, this.desired);
    this.steer(e, this.desired, b.turnRate, b.speed, dt);

    // Tail gun: fires at the player when they sit in the rear cone.
    if (playerGroup && playerAlive) {
      st.fireTimer -= dt;
      this.fwd.set(0, 0, -1).applyQuaternion(e.group.quaternion);
      this.tmp.copy(playerGroup.position).sub(pos);
      const dist = this.tmp.length();
      const behindAngle = this.tmp.normalize().angleTo(this.tmp2.copy(this.fwd).multiplyScalar(-1));
      if (dist < b.tailFireRange && behindAngle < b.tailFireAngle && st.fireTimer <= 0) {
        st.fireTimer = b.fireInterval;
        this.fireAt(e, playerGroup.position, b.projectileSpeed, b.damage);
      }
    }
  }

  private fireAt(e: AircraftEntity, targetPos: THREE.Vector3, speed: number, damage: number): void {
    this.tmp.copy(targetPos).sub(e.group.position).normalize();
    this.tmp.x += (Math.random() - 0.5) * 0.03;
    this.tmp.y += (Math.random() - 0.5) * 0.03;
    this.tmp.normalize();
    this.tmp2.copy(e.group.position).addScaledVector(this.tmp, 4);
    this.projectiles.fire(this.tmp2, this.tmp, {
      speed, life: 1.8, damage, faction: 'enemy', color: 0xff7a5c,
    });
  }

  dispose(): void {
    this.unsubs.forEach((u) => u());
    this.projectiles.dispose();
  }
}
