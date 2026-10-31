// FNV-1a 32-bit hashing for deterministic cache keys
export function fnv1a32(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

// Normalize form input to a stable string for hashing
import type { EventFormInput } from './types';

export function buildCacheKey(input: EventFormInput): string {
  const normalized = JSON.stringify({
    eventType: input.eventType,
    guestCount: input.guestCount,
    city: input.city.toLowerCase().trim(),
    cityTier: input.cityTier,
    totalBudget: Math.round(input.totalBudget),
    currency: input.currency,
    eventDate: input.eventDate,
    vibe: input.vibeAndPreferences.toLowerCase().trim(),
  });
  return fnv1a32(normalized);
}
