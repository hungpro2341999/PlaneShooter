/**
 * Pure boost state machine (no Three.js, no DOM) — unit-tested.
 * ready -> (press) active for `duration` -> cooldown for `cooldown` -> ready.
 * Activation is edge-triggered: holding the key does not re-trigger it.
 */
export class BoostStateMachine {
  private timeLeft = 0;    // seconds of boost remaining
  private cooldownLeft = 0; // seconds until ready again (includes active time)
  private wasHeld = false;

  constructor(private duration: number, private cooldown: number) {}

  /** Call every frame. Returns true while boosting. */
  update(dt: number, held: boolean): boolean {
    this.cooldownLeft = Math.max(0, this.cooldownLeft - dt);
    if (held && !this.wasHeld && this.cooldownLeft <= 0 && this.timeLeft <= 0) {
      this.timeLeft = this.duration;
      this.cooldownLeft = this.duration + this.cooldown;
    }
    this.wasHeld = held;
    this.timeLeft = Math.max(0, this.timeLeft - dt);
    return this.timeLeft > 0;
  }

  get boosting(): boolean { return this.timeLeft > 0; }
  get ready(): boolean { return this.cooldownLeft <= 0; }
  /** 0..1 for HUD: 1 = ready (or boosting), fills up during cooldown. */
  get charge(): number {
    if (this.boosting || this.ready) return 1;
    const remaining = Math.max(0, this.cooldownLeft - this.duration);
    return Math.min(1, Math.max(0, 1 - remaining / this.cooldown));
  }
}
