# Atelier — Requirements

> **Problem statement:** "Create a GenAI-powered planning assistant that helps users organize weddings, birthdays, and community events with budgets, timelines, vendor checklists, and personalized ideas."

---

## Feature Checklist

Legend: ✅ Done & tested | 🔲 Planned | ❌ Deferred

### Domain Logic (pure, unit-tested)

| # | Feature | Module | Status |
|:---|:---|:---|:---:|
| 1 | Largest-remainder budget allocation — sums exactly to total | `budgetLogic.ts` | ✅ |
| 2 | 7 categories with base percentages per event type | `constants.ts` | ✅ |
| 3 | City-tier multipliers | `constants.ts` | 🔲 |
| 4 | Variance (Under/On/Over) per category | `budgetLogic.ts` | ✅ |
| 5 | Category and overall totals | `budgetLogic.ts` | ✅ |
| 6 | Projected total (actual where entered, else estimate) | `budgetLogic.ts` | 🔲 |
| 7 | Free amount and over-budget detection | `budgetLogic.ts` | 🔲 |
| 8 | `assumptions[]` and `confidence` per category | `types.ts` | 🔲 |
| 9 | Backward-planned timeline (6 mo, 3 mo, 1 mo, 1 wk, day before, event day) | `timelineLogic.ts` | ✅ |
| 10 | Chronological sort and status filter | `timelineLogic.ts` | ✅ |
| 11 | Completion percentage (0 tasks = 0) | `timelineLogic.ts` | ✅ |
| 12 | Overdue detection with injectable "today" | `timelineLogic.ts` | ✅ |
| 13 | Vendor categories tailored to event type | `vendors.ts` | 🔲 |
| 14 | 3–5 vetting questions per vendor | `vendors.ts` | 🔲 |
| 15 | Vendor status machine (Researching → Verified & Booked) | `types.ts` | ✅ |
| 16 | 3 distinct themes: hex palette, decor, menu, guest ideas | `themes.ts` | 🔲 |
| 17 | Hex validation and WCAG contrast from luminance | `vendorThemeLogic.ts` | ✅ |
| 18 | Pin to Timeline (idempotent, unpin removes only that task) | `themes.ts` | 🔲 |
| 19 | Pin to Budget (idempotent, unpin removes only that item) | `themes.ts` | 🔲 |
| 20 | Plan health score 0–100 (4 named parts, deterministic) | `health.ts` | 🔲 |
| 21 | `nextActions(plan, today)` — top 3 tasks + suggested action | `health.ts` | 🔲 |
| 22 | Guest add by paste or CSV (max 5000, de-duplicated, trimmed) | `guests.ts` | 🔲 |
| 23 | RSVP status per guest (Invited / Yes / No / Maybe) | `guests.ts` | 🔲 |
| 24 | "Use confirmed headcount" recalculates catering with Undo | `guests.ts` | 🔲 |
| 25 | Multi-day ceremony schedule generation | `ceremonies.ts` | 🔲 |
| 26 | Clash warnings (overlap, out-of-window) as data | `ceremonies.ts` | 🔲 |
| 27 | `moveItem` preserves durations and reflows times | `ceremonies.ts` | 🔲 |
| 28 | Run-sheet rows (time, what, who, confirmed) | `runsheet.ts` | 🔲 |
| 29 | `.ics` export (one event per task/run-sheet row, stable UIDs) | `ics.ts` | 🔲 |
| 30 | Payment log: add/edit/delete, sum = `actualCost` | `payments.ts` | 🔲 |
| 31 | Payment CSV export (client-side, escaped fields) | `payments.ts` | 🔲 |
| 32 | Guest schedule card: add/remove/reorder items | `guestSchedule.ts` | 🔲 |
| 33 | "Copy from ceremony schedule" — user-confirmed only | `guestSchedule.ts` | 🔲 |
| 34 | Family summary built from selectors only | `familySummary.ts` | 🔲 |
| 35 | 6 invitation templates (HTML/SVG, text slots, no raster art) | `constants.ts` | 🔲 |
| 36 | Invitation field validation (required, trimmed, length-capped) | `validators.ts` | 🔲 |
| 37 | Invitation PNG + PDF download (client-side only) | `invitations.ts` | 🔲 |

