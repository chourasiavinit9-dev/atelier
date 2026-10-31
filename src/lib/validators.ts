// Zod schemas — single source of truth for all validation in Atelier
import { z } from 'zod';
import {
  BUDGET_MIN, CITY_MAX_CHARS, GUEST_COUNT_MAX, GUEST_COUNT_MIN,
  NOTES_MAX_CHARS, VIBE_MAX_CHARS, TRADITIONS_MAX_CHARS, LANGUAGE_MAX_CHARS,
  PAID_TO_MAX_CHARS, PAYMENT_NOTE_MAX_CHARS, GUEST_LIST_MAX,
  GUEST_SCHEDULE_INTRO_MAX, UNDO_STACK_MAX,
} from './constants';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sanitized = (max: number) =>
  z.string()
    .transform((s) => s.replace(/[\x00-\x1F\x7F]/g, '').trim())
    .pipe(z.string().max(max));

const sanitizedOpt = (max: number) =>
  z.string()
    .transform((s) => s.replace(/[\x00-\x1F\x7F]/g, '').trim())
    .pipe(z.string().max(max))
    .optional();

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD');
const isoFutureDate = isoDate.refine(
  (d) => new Date(d) > new Date(),
  { message: 'Event date must be in the future' },
);
const hhmm = z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM');

// ─── Enums ────────────────────────────────────────────────────────────────────
export const EventTypeSchema = z.enum(['Wedding', 'Birthday', 'Community Event']);
export const CityTierSchema = z.enum(['Metro', 'Tier-2', 'Tier-3']);
export const CurrencySchema = z.enum(['INR', 'USD', 'EUR', 'GBP']);
export const PrioritySchema = z.enum(['High', 'Medium', 'Low']);
export const TaskStatusSchema = z.enum(['Pending', 'In Progress', 'Completed']);
export const ConfidenceSchema = z.enum(['High', 'Medium', 'Low']);
export const GuestRSVPSchema = z.enum(['Invited', 'Yes', 'No', 'Maybe']);
export const PaymentMethodSchema = z.enum(['Cash', 'UPI', 'Card', 'Bank transfer', 'Cheque']);
export const VendorStatusSchema = z.enum([
  'Researching', 'Shortlisted', 'Contacted', 'Verified & Booked',
]);
export const BudgetCategorySchema = z.enum([
  'Venue and booking charges', 'Catering and refreshments', 'Decorations and flowers',
  'Photography and videography', 'Entertainment', 'Invitations and stationery',
  'Transportation and miscellaneous',
]);
export const NavScreenSchema = z.enum([
  'today', 'wizard', 'budget', 'timeline', 'vendors', 'themes', 'assistant',
  'runsheet', 'ceremonies', 'guests', 'guestschedule', 'budgetlog',
  'familysummary', 'invitations', 'cards', 'vendormap',
]);

// ─── Form Input ───────────────────────────────────────────────────────────────
export const EventFormInputSchema = z.object({
  eventType: EventTypeSchema,
  guestCount: z.number().int()
    .min(GUEST_COUNT_MIN, `Min ${GUEST_COUNT_MIN}`)
    .max(GUEST_COUNT_MAX, `Max ${GUEST_COUNT_MAX} guests`),
  city: sanitized(CITY_MAX_CHARS).pipe(z.string().min(1, 'City is required')),
  cityTier: CityTierSchema,
  totalBudget: z.number().min(BUDGET_MIN, 'Budget must be greater than 0'),
  currency: CurrencySchema,
  eventDate: isoFutureDate,
  vibeAndPreferences: sanitized(VIBE_MAX_CHARS),
  traditions: sanitizedOpt(TRADITIONS_MAX_CHARS),
  language: sanitizedOpt(LANGUAGE_MAX_CHARS),
});

// ─── Budget ───────────────────────────────────────────────────────────────────
export const BudgetLineItemSchema = z.object({
  id: z.string(),
  category: BudgetCategorySchema,
  description: z.string().min(1),
  estimatedCost: z.number().min(0),
  actualCost: z.number().min(0).nullable(),
  isCustom: z.boolean().optional(),
  isPinnedFromTheme: z.boolean().optional(),
});

