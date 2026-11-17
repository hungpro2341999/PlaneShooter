import type { GameFeature } from '../../core/GameFeature';
import type { GameServices } from '../../core/GameServices';

/**
 * 0008 — Wave mode. Fixed composition per wave (balance.waves), one shared
 * countdown for the whole run. Win = clear every wave; lose = player
 * destroyed or time out. Result is shown by the HUD (0009) via 'game:over';
 * restarting reloads the page (greybox-scope decision, see decisions.md).
 */
export class WavesFeature implements GameFeature {
  readonly id = '0008-waves';
  private s!: GameServices;
  private waveIndex = -1; // -1 = not started
  private timeLeft = 0;
  private betweenTimer = 0;
  private spawnedThisWave = false;
  private over = false;
  private emitTimer = 0;
  private unsubs: Array<() => void> = [];

  init(services: GameServices): void {
    this.s = services;
    this.timeLeft = services.config.waves.timeLimit;
    this.unsubs.push(services.bus.on('aircraft:destroyed', ({ id }) => {
      if (id === 'player') this.finish(false, 'Máy bay của bạn đã bị hạ.');
    }));
  }

  private startWave(index: number): void {
    this.waveIndex = index;
    this.spawnedThisWave = true;
    const def = this.s.config.waves.definitions[index];
    for (let i = 0; i < def.fighters; i++) this.s.bus.emit('enemy:spawn', { kind: 'fighter' });
    for (let i = 0; i < def.bombers; i++) this.s.bus.emit('enemy:spawn', { kind: 'bomber' });
  }

  private finish(win: boolean, reason: string): void {
    if (this.over) return;
    this.over = true;
    this.s.bus.emit('game:over', { win, reason });
  }

  update(dt: number): void {
    if (this.over) return;
    const defs = this.s.config.waves.definitions;

    if (this.waveIndex === -1) { this.startWave(0); }

    this.timeLeft -= dt;
    if (this.timeLeft <= 0) { this.finish(false, 'Hết giờ.'); return; }

    const enemiesLeft = this.s.aircraft.enemies().length;
    if (this.spawnedThisWave && enemiesLeft === 0) {
      if (this.waveIndex >= defs.length - 1) { this.finish(true, 'Đã hạ toàn bộ các đợt địch.'); return; }
      this.spawnedThisWave = false;
      this.betweenTimer = this.s.config.waves.betweenWavesDelay;
    }
    if (!this.spawnedThisWave) {
      this.betweenTimer -= dt;
      if (this.betweenTimer <= 0) this.startWave(this.waveIndex + 1);
    }

    this.emitTimer += dt;
    if (this.emitTimer > 0.2) {
      this.emitTimer = 0;
      this.s.bus.emit('wave:state', {
        wave: this.waveIndex + 1, totalWaves: defs.length,
        enemiesLeft, timeLeft: Math.max(0, this.timeLeft),
      });
    }
  }

  dispose(): void { this.unsubs.forEach((u) => u()); }
}
