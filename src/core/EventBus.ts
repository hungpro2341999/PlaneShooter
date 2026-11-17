type Handler<T> = (payload: T) => void;

/** Minimal typed pub/sub so features never import each other directly. */
export class EventBus<Events extends { [K in keyof Events]: unknown }> {
  private handlers = new Map<keyof Events, Set<Handler<never>>>();

  on<K extends keyof Events>(type: K, fn: Handler<Events[K]>): () => void {
    let set = this.handlers.get(type);
    if (!set) this.handlers.set(type, (set = new Set()));
    set.add(fn as Handler<never>);
    return () => this.off(type, fn);
  }

  off<K extends keyof Events>(type: K, fn: Handler<Events[K]>): void {
    this.handlers.get(type)?.delete(fn as Handler<never>);
  }

  emit<K extends keyof Events>(type: K, payload: Events[K]): void {
    this.handlers.get(type)?.forEach((fn) => (fn as Handler<Events[K]>)(payload));
  }

  clear(): void { this.handlers.clear(); }
}

/** Every cross-feature event in the game is declared here. */
export interface GameEvents {
  'flight:state': { speed: number; boosting: boolean; boostCharge: number }; // boostCharge 0..1 (1 = ready)
  'game:fps': { fps: number };
  // Phase 2 combat
  'combat:damage': { targetId: string; amount: number };        // -> health feature applies it
  'aircraft:destroyed': { id: string; kind: string; faction: string };
  'gun:state': { heat: number; overheated: boolean };
  'missile:state': { missiles: number; maxMissiles: number };
  'missile:lock': { targetId: string | null; progress: number; locked: boolean }; // progress 0..1
  'missile:launched': { targetId: string };
  'enemy:spawn': { kind: 'fighter' | 'bomber' };                // waves -> AI feature
  'wave:state': { wave: number; totalWaves: number; enemiesLeft: number; timeLeft: number };
  'player:health': { health: number; maxHealth: number };
  'game:over': { win: boolean; reason: string };
}
