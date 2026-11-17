import type * as THREE from 'three';

export type AircraftKind = 'player' | 'fighter' | 'bomber';
export type Faction = 'player' | 'enemy';

/**
 * One flying aircraft as the combat systems see it. The THREE group is the
 * source of truth for position/heading; health lives here and is only
 * mutated by the health feature (0006) via 'combat:damage' events.
 */
export interface AircraftEntity {
  id: string;
  kind: AircraftKind;
  faction: Faction;
  group: THREE.Group;
  maxHealth: number;
  health: number;
  alive: boolean;
  radius: number; // m, projectile proximity radius
}

/** Shared registry of every aircraft in the sky. Features never keep private lists of each other. */
export class AircraftRegistry {
  private map = new Map<string, AircraftEntity>();

  register(e: AircraftEntity): void { this.map.set(e.id, e); }
  get(id: string): AircraftEntity | undefined { return this.map.get(id); }
  remove(id: string): void { this.map.delete(id); }
  all(): AircraftEntity[] { return [...this.map.values()]; }
  enemies(aliveOnly = true): AircraftEntity[] {
    return this.all().filter((e) => e.faction === 'enemy' && (!aliveOnly || e.alive));
  }
  player(): AircraftEntity | undefined { return this.map.get('player'); }
}
