// ─── Multi-Tier In-Memory LRU Cache ──────────────────────────────────────────
// Microsecond O(1) get/set with TTL eviction and request coalescing.
// Provides 0ms repeat latency for identical AI generation requests.

interface CacheNode<V> {
  key: string;
  value: V;
  expiresAt: number;
  prev: CacheNode<V> | null;
  next: CacheNode<V> | null;
}

/**
 * LRU cache with TTL expiry.
 * O(1) get/set using doubly-linked list + Map.
 *
 * @typeParam V - The type of values stored in the cache.
 */
export class LruCache<V> {
  private readonly map = new Map<string, CacheNode<V>>();
  private head: CacheNode<V> | null = null; // most-recently-used
  private tail: CacheNode<V> | null = null; // least-recently-used

  /**
   * Creates a new `LruCache` instance.
   *
   * @param maxSize - Maximum number of entries before the least-recently-used
   *   entry is evicted.
   * @param ttlMs - Time-to-live in milliseconds; entries older than this are
   *   treated as expired and removed on the next access.
   */
  constructor(
    private readonly maxSize: number,
    private readonly ttlMs: number,
  ) {}

  /**
   * Retrieves a cached value by key.
   *
   * @description Promotes the accessed entry to the most-recently-used
   * position. Returns `undefined` and evicts the entry when it has expired.
   *
   * @param key - The cache key to look up.
   * @returns The cached value, or `undefined` if the key is absent or expired.
   */
  get(key: string): V | undefined {
    const node = this.map.get(key);
    if (!node) return undefined;
    if (Date.now() > node.expiresAt) {
      this.evict(node);
      return undefined;
    }
    this.moveToHead(node);
    return node.value;
  }

  /**
   * Inserts or updates a cache entry.
   *
   * @description If the key already exists, its value and TTL are refreshed
   * and it is promoted to most-recently-used. If the cache is at capacity
   * after inserting a new entry, the least-recently-used entry is evicted.
   *
   * @param key - The cache key.
   * @param value - The value to store.
   */
  set(key: string, value: V): void {
    const existing = this.map.get(key);
    if (existing) {
      existing.value = value;
      existing.expiresAt = Date.now() + this.ttlMs;
      this.moveToHead(existing);
      return;
    }
    const node: CacheNode<V> = {
      key, value,
      expiresAt: Date.now() + this.ttlMs,
      prev: null, next: this.head,
    };
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
    this.map.set(key, node);

    if (this.map.size > this.maxSize) this.evictTail();
  }

  /**
   * Returns `true` when the key exists and has not expired.
   *
   * @param key - The cache key to check.
   * @returns `true` if a non-expired entry is present, `false` otherwise.
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /** Returns the current number of entries in the cache (including expired ones not yet evicted). */
  get size(): number { return this.map.size; }

  private moveToHead(node: CacheNode<V>): void {
    if (node === this.head) return;
    this.unlink(node);
    node.next = this.head;
    node.prev = null;
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
  }

  private evictTail(): void {
    if (this.tail) this.evict(this.tail);
  }

  private evict(node: CacheNode<V>): void {
    this.unlink(node);
    this.map.delete(node.key);
  }

  private unlink(node: CacheNode<V>): void {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;
    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;
    node.prev = null;
    node.next = null;
  }
}

// ─── Request Coalescing (Stampede Prevention) ─────────────────────────────────
/**
 * Deduplicates concurrent in-flight requests for the same key.
 * Double-clicks / race conditions trigger only 1 network execution.
 *
 * @typeParam V - The resolved value type of the deduplicated promises.
 */
export class RequestCoalescer<V> {
  private readonly inflight = new Map<string, Promise<V>>();

  /**
   * Executes `fn` for `key` if no in-flight request exists; otherwise returns
   * the existing promise so all callers share a single execution.
   *
   * @description Once the promise settles (resolves or rejects), the entry is
   * automatically removed from the in-flight map so the next call triggers a
   * fresh execution.
   *
   * @param key - The deduplication key (e.g. a cache key or request hash).
   * @param fn - The async factory function to invoke when no in-flight request
   *   exists for this key.
   * @returns A promise that resolves to the result of `fn`, shared across all
   *   concurrent callers for the same key.
   */
  async get(key: string, fn: () => Promise<V>): Promise<V> {
    const existing = this.inflight.get(key);
    if (existing) return existing;
    const promise = fn().finally(() => this.inflight.delete(key));
    this.inflight.set(key, promise);
    return promise;
  }

  /** Returns the number of currently in-flight (pending) requests. */
  get size(): number { return this.inflight.size; }
}

// ─── Singleton instances used by the API route ────────────────────────────────
import { CACHE_TTL_MS } from './constants';

/** Server-side plan cache: max 200 entries, 1h TTL */
export const planLruCache = new LruCache<unknown>(200, CACHE_TTL_MS);

/** Request coalescer shared across all concurrent API calls */
export const planCoalescer = new RequestCoalescer<unknown>();

