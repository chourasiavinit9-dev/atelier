// LRU Cache & Request Coalescing — Efficiency Suite
import { describe, it, expect, vi } from 'vitest';
import { LruCache, RequestCoalescer } from '@/lib/lruCache';

// ─── LRU Cache ───────────────────────────────────────────────────────────────
describe('LruCache — O(1) get/set with TTL', () => {
  it('stores and retrieves a value', () => {
    const cache = new LruCache<string>(10, 60_000);
    cache.set('key1', 'hello');
    expect(cache.get('key1')).toBe('hello');
  });

  it('returns undefined for missing keys', () => {
    const cache = new LruCache<string>(10, 60_000);
    expect(cache.get('missing')).toBeUndefined();
  });

  it('evicts LRU when capacity exceeded', () => {
    const cache = new LruCache<number>(3, 60_000);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.set('d', 4); // 'a' should be evicted (LRU)
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('d')).toBe(4);
  });

  it('promotes accessed entry to head (avoids premature eviction)', () => {
    const cache = new LruCache<number>(3, 60_000);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.get('a'); // promote 'a'
    cache.set('d', 4); // 'b' should be evicted now
    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBeUndefined();
  });

  it('reports correct size', () => {
    const cache = new LruCache<string>(10, 60_000);
    cache.set('x', 'v1');
    cache.set('y', 'v2');
    expect(cache.size).toBe(2);
  });

  it('expires entries after TTL (fake timers)', () => {
    vi.useFakeTimers();
    const cache = new LruCache<string>(10, 1_000); // 1s TTL
    cache.set('ttl-key', 'value');
    expect(cache.get('ttl-key')).toBe('value');
    vi.advanceTimersByTime(1_001);
    expect(cache.get('ttl-key')).toBeUndefined();
    vi.useRealTimers();
  });

  it('updates existing key without growing size', () => {
    const cache = new LruCache<string>(10, 60_000);
    cache.set('k', 'v1');
    cache.set('k', 'v2');
    expect(cache.size).toBe(1);
    expect(cache.get('k')).toBe('v2');
  });

  it('has() returns true for valid entry', () => {
    const cache = new LruCache<number>(10, 60_000);
    cache.set('n', 42);
    expect(cache.has('n')).toBe(true);
  });

  it('has() returns false for expired entry', () => {
    vi.useFakeTimers();
    const cache = new LruCache<number>(10, 500);
    cache.set('n', 42);
    vi.advanceTimersByTime(600);
    expect(cache.has('n')).toBe(false);
    vi.useRealTimers();
  });
});

// ─── Request Coalescer ───────────────────────────────────────────────────────
describe('RequestCoalescer — stampede prevention', () => {
  it('deduplicates concurrent identical requests', async () => {
    const coalescer = new RequestCoalescer<string>();
    let callCount = 0;
    const slowFn = () => new Promise<string>((resolve) => {
      callCount++;
      setTimeout(() => resolve('result'), 50);
    });

    const [r1, r2, r3] = await Promise.all([
      coalescer.get('key', slowFn),
      coalescer.get('key', slowFn),
      coalescer.get('key', slowFn),
    ]);

    // Only ONE underlying call should have been made
    expect(callCount).toBe(1);
    expect(r1).toBe('result');
    expect(r2).toBe('result');
    expect(r3).toBe('result');
  });

  it('allows sequential requests after the first resolves', async () => {
    const coalescer = new RequestCoalescer<number>();
    let count = 0;
    const fn = () => Promise.resolve(++count);

    const first = await coalescer.get('k', fn);
    const second = await coalescer.get('k', fn);
    expect(first).toBe(1);
    expect(second).toBe(2); // new call after first settled
  });

  it('cleans up inflight map after resolution', async () => {
    const coalescer = new RequestCoalescer<string>();
    await coalescer.get('clean', () => Promise.resolve('done'));
    expect(coalescer.size).toBe(0);
  });
});