export const BudgetCategoryAllocationSchema = z.object({
  category: BudgetCategorySchema,
  allocatedAmount: z.number().min(0),
  items: z.array(BudgetLineItemSchema),
  assumptions: z.array(z.string()),
  confidence: ConfidenceSchema,
});

// ─── Timeline ─────────────────────────────────────────────────────────────────
export const TimelineTaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  category: z.string().min(1),
  dueDate: isoDate,
  priority: PrioritySchema,
  status: TaskStatusSchema,
  isPinned: z.boolean().optional(),
  isPinnedFromTheme: z.boolean().optional(),
});

// ─── Vendor ───────────────────────────────────────────────────────────────────
export const VettingQuestionSchema = z.object({
  id: z.string(), question: z.string().min(1), checked: z.boolean(),
});

export const VendorCardSchema = z.object({
  id: z.string(),
  category: z.string().min(1),
  bookingLeadTime: z.string().min(1),
  vettingQuestions: z.array(VettingQuestionSchema).min(3).max(5),
  estimatedPriceRange: z.string().min(1),
  userNotes: z.string().max(NOTES_MAX_CHARS),
  status: VendorStatusSchema,
  isCustom: z.boolean().optional(),
});

// ─── Theme ────────────────────────────────────────────────────────────────────
export const ThemeColorSchema = z.object({
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid 6-digit hex'),
  label: z.string().min(1),
  contrastRatio: z.number().min(0),
});

export const EventThemeSchema = z.object({
  id: z.string(), name: z.string().min(1), description: z.string().min(1),
  colorPalette: z.array(ThemeColorSchema).min(2).max(6),
  decorMotifs: z.array(z.string()).min(1),
  menuHighlights: z.array(z.string()).min(1),
  guestEngagementIdeas: z.array(z.string()).min(1),
  budgetTier: z.string().min(1),
  estimatedDecorCost: z.number().min(0).optional(),
  isPinnedToTasks: z.boolean().optional(),
  isPinnedToBudget: z.boolean().optional(),
});

// ─── Guests ───────────────────────────────────────────────────────────────────
export const GuestSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  rsvp: GuestRSVPSchema,
});

export const GuestsStateSchema = z.object({
  list: z.array(GuestSchema).max(GUEST_LIST_MAX),
  useConfirmedHeadcount: z.boolean(),
});

// ─── Ceremony Schedule ────────────────────────────────────────────────────────
export const CeremonyItemSchema = z.object({
  id: z.string(),
  start: hhmm, end: hhmm,
  what: z.string().min(1).max(100),
  who: z.string().max(100),
  venue: z.string().max(100).optional(),
});

export const CeremonyDaySchema = z.object({
  date: isoDate,
  label: z.string().min(1).max(80),
  items: z.array(CeremonyItemSchema),
});

export const CeremonyScheduleSchema = z.object({
  days: z.array(CeremonyDaySchema),
  assumptions: z.array(z.string()),
  functions: z.array(z.string()).max(20),
});

// ─── Run Sheet ────────────────────────────────────────────────────────────────
export const RunSheetRowSchema = z.object({
  id: z.string(),
  time: hhmm,
  what: z.string().min(1).max(150),
  who: z.string().max(100),
  confirmed: z.boolean(),
});

export const RunSheetSchema = z.object({
  rows: z.array(RunSheetRowSchema),
  assumptions: z.array(z.string()),
  generatedAt: z.string().optional(),
});

// ─── Guest Schedule Card ──────────────────────────────────────────────────────
export const GuestScheduleItemSchema = z.object({
  id: z.string(),
  function: z.string().min(1).max(60),
  date: isoDate,
  startTime: hhmm,
  venue: z.string().max(100),
  dressCode: z.string().max(60).optional(),
  note: z.string().max(120).optional(),
});

export const GuestScheduleCardSchema = z.object({
  title: z.string().max(80),
  intro: z.string().max(GUEST_SCHEDULE_INTRO_MAX),
  items: z.array(GuestScheduleItemSchema),
});

// ─── Payments ─────────────────────────────────────────────────────────────────
export const PaymentSchema = z.object({
  id: z.string(),
  itemId: z.string().min(1),
  date: isoDate,
  amount: z.number().int().positive('Amount must be a positive integer'),
  paidTo: z.string().min(1).max(PAID_TO_MAX_CHARS),
  note: z.string().max(PAYMENT_NOTE_MAX_CHARS),
  method: PaymentMethodSchema.optional(),
});

