import type { GameFeature } from '../../core/GameFeature';
import type { GameServices } from '../../core/GameServices';

/** HUD glue: FPS counter (top-left) + speed/boost read-out (top-right). DOM lives in index.html. */
export class HudFeature implements GameFeature {
  readonly id = '0004-hud';
  private unsubs: Array<() => void> = [];

  init(services: GameServices): void {
    const fpsEl = document.getElementById('fps');
    const statusEl = document.getElementById('status');
    const boostBar = document.getElementById('boostBar') as HTMLElement | null;
    let lastFlight = { speed: 0, boosting: false, boostCharge: 1 };
    let lastFps = 0;

    const render = () => {
      if (statusEl) {
        statusEl.childNodes[0].textContent =
          `SPD: ${Math.round(lastFlight.speed * 3.6)} km/h${lastFlight.boosting ? '  BOOST!' : ''}`;
      }
      if (boostBar) {
        boostBar.style.width = `${Math.round(lastFlight.boostCharge * 100)}%`;
        boostBar.style.background = lastFlight.boostCharge >= 1 ? '#ffd34d' : '#9db7c9';
      }
      if (fpsEl) fpsEl.textContent = `FPS: ${lastFps}`;
    };
    this.unsubs.push(services.bus.on('game:fps', ({ fps }) => { lastFps = fps; render(); }));
    this.unsubs.push(services.bus.on('flight:state', (st) => { lastFlight = st; render(); }));
  }

  update(): void { /* event-driven */ }
  dispose(): void { this.unsubs.forEach((u) => u()); }
}