### Backend (API routes, server-only)

| # | Feature | Route | Status |
|:---|:---|:---|:---:|
| 38 | `POST /api/generate` — whole plan in one Gemini call | ✅ | ✅ |
| 39 | Zod input + output validation on every route | All routes | ✅ |
| 40 | Per-IP rate limiting (burst + sliding window) | `rateLimiter.ts` | ✅ |
| 41 | Firestore cache keyed by SHA-256, skipped if unconfigured | `cache.ts` | ✅ |
| 42 | Exponential backoff with jitter (max 3 attempts) | `geminiService.ts` | ✅ |
| 43 | Malformed-JSON repair hint retry | `geminiService.ts` | ✅ |
| 44 | Template fallback on missing key / outage | `templateFallback.ts` | ✅ |
| 45 | Prompt-injection defense (length cap, strip controls, delimit) | All routes | ✅ |
| 46 | Structured Cloud Logging wrapper | `logger.ts` | ✅ |
| 47 | Secret Manager with `.env` fallback | `secrets.ts` | ✅ |
| 48 | `POST /api/revise` — What-if plan editor | 🔲 | 🔲 |
| 49 | What-if: total reconciliation check, protected items | 🔲 | 🔲 |
| 50 | `POST /api/quote` — quote reader (image/PDF, 5 MB max) | 🔲 | 🔲 |
| 51 | Quote: line-sum vs total mismatch detection | 🔲 | 🔲 |
| 52 | `POST /api/runsheet` — event-day run sheet | 🔲 | 🔲 |
| 53 | `POST /api/schedule` — multi-day ceremony schedule | 🔲 | 🔲 |

### Frontend (screens, store, UI wiring)

