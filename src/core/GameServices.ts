import type * as THREE from 'three';
import type { EventBus, GameEvents } from './EventBus';
import type { Input } from './Input';
import type { Balance } from '../config/balance';

/** World queries any feature may need (implemented by the world feature). */
export interface WorldQueries {
  /** Terrain/sea height (m) at a world XZ position. Sea = 0. */
  heightAt(x: number, z: number): number;
}

/** Shared, mutable reference to the player aircraft. */
export interface PlayerRef {
  group: THREE.Group | null;
  speed: number;
}

/** Everything a feature is allowed to depend on. No other globals. */
export interface GameServices {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  bus: EventBus<GameEvents>;
  input: Input;
  config: Balance;
  world: WorldQueries;
  player: PlayerRef;
}
