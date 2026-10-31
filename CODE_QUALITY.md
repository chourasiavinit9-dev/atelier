# CODE_QUALITY.md — Atelier Coding Standards

## TypeScript Configuration
- `"strict": true` — enables all strict checks
- `"noImplicitAny": true` — no implicit any types
- `"noUnusedLocals": true` — no dead variables
- `"noUnusedParameters": true` — no dead function parameters
- `"noEmit": true` — type-check only, Next.js compiles
- **Zero `any`** — use type narrowing (`typeof`, `instanceof`, Zod guards)
- **Zero non-null assertions (`!`)** — always use optional chaining or explicit guards

## Function Length
- Every function is **25 lines or fewer**
- Anything longer is split into focused sub-functions
- Pure logic functions are in `src/lib/`; UI only orchestrates

## File Organization
```
src/
├── app/           — Next.js App Router pages and routes (orchestration only)
├── components/    — Pure, accessible, reusable UI components
├── hooks/         — Custom React hooks
└── lib/           — Independent, unit-testable business logic
    ├── types.ts           — All interfaces (single source of truth)
    ├── constants.ts       — All magic values and config
    ├── validators.ts      — All Zod schemas
    ├── geminiSchema.ts    — Gemini response schema derived from Zod
    ├── secrets.ts         — API key management (server-only)
    ├── logger.ts          — Structured JSON logger (server-only)
    ├── hash.ts            — FNV-1a hashing
    ├── cache.ts           — Firestore cache layer (server-only)
    ├── rateLimiter.ts     — Per-IP rate limiting (server-only)
    ├── geminiService.ts   — Gemini API with backoff (server-only)
    ├── budgetLogic.ts     — Deterministic budget allocation
    ├── timelineLogic.ts   — Task scheduling logic
    ├── vendorThemeLogic.ts — Vendor and theme assembly
    ├── templateFallback.ts — Offline fallback plan generator
    └── apiHelpers.ts      — Shared API error helper (server-only)
```

## Naming Conventions
| Element | Convention | Example |
|:---|:---|:---|
| Functions | camelCase | `allocateBudget` |
| Components | PascalCase | `BudgetPlanner` |
| Constants | UPPER_SNAKE | `GEMINI_MODEL` |
| Types / Interfaces | PascalCase | `EventFormInput` |
| Files | camelCase | `budgetLogic.ts` |

## ESLint
- Config: `eslint-config-next` (included in Next.js scaffold)
- Gate: `npm run lint -- --max-warnings 0` must exit 0
- No `@ts-ignore` or `@ts-expect-error`

## Error Handling Pattern
```typescript
// Use typed errors, not raw Error
export class GenerationError extends Error {
  constructor(public readonly code: GenerationErrorCode, message: string) { ... }
}

// In route handlers: always use the shared helper
return apiError('User-safe message', 'ERROR_CODE', httpStatus);

// Never: res.json({ error: err.stack }) — stack traces must never leak
```

## Security Rules
1. `import 'server-only'` at top of every `route.ts` and server lib
2. API keys read only from `process.env`, never from request headers or body
3. User input: always length-cap → strip control chars → Zod validate → delimit before prompts
4. AI output: always `safeParse` with Zod; on failure retry once, then template fallback
5. Error responses: use `apiError()` helper only — never `JSON.stringify(err)`

## Commit Conventions
```
feat: add theme pin to budget functionality
fix: correct largest-remainder rounding for odd totals
test: add validator boundary value cases
docs: update REQUIREMENTS.md checklist
```
