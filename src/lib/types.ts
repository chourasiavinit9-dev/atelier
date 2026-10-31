// All interfaces and types for Atelier — single source of truth

// ─── Primitives ──────────────────────────────────────────────────────────────
export type EventType = 'Wedding' | 'Birthday' | 'Community Event';
export type CityTier = 'Metro' | 'Tier-2' | 'Tier-3';
export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';
export type Priority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type VendorStatus = 'Researching' | 'Shortlisted' | 'Contacted' | 'Verified & Booked';
export type Confidence = 'High' | 'Medium' | 'Low';
export type GuestRSVP = 'Invited' | 'Yes' | 'No' | 'Maybe';
export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank transfer' | 'Cheque';
export type InvitationVariant = 'save-the-date' | 'invitation' | 'thank-you';

export type BudgetCategory =
  | 'Venue and booking charges'
  | 'Catering and refreshments'
  | 'Decorations and flowers'
  | 'Photography and videography'
  | 'Entertainment'
  | 'Invitations and stationery'
  | 'Transportation and miscellaneous';

export type GenerationErrorCode =
  | 'MISSING_KEY'
  | 'RATE_LIMITED'
  | 'MALFORMED_JSON'
  | 'NETWORK'
  | 'VALIDATION_FAILED'
  | 'UNKNOWN';

// ─── Onboarding wizard form ───────────────────────────────────────────────────
export interface EventFormInput {
  eventType: EventType;
  guestCount: number;
  city: string;
  cityTier: CityTier;
  totalBudget: number;
  currency: Currency;
  eventDate: string;       // ISO date YYYY-MM-DD
  vibeAndPreferences: string;
  traditions?: string;     // optional cultural context
  language?: string;       // optional language preference
}

// ─── Budget ───────────────────────────────────────────────────────────────────
export interface BudgetLineItem {
  id: string;
  category: BudgetCategory;
  description: string;
  estimatedCost: number;
  actualCost: number | null; // null = not yet entered manually
  isCustom?: boolean;
  isPinnedFromTheme?: boolean;
}

