import type { GameFeature } from '../../core/GameFeature';
import type { GameServices } from '../../core/GameServices';

/**
 * 0009 — HUD. DOM lives in index.html; everything arrives via EventBus:
 * FPS + boost (core/flight), player health (0006), gun heat (0004),
 * missiles + lock ring (0005), wave + timer (0008), result screen (0008).
 */
export class HudFeature implements GameFeature {
  readonly id = '0009-hud';
  private unsubs: Array<() => void> = [];

  init(services: GameServices): void {
    const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;
    const fpsEl = el('fps'), healthBar = el('healthBar'), healthText = el('healthText');
    const waveInfo = el('waveInfo'), spdLine = el('spdLine'), boostBar = el('boostBar');
    const heatBar = el('heatBar'), heatLabel = el('heatLabel'), mslLine = el('mslLine');
    const lockRing = el('lockRing'), gameover = el('gameover');
    const goTitle = el('goTitle'), goDetail = el('goDetail');

    const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

    this.unsubs.push(services.bus.on('game:fps', ({ fps }) => { if (fpsEl) fpsEl.textContent = `FPS: ${fps}`; }));
    this.unsubs.push(services.bus.on('flight:state', (st) => {
      if (spdLine) spdLine.textContent = `SPD: ${Math.round(st.speed * 3.6)} km/h${st.boosting ? '  BOOST!' : ''}`;
      if (boostBar) {
        boostBar.style.width = `${Math.round(st.boostCharge * 100)}%`;
        boostBar.style.background = st.boostCharge >= 1 ? '#ffd34d' : '#9db7c9';
      }
    }));
    this.unsubs.push(services.bus.on('player:health', ({ health, maxHealth }) => {
      if (healthBar) {
        healthBar.style.width = `${Math.max(0, (health / maxHealth) * 100)}%`;
        healthBar.style.background = health / maxHealth > 0.35 ? '#57d977' : '#e5484d';
      }
      if (healthText) healthText.textContent = `${Math.ceil(health)} / ${maxHealth}`;
    }));
    this.unsubs.push(services.bus.on('gun:state', ({ heat, overheated }) => {
      if (heatBar) {
        heatBar.style.width = `${Math.round(heat * 100)}%`;
        heatBar.style.background = overheated ? '#e5484d' : '#ff9a3d';
      }
      if (heatLabel) heatLabel.textContent = overheated ? '— QUÁ NHIỆT!' : '';
    }));
    this.unsubs.push(services.bus.on('missile:state', ({ missiles, maxMissiles }) => {
      if (mslLine) mslLine.textContent = `TÊN LỬA: ${missiles} / ${maxMissiles}`;
    }));
    this.unsubs.push(services.bus.on('missile:lock', ({ targetId, progress, locked }) => {
      if (!lockRing) return;
      if (!targetId) { lockRing.style.borderColor = 'rgba(255,255,255,0)'; lockRing.textContent = ''; return; }
      lockRing.style.borderColor = locked ? '#e5484d' : `rgba(255, 211, 77, ${0.35 + progress * 0.65})`;
      lockRing.textContent = locked ? 'ĐÃ KHÓA' : `ĐANG KHÓA ${Math.round(progress * 100)}%`;
    }));
    this.unsubs.push(services.bus.on('wave:state', (w) => {
      if (waveInfo) waveInfo.textContent = `ĐỢT ${w.wave}/${w.totalWaves} • địch còn: ${w.enemiesLeft} • ${fmtTime(w.timeLeft)}`;
    }));
    this.unsubs.push(services.bus.on('game:over', ({ win, reason }) => {
      if (gameover) gameover.style.display = 'flex';
      if (goTitle) goTitle.textContent = win ? 'THẮNG 🎉' : 'THUA';
      if (goDetail) goDetail.textContent = reason;
    }));
    el<HTMLButtonElement>('restartBtn')?.addEventListener('click', () => window.location.reload());
  }

  update(): void { /* event-driven */ }
  dispose(): void { this.unsubs.forEach((u) => u()); }
}
