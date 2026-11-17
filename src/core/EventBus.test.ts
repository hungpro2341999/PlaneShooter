import { describe, it, expect, vi } from 'vitest';
import { EventBus } from './EventBus';

interface Ev { hit: { n: number }; ping: Record<string, never> }

describe('EventBus', () => {
  it('delivers payloads to subscribers', () => {
    const bus = new EventBus<Ev>();
    const fn = vi.fn();
    bus.on('hit', fn);
    bus.emit('hit', { n: 3 });
    expect(fn).toHaveBeenCalledWith({ n: 3 });
  });
  it('unsubscribe function stops delivery', () => {
    const bus = new EventBus<Ev>();
    const fn = vi.fn();
    const off = bus.on('hit', fn);
    off();
    bus.emit('hit', { n: 1 });
    expect(fn).not.toHaveBeenCalled();
  });
  it('off() removes a handler and events are isolated by type', () => {
    const bus = new EventBus<Ev>();
    const a = vi.fn(); const b = vi.fn();
    bus.on('hit', a); bus.on('ping', b);
    bus.off('hit', a);
    bus.emit('hit', { n: 1 });
    bus.emit('ping', {});
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
  });
  it('emit with no subscribers is a no-op', () => {
    const bus = new EventBus<Ev>();
    expect(() => bus.emit('hit', { n: 0 })).not.toThrow();
  });
});
