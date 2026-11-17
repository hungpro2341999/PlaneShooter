/**
 * Unified keyboard + mouse + gamepad input.
 * Features read axes/buttons from here; they never touch DOM events directly.
 *
 * Mouse steering: axes.mouseX/mouseY are the pointer offset from screen
 * centre, normalized to -1..1 (arcade style, no pointer lock needed).
 * Gamepad (standard mapping): left stick steers, RT/LT throttle,
 * left/right stick-X or LB/RB roll, button A (0) boost.
 */
export class Input {
  private keys = new Set<string>();
  mouseX = 0;
  mouseY = 0;
  private onKeyDown = (e: KeyboardEvent) => this.keys.add(e.code);
  private onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.code);
  private onMouseMove = (e: MouseEvent) => {
    this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  };

  attach(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('mousemove', this.onMouseMove);
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('mousemove', this.onMouseMove);
  }

  private pad(): Gamepad | null {
    for (const p of navigator.getGamepads?.() ?? []) if (p) return p;
    return null;
  }
  private axis(i: number): number { return this.pad()?.axes[i] ?? 0; }
  private btn(i: number): boolean { return this.pad()?.buttons[i]?.pressed ?? false; }
  private btnValue(i: number): number { return this.pad()?.buttons[i]?.value ?? 0; }

  /** -1..1 steering: mouse offset, or gamepad left stick X. */
  get steerX(): number { return Math.abs(this.axis(0)) > 0.12 ? this.axis(0) : this.mouseX; }
  /** -1..1 pitch: mouse offset (down = positive), or left stick Y. */
  get steerY(): number { return Math.abs(this.axis(1)) > 0.12 ? this.axis(1) : this.mouseY; }
  /** -1..1 throttle delta: W/S keys, or RT - LT on gamepad. */
  get throttle(): number {
    let t = this.btnValue(7) - this.btnValue(6);
    if (this.keys.has('KeyW')) t += 1;
    if (this.keys.has('KeyS')) t -= 1;
    return Math.max(-1, Math.min(1, t));
  }
  /** -1..1 roll: A/D keys, or gamepad right stick X / LB-RB. */
  get roll(): number {
    let r = Math.abs(this.axis(2)) > 0.12 ? this.axis(2) : 0;
    if (this.keys.has('KeyA')) r -= 1;
    if (this.keys.has('KeyD')) r += 1;
    if (this.btn(4)) r -= 1;
    if (this.btn(5)) r += 1;
    return Math.max(-1, Math.min(1, r));
  }
  get boost(): boolean { return this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') || this.btn(0); }
}
