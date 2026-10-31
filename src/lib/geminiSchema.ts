// Derive Gemini JSON schemas from Zod — server-side only
import 'server-only';
import {
  AiOutputSchema, AiReviseOutputSchema, AiQuoteOutputSchema,
  AiRunSheetOutputSchema, AiScheduleOutputSchema,
} from './validators';

type JsonSchema = Record<string, unknown>;

// Recursively builds a JSON Schema object compatible with Gemini's responseSchema
function buildSchema(schema: unknown): JsonSchema {
  if (!schema || typeof schema !== 'object') return { type: 'string' };
  const s = schema as Record<string, unknown>;
  const def = s['_def'] as Record<string, unknown> | undefined;
  if (!def) return { type: 'string' };
  const typeName = def['typeName'] as string | undefined;

  if (typeName === 'ZodObject')  return buildObject(def);
  if (typeName === 'ZodArray')   return buildArray(def);
  if (typeName === 'ZodEnum')    return buildEnum(def);
  if (typeName === 'ZodUnion')   return buildUnion(def);
  if (typeName === 'ZodString')  return { type: 'string' };
  if (typeName === 'ZodNumber')  return { type: 'number' };
  if (typeName === 'ZodBoolean') return { type: 'boolean' };
  if (typeName === 'ZodNullable') return buildNullable(def);
  if (typeName === 'ZodOptional') return buildSchema(def['innerType']);
  if (typeName === 'ZodDefault')  return buildSchema(def['innerType']);
  if (typeName === 'ZodEffects')  return buildSchema(def['schema']);
  if (typeName === 'ZodLiteral')  return { type: 'string', enum: [def['value']] };
  return { type: 'string' };
}

function buildObject(def: Record<string, unknown>): JsonSchema {
  const shape = def['shape'] as (() => Record<string, unknown>) | Record<string, unknown> | undefined;
  const resolved = typeof shape === 'function' ? shape() : (shape ?? {});
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];
  for (const [key, value] of Object.entries(resolved)) {
    properties[key] = buildSchema(value);
    const vDef = (value as Record<string, unknown>)?.['_def'] as Record<string, unknown> | undefined;
    if (vDef?.['typeName'] !== 'ZodOptional') required.push(key);
  }
  return { type: 'object', properties, required };
}

function buildArray(def: Record<string, unknown>): JsonSchema {
  return { type: 'array', items: buildSchema(def['type']) };
}

function buildEnum(def: Record<string, unknown>): JsonSchema {
  return { type: 'string', enum: (def['values'] as string[] | undefined) ?? [] };
}

function buildUnion(def: Record<string, unknown>): JsonSchema {
  const opts = (def['options'] as unknown[]) ?? [];
  return { oneOf: opts.map(buildSchema) };
}

function buildNullable(def: Record<string, unknown>): JsonSchema {
  const inner = buildSchema(def['innerType']);
  return { ...inner, nullable: true };
}

// ─── Exported schemas (one per route) ────────────────────────────────────────
export const GEMINI_RESPONSE_SCHEMA: JsonSchema = buildSchema(AiOutputSchema);
export const GEMINI_REVISE_SCHEMA: JsonSchema   = buildSchema(AiReviseOutputSchema);
export const GEMINI_QUOTE_SCHEMA: JsonSchema    = buildSchema(AiQuoteOutputSchema);
export const GEMINI_RUNSHEET_SCHEMA: JsonSchema = buildSchema(AiRunSheetOutputSchema);
export const GEMINI_SCHEDULE_SCHEMA: JsonSchema = buildSchema(AiScheduleOutputSchema);
