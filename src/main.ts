import { Game } from './core/Game';
import { GreyboxWorldFeature } from './features/world/GreyboxWorldFeature';
import { FlightFeature } from './features/flight/FlightFeature';
import { ChaseCameraFeature } from './features/camera/ChaseCameraFeature';
import { HudFeature } from './features/hud/HudFeature';

async function boot(): Promise<void> {
  const container = document.getElementById('app');
  if (!container) throw new Error('#app container missing');
  const game = new Game(container);
  // Registration order = update order: world -> flight -> camera -> hud.
  await game.register(new GreyboxWorldFeature());
  await game.register(new FlightFeature());
  await game.register(new ChaseCameraFeature());
  await game.register(new HudFeature());
  game.start();
}

void boot();
