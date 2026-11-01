// FNV-1a 32-bit hashing for deterministic cache keys
import type { EventFormInput } from './types';

/**
 * Computes an FNV-1a 32-bit hash of the given string.
 * Runs in O(n) time with zero allocations beyond the return value.
 * @param str - Input string to hash
 * @returns 8-character lowercase hex string representing the 32-bit hash
 */
export function fnv1a32(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Builds a stable, deterministic cache key from event form input.
 * Normalises city casing and trims vibe text before hashing so semantically
 * identical requests share the same cache slot regardless of whitespace.
 * @param input - Validated event form input from the onboarding wizard
 * @returns FNV-1a 32-bit hex string suitable for use as a Firestore document ID
 */
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