| # | Screen / Control | `data-testid` | Store action | Status |
|:---|:---|:---|:---|:---:|
| 54 | Single plan store (context + reducer, or Zustand) | — | all | 🔲 |
| 55 | Typed `dispatch` for every mutation | — | all | 🔲 |
| 56 | Selectors: totals, variance, projected, free, progress, health | — | all | 🔲 |
| 57 | API client (`apiClient.ts`) — all fetch calls, typed errors | — | all | 🔲 |
| 58 | Autosave debounced to localStorage (versioned, Zod-validated) | — | all | ✅ partial |
| 59 | "Saved on this device" status indicator | `shell-save-status` | ui | 🔲 |
| 60 | Import plan: preview diff + confirm | `shell-import` | IMPORT_PLAN | 🔲 |
| 61 | Export plan JSON | `shell-export` | — (download) | ✅ |
| 62 | Reset workspace: accessible dialog | `shell-reset` | RESET | 🔲 |
| 63 | Edit event details: prefilled wizard + preview | `shell-edit-event` | — | 🔲 |
| 64 | Sidebar navigation with `aria-current` | `nav-{screen}` | SET_SCREEN | 🔲 |
| 65 | **Today screen** | — | selectors | 🔲 |
| 66 | Countdown days | `today-countdown` | selector | 🔲 |
| 67 | Next 3 tasks with complete-in-place checkbox | `today-task-{id}` | TOGGLE_TASK | 🔲 |
| 68 | Suggested action with navigate link | `today-suggested-action` | selector | 🔲 |
| 69 | Plan health score + 4 part bars | `today-health-score` | selector | 🔲 |
| 70 | **New event wizard** | — | — | ✅ partial |
| 71 | Traditions field | `wizard-traditions` | formInput | 🔲 |
| 72 | Language field | `wizard-language` | formInput | 🔲 |
| 73 | Blur validation | `wizard-*` | — | 🔲 |
| 74 | Template fallback button on error | `wizard-use-template` | LOAD_TEMPLATE | 🔲 |
| 75 | **Budget screen** | — | — | ✅ partial |
| 76 | Summary: planned, projected, free, over-budget | `budget-summary-*` | selectors | 🔲 |
| 77 | Overall gauge/bar | `budget-gauge` | selector | 🔲 |
| 78 | Assumptions + confidence "Why?" per category | `budget-assumptions-{cat}` | store | 🔲 |
| 79 | Over-budget alert list | `budget-overbudget-list` | selector | 🔲 |
| 80 | "Use confirmed headcount" | `budget-use-headcount` | USE_HEADCOUNT | 🔲 |
| 81 | actualCost read-only when payments exist | `budget-item-actual-{id}` | selector | 🔲 |
| 82 | **Timeline screen** | — | — | ✅ partial |
| 83 | Edit task title and date | `timeline-task-edit-{id}` | UPDATE_TASK | 🔲 |
| 84 | Add custom task | `timeline-add-task` | ADD_TASK | 🔲 |
| 85 | Delete task | `timeline-task-delete-{id}` | DELETE_TASK | 🔲 |
| 86 | Filter counts per status | `timeline-filter-count-{s}` | selector | 🔲 |
| 87 | Filter survives screen navigation | — | ui.taskFilter | 🔲 |
| 88 | **Vendors screen** | — | — | ✅ partial |
| 89 | Add custom vendor category | `vendor-add-custom` | ADD_VENDOR | 🔲 |
| 90 | Remove vendor category | `vendor-remove-{id}` | DELETE_VENDOR | 🔲 |
| 91 | **Ideas / Themes screen** | — | — | ✅ partial |
| 92 | Unpin from Tasks | `themes-unpin-tasks-{id}` | UNPIN_TASK | 🔲 |
| 93 | Unpin from Budget | `themes-unpin-budget-{id}` | UNPIN_BUDGET | 🔲 |
| 94 | Pinned state persisted in store | — | ui.pinnedTaskThemeIds | 🔲 |
| 95 | Regenerate ideas (confirmation, unpinned only) | `themes-regenerate` | /api/revise | 🔲 |
| 96 | **Assistant — What-if editor** | — | — | 🔲 |
| 97 | Prompt textarea + example chips | `assistant-prompt` | — | 🔲 |
| 98 | Preview changes list (from/to/reason) | `assistant-preview` | /api/revise | 🔲 |
| 99 | Apply (transaction) | `assistant-apply` | APPLY_REVISE | 🔲 |
| 100 | Discard + Undo | `assistant-discard` `assistant-undo` | UNDO | 🔲 |
| 101 | **Assistant — Quote reader** | — | — | 🔲 |
| 102 | File input (image/PDF ≤ 5 MB) + paste text | `quote-file` `quote-text` | — | 🔲 |
| 103 | Read quote + result list + mismatch | `quote-read` | /api/quote | 🔲 |
| 104 | Add to budget (confirmation, transaction, Undo) | `quote-add-to-budget` | ADD_QUOTE | 🔲 |
| 105 | **Run Sheet screen** | — | — | 🔲 |
| 106 | Editable rows (time, what, who, confirmed) | `runsheet-row-{id}` | UPDATE_RUNSHEET_ROW | 🔲 |
| 107 | Generate / Regenerate (confirmation) | `runsheet-generate` | /api/runsheet | 🔲 |
| 108 | Print (print stylesheet) | `runsheet-print` | — | 🔲 |
| 109 | Add to calendar (.ics download) | `runsheet-ics` | ics.ts | 🔲 |
| 110 | **Ceremony Schedule screen** | — | — | 🔲 |
| 111 | Function chips selector | `ceremonies-function-{name}` | SET_FUNCTIONS | 🔲 |
| 112 | Generate (one Gemini call) | `ceremonies-generate` | /api/schedule | 🔲 |
| 113 | Drag-reorder + keyboard move up/down | `ceremonies-item-up/down-{id}` | MOVE_CEREMONY_ITEM | 🔲 |
| 114 | Clash warnings inline | `ceremonies-clash-{id}` | selector | 🔲 |
| 115 | **Guests screen** | — | — | 🔲 |
| 116 | Paste names or CSV import | `guests-import` | IMPORT_GUESTS | 🔲 |
| 117 | RSVP status select per guest | `guests-rsvp-{id}` | SET_RSVP | 🔲 |
| 118 | Counts per RSVP status | `guests-count-{rsvp}` | selector | 🔲 |
| 119 | Remove guest | `guests-remove-{id}` | DELETE_GUEST | 🔲 |
| 120 | **Guest Schedule Card** | — | — | 🔲 |
| 121 | Add/remove/move-up/move-down rows | `guestschedule-*` | GUESTSCHEDULE_* | 🔲 |
| 122 | Copy from ceremony (user-confirmed) | `guestschedule-copy` | COPY_CEREMONY | 🔲 |
| 123 | Download PNG + PDF + Print | `guestschedule-download-*` | — | 🔲 |
| 124 | **Budget Log screen** | — | — | 🔲 |
| 125 | Add/edit/delete payment with inline validation | `budgetlog-add` | ADD_PAYMENT | 🔲 |
| 126 | Filters: category, month, text | `budgetlog-filter-*` | ui.budgetLogFilter | 🔲 |
| 127 | Per-category + overall paid totals | `budgetlog-total-*` | selector | 🔲 |
| 128 | Export log as CSV | `budgetlog-export-csv` | payments.ts | 🔲 |
| 129 | **Family Summary** | — | — | 🔲 |
| 130 | Section toggles (event, budget, vendors, tasks, dates) | `familysummary-toggle-*` | ui.familySections | 🔲 |
| 131 | Live preview from selectors only | `familysummary-preview` | selectors | 🔲 |
| 132 | Print / Save as PDF | `familysummary-print` | — | 🔲 |
| 133 | **Invitation Maker** | — | — | 🔲 |
| 134 | Template picker (6 templates) | `invitations-template-{id}` | SET_TEMPLATE | 🔲 |
| 135 | Per-field inputs with live preview | `invitations-field-{key}` | SET_INV_FIELD | 🔲 |
| 136 | Palette choice from template's fixed options | `invitations-palette-{p}` | SET_INV_PALETTE | 🔲 |
| 137 | Download PNG + PDF (client-side, no upload) | `invitations-download-*` | — | 🔲 |
| 138 | **Card Studio** (existing — keep unchanged) | — | — | ✅ |

