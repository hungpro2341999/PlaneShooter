import type { GameServices } from './GameServices';

/**
 * Unit of gameplay code. One feature = one folder under src/features/.
 * Features talk to each other only through GameServices / EventBus.
 */
export interface GameFeature {
  /** Stable id matching the feature dossier, e.g. '0002-flight'. */
  readonly id: string;
  init(services: GameServices): void | Promise<void>;
  update(dt: number): void;
  dispose(): void;
}
