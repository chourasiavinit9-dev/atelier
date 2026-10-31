// Per-IP in-memory rate limiter (burst + sliding window)
import 'server-only';
import {
  RATE_LIMIT_BURST_COUNT,
  RATE_LIMIT_BURST_WINDOW_MS,
  RATE_LIMIT_SLIDING_COUNT,
  RATE_LIMIT_SLIDING_WINDOW_MS,
} from './constants';

interface IpRecord {
  burstTimestamps: number[];
  slidingTimestamps: number[];
}

const store = new Map<string, IpRecord>();

function getRecord(ip: string): IpRecord {
  if (!store.has(ip)) store.set(ip, { burstTimestamps: [], slidingTimestamps: [] });
  return store.get(ip)!;
}

function pruneOld(timestamps: number[], windowMs: number, now: number): number[] {
  return timestamps.filter((t) => now - t < windowMs);
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs?: number;
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const record = getRecord(ip);

  record.burstTimestamps = pruneOld(record.burstTimestamps, RATE_LIMIT_BURST_WINDOW_MS, now);
  record.slidingTimestamps = pruneOld(record.slidingTimestamps, RATE_LIMIT_SLIDING_WINDOW_MS, now);

  if (record.burstTimestamps.length >= RATE_LIMIT_BURST_COUNT) {
    const oldestBurst = record.burstTimestamps[0]!;
    return { allowed: false, retryAfterMs: RATE_LIMIT_BURST_WINDOW_MS - (now - oldestBurst) };
  }

  if (record.slidingTimestamps.length >= RATE_LIMIT_SLIDING_COUNT) {
    const oldestSliding = record.slidingTimestamps[0]!;
    return { allowed: false, retryAfterMs: RATE_LIMIT_SLIDING_WINDOW_MS - (now - oldestSliding) };
  }

  record.burstTimestamps.push(now);
  record.slidingTimestamps.push(now);
  return { allowed: true };
}
