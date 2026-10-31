import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { GenerateRequestSchema } from '@/lib/validators';
import { checkRateLimit } from '@/lib/rateLimiter';
import { buildCacheKey } from '@/lib/hash';
import { getCachedPlan, setCachedPlan } from '@/lib/cache';
import { planLruCache, planCoalescer } from '@/lib/lruCache';
import { generatePlanWithRetry, GenerationError } from '@/lib/geminiService';
import { generateTemplatePlan } from '@/lib/templateFallback';
import { buildBudgetAllocations } from '@/lib/budgetLogic';
import { buildTimeline } from '@/lib/timelineLogic';
import { buildVendors, buildThemes } from '@/lib/vendorThemeLogic';
import { apiError } from '@/lib/apiHelpers';
import { logger } from '@/lib/logger';
import { MAX_PAYLOAD_BYTES } from '@/lib/constants';
import { assertSafeInput, SecurityViolationError } from '@/lib/security';
import type { GeneratedPlan, GenerateResponse } from '@/lib/types';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';

  // ── Anti-DDoS: dual rate limits (burst + sliding window) ──────────────────
  const rateResult = checkRateLimit(ip);
  if (!rateResult.allowed) {
    return apiError('Too many requests', 'RATE_LIMITED', 429);
  }

  // ── Payload ceiling (100 KB) ───────────────────────────────────────────────
  const contentLength = Number(req.headers.get('content-length') ?? 0);
  if (contentLength > MAX_PAYLOAD_BYTES) {
    return apiError('Payload too large', 'VALIDATION_FAILED', 413);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_FAILED', 400);
  }

  // ── Schema validation (Zod) ────────────────────────────────────────────────
  const parsed = GenerateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? 'Validation failed', 'VALIDATION_FAILED', 400);
  }

  // ── Security gate: XSS / phishing / prompt-injection ──────────────────────
  try {
    const fi = parsed.data.formInput;
    assertSafeInput(fi.city, 'city');
    assertSafeInput(fi.vibeAndPreferences, 'vibeAndPreferences');
    if (fi.traditions) assertSafeInput(fi.traditions, 'traditions');
  } catch (err) {
    if (err instanceof SecurityViolationError) {
      logger.warn('Security violation blocked', { error: err.message });
      return apiError('Input contains disallowed content', 'VALIDATION_FAILED', 422);
    }
    throw err;
  }

  const { formInput } = parsed.data;
  const cacheKey = buildCacheKey(formInput);

  // ── Tier 1: In-memory LRU (0ms repeat latency) ────────────────────────────
  const hotCached = planLruCache.get(cacheKey) as GeneratedPlan | undefined;
  if (hotCached) {
    logger.info('LRU cache hit', { cacheKey });
    return NextResponse.json({ plan: hotCached, cached: true } satisfies GenerateResponse);
  }

  // ── Tier 2: Firestore (cross-instance, 1h TTL) ────────────────────────────
  const firestoreCached = await getCachedPlan(cacheKey);
  if (firestoreCached) {
    planLruCache.set(cacheKey, firestoreCached);
    logger.info('Firestore cache hit', { cacheKey });
    return NextResponse.json({ plan: firestoreCached, cached: true } satisfies GenerateResponse);
  }

  // ── Request coalescing: one Gemini call per unique key at a time ───────────
  try {
    const plan = await planCoalescer.get(cacheKey, async () => {
      const aiOutput = await generatePlanWithRetry(formInput);
      const assembled = assemblePlan(aiOutput, formInput);
      await setCachedPlan(cacheKey, assembled);
      planLruCache.set(cacheKey, assembled);
      return assembled;
    }) as GeneratedPlan;

    return NextResponse.json({ plan, cached: false } satisfies GenerateResponse);
  } catch (err) {
    if (err instanceof GenerationError) {
      logger.warn('Generation failed, using template fallback', { code: err.code });
      if (err.code === 'MISSING_KEY' || err.code === 'NETWORK') {
        const plan = generateTemplatePlan(formInput);
        return NextResponse.json({ plan, cached: false, isTemplateFallback: true } satisfies GenerateResponse);
      }
      return apiError(err.message, err.code, err.code === 'RATE_LIMITED' ? 429 : 502);
    }
    logger.error('Unexpected error in generate route', { error: String(err) });
    return apiError('Internal server error', 'UNKNOWN', 500);
  }
}

function assemblePlan(
  aiOutput: import('@/lib/validators').AiOutput,
  formInput: import('@/lib/types').EventFormInput,
): GeneratedPlan {
  return {
    budget: buildBudgetAllocations(aiOutput, formInput.totalBudget, formInput.eventType),
    timeline: buildTimeline(aiOutput, formInput.eventDate),
    vendors: buildVendors(aiOutput),
    themes: buildThemes(aiOutput, formInput.cityTier),
  };
}
