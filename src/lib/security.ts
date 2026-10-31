// ─── Security Defence Layer ──────────────────────────────────────────────────
// Centralised input security: XSS, phishing, malware, entropy filters
// server-safe (no DOM APIs used)

// ─── Custom Domain Errors ────────────────────────────────────────────────────
export class ValidationError extends Error {
  readonly code = 'VALIDATION_ERROR';
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class SecurityViolationError extends Error {
  readonly code = 'SECURITY_VIOLATION';
  constructor(message: string) {
    super(message);
    this.name = 'SecurityViolationError';
  }
}

export class RateLimitError extends Error {
  readonly code = 'RATE_LIMITED';
  constructor(message: string, public readonly retryAfterMs: number) {
    super(message);
    this.name = 'RateLimitError';
  }
}

// ─── XSS Disarmer ────────────────────────────────────────────────────────────
const XSS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /<iframe[\s\S]*?>/gi,
  /javascript:/gi,
  /on(?:load|error|click|mouseover|submit|focus|blur|change)=/gi,
  /data:text\/html/gi,
  /vbscript:/gi,
];

/**
 * Strips known XSS vectors from a string without blocking legitimate content.
 * Mutates nothing — returns sanitised copy.
 */
export function disarmXss(input: string): string {
  return XSS_PATTERNS.reduce((s, pattern) => s.replace(pattern, ''), input);
}

// ─── Unrelated / Garbage Input Detection ────────────────────────────────────
/** Keyboard mash: same character repeated 5+ times */
const MASH_RE = /([a-zA-Z0-9])\1{5,}/;
/** Unnatural consonant clusters (no vowels for 6+ chars) */
const CONSONANT_CLUSTER_RE = /[^aeiouAEIOU\s\d\W]{7,}/;

export function isGarbageInput(text: string): boolean {
  if (!text || text.trim().length < 3) return true;
  if (MASH_RE.test(text)) return true;
  if (CONSONANT_CLUSTER_RE.test(text)) return true;
  return false;
}

// ─── Phishing / Extortion Detection ─────────────────────────────────────────
const PHISHING_SIGNALS = [
  /digital\s*arrest/i,
  /send\s+bitcoin|send\s+eth/i,
  /transfer\s+money\s+immediately/i,
  /your\s+account\s+will\s+be\s+blocked/i,
  /bit\.ly|tinyurl\.com|rb\.gy|t\.co\/[a-z0-9]+/i,
  /urgent.*crypto|immediate.*UPI.*transfer/i,
];

export function hasPhishingSignals(text: string): boolean {
  return PHISHING_SIGNALS.some((re) => re.test(text));
}

// ─── Malware Magic Byte Detection ────────────────────────────────────────────
const ALLOWED_MIME_PREFIXES = ['image/', 'application/pdf'];
/** Windows PE header base64 prefix */
const PE_HEADER = 'TVqQ';
/** Linux ELF header base64 prefix */
const ELF_HEADER = 'f0VMRg';

export interface FileGuardResult {
  safe: boolean;
  reason?: string;
}

export function guardFile(mimeType: string, base64Header: string): FileGuardResult {
  // Magic byte checks run first regardless of claimed MIME type
  if (base64Header.startsWith(PE_HEADER)) {
    return { safe: false, reason: 'Blocked: Windows executable detected' };
  }
  if (base64Header.startsWith(ELF_HEADER)) {
    return { safe: false, reason: 'Blocked: Linux ELF binary detected' };
  }
  if (!ALLOWED_MIME_PREFIXES.some((p) => mimeType.startsWith(p))) {
    return { safe: false, reason: `Blocked MIME type: ${mimeType}` };
  }
  return { safe: true };
}

// ─── Prompt-Injection Defence ────────────────────────────────────────────────
const PROMPT_INJECTION_SIGNALS = [
  /ignore\s+(previous|all|above|prior)\s+instructions/i,
  /disregard\s+(previous|all|above|prior)\s+instructions/i,
  /override\s+(all\s+)?(rules|instructions|directives)/i,
  /bypass\s+(safety|rules|filters|guidelines)/i,
  /new\s+instruction[s]?:/i,
  /system\s*:\s*/i,
  /you\s+are\s+now\s+a/i,
  /act\s+as\s+(an?\s+)?/i,
  /jailbreak/i,
  /developer\s*mode/i,
  /dan\s+mode/i,
  /output\s+the\s+prompt|show\s+(me\s+)?(your\s+)?system\s+prompt|what\s+is\s+your\s+system\s+prompt/i,
  /<<<USER_DATA_(?:START|END)>>>/i,
  /sudo\s+mode|root\s+access|unrestricted\s+mode/i,
];

export function hasPromptInjection(text: string): boolean {
  return PROMPT_INJECTION_SIGNALS.some((re) => re.test(text));
}

// ─── Composite Gate ──────────────────────────────────────────────────────────
/** 
 * Run all security checks on a single user-supplied string.
 * Throws SecurityViolationError if any check fails.
 */
export function assertSafeInput(text: string, fieldName = 'input'): string {
  const cleaned = disarmXss(text);
  if (hasPhishingSignals(cleaned)) {
    throw new SecurityViolationError(`Phishing content detected in ${fieldName}`);
  }
  if (hasPromptInjection(cleaned)) {
    throw new SecurityViolationError(`Prompt injection attempt detected in ${fieldName}`);
  }
  return cleaned;
}

/**
 * Validates a dictionary of string inputs in batch.
 * Returns a new object with disarmed/verified string values.
 */
export function sanitizeBatch<T extends Record<string, string | undefined>>(fields: T): T {
  const result = { ...fields };
  for (const [key, val] of Object.entries(fields)) {
    if (typeof val === 'string') {
      (result as Record<string, unknown>)[key] = assertSafeInput(val, key);
    }
  }
  return result;
}
