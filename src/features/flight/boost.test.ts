import { describe, it, expect } from 'vitest';
import { BoostStateMachine } from './boost';

const step = (b: BoostStateMachine, seconds: number, held: boolean) => {
  let boosting = false;
  for (let t = 0; t < seconds; t += 0.1) boosting = b.update(0.1, held);
  return boosting;
};

describe('BoostStateMachine (duration 2.5, cooldown 5)', () => {
  it('does not boost without a press', () => {
    const b = new BoostStateMachine(2.5, 5);
    expect(step(b, 1, false)).toBe(false);
    expect(b.ready).toBe(true);
    expect(b.charge).toBe(1);
  });
  it('boosts for exactly the duration after a press', () => {
    const b = new BoostStateMachine(2.5, 5);
    expect(b.update(0.1, true)).toBe(true);
    expect(step(b, 2.3, true)).toBe(true);   // still inside 2.5s
    expect(step(b, 0.3, true)).toBe(false);  // duration over
  });
  it('cannot re-trigger during cooldown, even with a fresh press', () => {
    const b = new BoostStateMachine(2.5, 5);
    b.update(0.1, true);
    step(b, 2.5, false);                      // boost spent
    expect(b.update(0.1, true)).toBe(false);  // press during cooldown: ignored
    expect(b.ready).toBe(false);
  });
  it('holding the key does not re-trigger after cooldown (edge-triggered)', () => {
    const b = new BoostStateMachine(2.5, 5);
    b.update(0.1, true);
    step(b, 8, true);                         // hold through duration + cooldown
    expect(b.boosting).toBe(false);
    expect(b.ready).toBe(true);
    b.update(0.1, false);                     // release…
    expect(b.update(0.1, true)).toBe(true);   // …and press again: works
  });
  it('charge refills from 0 to 1 across the cooldown', () => {
    const b = new BoostStateMachine(2.5, 5);
    b.update(0.1, true);
    step(b, 2.5, false);
    const mid = b.charge;
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
    step(b, 5, false);
    expect(b.charge).toBe(1);
  });
});
