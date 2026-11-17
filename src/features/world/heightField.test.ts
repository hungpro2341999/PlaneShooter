import { describe, it, expect } from 'vitest';
import { createHeightAt } from './heightField';

const islands = [
  { x: 0, z: 0, radius: 100, height: 20 },
  { x: 300, z: 0, radius: 50, height: 10 },
];
const h = createHeightAt(islands);

describe('createHeightAt', () => {
  it('is 0 at sea (far from any island)', () => {
    expect(h(1000, 1000)).toBe(0);
    expect(h(-500, 200)).toBe(0);
  });
  it('peaks at the island centre with the island height', () => {
    expect(h(0, 0)).toBe(20);
    expect(h(300, 0)).toBe(10);
  });
  it('falls off smoothly toward the shore and reaches 0 at the radius', () => {
    const mid = h(50, 0); // halfway out: t=0.5 -> 20 * 0.25
    expect(mid).toBeCloseTo(5);
    expect(h(100, 0)).toBe(0);
    expect(h(25, 0)).toBeGreaterThan(mid);
  });
  it('takes the max when islands overlap', () => {
    const overlap = createHeightAt([
      { x: 0, z: 0, radius: 100, height: 20 },
      { x: 30, z: 0, radius: 100, height: 8 },
    ]);
    expect(overlap(0, 0)).toBe(20);
  });
});
