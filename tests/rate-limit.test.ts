import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRateLimit } from '@/lib/rateLimiter';

describe('Rate Limiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('allows the first request from a new IP', () => {
    const result = checkRateLimit('1.2.3.1');
    expect(result.allowed).toBe(true);
  });

  it('blocks after burst limit (5 requests in 3s)', () => {
    const ip = '10.0.0.100';
    for (let i = 0; i < 5; i++) {
      checkRateLimit(ip);
    }
    const blocked = checkRateLimit(ip);
    expect(blocked.allowed).toBe(false);
  });

  it('allows requests after burst window resets', () => {
    const ip = '10.0.0.101';
    for (let i = 0; i < 5; i++) checkRateLimit(ip);
    vi.advanceTimersByTime(3001);
    const result = checkRateLimit(ip);
    expect(result.allowed).toBe(true);
  });

  it('returns retryAfterMs when blocked', () => {
    const ip = '10.0.0.102';
    for (let i = 0; i < 5; i++) checkRateLimit(ip);
    const blocked = checkRateLimit(ip);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it('isolates different IPs independently', () => {
    const ipA = '192.168.1.1';
    const ipB = '192.168.1.2';
    for (let i = 0; i < 5; i++) checkRateLimit(ipA);
    const result = checkRateLimit(ipB);
    expect(result.allowed).toBe(true);
  });
});