export interface BudgetCategoryAllocation {
  category: BudgetCategory;
  allocatedAmount: number;
  items: BudgetLineItem[];
  assumptions: string[];       // "Why this number?"
  confidence: Confidence;
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
export interface TimelineTask {
  id: string;
  title: string;
  category: string;
  dueDate: string; // ISO date
  priority: Priority;
  status: TaskStatus;
  isPinned?: boolean;
  isPinnedFromTheme?: boolean;
}

// ─── Vendors ──────────────────────────────────────────────────────────────────
export interface VettingQuestion {
  id: string;
  question: string;
  checked: boolean;
}

export interface VendorCard {
  id: string;
  category: string;
  bookingLeadTime: string;
  vettingQuestions: VettingQuestion[];
  estimatedPriceRange: string;
  userNotes: string;
  status: VendorStatus;
  isCustom?: boolean;
}

// ─── Themes ───────────────────────────────────────────────────────────────────
export interface ThemeColor {
  hex: string;
  label: string;
  contrastRatio: number;
}

export interface EventTheme {
  id: string;
  name: string;
  description: string;
  colorPalette: ThemeColor[];
  decorMotifs: string[];
  menuHighlights: string[];
  guestEngagementIdeas: string[];
  budgetTier: string;
  estimatedDecorCost?: number;
  isPinnedToTasks?: boolean;
  isPinnedToBudget?: boolean;
}

// ─── Guests ───────────────────────────────────────────────────────────────────
export interface Guest {
  id: string;
  name: string;
  rsvp: GuestRSVP;
}

export interface GuestsState {
  list: Guest[];
  useConfirmedHeadcount: boolean;
}

// ─── Ceremony Schedule ────────────────────────────────────────────────────────
export interface CeremonyItem {
  id: string;
  start: string;   // HH:MM
  end: string;     // HH:MM
  what: string;
  who: string;
  venue?: string;
}

export interface CeremonyDay {
  date: string;    // ISO date
  label: string;   // e.g. "Day 1 — Haldi"
  items: CeremonyItem[];
}

export interface CeremonySchedule {
  days: CeremonyDay[];
  assumptions: string[];
  functions: string[];   // user-selected function names
}

export interface ClashWarning {
  dayDate: string;
  itemId: string;
  message: string;
}

// ─── Run Sheet ────────────────────────────────────────────────────────────────
export interface RunSheetRow {
  id: string;
  time: string;        // HH:MM
  what: string;
  who: string;
  confirmed: boolean;
}

export interface RunSheet {
  rows: RunSheetRow[];
  assumptions: string[];
  generatedAt?: string;
}

// ─── Guest Schedule Card ──────────────────────────────────────────────────────
export interface GuestScheduleItem {
  id: string;
  function: string;
  date: string;
  startTime: string;
  venue: string;
  dressCode?: string;
  note?: string;
}

export interface GuestScheduleCard {
  title: string;
  intro: string;
  items: GuestScheduleItem[];
}

// ─── Budget Log (Payments) ────────────────────────────────────────────────────
export interface Payment {
  id: string;
  itemId: string;
  date: string;          // ISO date
  amount: number;        // positive integer
  paidTo: string;
  note: string;
  method?: PaymentMethod;
}

// ─── Invitation Maker ─────────────────────────────────────────────────────────
export interface InvitationSlot {
  key: string;
  label: string;
  maxLength: number;
  required: boolean;
}

export interface InvitationTemplate {
  id: string;
  name: string;
  eventTypes: EventType[];
  palettes: string[];
  slots: InvitationSlot[];
  variant: InvitationVariant;
}

export interface InvitationState {
  templateId: string;
  palette: string;
  fields: Record<string, string>;
}

// ─── Plan Health ──────────────────────────────────────────────────────────────
export interface PlanHealthParts {
  budgetBalance: number;    // 0–25
  tasksOnTime: number;      // 0–25
  vendorsVerified: number;  // 0–25
  runSheetConfirmed: number;// 0–25
}

export interface PlanHealth {
  score: number;            // 0–100
  parts: PlanHealthParts;
}

export interface NextAction {
  taskId?: string;
  label: string;
  reason: string;
  navigateTo?: string;      // tab id
}

// ─── UI state (persisted) ─────────────────────────────────────────────────────
export type NavScreen =
  | 'today' | 'wizard' | 'budget' | 'timeline' | 'vendors'
  | 'themes' | 'assistant' | 'runsheet' | 'ceremonies'
  | 'guests' | 'guestschedule' | 'budgetlog' | 'familysummary'
  | 'invitations' | 'cards' | 'vendormap';

export interface UiState {
  activeScreen: NavScreen;
  taskFilter: TaskStatus | 'All';
  budgetLogFilter: { category: BudgetCategory | 'All'; month: string; text: string };
  familySections: Record<'event' | 'budget' | 'vendors' | 'tasks' | 'dates', boolean>;
  pinnedTaskThemeIds: string[];
  pinnedBudgetThemeIds: string[];
}

// ─── Undo stack entry ─────────────────────────────────────────────────────────
export interface UndoEntry {
  label: string;
  snapshot: WorkspaceData;
}

// ─── Core workspace data (snapshotted for undo) ───────────────────────────────
export interface WorkspaceData {
  formInput: EventFormInput;
  plan: GeneratedPlan;
  guests: GuestsState;
  ceremonies: CeremonySchedule | null;
  runSheet: RunSheet | null;
  guestSchedule: GuestScheduleCard;
  payments: Payment[];
  invitation: InvitationState | null;
  ui: UiState;
}

// ─── Full workspace (stored in localStorage) ──────────────────────────────────
export interface Workspace extends WorkspaceData {
  version: number;
  cardDesign?: CardDesign;   // CardStudio (keep existing)
  undoStack: UndoEntry[];
  createdAt: string;
  updatedAt: string;
}

// ─── Full AI-generated plan ───────────────────────────────────────────────────
export interface GeneratedPlan {
  budget: BudgetCategoryAllocation[];
  timeline: TimelineTask[];
  vendors: VendorCard[];
  themes: EventTheme[];
  isTemplateFallback?: boolean;
}

// ─── CardStudio (existing — keep unchanged) ───────────────────────────────────
export type CardTemplate = 'badge' | 'receipt' | 'ticket' | 'floral';
export type CardPalette = 'berry' | 'dragonfruit' | 'citrus' | 'coastal' | 'custom';
export type CardFont = 'editorial' | 'modern' | 'script';
export type CardFinish = 'linen' | 'smooth' | 'speckle';
export type CardLayout = 'balanced' | 'editorial' | 'compact';

export interface CardDesignColors { accent: string; deep: string; leaf: string; paper: string }
export interface CardDesignFields {
  eventTitle: string; hostNames: string; eventDate: string; eventTime: string; venue: string;
  message: string; cardBrand: string; memberId: string; perk: string; website: string;
  receiptHeading: string; receiptItem1: string; receiptPrice1: string;
  receiptItem2: string; receiptPrice2: string; receiptItem3: string; receiptPrice3: string;
  receiptFooter: string; ticketLabel: string; seat: string; dressCode: string; entryCode: string;
}
export interface CardDesign {
  template: CardTemplate; palette: CardPalette; colors: CardDesignColors;
  font: CardFont; finish: CardFinish; layout: CardLayout;
  showBarcode: boolean; showBotanicals: boolean;
  portraitDataUrl?: string; fields: CardDesignFields;
}

// ─── API request/response ─────────────────────────────────────────────────────
export interface GenerateRequest { formInput: EventFormInput }
export interface GenerateResponse { plan: GeneratedPlan; cached: boolean; isTemplateFallback?: boolean }
export interface ApiErrorResponse { error: string; code: GenerationErrorCode }
export interface GenerationErrorDetails { code: GenerationErrorCode; message: string; retryable: boolean }

// ─── What-if / Revise ─────────────────────────────────────────────────────────
export interface ReviseChange {
  target: 'budget' | 'timeline' | 'vendor';
  id: string;
  field: string;
  from: string | number;
  to: string | number;
  reason: string;
}
export interface ReviseResponse { changes: ReviseChange[]; summary: string }

// ─── Quote reader ─────────────────────────────────────────────────────────────
export interface QuoteLine { label: string; amount: number }
export interface QuoteResponse {
  vendorCategory: string;
  lines: QuoteLine[];
  total: number;
  currency: string;
  confidence: Confidence;
  mismatch?: string;
}

// ─── Run sheet API ────────────────────────────────────────────────────────────
export interface RunSheetApiResponse { rows: Omit<RunSheetRow, 'id' | 'confirmed'>[]; assumptions: string[] }

// ─── Ceremony schedule API ────────────────────────────────────────────────────
export interface CeremonyApiDay {
  date: string; label: string;
  items: Omit<CeremonyItem, 'id'>[];
}
export interface CeremonyApiResponse { days: CeremonyApiDay[]; assumptions: string[] }
