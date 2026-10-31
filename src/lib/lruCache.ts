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
 */
export class LruCache<V> {
  private readonly map = new Map<string, CacheNode<V>>();
  private head: CacheNode<V> | null = null; // most-recently-used
  private tail: CacheNode<V> | null = null; // least-recently-used

  constructor(
    private readonly maxSize: number,
    private readonly ttlMs: number,
  ) {}

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

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

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
 */
export class RequestCoalescer<V> {
  private readonly inflight = new Map<string, Promise<V>>();

  async get(key: string, fn: () => Promise<V>): Promise<V> {
    const existing = this.inflight.get(key);
    if (existing) return existing;
    const promise = fn().finally(() => this.inflight.delete(key));
    this.inflight.set(key, promise);
    return promise;
  }

  get size(): number { return this.inflight.size; }
}

// ─── Singleton instances used by the API route ────────────────────────────────
import { CACHE_TTL_MS } from './constants';

/** Server-side plan cache: max 200 entries, 1h TTL */
export const planLruCache = new LruCache<unknown>(200, CACHE_TTL_MS);

/** Request coalescer shared across all concurrent API calls */
export const planCoalescer = new RequestCoalescer<unknown>();