### Accessibility (target 96+)

| # | Item | Status |
|:---|:---|:---:|
| 139 | Skip-to-content link | ✅ |
| 140 | `<html lang="en">` | ✅ |
| 141 | Semantic landmarks (`<main>`, `<nav>`, `<header>`, `<footer>`) | ✅ |
| 142 | `aria-current` on active nav item | 🔲 |
| 143 | `aria-pressed` on toggle buttons | ✅ |
| 144 | `aria-live="polite"` on dynamic regions | ✅ |
| 145 | `role="alert"` on error messages | ✅ |
| 146 | `role="status"` on loading regions | ✅ |
| 147 | `role="progressbar"` + `aria-valuenow` | ✅ |
| 148 | `aria-describedby` linking inputs to errors | ✅ |
| 149 | `aria-invalid` on invalid inputs | ✅ |
| 150 | Focus rings on all interactive elements | ✅ |
| 151 | 44 px minimum touch targets | ✅ |
| 152 | Accessible confirmation dialog (replaces `confirm()`) | 🔲 |
| 153 | Inline import error (replaces `alert()`) | 🔲 |
| 154 | Keyboard-operable move up/down for reorderable lists | 🔲 |
| 155 | Zero axe-core WCAG 2.2 AA violations on every screen | 🔲 |

### Testing (target 95+)

