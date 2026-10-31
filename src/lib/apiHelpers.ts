// Shared API error helper — never leaks internals
import 'server-only';
import type { GenerationErrorCode } from './types';
import { NextResponse } from 'next/server';

export function apiError(
  message: string,
  code: GenerationErrorCode,
  status: number
): NextResponse {
  return NextResponse.json({ error: message, code }, { status });
}
