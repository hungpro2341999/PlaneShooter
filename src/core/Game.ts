import * as THREE from 'three';
import { EventBus, type GameEvents } from './EventBus';
import type { GameFeature } from './GameFeature';
import type { GameServices, WorldQueries } from './GameServices';
import { Input } from './Input';
import { AircraftRegistry } from './Aircraft';
import { balance } from '../config/balance';

/** Owns the renderer, the main loop and the feature list. Nothing gameplay-specific. */
export class Game {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private features: GameFeature[] = [];
  private services: GameServices;
  private raf = 0;
  private fpsFrames = 0;
  private fpsTime = 0;

  constructor(container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      balance.camera.fov, window.innerWidth / window.innerHeight, 0.1, 3000);

    const bus = new EventBus<GameEvents>();
    const input = new Input();
    input.attach();

    // Default world query (sea level) until the world feature registers its own.
    const world: WorldQueries = { heightAt: () => 0 };
    this.services = {
      scene: this.scene, camera: this.camera, renderer: this.renderer,
      bus, input, config: balance, world,
      player: { group: null, speed: 0 },
      aircraft: new AircraftRegistry(),
    };
    window.addEventListener('resize', this.onResize);
  }

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  async register(feature: GameFeature): Promise<void> {
    await feature.init(this.services);
    this.features.push(feature);
  }

  start(): void {
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min(this.clock.getDelta(), 0.05); // clamp tab-switch spikes
      for (const f of this.features) f.update(dt);

      this.fpsFrames++;
      this.fpsTime += dt;
      if (this.fpsTime >= this.services.config.hud.fpsRefreshInterval) {
        this.services.bus.emit('game:fps', { fps: Math.round(this.fpsFrames / this.fpsTime) });
        this.fpsFrames = 0; this.fpsTime = 0;
      }
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  dispose(): void {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    this.features.forEach((f) => f.dispose());
    this.services.input.dispose();
    this.renderer.dispose();
  }
}