| # | Suite | Status |
|:---|:---|:---:|
| 156 | Budget: sum = total (10+ random); largest remainder; variance; add/delete | ✅ |
| 157 | Timeline: completion %; sort; backward plan; overdue | ✅ |
| 158 | Validators: 10+ cases (negative, zero guests, past date, oversized, control chars, hex) | ✅ |
| 159 | Cache: hit skips Gemini; Firestore unavailable doesn't break | ✅ |
| 160 | Rate limiter: burst and sliding window | ✅ |
| 161 | Contrast / luminance math | ✅ |
| 162 | Template fallback: all 3 event types | ✅ |
| 163 | Budget: projected total; free amount; headcount recalc; payment sum = actual | 🔲 |
| 164 | Guests: CSV validation, deduplication, headcount with Undo | 🔲 |
| 165 | Ceremonies: overlaps; out-of-window; `moveItem` | 🔲 |
| 166 | Run sheet: malformed rows rejected; `.ics` per task | 🔲 |
| 167 | Themes: idempotent pin/unpin; luminance text color | 🔲 |
| 168 | Health & Today: score parts; top 3 tasks; suggested action | 🔲 |
| 169 | Payments: sum = actual; no payments → manual actual; add/edit/delete recompute; CSV escape | 🔲 |
| 170 | Guest schedule: field caps; add/remove/move order; copy-ceremony confirmation | 🔲 |
| 171 | Family summary: live store; section toggles; no invented contacts | 🔲 |
| 172 | Invitations: field validation; every template renders all slots; PNG+PDF non-empty; no network | 🔲 |
| 173 | Routes: success, validation error, AI error, rate-limited; `/api/generate` cache hit | 🔲 |
| 174 | What-if: rejects total-breaking change; protected items untouched; Undo restores | 🔲 |
| 175 | Quote reader: line sum ≠ total flagged; wrong file type / oversize rejected | 🔲 |
| 176 | Storage: corrupted `localStorage` fallback; import rejects invalid JSON; round-trip | 🔲 |
| 177 | Playwright click-through (every control once) + axe on every screen | 🔲 |
| 178 | `audit-controls.mjs` fails build if interactive element has no `data-testid` | 🔲 |

### Security (target 98+)

| # | Item | Status |
|:---|:---|:---:|
| 179 | `server-only` in every route and server lib | ✅ |
| 180 | Gemini key from env / Secret Manager only | ✅ |
| 181 | Prompt-injection defense (all 5 routes) | ✅ |
| 182 | Per-IP rate limiting | ✅ |
| 183 | Security headers + CSP in `next.config.ts` | ✅ |
| 184 | `firestore.rules` denying all client R/W | ✅ |
| 185 | No stack traces in responses | ✅ |
| 186 | `.env.local` git-ignored | ✅ |
| 187 | `score-check.mjs` (no hardcoded secrets, server-only presence) | ✅ |

### CI/CD & Ops

| # | Item | Status |
|:---|:---|:---:|
| 188 | GitHub Actions: lint → typecheck → audit-controls → Vitest → build → Playwright+axe → size gate | 🔲 |
| 189 | Vercel / Firebase Hosting deploy on `main` | 🔲 |
| 190 | `Dockerfile` + `.dockerignore` (Cloud Run ready) | ✅ |
| 191 | Repo size < 10 MB (no images/fonts/media in git) | ✅ |

### Documentation

| # | Item | Status |
|:---|:---|:---:|
| 192 | `README.md`: problem statement, Mermaid diagram, eval table, Google services, setup | ✅ |
| 193 | `REQUIREMENTS.md`: this file | ✅ |
| 194 | `CODE_QUALITY.md`: conventions and enforcement | ✅ |
| 195 | `AGENTS.md`: agent-readable conventions | ✅ |

---

## Wiring Matrix (screen × control × testid × action × selector × test)

> Filled in against the actual UI. Each row will be ticked ✅ only when its Playwright assertion passes.

