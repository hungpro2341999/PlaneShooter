export interface IslandSpec { x: number; z: number; radius: number; height: number }

/**
 * Pure analytic terrain height (m) — sea = 0, each island is a smooth bump.
 * Shared by visuals, flight/camera clamps and enemy AI. Unit-tested.
 */
export function createHeightAt(islands: ReadonlyArray<IslandSpec>): (x: number, z: number) => number {
  return (x, z) => {
    let h = 0;
    for (const isl of islands) {
      const d = Math.hypot(x - isl.x, z - isl.z);
      if (d < isl.radius) {
        const t = 1 - d / isl.radius;
        h = Math.max(h, isl.height * t * t);
      }
    }
    return h;
  };
}
