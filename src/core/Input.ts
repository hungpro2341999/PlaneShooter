/**
 * Unified keyboard + mouse + gamepad input.
 * Features read axes/buttons from here; they never touch DOM events directly.
 *
 * Mouse steering: mouseX/mouseY = pointer offset from screen centre, -1..1.
 * Mouse buttons: left = machine gun, right = missile (context menu suppressed).
 * Gamepad (standard mapping): left stick steers, RT/LT throttle,
 * right stick X or LB/RB roll, A (0) boost, RT (7) gun, LB (4) missile.
 *
 * Safety (A1): on window blur / tab hidden, ALL key+button state is cleared so
 * a held key can never "stick"; when the pointer leaves the window the steer
 * axes return to 0 so the plane stops turning on its own.
 */
export class Input {
  private keys = new Set<string>();
  private mouseButtons = new Set<number>();
  mouseX = 0;
  mouseY = 0;

  private clearAll = () => {
    this.keys.clear();
    this.mouseButtons.clear();
    this.mouseX = 0;
    this.mouseY = 0;
  };
  private onKeyDown = (e: KeyboardEvent) => this.keys.add(e.code);
  private onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.code);
  private onMouseMove = (e: MouseEvent) => {
    this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  };
  private onMouseDown = (e: MouseEvent) => this.mouseButtons.add(e.button);
  private onMouseUp = (e: MouseEvent) => this.mouseButtons.delete(e.button);
  private onMouseLeave = () => { this.mouseX = 0; this.mouseY = 0; };
  private onVisibility = () => { if (document.hidden) this.clearAll(); };
  private onContextMenu = (e: Event) => e.preventDefault();

  attach(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    document.documentElement.addEventListener('mouseleave', this.onMouseLeave);
    window.addEventListener('blur', this.clearAll);
    document.addEventListener('visibilitychange', this.onVisibility);
    window.addEventListener('contextmenu', this.onContextMenu);
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    document.documentElement.removeEventListener('mouseleave', this.onMouseLeave);
    window.removeEventListener('blur', this.clearAll);
    document.removeEventListener('visibilitychange', this.onVisibility);
    window.removeEventListener('contextmenu', this.onContextMenu);
  }

  private pad(): Gamepad | null {
    for (const p of navigator.getGamepads?.() ?? []) if (p) return p;
    return null;
  }
  private axis(i: number): number { return this.pad()?.axes[i] ?? 0; }
  private btn(i: number): boolean { return this.pad()?.buttons[i]?.pressed ?? false; }
  private btnValue(i: number): number { return this.pad()?.buttons[i]?.value ?? 0; }

  get steerX(): number { return Math.abs(this.axis(0)) > 0.12 ? this.axis(0) : this.mouseX; }
  get steerY(): number { return Math.abs(this.axis(1)) > 0.12 ? this.axis(1) : this.mouseY; }
  get throttle(): number {
    let t = this.btnValue(7) - this.btnValue(6);
    if (this.keys.has('KeyW')) t += 1;
    if (this.keys.has('KeyS')) t -= 1;
    return Math.max(-1, Math.min(1, t));
  }
  get roll(): number {
    let r = Math.abs(this.axis(2)) > 0.12 ? this.axis(2) : 0;
    if (this.keys.has('KeyA')) r -= 1;
    if (this.keys.has('KeyD')) r += 1;
    if (this.btn(4)) r -= 1;
    if (this.btn(5)) r += 1;
    return Math.max(-1, Math.min(1, r));
  }
  get boost(): boolean { return this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') || this.btn(0); }
  /** Machine gun trigger: mouse-left or gamepad RT. (RT also adds throttle — accepted arcade overlap, see decisions.) */
  get fireGun(): boolean { return this.mouseButtons.has(0) || this.btnValue(7) > 0.4; }
  /** Missile trigger: mouse-right or gamepad LB. */
  get fireMissile(): boolean { return this.mouseButtons.has(2) || this.btn(4); }
}
