import { Game } from './core/Game';
import { GreyboxWorldFeature } from './features/world/GreyboxWorldFeature';
import { FlightFeature } from './features/flight/FlightFeature';
import { HealthFeature } from './features/health/HealthFeature';
import { GunFeature } from './features/gun/GunFeature';
import { MissileFeature } from './features/missile/MissileFeature';
import { EnemyAiFeature } from './features/enemies/EnemyAiFeature';
import { WavesFeature } from './features/waves/WavesFeature';
import { ChaseCameraFeature } from './features/camera/ChaseCameraFeature';
import { HudFeature } from './features/hud/HudFeature';

async function boot(): Promise<void> {
  const container = document.getElementById('app');
  if (!container) throw new Error('#app container missing');
  const game = new Game(container);
  // Registration order = update order.
  await game.register(new GreyboxWorldFeature()); // 0001
  await game.register(new FlightFeature());       // 0002
  await game.register(new HealthFeature());       // 0006 (registers the player aircraft)
  await game.register(new GunFeature());          // 0004
  await game.register(new MissileFeature());      // 0005
  await game.register(new EnemyAiFeature());      // 0007 (listens for spawn events)
  await game.register(new WavesFeature());        // 0008 (emits spawn events from its first update)
  await game.register(new ChaseCameraFeature());  // 0003
  await game.register(new HudFeature());          // 0009
  game.start();
}

void boot();
