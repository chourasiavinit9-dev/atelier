import { describe, it, expect } from 'vitest';
import { fnv1a32, buildCacheKey } from '@/lib/hash';
import type { EventFormInput } from '@/lib/types';

const BASE_INPUT: EventFormInput = {
  eventType: 'Wedding',
  guestCount: 100,
  city: 'Mumbai',
  cityTier: 'Metro',
  totalBudget: 500000,
  currency: 'INR',
  eventDate: '2099-12-31',
  vibeAndPreferences: 'Outdoor, romantic, jazz band.',
};

describe('FNV-1a Hashing', () => {
  it('returns an 8-char hex string', () => {
    const h = fnv1a32('hello');
    expect(h).toMatch(/^[0-9a-f]{8}$/);
  });

  it('is deterministic for the same input', () => {
    expect(fnv1a32('atelier')).toBe(fnv1a32('atelier'));
  });

  it('produces different hashes for different inputs', () => {
    expect(fnv1a32('hello')).not.toBe(fnv1a32('world'));
  });

  it('handles empty string', () => {
    expect(fnv1a32('')).toMatch(/^[0-9a-f]{8}$/);
  });

  it('handles unicode characters', () => {
    const h = fnv1a32('नमस्ते');
    expect(h).toMatch(/^[0-9a-f]{8}$/);
  });
});

describe('Cache Key Building', () => {
  it('produces consistent key for same input', () => {
    expect(buildCacheKey(BASE_INPUT)).toBe(buildCacheKey(BASE_INPUT));
  });

  it('treats city case-insensitively', () => {
    const lower = buildCacheKey({ ...BASE_INPUT, city: 'mumbai' });
    const upper = buildCacheKey({ ...BASE_INPUT, city: 'MUMBAI' });
    expect(lower).toBe(upper);
  });

  it('rounds budget for caching', () => {
    const a = buildCacheKey({ ...BASE_INPUT, totalBudget: 500000 });
    const b = buildCacheKey({ ...BASE_INPUT, totalBudget: 500000.4 });
    expect(a).toBe(b);
  });

  it('produces different keys for different event types', () => {
    const w = buildCacheKey({ ...BASE_INPUT, eventType: 'Wedding' });
    const b = buildCacheKey({ ...BASE_INPUT, eventType: 'Birthday' });
    expect(w).not.toBe(b);
  });

  it('produces different keys for different budgets', () => {
    const a = buildCacheKey({ ...BASE_INPUT, totalBudget: 100000 });
    const b = buildCacheKey({ ...BASE_INPUT, totalBudget: 200000 });
    expect(a).not.toBe(b);
  });
});
