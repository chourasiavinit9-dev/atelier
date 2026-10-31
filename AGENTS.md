# AGENTS.md — Atelier Coding Conventions for AI Agents

## Tech Stack Summary
- **Framework**: Next.js 15 (App Router) + TypeScript strict + Tailwind CSS
- **AI**: `@google/genai`, model `gemini-2.5-flash`, structured JSON output
- **Validation**: Zod everywhere — it is the single source of truth
- **Icons**: `lucide-react` only — no images or media files
- **Package manager**: npm

## File Locations — Before Adding Code
| What to add | Where |
|:---|:---|
| New type/interface | `src/lib/types.ts` |
| New constant or limit | `src/lib/constants.ts` |
| New validation schema | `src/lib/validators.ts` |
| New business logic | `src/lib/*.ts` |
| New UI component | `src/components/*.tsx` |
| New page | `src/app/*.tsx` |
| New test | `tests/*.test.ts` |

## Hard Rules — Never Break
1. **Zero `any`** — use Zod guards, `typeof`, `instanceof`
2. **Zero non-null assertions (`!`)** — guard explicitly
3. **Functions ≤ 25 lines** — split if longer
4. **`import 'server-only'`** in ALL: `route.ts`, `secrets.ts`, `logger.ts`, `cache.ts`, `rateLimiter.ts`, `geminiService.ts`, `apiHelpers.ts`, `geminiSchema.ts`
5. **Never log API keys** — `logger.ts` auto-redacts fields containing "key", "secret", "token"
6. **Never call Gemini more than once per user request** — the single call returns the full plan
7. **Never mutate constants** — `BUDGET_PERCENTAGES` etc are read-only

## When to Use Each Lib File
- `budgetLogic.ts` — allocation math and variance computation only
- `timelineLogic.ts` — date math, sorting, overdue, completion %
- `vendorThemeLogic.ts` — assembling vendor cards and themes from AI output
- `geminiService.ts` — Gemini call with retry; never import in client code
- `cache.ts` — Firestore read/write; gracefully degrades if not configured
- `hash.ts` — FNV-1a; safe to use in both client and server

## Accessibility Checklist for New UI
- [ ] Every `<input>` has a `<label htmlFor>` matching its `id`
- [ ] Error messages use `aria-describedby` pointing to the error element
- [ ] Error elements have `role="alert"`
- [ ] Dynamic content regions have `aria-live="polite"`
- [ ] Loading states have `role="status"`
- [ ] Interactive elements have minimum 44×44px touch target
- [ ] No `outline: none` without a focus-visible replacement
- [ ] Color is never the sole indicator of status — pair with icon/text

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