// ─── Invitation ───────────────────────────────────────────────────────────────
export const InvitationStateSchema = z.object({
  templateId: z.string(),
  palette: z.string(),
  fields: z.record(z.string(), z.string().max(180)),
});

// ─── UI State ─────────────────────────────────────────────────────────────────
export const UiStateSchema = z.object({
  activeScreen: NavScreenSchema,
  taskFilter: z.union([TaskStatusSchema, z.literal('All')]),
  budgetLogFilter: z.object({
    category: z.union([BudgetCategorySchema, z.literal('All')]),
    month: z.string(),
    text: z.string(),
  }),
  familySections: z.object({
    event: z.boolean(), budget: z.boolean(), vendors: z.boolean(),
    tasks: z.boolean(), dates: z.boolean(),
  }),
  pinnedTaskThemeIds: z.array(z.string()),
  pinnedBudgetThemeIds: z.array(z.string()),
});

// ─── Full Plan ────────────────────────────────────────────────────────────────
export const GeneratedPlanSchema = z.object({
  budget: z.array(BudgetCategoryAllocationSchema).length(7),
  timeline: z.array(TimelineTaskSchema).min(1),
  vendors: z.array(VendorCardSchema).min(1),
  themes: z.array(EventThemeSchema).length(3),
  isTemplateFallback: z.boolean().optional(),
});

// ─── WorkspaceData (snapshotted for undo) ────────────────────────────────────
export const WorkspaceDataSchema = z.object({
  formInput: EventFormInputSchema,
  plan: GeneratedPlanSchema,
  guests: GuestsStateSchema,
  ceremonies: CeremonyScheduleSchema.nullable(),
  runSheet: RunSheetSchema.nullable(),
  guestSchedule: GuestScheduleCardSchema,
  payments: z.array(PaymentSchema),
  invitation: InvitationStateSchema.nullable(),
  ui: UiStateSchema,
});

// ─── Workspace (full localStorage shape) ─────────────────────────────────────
const UndoEntrySchema = z.object({
  label: z.string(),
  snapshot: WorkspaceDataSchema,
});

// CardStudio schema (existing — keep unchanged)
const cardText = (max: number) => z.string()
  .transform((v) => v.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''))
  .pipe(z.string().max(max));