| Screen | Control | `data-testid` | Store action | Selector updated | Test |
|:---|:---|:---|:---|:---|:---|
| App shell | Sidebar nav | `nav-{screen}` | `SET_SCREEN` | `ui.activeScreen` | PW: navigate to every screen |
| App shell | Save status | `shell-save-status` | (derived) | `ui.saveStatus` | PW: edit triggers "Saving"→"Saved" |
| App shell | Export | `shell-export` | — | — | PW: download JSON |
| App shell | Import | `shell-import` | `IMPORT_PLAN` | all | PW: import + preview |
| App shell | Reset | `shell-reset` | `RESET` | all | PW: dialog, confirm, store clears |
| App shell | Edit event | `shell-edit-event` | — | — | PW: wizard opens prefilled |
| Wizard | Event type | `wizard-type-{t}` | form state | — | PW: select each |
| Wizard | Traditions | `wizard-traditions` | `formInput.traditions` | — | Vitest: validator |
| Wizard | Language | `wizard-language` | `formInput.language` | — | Vitest: validator |
| Wizard | Submit | `wizard-submit` | `LOAD_PLAN` | all | PW: happy path |
| Wizard | Use template | `wizard-use-template` | `LOAD_TEMPLATE` | plan | PW: error path |
| Today | Countdown | `today-countdown` | — | `selector.countdown` | Vitest: daysUntil |
| Today | Task complete | `today-task-{id}` | `TOGGLE_TASK` | timeline, health | PW: check → Completed |
| Today | Health score | `today-health-score` | — | `selector.health` | Vitest: 4 parts |
| Budget | Category section | `budget-category-{i}` | — | allocations | — |
| Budget | Item estimated | `budget-item-est-{id}` | `UPDATE_ITEM` | totals, projected | PW: edit cost, gauge updates |
| Budget | Item actual | `budget-item-actual-{id}` | `UPDATE_ITEM` | variance, projected | PW: edit actual, variance changes |
| Budget | Remove item | `budget-item-remove-{id}` | `DELETE_ITEM` | totals | PW: remove, total decreases |
| Budget | Add item | `budget-add-item-{cat}` | `ADD_ITEM` | totals | PW: add, total includes it |
| Budget | Assumptions | `budget-assumptions-{cat}` | — | — | — |
| Budget | Over-budget list | `budget-overbudget-list` | — | selector | PW: enter over-budget actual |
| Budget | Use headcount | `budget-use-headcount` | `USE_HEADCOUNT` | catering | PW: guests RSVP Yes = N → catering updates → Undo |
| Timeline | Filter | `timeline-filter-{s}` | `SET_TASK_FILTER` | ui.taskFilter | PW: filter survives nav |
| Timeline | Toggle | `timeline-task-toggle-{id}` | `TOGGLE_TASK` | progress, health | PW: check → progress% increases |
| Timeline | Status | `timeline-task-status-{id}` | `UPDATE_TASK` | progress | — |
| Timeline | Edit | `timeline-task-edit-{id}` | `UPDATE_TASK` | timeline | PW: rename, save |
| Timeline | Add task | `timeline-add-task` | `ADD_TASK` | progress | PW: add, appears in list |
| Timeline | Delete | `timeline-task-delete-{id}` | `DELETE_TASK` | progress | — |
| Vendors | Status | `vendor-status-{id}` | `UPDATE_VENDOR` | health | PW: set Verified → health increases |
| Vendors | Question | `vendor-question-{vid}-{qid}` | `UPDATE_VENDOR` | — | PW: check persists |
| Vendors | Notes | `vendor-notes-{id}` | `UPDATE_VENDOR` | — | PW: edit, persists after nav |
| Vendors | Add custom | `vendor-add-custom` | `ADD_VENDOR` | vendors | — |
| Vendors | Remove | `vendor-remove-{id}` | `DELETE_VENDOR` | vendors | — |
| Themes | Pin tasks | `themes-pin-tasks-{id}` | `PIN_THEME_TASK` | timeline | PW: pin → task in timeline |
| Themes | Pin budget | `themes-pin-budget-{id}` | `PIN_THEME_BUDGET` | budget | PW: pin → item in budget |
| Themes | Unpin tasks | `themes-unpin-tasks-{id}` | `UNPIN_THEME_TASK` | timeline | Vitest: idempotent |
| Themes | Unpin budget | `themes-unpin-budget-{id}` | `UNPIN_THEME_BUDGET` | budget | Vitest: idempotent |
| Themes | Regenerate | `themes-regenerate` | `/api/revise` | themes | PW: confirmation dialog, unpinned only |
| Assistant | Prompt | `assistant-prompt` | — | — | — |
| Assistant | Preview | `assistant-preview` | `/api/revise` | — | PW: preview appears |
| Assistant | Apply | `assistant-apply` | `APPLY_REVISE` | budget/timeline | PW: apply → store changes |
| Assistant | Undo | `assistant-undo` | `UNDO` | all | PW: apply → undo → restored |
| Assistant | Quote file | `quote-file` | — | — | PW: upload image |
| Assistant | Quote text | `quote-text` | — | — | — |
| Assistant | Read quote | `quote-read` | `/api/quote` | — | PW: result list appears |
| Assistant | Add to budget | `quote-add-to-budget` | `ADD_QUOTE` | budget | PW: add → item in budget |
| Runsheet | Row time | `runsheet-row-time-{id}` | `UPDATE_RUNSHEET_ROW` | runSheet | — |
| Runsheet | Confirmed | `runsheet-row-confirmed-{id}` | `UPDATE_RUNSHEET_ROW` | health | PW: confirmed count |
| Runsheet | Generate | `runsheet-generate` | `/api/runsheet` | runSheet | PW: rows appear |
| Runsheet | Print | `runsheet-print` | — | — | — |
| Runsheet | ICS | `runsheet-ics` | `ics.ts` | — | Vitest: valid .ics |
| Ceremonies | Function chip | `ceremonies-function-{name}` | `TOGGLE_FUNCTION` | ceremonies | — |
| Ceremonies | Generate | `ceremonies-generate` | `/api/schedule` | ceremonies | PW: days appear |
| Ceremonies | Move up | `ceremonies-item-up-{id}` | `MOVE_CEREMONY_ITEM` | ceremonies | Vitest: duration preserved |
| Ceremonies | Move down | `ceremonies-item-down-{id}` | `MOVE_CEREMONY_ITEM` | ceremonies | — |
| Ceremonies | Clash | `ceremonies-clash-{id}` | selector | — | Vitest: overlap detected |
| Guests | Import | `guests-import` | `IMPORT_GUESTS` | guests | PW: CSV → list |
| Guests | RSVP | `guests-rsvp-{id}` | `SET_RSVP` | counts | PW: set Yes → count updates |
| Guests | Remove | `guests-remove-{id}` | `DELETE_GUEST` | guests | — |
| Guest Sched | Add row | `guestschedule-add` | `GUESTSCHEDULE_ADD` | guestSchedule | — |
| Guest Sched | Move up | `guestschedule-up-{id}` | `GUESTSCHEDULE_MOVE` | guestSchedule | — |
| Guest Sched | Copy ceremony | `guestschedule-copy` | `COPY_CEREMONY` | guestSchedule | PW: dialog, confirm |
| Guest Sched | Download PNG | `guestschedule-download-png` | — | — | Vitest: non-empty file |
| Budget Log | Add payment | `budgetlog-add` | `ADD_PAYMENT` | payments, budget actual | PW: add → item actual updates |
| Budget Log | Edit payment | `budgetlog-edit-{id}` | `UPDATE_PAYMENT` | payments | — |
| Budget Log | Delete payment | `budgetlog-delete-{id}` | `DELETE_PAYMENT` | payments | PW: confirm dialog |
| Budget Log | Filter category | `budgetlog-filter-cat` | `SET_BUDGETLOG_FILTER` | ui | — |
| Budget Log | Export CSV | `budgetlog-export-csv` | `payments.ts` | — | Vitest: escaped CSV |
| Family | Toggle section | `familysummary-toggle-{s}` | `SET_FAMILY_SECTION` | ui.familySections | PW: toggle hides section |
| Family | Print | `familysummary-print` | — | — | — |
| Invitations | Template | `invitations-template-{id}` | `SET_TEMPLATE` | invitation | PW: slots change |
| Invitations | Field input | `invitations-field-{key}` | `SET_INV_FIELD` | invitation | PW: live preview updates |
| Invitations | Palette | `invitations-palette-{p}` | `SET_INV_PALETTE` | invitation | — |
| Invitations | Download PNG | `invitations-download-png` | — | — | Vitest: non-empty, no network |