const cardHex = z.string().regex(/^#[0-9A-Fa-f]{6}$/);
const CardDesignFieldsSchema = z.object({
  eventTitle: cardText(70), hostNames: cardText(48), eventDate: cardText(40),
  eventTime: cardText(32), venue: cardText(55), message: cardText(180),
  cardBrand: cardText(32), memberId: cardText(24), perk: cardText(34),
  website: cardText(42), receiptHeading: cardText(36),
  receiptItem1: cardText(30), receiptPrice1: cardText(24),
  receiptItem2: cardText(30), receiptPrice2: cardText(24),
  receiptItem3: cardText(30), receiptPrice3: cardText(24),
  receiptFooter: cardText(60), ticketLabel: cardText(24),
  seat: cardText(24), dressCode: cardText(32), entryCode: cardText(24),
});
export const CardDesignSchema = z.object({
  template: z.enum(['badge', 'receipt', 'ticket', 'floral']),
  palette: z.enum(['berry', 'dragonfruit', 'citrus', 'coastal', 'custom']),
  colors: z.object({ accent: cardHex, deep: cardHex, leaf: cardHex, paper: cardHex }),
  font: z.enum(['editorial', 'modern', 'script']),
  finish: z.enum(['linen', 'smooth', 'speckle']),
  layout: z.enum(['balanced', 'editorial', 'compact']),
  showBarcode: z.boolean(), showBotanicals: z.boolean(),
  portraitDataUrl: z.string().max(500_000).regex(/^data:image\/jpeg;base64,/).optional(),
  fields: CardDesignFieldsSchema,
});

export const WorkspaceSchema = z.object({
  version: z.number(),
  formInput: EventFormInputSchema,
  plan: GeneratedPlanSchema,
  guests: GuestsStateSchema,
  ceremonies: CeremonyScheduleSchema.nullable(),
  runSheet: RunSheetSchema.nullable(),
  guestSchedule: GuestScheduleCardSchema,
  payments: z.array(PaymentSchema),
  invitation: InvitationStateSchema.nullable(),
  ui: UiStateSchema,
  cardDesign: CardDesignSchema.optional(),
  undoStack: z.array(UndoEntrySchema).max(UNDO_STACK_MAX),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ─── API schemas ──────────────────────────────────────────────────────────────
export const GenerateRequestSchema = z.object({ formInput: EventFormInputSchema });

export const ReviseRequestSchema = z.object({
  formInput: EventFormInputSchema,
  plan: GeneratedPlanSchema,
  prompt: z.string().min(1).max(500),
  protected: z.array(z.string()).max(20).optional(),
});

export const QuoteRequestSchema = z.object({
  text: z.string().max(10_000).optional(),
  fileName: z.string().max(200).optional(),
});

export const RunSheetRequestSchema = z.object({
  formInput: EventFormInputSchema,
  tasks: z.array(TimelineTaskSchema),
  ceremonies: CeremonyScheduleSchema.optional(),
});

export const ScheduleRequestSchema = z.object({
  formInput: EventFormInputSchema,
  functions: z.array(z.string().min(1)).min(1).max(20),
});

// ─── AI Raw Output (before reconciliation) ────────────────────────────────────
export const AiRawBudgetItemSchema = z.object({
  description: z.string().min(1),
  estimatedCost: z.number().min(0),
});

export const AiRawCategorySchema = z.object({
  category: BudgetCategorySchema,
  items: z.array(AiRawBudgetItemSchema),
  assumptions: z.array(z.string()),
  confidence: ConfidenceSchema,
});

export const AiRawVendorSchema = z.object({
  category: z.string(),
  bookingLeadTime: z.string(),
  vettingQuestions: z.array(z.string()).min(3).max(5),
  estimatedPriceRange: z.string(),
});

export const AiRawThemeSchema = z.object({
  name: z.string(), description: z.string(),
  colorPalette: z.array(z.object({ hex: z.string(), label: z.string() })),
  decorMotifs: z.array(z.string()),
  menuHighlights: z.array(z.string()),
  guestEngagementIdeas: z.array(z.string()),
  estimatedDecorCost: z.number().min(0).optional(),
});

export const AiRawTaskSchema = z.object({
  title: z.string(), category: z.string(),
  dueDate: z.string(), priority: PrioritySchema,
});

export const AiOutputSchema = z.object({
  budget: z.array(AiRawCategorySchema),
  timeline: z.array(AiRawTaskSchema),
  vendors: z.array(AiRawVendorSchema),
  themes: z.array(AiRawThemeSchema),
});

export const AiReviseOutputSchema = z.object({
  changes: z.array(z.object({
    target: z.enum(['budget', 'timeline', 'vendor']),
    id: z.string(), field: z.string(),
    from: z.union([z.string(), z.number()]),
    to: z.union([z.string(), z.number()]),
    reason: z.string(),
  })),
  summary: z.string(),
});

export const AiQuoteOutputSchema = z.object({
  vendorCategory: z.string(),
  lines: z.array(z.object({ label: z.string(), amount: z.number() })),
  total: z.number(),
  currency: z.string(),
  confidence: ConfidenceSchema,
});

export const AiRunSheetOutputSchema = z.object({
  rows: z.array(z.object({ time: z.string(), what: z.string(), who: z.string() })),
  assumptions: z.array(z.string()),
});

export const AiScheduleItemSchema = z.object({
  start: z.string(), end: z.string(),
  what: z.string(), who: z.string(), venue: z.string().optional(),
});

export const AiScheduleOutputSchema = z.object({
  days: z.array(z.object({
    date: z.string(), label: z.string(),
    items: z.array(AiScheduleItemSchema),
  })),
  assumptions: z.array(z.string()),
});

export type AiOutput = z.infer<typeof AiOutputSchema>;
export type AiReviseOutput = z.infer<typeof AiReviseOutputSchema>;
export type AiQuoteOutput = z.infer<typeof AiQuoteOutputSchema>;
export type AiRunSheetOutput = z.infer<typeof AiRunSheetOutputSchema>;
export type AiScheduleOutput = z.infer<typeof AiScheduleOutputSchema>;
